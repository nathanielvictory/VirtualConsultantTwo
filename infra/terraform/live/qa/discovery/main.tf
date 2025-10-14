variable "vpc_id" {
  type    = string
  default = "vpc-04933b4be81a4dc22"
}

module "ns" {
  source      = "../../../modules/service-discovery-namespace"
  project     = "virtual-consultant"
  name_prefix = "vc"
  env         = "qa"
  vpc_id      = var.vpc_id
  dns_name    = "vc-qa.internal"
}

output "namespace_id"  { value = module.ns.namespace_id }
output "dns_name"      { value = module.ns.dns_name }
