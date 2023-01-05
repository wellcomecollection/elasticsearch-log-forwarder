import { createHandler } from "./handler";
import { getConfig } from "./config";
import { Client as ElasticClient } from "@elastic/elasticsearch";

const config = getConfig();
const elasticClient = config.then(
  ({ elasticsearchHost, elasticsearchApiKey }) =>
    new ElasticClient({
      node: `https://${elasticsearchHost}:9243`,
      auth: {
        apiKey: elasticsearchApiKey,
      },
    })
);

export const handler = createHandler(config, elasticClient);
