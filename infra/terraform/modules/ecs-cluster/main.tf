locals {
  base_tags = {
    Project = var.project
    Env     = var.env
  }
  tags = merge(local.base_tags, var.extra_tags)

  name          = "${var.name_prefix}-${var.env}-cluster"
  resolved_lg   = var.log_group_name != "" ? var.log_group_name : "/ecs/${var.project}/${var.env}"
  insights_flag = var.enable_container_insights ? "enabled" : "disabled"
}

resource "aws_ecs_cluster" "this" {
  name = local.name

  setting {
    name  = "containerInsights"
    value = local.insights_flag
  }

  tags = local.tags
}

resource "aws_ecs_cluster_capacity_providers" "this" {
  cluster_name = aws_ecs_cluster.this.name

  capacity_providers = var.capacity_providers

  default_capacity_provider_strategy {
    capacity_provider = var.default_capacity_provider.capacity_provider
    weight            = var.default_capacity_provider.weight
    base              = var.default_capacity_provider.base
  }
}

resource "aws_cloudwatch_log_group" "ecs" {
  name              = local.resolved_lg
  retention_in_days = var.log_retention_days

  tags = local.tags
}
