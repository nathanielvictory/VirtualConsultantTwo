# Separate task role for the worker so we don't grant API extra perms
resource "aws_iam_role" "ecs_task_worker" {
  name               = "vc-qa-ecsTaskRole-worker"
  assume_role_policy = data.aws_iam_policy_document.ecs_tasks_assume.json
  tags = {
    Project = "virtual-consultant"
    Env     = "qa"
    Role    = "worker"
  }
}

# Inline policy: Bedrock invoke + S3 scoped to your bucket/prefix
data "aws_iam_policy_document" "worker_policy_doc" {
  statement {
    sid     = "BedrockInvoke"
    actions = [
      "bedrock:InvokeModel",
      "bedrock:InvokeModelWithResponseStream"
    ]
    resources = ["*"] # Narrow to specific models ARNs later if you know them
  }

  statement {
    sid     = "S3AccessLimited"
    actions = [
      "s3:PutObject",
      "s3:GetObject",
      "s3:DeleteObject",
      "s3:ListBucket"
    ]
    resources = [
      "arn:aws:s3:::misc-webapp",
      "arn:aws:s3:::misc-webapp/virtual-consultant-two-dev/*"
    ]
  }
}

resource "aws_iam_policy" "worker_policy" {
  name   = "vc-qa-worker-policy"
  policy = data.aws_iam_policy_document.worker_policy_doc.json
}

resource "aws_iam_role_policy_attachment" "worker_attach" {
  role       = aws_iam_role.ecs_task_worker.name
  policy_arn = aws_iam_policy.worker_policy.arn
}
