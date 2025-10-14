variable "project" {
  type        = string
  default     = "virtual-consultant"
}

variable "name_prefix" {
  type        = string
  default     = "vc"
}

variable "env" {
  type        = string
  description = "Environment label (qa, prod, etc.)"
}

# Domain + DNS
variable "web_domain" {
  type        = string
  description = "FQDN for the site (e.g., qa.example.com)"
}

variable "route53_zone_id" {
  type        = string
  description = "Hosted Zone ID for Route53"
}

# Distribution config
variable "default_root_object" {
  type        = string
  default     = "index.html"
}

variable "price_class" {
  type        = string
  default     = "PriceClass_100"
}

# Cache/Origin request policies (Managed defaults)
variable "cache_policy_id" {
  type        = string
  default     = "658327ea-f89d-4fab-a63d-7e88639e58f6" # Managed-CachingOptimized
}

variable "origin_request_policy_id" {
  type        = string
  default     = "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf" # Managed-CORS-S3Origin
}

# SPA-friendly error rewrites
variable "enable_spa_errors" {
  type        = bool
  default     = true
}

# Optional: provide an existing us-east-1 cert instead of issuing a new one
variable "certificate_arn" {
  type        = string
  default     = ""
}

# Extra tags
variable "extra_tags" {
  type        = map(string)
  default     = {}
}
