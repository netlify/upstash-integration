export const getEnvVarName = (redisDBName: string, envVarName: string) =>
  redisDBName.replace(/-/g, "_").toUpperCase() +
  "_REDIS_REST_" +
  envVarName.toUpperCase();
