import Parser from "rss-parser";
import { FEEDS, ARTICLE_MAX_AGE_HOURS } from "./config";

export interface Article {
  source: string;
  title: string;
  link: string;
  snippet: string;
  pubDate?: string;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function isWithinTimeWindow(pubDate: string | undefined, hours: number): boolean {
  if (!pubDate) return true; // Inkluder artikler uten dato
  const articleDate = new Date(pubDate);
  if (isNaN(articleDate.getTime())) return true;
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
  return articleDate >= cutoff;
}

export async function fetchAllFeeds(): Promise<Article[]> {
  const parser = new Parser({
    timeout: 10000,
    headers: {
      "User-Agent": "Morgennytt/1.0 (News Digest Bot)",
    },
  });

  const results = await Promise.allSettled(
    FEEDS.map(async (feed) => {
      const parsed = await parser.parseURL(feed.url);
      return parsed.items.map((item) => ({
        source: feed.name,
        title: item.title || "Uten tittel",
        link: item.link || "",
        snippet: stripHtml(
          item.contentSnippet || item.content || item.summary || ""
        ),
        pubDate: item.pubDate || item.isoDate || undefined,
      }));
    })
  );

  const allArticles: Article[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allArticles.push(...result.value);
    } else {
      console.error("Feil ved henting av RSS-feed:", result.reason);
    }
  }

  // Filtrer på tid
  const recent = allArticles.filter((a) =>
    isWithinTimeWindow(a.pubDate, ARTICLE_MAX_AGE_HOURS)
  );

  // Dedupliser på tittel
  const seen = new Set<string>();
  const unique: Article[] = [];
  for (const article of recent) {
    if (!seen.has(article.title)) {
      seen.add(article.title);
      unique.push(article);
    }
  }

  // Sorter nyeste først
  unique.sort((a, b) => {
    const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return dateB - dateA;
  });

  return unique;
}
