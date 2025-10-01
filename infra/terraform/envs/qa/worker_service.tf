resource "aws_ecs_service" "worker" {
  name            = "vc-qa-worker"
  cluster         = aws_ecs_cluster.qa.id
  task_definition = aws_ecs_task_definition.worker.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.qa_private_a.id, aws_subnet.qa_private_b.id]
    security_groups  = [aws_security_group.worker.id]
    assign_public_ip = false
  }

  enable_execute_command = true

  tags = {
    Project = "virtual-consultant"
    Env     = "qa"
  }
}
