terraform {
  required_version = ">= 1.9.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

# Home region
provider "aws" {
  region = "us-east-2"

  default_tags {
    tags = {
      Project = "virtual-consultant"
      Env     = "qa"
      Managed = "terraform"
    }
  }
}

# Certificate must be in us-east-1 for CloudFront
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}
