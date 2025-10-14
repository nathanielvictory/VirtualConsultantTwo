locals {
  base_tags = {
    Project = var.project
    Env     = var.env
  }
  tags = merge(local.base_tags, var.extra_tags)
}

resource "aws_service_discovery_private_dns_namespace" "this" {
  name = var.dns_name
  vpc  = var.vpc_id
  tags = local.tags
}
