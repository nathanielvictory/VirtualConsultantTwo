terraform {
  required_version = ">= 1.9.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

# vpc_debug.tf
data "aws_vpc" "resolved" {
  id = local.vpc_id
}

output "qa_vpc_dns_settings" {
  value = {
    vpc_id               = data.aws_vpc.resolved.id
    enable_dns_support   = data.aws_vpc.resolved.enable_dns_support
    enable_dns_hostnames = data.aws_vpc.resolved.enable_dns_hostnames
    dhcp_options_id      = data.aws_vpc.resolved.dhcp_options_id
  }
}