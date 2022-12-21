import { KinesisStreamEvent } from "aws-lambda";
import { Client as ElasticClient } from "@elastic/elasticsearch";
import { Buffer } from "node:buffer";
import {
  CloudwatchKinesisMessage,
  CloudwatchLogEvent,
  LogDocument,
} from "./types";
import { getConfig } from "./config";

const configPromise = getConfig();
const elasticClientPromise = configPromise.then(
  ({ elasticsearchUrl, elasticsearchApiKey }) =>
    new ElasticClient({
      node: elasticsearchUrl,
      auth: {
        apiKey: elasticsearchApiKey,
      },
    })
);

const logEventToLogDocument =
  (service: string) =>
  (event: CloudwatchLogEvent): LogDocument => ({
    _id: event.id,
    "@timestamp": event.timestamp,
    log: event.message,
    service,
  });
export const handler = async (event: KinesisStreamEvent): Promise<void> => {
  const messages: CloudwatchKinesisMessage[] = event.Records.map((record) =>
    JSON.parse(Buffer.from(record.kinesis.data, "base64").toString("utf-8"))
  );

  const documents: LogDocument[] = messages.flatMap((message) =>
    message.messageType === "DATA_MESSAGE"
      ? message.logEvents.map(logEventToLogDocument(message.logGroup))
      : []
  );

  const config = await configPromise;
  const client = await elasticClientPromise;
  await client.helpers.bulk<LogDocument>({
    datasource: documents,
    onDocument: () => ({ index: { _index: config.dataStreamName } }),
    onDrop: (fail) => {
      console.warn("Failed to ingest document: ", fail);
    },
  });
};
