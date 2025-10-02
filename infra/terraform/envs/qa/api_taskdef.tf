locals {
  qa_db_connection_string = "Host=${aws_db_instance.qa.address};Database=${var.db_name};Username=${var.db_username};Password=${var.db_password}"
}

# Fargate task definition for the API (no service yet)
resource "aws_ecs_task_definition" "api" {
  family                   = "vc-qa-api"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.api_cpu
  memory                   = var.api_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task.arn
  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }

  container_definitions = jsonencode([
    {
      name      = "api",
      image = "${data.aws_ecr_repository.api.repository_url}@${data.aws_ecr_image.api_latest.image_digest}",
      essential = true,

      portMappings = [{
        containerPort = var.container_port,
        protocol      = "tcp"
      }],

      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-group         = local.ecs_logs_group,
          awslogs-region        = var.region,
          awslogs-stream-prefix = "api"
        }
      },

      environment = [
        {
          name  = "ConnectionStrings__DefaultConnection"
          value = local.qa_db_connection_string
        },
        { name = "ASPNETCORE_ENVIRONMENT", value = "Development" },
        { name = "RabbitMq__HostName",     value = "rabbit.vc-qa.internal" },
        { name = "PORT",                   value = tostring(var.container_port) }
      ]
      # secrets block comes later when we move creds to Secrets Manager
    }
  ])

  tags = {
    Project = "virtual-consultant"
    Env     = "qa"
  }
}

output "qa_api_task_definition_arn" {
  value = aws_ecs_task_definition.api.arn
}
