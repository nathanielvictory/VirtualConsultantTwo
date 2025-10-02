# --- Keep using the VPC's existing Internet Gateway (shared across envs in this VPC) ---
data "aws_internet_gateway" "shared" {
  filter {
    name   = "attachment.vpc-id"
    values = [local.vpc_id]
  }
}

# --- Allocate an EIP for QA NAT ---
resource "aws_eip" "qa_nat_eip" {
  domain = "vpc"
  tags = {
    Name    = "vc-qa-nat-eip"
    Project = "virtual-consultant"
    Env     = "qa"
  }
}

# --- Create a QA-dedicated NAT in a QA public subnet (choose one AZ e.g., A) ---
resource "aws_nat_gateway" "qa_nat" {
  allocation_id = aws_eip.qa_nat_eip.id
  subnet_id     = aws_subnet.qa_public_a.id

  tags = {
    Name    = "vc-qa-nat"
    Project = "virtual-consultant"
    Env     = "qa"
  }
}

# --- QA public route table (0.0.0.0/0 -> IGW) ---
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

resource "aws_route_table_association" "qa_public_a" {
  subnet_id      = aws_subnet.qa_public_a.id
  route_table_id = aws_route_table.qa_public.id
}

resource "aws_route_table_association" "qa_public_b" {
  subnet_id      = aws_subnet.qa_public_b.id
  route_table_id = aws_route_table.qa_public.id
}

# --- QA private route table (0.0.0.0/0 -> QA NAT) ---
resource "aws_route_table" "qa_private" {
  vpc_id = local.vpc_id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.qa_nat.id
  }

  tags = {
    Name    = "vc-qa-private-rt"
    Project = "virtual-consultant"
    Env     = "qa"
    Tier    = "private"
  }
}

resource "aws_route_table_association" "qa_private_a" {
  subnet_id      = aws_subnet.qa_private_a.id
  route_table_id = aws_route_table.qa_private.id
}

resource "aws_route_table_association" "qa_private_b" {
  subnet_id      = aws_subnet.qa_private_b.id
  route_table_id = aws_route_table.qa_private.id
}
