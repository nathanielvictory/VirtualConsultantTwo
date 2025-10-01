# Execution role (pull from ECR, write logs)
resource "aws_iam_role" "ecs_task_execution" {
  name               = "vc-prod-ecsTaskExecutionRole"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_assume.json
}

data "aws_iam_policy_document" "ecs_tasks_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Task role (app permissions; empty for now)
resource "aws_iam_role" "ecs_task" {
  name               = "vc-prod-ecsTaskRole"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_assume.json
}
