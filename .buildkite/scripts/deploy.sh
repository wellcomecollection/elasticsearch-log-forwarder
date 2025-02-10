#!/usr/bin/env bash
set -euo pipefail

TERRAFORM_ROLE="arn:aws:iam::760097843905:role/platform-ci"

# Do this here rather than in Dockerfile so we don't install it on every build/test
apt install -y awscli zip
ROOT=$(git rev-parse --show-toplevel)

cd $ROOT/terraform
terraform init -backend-config="role_arn=${TERRAFORM_ROLE}"
S3_BUCKET=$(terraform output -raw s3_bucket)
S3_KEY=$(terraform output -raw s3_key)
FUNCTION_NAME=$(terraform output -raw function_name)
cd $ROOT

yarn package
aws s3 cp $ROOT/package.zip "s3://${S3_BUCKET}/${S3_KEY}"

VERSION_ID=$(aws s3api list-object-versions \
  --bucket $S3_BUCKET \
  --prefix $S3_KEY \
  --query 'Versions[?IsLatest].[VersionId]' \
  --output text)

aws lambda update-function-code \
  --function-name $FUNCTION_NAME \
  --s3-bucket $S3_BUCKET \
  --s3-key $S3_KEY \
  --s3-object-version $VERSION_ID \
  --no-paginate

aws lambda wait function-updated \
  --function-name $FUNCTION_NAME \
  --no-paginate

echo "Deployed function successfully!"
