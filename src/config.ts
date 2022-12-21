import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";
import { z } from "zod";

const secretsManager = new SecretsManagerClient({});

const environmentSchema = z.object({
  ELASTICSEARCH_URL_SECRET: z.string(),
  ELASTICSEARCH_API_KEY_SECRET: z.string(),
  DATA_STREAM_NAME: z.string(),
});

const environment = environmentSchema.parse(process.env);

const getSecret = async (arn: string): Promise<string | undefined> => {
  const response = await secretsManager.send(
    new GetSecretValueCommand({
      SecretId: arn,
    })
  );
  return response.SecretString;
};

export const getConfig = async () => {
  const elasticsearchUrl = await getSecret(
    environment.ELASTICSEARCH_URL_SECRET
  );
  const elasticsearchApiKey = await getSecret(
    environment.ELASTICSEARCH_API_KEY_SECRET
  );
  if (!elasticsearchUrl || !elasticsearchApiKey) {
    throw new Error(
      "Elasticsearch URL and API key secrets need to be populated!"
    );
  }
  return {
    elasticsearchUrl,
    elasticsearchApiKey,
    dataStreamName: environment.DATA_STREAM_NAME,
  } as const;
};
