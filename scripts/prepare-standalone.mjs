import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join } from "node:path";

const projectRoot = process.cwd();
const standaloneRoot = join(projectRoot, ".next", "standalone");

if (!existsSync(join(standaloneRoot, "server.js"))) {
  throw new Error("Standalone server was not generated. Confirm next.config.ts uses output: 'standalone'.");
}

for (const [source, target] of [
  [join(projectRoot, ".next", "static"), join(standaloneRoot, ".next", "static")],
  [join(projectRoot, "public"), join(standaloneRoot, "public")],
  [join(projectRoot, "drizzle"), join(standaloneRoot, "drizzle")],
]) {
  if (!existsSync(source)) throw new Error(`Required build source is missing: ${source}`);
  rmSync(target, { force: true, recursive: true });
  mkdirSync(target, { recursive: true });
  cpSync(source, target, { recursive: true });
}

cpSync(join(projectRoot, "scripts", "migrate-production.mjs"), join(standaloneRoot, "migrate-production.mjs"));
console.log("Standalone runtime prepared with static assets, public media and migrations.");
