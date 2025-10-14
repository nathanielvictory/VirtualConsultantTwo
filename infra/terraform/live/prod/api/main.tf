# -------------------------
# Inputs
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

variable "api_image_tag" {
  type        = string
  default     = "latest"
  description = "ECR image tag for the API"
}

# Optional: wire DB via Secrets/SSM once the prod data stack publishes them
# DB via Secrets/SSM
variable "use_db_secret" {
  type    = bool
  default = true
}

variable "use_db_params" {
  type    = bool
  default = true
}

# Attach to ALB
variable "attach_to_alb" {
  type    = bool
  default = true
}

variable "db_secret_name" {
  type    = string
  default = "/app/prod/db/credentials"
}

variable "db_endpoint_param" {
  type    = string
  default = "/app/prod/db/endpoint"
}

variable "db_name_param" {
  type    = string
  default = "/app/prod/db/name"
}

variable "alb_target_group_name" {
  type    = string
  default = "vc-prod-api-tg"
}

# -------------------------
# Resolve VPC and subnets
# -------------------------
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
# Cluster, roles, logs
# (If these roles don’t exist yet, we’ll create a small prod IAM stack next.)
# -------------------------
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

# -------------------------
# API image (pin to digest)
# -------------------------
data "aws_ecr_repository" "api" {
  name = "virtual-consultant/api"
}

data "aws_ecr_image" "api_image" {
  repository_name = data.aws_ecr_repository.api.name
  image_tag       = var.api_image_tag
}

locals {
  api_image = "${data.aws_ecr_repository.api.repository_url}@${data.aws_ecr_image.api_image.image_digest}"
}

# -------------------------
# Optional: DB secrets/params (count-safe)
# -------------------------
data "aws_secretsmanager_secret" "db" {
  count = var.use_db_secret ? 1 : 0
  name  = var.db_secret_name
}

data "aws_ssm_parameter" "db_endpoint" {
  count = var.use_db_params ? 1 : 0
  name  = var.db_endpoint_param
}

data "aws_ssm_parameter" "db_name" {
  count = var.use_db_params ? 1 : 0
  name  = var.db_name_param
}

# Build environment map (conditionally include DB params)
locals {
  base_env = {
    ASPNETCORE_ENVIRONMENT = "Production"
    RabbitMq__HostName     = "rabbit.vc-prod.internal"
    PORT                    = "8080"
  }

  env_with_db = var.use_db_params ? merge(local.base_env, {
    DB__Endpoint = data.aws_ssm_parameter.db_endpoint[0].value
    DB__Name     = data.aws_ssm_parameter.db_name[0].value
  }) : local.base_env

  secrets_map = var.use_db_secret ? {
    DB__Username = {
      arn = data.aws_secretsmanager_secret.db[0].arn
    }
    DB__Password = {
      arn = data.aws_secretsmanager_secret.db[0].arn
    }
  } : {}
}

# Grant read perms to task if we enabled Secrets/SSM
locals {
  allow_secret_arns = var.use_db_secret ? [data.aws_secretsmanager_secret.db[0].arn] : []
  allow_param_names = var.use_db_params ? [var.db_endpoint_param, var.db_name_param] : []
}

# -------------------------
# Optional: ALB target group (attach later)
# -------------------------
data "aws_lb_target_group" "api" {
  count = var.attach_to_alb ? 1 : 0
  name  = var.alb_target_group_name
}

locals {
  maybe_tg_arn = var.attach_to_alb ? data.aws_lb_target_group.api[0].arn : ""
}

# -------------------------
# Service module
# -------------------------
module "api" {
  source = "../../../modules/ecs-service"

  project      = "virtual-consultant"
  name_prefix  = "vc"
  env          = "prod"
  service_name = "api"

  cluster_arn = data.aws_ecs_cluster.prod.arn
  vpc_id      = local.resolved_vpc_id
  subnet_ids  = data.aws_subnets.private.ids

  execution_role_arn = data.aws_iam_role.exec.arn
  task_role_arn      = data.aws_iam_role.task.arn
  task_role_name = data.aws_iam_role.task.name

  container_image = local.api_image
  container_port  = 8080
  cpu             = 512
  memory          = 1024

  desired_count                    = 1
  enable_execute_command           = true
  health_check_grace_period_seconds = 60

  # Attach to ALB only when it's ready (kept empty initially)
  target_group_arn = local.maybe_tg_arn

  # Logging
  log_group_name = data.aws_cloudwatch_log_group.ecs.name
  aws_region     = "us-east-2"

  # Env + Secrets
  environment = local.env_with_db
  secrets     = local.secrets_map

  allow_read_secret_arns = local.allow_secret_arns
  allow_read_ssm_params  = local.allow_param_names

  # Loki (optional) — set endpoint when you’re ready
  enable_loki   = false
  loki_endpoint = ""
  loki_labels   = {}
}

output "api_service_name" {
  value = module.api.service_name
}

output "api_service_arn" {
  value = module.api.service_arn
}

output "api_sg_id" {
  value = module.api.security_group_id
}
