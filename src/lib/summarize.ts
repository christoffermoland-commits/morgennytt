import Anthropic from "@anthropic-ai/sdk";
import { Article } from "./rss";

const client = new Anthropic();

function formatArticlesForPrompt(articles: Article[]): string {
  const grouped: Record<string, Article[]> = {};
  for (const article of articles) {
    if (!grouped[article.source]) {
      grouped[article.source] = [];
    }
    grouped[article.source].push(article);
  }

  let text = "";
  for (const [source, items] of Object.entries(grouped)) {
    text += `\n=== ${source} ===\n`;
    for (const item of items) {
      text += `- ${item.title}\n`;
      if (item.snippet) {
        text += `  ${item.snippet.slice(0, 200)}\n`;
      }
    }
  }

  return text;
}

export async function summarizeNews(articles: Article[]): Promise<string> {
  if (articles.length === 0) {
    return "<p>Ingen nyhetsartikler ble funnet i dag.</p>";
  }

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
- Grupper nyhetene tematisk (ikke per kilde)
- Fremhev de 5-8 viktigste sakene
- Hold det kort og konsist - maks 500 ord
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
