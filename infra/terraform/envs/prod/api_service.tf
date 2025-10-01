resource "aws_ecs_service" "api" {
  name            = "vc-prod-api"
  cluster         = aws_ecs_cluster.prod.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.prod_private_a.id, aws_subnet.prod_private_b.id]
    security_groups  = [aws_security_group.api.id]  # from api_network.tf
    assign_public_ip = false
  }

  # Wire service to ALB target group defined in api_alb_service.tf
  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = var.container_port
  }

  deployment_controller {
    type = "ECS"
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  # Give the ALB health check a moment before judging the task
  health_check_grace_period_seconds = 60

  enable_execute_command = true

  # We control rollouts by updating the task def image tag
  lifecycle {
    ignore_changes = [task_definition]
  }

  depends_on = [
    aws_lb_listener.http,
    aws_security_group_rule.api_ingress_from_alb
  ]

  tags = {
    Project = "virtual-consultant"
    Env     = "prod"
  }
}
