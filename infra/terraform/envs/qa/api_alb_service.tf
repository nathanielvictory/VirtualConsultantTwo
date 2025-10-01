# --- Security Group for the ALB (internet -> ALB:80)
resource "aws_security_group" "alb" {
  name        = "vc-qa-alb-sg"
  description = "Public ALB for QA API"
  vpc_id      = local.vpc_id

  ingress {
    description = "HTTP from anywhere"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS from anywhere"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    description = "ALB egress anywhere"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name    = "vc-qa-alb-sg"
    Project = "virtual-consultant"
    Env     = "qa"
  }
}

# --- Allow ALB to reach API tasks on the container port
resource "aws_security_group_rule" "api_ingress_from_alb" {
  type                     = "ingress"
  description              = "ALB to API container port"
  from_port                = var.container_port
  to_port                  = var.container_port
  protocol                 = "tcp"
  security_group_id        = aws_security_group.api.id   # API SG from api_network.tf
  source_security_group_id = aws_security_group.alb.id
}

# --- The ALB in QA public subnets
resource "aws_lb" "qa" {
  name               = "vc-qa-api-alb"
  load_balancer_type = "application"
  internal           = false
  security_groups    = [aws_security_group.alb.id]
  subnets            = [aws_subnet.qa_public_a.id, aws_subnet.qa_public_b.id]

  tags = {
    Project = "virtual-consultant"
    Env     = "qa"
  }
}

# --- Target Group for Fargate IP targets
resource "aws_lb_target_group" "api" {
  name        = "vc-qa-api-tg"
  port        = var.container_port
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = local.vpc_id

  health_check {
    enabled             = true
    path                = "/swagger/v1/swagger.json"  # temporary check you mentioned
    matcher             = "200-499"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }

  tags = {
    Project = "virtual-consultant"
    Env     = "qa"
  }
}

# --- Listener on :80 → target group
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.qa.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      protocol   = "HTTPS"
      port       = "443"
      status_code = "HTTP_301"
    }
  }
}


output "qa_api_alb_dns" {
  value = aws_lb.qa.dns_name
}
