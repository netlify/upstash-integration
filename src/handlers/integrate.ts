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

  const { databaseId, databaseName } = JSON.parse(event.body);

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
