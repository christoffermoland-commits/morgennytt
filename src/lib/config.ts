// ────────────────────────────────────────────────────────
// Morgennytt — Konfigurasjon
// ────────────────────────────────────────────────────────

export interface FeedConfig {
  name: string;
  url: string;
}

/** RSS-feeds som hentes daglig */
export const FEEDS: FeedConfig[] = [
  { name: "VG", url: "https://www.vg.no/rss/feed/?format=rss" },
  { name: "Aftenposten", url: "https://www.aftenposten.no/rss" },
  { name: "NRK", url: "https://www.nrk.no/toppsaker.rss" },
  { name: "NYTimes", url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml" },
];

/** Antall toppsaker som inkluderes i digest */
export const TOP_STORIES_COUNT = 5;

/** Tidsvindu for artikler (timer) */
export const ARTICLE_MAX_AGE_HOURS = 12;

/** Værkonfigurasjon — Arendal */
export const WEATHER = {
  city: "Arendal",
  lat: 58.46,
  lon: 8.77,
  apiUrl: "https://api.met.no/weatherapi/locationforecast/2.0/compact",
  userAgent: "Morgennytt/1.0 github.com/christoffermoland-commits/morgennytt",
};

/** Aftenposten quiz-URL */
export const QUIZ_TAG_URL = "https://www.aftenposten.no/tag/Quiz";
