import { Client as ElasticClient } from "@elastic/elasticsearch";
import { createHandler } from "../src/handler";
import {
  testCloudwatchKinesisMessage,
  testKinesisStreamEvent,
  testLogEvent,
} from "./test-data";
import { LogDocument } from "../src/types";

describe("handler", () => {
  const getTestHandler = () => {
    const client = {
      helpers: {
        bulk: jest.fn(),
      },
    } as unknown as ElasticClient;
    const config = {
      dataStreamName: "test-stream",
      elasticsearchHost: "https://elastic.test:9243",
      elasticsearchApiKey: "secret",
    };
    const handler = createHandler(
      Promise.resolve(config),
      Promise.resolve(client)
    );
    return { handler, config, client };
  };

  it("extracts logs and indexes them in elasticsearch", async () => {
    const { handler, client } = getTestHandler();
    const event = testKinesisStreamEvent([
      testCloudwatchKinesisMessage([
        testLogEvent("Log line 1"),
        testLogEvent("Log line 2"),
      ]),
      testCloudwatchKinesisMessage([
        testLogEvent("Log line 3"),
        testLogEvent("Log line 4"),
      ]),
    ]);
    await handler(event);

    const mock = (client.helpers.bulk as jest.Mock).mock;
    const documents: LogDocument[] = mock.lastCall[0].datasource;
    expect(documents[0].log).toBe("Log line 1");
    expect(documents[1].log).toBe("Log line 2");
    expect(documents[2].log).toBe("Log line 3");
    expect(documents[3].log).toBe("Log line 4");
  });

  it("ignores CloudWatch control messages", async () => {
    const { handler, client } = getTestHandler();
    const event = testKinesisStreamEvent([
      testCloudwatchKinesisMessage(
        [testLogEvent("Something irrelevant")],
        "CONTROL_MESSAGE"
      ),
    ]);
    await handler(event);

    const mock = (client.helpers.bulk as jest.Mock).mock;
    const documents: LogDocument[] = mock.lastCall[0].datasource;
    expect(documents.length).toBe(0);
  });
});
