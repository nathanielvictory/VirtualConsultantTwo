# --------
# Inputs
# --------
variable "s3_bucket" {
  type        = string
  default     = "misc-webapp"
  description = "Bucket the worker writes/reads"
}

variable "s3_prefix" {
  type        = string
  default     = "virtual-consultant-two-dev"
  description = "Prefix inside the bucket for worker objects"
}

# Optional: restrict Bedrock to specific model ARNs; leave empty for all
variable "bedrock_model_arns" {
  type        = list(string)
  default     = []
  description = "If set, restrict bedrock Invoke* to these ARNs"
}

# --------
# Assume-role policy for ECS tasks
# --------
data "aws_iam_policy_document" "ecs_tasks_assume" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

# --------
# Execution role (pull images, write logs)
# --------
resource "aws_iam_role" "ecs_task_execution" {
  name               = "vc-prod-ecsTaskExecutionRole"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_assume.json
}

resource "aws_iam_role_policy_attachment" "execution_managed" {
  role       = aws_iam_role.ecs_task_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# --------
# Task roles (app runtime permissions)
# --------
resource "aws_iam_role" "ecs_task" {
  name               = "vc-prod-ecsTaskRole"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_assume.json

  tags = {
    Role = "api"
  }
}

resource "aws_iam_role" "ecs_task_worker" {
  name               = "vc-prod-ecsTaskRole-worker"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_assume.json

  tags = {
    Role = "worker"
  }
}

# --------
# Worker inline policy (Bedrock + scoped S3)
# --------
data "aws_iam_policy_document" "worker_doc" {
  # Bedrock Invoke
  statement {
    sid = "BedrockInvoke"

    actions = [
      "bedrock:InvokeModel",
      "bedrock:InvokeModelWithResponseStream"
    ]

    resources = length(var.bedrock_model_arns) > 0 ? var.bedrock_model_arns : ["*"]
  }

  # S3 limited access
  statement {
    sid = "S3AccessLimited"

    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:DeleteObject",
      "s3:ListBucket"
    ]

    resources = [
      "arn:aws:s3:::${var.s3_bucket}",
      "arn:aws:s3:::${var.s3_bucket}/${var.s3_prefix}/*"
    ]
  }
}

resource "aws_iam_policy" "worker_policy" {
  name   = "vc-prod-worker-policy"
  policy = data.aws_iam_policy_document.worker_doc.json
}

resource "aws_iam_role_policy_attachment" "worker_attach" {
  role       = aws_iam_role.ecs_task_worker.name
  policy_arn = aws_iam_policy.worker_policy.arn
}

# --------
# Outputs
# --------
output "execution_role_name" {
  value = aws_iam_role.ecs_task_execution.name
}

output "task_role_name_api" {
  value = aws_iam_role.ecs_task.name
}

output "task_role_name_worker" {
  value = aws_iam_role.ecs_task_worker.name
}

output "execution_role_arn" {
  value = aws_iam_role.ecs_task_execution.arn
}

output "task_role_arn_api" {
  value = aws_iam_role.ecs_task.arn
}

output "task_role_arn_worker" {
  value = aws_iam_role.ecs_task_worker.arn
}
