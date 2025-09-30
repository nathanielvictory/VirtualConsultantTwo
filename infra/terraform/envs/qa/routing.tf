# Find the Internet Gateway attached to the shared VPC
data "aws_internet_gateway" "shared" {
  filter {
    name   = "attachment.vpc-id"
    values = [local.vpc_id]
  }
}

# Find the existing NAT Gateway created in prod (reused to save cost)
data "aws_nat_gateway" "prod_nat" {
  filter {
    name   = "tag:Name"
    values = ["vc-prod-nat"]
  }

  filter {
    name   = "state"
    values = ["available"]
  }

  filter {
    name   = "vpc-id"
    values = [local.vpc_id]
  }
}

# QA public route table: 0.0.0.0/0 -> IGW
resource "aws_route_table" "qa_public" {
  vpc_id = local.vpc_id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = data.aws_internet_gateway.shared.id
  }

  tags = {
    Name    = "vc-qa-public-rt"
    Project = "virtual-consultant"
    Env     = "qa"
    Tier    = "public"
  }
}

# Associate QA public route table to QA public subnets
resource "aws_route_table_association" "qa_public_a" {
  subnet_id      = aws_subnet.qa_public_a.id
  route_table_id = aws_route_table.qa_public.id
}

resource "aws_route_table_association" "qa_public_b" {
  subnet_id      = aws_subnet.qa_public_b.id
  route_table_id = aws_route_table.qa_public.id
}

# QA private route table: 0.0.0.0/0 -> prod NAT
resource "aws_route_table" "qa_private" {
  vpc_id = local.vpc_id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = data.aws_nat_gateway.prod_nat.id
  }

  tags = {
    Name    = "vc-qa-private-rt"
    Project = "virtual-consultant"
    Env     = "qa"
    Tier    = "private"
  }
}

# Associate QA private route table to QA private subnets
resource "aws_route_table_association" "qa_private_a" {
  subnet_id      = aws_subnet.qa_private_a.id
  route_table_id = aws_route_table.qa_private.id
}

resource "aws_route_table_association" "qa_private_b" {
  subnet_id      = aws_subnet.qa_private_b.id
  route_table_id = aws_route_table.qa_private.id
}
