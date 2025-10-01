# Security Group for RabbitMQ (allow from inside the VPC only for now)
resource "aws_security_group" "rabbit" {
  name        = "vc-qa-rabbit-sg"
  description = "QA RabbitMQ SG"
  vpc_id      = local.vpc_id

  # AMQP
  ingress {
    from_port   = 5672
    to_port     = 5672
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/24", "10.1.0.0/16"] # VPC CIDRs; tighten later to ECS SGs
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
    Name    = "vc-qa-rabbit-sg"
    Project = "virtual-consultant"
    Env     = "qa"
  }
}

# Private DNS namespace for QA service discovery
resource "aws_service_discovery_private_dns_namespace" "qa_ns" {
  name = "vc-qa.internal"
  vpc  = local.vpc_id
  tags = {
    Project = "virtual-consultant"
    Env     = "qa"
  }
}

# Service discovery entry for RabbitMQ -> rabbit.vc-qa.internal
resource "aws_service_discovery_service" "rabbit" {
  name = "rabbit"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.qa_ns.id
    dns_records {
      type = "A"
      ttl  = 10
    }
    routing_policy = "MULTIVALUE"
  }

  tags = {
    Project = "virtual-consultant"
    Env     = "qa"
  }
}

# RabbitMQ task definition (Fargate)
resource "aws_ecs_task_definition" "rabbit" {
  family                   = "vc-qa-rabbit"
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
          awslogs-group         = aws_cloudwatch_log_group.ecs.name
          awslogs-region        = var.region
          awslogs-stream-prefix = "rabbit"
        }
      }
      "healthCheck": {
        "command": ["CMD-SHELL", "rabbitmq-diagnostics -q ping || exit 1"],
        "interval": 10,
        "timeout": 5,
        "retries": 5,
        "startPeriod": 90
      }
    }
  ])

  tags = {
    Project = "virtual-consultant"
    Env     = "qa"
  }
}

# RabbitMQ ECS service with service discovery
resource "aws_ecs_service" "rabbit" {
  name            = "vc-qa-rabbit"
  cluster         = aws_ecs_cluster.qa.id
  task_definition = aws_ecs_task_definition.rabbit.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = [aws_subnet.qa_private_a.id, aws_subnet.qa_private_b.id]
    security_groups = [aws_security_group.rabbit.id]
    assign_public_ip = false
  }

  service_registries {
    registry_arn = aws_service_discovery_service.rabbit.arn
  }

  enable_execute_command = true

  tags = {
    Project = "virtual-consultant"
    Env     = "qa"
  }
}

output "rabbitmq_dns" {
  value = "rabbit.vc-qa.internal"
}
