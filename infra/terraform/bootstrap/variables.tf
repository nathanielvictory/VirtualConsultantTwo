variable "region" {
  description = "AWS region where the existing state bucket lives (and where we'll create the lock table)."
  type        = string
  default     = "us-east-2"
}

variable "bucket_name" {
  description = "Name of the existing S3 bucket that will store Terraform state objects."
  type        = string
  default     = "victory-modeling-terraform-state"
}

variable "state_prefix" {
  description = "Folder-like prefix under the bucket for this project (used later in env backends)."
  type        = string
  default     = "virtual-consultant"
}

variable "lock_table_name" {
  description = "Name for the DynamoDB table used to lock Terraform state during apply/plan."
  type        = string
  default     = "virtual-consultant-tf-lock"
}
