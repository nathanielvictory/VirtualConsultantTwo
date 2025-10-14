# -------------------------
# VPC + subnet discovery
# -------------------------
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

data "aws_subnets" "private" {
  filter {
    name   = "vpc-id"
    values = [local.resolved_vpc_id]
  }
  tags = {
    Env  = "prod"
    Tier = "private"
  }
}

# -------------------------
# RDS module (publishes Secrets/SSM)
# -------------------------
module "rds" {
  source = "../../../modules/rds"

  project     = "virtual-consultant"
  name_prefix = "vc"
  env         = "prod"

  vpc_id             = local.resolved_vpc_id
  private_subnet_ids = data.aws_subnets.private.ids

  engine_version  = "17.6"
  instance_class  = "db.t4g.small"
  db_name         = "consultant_db"
  username        = "consultant_user"
  password        = "consultant_pass"

  publish_secrets = true
  db_secret_name  = "/app/prod/db/credentials"

  publish_ssm       = true
  db_endpoint_param = "/app/prod/db/endpoint"
  db_name_param     = "/app/prod/db/name"
}

output "rds_endpoint" {
  value = module.rds.db_endpoint
}

output "db_secret_arn" {
  value = module.rds.db_secret_arn
}

output "db_endpoint_param_name" {
  value = module.rds.db_endpoint_param_name
}

output "db_name_param_name" {
  value = module.rds.db_name_param_name
}
