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

module "ns" {
  source      = "../../../modules/service-discovery-namespace"
  project     = "virtual-consultant"
  name_prefix = "vc"
  env         = "prod"
  vpc_id      = local.resolved_vpc_id
  dns_name    = "vc-prod.internal"
}

output "namespace_id" {
  value = module.ns.namespace_id
}

output "dns_name" {
  value = module.ns.dns_name
}
