locals {
  base_tags = {
    Project = var.project
    Env     = var.env
  }
  tags = merge(local.base_tags, var.extra_tags)
  name = "${var.name_prefix}-${var.env}-web"
}

# --------------------------
# S3 bucket (private, OAC access only)
# --------------------------
data "aws_caller_identity" "current" {}

locals {
  web_bucket_name = "${local.name}-bucket-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket" "web" {
  bucket = local.web_bucket_name

  tags = merge(local.tags, {
    Name = local.web_bucket_name
  })
}

resource "aws_s3_bucket_versioning" "web" {
  bucket = aws_s3_bucket.web.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_ownership_controls" "web" {
  bucket = aws_s3_bucket.web.id

  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_public_access_block" "web" {
  bucket                  = aws_s3_bucket.web.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# --------------------------
# CloudFront OAC
# --------------------------
resource "aws_cloudfront_origin_access_control" "oac" {
  name                              = "${local.name}-oac"
  description                       = "OAC for ${var.env} web S3 origin"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# --------------------------
# ACM certificate in us-east-1 (required by CloudFront)
# The caller must pass a provider alias for us-east-1 when using this module.
# --------------------------
resource "aws_acm_certificate" "web" {
  count             = var.certificate_arn == "" ? 1 : 0
  provider          = aws.us_east_1
  domain_name       = var.web_domain
  validation_method = "DNS"

  tags = merge(local.tags, {
    Use = "cloudfront"
  })
}

resource "aws_route53_record" "web_cert_validation" {
  for_each = var.certificate_arn == "" ? {
    for dvo in aws_acm_certificate.web[0].domain_validation_options :
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

resource "aws_acm_certificate_validation" "web" {
  count = var.certificate_arn == "" ? 1 : 0

  provider                 = aws.us_east_1
  certificate_arn         = aws_acm_certificate.web[0].arn
  validation_record_fqdns = [for r in aws_route53_record.web_cert_validation : r.fqdn]
}

locals {
  cert_arn = var.certificate_arn != "" ? var.certificate_arn : aws_acm_certificate_validation.web[0].certificate_arn
}

# --------------------------
# CloudFront distribution
# --------------------------
resource "aws_cloudfront_distribution" "web" {
  enabled             = true
  is_ipv6_enabled     = true
  aliases             = [var.web_domain]
  default_root_object = var.default_root_object

  origin {
    domain_name              = aws_s3_bucket.web.bucket_regional_domain_name
    origin_id                = "s3-web-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.oac.id
  }

  default_cache_behavior {
    target_origin_id       = "s3-web-origin"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    compress         = true

    cache_policy_id          = var.cache_policy_id
    origin_request_policy_id = var.origin_request_policy_id
  }

  dynamic "custom_error_response" {
    for_each = var.enable_spa_errors ? [403, 404] : []
    content {
      error_code            = custom_error_response.value
      response_code         = 200
      response_page_path    = "/index.html"
      error_caching_min_ttl = 0
    }
  }

  price_class = var.price_class

  viewer_certificate {
    acm_certificate_arn      = local.cert_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = local.tags

  depends_on = [
    aws_acm_certificate_validation.web
  ]
}

# --------------------------
# Bucket policy to allow CloudFront OAC to read
# --------------------------
data "aws_iam_policy_document" "bucket_policy" {
  statement {
    sid     = "AllowCloudFrontReadViaOAC"
    actions = ["s3:GetObject"]
    resources = [
      "${aws_s3_bucket.web.arn}/*"
    ]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.web.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "web" {
  bucket = aws_s3_bucket.web.id
  policy = data.aws_iam_policy_document.bucket_policy.json
}

# --------------------------
# Route53 aliases to CloudFront
# --------------------------
resource "aws_route53_record" "alias_a" {
  zone_id = var.route53_zone_id
  name    = var.web_domain
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.web.domain_name
    zone_id                = aws_cloudfront_distribution.web.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "alias_aaaa" {
  zone_id = var.route53_zone_id
  name    = var.web_domain
  type    = "AAAA"

  alias {
    name                   = aws_cloudfront_distribution.web.domain_name
    zone_id                = aws_cloudfront_distribution.web.hosted_zone_id
    evaluate_target_health = false
  }
}
