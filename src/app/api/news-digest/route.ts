import { NextRequest, NextResponse } from "next/server";
import { fetchAllFeeds } from "@/lib/rss";
import { summarizeNews } from "@/lib/summarize";
import { sendDigestEmail } from "@/lib/email";
import { fetchWeather } from "@/lib/weather";
import { fetchTodaysQuiz } from "@/lib/quiz";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const auto = searchParams.get("auto");

  // Info-endepunkt når kalt uten auto=1
  if (auto !== "1") {
    return NextResponse.json({
      name: "Morgennytt News Digest",
      description:
        "Daglig morgenmail med topp 5 nyheter (AI-oppsummert), værvarsel for Arendal og lenke til Aftenpostens quiz.",
      usage: "GET /api/news-digest?auto=1",
      schedule: "Hverdager kl. 07:00 norsk tid",
      sources: ["VG", "Aftenposten", "NRK", "NYTimes"],
      features: ["AI-oppsummering (Claude)", "Værvarsel (Yr.no)", "Dagens Quiz (Aftenposten)"],
    });
  }

  // Autorisering
  const cronSecret = request.headers.get("authorization");
  const isCron = cronSecret === `Bearer ${process.env.CRON_SECRET}`;
  const isManualAuto = !process.env.CRON_SECRET;

  if (!isCron && !isManualAuto) {
    return NextResponse.json(
      { success: false, message: "Ugyldig autorisering" },
      { status: 401 }
    );
  }

  try {
    console.log("[Morgennytt] Starter morgendigest...");

    // Hent alt parallelt
    const [articles, weather, quiz] = await Promise.all([
      fetchAllFeeds(),
      fetchWeather(),
      fetchTodaysQuiz(),
    ]);

    console.log(`[Morgennytt] Hentet ${articles.length} artikler (siste 12 timer)`);
    console.log(`[Morgennytt] Vær: ${weather ? `${weather.periods.length} perioder for ${weather.city}` : "ikke tilgjengelig"}`);
    console.log(`[Morgennytt] Quiz: ${quiz ? quiz.title : "ikke funnet"}`);

    // Oppsummer nyheter
    console.log("[Morgennytt] Oppsummerer nyheter...");
    const summary = await summarizeNews(articles);

    // Send e-post
    console.log("[Morgennytt] Sender e-post...");
    await sendDigestEmail({
      newsSummary: summary,
      weather,
      quiz,
      articleCount: articles.length,
    });
    console.log("[Morgennytt] E-post sendt!");

    return NextResponse.json({
      success: true,
      message: "Morgennytt sendt!",
      articleCount: articles.length,
      hasWeather: !!weather,
      hasQuiz: !!quiz,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Morgennytt] Feil:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Ukjent feil oppstod",
      },
      { status: 500 }
    );
  }
}
