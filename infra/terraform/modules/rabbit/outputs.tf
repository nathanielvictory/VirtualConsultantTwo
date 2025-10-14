output "service_name"     { value = aws_ecs_service.this.name }
output "service_arn"      { value = aws_ecs_service.this.arn }
output "security_group_id"{ value = aws_security_group.rabbit.id }
output "dns_service_arn"  { value = aws_service_discovery_service.this.arn }
