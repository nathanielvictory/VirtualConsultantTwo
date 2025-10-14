variable "project" {
  description = "Project tag / name prefix root"
  type        = string
  default     = "virtual-consultant"
}

variable "name_prefix" {
  description = "Short prefix for naming (e.g., vc)"
  type        = string
  default     = "vc"
}

variable "env" {
  description = "Environment label (qa, prod, etc.)"
  type        = string
}

variable "vpc_id" {
  description = "Existing VPC ID where subnets/RTs/NAT will be created"
  type        = string
}

# AZs
variable "az_a" { type = string }
variable "az_b" { type = string }

# CIDRs
variable "public_a_cidr"  { type = string }
variable "public_b_cidr"  { type = string }
variable "private_a_cidr" { type = string }
variable "private_b_cidr" { type = string }

# Extra tags (merged on top)
variable "extra_tags" {
  type        = map(string)
  default     = {}
  description = "Additional tags to merge into all resources"
}
