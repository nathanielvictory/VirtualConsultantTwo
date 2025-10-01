variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-2"
}

variable "env" {
  description = "Environment label"
  type        = string
  default     = "qa"
}

variable "vpc_id" {
  description = "Existing VPC ID (vpc-xxxx). If set, we'll use it directly."
  type        = string
  default     = "vpc-04933b4be81a4dc22"
}

variable "vpc_name" {
  description = "Fallback: VPC Name tag to search when vpc_id is empty."
  type        = string
  default     = "vmod-terraform"
}

variable "az_a" {
  description = "First AZ for QA subnets"
  type        = string
  default     = "us-east-2a"
}

variable "az_b" {
  description = "Second AZ for QA subnets"
  type        = string
  default     = "us-east-2b"
}

# QA CIDRs (inside 10.1.0.0/16, non-overlapping with prod)
variable "qa_public_a_cidr" {
  type    = string
  default = "10.1.128.0/20"
}

variable "qa_public_b_cidr" {
  type    = string
  default = "10.1.144.0/20"
}

variable "qa_private_a_cidr" {
  type    = string
  default = "10.1.160.0/19"
}

variable "qa_private_b_cidr" {
  type    = string
  default = "10.1.192.0/19"
}

variable "db_name" {
  description = "Initial database name"
  type        = string
  default     = "consultant_db"
}

variable "db_username" {
  description = "Master username"
  type        = string
  default     = "consultant_user"
}

variable "db_password" {
  description = "Master password (use Secrets Manager later)"
  type        = string
  default     = "consultant_pass"
}

variable "db_instance_class" {
  description = "RDS instance size"
  type        = string
  default     = "db.t4g.small"
}

variable "api_image_tag" {
  description = "ECR image tag (use the commit SHA you pushed)"
  type        = string
  default     = "latest"
}

variable "api_cpu" {
  description = "Fargate CPU units (256=0.25 vCPU, 512=0.5 vCPU)"
  type        = number
  default     = 512
}

variable "api_memory" {
  description = "Fargate memory (MB)"
  type        = number
  default     = 1024
}

variable "container_port" {
  description = "Port your API listens on inside the container"
  type        = number
  default     = 8080
}

variable "rabbit_user" {
  description = "RabbitMQ user for QA (non-durable test creds)"
  type        = string
  default     = "consultant"
}

variable "rabbit_password" {
  description = "RabbitMQ password for QA (use Secrets later)"
  type        = string
  default     = "consultant_pass"
}

variable "api_domain" {
  description = "FQDN for the QA API"
  type        = string
  default     = "api.qa.virtualconsultant.victorymodeling.com"
}

variable "web_domain" {
  description = "FQDN for the QA web app"
  type        = string
  default     = "qa.virtualconsultant.victorymodeling.com"
}

variable "route53_zone_id" {
  description = "Hosted Zone ID for victorymodeling.com"
  type        = string
  default     = "Z08197042F0B8ALXR74ST"
}

variable "worker_image_tag" {
  description = "ECR tag for the worker image (commit SHA recommended)"
  type        = string
  default     = "latest"
}

variable "worker_cpu" {
  type    = number
  default = 256
}

variable "worker_memory" {
  type    = number
  default = 512
}