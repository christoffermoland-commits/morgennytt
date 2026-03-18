import Anthropic from "@anthropic-ai/sdk";
import { Article } from "./rss";
import { TOP_STORIES_COUNT } from "./config";

const useAI = !!process.env.ANTHROPIC_API_KEY;

function formatArticlesForPrompt(articles: Article[]): string {
  let text = "";
  for (const article of articles) {
    text += `\n[${article.source}] ${article.title}`;
    if (article.snippet) {
      text += `\n  ${article.snippet.slice(0, 200)}`;
    }
    text += "\n";
  }
  return text;
}

async function summarizeWithAI(articles: Article[]): Promise<string> {
  const client = new Anthropic();
  const articleText = formatArticlesForPrompt(articles);

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `Du er en norsk nyhetsredaktør. Velg de ${TOP_STORIES_COUNT} viktigste nyhetene fra listen nedenfor og skriv en kort, engasjerende oppsummering av hver.

Regler:
- Skriv på norsk (bokmål)
- Velg de ${TOP_STORIES_COUNT} viktigste/mest aktuelle sakene
- For hver sak: 1-2 setninger som oppsummerer kjernen
- For NYTimes-saker: oversett og kontekstualiser for et norsk publikum
- Bruk HTML: nummerert liste med <ol>, <li>, <strong> for overskrifter
- Inkluder kildenavn i parentes etter hver sak
- Hold det kort — maks 300 ord totalt
- Ikke inkluder hilsen eller dato — bare nyhetene

Her er dagens nyhetsartikler (siste 12 timer):
${articleText}`,
      },
    ],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  return textBlock?.text || "<p>Kunne ikke generere oppsummering.</p>";
}

function summarizeWithoutAI(articles: Article[]): string {
  const top = articles.slice(0, TOP_STORIES_COUNT);

  let html = "<ol>\n";
  for (const item of top) {
    const snippet = item.snippet
      ? ` — ${item.snippet.slice(0, 120)}${item.snippet.length > 120 ? "..." : ""}`
      : "";
    html += `  <li><a href="${item.link}" style="color:#1a0dab;text-decoration:none"><strong>${item.title}</strong></a> <span style="color:#888">(${item.source})</span>${snippet}</li>\n`;
  }
  html += "</ol>\n";

  return html;
}

export async function summarizeNews(articles: Article[]): Promise<string> {
  if (articles.length === 0) {
    return "<p>Ingen nyhetsartikler ble funnet de siste 12 timene.</p>";
  }

  if (useAI) {
    console.log("[Morgennytt] Bruker Claude AI for oppsummering");
    return summarizeWithAI(articles);
  }

  console.log("[Morgennytt] Bruker enkel HTML-formatering (ingen API-nøkkel)");
  return summarizeWithoutAI(articles);
}
