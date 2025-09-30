terraform {
  required_version = ">= 1.9.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = var.region
}

# IMPORTANT: Reference (do not create) the existing S3 bucket
# This also serves as a sanity-check that the bucket exists and we can read it.
data "aws_s3_bucket" "tf_state" {
  bucket = var.bucket_name
}

# Create a DynamoDB table for Terraform state locking
resource "aws_dynamodb_table" "tf_lock" {
  name         = var.lock_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}

# Helpful outputs (we'll paste these into the backend config for prod/qa)
output "state_bucket" {
  value = data.aws_s3_bucket.tf_state.bucket
}

output "lock_table" {
  value = aws_dynamodb_table.tf_lock.name
}
