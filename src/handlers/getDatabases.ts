import { UpstashIntegrationHandler, UpstashRedisDatabase } from "..";
import { response } from "../utils";

const handler: UpstashIntegrationHandler = async (event, context) => {
  if (event.body === null) {
    return response(400, "No body was provided");
  }

  const { siteId, client } = context;

  if (!siteId) {
    return response(400, "No site id was provided");
  }

  try {
    const { config } = await client.getSiteIntegration(siteId);

    const { apiKey, email } = config;

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
      return response(500, "Something went wrong");
    }

    const data = (await upstashResponse.json()) as UpstashRedisDatabase[];

    return response(200, JSON.stringify(data));
  } catch {
    return response(500, "Something went wrong");
  }
};

export default handler;
