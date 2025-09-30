provider "aws" {
  region = var.region

  default_tags {
    tags = {
      Project = "virtual-consultant"
      Stack   = "vpc-admin"
      Managed = "terraform"
    }
  }
}
