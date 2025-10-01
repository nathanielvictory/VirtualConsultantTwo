data "aws_ecr_repository" "api" {
  name = "virtual-consultant/api"
}

data "aws_ecr_repository" "worker" {
  name = "virtual-consultant/worker"
}