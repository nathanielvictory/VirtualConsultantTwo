output "bucket_name" {
  value = aws_s3_bucket.web.bucket
}

output "distribution_domain" {
  value = aws_cloudfront_distribution.web.domain_name
}

output "certificate_arn" {
  value = local.cert_arn
}
