# Security group used by the API tasks
resource "aws_security_group" "api" {
  name        = "vc-qa-api-sg"
  description = "QA API ECS tasks"
  vpc_id      = local.vpc_id

  # no inbound here (behind ALB later)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "vc-qa-api-sg"
    Project = "virtual-consultant"
    Env     = "qa"
  }
}
