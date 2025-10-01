# Subnet group using the two QA private subnets
resource "aws_db_subnet_group" "qa" {
  name       = "vc-qa-db-subnets"
  subnet_ids = [
    aws_subnet.qa_private_a.id,
    aws_subnet.qa_private_b.id
  ]

  tags = {
    Name    = "vc-qa-db-subnets"
    Project = "virtual-consultant"
    Env     = "qa"
  }
}

# Security group for QA RDS (we'll open ingress from ECS later)
resource "aws_security_group" "rds" {
  name        = "vc-qa-rds-sg"
  description = "QA RDS SG - ingress from ECS added later"
  vpc_id      = local.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "vc-qa-rds-sg"
    Project = "virtual-consultant"
    Env     = "qa"
  }
}

# QA RDS Postgres (managed)
resource "aws_db_instance" "qa" {
  identifier              = "vc-qa-pg"
  engine                  = "postgres"
  engine_version          = "17.6"
  instance_class          = var.db_instance_class

  db_name                 = var.db_name
  username                = var.db_username
  password                = var.db_password

  allocated_storage       = 20
  max_allocated_storage   = 100
  storage_type            = "gp3"

  publicly_accessible     = false
  multi_az                = false

  db_subnet_group_name    = aws_db_subnet_group.qa.name
  vpc_security_group_ids  = [aws_security_group.rds.id]

  backup_retention_period = 7
  deletion_protection     = false
  skip_final_snapshot     = true

  apply_immediately       = true

  tags = {
    Name    = "vc-qa-pg"
    Project = "virtual-consultant"
    Env     = "qa"
  }
}

# Allow the API tasks to connect to Postgres (5432)
resource "aws_security_group_rule" "rds_ingress_from_api" {
  type                     = "ingress"
  security_group_id        = aws_security_group.rds.id
  from_port                = 5432
  to_port                  = 5432
  protocol                 = "tcp"
  source_security_group_id = aws_security_group.api.id
  description              = "API to RDS (QA)"
}

output "rds_endpoint" {
  value = aws_db_instance.qa.address
}

output "rds_username" {
  value = var.db_username
}

output "rds_password" {
  value     = var.db_password
  sensitive = true
}
