export type WordPressPage = {
  externalId: string;
  title: string;
  slug: string;
  status: string;
  sourceUrl: string;
  html: string;
  text: string;
  shortcodes: string[];
};

export type MediaManifestEntry = {
  externalId: string;
  title: string;
  sourceUrl: string;
  proposedPublicPath: string;
  kind: "property" | "destination" | "host" | "brand" | "legacy";
  approved: boolean;
};

export type SeasonalPrice = {
  label: string;
  nightlyRate: number;
};

export type WordPressExtraction = {
  generatedAt: string;
  source: { path: string; sha256: string; baseSiteUrl: string };
  totals: { records: number; pages: number; publishedPages: number; media: number };
  pages: WordPressPage[];
  media: MediaManifestEntry[];
  seasonalPrices: SeasonalPrice[];
};
