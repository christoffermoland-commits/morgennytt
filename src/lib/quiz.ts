import { QUIZ_TAG_URL } from "./config";

export interface QuizLink {
  title: string;
  url: string;
}

export async function fetchTodaysQuiz(): Promise<QuizLink | null> {
  try {
    const response = await fetch(QUIZ_TAG_URL, {
      headers: {
        "User-Agent": "Morgennytt/1.0 (News Digest Bot)",
      },
    });

    if (!response.ok) {
      console.error(`[Morgennytt] Quiz-side feil: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Prøv å finne quiz-lenke fra JSON-LD schema
    const jsonLdMatch = html.match(
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/
    );
    if (jsonLdMatch) {
      try {
        const schema = JSON.parse(jsonLdMatch[1]);
        const items = schema?.itemListElement || schema?.mainEntity?.itemListElement;
        if (Array.isArray(items) && items.length > 0) {
          const first = items[0]?.url || items[0]?.item?.url;
          const title = items[0]?.name || items[0]?.item?.name || "Dagens Quiz";
          if (first) {
            return { title, url: first };
          }
        }
      } catch {
        // JSON-LD parsing feilet, prøv HTML-parsing
      }
    }

    // Fallback: finn første quiz-lenke via regex
    // Ser etter lenker med "dagens-quiz" i URL-en
    const linkMatch = html.match(
      /<a[^>]*href="(https:\/\/www\.aftenposten\.no\/[^"]*dagens-quiz[^"]*)"[^>]*>/
    );
    if (linkMatch) {
      // Prøv å hente tittelen
      const titleMatch = html.match(
        new RegExp(
          `href="${linkMatch[1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"[^>]*>([^<]+)`
        )
      );
      return {
        title: titleMatch?.[1]?.trim() || "Dagens Quiz",
        url: linkMatch[1],
      };
    }

    // Siste fallback: bare lenk til quiz-oversikten
    return {
      title: "Dagens Quiz",
      url: QUIZ_TAG_URL,
    };
  } catch (error) {
    console.error("[Morgennytt] Feil ved henting av quiz:", error);
    return null;
  }
}
