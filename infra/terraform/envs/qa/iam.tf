# Execution role: lets ECS pull images & write logs
resource "aws_iam_role" "ecs_task_execution" {
  name               = "vc-qa-ecsTaskExecutionRole"
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

# Attach AWS-managed policy (pull from ECR, push to CW logs)
resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Task role: what your app can do at runtime (empty for now; we’ll add perms later if needed)
resource "aws_iam_role" "ecs_task" {
  name               = "vc-qa-ecsTaskRole"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_assume.json
}
