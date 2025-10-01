locals {
  prod_db_connection_string = "Host=${aws_db_instance.prod.address};Database=${var.db_name};Username=${var.db_username};Password=${var.db_password}"
}

resource "aws_ecs_task_definition" "api" {
  family                   = "vc-prod-api"
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
      image     = "${data.aws_ecr_repository.api.repository_url}:${var.api_image_tag}",
      essential = true,

      portMappings = [{
        containerPort = var.container_port,
        protocol      = "tcp"
      }],

      # No container health check (we'll use ALB HC)
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-group         = local.ecs_logs_group,
          awslogs-region        = var.region,
          awslogs-stream-prefix = "api"
        }
      },

      environment = [
        { name = "ConnectionStrings__DefaultConnection", value = local.prod_db_connection_string },
        { name = "ASPNETCORE_ENVIRONMENT",               value = "Production" },
        { name = "RabbitMq__HostName",                   value = "rabbit.vc-prod.internal" }, # we'll create/provide this later
        { name = "PORT",                                 value = tostring(var.container_port) }
      ]
    }
  ])

  tags = {
    Project = "virtual-consultant"
    Env     = "prod"
  }
}

output "prod_api_task_definition_arn" {
  value = aws_ecs_task_definition.api.arn
}
