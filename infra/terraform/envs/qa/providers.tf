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

# CloudFront requires ACM certs in us-east-1
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}
