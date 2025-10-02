data "aws_ecr_repository" "api" {
  name = "virtual-consultant/api"
}

data "aws_ecr_image" "api_latest" {
  repository_name = data.aws_ecr_repository.api.name
  image_tag       = "latest"
}

data "aws_ecr_repository" "worker" {
  name = "virtual-consultant/worker"
}

data "aws_ecr_image" "worker_latest" {
  repository_name = data.aws_ecr_repository.worker.name
  image_tag       = "latest"
}