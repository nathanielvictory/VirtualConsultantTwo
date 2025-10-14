module "web" {
  source = "../../../modules/web-static-site"

  # Pass providers so ACM is created in us-east-1 inside the module
  providers = {
    aws           = aws
    aws.us_east_1 = aws.us_east_1
  }

  project       = "virtual-consultant"
  name_prefix   = "vc"
  env           = "qa"

  web_domain      = "qa.virtualconsultant.victorymodeling.com"
  route53_zone_id = "Z08197042F0B8ALXR74ST"

  default_root_object = "index.html"
  price_class         = "PriceClass_100"
  enable_spa_errors   = true

  # certificate_arn = ""  # leave empty to issue+validate automatically
}

output "web_bucket_name" {
  value = module.web.bucket_name
}

output "web_cdn_domain" {
  value = module.web.distribution_domain
}
