output "server_node_public_ip" {
  value = try(aws_instance.ec2_node.public_ip, "")
}

output "server_python_public_ip" {
  value = try(aws_instance.ec2_python.public_ip, "")
}

output "load_balancer_url" {
  value = aws_lb.semi_load_balancer.dns_name
}

output "rds_endpoint" {
  value = aws_db_instance.mysql-instance.endpoint
}

output "rds_username" {
  value = aws_db_instance.mysql-instance.username
}

output "rds_password" {
  sensitive = true
  value     = aws_db_instance.mysql-instance.password
}

output "rds_db_name" {
  value = aws_db_instance.mysql-instance.db_name
}

