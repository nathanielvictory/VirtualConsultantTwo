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
