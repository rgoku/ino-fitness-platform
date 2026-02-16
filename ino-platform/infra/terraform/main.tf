# ════════════════════════════════════════════════════════════════
# INÖ PLATFORM — INFRASTRUCTURE (AWS)
# terraform init && terraform plan
# ════════════════════════════════════════════════════════════════

terraform {
  required_version = ">= 1.5"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
  backend "s3" {
    bucket = "ino-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  default = "us-east-1"
}

variable "environment" {
  default = "production"
}

# ── VPC ────────────────────────────────────────────────────────
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "ino-${var.environment}"
  cidr = "10.0.0.0/16"

  azs             = ["${var.aws_region}a", "${var.aws_region}b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true             # cost optimization for early stage
}

# ── Database (RDS PostgreSQL) ──────────────────────────────────
resource "aws_db_instance" "main" {
  identifier     = "ino-${var.environment}"
  engine         = "postgres"
  engine_version = "16.2"
  instance_class = "db.t4g.medium"      # right-sized for < 100 coaches
  allocated_storage = 50

  db_name  = "ino"
  username = "ino_admin"
  manage_master_user_password = true

  vpc_security_group_ids = [aws_security_group.db.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  backup_retention_period = 7
  multi_az               = false         # flip to true at scale
  skip_final_snapshot    = false
  final_snapshot_identifier = "ino-${var.environment}-final"
}

resource "aws_db_subnet_group" "main" {
  name       = "ino-${var.environment}"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_security_group" "db" {
  name_prefix = "ino-db-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.api.id]
  }
}

# ── Cache (ElastiCache Redis) ──────────────────────────────────
resource "aws_elasticache_cluster" "main" {
  cluster_id      = "ino-${var.environment}"
  engine          = "redis"
  engine_version  = "7.1"
  node_type       = "cache.t4g.micro"
  num_cache_nodes = 1

  subnet_group_name  = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.cache.id]
}

resource "aws_elasticache_subnet_group" "main" {
  name       = "ino-${var.environment}"
  subnet_ids = module.vpc.private_subnets
}

resource "aws_security_group" "cache" {
  name_prefix = "ino-cache-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.api.id]
  }
}

# ── Storage (S3) ───────────────────────────────────────────────
resource "aws_s3_bucket" "media" {
  bucket = "ino-media-${var.environment}"
}

resource "aws_s3_bucket_lifecycle_configuration" "video_retention" {
  bucket = aws_s3_bucket.media.id

  rule {
    id     = "video-90-day-retention"
    status = "Enabled"
    filter { prefix = "coaches/" }

    # Videos are tagged with expiry; this is the safety net
    expiration { days = 120 }

    noncurrent_version_expiration { noncurrent_days = 30 }
  }
}

resource "aws_s3_bucket_cors_configuration" "media" {
  bucket = aws_s3_bucket.media.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "PUT", "POST"]
    allowed_origins = ["https://app.inoplatform.com", "https://inoplatform.com"]
    max_age_seconds = 3600
  }
}

# ── CDN (CloudFront) ───────────────────────────────────────────
resource "aws_cloudfront_distribution" "cdn" {
  origin {
    domain_name = aws_s3_bucket.media.bucket_regional_domain_name
    origin_id   = "S3-media"
  }

  enabled         = true
  is_ipv6_enabled = true
  default_root_object = ""

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-media"
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = false
      cookies { forward = "none" }
    }

    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 31536000
  }

  restrictions {
    geo_restriction { restriction_type = "none" }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

# ── API (ECS Fargate) ─────────────────────────────────────────
resource "aws_security_group" "api" {
  name_prefix = "ino-api-"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 8000
    to_port     = 8000
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

# NOTE: Full ECS task definition, service, ALB, and auto-scaling
# omitted for brevity. See infra/terraform/ecs.tf for production config.

# ── Outputs ────────────────────────────────────────────────────
output "db_endpoint" { value = aws_db_instance.main.endpoint }
output "cdn_domain" { value = aws_cloudfront_distribution.cdn.domain_name }
output "s3_bucket" { value = aws_s3_bucket.media.id }
