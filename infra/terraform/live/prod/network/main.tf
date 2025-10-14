# Resolve the shared VPC (override vpc_id if you want a different VPC)
variable "vpc_id" {
  type        = string
  default     = ""
  description = "Existing VPC ID (vpc-xxxx). If empty, resolve by Name tag."
}

variable "vpc_name" {
  type        = string
  default     = "vmod-terraform"
  description = "VPC Name tag used when vpc_id is empty."
}

locals {
  use_explicit_vpc = var.vpc_id != ""
}

data "aws_vpc" "by_id" {
  count = local.use_explicit_vpc ? 1 : 0
  id    = var.vpc_id
}

data "aws_vpc" "by_name" {
  count = local.use_explicit_vpc ? 0 : 1

  filter {
    name   = "tag:Name"
    values = [var.vpc_name]
  }
}

locals {
  resolved_vpc_id = local.use_explicit_vpc ? data.aws_vpc.by_id[0].id : data.aws_vpc.by_name[0].id
}

# --- Call the shared vpc module (prod subnets/NAT/RTs in the existing VPC) ---
module "vpc" {
  source = "../../../modules/vpc"

  project     = "virtual-consultant"
  name_prefix = "vc"
  env         = "prod"

  vpc_id = local.resolved_vpc_id

  # AZs (adjust if you prefer different ones for prod)
  az_a = "us-east-2a"
  az_b = "us-east-2b"

  # PROD CIDRs (non-overlapping with QA’s 10.1.x ranges)
  public_a_cidr  = "10.2.128.0/20"
  public_b_cidr  = "10.2.144.0/20"
  private_a_cidr = "10.2.160.0/19"
  private_b_cidr = "10.2.192.0/19"

  extra_tags = {}
}

output "vpc_id" {
  value = module.vpc.vpc_id
}

output "public_subnet_ids" {
  value = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  value = module.vpc.private_subnet_ids
}
