import { NextRequest, NextResponse } from "next/server";
import { fetchAllFeeds } from "@/lib/rss";
import { summarizeNews } from "@/lib/summarize";
import { sendDigestEmail } from "@/lib/email";
import {
  CATEGORIES,
  CATEGORY_LABELS,
  DEFAULT_ARTICLES_PER_CATEGORY,
  isValidCategory,
  type Category,
} from "@/lib/config";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const auto = searchParams.get("auto");

  // Parse kategori- og mengdeparametre
  const categoriesParam = searchParams.get("categories");
  const limitParam = searchParams.get("limit");

  // Parse kategorier (kommaseparert)
  let categories: Category[] | undefined;
  if (categoriesParam) {
    const requested = categoriesParam.split(",").map((c) => c.trim().toLowerCase());
    const valid = requested.filter(isValidCategory);
    if (valid.length > 0) {
      categories = valid;
    }
  }

  // Parse limit
  let articlesPerCategory: number | undefined;
  if (limitParam) {
    const parsed = parseInt(limitParam, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 20) {
      articlesPerCategory = parsed;
    }
  }

  // Info-endepunkt når kalt uten auto=1
  if (auto !== "1") {
    return NextResponse.json({
      name: "Morgennytt News Digest",
      description:
        "Henter nyheter fra norske og internasjonale kilder, gruppert etter kategori, og sender som e-post.",
      usage: {
        trigger: "GET /api/news-digest?auto=1",
        withCategories:
          "GET /api/news-digest?auto=1&categories=sport,teknologi",
        withLimit: "GET /api/news-digest?auto=1&limit=3",
        full: "GET /api/news-digest?auto=1&categories=sport,politikk&limit=5",
      },
      availableCategories: Object.entries(CATEGORY_LABELS).map(
        ([key, label]) => ({ key, label })
      ),
      defaults: {
        categories: [...CATEGORIES],
        articlesPerCategory: DEFAULT_ARTICLES_PER_CATEGORY,
      },
    });
  }

  // Autorisering: Vercel Cron-secret eller manuell trigger
  const cronSecret = request.headers.get("authorization");
  const isCron =
    cronSecret === `Bearer ${process.env.CRON_SECRET}` && auto === "1";
  const isManualAuto = auto === "1" && !process.env.CRON_SECRET;

  if (!isCron && !isManualAuto) {
    return NextResponse.json(
      { success: false, message: "Ugyldig autorisering" },
      { status: 401 }
    );
  }

  try {
    console.log("[Morgennytt] Starter nyhetsdigest...");
    console.log(
      `[Morgennytt] Kategorier: ${(categories ?? CATEGORIES).join(", ")}`
    );
    console.log(
      `[Morgennytt] Artikler per kategori: ${articlesPerCategory ?? DEFAULT_ARTICLES_PER_CATEGORY}`
    );

    // Steg 1: Hent RSS-feeds
    console.log("[Morgennytt] Henter RSS-feeds...");
    const articles = await fetchAllFeeds({ categories, articlesPerCategory });
    console.log(`[Morgennytt] Hentet ${articles.length} artikler`);

    if (articles.length === 0) {
      return NextResponse.json({
        success: false,
        message: "Ingen artikler funnet fra RSS-feeds",
        articleCount: 0,
      });
    }

    // Steg 2: Formater digest
    console.log("[Morgennytt] Formaterer digest...");
    const summary = await summarizeNews(articles);

    // Steg 3: Send e-post
    console.log("[Morgennytt] Sender e-post...");
    await sendDigestEmail(summary, articles.length);
    console.log("[Morgennytt] E-post sendt!");

    return NextResponse.json({
      success: true,
      message: "Nyhetsdigest generert og sendt!",
      articleCount: articles.length,
      categories: categories ?? [...CATEGORIES],
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
