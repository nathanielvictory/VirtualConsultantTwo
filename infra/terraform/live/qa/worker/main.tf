# -------------------------
# Lookups (cluster, roles, subnets, logs, ECR)
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

data "aws_iam_role" "task_worker" {
  name = "vc-qa-ecsTaskRole-worker"
}

data "aws_cloudwatch_log_group" "ecs" {
  name = "/ecs/virtual-consultant/qa"
}

data "aws_ecr_repository" "worker" {
  name = "virtual-consultant/worker"
}

data "aws_ecr_image" "worker_latest" {
  repository_name = data.aws_ecr_repository.worker.name
  image_tag       = "latest"
}

locals {
  worker_image = "${data.aws_ecr_repository.worker.repository_url}@${data.aws_ecr_image.worker_latest.image_digest}"
}

# -------------------------
# Service (no ALB)
# -------------------------
module "worker" {
  source = "../../../modules/ecs-service"

  project      = "virtual-consultant"
  name_prefix  = "vc"
  env          = "qa"
  service_name = "worker"

  cluster_arn = data.aws_ecs_cluster.qa.arn
  vpc_id      = var.vpc_id
  subnet_ids  = data.aws_subnets.private.ids

  execution_role_arn = data.aws_iam_role.exec.arn
  task_role_arn      = data.aws_iam_role.task_worker.arn

  container_image = local.worker_image
  cpu             = 256
  memory          = 1024
  container_port  = 8080 # not exposed; harmless to keep default

  desired_count   = 1
  enable_execute_command = true

  # Logging → CloudWatch (same as current)
  log_group_name = data.aws_cloudwatch_log_group.ecs.name
  aws_region     = "us-east-2"

  # Env: copied from your current worker taskdef
  environment = {
    AWS_REGION            = "us-east-2"

    AWS_S3_BUCKET         = "misc-webapp"
    AWS_FILE_PREFIX       = "virtual-consultant-two-dev"

    REPORTING_URL         = "https://reporting.victorymodeling.com/api/"
    REPORTING_USERNAME    = "nathaniel@victorymodeling.com"
    REPORTING_PASSWORD    = "changedpassword"

    CONSULTANT_URL        = "https://api.qa.virtualconsultant.victorymodeling.com/api"
    CONSULTANT_USERNAME   = "nathaniel@victorymodeling.com"
    CONSULTANT_PASSWORD   = "changedpassword"

    RabbitMq__HostName    = "rabbit.vc-qa.internal"
    RabbitMq__Port        = "5672"
    RabbitMq__VirtualHost = "/"
    RabbitMq__UserName    = "consultant"
    RabbitMq__Password    = "consultant_pass"
  }
}

output "worker_service_name" {
  value = module.worker.service_name
}

output "worker_service_arn" {
  value = module.worker.service_arn
}

output "worker_sg_id" {
  value = module.worker.security_group_id
}
