import { Buffer } from "node:buffer";
import { promisify } from "node:util";
import zlib from "node:zlib";
import { CloudwatchLogEvent, LogDocument } from "./types";

export const logEventToLogDocument =
  (service: string) =>
  (event: CloudwatchLogEvent): LogDocument => {
    // Extract JSON part from Lambda log format: [LEVEL]\t[TIMESTAMP]\t[REQUEST_ID]\t[JSON_MESSAGE]
    const jsonMatch = event.message.match(/^\[.*?\]\t.*?\t.*?\t(.*?)(?:\n)?$/);

    let parsedJson = {};
    if (jsonMatch) {
      try {
        parsedJson = JSON.parse(jsonMatch[1]);
      } catch (error) {
        console.warn("Failed to parse JSON from log message:", error);
      }
    }

    // If no jsonMatch or JSON parsing fails, continue with empty object
    return {
      id: event.id,
      "@timestamp": event.timestamp,
      log: event.message,
      service,
      ...parsedJson,
    };
  };

const gunzip = promisify(zlib.gunzip);
export const decodeBase64Gzipped = async <T>(blob: string): Promise<T> => {
  const compressedBuffer = Buffer.from(blob, "base64");
  const buffer = await gunzip(compressedBuffer);
  const string = buffer.toString("utf-8");
  return JSON.parse(string);
};
