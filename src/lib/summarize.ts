import { Article } from "./rss";

/**
 * Formaterer nyhetsartikler som en pen HTML-digest, gruppert per kilde.
 *
 * Merk: For AI-oppsummering med Claude, installer @anthropic-ai/sdk,
 * sett ANTHROPIC_API_KEY, og bytt til summarizeNewsWithAI()-funksjonen.
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

  // Grupper artikler per kilde
  const grouped: Record<string, Article[]> = {};
  for (const article of articles) {
    if (!grouped[article.source]) {
      grouped[article.source] = [];
    }
    grouped[article.source].push(article);
  }

  let html = `<h2>God morgen! ☀️</h2>\n`;
  html += `<p>Her er nyhetsoversikten for <strong>${today}</strong>.</p>\n`;

  for (const [source, items] of Object.entries(grouped)) {
    html += `<h2>${source}</h2>\n<ul>\n`;
    for (const item of items) {
      const snippet = item.snippet
        ? ` — <span style="color:#555">${item.snippet.slice(0, 120)}${item.snippet.length > 120 ? "..." : ""}</span>`
        : "";
      html += `  <li><a href="${item.link}" style="color:#1a0dab;text-decoration:none"><strong>${item.title}</strong></a>${snippet}</li>\n`;
    }
    html += `</ul>\n`;
  }

  html += `<p style="color:#888;font-size:0.9em;margin-top:24px;">Totalt ${articles.length} artikler fra ${Object.keys(grouped).length} kilder.</p>`;

  return html;
}

// ────────────────────────────────────────────────────────
// Valgfri: AI-oppsummering med Claude
// ────────────────────────────────────────────────────────
// For å aktivere AI-oppsummering:
// 1. npm install @anthropic-ai/sdk
// 2. Sett ANTHROPIC_API_KEY i miljøvariabler
// 3. Bytt navn: summarizeNewsWithAI -> summarizeNews
//
// export async function summarizeNewsWithAI(articles: Article[]): Promise<string> {
//   const Anthropic = (await import("@anthropic-ai/sdk")).default;
//   const client = new Anthropic();
//
//   const grouped: Record<string, Article[]> = {};
//   for (const article of articles) {
//     if (!grouped[article.source]) grouped[article.source] = [];
//     grouped[article.source].push(article);
//   }
//
//   let text = "";
//   for (const [source, items] of Object.entries(grouped)) {
//     text += `\n=== ${source} ===\n`;
//     for (const item of items) {
//       text += `- ${item.title}\n`;
//       if (item.snippet) text += `  ${item.snippet.slice(0, 200)}\n`;
//     }
//   }
//
//   const message = await client.messages.create({
//     model: "claude-sonnet-4-20250514",
//     max_tokens: 4096,
//     messages: [{
//       role: "user",
//       content: `Du er en norsk nyhetsredaktør. Skriv en kort morgendigest på norsk basert på:\n${text}`
//     }],
//   });
//
//   const block = message.content.find((b) => b.type === "text");
//   return block?.text || "<p>Kunne ikke generere oppsummering.</p>";
// }
