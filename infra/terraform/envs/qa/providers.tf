provider "aws" {
  region = var.region
  default_tags {
    tags = {
      Project = "virtual-consultant"
      Env     = "qa"
      Managed = "terraform"
    }
  }
}
