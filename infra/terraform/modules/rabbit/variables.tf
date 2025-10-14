variable "project"     {
  type = string
  default = "virtual-consultant"
}
variable "name_prefix" { 
  type = string
  default = "vc"
}
variable "env"         { type = string }

# Cluster / networking / roles
variable "cluster_arn"       { type = string }
variable "vpc_id"            { type = string }
variable "subnet_ids"        { type = list(string) }
variable "execution_role_arn"{ type = string }
variable "task_role_arn"     { type = string }

# Logging
variable "log_group_name"    { type = string }
variable "aws_region"        { type = string }

# Service discovery
variable "namespace_id"      { type = string }         # from service-discovery-namespace
variable "service_name"      { 
  type = string
  default = "rabbit" 
} # DNS label in the namespace

# Rabbit credentials (keep as vars for now; we’ll move to Secrets later)
variable "rabbit_user"       { 
  type = string
  default = "consultant"
}

variable "rabbit_password"   { 
  type = string
  default = "consultant_pass" 
}

# Network exposure
variable "allowed_cidrs" {
  type        = list(string)
  default     = ["10.0.0.0/24", "10.1.0.0/16"] # matches your current QA rules
  description = "CIDR ranges allowed to access AMQP and mgmt ports"
}

# Scaling
variable "desired_count" { 
  type = number
  default = 1 
}

variable "extra_tags" {
  type    = map(string)
  default = {}
}
