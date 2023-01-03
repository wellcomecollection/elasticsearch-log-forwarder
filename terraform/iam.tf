data "aws_iam_policy_document" "read_secrets" {
  statement {
    effect  = "Allow"
    actions = ["secretsmanager:GetSecretValue"]
    resources = [
      data.aws_secretsmanager_secret.logging_private_host.arn,
      data.aws_secretsmanager_secret.api_key.arn
    ]
  }
}

data "aws_iam_policy_document" "subscribe_to_stream" {
  statement {
    effect = "Allow"
    actions = [
      "kinesis:DescribeStream",
      "kinesis:DescribeStreamSummary",
      "kinesis:GetRecords",
      "kinesis:GetShardIterator",
      "kinesis:ListShards",
      "kinesis:ListStreams",
      "kinesis:SubscribeToShard"
    ]
    resources = [local.kinesis_stream_arn]
  }
}

resource "aws_iam_role_policy" "read_secrets" {
  name   = "elasticsearch-log-forwarder-read-secrets"
  policy = data.aws_iam_policy_document.read_secrets.json
  role   = module.log_forwarder.lambda_role.id
}

resource "aws_iam_role_policy" "subscribe_to_stream" {
  name   = "elasticsearch-log-forwarder-subscribe-to-stream"
  policy = data.aws_iam_policy_document.subscribe_to_stream.json
  role   = module.log_forwarder.lambda_role.id
}
