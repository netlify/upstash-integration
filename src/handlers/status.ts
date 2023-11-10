import { Status, UpstashIntegrationHandler } from "..";

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

    const { apiKey } = config;

    // If there is an API key, make a probe request to see if combo of email and api key is valid
    let error: string | undefined;
    if (apiKey) {
      const response = await fetch(
        "https://api.upstash.com/v2/redis/databases",
        {
          headers: {
            Authorization: "Basic " + btoa(config.email + ":" + apiKey),
          },
        },
      );

      if (response.status !== 200) {
        error = "Unauthorized";
      }
    }

    const status: Status = {
      connected: apiKey && !error ? true : false,
      databases: config.databases,
      error,
    };
    return {
      statusCode: 200,
      body: JSON.stringify(status),
    };
  } catch {
    return {
      statusCode: 200,
      body: JSON.stringify({
        connected: false,
      }),
    };
  }
};

export default handler;
