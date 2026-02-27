# ════════════════════════════════════════════════════════════════
# INÖ PLATFORM — ALB (Application Load Balancer)
# ════════════════════════════════════════════════════════════════

resource "aws_lb" "main" {
  name               = "ino-${var.environment}"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = module.vpc.public_subnets

  enable_deletion_protection = var.environment == "production"
}

resource "aws_security_group" "alb" {
  name_prefix = "ino-alb-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# ── SSL Certificate ──────────────────────────────────────────

resource "aws_acm_certificate" "main" {
  domain_name               = "api.inoplatform.com"
  subject_alternative_names = ["*.inoplatform.com"]
  validation_method         = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

# ── Target Group ─────────────────────────────────────────────

resource "aws_lb_target_group" "api" {
  name        = "ino-api-${var.environment}"
  port        = 8000
  protocol    = "HTTP"
  vpc_id      = module.vpc.vpc_id
  target_type = "ip" # required for Fargate

  health_check {
    enabled             = true
    path                = "/health"
    port                = "traffic-port"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 10
    interval            = 30
    matcher             = "200"
  }

  deregistration_delay = 30

  stickiness {
    type    = "lb_cookie"
    enabled = false
  }
}

# ── Listeners ────────────────────────────────────────────────

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.main.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate.main.arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}

resource "aws_lb_listener" "http_redirect" {
  load_balancer_arn = aws_lb.main.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# ── Outputs ──────────────────────────────────────────────────

output "alb_dns_name" { value = aws_lb.main.dns_name }
output "alb_zone_id"  { value = aws_lb.main.zone_id }
