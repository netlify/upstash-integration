import { UpstashIntegrationHandler, UpstashRedisDatabase } from "..";

const handler: UpstashIntegrationHandler = async (event, context) => {
  if (event.body === null) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "No body was provided",
      }),
    };
  }

  const { siteId, client } = context;

  if (!siteId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "No site id was provided",
      }),
    };
  }

  try {
    const { config } = await client.getSiteIntegration(siteId);

    const { apiKey, email } = config;

    // Use basic auth with email as username and api key as password

    const upstashResponse = await fetch(
      "https://api.upstash.com/v2/redis/databases",
      {
        headers: {
          Authorization: "Basic " + btoa(email + ":" + apiKey),
        },
      },
    );

    if (!upstashResponse.ok) {
      console.error(
        `Upstash response code: ${upstashResponse.status} ${upstashResponse.statusText}`,
        await upstashResponse.json(),
      );
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Something went wrong",
        }),
      };
    }

    const data = (await upstashResponse.json()) as UpstashRedisDatabase[];

    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Something went wrong",
      }),
    };
  }
};

export default handler;
