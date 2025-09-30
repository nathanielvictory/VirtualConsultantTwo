# Allocate one Elastic IP for the NAT Gateway
resource "aws_eip" "nat" {
  domain = "vpc"

  tags = {
    Name    = "vc-prod-nat-eip"
    Project = "virtual-consultant"
    Env     = "prod"
  }
}

# Create the NAT Gateway in the first PROD public subnet
resource "aws_nat_gateway" "prod" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.prod_public_a.id

  tags = {
    Name    = "vc-prod-nat"
    Project = "virtual-consultant"
    Env     = "prod"
  }
}

# Public route table: 0.0.0.0/0 -> IGW
resource "aws_route_table" "prod_public" {
  vpc_id = local.vpc_id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.prod.id
  }

  tags = {
    Name    = "vc-prod-public-rt"
    Project = "virtual-consultant"
    Env     = "prod"
    Tier    = "public"
  }
}

# Associate the public route table to both PROD public subnets
resource "aws_route_table_association" "prod_public_a" {
  subnet_id      = aws_subnet.prod_public_a.id
  route_table_id = aws_route_table.prod_public.id
}

resource "aws_route_table_association" "prod_public_b" {
  subnet_id      = aws_subnet.prod_public_b.id
  route_table_id = aws_route_table.prod_public.id
}

# Private route table: 0.0.0.0/0 -> NAT Gateway
resource "aws_route_table" "prod_private" {
  vpc_id = local.vpc_id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.prod.id
  }

  tags = {
    Name    = "vc-prod-private-rt"
    Project = "virtual-consultant"
    Env     = "prod"
    Tier    = "private"
  }
}

# Associate the private route table to both PROD private subnets
resource "aws_route_table_association" "prod_private_a" {
  subnet_id      = aws_subnet.prod_private_a.id
  route_table_id = aws_route_table.prod_private.id
}

resource "aws_route_table_association" "prod_private_b" {
  subnet_id      = aws_subnet.prod_private_b.id
  route_table_id = aws_route_table.prod_private.id
}
