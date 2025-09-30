resource "aws_subnet" "qa_public_a" {
  vpc_id                  = local.vpc_id
  availability_zone       = var.az_a
  cidr_block              = var.qa_public_a_cidr
  map_public_ip_on_launch = true

  tags = {
    Name    = "vc-qa-public-a"
    Project = "virtual-consultant"
    Env     = "qa"
    Tier    = "public"
  }
}

resource "aws_subnet" "qa_public_b" {
  vpc_id                  = local.vpc_id
  availability_zone       = var.az_b
  cidr_block              = var.qa_public_b_cidr
  map_public_ip_on_launch = true

  tags = {
    Name    = "vc-qa-public-b"
    Project = "virtual-consultant"
    Env     = "qa"
    Tier    = "public"
  }
}

resource "aws_subnet" "qa_private_a" {
  vpc_id            = local.vpc_id
  availability_zone = var.az_a
  cidr_block        = var.qa_private_a_cidr

  tags = {
    Name    = "vc-qa-private-a"
    Project = "virtual-consultant"
    Env     = "qa"
    Tier    = "private"
  }
}

resource "aws_subnet" "qa_private_b" {
  vpc_id            = local.vpc_id
  availability_zone = var.az_b
  cidr_block        = var.qa_private_b_cidr

  tags = {
    Name    = "vc-qa-private-b"
    Project = "virtual-consultant"
    Env     = "qa"
    Tier    = "private"
  }
}

output "qa_public_subnet_ids" {
  value = [
    aws_subnet.qa_public_a.id,
    aws_subnet.qa_public_b.id
  ]
}

output "qa_private_subnet_ids" {
  value = [
    aws_subnet.qa_private_a.id,
    aws_subnet.qa_private_b.id
  ]
}
