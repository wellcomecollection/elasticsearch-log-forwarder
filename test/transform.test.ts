import { logEventToLogDocument, decodeBase64Gzipped } from "../src/transform";
import { testLogEvent } from "./test-data";

describe("transform", () => {
  it("transforms log events to log documents", () => {
    const message = `[INFO]\t2025-11-11T10:05:05.362Z\t0f48ac76-2de9-456a-ad88-572036f60957\t{"s3_file_uri": "s3://wellcomecollection-catalogue-graph/graph_bulk_loader/2025-10-02/windows/20251111T0945-20251111T1000/catalogue_works__nodes.csv", "transformer_type": "catalogue_works", "entity_type": "nodes", "event": "Starting bulk load", "level": "info", "logger": "bulk_loader", "timestamp": "2025-11-11T10:05:05.361985Z", "pipeline_step": "graph_bulk_loader", "trace_id": "logging test", "started_at": "2025-11-11T10:05:05.361219+00:00"}\n`;
    const event = testLogEvent(message);
    const document = logEventToLogDocument("test-service")(event);

    expect(document).toStrictEqual({
      id: event.id,
      "@timestamp": event.timestamp,
      log: '[INFO]\t2025-11-11T10:05:05.362Z\t0f48ac76-2de9-456a-ad88-572036f60957\t{"s3_file_uri": "s3://wellcomecollection-catalogue-graph/graph_bulk_loader/2025-10-02/windows/20251111T0945-20251111T1000/catalogue_works__nodes.csv", "transformer_type": "catalogue_works", "entity_type": "nodes", "event": "Starting bulk load", "level": "info", "logger": "bulk_loader", "timestamp": "2025-11-11T10:05:05.361985Z", "pipeline_step": "graph_bulk_loader", "trace_id": "logging test", "started_at": "2025-11-11T10:05:05.361219+00:00"}\n',
      service: "test-service",
      s3_file_uri:
        "s3://wellcomecollection-catalogue-graph/graph_bulk_loader/2025-10-02/windows/20251111T0945-20251111T1000/catalogue_works__nodes.csv",
      transformer_type: "catalogue_works",
      entity_type: "nodes",
      event: "Starting bulk load",
      level: "info",
      logger: "bulk_loader",
      timestamp: "2025-11-11T10:05:05.361985Z",
      pipeline_step: "graph_bulk_loader",
      trace_id: "logging test",
      started_at: "2025-11-11T10:05:05.361219+00:00",
    });
  });

  it("correctly decodes data that is compressed and base64-encoded", async () => {
    // Encoded from https://gchq.github.io/CyberChef/#recipe=Gzip('Dynamic%20Huffman%20Coding','','',false)To_Base64('A-Za-z0-9%2B/%3D')&input=eyAiSGVsbG8iOiAid29ybGQiIH0
    const encoded =
      "H4sIAMr+omMA/wWAQQkAIAADq4yLYQKD6G8w8OND7D6emNsOQ9wcL/QLCc821BQAAAA=";
    const decoded = await decodeBase64Gzipped(encoded);

    expect(decoded).toEqual({ Hello: "world" });
  });
});
