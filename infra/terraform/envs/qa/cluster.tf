resource "aws_ecs_cluster" "qa" {
  name = "vc-qa-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Project = "virtual-consultant"
    Env     = "qa"
  }
}

resource "aws_ecs_cluster_capacity_providers" "qa" {
  cluster_name = aws_ecs_cluster.qa.name

  capacity_providers = [
    "FARGATE",
    "FARGATE_SPOT"
  ]

  default_capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 1
    base              = 0
  }
}

resource "aws_cloudwatch_log_group" "ecs" {
  name              = "/ecs/virtual-consultant/qa"
  retention_in_days = 30

  tags = {
    Project = "virtual-consultant"
    Env     = "qa"
  }
}

output "ecs_cluster_name" {
  value = aws_ecs_cluster.qa.name
}

output "ecs_cluster_arn" {
  value = aws_ecs_cluster.qa.arn
}

output "ecs_logs_group" {
  value = aws_cloudwatch_log_group.ecs.name
}
