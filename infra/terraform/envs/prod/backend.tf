terraform {
  backend "s3" {
    bucket         = "victory-modeling-terraform-state"
    key            = "virtual-consultant/prod/terraform.tfstate"
    region         = "us-east-2"
    dynamodb_table = "virtual-consultant-tf-lock"
    encrypt        = true
  }
}
