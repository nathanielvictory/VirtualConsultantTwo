# vpc_manage.tf

# Look up the existing VPC you reference via var.vpc_id
data "aws_vpc" "target" {
  id = var.vpc_id
}

# Manage that same VPC so we can set DNS flags in Terraform
resource "aws_vpc" "managed" {
  cidr_block           = data.aws_vpc.target.cidr_block
  enable_dns_support   = true
  enable_dns_hostnames = true

  # Preserve Name if present
  tags = {
    Name = coalesce(lookup(data.aws_vpc.target.tags, "Name", null), var.vpc_id)
  }
}
