export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="flex w-full max-w-2xl flex-col gap-8 px-8 py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Morgennytt
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Din daglige morgenmail med nyheter, vær og quiz
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Hva du får hver morgen
          </h2>
          <ul className="space-y-2 text-zinc-600 dark:text-zinc-400">
            <li>
              ☀️{" "}
              <strong className="text-zinc-900 dark:text-zinc-200">
                Værvarsel
              </strong>{" "}
              for Arendal fra Yr.no
            </li>
            <li>
              📰{" "}
              <strong className="text-zinc-900 dark:text-zinc-200">
                Topp 5 nyheter
              </strong>{" "}
              fra siste 12 timer, oppsummert med AI
            </li>
            <li>
              🧠{" "}
              <strong className="text-zinc-900 dark:text-zinc-200">
                Dagens Quiz
              </strong>{" "}
              fra Aftenposten
            </li>
          </ul>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-500">
            Kilder: VG, Aftenposten, NRK, The New York Times
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
              <p className="mt-1 text-sm text-zinc-500">Info og status</p>
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
                Trigger full morgenmail
              </p>
            </div>
          </div>
        </div>

        <p className="text-sm text-zinc-400 dark:text-zinc-600">
          Sendes hverdager kl. 07:00 · Drevet av Next.js og Vercel Cron
        </p>
      </main>
    </div>
  );
}
