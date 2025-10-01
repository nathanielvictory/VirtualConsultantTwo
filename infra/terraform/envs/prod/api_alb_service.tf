# --- Security Group for the ALB
resource "aws_security_group" "alb" {
  name        = "vc-prod-alb-sg"
  description = "Public ALB for PROD API"
  vpc_id      = local.vpc_id

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "vc-prod-alb-sg"
    Project = "virtual-consultant"
    Env     = "prod"
  }
}

# --- Allow ALB to reach API
resource "aws_security_group_rule" "api_ingress_from_alb" {
  type                     = "ingress"
  description              = "ALB to API container port (prod)"
  from_port                = var.container_port
  to_port                  = var.container_port
  protocol                 = "tcp"
  security_group_id        = aws_security_group.api.id
  source_security_group_id = aws_security_group.alb.id
}

# --- The ALB
resource "aws_lb" "prod" {
  name               = "vc-prod-api-alb"
  load_balancer_type = "application"
  internal           = false
  security_groups    = [aws_security_group.alb.id]
  subnets            = [aws_subnet.prod_public_a.id, aws_subnet.prod_public_b.id]

  tags = {
    Project = "virtual-consultant"
    Env     = "prod"
  }
}

# --- Target Group
resource "aws_lb_target_group" "api" {
  name        = "vc-prod-api-tg"
  port        = var.container_port
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = local.vpc_id

  health_check {
    enabled             = true
    path                = "/swagger/v1/swagger.json"
    matcher             = "200-399"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }

  tags = {
    Project = "virtual-consultant"
    Env     = "prod"
  }
}

# --- Listener
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.prod.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api.arn
  }
}

output "prod_api_alb_dns" {
  value = aws_lb.prod.dns_name
}
