// ────────────────────────────────────────────────────────
// Morgennytt — Kategori- og feed-konfigurasjon
// ────────────────────────────────────────────────────────
// Endre denne filen for å legge til/fjerne kategorier,
// feeds eller justere standard antall artikler.

export const CATEGORIES = ["sport", "teknologi", "okonomi", "politikk"] as const;
export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  sport: "Sport",
  teknologi: "Teknologi",
  okonomi: "Økonomi",
  politikk: "Politikk",
};

export interface FeedConfig {
  name: string;
  url: string;
  category: Category;
  enabled: boolean;
}

export const FEEDS: FeedConfig[] = [
  // ── Sport ──────────────────────────────────────────────
  {
    name: "NRK Sport",
    url: "https://www.nrk.no/sport/toppsaker.rss",
    category: "sport",
    enabled: true,
  },
  {
    name: "VG",
    url: "https://www.vg.no/rss/feed/?format=rss",
    category: "sport",
    enabled: true,
  },
  {
    name: "NYT Sports",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml",
    category: "sport",
    enabled: true,
  },

  // ── Teknologi ──────────────────────────────────────────
  {
    name: "NRK Teknologi",
    url: "https://www.nrk.no/teknologi/toppsaker.rss",
    category: "teknologi",
    enabled: true,
  },
  {
    name: "NYT Technology",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml",
    category: "teknologi",
    enabled: true,
  },

  // ── Økonomi ────────────────────────────────────────────
  {
    name: "Aftenposten",
    url: "https://www.aftenposten.no/rss",
    category: "okonomi",
    enabled: true,
  },
  {
    name: "NYT Business",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Business.xml",
    category: "okonomi",
    enabled: true,
  },

  // ── Politikk ───────────────────────────────────────────
  {
    name: "NRK",
    url: "https://www.nrk.no/toppsaker.rss",
    category: "politikk",
    enabled: true,
  },
  {
    name: "Aftenposten",
    url: "https://www.aftenposten.no/rss",
    category: "politikk",
    enabled: true,
  },
  {
    name: "NYT Politics",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml",
    category: "politikk",
    enabled: true,
  },
];

/** Standard antall artikler per kategori */
export const DEFAULT_ARTICLES_PER_CATEGORY = 5;

/** Standard kategorier som inkluderes i digest */
export const DEFAULT_CATEGORIES: Category[] = [...CATEGORIES];

/** Sjekk om en streng er en gyldig kategori */
export function isValidCategory(value: string): value is Category {
  return CATEGORIES.includes(value as Category);
}
