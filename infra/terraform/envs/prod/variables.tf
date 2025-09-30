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
