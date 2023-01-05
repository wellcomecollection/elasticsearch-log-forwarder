import zlib from "node:zlib";
import {
  KinesisStreamEvent,
  KinesisStreamRecord,
  KinesisStreamRecordPayload,
} from "aws-lambda";
import { CloudwatchKinesisMessage, CloudwatchLogEvent } from "../src/types";

const encodeBase64Gzipped = <T>(data: T): string => {
  const stringified = JSON.stringify(data);
  const compressed = zlib.gzipSync(stringified);
  return compressed.toString("base64");
};

export const testLogEvent = (message: string): CloudwatchLogEvent => ({
  id: Math.floor(Math.random() * 1e8).toString(),
  timestamp: Date.now(),
  message,
});

export const testCloudwatchKinesisMessage = (
  logEvents: CloudwatchLogEvent[],
  messageType: CloudwatchKinesisMessage["messageType"] = "DATA_MESSAGE"
) => ({
  owner: "test",
  logGroup: "/aws/lambda/test",
  logStream: "test-stream",
  subscriptionFilters: ["RecipientStream"],
  messageType,
  logEvents,
});

export const testKinesisStreamRecordPayload = <T>(
  data: T
): KinesisStreamRecordPayload => ({
  kinesisSchemaVersion: "1.0",
  partitionKey: "1",
  sequenceNumber: "1234",
  data: encodeBase64Gzipped(data),
  approximateArrivalTimestamp: Date.now(),
});

export const testKinesisStreamRecord = <T>(data: T): KinesisStreamRecord => ({
  kinesis: testKinesisStreamRecordPayload(data),
  awsRegion: "eu-west-1",
  eventSource: "aws:kinesis",
  eventVersion: "1.0",
  eventID: "1234",
  eventName: "aws:kinesis:record",
  invokeIdentityArn: "arn:aws:iam::123456789012:role/test-lambda-role",
  eventSourceARN:
    "arn:aws:kinesis:eu-west-1:123456789012:stream/test-lambda-stream",
});

export const testKinesisStreamEvent = <T>(data: T[]): KinesisStreamEvent => ({
  Records: data.map(testKinesisStreamRecord),
});
