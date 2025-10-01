# Request the cert in us-east-1 for CloudFront
resource "aws_acm_certificate" "web" {
  provider          = aws.us_east_1
  domain_name       = var.web_domain
  validation_method = "DNS"

  tags = {
    Project = "virtual-consultant"
    Env     = "qa"
    Use     = "cloudfront"
  }
}

# Create the Route53 DNS validation records in your existing zone
resource "aws_route53_record" "web_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.web.domain_validation_options :
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
resource "aws_acm_certificate_validation" "web" {
  provider                 = aws.us_east_1
  certificate_arn         = aws_acm_certificate.web.arn
  validation_record_fqdns = [for r in aws_route53_record.web_cert_validation : r.fqdn]
}

# Expose the cert ARN for the next step (CloudFront)
output "web_cert_arn_us_east_1" {
  value = aws_acm_certificate_validation.web.certificate_arn
}
