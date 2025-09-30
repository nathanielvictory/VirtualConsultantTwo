locals {
  use_explicit_vpc = var.vpc_id != ""
}

# If you provided an ID, resolve it; otherwise find by Name tag
data "aws_vpc" "by_id" {
  count = local.use_explicit_vpc ? 1 : 0
  id    = var.vpc_id
}

data "aws_vpc" "by_name" {
  count = local.use_explicit_vpc ? 0 : 1
  filter {
    name   = "tag:Name"
    values = [var.vpc_name]
  }
}

locals {
  vpc_id = local.use_explicit_vpc ? data.aws_vpc.by_id[0].id : data.aws_vpc.by_name[0].id
}

output "resolved_vpc_id" {
  value = local.vpc_id
}
