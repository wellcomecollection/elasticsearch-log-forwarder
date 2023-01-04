#!/usr/bin/env bash
set -euo pipefail

ROOT=$(git rev-parse --show-toplevel)
S3_BUCKET=$(cd $ROOT/terraform && terraform output s3_bucket)
S3_KEY=$(cd $ROOT/terraform && terraform output s3_key)
FUNCTION_NAME=$(cd $ROOT/terraform && terraform output function_name)

yarn package
aws s3 cp $ROOT/package.zip "s3://${S3_BUCKET}/${S3_KEY}"
VERSION_ID=$(aws s3api list-object-versions --bucket $S3_BUCKET --prefix $S3_KEY --query 'Versions[?IsLatest].[VersionId]' --output text)

aws lambda update-function-code \
  --function-name $FUNCTION_NAME \
  --s3-bucket $S3_BUCKET \
  --s3-key $S3_KEY \
  --s3-object-version $VERSION_ID

aws lambda wait function-updated --function-name $FUNCTION_NAME
echo "Deployed function successfully!"
