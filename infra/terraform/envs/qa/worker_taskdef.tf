resource "aws_ecs_task_definition" "worker" {
  family                   = "vc-qa-worker"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.worker_cpu
  memory                   = var.worker_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution.arn
  task_role_arn            = aws_iam_role.ecs_task_worker.arn

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "X86_64"
  }

  container_definitions = jsonencode([
    {
      name      = "worker",
      image     = "${data.aws_ecr_repository.worker.repository_url}:${var.worker_image_tag}",
      essential = true,

      # no ports exposed

      environment = [
        { name = "AWS_REGION",             value = "us-east-2" },

        { name = "AWS_S3_BUCKET",          value = "misc-webapp" },
        { name = "AWS_FILE_PREFIX",        value = "virtual-consultant-two-dev" },

        { name = "REPORTING_URL",          value = "https://reporting.victorymodeling.com/api/" },
        { name = "REPORTING_USERNAME",     value = "nathaniel@victorymodeling.com" },
        { name = "REPORTING_PASSWORD",     value = "changedpassword" },

        { name = "CONSULTANT_URL",         value = "https://api.qa.virtualconsultant.victorymodeling.com/api" },
        { name = "CONSULTANT_USERNAME",    value = "nathaniel@victorymodeling.com" },
        { name = "CONSULTANT_PASSWORD",    value = "changedpassword" },

        # --- RabbitMQ (matches your validation_alias names) ---
        { name = "RabbitMq__HostName",     value = "rabbit.vc-qa.internal" },
        { name = "RabbitMq__Port",         value = "5672" },
        { name = "RabbitMq__VirtualHost",  value = "/" },
        { name = "RabbitMq__UserName",     value = "consultant" },
        { name = "RabbitMq__Password",     value = "consultant_pass" },
      ],

      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-group         = local.ecs_logs_group,
          awslogs-region        = var.region,
          awslogs-stream-prefix = "worker"
        }
      }
    }
  ])

  tags = {
    Project = "virtual-consultant"
    Env     = "qa"
  }
}

output "qa_worker_task_definition_arn" {
  value = aws_ecs_task_definition.worker.arn
}
