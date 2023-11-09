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

    const status: Status = {
      connected: apiKey ? true : false,
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
