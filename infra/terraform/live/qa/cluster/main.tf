module "ecs_cluster" {
  source = "../../../modules/ecs-cluster"

  project                  = "virtual-consultant"
  name_prefix              = "vc"
  env                      = "qa"

  enable_container_insights = true
  log_group_name            = "/ecs/virtual-consultant/qa"
  log_retention_days        = 30

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]
  default_capacity_provider = {
    capacity_provider = "FARGATE"
    weight            = 1
    base              = 0
  }
}

output "ecs_cluster_name" {
  value = module.ecs_cluster.cluster_name
}

output "ecs_cluster_arn" {
  value = module.ecs_cluster.cluster_arn
}

output "ecs_logs_group" {
  value = module.ecs_cluster.log_group_name
}
