resource "aws_vpc_ipv4_cidr_block_association" "secondary" {
  vpc_id     = var.vpc_id
  cidr_block = var.secondary_cidr
}

output "associated_cidr" {
  value = aws_vpc_ipv4_cidr_block_association.secondary.cidr_block
}
