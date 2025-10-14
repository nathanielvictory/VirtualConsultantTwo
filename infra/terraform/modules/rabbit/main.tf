locals {
  base_tags = {
    Project = var.project
    Env     = var.env
    Service = "rabbit"
  }
  tags = merge(local.base_tags, var.extra_tags)
  name = "${var.name_prefix}-${var.env}-rabbit"
}

# --------------------------
# Security Group
# --------------------------
resource "aws_security_group" "rabbit" {
  name        = "${local.name}-sg"
  description = "RabbitMQ SG"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.tags, { Name = "${local.name}-sg" })
}

# AMQP 5672
resource "aws_security_group_rule" "amqp_ingress" {
  for_each                 = toset(var.allowed_cidrs)
  type                     = "ingress"
  description              = "AMQP 5672 from ${each.key}"
  from_port                = 5672
  to_port                  = 5672
  protocol                 = "tcp"
  security_group_id        = aws_security_group.rabbit.id
  cidr_blocks              = [each.key]
}

# Mgmt UI 15672
resource "aws_security_group_rule" "mgmt_ingress" {
  for_each                 = toset(var.allowed_cidrs)
  type                     = "ingress"
  description              = "Mgmt 15672 from ${each.key}"
  from_port                = 15672
  to_port                  = 15672
  protocol                 = "tcp"
  security_group_id        = aws_security_group.rabbit.id
  cidr_blocks              = [each.key]
}

# --------------------------
# Cloud Map service
# --------------------------
resource "aws_service_discovery_service" "this" {
  name = var.service_name

  dns_config {
    namespace_id = var.namespace_id
    dns_records {
      type = "A"
      ttl  = 10
    }
    routing_policy = "MULTIVALUE"
  }

  tags = local.tags
}

# --------------------------
# Task definition
# --------------------------
resource "aws_ecs_task_definition" "this" {
  family                   = local.name
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = var.execution_role_arn
  task_role_arn            = var.task_role_arn

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }

  container_definitions = jsonencode([
    {
      name      = "rabbit"
      image     = "public.ecr.aws/docker/library/rabbitmq:4.1-management"
      essential = true
      user      = "rabbitmq"

      portMappings = [
        { containerPort = 5672, protocol = "tcp" },
        { containerPort = 15672, protocol = "tcp" }
      ]

      environment = [
        { name = "RABBITMQ_DEFAULT_USER", value = var.rabbit_user },
        { name = "RABBITMQ_DEFAULT_PASS", value = var.rabbit_password }
      ]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = var.log_group_name
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "rabbit"
        }
      }

      healthCheck = {
        command     = ["CMD-SHELL", "rabbitmq-diagnostics -q ping || exit 1"]
        interval    = 10
        timeout     = 5
        retries     = 5
        startPeriod = 90
      }
    }
  ])

  tags = local.tags
}

# --------------------------
# Service
# --------------------------
resource "aws_ecs_service" "this" {
  name            = local.name
  cluster         = var.cluster_arn
  task_definition = aws_ecs_task_definition.this.arn
  desired_count   = var.desired_count
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = var.subnet_ids
    security_groups = [aws_security_group.rabbit.id]
    assign_public_ip = false
  }

  service_registries {
    registry_arn = aws_service_discovery_service.this.arn
  }

  enable_execute_command = true

  tags = local.tags
}
