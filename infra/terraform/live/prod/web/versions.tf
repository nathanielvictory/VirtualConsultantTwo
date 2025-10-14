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
      Env     = "prod"
      Managed = "terraform"
    }
  }
}

# ACM for CloudFront must be in us-east-1
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}
