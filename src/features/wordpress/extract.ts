import sanitizeHtml from "sanitize-html";
import { XMLParser } from "fast-xml-parser";
import type {
  MediaManifestEntry,
  SeasonalPrice,
  WordPressExtraction,
  WordPressPage,
} from "./types";

function list<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function text(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
  if (value && typeof value === "object" && "#text" in value) {
    return text((value as { "#text": unknown })["#text"]);
  }
  return "";
}

function plainText(html: string) {
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} })
    .replace(/\s+/g, " ")
    .trim();
}

function slug(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "media";
}

function mediaKind(title: string): MediaManifestEntry["kind"] {
  const value = title.toLowerCase();
  if (/polixenis_house_picture|house_(?:beds|baseroom)|apartment/.test(value)) return "property";
  if (/agios|beach|nikolaos/.test(value)) return "destination";
  if (/profile|husband|team-hover/.test(value)) return "host";
  if (/logo|favicon/.test(value)) return "brand";
  return "legacy";
}

function publicPath(urlValue: string, title: string, kind: MediaManifestEntry["kind"]) {
  const url = new URL(urlValue);
  const fileName = decodeURIComponent(url.pathname.split("/").pop() || title);
  const dot = fileName.lastIndexOf(".");
  const extension = dot >= 0 ? fileName.slice(dot + 1).toLowerCase() : "bin";
  return `/images/${kind}/${slug(dot >= 0 ? fileName.slice(0, dot) : fileName)}.${extension}`;
}

export function extractSeasonalPrices(value: string): SeasonalPrice[] {
  const normalized = plainText(value);
  const matches = [...normalized.matchAll(/(May\s*\([^)]*\)|June|July|August|September\s*\([^)]*\))\s*Price:\s*(\d+)\s*€/gi)];
  return matches.map((match) => ({ label: match[1].replace(/\s+/g, " ").trim(), nightlyRate: Number(match[2]) }));
}

export function extractWordPressXml(
  xml: string,
  input: { sourcePath: string; sha256: string; generatedAt?: string },
): WordPressExtraction {
  const parser = new XMLParser({ ignoreAttributes: false, trimValues: false });
  const parsed = parser.parse(xml) as Record<string, unknown>;
  const channel = (parsed.rss as { channel?: Record<string, unknown> } | undefined)?.channel;
  if (!channel) throw new Error("The source is not a readable WordPress WXR export.");

  const items = list(channel.item as Record<string, unknown> | Record<string, unknown>[] | undefined);
  const pages: WordPressPage[] = [];
  const media: MediaManifestEntry[] = [];

  for (const item of items) {
    const type = text(item["wp:post_type"]);
    const title = text(item.title);
    if (type === "page") {
      const html = text(item["content:encoded"]);
      pages.push({
        externalId: text(item["wp:post_id"]),
        title,
        slug: text(item["wp:post_name"]),
        status: text(item["wp:status"]),
        sourceUrl: text(item.link),
        html,
        text: plainText(html),
        shortcodes: [...html.matchAll(/\[(vikbooking[^\]]*)\]/gi)].map((match) => match[1]),
      });
    }
    if (type === "attachment") {
      const sourceUrl = text(item["wp:attachment_url"]);
      if (!sourceUrl) continue;
      const kind = mediaKind(title);
      media.push({
        externalId: text(item["wp:post_id"]),
        title,
        sourceUrl,
        proposedPublicPath: publicPath(sourceUrl, title, kind),
        kind,
        approved: false,
      });
    }
  }

  const home = pages.find((page) => page.slug === "homepa");
  return {
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    source: {
      path: input.sourcePath,
      sha256: input.sha256,
      baseSiteUrl: text(channel["wp:base_site_url"] || channel.link),
    },
    totals: {
      records: items.length,
      pages: pages.length,
      publishedPages: pages.filter((page) => page.status === "publish").length,
      media: media.length,
    },
    pages,
    media,
    seasonalPrices: home ? extractSeasonalPrices(home.html) : [],
  };
}
