# ════════════════════════════════════════════════════════════════
# INÖ PLATFORM — ECS Fargate (Compute)
# ════════════════════════════════════════════════════════════════

# ── Cluster ──────────────────────────────────────────────────

resource "aws_ecs_cluster" "main" {
  name = "ino-${var.environment}"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_ecs_cluster_capacity_providers" "main" {
  cluster_name       = aws_ecs_cluster.main.name
  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
  }
}

# ── IAM ──────────────────────────────────────────────────────

resource "aws_iam_role" "ecs_execution" {
  name = "ino-${var.environment}-ecs-execution"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_execution" {
  role       = aws_iam_role.ecs_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "ecs_execution_secrets" {
  name = "secrets-access"
  role = aws_iam_role.ecs_execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["secretsmanager:GetSecretValue"]
      Resource = "arn:aws:secretsmanager:${var.aws_region}:*:secret:ino/${var.environment}/*"
    }]
  })
}

resource "aws_iam_role" "ecs_task" {
  name = "ino-${var.environment}-ecs-task"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "ecs_task_s3" {
  name = "s3-media-access"
  role = aws_iam_role.ecs_task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject", "s3:ListBucket"]
      Resource = [
        aws_s3_bucket.media.arn,
        "${aws_s3_bucket.media.arn}/*"
      ]
    }]
  })
}

# ── CloudWatch Log Groups ────────────────────────────────────

resource "aws_cloudwatch_log_group" "api" {
  name              = "/ecs/ino-${var.environment}/api"
  retention_in_days = 30
}

resource "aws_cloudwatch_log_group" "worker" {
  name              = "/ecs/ino-${var.environment}/worker"
  retention_in_days = 14
}

resource "aws_cloudwatch_log_group" "beat" {
  name              = "/ecs/ino-${var.environment}/beat"
  retention_in_days = 14
}

# ── API Task Definition ──────────────────────────────────────

resource "aws_ecs_task_definition" "api" {
  family                   = "ino-${var.environment}-api"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 1024 # 1 vCPU
  memory                   = 2048 # 2 GB
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name      = "api"
    image     = "${aws_ecr_repository.api.repository_url}:latest"
    essential = true

    command = [
      "gunicorn", "app.main:app",
      "-k", "uvicorn.workers.UvicornWorker",
      "-w", "4",
      "-b", "0.0.0.0:8000",
      "--timeout", "120",
      "--graceful-timeout", "30",
      "--access-logfile", "-"
    ]

    portMappings = [{
      containerPort = 8000
      protocol      = "tcp"
    }]

    environment = [
      { name = "ENVIRONMENT", value = var.environment },
      { name = "API_VERSION", value = "v1" },
    ]

    secrets = [
      { name = "DATABASE_URL", valueFrom = "arn:aws:secretsmanager:${var.aws_region}:*:secret:ino/${var.environment}/database-url" },
      { name = "REDIS_URL", valueFrom = "arn:aws:secretsmanager:${var.aws_region}:*:secret:ino/${var.environment}/redis-url" },
      { name = "SECRET_KEY", valueFrom = "arn:aws:secretsmanager:${var.aws_region}:*:secret:ino/${var.environment}/secret-key" },
      { name = "JWT_SECRET", valueFrom = "arn:aws:secretsmanager:${var.aws_region}:*:secret:ino/${var.environment}/jwt-secret" },
      { name = "STRIPE_SECRET_KEY", valueFrom = "arn:aws:secretsmanager:${var.aws_region}:*:secret:ino/${var.environment}/stripe-secret-key" },
      { name = "STRIPE_WEBHOOK_SECRET", valueFrom = "arn:aws:secretsmanager:${var.aws_region}:*:secret:ino/${var.environment}/stripe-webhook-secret" },
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.api.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "api"
      }
    }

    healthCheck = {
      command     = ["CMD-SHELL", "curl -f http://localhost:8000/health || exit 1"]
      interval    = 30
      timeout     = 10
      retries     = 3
      startPeriod = 60
    }
  }])
}

# ── Worker Task Definition ───────────────────────────────────

resource "aws_ecs_task_definition" "worker" {
  family                   = "ino-${var.environment}-worker"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 1024
  memory                   = 2048
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name      = "worker"
    image     = "${aws_ecr_repository.api.repository_url}:latest"
    essential = true

    command = [
      "celery", "-A", "app.worker", "worker",
      "-l", "info",
      "-c", "4",
      "-Q", "default,ai,video,notifications",
      "--without-heartbeat"
    ]

    environment = [
      { name = "ENVIRONMENT", value = var.environment },
    ]

    secrets = [
      { name = "DATABASE_URL", valueFrom = "arn:aws:secretsmanager:${var.aws_region}:*:secret:ino/${var.environment}/database-url" },
      { name = "REDIS_URL", valueFrom = "arn:aws:secretsmanager:${var.aws_region}:*:secret:ino/${var.environment}/redis-url" },
      { name = "SECRET_KEY", valueFrom = "arn:aws:secretsmanager:${var.aws_region}:*:secret:ino/${var.environment}/secret-key" },
      { name = "STRIPE_SECRET_KEY", valueFrom = "arn:aws:secretsmanager:${var.aws_region}:*:secret:ino/${var.environment}/stripe-secret-key" },
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.worker.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "worker"
      }
    }
  }])
}

# ── Beat Task Definition ─────────────────────────────────────

resource "aws_ecs_task_definition" "beat" {
  family                   = "ino-${var.environment}-beat"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 256  # 0.25 vCPU
  memory                   = 512  # 0.5 GB
  execution_role_arn       = aws_iam_role.ecs_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  container_definitions = jsonencode([{
    name      = "beat"
    image     = "${aws_ecr_repository.api.repository_url}:latest"
    essential = true

    command = [
      "celery", "-A", "app.worker", "beat",
      "-l", "info",
      "--scheduler", "celery.beat:PersistentScheduler"
    ]

    environment = [
      { name = "ENVIRONMENT", value = var.environment },
    ]

    secrets = [
      { name = "REDIS_URL", valueFrom = "arn:aws:secretsmanager:${var.aws_region}:*:secret:ino/${var.environment}/redis-url" },
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = aws_cloudwatch_log_group.beat.name
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "beat"
      }
    }
  }])
}

# ── ECS Services ─────────────────────────────────────────────

resource "aws_ecs_service" "api" {
  name            = "api"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 2
  launch_type     = "FARGATE"

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  deployment_maximum_percent         = 200
  deployment_minimum_healthy_percent = 100

  network_configuration {
    subnets          = module.vpc.private_subnets
    security_groups  = [aws_security_group.api.id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = 8000
  }

  depends_on = [aws_lb_listener.https]
}

resource "aws_ecs_service" "worker" {
  name            = "worker"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.worker.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  network_configuration {
    subnets          = module.vpc.private_subnets
    security_groups  = [aws_security_group.api.id]
    assign_public_ip = false
  }
}

resource "aws_ecs_service" "beat" {
  name            = "beat"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.beat.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  network_configuration {
    subnets          = module.vpc.private_subnets
    security_groups  = [aws_security_group.api.id]
    assign_public_ip = false
  }
}

# ── Auto-Scaling (API) ──────────────────────────────────────

resource "aws_appautoscaling_target" "api" {
  max_capacity       = 12
  min_capacity       = 2
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.api.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "api_cpu" {
  name               = "ino-api-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.api.resource_id
  scalable_dimension = aws_appautoscaling_target.api.scalable_dimension
  service_namespace  = aws_appautoscaling_target.api.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 70.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

resource "aws_appautoscaling_policy" "api_requests" {
  name               = "ino-api-request-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.api.resource_id
  scalable_dimension = aws_appautoscaling_target.api.scalable_dimension
  service_namespace  = aws_appautoscaling_target.api.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ALBRequestCountPerTarget"
      resource_label         = "${aws_lb.main.arn_suffix}/${aws_lb_target_group.api.arn_suffix}"
    }
    target_value       = 1000.0 # requests per target per minute
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

# ── Auto-Scaling (Worker) ───────────────────────────────────

resource "aws_appautoscaling_target" "worker" {
  max_capacity       = 6
  min_capacity       = 1
  resource_id        = "service/${aws_ecs_cluster.main.name}/${aws_ecs_service.worker.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  service_namespace  = "ecs"
}

resource "aws_appautoscaling_policy" "worker_cpu" {
  name               = "ino-worker-cpu-scaling"
  policy_type        = "TargetTrackingScaling"
  resource_id        = aws_appautoscaling_target.worker.resource_id
  scalable_dimension = aws_appautoscaling_target.worker.scalable_dimension
  service_namespace  = aws_appautoscaling_target.worker.service_namespace

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value       = 70.0
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}
