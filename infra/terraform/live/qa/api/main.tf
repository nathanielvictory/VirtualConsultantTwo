# -------------------------
# Lookups for existing bits
# -------------------------
# VPC + subnets created by the network stack (by tags)
variable "vpc_id" {
  type    = string
  default = "vpc-04933b4be81a4dc22"
}

data "aws_subnets" "private" {
  filter { 
    name = "vpc-id"
    values = [var.vpc_id] 
  }

  tags = {
    Env  = "qa"
    Tier = "private"
  }
}

# Cluster created by the cluster stack
data "aws_ecs_cluster" "qa" {
  cluster_name = "vc-qa-cluster"
}

# IAM roles you already created in QA
data "aws_iam_role" "exec" {
  name = "vc-qa-ecsTaskExecutionRole"
}

data "aws_iam_role" "task" {
  name = "vc-qa-ecsTaskRole"
}

# CloudWatch Logs group created in the cluster stack
data "aws_cloudwatch_log_group" "ecs" {
  name = "/ecs/virtual-consultant/qa"
}

# ALB target group created by your ALB stack
data "aws_lb_target_group" "api" {
  name = "vc-qa-api-tg"
}

# ECR image (keep your digest-pinned approach)
data "aws_ecr_repository" "api" {
  name = "virtual-consultant/api"
}
data "aws_ecr_image" "api_latest" {
  repository_name = data.aws_ecr_repository.api.name
  image_tag       = "latest"
}
locals {
  api_image = "${data.aws_ecr_repository.api.repository_url}@${data.aws_ecr_image.api_latest.image_digest}"
}

# -------------------------
# (Temporary) DB connection
# We’ll move these to Secrets/SSM in the next phase.
# -------------------------
data "aws_db_instance" "qa" {
  db_instance_identifier = "vc-qa-pg"
}

variable "db_name" {
  type    = string
  default = "consultant_db"
}
variable "db_username" {
  type    = string
  default = "consultant_user"
}
variable "db_password" {
  type      = string
  default   = "consultant_pass"
  sensitive = true
}

locals {
  connection_string = "Host=${data.aws_db_instance.qa.address};Database=${var.db_name};Username=${var.db_username};Password=${var.db_password}"
}

# -------------------------
# Service module call
# -------------------------
module "api" {
  source = "../../../modules/ecs-service"

  project     = "virtual-consultant"
  name_prefix = "vc"
  env         = "qa"
  service_name = "api"

  cluster_arn = data.aws_ecs_cluster.qa.arn
  vpc_id      = var.vpc_id
  subnet_ids  = data.aws_subnets.private.ids

  execution_role_arn = data.aws_iam_role.exec.arn
  task_role_arn      = data.aws_iam_role.task.arn

  container_image = local.api_image
  container_port  = 8080
  cpu             = 512
  memory          = 1024

  desired_count   = 1
  enable_execute_command = true
  health_check_grace_period_seconds = 60

  # Attach to existing ALB
  target_group_arn = data.aws_lb_target_group.api.arn

  # Logging
  log_group_name = data.aws_cloudwatch_log_group.ecs.name
  aws_region     = "us-east-2"

  # Env (exactly like current taskdef)
  environment = {
    "ConnectionStrings__DefaultConnection" = local.connection_string
    "ASPNETCORE_ENVIRONMENT"               = "Development"
    "RabbitMq__HostName"                   = "rabbit.vc-qa.internal"
    "PORT"                                  = "8080"
  }

  # No secrets yet; next phase we’ll switch DB creds to Secrets Manager
  secrets = {}
}

output "api_service_name" { value = module.api.service_name }
output "api_service_arn"  { value = module.api.service_arn }
output "api_sg_id"        { value = module.api.security_group_id }
