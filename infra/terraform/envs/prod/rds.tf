# Use the two prod private subnets for the DB subnet group
resource "aws_db_subnet_group" "prod" {
  name       = "vc-prod-db-subnets"
  subnet_ids = [
    aws_subnet.prod_private_a.id,
    aws_subnet.prod_private_b.id
  ]

  tags = {
    Name    = "vc-prod-db-subnets"
    Project = "virtual-consultant"
    Env     = "prod"
  }
}

# Security group for RDS (no inbound yet; we'll allow ECS later)
resource "aws_security_group" "rds" {
  name        = "vc-prod-rds-sg"
  description = "RDS SG - inbound opened later for ECS"
  vpc_id      = local.vpc_id

  # no ingress rules yet (locked down)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "vc-prod-rds-sg"
    Project = "virtual-consultant"
    Env     = "prod"
  }
}

# Generate a password (we'll move to Secrets Manager later)
resource "random_password" "db" {
  length  = 24
  special = true
}

# RDS Postgres 17, single-AZ, private
resource "aws_db_instance" "prod" {
  identifier              = "vc-prod-pg"
  engine                  = "postgres"
  engine_version          = "17.0"
  instance_class          = var.db_instance_class

  db_name                 = var.db_name
  username                = var.db_username
  password                = random_password.db.result

  allocated_storage       = 20
  max_allocated_storage   = 100
  storage_type            = "gp3"

  publicly_accessible     = false
  multi_az                = false

  db_subnet_group_name    = aws_db_subnet_group.prod.name
  vpc_security_group_ids  = [aws_security_group.rds.id]

  backup_retention_period = 7
  deletion_protection     = false
  skip_final_snapshot     = true

  apply_immediately       = true

  tags = {
    Name    = "vc-prod-pg"
    Project = "virtual-consultant"
    Env     = "prod"
  }
}

# Helpful outputs (password marked sensitive)
output "rds_endpoint" {
  value = aws_db_instance.prod.address
}

output "rds_username" {
  value = var.db_username
}

output "rds_password" {
  value     = var.db_password
  sensitive = true
}
