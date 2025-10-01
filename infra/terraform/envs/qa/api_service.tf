resource "aws_ecs_service" "api" {
  name            = "vc-qa-api"
  cluster         = aws_ecs_cluster.qa.id
  task_definition = aws_ecs_task_definition.api.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.qa_private_a.id, aws_subnet.qa_private_b.id]
    security_groups  = [aws_security_group.api.id]
    assign_public_ip = false
  }

  # NEW: wire to the ALB target group
  load_balancer {
    target_group_arn = aws_lb_target_group.api.arn
    container_name   = "api"
    container_port   = var.container_port
  }
  
  health_check_grace_period_seconds = 60
  
  deployment_controller {
    type = "ECS"
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  enable_execute_command = true

  depends_on = [
    aws_lb_listener.http,
    aws_security_group_rule.api_ingress_from_alb
  ]

  tags = {
    Project = "virtual-consultant"
    Env     = "qa"
  }
}
