# -------------------------
# Inputs / lookups
# -------------------------
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

data "aws_ecs_cluster" "qa" {
  cluster_name = "vc-qa-cluster"
}

data "aws_iam_role" "exec" {
  name = "vc-qa-ecsTaskExecutionRole"
}

data "aws_iam_role" "task" {
  name = "vc-qa-ecsTaskRole"
}

data "aws_cloudwatch_log_group" "ecs" {
  name = "/ecs/virtual-consultant/qa"
}

# Service discovery namespace from the discovery stack
# If you prefer discovery by name:
data "aws_service_discovery_dns_namespace" "ns" {
  name = "vc-qa.internal"
  type = "DNS_PRIVATE"
}

# -------------------------
# Module invocation
# -------------------------
module "rabbit" {
  source = "../../../modules/rabbit"

  project      = "virtual-consultant"
  name_prefix  = "vc"
  env          = "qa"

  cluster_arn       = data.aws_ecs_cluster.qa.arn
  vpc_id            = var.vpc_id
  subnet_ids        = data.aws_subnets.private.ids
  execution_role_arn= data.aws_iam_role.exec.arn
  task_role_arn     = data.aws_iam_role.task.arn

  log_group_name    = data.aws_cloudwatch_log_group.ecs.name
  aws_region        = "us-east-2"

  namespace_id = data.aws_service_discovery_dns_namespace.ns.id
  service_name      = "rabbit"

  rabbit_user       = "consultant"
  rabbit_password   = "consultant_pass"

  allowed_cidrs     = ["10.0.0.0/24", "10.1.0.0/16"]
  desired_count     = 1
}

output "rabbit_service_name" { value = module.rabbit.service_name }
output "rabbit_sg_id"        { value = module.rabbit.security_group_id }
