import { UpstashIntegrationHandler } from "..";
import { response } from "../utils";

const handler: UpstashIntegrationHandler = async (event, context) => {
  const { apiKey, email } = JSON.parse(event.body ?? "{}");

  const { siteId, client } = context;

  if (!siteId) {
    return response(400, "No site id was provided");
  }

  if (!apiKey) {
    return response(400, "No api key was provided");
  }

  if (!email) {
    return response(400, "No email was provided");
  }

  try {
    await client.updateSiteIntegration(siteId, {
      apiKey,
      email,
      databases: [],
    });
  } catch {
    return response(500, "Something went wrong");
  }

  return response(200, "Successfully connected");
};

export default handler;
