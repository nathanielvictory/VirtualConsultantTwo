data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

data "aws_partition" "current" {}

locals {
  base_tags = {
    Project = var.project
    Env     = var.env
    Service = var.service_name
  }

  tags = merge(local.base_tags, var.extra_tags)

  name = "${var.name_prefix}-${var.env}-${var.service_name}"

  # Build environment/secrets lists for the app container
  env_list = [
    for k, v in var.environment : {
      name  = k
      value = v
    }
  ]

  secrets_list = [
    for k, v in var.secrets : {
      name      = k
      valueFrom = v.key != null ? "${v.arn}:${v.key}::" : v.arn
    }
  ]

  # -----------------------------
  # Loki endpoint → FireLens opts
  # -----------------------------
  # Parse https://host[:port]/path → host/port/tls
  loki_is_https  = can(regex("^https://", var.loki_endpoint))
  loki_no_scheme = replace(replace(var.loki_endpoint, "https://", ""), "http://", "")
  loki_parts     = split("/", local.loki_no_scheme)
  loki_host_port = local.loki_parts[0]
  loki_host      = length(split(":", local.loki_host_port)) > 1 ? split(":", local.loki_host_port)[0] : local.loki_host_port
  loki_port      = length(split(":", local.loki_host_port)) > 1 ? tonumber(split(":", local.loki_host_port)[1]) : (local.loki_is_https ? 443 : 80)

  # Keep for reference, not used anymore (plugin defaults to /loki/api/v1/push)
  loki_path_parts = slice(local.loki_parts, 1, length(local.loki_parts))
  loki_uri        = length(local.loki_path_parts) > 0 ? format("/%s", join("/", local.loki_path_parts)) : "/"

  # Fluent Bit → Loki labels string
  loki_labels = join(",", concat(
    ["env=${var.env}", "service=${var.service_name}"],
    [for k, v in var.loki_labels : "${k}=${v}"]
  ))

  # Choose log driver/options for the app container
  app_log_driver = var.enable_loki ? "awsfirelens" : "awslogs"

  # IMPORTANT: Removed 'uri' to satisfy the installed loki output plugin.
  app_log_options = var.enable_loki ? {
    Name        = "loki"
    host        = local.loki_host
    port        = tostring(local.loki_port)
    tls         = local.loki_is_https ? "on" : "off"
    labels      = local.loki_labels
    line_format = "json"
  } : {
    awslogs-group         = var.log_group_name
    awslogs-region        = var.aws_region
    awslogs-stream-prefix = var.service_name
  }

  # Optional envs (handy only if you switch to a custom FB config later)
  loki_env = var.enable_loki ? [
    { name = "FB_Loki_Endpoint", value = var.loki_endpoint },
    { name = "FB_Loki_Labels",   value = local.loki_labels }
  ] : []

  # FireLens sidecar definition (only when enabled)
  firelens_sidecar = var.enable_loki ? [
    {
      name      = "log-router"
      image     = "public.ecr.aws/aws-observability/aws-for-fluent-bit:stable"
      essential = true
      environment = local.loki_env

      firelensConfiguration = {
        type    = "fluentbit"
        options = { "enable-ecs-log-metadata" = "true" }
      }

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = var.log_group_name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "firelens"
        }
      }
    }
  ] : []
}

# --------------------------------
# Security group for the service
# --------------------------------
resource "aws_security_group" "service" {
  name        = "${local.name}-sg"
  description = "ECS tasks for ${var.service_name}"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.tags, { Name = "${local.name}-sg" })
}

# --------------------------------
# IAM: read Secrets Manager (optional)
# --------------------------------
data "aws_iam_policy_document" "read_secrets" {
  count = length(var.allow_read_secret_arns) > 0 ? 1 : 0

  statement {
    sid = "ReadSecrets"
    actions = [
      "secretsmanager:GetSecretValue",
      "secretsmanager:DescribeSecret"
    ]
    resources = var.allow_read_secret_arns
  }
}

resource "aws_iam_policy" "read_secrets" {
  count  = length(var.allow_read_secret_arns) > 0 ? 1 : 0
  name   = "${local.name}-read-secrets"
  policy = data.aws_iam_policy_document.read_secrets[0].json
}

resource "aws_iam_role_policy_attachment" "attach_read_secrets" {
  count      = length(var.allow_read_secret_arns) > 0 ? 1 : 0
  role       = var.execution_role_name
  policy_arn = aws_iam_policy.read_secrets[0].arn
}

# --------------------------------
# IAM: read SSM Parameters (optional)
# --------------------------------
data "aws_iam_policy_document" "read_params" {
  count = length(var.allow_read_ssm_params) > 0 ? 1 : 0

  statement {
    sid = "ReadParams"
    actions = [
      "ssm:GetParameter",
      "ssm:GetParameters",
      "ssm:GetParameterHistory",
      "ssm:DescribeParameters"
    ]
    resources = [
      for p in var.allow_read_ssm_params :
      "arn:${data.aws_partition.current.partition}:ssm:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:parameter${p}"
    ]
  }
}

resource "aws_iam_policy" "read_params" {
  count  = length(var.allow_read_ssm_params) > 0 ? 1 : 0
  name   = "${local.name}-read-params"
  policy = data.aws_iam_policy_document.read_params[0].json
}

resource "aws_iam_role_policy_attachment" "attach_read_params" {
  count      = length(var.allow_read_ssm_params) > 0 ? 1 : 0
  role       = var.execution_role_name
  policy_arn = aws_iam_policy.read_params[0].arn
}

# --------------------------------
# Task definition (optionally with FireLens → Loki)
# --------------------------------
resource "aws_ecs_task_definition" "this" {
  family                   = local.name
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = var.execution_role_arn
  task_role_arn            = var.task_role_arn

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }

  container_definitions = jsonencode(concat(
    [
      {
        name      = var.service_name
        image     = var.container_image
        essential = true

        portMappings = [{ containerPort = var.container_port, protocol = "tcp" }]

        environment = local.env_list
        secrets     = local.secrets_list

        logConfiguration = {
          logDriver = local.app_log_driver
          options   = local.app_log_options
        }
      }
    ],
    local.firelens_sidecar
  ))

  tags = local.tags
}

# --------------------------------
# Service
# --------------------------------
resource "aws_ecs_service" "this" {
  name                              = local.name
  cluster                           = var.cluster_arn
  task_definition                   = aws_ecs_task_definition.this.arn
  desired_count                     = var.desired_count
  launch_type                       = "FARGATE"
  enable_execute_command            = var.enable_execute_command
  health_check_grace_period_seconds = var.health_check_grace_period_seconds

  network_configuration {
    subnets          = var.subnet_ids
    security_groups  = concat([aws_security_group.service.id], var.additional_security_group_ids)
    assign_public_ip = false
  }

  dynamic "load_balancer" {
    for_each = var.target_group_arn == "" ? [] : [var.target_group_arn]
    content {
      target_group_arn = load_balancer.value
      container_name   = var.service_name
      container_port   = var.container_port
    }
  }

  deployment_controller { type = "ECS" }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  tags = local.tags
}
