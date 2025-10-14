# Inputs (can be moved to qa.tfvars)
variable "vpc_id" {
  type    = string
  default = "vpc-04933b4be81a4dc22"
}

variable "api_domain" {
  type    = string
  default = "api.qa.virtualconsultant.victorymodeling.com"
}

variable "route53_zone_id" {
  type    = string
  default = "Z08197042F0B8ALXR74ST"
}

# Discover public subnets created by the network stack
data "aws_subnets" "public" {
  filter {
    name   = "vpc-id"
    values = [var.vpc_id]
  }
  tags = {
    Env  = "qa"
    Tier = "public"
  }
}

# Find API service SG created by the ecs-service module
# Name follows: "${name_prefix}-${env}-${service}-sg" => "vc-qa-api-sg"
data "aws_security_group" "api" {
  filter {
    name   = "group-name"
    values = ["vc-qa-api-sg"]
  }
  vpc_id = var.vpc_id
}

module "alb" {
  source = "../../../modules/alb"

  project           = "virtual-consultant"
  name_prefix       = "vc"
  env               = "qa"

  vpc_id            = var.vpc_id
  public_subnet_ids = data.aws_subnets.public.ids

  api_sg_id         = data.aws_security_group.api.id
  container_port    = 8080
  health_check_path = "/swagger/v1/swagger.json"

  api_domain      = var.api_domain
  route53_zone_id = var.route53_zone_id

  # certificate_arn = ""  # leave empty to issue/validate via DNS automatically
}

output "alb_dns"  { value = module.alb.alb_dns_name }
output "tg_arn"   { value = module.alb.target_group_arn }
output "cert_arn" { value = module.alb.certificate_arn }
