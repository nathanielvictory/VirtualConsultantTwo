locals {
  base_tags = {
    Project = var.project
    Env     = var.env
  }
  tags = merge(local.base_tags, var.extra_tags)
  name = "${var.name_prefix}-${var.env}"
}

# ----------------------
# Security Group (no ingress; consumers will add rules)
# ----------------------
resource "aws_security_group" "rds" {
  name        = "${local.name}-rds-sg"
  description = "RDS SG - ingress managed by consumers"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.tags, {
    Name = "${local.name}-rds-sg"
  })
}

# ----------------------
# Subnet group
# ----------------------
resource "aws_db_subnet_group" "this" {
  name       = "${local.name}-db-subnets"
  subnet_ids = var.private_subnet_ids

  tags = merge(local.tags, {
    Name = "${local.name}-db-subnets"
  })
}

# ----------------------
# DB instance
# ----------------------
resource "aws_db_instance" "this" {
  identifier              = "${local.name}-pg"
  engine                  = var.engine
  engine_version          = var.engine_version
  instance_class          = var.instance_class

  db_name                 = var.db_name
  username                = var.username
  password                = var.password

  allocated_storage       = var.allocated_storage
  max_allocated_storage   = var.max_allocated_storage
  storage_type            = var.storage_type

  publicly_accessible     = var.publicly_accessible
  multi_az                = var.multi_az

  db_subnet_group_name    = aws_db_subnet_group.this.name
  vpc_security_group_ids  = [aws_security_group.rds.id]

  backup_retention_period = var.backup_retention_days
  deletion_protection     = var.deletion_protection
  skip_final_snapshot     = var.skip_final_snapshot

  apply_immediately       = var.apply_immediately

  tags = merge(local.tags, {
    Name = "${local.name}-pg"
  })
}

# ----------------------
# Secrets Manager: JSON { username, password }
# ----------------------
locals {
  resolved_secret_name = var.db_secret_name != "" ? var.db_secret_name : "/app/${var.env}/db/credentials"
}

resource "aws_secretsmanager_secret" "db" {
  count = var.publish_secrets ? 1 : 0

  name = local.resolved_secret_name

  tags = merge(local.tags, {
    Name = local.resolved_secret_name
  })
}

resource "aws_secretsmanager_secret_version" "db" {
  count = var.publish_secrets ? 1 : 0

  secret_id     = aws_secretsmanager_secret.db[0].id
  secret_string = jsonencode({
    username = var.username
    password = var.password
  })
}

# ----------------------
# SSM Parameters for endpoint + db name
# ----------------------
locals {
  endpoint_param = var.db_endpoint_param != "" ? var.db_endpoint_param : "/app/${var.env}/db/endpoint"
  dbname_param   = var.db_name_param    != "" ? var.db_name_param    : "/app/${var.env}/db/name"
}

resource "aws_ssm_parameter" "db_endpoint" {
  count       = var.publish_ssm ? 1 : 0
  name        = local.endpoint_param
  type        = "String"
  value       = aws_db_instance.this.address
  description = "DB endpoint for ${local.name}"

  tags = local.tags
}

resource "aws_ssm_parameter" "db_name" {
  count       = var.publish_ssm ? 1 : 0
  name        = local.dbname_param
  type        = "String"
  value       = var.db_name
  description = "DB name for ${local.name}"

  tags = local.tags
}