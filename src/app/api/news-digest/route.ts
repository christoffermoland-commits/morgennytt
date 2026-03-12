import { NextRequest, NextResponse } from "next/server";
import { fetchAllFeeds } from "@/lib/rss";
import { summarizeNews } from "@/lib/summarize";
import { sendDigestEmail } from "@/lib/email";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const auto = searchParams.get("auto");

  // If called via Vercel Cron, verify the secret
  const cronSecret = request.headers.get("authorization");
  const isCron =
    cronSecret === `Bearer ${process.env.CRON_SECRET}` && auto === "1";
  const isManualAuto = auto === "1" && !process.env.CRON_SECRET;

  // Info-endepunkt when called without auto=1
  if (auto !== "1") {
    return NextResponse.json({
      name: "Morgennytt News Digest",
      description:
        "Henter nyheter fra VG, Aftenposten, NRK og NYTimes, oppsummerer med Claude AI og sender som e-post.",
      usage: "GET /api/news-digest?auto=1 for å trigge digest",
      sources: ["VG", "Aftenposten", "NRK", "NYTimes"],
    });
  }

  // Allow cron (with secret) or manual trigger (without CRON_SECRET set)
  if (!isCron && !isManualAuto) {
    return NextResponse.json(
      { success: false, message: "Ugyldig autorisering" },
      { status: 401 }
    );
  }

  try {
    console.log("[Morgennytt] Starter nyhetsdigest...");

    // Steg 1: Hent RSS-feeds
    console.log("[Morgennytt] Henter RSS-feeds...");
    const articles = await fetchAllFeeds();
    console.log(`[Morgennytt] Hentet ${articles.length} artikler`);

    if (articles.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Ingen artikler funnet fra RSS-feeds",
        articleCount: 0,
      });
    }

    // Steg 2: Oppsummer med Claude
    console.log("[Morgennytt] Oppsummerer med Claude...");
    const summary = await summarizeNews(articles);
    console.log("[Morgennytt] Oppsummering ferdig");

    // Steg 3: Send e-post
    console.log("[Morgennytt] Sender e-post...");
    await sendDigestEmail(summary, articles.length);
    console.log("[Morgennytt] E-post sendt!");

    return NextResponse.json({
      success: true,
      message: "Nyhetsdigest generert og sendt!",
      articleCount: articles.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Morgennytt] Feil:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Ukjent feil oppstod",
      },
      { status: 500 }
    );
  }
}
