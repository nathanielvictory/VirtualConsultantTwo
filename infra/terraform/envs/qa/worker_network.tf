resource "aws_security_group" "worker" {
  name        = "vc-qa-worker-sg"
  description = "QA worker ECS tasks"
  vpc_id      = local.vpc_id

  # no inbound needed; it’s not exposed
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "vc-qa-worker-sg"
    Project = "virtual-consultant"
    Env     = "qa"
  }
}
