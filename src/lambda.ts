import { createHandler } from "./handler";
import { getConfig } from "./config";
import { Client as ElasticClient } from "@elastic/elasticsearch";

const config = getConfig();
const elasticClient = config.then(
  ({ elasticsearchUrl, elasticsearchApiKey }) =>
    new ElasticClient({
      node: elasticsearchUrl,
      auth: {
        apiKey: elasticsearchApiKey,
      },
    })
);

export const handler = createHandler(config, elasticClient);
