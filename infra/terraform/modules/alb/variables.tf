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

variable "vpc_id" {
  type        = string
  description = "VPC where the ALB lives"
}

variable "public_subnet_ids" {
  type        = list(string)
  description = "Public subnet IDs for the ALB"
}

variable "api_sg_id" {
  type        = string
  description = "Security group ID of the target service (API) to allow ingress from ALB"
}

variable "container_port" {
  type        = number
  default     = 8080
  description = "Target container port"
}

variable "health_check_path" {
  type        = string
  default     = "/swagger/v1/swagger.json"
}

variable "api_domain" {
  type        = string
  description = "FQDN for the API (e.g., api.qa.example.com)"
}

variable "route53_zone_id" {
  type        = string
  description = "Hosted zone ID where validation + alias will be created"
}

# If you prefer to supply an existing cert, set this and the module will skip issuing/validating a new one.
variable "certificate_arn" {
  type        = string
  default     = ""
}

variable "extra_tags" {
  type    = map(string)
  default = {}
}
