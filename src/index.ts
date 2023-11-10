// Documentation: https://sdk.netlify.com
import {
  FunctionHandler,
  NetlifyIntegration,
  NetlifySdkContext,
  z,
} from "@netlify/sdk";
import connectHandler from "./handlers/connect";
import getDatabasesHandler from "./handlers/getDatabases";
import statusHandler from "./handlers/status";
import integrateHander from "./handlers/integrate";

export const siteConfigSchema = z.object({
  apiKey: z.string().nullable(),
  email: z.string().email().nullable(),
  databases: z
    .array(
      z.object({
        name: z.string(),
        id: z.string(),
      }),
    )
    .nullable(),
});

export type UpstashIntegrationHandler = FunctionHandler<
  NetlifySdkContext<z.infer<typeof siteConfigSchema>>
>;

export type UpstashRedisDatabase = {
  database_id: string;
  database_name: string;
  password: string;
  rest_token: string;
  endpoint: string;
};

export type Status = {
  connected: boolean;
  databases: { name: string; id: string }[] | null;
  error?: string;
};

const integration = new NetlifyIntegration({
  siteConfigSchema,
});

integration.addApiHandler("connect", connectHandler);
integration.addApiHandler("get-databases", getDatabasesHandler);
integration.addApiHandler("status", statusHandler);
integration.addApiHandler("integrate", integrateHander);

export { integration };
