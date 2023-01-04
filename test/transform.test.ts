import { logEventToLogDocument, decodeBase64Gzipped } from "../src/transform";
import { testLogEvent } from "./test-data";

describe("transform", () => {
  it("transforms log events to log documents", () => {
    const event = testLogEvent("Test message");
    const document = logEventToLogDocument("test-service")(event);

    expect(document.log).toBe("Test message");
    expect(document.service).toBe("test-service");
    expect(document["@timestamp"]).toBe(event.timestamp);
    expect(document.id).toBe(event.id);
  });

  it("correctly decodes data that is compressed and base64-encoded", async () => {
    // Encoded from https://gchq.github.io/CyberChef/#recipe=Gzip('Dynamic%20Huffman%20Coding','','',false)To_Base64('A-Za-z0-9%2B/%3D')&input=eyAiSGVsbG8iOiAid29ybGQiIH0
    const encoded =
      "H4sIAMr+omMA/wWAQQkAIAADq4yLYQKD6G8w8OND7D6emNsOQ9wcL/QLCc821BQAAAA=";
    const decoded = await decodeBase64Gzipped(encoded);

    expect(decoded).toEqual({ Hello: "world" });
  });
});
