module "web" {
  source = "../../../modules/web-static-site"

  # ensure ACM happens in us-east-1 inside the module
  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }

  project       = "virtual-consultant"
  name_prefix   = "vc"
  env           = "prod"

  web_domain      = "virtualconsultant.victorymodeling.com"
  route53_zone_id = "Z08197042F0B8ALXR74ST"

  default_root_object = "index.html"
  price_class         = "PriceClass_100"
  enable_spa_errors   = true

  # If you already have a cert in us-east-1, set it here and the module will skip issuing:
  # certificate_arn = "arn:aws:acm:us-east-1:123456789012:certificate/..."
}

output "web_bucket_name" {
  value = module.web.bucket_name
}

output "web_cdn_domain" {
  value = module.web.distribution_domain
}
