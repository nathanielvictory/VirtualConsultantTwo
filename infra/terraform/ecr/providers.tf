provider "aws" {
  region = "us-east-2"

  default_tags {
    tags = {
      Project = "virtual-consultant"
      Stack   = "ecr"
      Managed = "terraform"
    }
  }
}
