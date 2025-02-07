module "log_forwarder" {
  source = "git@github.com:wellcomecollection/terraform-aws-lambda.git?ref=v1.1.0"

  name        = "elasticsearch-log-forwarder"
  description = "Takes logs from a Kinesis stream, puts them in ES"

  s3_bucket         = aws_s3_object.log_forwarder_package.bucket
  s3_key            = aws_s3_object.log_forwarder_package.key
  s3_object_version = aws_s3_object.log_forwarder_package.version_id
  handler           = "lambda.handler"

  timeout                 = 15 * 60 // 15 minutes
  memory_size             = 512
  runtime                 = "nodejs20.x"
  forward_logs_to_elastic = false // Prevent loops

  vpc_config = {
    subnet_ids         = local.developer_vpc_private_subnets
    security_group_ids = [local.ec_privatelink_sg_id, aws_security_group.allow_egress.id]
  }

  environment = {
    variables = {
      ELASTICSEARCH_HOST_SECRET    = data.aws_secretsmanager_secret.logging_private_host.arn
      ELASTICSEARCH_API_KEY_SECRET = data.aws_secretsmanager_secret.api_key.arn
      DATA_STREAM_NAME             = local.data_stream_name
    }
  }
}

resource "aws_s3_object" "log_forwarder_package" {
  bucket = "wellcomecollection-platform-infra"
  key    = "lambdas/elasticsearch-log-forwarder/package.zip"
  source = data.archive_file.placeholder.output_path

  lifecycle {
    ignore_changes = [source, content]
  }
}

data "archive_file" "placeholder" {
  output_path = "empty-package.zip"
  type        = "zip"

  source {
    content  = "// Placeholder"
    filename = "placeholder.js"
  }
}

resource "aws_lambda_event_source_mapping" "kinesis" {
  event_source_arn = local.kinesis_stream_arn
  function_name    = module.log_forwarder.lambda.arn

  starting_position                  = "TRIM_HORIZON" // ie oldest logs first
  batch_size                         = 10
  maximum_batching_window_in_seconds = 10
}

data "aws_secretsmanager_secret" "logging_private_host" {
  name = "elasticsearch/logging/private_host"
}

data "aws_secretsmanager_secret" "api_key" {
  name = "elasticsearch/logging/forwarder/api_key"
}

resource "aws_security_group" "allow_egress" {
  name        = "log-forwarder-allow-egress"
  description = "Allow all outbound traffic"
  vpc_id      = local.vpc_id

  egress {
    from_port        = 0
    to_port          = 0
    protocol         = "-1"
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}
