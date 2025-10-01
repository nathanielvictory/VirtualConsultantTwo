# Keep last 20 images per repo to control storage costs
locals {
  lifecycle_policy = jsonencode({
    rules = [
      {
        rulePriority = 1,
        description  = "Expire images beyond 20 most recent",
        selection = {
          tagStatus     = "any",
          countType     = "imageCountMoreThan",
          countNumber   = 20
        },
        action = { type = "expire" }
      }
    ]
  })
}

resource "aws_ecr_repository" "api" {
  name                 = "virtual-consultant/api"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Component = "api"
  }
}

resource "aws_ecr_lifecycle_policy" "api" {
  repository = aws_ecr_repository.api.name
  policy     = local.lifecycle_policy
}

resource "aws_ecr_repository" "worker" {
  name                 = "virtual-consultant/worker"
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  encryption_configuration {
    encryption_type = "AES256"
  }

  tags = {
    Component = "worker"
  }
}

resource "aws_ecr_lifecycle_policy" "worker" {
  repository = aws_ecr_repository.worker.name
  policy     = local.lifecycle_policy
}

output "api_repo_url" {
  value = aws_ecr_repository.api.repository_url
}

output "worker_repo_url" {
  value = aws_ecr_repository.worker.repository_url
}
