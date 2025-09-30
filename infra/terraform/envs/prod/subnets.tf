resource "aws_subnet" "prod_public_a" {
  vpc_id                  = local.vpc_id
  availability_zone       = var.az_a
  cidr_block              = var.prod_public_a_cidr
  map_public_ip_on_launch = true

  tags = {
    Name    = "vc-prod-public-a"
    Project = "virtual-consultant"
    Env     = "prod"
    Tier    = "public"
  }
}

resource "aws_subnet" "prod_public_b" {
  vpc_id                  = local.vpc_id
  availability_zone       = var.az_b
  cidr_block              = var.prod_public_b_cidr
  map_public_ip_on_launch = true

  tags = {
    Name    = "vc-prod-public-b"
    Project = "virtual-consultant"
    Env     = "prod"
    Tier    = "public"
  }
}

resource "aws_subnet" "prod_private_a" {
  vpc_id            = local.vpc_id
  availability_zone = var.az_a
  cidr_block        = var.prod_private_a_cidr

  tags = {
    Name    = "vc-prod-private-a"
    Project = "virtual-consultant"
    Env     = "prod"
    Tier    = "private"
  }
}

resource "aws_subnet" "prod_private_b" {
  vpc_id            = local.vpc_id
  availability_zone = var.az_b
  cidr_block        = var.prod_private_b_cidr

  tags = {
    Name    = "vc-prod-private-b"
    Project = "virtual-consultant"
    Env     = "prod"
    Tier    = "private"
  }
}

output "prod_public_subnet_ids" {
  value = [aws_subnet.prod_public_a.id, aws_subnet.prod_public_b.id]
}

output "prod_private_subnet_ids" {
  value = [aws_subnet.prod_private_a.id, aws_subnet.prod_private_b.id]
}
