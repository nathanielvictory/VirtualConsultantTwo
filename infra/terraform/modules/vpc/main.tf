locals {
  base_tags = {
    Project = var.project
    Env     = var.env
  }
  tags = merge(local.base_tags, var.extra_tags)
  name = "${var.name_prefix}-${var.env}"
}

# Use the existing IGW attached to the given VPC (matches your current pattern)
data "aws_internet_gateway" "shared" {
  filter {
    name   = "attachment.vpc-id"
    values = [var.vpc_id]
  }
}

# --------------------
# Subnets (public)
# --------------------
resource "aws_subnet" "public_a" {
  vpc_id                  = var.vpc_id
  availability_zone       = var.az_a
  cidr_block              = var.public_a_cidr
  map_public_ip_on_launch = true

  tags = merge(local.tags, {
    Name = "${local.name}-public-a"
    Tier = "public"
  })
}

resource "aws_subnet" "public_b" {
  vpc_id                  = var.vpc_id
  availability_zone       = var.az_b
  cidr_block              = var.public_b_cidr
  map_public_ip_on_launch = true

  tags = merge(local.tags, {
    Name = "${local.name}-public-b"
    Tier = "public"
  })
}

# --------------------
# Subnets (private)
# --------------------
resource "aws_subnet" "private_a" {
  vpc_id            = var.vpc_id
  availability_zone = var.az_a
  cidr_block        = var.private_a_cidr

  tags = merge(local.tags, {
    Name = "${local.name}-private-a"
    Tier = "private"
  })
}

resource "aws_subnet" "private_b" {
  vpc_id            = var.vpc_id
  availability_zone = var.az_b
  cidr_block        = var.private_b_cidr

  tags = merge(local.tags, {
    Name = "${local.name}-private-b"
    Tier = "private"
  })
}

# --------------------
# NAT (one-AZ model, same as your QA)
# --------------------
resource "aws_eip" "nat" {
  domain = "vpc"
  tags = merge(local.tags, {
    Name = "${local.name}-nat-eip"
  })
}

resource "aws_nat_gateway" "nat" {
  allocation_id = aws_eip.nat.id
  subnet_id     = aws_subnet.public_a.id

  tags = merge(local.tags, {
    Name = "${local.name}-nat"
  })
}

# --------------------
# Route tables
# --------------------
resource "aws_route_table" "public" {
  vpc_id = var.vpc_id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = data.aws_internet_gateway.shared.id
  }

  tags = merge(local.tags, {
    Name = "${local.name}-public-rt"
    Tier = "public"
  })
}

resource "aws_route_table_association" "public_a" {
  subnet_id      = aws_subnet.public_a.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table_association" "public_b" {
  subnet_id      = aws_subnet.public_b.id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table" "private" {
  vpc_id = var.vpc_id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.nat.id
  }

  tags = merge(local.tags, {
    Name = "${local.name}-private-rt"
    Tier = "private"
  })
}

resource "aws_route_table_association" "private_a" {
  subnet_id      = aws_subnet.private_a.id
  route_table_id = aws_route_table.private.id
}

resource "aws_route_table_association" "private_b" {
  subnet_id      = aws_subnet.private_b.id
  route_table_id = aws_route_table.private.id
}
