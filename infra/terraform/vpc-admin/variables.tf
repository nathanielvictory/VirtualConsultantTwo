variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-2"
}

variable "vpc_id" {
  description = "Existing VPC to attach a secondary CIDR to"
  type        = string
  default     = "vpc-04933b4be81a4dc22"
}

variable "secondary_cidr" {
  description = "New IPv4 CIDR block to associate (must not overlap anything you route to)"
  type        = string
  default     = "10.1.0.0/16"
}
