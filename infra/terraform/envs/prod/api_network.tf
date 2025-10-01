# Security group for the PROD API tasks
resource "aws_security_group" "api" {
  name        = "vc-prod-api-sg"
  description = "PROD API ECS tasks"
  vpc_id      = local.vpc_id

  # no inbound yet (ALB will reach it later)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "vc-prod-api-sg"
    Project = "virtual-consultant"
    Env     = "prod"
  }
}

# Allow Postgres from API SG -> RDS SG on 5432
# (this assumes your prod RDS SG is aws_security_group.rds from prod/rds.tf)
resource "aws_security_group_rule" "rds_ingress_from_api" {
  type                     = "ingress"
  description              = "API to RDS 5432 (prod)"
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  security_group_id        = aws_security_group.rds.id
  source_security_group_id = aws_security_group.api.id
}
