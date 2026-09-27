import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { extractWordPressXml } from "../src/features/wordpress/extract";

function argument(name: string) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const source = resolve(argument("--source") ?? "polixenishouse.WordPress.2026-09-26.xml");
  const output = resolve(argument("--output") ?? "artifacts/wordpress");
  const xml = await readFile(source, "utf8");
  const sha256 = createHash("sha256").update(xml).digest("hex");
  const extraction = extractWordPressXml(xml, { sourcePath: source, sha256 });

  await mkdir(output, { recursive: true });
  const manifestPath = resolve(output, "media-manifest.json");
  try {
    const previousJson = (await readFile(manifestPath, "utf8")).replace(/^\uFEFF/, "");
    const previous = JSON.parse(previousJson) as Array<{
      externalId: string;
      sourceUrl: string;
      approved?: boolean;
    }>;
    const approvals = new Set(
      previous
        .filter((entry) => entry.approved === true)
        .map((entry) => `${entry.externalId}\u0000${entry.sourceUrl}`),
    );
    for (const entry of extraction.media) {
      entry.approved = approvals.has(`${entry.externalId}\u0000${entry.sourceUrl}`);
    }
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? error.code : null;
    if (code !== "ENOENT") throw error;
  }
  await writeFile(resolve(output, "content.json"), `${JSON.stringify(extraction, null, 2)}\n`, "utf8");
  await writeFile(manifestPath, `${JSON.stringify(extraction.media, null, 2)}\n`, "utf8");

  const summary = `# WordPress extraction\n\n- Source SHA-256: \`${sha256}\`\n- Records: **${extraction.totals.records}**\n- Pages: **${extraction.totals.pages}** (${extraction.totals.publishedPages} published)\n- Attachments: **${extraction.totals.media}**\n- Property-photo candidates: **${extraction.media.filter((entry) => entry.kind === "property").length}**\n- VikBooking data recovered: **shortcodes only; no reservations, blocked dates, or historical records**\n\nThe downloader only accepts entries with \`approved: true\`. Review the generated manifest before executing a network download.\n`;
  await writeFile(resolve(output, "README.md"), summary, "utf8");
  process.stdout.write(`Extracted ${extraction.totals.records} WordPress records.\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
