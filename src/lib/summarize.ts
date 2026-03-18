import Anthropic from "@anthropic-ai/sdk";
import { Article } from "./rss";
import { CATEGORY_LABELS, Category } from "./config";

const useAI = !!process.env.ANTHROPIC_API_KEY;

function formatArticlesForPrompt(articles: Article[]): string {
  const grouped = new Map<Category, Article[]>();
  for (const article of articles) {
    if (!grouped.has(article.category)) {
      grouped.set(article.category, []);
    }
    grouped.get(article.category)!.push(article);
  }

  let text = "";
  for (const [category, items] of grouped) {
    const label = CATEGORY_LABELS[category] || category;
    text += `\n=== ${label} ===\n`;
    for (const item of items) {
      text += `- [${item.source}] ${item.title}\n`;
      if (item.snippet) {
        text += `  ${item.snippet.slice(0, 200)}\n`;
      }
    }
  }

  return text;
}

async function summarizeWithAI(articles: Article[]): Promise<string> {
  const client = new Anthropic();
  const articleText = formatArticlesForPrompt(articles);

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Du er en norsk nyhetsredaktør som skriver en daglig morgendigest. Skriv en kort og engasjerende oppsummering av dagens viktigste nyheter basert på artiklene nedenfor.

Regler:
- Skriv på norsk (bokmål)
- Grupper nyhetene etter kategori (Sport, Teknologi, Økonomi, Politikk)
- Bruk emoji for hver kategori: ⚽ Sport, 💻 Teknologi, 📈 Økonomi, 🏛️ Politikk
- Fremhev de viktigste sakene i hver kategori
- Hold det kort og konsist - maks 500 ord totalt
- For NYTimes-saker: oversett og kontekstualiser for et norsk publikum
- Bruk HTML-formatering (<h2>, <p>, <ul>, <li>, <strong>) for e-postvennlig visning
- Start med en kort "God morgen!"-hilsen med dagens dato

Her er dagens nyhetsartikler:
${articleText}`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  return textBlock?.text || "<p>Kunne ikke generere oppsummering.</p>";
}

function summarizeWithoutAI(articles: Article[]): string {
  const today = new Date().toLocaleDateString("nb-NO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const grouped = new Map<Category, Article[]>();
  for (const article of articles) {
    if (!grouped.has(article.category)) {
      grouped.set(article.category, []);
    }
    grouped.get(article.category)!.push(article);
  }

  const emojis: Record<Category, string> = {
    sport: "⚽",
    teknologi: "💻",
    okonomi: "📈",
    politikk: "🏛️",
  };

  let html = `<h2>God morgen! ☀️</h2>\n`;
  html += `<p>Her er nyhetsoversikten for <strong>${today}</strong>.</p>\n`;

  for (const [category, items] of grouped) {
    const label = CATEGORY_LABELS[category] || category;
    const emoji = emojis[category] || "📰";

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

export async function summarizeNews(articles: Article[]): Promise<string> {
  if (articles.length === 0) {
    return "<p>Ingen nyhetsartikler ble funnet i dag.</p>";
  }

  if (useAI) {
    console.log("[Morgennytt] Bruker Claude AI for oppsummering");
    return summarizeWithAI(articles);
  }

  console.log("[Morgennytt] Bruker enkel HTML-formatering (ingen API-nøkkel)");
  return summarizeWithoutAI(articles);
}
