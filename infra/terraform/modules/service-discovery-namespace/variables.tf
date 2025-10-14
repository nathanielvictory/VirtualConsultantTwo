variable "project"     { 
  type = string
  default = "virtual-consultant" 
}
variable "name_prefix" { 
  type = string
  default = "vc" 
}

variable "env"         { type = string }
variable "vpc_id"      { type = string }
variable "dns_name"    { type = string } # e.g., "vc-qa.internal"

variable "extra_tags" {
  type    = map(string)
  default = {}
}
