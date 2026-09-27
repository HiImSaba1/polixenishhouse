import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { extractSeasonalPrices, extractWordPressXml } from "./extract";

describe("WordPress extraction", () => {
  it("extracts every seasonal price without embedding presentation markup", () => {
    expect(extractSeasonalPrices("<h2>May (15-30)</h2><h2>Price: <b>110€</b></h2><h2>June</h2><h2>Price: 135€</h2>"))
      .toEqual([
        { label: "May (15-30)", nightlyRate: 110 },
        { label: "June", nightlyRate: 135 },
      ]);
  });

  it("extracts WXR pages, shortcodes and approved media candidates", () => {
    const xml = `<?xml version="1.0"?><rss><channel><wp:base_site_url>https://polixenishouse.gr</wp:base_site_url><item><title>Home</title><link>https://polixenishouse.gr/</link><content:encoded><![CDATA[<h2>June</h2><h2>Price: 135€</h2>[vikbooking view="search"]]]></content:encoded><wp:post_id>1</wp:post_id><wp:post_name>homepa</wp:post_name><wp:status>publish</wp:status><wp:post_type>page</wp:post_type></item><item><title>Polixenis_house_picture_1</title><wp:post_id>2</wp:post_id><wp:post_type>attachment</wp:post_type><wp:attachment_url>https://polixenishouse.gr/wp-content/uploads/house.jpg</wp:attachment_url></item></channel></rss>`;
    const result = extractWordPressXml(xml, { sourcePath: "fixture.xml", sha256: "fixture", generatedAt: "2026-09-26T00:00:00.000Z" });
    expect(result.totals).toEqual({ records: 2, pages: 1, publishedPages: 1, media: 1 });
    expect(result.pages[0]?.shortcodes).toEqual(["vikbooking view=\"search\""]);
    expect(result.media[0]).toMatchObject({ kind: "property", approved: false });
  });

  const sourcePath = resolve("polixenishouse.WordPress.2026-09-26.xml");
  it.runIf(existsSync(sourcePath))("audits the private source WXR inventory when it is locally available", () => {
    const path = sourcePath;
    const result = extractWordPressXml(readFileSync(path, "utf8"), {
      sourcePath: path,
      sha256: "test",
      generatedAt: "2026-09-26T00:00:00.000Z",
    });

    expect(result.totals).toEqual({ records: 172, pages: 12, publishedPages: 11, media: 92 });
    expect(result.seasonalPrices.map((price) => price.nightlyRate)).toEqual([110, 135, 155, 175, 135, 120]);
    expect(result.pages.flatMap((page) => page.shortcodes).filter((value) => value.startsWith("vikbooking"))).toHaveLength(5);
    expect(result.media.filter((entry) => entry.kind === "property").length).toBeGreaterThanOrEqual(31);
  });
});
