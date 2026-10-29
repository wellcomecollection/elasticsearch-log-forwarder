import { KinesisStreamEvent } from "aws-lambda";
import { Client as ElasticClient } from "@elastic/elasticsearch";
import { OnDropDocument } from "@elastic/elasticsearch/lib/helpers";
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

    let failures: OnDropDocument<LogDocument>[] = [];
    await elasticClient.helpers.bulk<LogDocument>({
      datasource: documents,
      onDocument: (doc) => ({
        create: { _index: config.dataStreamName, _id: doc.id },
      }),
      onDrop: (fail) => {
        failures.push(fail);
      },
    });

    if (failures.length !== 0) {
      const failedServices = new Set(
        failures.map(({ document }) => document.service)
      );
      console.error(
        `Failed to ingest documents from ${failedServices.size} services: ${[
          ...failedServices,
        ].join(", ")}`
      );
      // Log and drop rather than throw: a throw retries the whole Kinesis batch, so one
      // document Elasticsearch rejects would stall its shard until the record expires.
      console.error(
        `Dropped ${failures.length} documents: ${JSON.stringify(
          failures.map(({ status, error }) => ({ status, error }))
        )}`
      );
    }
  };
