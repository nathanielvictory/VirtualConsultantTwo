variable "vpc_id" {
  type    = string
  default = "vpc-04933b4be81a4dc22"
}

data "aws_subnets" "private" {
  filter {
    name   = "vpc-id"
    values = [var.vpc_id]
  }

  tags = {
    Env  = "qa"
    Tier = "private"
  }
}

module "rds" {
  source = "../../../modules/rds"

  project     = "virtual-consultant"
  name_prefix = "vc"
  env         = "qa"

  vpc_id             = var.vpc_id
  private_subnet_ids = data.aws_subnets.private.ids

  engine_version = "17.6"
  instance_class = "db.t4g.small"
  db_name        = "consultant_db"
  username       = "consultant_user"
  password       = "consultant_pass"

  # Publish DB info to Secrets Manager + SSM
  publish_secrets = true
  db_secret_name  = "/app/qa/db/credentials"

  publish_ssm       = true
  db_endpoint_param = "/app/qa/db/endpoint"
  db_name_param     = "/app/qa/db/name"
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
