# -------------------------
# Inputs / lookups
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

data "aws_ecs_cluster" "prod" {
  cluster_name = "vc-prod-cluster"
}

data "aws_iam_role" "exec" {
  name = "vc-prod-ecsTaskExecutionRole"
}

data "aws_iam_role" "task" {
  name = "vc-prod-ecsTaskRole"
}

data "aws_cloudwatch_log_group" "ecs" {
  name = "/ecs/virtual-consultant/prod"
}

# Service discovery namespace created by live/prod/discovery
data "aws_service_discovery_dns_namespace" "ns" {
  name = "vc-prod.internal"
  type = "DNS_PRIVATE"
}

# -------------------------
# Module invocation
# -------------------------
module "rabbit" {
  source = "../../../modules/rabbit"

  project      = "virtual-consultant"
  name_prefix  = "vc"
  env          = "prod"

  cluster_arn        = data.aws_ecs_cluster.prod.arn
  vpc_id             = local.resolved_vpc_id
  subnet_ids         = data.aws_subnets.private.ids
  execution_role_arn = data.aws_iam_role.exec.arn
  task_role_arn      = data.aws_iam_role.task.arn

  log_group_name     = data.aws_cloudwatch_log_group.ecs.name
  aws_region         = "us-east-2"

  namespace_id       = data.aws_service_discovery_dns_namespace.ns.id
  service_name       = "rabbit"

  rabbit_user        = "consultant"
  rabbit_password    = "consultant_pass"

  allowed_cidrs      = ["10.0.0.0/24", "10.0.0.0/16"] # tighten as you wish
  desired_count      = 1
}

output "rabbit_service_name" {
  value = module.rabbit.service_name
}

output "rabbit_sg_id" {
  value = module.rabbit.security_group_id
}
