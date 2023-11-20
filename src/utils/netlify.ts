export const getEnvVarName = (redisDBName: string, envVarName: string) =>
  redisDBName.replace(/-/g, "_").toUpperCase() +
  "_REDIS_REST_" +
  envVarName.toUpperCase();

export const generateCodeSnippet = (
  urlEnvVarName: string,
  tokenEnvVarName: string,
) =>
  `import { Redis } from "https://deno.land/x/upstash_redis@v1.14.0/mod.ts";

export default async () => {
  const redis = new Redis({
    url: new URL(
      \`https://\${Deno.env.get("${urlEnvVarName}")}\`,
    ).toString(),
    token: Deno.env.get("${tokenEnvVarName}"),
  });

  const counter = await redis.incr("edge_counter");

  return new Response(counter);
};

export const config = {
  path: "/counter",
};
`;
