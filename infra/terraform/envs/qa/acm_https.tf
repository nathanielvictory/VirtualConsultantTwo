# Public cert for the QA API (must be in the same region as the ALB: us-east-2)
resource "aws_acm_certificate" "api" {
  domain_name       = var.api_domain
  validation_method = "DNS"

  tags = {
    Project = "virtual-consultant"
    Env     = "qa"
  }
}

# DNS records for validation
resource "aws_route53_record" "api_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.api.domain_validation_options :
    dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  zone_id = var.route53_zone_id
  name    = each.value.name
  type    = each.value.type
  ttl     = 60
  records = [each.value.record]
}

# Complete validation
resource "aws_acm_certificate_validation" "api" {
  certificate_arn         = aws_acm_certificate.api.arn
  validation_record_fqdns = [for r in aws_route53_record.api_cert_validation : r.fqdn]
}

# HTTPS listener on 443 for the existing QA ALB
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.qa.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = aws_acm_certificate_validation.api.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }

  depends_on = [aws_acm_certificate_validation.api]

  tags = {
    Project = "virtual-consultant"
    Env     = "qa"
  }
}

# Point the domain to the ALB
resource "aws_route53_record" "api_alias" {
  zone_id = var.route53_zone_id
  name    = var.api_domain
  type    = "A"

  alias {
    name                   = aws_lb.qa.dns_name
    zone_id                = aws_lb.qa.zone_id
    evaluate_target_health = false
  }
}
