# Security Group for RabbitMQ (for now, open to VPC CIDRs like QA)
resource "aws_security_group" "rabbit" {
  name        = "vc-prod-rabbit-sg"
  description = "PROD RabbitMQ SG"
  vpc_id      = local.vpc_id

  # AMQP
  ingress {
    from_port   = 5672
    to_port     = 5672
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/24", "10.1.0.0/16"]
  }

  # Management UI (internal-only)
  ingress {
    from_port   = 15672
    to_port     = 15672
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/24", "10.1.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "vc-prod-rabbit-sg"
    Project = "virtual-consultant"
    Env     = "prod"
  }
}

# Private DNS namespace for service discovery
resource "aws_service_discovery_private_dns_namespace" "prod_ns" {
  name = "vc-prod.internal"
  vpc  = local.vpc_id

  tags = {
    Project = "virtual-consultant"
    Env     = "prod"
  }
}

# Service discovery entry for RabbitMQ -> rabbit.vc-prod.internal
resource "aws_service_discovery_service" "rabbit" {
  name = "rabbit"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.prod_ns.id
    dns_records {
      type = "A"
      ttl  = 10
    }
    routing_policy = "MULTIVALUE"
  }

  # (Note: failure_threshold was removed in QA to avoid deprecation; not used here)

  tags = {
    Project = "virtual-consultant"
    Env     = "prod"
  }
}

# RabbitMQ task definition (Fargate)
resource "aws_ecs_task_definition" "rabbit" {
  family                   = "vc-prod-rabbit"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = 256
  memory                   = 512
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }

  container_definitions = jsonencode([
    {
      name      = "rabbit",
      image     = "rabbitmq:4.1-management",
      essential = true,
      portMappings = [
        { containerPort = 5672, protocol = "tcp" },
        { containerPort = 15672, protocol = "tcp" }
      ],
      environment = [
        { name = "RABBITMQ_DEFAULT_USER", value = var.rabbit_user },
        { name = "RABBITMQ_DEFAULT_PASS", value = var.rabbit_password }
      ],
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-group         = aws_cloudwatch_log_group.ecs.name,
          awslogs-region        = var.region,
          awslogs-stream-prefix = "rabbit"
        }
      },
      healthCheck = {
        command     = ["CMD-SHELL", "rabbitmq-diagnostics -q ping || exit 1"],
        interval    = 30,
        timeout     = 5,
        retries     = 3,
        startPeriod = 15
      }
    }
  ])

  tags = {
    Project = "virtual-consultant"
    Env     = "prod"
  }
}

# RabbitMQ ECS service with service discovery
resource "aws_ecs_service" "rabbit" {
  name            = "vc-prod-rabbit"
  cluster         = aws_ecs_cluster.prod.id
  task_definition = aws_ecs_task_definition.rabbit.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.prod_private_a.id, aws_subnet.prod_private_b.id]
    security_groups  = [aws_security_group.rabbit.id]
    assign_public_ip = false
  }

  service_registries {
    registry_arn = aws_service_discovery_service.rabbit.arn
  }

  enable_execute_command = true

  lifecycle {
    ignore_changes = [task_definition]
  }

  tags = {
    Project = "virtual-consultant"
    Env     = "prod"
  }
}

output "rabbitmq_dns" {
  value = "rabbit.vc-prod.internal"
}
