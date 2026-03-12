import Parser from "rss-parser";

export interface Article {
  source: string;
  title: string;
  link: string;
  snippet: string;
  pubDate?: string;
}

const RSS_FEEDS = [
  { name: "VG", url: "https://www.vg.no/rss/feed/?format=rss" },
  { name: "Aftenposten", url: "https://www.aftenposten.no/rss" },
  { name: "NRK", url: "https://www.nrk.no/toppsaker.rss" },
  { name: "NYTimes", url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml" },
];

const MAX_ARTICLES_PER_FEED = 10;

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

export async function fetchAllFeeds(): Promise<Article[]> {
  const parser = new Parser({
    timeout: 10000,
    headers: {
      "User-Agent": "Morgennytt/1.0 (News Digest Bot)",
    },
  });

  const results = await Promise.allSettled(
    RSS_FEEDS.map(async (feed) => {
      const parsed = await parser.parseURL(feed.url);
      return parsed.items.slice(0, MAX_ARTICLES_PER_FEED).map((item) => ({
        source: feed.name,
        title: item.title || "Uten tittel",
        link: item.link || "",
        snippet: stripHtml(item.contentSnippet || item.content || item.summary || ""),
        pubDate: item.pubDate || item.isoDate || undefined,
      }));
    })
  );

  const articles: Article[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      articles.push(...result.value);
    } else {
      console.error("Feil ved henting av RSS-feed:", result.reason);
    }
  }

  return articles;
}
