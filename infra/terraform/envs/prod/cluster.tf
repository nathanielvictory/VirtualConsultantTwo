# Minimal ECS cluster ready for Fargate/Fargate Spot tasks
resource "aws_ecs_cluster" "prod" {
  name = "vc-prod-cluster"

  # optional but nice: container insights (basic metrics in CW)
  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Project = "virtual-consultant"
    Env     = "prod"
  }
}

# Enable FARGATE + FARGATE_SPOT capacity providers for this cluster
resource "aws_ecs_cluster_capacity_providers" "prod" {
  cluster_name = aws_ecs_cluster.prod.name

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
    base              = 0
  }
}

# (Optional) a log group prefix for ECS tasks to use later
resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/virtual-consultant/prod"
  retention_in_days = 30

  tags = {
    Project = "virtual-consultant"
    Env     = "prod"
  }
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.prod.name
}

output "ecs_cluster_arn" {
  value = aws_ecs_cluster.prod.arn
}

output "ecs_logs_group" {
  value = aws_cloudwatch_log_group.ecs.name
}
