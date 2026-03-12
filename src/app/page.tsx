export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-zinc-950">
      <main className="flex w-full max-w-2xl flex-col gap-8 px-8 py-16">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Morgennytt
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Automatisk daglig nyhetsdigest med AI-oppsummering
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Hvordan det fungerer
          </h2>
          <ol className="list-inside list-decimal space-y-2 text-zinc-600 dark:text-zinc-400">
            <li>
              Henter nyheter fra{" "}
              <strong className="text-zinc-900 dark:text-zinc-200">
                VG, Aftenposten, NRK
              </strong>{" "}
              og{" "}
              <strong className="text-zinc-900 dark:text-zinc-200">
                The New York Times
              </strong>
            </li>
            <li>
              Oppsummerer med{" "}
              <strong className="text-zinc-900 dark:text-zinc-200">
                Claude AI
              </strong>
            </li>
            <li>Sender oppsummeringen som e-post hver morgen kl. 08:00</li>
          </ol>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            API
          </h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <code className="rounded bg-zinc-100 px-2 py-1 text-sm font-mono text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                GET
              </code>
              <code className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
                /api/news-digest
              </code>
              <span className="text-sm text-zinc-500">- Info</span>
            </div>
            <div className="flex items-center gap-2">
              <code className="rounded bg-zinc-100 px-2 py-1 text-sm font-mono text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200">
                GET
              </code>
              <code className="text-sm font-mono text-zinc-600 dark:text-zinc-400">
                /api/news-digest?auto=1
              </code>
              <span className="text-sm text-zinc-500">
                - Trigger digest
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-zinc-400 dark:text-zinc-600">
          Drevet av Next.js, Vercel Cron og Claude AI
        </p>
      </main>
    </div>
  );
}
