﻿output "namespace_id"  { value = aws_service_discovery_private_dns_namespace.this.id }
output "namespace_arn" { value = aws_service_discovery_private_dns_namespace.this.arn }
output "dns_name"      { value = aws_service_discovery_private_dns_namespace.this.name }
