module "vpc" {
  source = "../../../modules/vpc"

  project     = "virtual-consultant"
  name_prefix = "vc"
  env         = "qa"

  # your existing VPC (you currently pass vpc-04933b4be81a4dc22)
  vpc_id = "vpc-04933b4be81a4dc22"

  # AZs
  az_a = "us-east-2a"
  az_b = "us-east-2b"

  # CIDRs copied from your QA vars
  public_a_cidr  = "10.1.128.0/20"
  public_b_cidr  = "10.1.144.0/20"
  private_a_cidr = "10.1.160.0/19"
  private_b_cidr = "10.1.192.0/19"

  extra_tags = {}
}

output "public_subnet_ids"  { value = module.vpc.public_subnet_ids }
output "private_subnet_ids" { value = module.vpc.private_subnet_ids }
output "vpc_id"             { value = module.vpc.vpc_id }
