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

variable "worker_image_tag" {
  type        = string
  default     = "latest"
  description = "ECR image tag for the worker"
}

# -------------------------
# Resolve VPC and private subnets (Env=prod, Tier=private)
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
# Cluster, roles, logs (must exist from prod/cluster and prod IAM)
# -------------------------
data "aws_ecs_cluster" "prod" {
  cluster_name = "vc-prod-cluster"
}

data "aws_iam_role" "exec" {
  name = "vc-prod-ecsTaskExecutionRole"
}

data "aws_iam_role" "task_worker" {
  name = "vc-prod-ecsTaskRole-worker"
}

data "aws_cloudwatch_log_group" "ecs" {
  name = "/ecs/virtual-consultant/prod"
}

# -------------------------
# Worker image (pin to digest)
# -------------------------
data "aws_ecr_repository" "worker" {
  name = "virtual-consultant/worker"
}

data "aws_ecr_image" "worker_image" {
  repository_name = data.aws_ecr_repository.worker.name
  image_tag       = var.worker_image_tag
}

locals {
  worker_image = "${data.aws_ecr_repository.worker.repository_url}@${data.aws_ecr_image.worker_image.image_digest}"
}

# -------------------------
# Service (no ALB)
# -------------------------
module "worker" {
  source = "../../../modules/ecs-service"

  project      = "virtual-consultant"
  name_prefix  = "vc"
  env          = "prod"
  service_name = "worker"

  cluster_arn = data.aws_ecs_cluster.prod.arn
  vpc_id      = local.resolved_vpc_id
  subnet_ids  = data.aws_subnets.private.ids

  execution_role_arn = data.aws_iam_role.exec.arn
  task_role_arn      = data.aws_iam_role.task_worker.arn

  container_image = local.worker_image
  cpu             = 256
  memory          = 1024
  container_port  = 8080  # not exposed; harmless

  desired_count            = 1
  enable_execute_command   = true

  # Logging → CloudWatch for now (Loki can be enabled later)
  log_group_name = data.aws_cloudwatch_log_group.ecs.name
  aws_region     = "us-east-2"

  # Environment (mirrors QA but with prod API/namespace)
  environment = {
    AWS_REGION            = "us-east-2"

    AWS_S3_BUCKET         = "misc-webapp"
    AWS_FILE_PREFIX       = "virtual-consultant-two-dev"

    REPORTING_URL         = "https://reporting.victorymodeling.com/api/"
    REPORTING_USERNAME    = "nathaniel@victorymodeling.com"
    REPORTING_PASSWORD    = "changedpassword"

    CONSULTANT_URL        = "https://api.virtualconsultant.victorymodeling.com/api"
    CONSULTANT_USERNAME   = "nathaniel@victorymodeling.com"
    CONSULTANT_PASSWORD   = "changedpassword"

    RabbitMq__HostName    = "rabbit.vc-prod.internal"
    RabbitMq__Port        = "5672"
    RabbitMq__VirtualHost = "/"
    RabbitMq__UserName    = "consultant"
    RabbitMq__Password    = "consultant_pass"
  }

  # To move the above credentials to Secrets later, set `secrets = {...}`
  # and grant access via `allow_read_secret_arns` / `allow_read_ssm_params`.
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
