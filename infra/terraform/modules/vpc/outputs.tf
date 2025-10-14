output "vpc_id" {
  value       = var.vpc_id
  description = "VPC ID where resources were created"
}

output "internet_gateway_id" {
  value       = data.aws_internet_gateway.shared.id
  description = "Existing IGW attached to the VPC"
}

output "public_subnet_ids" {
  value       = [aws_subnet.public_a.id, aws_subnet.public_b.id]
  description = "Public subnet IDs (A,B)"
}

output "private_subnet_ids" {
  value       = [aws_subnet.private_a.id, aws_subnet.private_b.id]
  description = "Private subnet IDs (A,B)"
}

output "public_route_table_id" {
  value       = aws_route_table.public.id
  description = "Public route table ID"
}

output "private_route_table_id" {
  value       = aws_route_table.private.id
  description = "Private route table ID"
}

output "nat_gateway_id" {
  value       = aws_nat_gateway.nat.id
  description = "NAT Gateway ID (single-AZ pattern)"
}

output "nat_eip_id" {
  value       = aws_eip.nat.id
  description = "NAT EIP ID"
}
