void (async () => {
  const { existsSync } = await import("node:fs");
  const { join } = await import("node:path");
  const productionEnv = join(__dirname, ".env.production.local");
  if (existsSync(productionEnv)) process.loadEnvFile(productionEnv);
  process.env.HOSTNAME ||= "0.0.0.0";
  await import("./.next/standalone/server.js");
})();
