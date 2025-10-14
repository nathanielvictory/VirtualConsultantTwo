variable "project"     { 
  type = string
  default = "virtual-consultant" 
}

variable "name_prefix" { 
  type = string
  default = "vc" 
}

variable "env"         { type = string }

# Networking
variable "vpc_id" {
  description = "VPC where the DB runs"
  type        = string
}

variable "private_subnet_ids" {
  description = "Private subnet IDs for DB subnet group (2+)"
  type        = list(string)
}

# DB config (defaults match your current QA)
variable "engine"          { 
  type = string
  default = "postgres" 
}

variable "engine_version"  { 
  type = string
  default = "17.6" 
}

variable "instance_class"  { 
  type = string
  default = "db.t4g.small" 
}

variable "db_name"         { 
  type = string
  default = "consultant_db"
}

variable "username"        { 
  type = string
  default = "consultant_user"
}

variable "password" {
  type        = string
  default     = "consultant_pass"
  sensitive   = true
  description = "TODO: move to Secrets Manager later"
}

variable "allocated_storage"     { 
  type = number
  default = 20 
}

variable "max_allocated_storage" { default = 100 }
variable "storage_type"          { 
  type = string
  default = "gp3" 
}

variable "publicly_accessible"   { 
  type = bool
  default = false 
}

variable "multi_az"              { 
  type = bool
  default = false 
}

variable "backup_retention_days" { 
  type = number
  default = 7
}

variable "deletion_protection"   { 
  type = bool
  default = false 
}

variable "skip_final_snapshot"   { 
  type = bool
  default = true
}

variable "apply_immediately"     { 
  type = bool
  default = true 
}

# Extra tags
variable "extra_tags" { 
  type = map(string)
  default = {} 
}

# --- Publishing options ---
variable "publish_secrets" {
  type    = bool
  default = true
}

variable "db_secret_name" {
  type        = string
  default     = ""
  description = "If empty, defaults to /app/<env>/db/credentials"
}

variable "publish_ssm" {
  type    = bool
  default = true
}

variable "db_endpoint_param" {
  type        = string
  default     = ""
  description = "If empty, defaults to /app/<env>/db/endpoint"
}

variable "db_name_param" {
  type        = string
  default     = ""
  description = "If empty, defaults to /app/<env>/db/name"
}