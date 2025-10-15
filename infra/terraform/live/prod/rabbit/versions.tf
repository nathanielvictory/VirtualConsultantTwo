terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.1"
    }
  }
}

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
