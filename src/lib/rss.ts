import Parser from "rss-parser";
import {
  Category,
  FEEDS,
  DEFAULT_CATEGORIES,
  DEFAULT_ARTICLES_PER_CATEGORY,
  CATEGORY_LABELS,
} from "./config";

export interface Article {
  source: string;
  category: Category;
  categoryLabel: string;
  title: string;
  link: string;
  snippet: string;
  pubDate?: string;
}

export interface FetchOptions {
  categories?: Category[];
  articlesPerCategory?: number;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export async function fetchAllFeeds(options?: FetchOptions): Promise<Article[]> {
  const categories = options?.categories ?? DEFAULT_CATEGORIES;
  const limit = options?.articlesPerCategory ?? DEFAULT_ARTICLES_PER_CATEGORY;

  // Filtrer feeds: kun aktiverte feeds i valgte kategorier
  const activeFeeds = FEEDS.filter(
    (feed) => feed.enabled && categories.includes(feed.category)
  );

  // Dedupliser feeds med samme URL (kan forekomme hvis en feed brukes i flere kategorier)
  const uniqueFeeds = new Map<string, typeof activeFeeds>();
  for (const feed of activeFeeds) {
    const key = feed.url;
    if (!uniqueFeeds.has(key)) {
      uniqueFeeds.set(key, []);
    }
    uniqueFeeds.get(key)!.push(feed);
  }

  const parser = new Parser({
    timeout: 10000,
    headers: {
      "User-Agent": "Morgennytt/1.0 (News Digest Bot)",
    },
  });

  // Hent alle unike feeds parallelt
  const results = await Promise.allSettled(
    Array.from(uniqueFeeds.entries()).map(async ([url, feedConfigs]) => {
      const parsed = await parser.parseURL(url);
      const articles: Article[] = [];

      for (const feedConfig of feedConfigs) {
        // Bare inkluder artikler for kategorier vi faktisk ba om
        if (!categories.includes(feedConfig.category)) continue;

        const items = parsed.items.slice(0, limit);
        for (const item of items) {
          articles.push({
            source: feedConfig.name,
            category: feedConfig.category,
            categoryLabel: CATEGORY_LABELS[feedConfig.category],
            title: item.title || "Uten tittel",
            link: item.link || "",
            snippet: stripHtml(
              item.contentSnippet || item.content || item.summary || ""
            ),
            pubDate: item.pubDate || item.isoDate || undefined,
          });
        }
      }

      return articles;
    })
  );

  // Samle alle artikler, logg eventuelle feil
  const allArticles: Article[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      allArticles.push(...result.value);
    } else {
      console.error("Feil ved henting av RSS-feed:", result.reason);
    }
  }

  // Dedupliser artikler med samme tittel innenfor samme kategori
  const seen = new Set<string>();
  const deduplicated: Article[] = [];
  for (const article of allArticles) {
    const key = `${article.category}:${article.title}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduplicated.push(article);
    }
  }

  // Begrens per kategori
  const perCategory = new Map<Category, Article[]>();
  for (const article of deduplicated) {
    if (!perCategory.has(article.category)) {
      perCategory.set(article.category, []);
    }
    const list = perCategory.get(article.category)!;
    if (list.length < limit) {
      list.push(article);
    }
  }

  // Returner i kategori-rekkefølge
  const finalArticles: Article[] = [];
  for (const cat of categories) {
    const items = perCategory.get(cat) || [];
    finalArticles.push(...items);
  }

  return finalArticles;
}
