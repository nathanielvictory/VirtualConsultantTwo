output "db_identifier"   { value = aws_db_instance.this.id }
output "db_arn"          { value = aws_db_instance.this.arn }
output "db_endpoint"     { value = aws_db_instance.this.address }
output "db_port"         { value = aws_db_instance.this.port }
output "db_name"         { value = var.db_name }
output "db_username"     { value = var.username }
output "db_subnet_group" { value = aws_db_subnet_group.this.name }
output "rds_sg_id"       { value = aws_security_group.rds.id }

output "db_secret_arn" {
  value       = try(aws_secretsmanager_secret.db[0].arn, null)
  description = "Secrets Manager secret ARN with {username,password}"
}

output "db_endpoint_param_name" {
  value       = try(aws_ssm_parameter.db_endpoint[0].name, null)
  description = "SSM parameter name for DB endpoint"
}

output "db_name_param_name" {
  value       = try(aws_ssm_parameter.db_name[0].name, null)
  description = "SSM parameter name for DB name"
}