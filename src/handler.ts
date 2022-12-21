import { KinesisStreamEvent } from "aws-lambda";
import { Client as ElasticClient } from "@elastic/elasticsearch";
import { CloudwatchKinesisMessage, LogDocument } from "./types";
import { Config } from "./config";
import { decodeBase64Gzipped, logEventToLogDocument } from "./transform";

export const createHandler =
  (
    configPromise: Promise<Config>,
    elasticClientPromise: Promise<ElasticClient>
  ) =>
  async (event: KinesisStreamEvent): Promise<void> => {
    const messages = await Promise.all(
      event.Records.map((record) =>
        decodeBase64Gzipped<CloudwatchKinesisMessage>(record.kinesis.data)
      )
    );

    const documents: LogDocument[] = messages.flatMap((message) =>
      message.messageType === "DATA_MESSAGE"
        ? message.logEvents.map(logEventToLogDocument(message.logGroup))
        : []
    );

    const config = await configPromise;
    const elasticClient = await elasticClientPromise;

    await elasticClient.helpers.bulk<LogDocument>({
      datasource: documents,
      onDocument: () => ({ index: { _index: config.dataStreamName } }),
      onDrop: (fail) => {
        console.warn("Failed to ingest document: ", fail);
      },
    });
  };
