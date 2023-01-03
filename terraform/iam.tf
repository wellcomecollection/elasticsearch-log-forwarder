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

resource "aws_iam_role_policy" "read_secrets" {
  name   = "elasticsearch-log-forwarder-read-secrets"
  policy = data.aws_iam_policy_document.read_secrets.json
  role   = module.log_forwarder.lambda_role.id
}
