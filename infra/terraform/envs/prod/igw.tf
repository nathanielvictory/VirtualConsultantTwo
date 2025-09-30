# Create an Internet Gateway and attach it to the existing VPC
resource "aws_internet_gateway" "prod" {
  tags = {
    Name    = "vc-prod-igw"
    Project = "virtual-consultant"
    Env     = "prod"
  }
}

resource "aws_internet_gateway_attachment" "prod" {
  internet_gateway_id = aws_internet_gateway.prod.id
  vpc_id              = local.vpc_id
}
