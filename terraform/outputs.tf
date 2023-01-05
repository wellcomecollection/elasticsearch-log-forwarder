output "s3_bucket" {
  value = aws_s3_object.log_forwarder_package.bucket
}

output "s3_key" {
  value = aws_s3_object.log_forwarder_package.key
}

output "function_name" {
  value = module.log_forwarder.lambda.function_name
}
