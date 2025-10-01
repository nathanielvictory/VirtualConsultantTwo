# Make the bucket name unique per account (S3 is global)
data "aws_caller_identity" "current" {}

locals {
  web_bucket_name = "vc-qa-web-${data.aws_caller_identity.current.account_id}"
}

# --- S3 bucket (private, no public access)
resource "aws_s3_bucket" "web" {
  bucket = local.web_bucket_name

  tags = {
    Name    = local.web_bucket_name
    Project = "virtual-consultant"
    Env     = "qa"
  }
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

# --- CloudFront Origin Access Control (OAC)
resource "aws_cloudfront_origin_access_control" "web" {
  name                              = "vc-qa-web-oac"
  description                       = "OAC for QA web S3 origin"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# --- CloudFront Distribution (uses your us-east-1 ACM cert from web_acm.tf)
resource "aws_cloudfront_distribution" "web" {
  enabled             = true
  is_ipv6_enabled     = true
  aliases             = [var.web_domain]  # qa.virtualconsultant.victorymodeling.com
  default_root_object = "index.html"

  origin {
    domain_name              = aws_s3_bucket.web.bucket_regional_domain_name
    origin_id                = "s3-web-origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.web.id
  }

  default_cache_behavior {
    target_origin_id       = "s3-web-origin"
    viewer_protocol_policy = "redirect-to-https"

    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD", "OPTIONS"]
    compress         = true

    cache_policy_id          = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
    origin_request_policy_id = "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf" # Managed-CORS-S3Origin
  }

  # SPA-friendly errors: send 403/404 to /index.html with 200
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }
  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 0
  }

  price_class = "PriceClass_100" # cheapest regions

  viewer_certificate {
    acm_certificate_arn            = aws_acm_certificate_validation.web.certificate_arn
    ssl_support_method             = "sni-only"
    minimum_protocol_version       = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  tags = {
    Project = "virtual-consultant"
    Env     = "qa"
  }

  depends_on = [aws_acm_certificate_validation.web]
}

# --- Allow CloudFront (OAC) to read from the S3 bucket
data "aws_iam_policy_document" "web_bucket_policy" {
  statement {
    sid     = "AllowCloudFrontReadViaOAC"
    actions = ["s3:GetObject"]
    resources = ["${aws_s3_bucket.web.arn}/*"]

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
  policy = data.aws_iam_policy_document.web_bucket_policy.json
}

# --- Route 53 A/AAAA to CloudFront
resource "aws_route53_record" "web_alias_a" {
  zone_id = var.route53_zone_id
  name    = var.web_domain
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.web.domain_name
    zone_id                = aws_cloudfront_distribution.web.hosted_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "web_alias_aaaa" {
  zone_id = var.route53_zone_id
  name    = var.web_domain
  type    = "AAAA"
  alias {
    name                   = aws_cloudfront_distribution.web.domain_name
    zone_id                = aws_cloudfront_distribution.web.hosted_zone_id
    evaluate_target_health = false
  }
}

output "web_bucket_name" {
  value = aws_s3_bucket.web.bucket
}

output "web_cdn_domain" {
  value = aws_cloudfront_distribution.web.domain_name
}
