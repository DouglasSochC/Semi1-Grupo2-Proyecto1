resource "aws_lb" "semi_load_balancer" {
  name               = "semi-load-balancer"
  internal           = false
  load_balancer_type = "application"
  subnets            = [aws_subnet.PublicS1.id, aws_subnet.PublicS2.id]

  enable_deletion_protection = false
  enable_http2               = true
  enable_cross_zone_load_balancing = true

  security_groups = [aws_security_group.Semi1-sg.id]
}

resource "aws_security_group" "Semi1-sg" {
  vpc_id = aws_vpc.Semi1_VPC.id
  name   = "Semi1-sg"
  egress = [
    {
      cidr_blocks      = ["0.0.0.0/0", ]
      description      = ""
      from_port        = 0
      ipv6_cidr_blocks = []
      prefix_list_ids  = []
      protocol         = "-1"
      security_groups  = []
      self             = false
      to_port          = 0
    }
  ]
  ingress = [
    {
      cidr_blocks      = ["0.0.0.0/0", ]
      description      = ""
      from_port        = 3000
      ipv6_cidr_blocks = []
      prefix_list_ids  = []
      protocol         = "tcp"
      security_groups  = []
      self             = false
      to_port          = 3000
    },
    {
      cidr_blocks      = ["0.0.0.0/0", ]
      description      = ""
      from_port        = 80
      ipv6_cidr_blocks = []
      prefix_list_ids  = []
      protocol         = "tcp"
      security_groups  = []
      self             = false
      to_port          = 80
    }
  ]
}


resource "aws_lb_listener" "web" {
  load_balancer_arn = aws_lb.semi_load_balancer.arn
  port              = 3000
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.semi_target_group.arn
  }
}


resource "aws_lb_target_group" "semi_target_group" {
  name     = "semi-target-group"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = aws_vpc.Semi1_VPC.id

  health_check {
    enabled             = true
    interval            = 30
    matcher             = "200"
    path                = "/"
    port                = "3000"
    protocol            = "HTTP"
    timeout             = 5
    unhealthy_threshold = 2
  }
}

resource "aws_lb_target_group_attachment" "ec2_node" {
  target_group_arn = aws_lb_target_group.semi_target_group.arn
  target_id        = aws_instance.ec2_node.id
  port             = 3000
}

resource "aws_lb_target_group_attachment" "ec2_python" {
  target_group_arn = aws_lb_target_group.semi_target_group.arn
  target_id        = aws_instance.ec2_python.id
  port             = 3000
}
