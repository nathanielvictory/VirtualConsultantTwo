variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-2"
}

variable "env" {
  description = "Environment label"
  type        = string
  default     = "prod"
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
  description = "First AZ for prod subnets"
  type        = string
  default     = "us-east-2a"
}

variable "az_b" {
  description = "Second AZ for prod subnets"
  type        = string
  default     = "us-east-2b"
}

variable "prod_public_a_cidr" {
  type    = string
  default = "10.1.0.0/20"
}

variable "prod_public_b_cidr" {
  type    = string
  default = "10.1.16.0/20"
}

variable "prod_private_a_cidr" {
  type    = string
  default = "10.1.32.0/19"
}

variable "prod_private_b_cidr" {
  type    = string
  default = "10.1.64.0/19"
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
  description = "Master password"
  type        = string
  default     = "consultant_pass"
}

variable "db_instance_class" {
  description = "RDS instance size"
  type        = string
  default     = "db.t4g.small"
}

variable "api_image_tag" {
  description = "ECR image tag for prod (pin to a stable commit SHA)"
  type        = string
  default     = "latest"
}

variable "api_cpu" {
  description = "Fargate CPU units"
  type        = number
  default     = 512
}

variable "api_memory" {
  description = "Fargate memory (MB)"
  type        = number
  default     = 1024
}

variable "container_port" {
  description = "Container listen port"
  type        = number
  default     = 8080
}

variable "rabbit_user" {
  description = "RabbitMQ user for PROD (non-durable test creds)"
  type        = string
  default     = "consultant"
}

variable "rabbit_password" {
  description = "RabbitMQ password for PROD (use Secrets later)"
  type        = string
  default     = "consultant_pass"
}