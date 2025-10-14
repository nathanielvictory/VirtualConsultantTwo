variable "project" {
  type        = string
  default     = "virtual-consultant"
}

variable "name_prefix" {
  type        = string
  default     = "vc"
}

variable "env" {
  type        = string
  description = "Environment label (qa, prod, etc.)"
}

variable "enable_container_insights" {
  type        = bool
  default     = true
}

variable "log_group_name" {
  type        = string
  default     = ""     # if empty, module will create /ecs/<project>/<env>
}

variable "log_retention_days" {
  type        = number
  default     = 30
}

variable "capacity_providers" {
  type        = list(string)
  default     = ["FARGATE", "FARGATE_SPOT"]
}

variable "default_capacity_provider" {
  type = object({
    capacity_provider = string
    weight            = number
    base              = number
  })
  default = {
    capacity_provider = "FARGATE"
    weight            = 1
    base              = 0
  }
}

variable "extra_tags" {
  type        = map(string)
  default     = {}
}
