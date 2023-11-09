import { EnvVarRequest } from "@netlify/sdk/client";
import { UpstashIntegrationHandler, UpstashRedisDatabase } from "..";
import { getEnvVarName } from "../utils/netlify";

const handler: UpstashIntegrationHandler = async (event, context) => {
  if (event.body === null) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "No body was provided",
      }),
    };
  }

  const { databaseId, databaseName } = JSON.parse(event.body);

  const { siteId, client, teamId } = context;

  if (!siteId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "No site id was provided",
      }),
    };
  }

  if (!teamId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "No team id was provided",
      }),
    };
  }

  try {
    const currentConfig = await client.getSiteIntegration(siteId);

    await client.updateSiteIntegration(siteId, {
      ...currentConfig.config,
      databases: currentConfig.config.databases?.length
        ? [
            ...currentConfig.config.databases,
            { name: databaseName, id: databaseId },
          ]
        : [{ name: databaseName, id: databaseId }],
    });

    const upstashDatabaseResponse = await fetch(
      `  https://api.upstash.com/v2/redis/database/${databaseId}`,
      {
        headers: {
          Authorization:
            "Basic " +
            btoa(
              currentConfig.config.email + ":" + currentConfig.config.apiKey,
            ),
        },
      },
    );

    const upstashDatabase =
      (await upstashDatabaseResponse.json()) as UpstashRedisDatabase;

    const redisUrlKey = getEnvVarName(upstashDatabase.database_name, "URL");
    const redisTokenKey = getEnvVarName(upstashDatabase.database_name, "TOKEN");

    const envVarRequests: Record<string, EnvVarRequest> = {
      [redisUrlKey]: upstashDatabase.endpoint,
      [redisTokenKey]: upstashDatabase.rest_token,
    };

    await client.createOrUpdateVariables({
      accountId: teamId,
      siteId,
      variables: envVarRequests,
    });
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Something went wrong",
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Successfully integrated",
    }),
  };
};

export default handler;
