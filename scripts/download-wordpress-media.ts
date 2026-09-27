import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import sharp from "sharp";
import type { MediaManifestEntry } from "../src/features/wordpress/types";

function argument(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  if (!process.argv.includes("--execute")) {
    throw new Error("Dry-run guard: inspect the manifest, then add --execute.");
  }

  const manifestPath = resolve(argument("--manifest") ?? "artifacts/wordpress/media-manifest.json");
  const publicRoot = resolve("public");
  const imageRoot = resolve(publicRoot, "images");
  const manifestJson = (await readFile(manifestPath, "utf8")).replace(/^\uFEFF/, "");
  const manifest = JSON.parse(manifestJson) as MediaManifestEntry[];
  const approved = manifest.filter((entry) => entry.approved);
  if (!approved.length) throw new Error("No media entries are approved.");

  const hashes = new Set<string>();
  const report: Array<Record<string, unknown>> = [];
  for (const entry of approved) {
    const destination = resolve(publicRoot, entry.proposedPublicPath.replace(/^\/+/, ""));
    const relativeDestination = relative(imageRoot, destination);
    if (relativeDestination.startsWith("..") || relativeDestination.includes(":")) {
      throw new Error(`Rejected destination: ${entry.proposedPublicPath}`);
    }
    const url = new URL(entry.sourceUrl);
    if (url.protocol !== "https:" || url.hostname !== "polixenishouse.gr") {
      throw new Error(`Rejected media source: ${entry.sourceUrl}`);
    }

    let bytes: Buffer;
    try {
      bytes = await readFile(destination);
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? error.code : null;
      if (code !== "ENOENT") throw error;
      let response: Response | undefined;
      let lastError: unknown;
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        try {
          response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(30_000) });
          if (response.ok) break;
          lastError = new Error(`HTTP ${response.status}`);
        } catch (fetchError) {
          lastError = fetchError;
        }
      }
      if (!response?.ok) {
        const reason = lastError instanceof Error ? lastError.message : "unknown network error";
        throw new Error(`Download failed for ${entry.sourceUrl}: ${reason}`);
      }
      bytes = Buffer.from(await response.arrayBuffer());
    }
    if (bytes.byteLength > 25 * 1024 * 1024) throw new Error(`Media exceeds 25 MB: ${entry.sourceUrl}`);
    const metadata = await sharp(bytes, { failOn: "error" }).metadata();
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    const duplicate = hashes.has(sha256);
    hashes.add(sha256);

    if (!duplicate || entry.kind === "brand") {
      await mkdir(dirname(destination), { recursive: true });
      try { await writeFile(destination, bytes, { flag: "wx" }); }
      catch (error) { const code = error && typeof error === "object" && "code" in error ? error.code : null; if (code !== "EEXIST") throw error; }
    }
    report.push({ ...entry, sha256, duplicate, byteSize: bytes.byteLength, width: metadata.width, height: metadata.height, format: metadata.format });
  }

  await writeFile(resolve(dirname(manifestPath), "download-report.json"), `${JSON.stringify({ files: report }, null, 2)}\n`, "utf8");
  const gallery = report
    .filter((entry) => entry.kind === "property" && entry.duplicate === false)
    .map(({ externalId, title, proposedPublicPath, sha256, width, height, format }) => ({
      externalId,
      title,
      src: proposedPublicPath,
      sha256,
      width,
      height,
      format,
    }));
  await mkdir(resolve(imageRoot, "property"), { recursive: true });
  await writeFile(resolve(imageRoot, "property", "manifest.json"), `${JSON.stringify(gallery, null, 2)}\n`, "utf8");
  process.stdout.write(`Verified ${approved.length} approved files (${hashes.size} unique).\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
