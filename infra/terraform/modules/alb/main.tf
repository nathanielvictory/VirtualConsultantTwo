locals {
  base_tags = {
    Project = var.project
    Env     = var.env
  }
  tags = merge(local.base_tags, var.extra_tags)
  name = "${var.name_prefix}-${var.env}-api"
}

# -------------------------
# Security Group for ALB
# -------------------------
resource "aws_security_group" "alb" {
  name        = "${local.name}-alb-sg"
  description = "Public ALB SG for ${var.env} API"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "ALB egress anywhere"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.tags, { Name = "${local.name}-alb-sg" })
}

# Allow ALB → API container port
resource "aws_security_group_rule" "api_ingress_from_alb" {
  type                     = "ingress"
  description              = "ALB to API container port"
  from_port                = var.container_port
  to_port                  = var.container_port
  protocol                 = "tcp"
  security_group_id        = var.api_sg_id
  source_security_group_id = aws_security_group.alb.id
}

# -------------------------
# ALB
# -------------------------
resource "aws_lb" "this" {
  name               = "${local.name}-alb"
  load_balancer_type = "application"
  internal           = false
  security_groups    = [aws_security_group.alb.id]
  subnets            = var.public_subnet_ids

  tags = local.tags
}

# -------------------------
# Target group
# -------------------------
resource "aws_lb_target_group" "api" {
  name        = "${local.name}-tg"
  port        = var.container_port
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = var.vpc_id

  health_check {
    enabled             = true
    path                = var.health_check_path
    matcher             = "200-499"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }

  tags = local.tags
}

# -------------------------
# Listeners
# -------------------------
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      protocol   = "HTTPS"
      port       = "443"
      status_code = "HTTP_301"
    }
  }
}

# Certificate (issue+validate) if not provided
resource "aws_acm_certificate" "api" {
  count             = var.certificate_arn == "" ? 1 : 0
  domain_name       = var.api_domain
  validation_method = "DNS"

  tags = local.tags
}

resource "aws_route53_record" "api_cert_validation" {
  for_each = var.certificate_arn == "" ? {
    for dvo in aws_acm_certificate.api[0].domain_validation_options :
    dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  } : {}

  zone_id = var.route53_zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.record]
}

resource "aws_acm_certificate_validation" "api" {
  count = var.certificate_arn == "" ? 1 : 0

  certificate_arn         = aws_acm_certificate.api[0].arn
  validation_record_fqdns = [for r in aws_route53_record.api_cert_validation : r.fqdn]
}

locals {
  https_cert_arn = var.certificate_arn != "" ? var.certificate_arn : aws_acm_certificate_validation.api[0].certificate_arn
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.this.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = local.https_cert_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }

  depends_on = [
    aws_lb_listener.http
  ]
}

# -------------------------
# Route53 alias to ALB
# -------------------------
resource "aws_route53_record" "api_alias" {
  zone_id = var.route53_zone_id
  name    = var.api_domain
  type    = "A"

  alias {
    name                   = aws_lb.this.dns_name
    zone_id                = aws_lb.this.zone_id
    evaluate_target_health = false
  }
}
