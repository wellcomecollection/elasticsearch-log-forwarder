import { Buffer } from "node:buffer";
import { promisify } from "node:util";
import zlib from "node:zlib";
import { CloudwatchLogEvent, LogDocument } from "./types";

export const logEventToLogDocument =
  (service: string) =>
  (event: CloudwatchLogEvent): LogDocument => ({
    id: event.id,
    "@timestamp": event.timestamp,
    log: event.message,
    service,
  });

const gunzip = promisify(zlib.gunzip);
export const decodeBase64Gzipped = async <T>(blob: string): Promise<T> => {
  const compressedBuffer = Buffer.from(blob, "base64");
  const buffer = await gunzip(compressedBuffer);
  const string = buffer.toString("utf-8");
  return JSON.parse(string);
};
