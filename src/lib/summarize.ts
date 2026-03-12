import { Article } from "./rss";
import { CATEGORY_LABELS, Category } from "./config";

/**
 * Formaterer nyhetsartikler som en pen HTML-digest, gruppert per kategori.
 */
export async function summarizeNews(articles: Article[]): Promise<string> {
  if (articles.length === 0) {
    return "<p>Ingen nyhetsartikler ble funnet i dag.</p>";
  }

  const today = new Date().toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Grupper artikler per kategori (behold rekkefølge)
  const grouped = new Map<Category, Article[]>();
  for (const article of articles) {
    if (!grouped.has(article.category)) {
      grouped.set(article.category, []);
    }
    grouped.get(article.category)!.push(article);
  }

  let html = `<h2>God morgen! ☀️</h2>\n`;
  html += `<p>Her er nyhetsoversikten for <strong>${today}</strong>.</p>\n`;

  for (const [category, items] of grouped) {
    const label = CATEGORY_LABELS[category] || category;
    const emoji = getCategoryEmoji(category);

    html += `<h2>${emoji} ${label}</h2>\n<ul>\n`;
    for (const item of items) {
      const snippet = item.snippet
        ? ` — <span style="color:#555">${item.snippet.slice(0, 120)}${item.snippet.length > 120 ? "..." : ""}</span>`
        : "";
      html += `  <li><strong style="color:#888;font-size:0.85em">${item.source}</strong> · <a href="${item.link}" style="color:#1a0dab;text-decoration:none"><strong>${item.title}</strong></a>${snippet}</li>\n`;
    }
    html += `</ul>\n`;
  }

  const categoryCount = grouped.size;
  html += `<p style="color:#888;font-size:0.9em;margin-top:24px;">Totalt ${articles.length} artikler i ${categoryCount} ${categoryCount === 1 ? "kategori" : "kategorier"}.</p>`;

  return html;
}

function getCategoryEmoji(category: Category): string {
  const emojis: Record<Category, string> = {
    sport: "⚽",
    teknologi: "💻",
    okonomi: "📈",
    politikk: "🏛️",
  };
  return emojis[category] || "📰";
}
