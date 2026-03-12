export default function Home() {
  const categories = [
    { key: "sport", label: "Sport", emoji: "⚽" },
    { key: "teknologi", label: "Teknologi", emoji: "💻" },
    { key: "okonomi", label: "Økonomi", emoji: "📈" },
    { key: "politikk", label: "Politikk", emoji: "🏛️" },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="flex w-full max-w-2xl flex-col gap-8 px-8 py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Morgennytt
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Automatisk daglig nyhetsdigest med kategorifiltrering
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Kategorier
          </h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <span
                key={cat.key}
                className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-sm text-zinc-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
              >
                {cat.emoji} {cat.label}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-500">
            Kilder: NRK, VG, Aftenposten, The New York Times
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            API
          </h2>
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <code className="rounded bg-zinc-100 px-2 py-1 text-sm font-mono text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                  GET
                </code>
                <code className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
                  /api/news-digest
                </code>
              </div>
              <p className="mt-1 text-sm text-zinc-500">
                Returnerer info og tilgjengelige kategorier
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <code className="rounded bg-zinc-100 px-2 py-1 text-sm font-mono text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                  GET
                </code>
                <code className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
                  /api/news-digest?auto=1
                </code>
              </div>
              <p className="mt-1 text-sm text-zinc-500">
                Alle kategorier, 5 artikler per stk
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <code className="rounded bg-zinc-100 px-2 py-1 text-sm font-mono text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                  GET
                </code>
                <code className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
                  /api/news-digest?auto=1&categories=sport,teknologi&limit=3
                </code>
              </div>
              <p className="mt-1 text-sm text-zinc-500">
                Kun sport og teknologi, 3 artikler per kategori
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Parametre
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex gap-3">
              <code className="min-w-[120px] font-mono text-zinc-700 dark:text-zinc-300">
                categories
              </code>
              <span className="text-zinc-500">
                Kommaseparert: sport, teknologi, okonomi, politikk
              </span>
            </div>
            <div className="flex gap-3">
              <code className="min-w-[120px] font-mono text-zinc-700 dark:text-zinc-300">
                limit
              </code>
              <span className="text-zinc-500">
                Artikler per kategori (1-20, standard: 5)
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-zinc-400 dark:text-zinc-600">
          Drevet av Next.js, Vercel Cron · Daglig kl. 08:00
        </p>
      </main>
    </div>
  );
}
