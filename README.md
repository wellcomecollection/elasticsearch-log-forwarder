# elasticsearch-log-forwarder

A Lambda to forward logs from a Kinesis stream to our ES logging cluster.

## Configuration

The Lambda expects 3 environment variables:

- `ELASTICSEARCH_HOST_SECRET`: ARN of a secret containing the host of the ES cluster (port 9243 and scheme HTTPS are currently hardcoded).
- `ELASTICSEARCH_API_KEY_SECRET`: ARN of a secret containing an API key for the application to use.
- `DATA_STREAM_NAME`: Name of the data stream in Elasticsearch to which logs will be written.

The Kinesis trigger is configured in Terraform using remote state from the shared platform-infrastructure stack: https://github.com/wellcomecollection/platform-infrastructure/tree/main/critical.

## Deployment

Deployment can be triggered in CI by unblocking a pipeline after tests and linting.
