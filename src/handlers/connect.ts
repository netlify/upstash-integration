import { UpstashIntegrationHandler } from "..";

const handler: UpstashIntegrationHandler = async (event, context) => {
  if (event.body === null) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "No body was provided",
      }),
    };
  }

  const { apiKey, email } = JSON.parse(event.body);

  const { siteId, client } = context;

  if (!siteId) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "No site id was provided",
      }),
    };
  }

  if (!apiKey) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "No api key was provided",
      }),
    };
  }

  if (!email) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "No email was provided",
      }),
    };
  }

  try {
    await client.updateSiteIntegration(siteId, {
      apiKey,
      email,
      databases: [],
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
      message: "Successfully connected",
    }),
  };
};

export default handler;
