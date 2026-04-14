import Link from "next/link";

const FACEBOOK_PAGE_URL = "https://www.facebook.com/gankergames";

const pagePluginSrc = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(
  FACEBOOK_PAGE_URL
)}&tabs=timeline&width=500&height=1200&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false`;

export default function NoticiasPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-bold md:text-5xl">NOTICIAS</h1>
              <p className="mt-2 text-lg text-slate-300">
                Publicaciones recientes desde Facebook
              </p>
            </div>

            <nav className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 font-semibold text-white transition hover:border-cyan-400"
              >
                Tienda
              </Link>

              <Link
                href="/noticias"
                className="rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Noticias
              </Link>
            </nav>
          </div>
        </header>

        <section className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
          <h2 className="text-2xl font-bold text-cyan-400">
            Feed de Facebook
          </h2>
          <p className="mt-2 text-slate-300">
            Aquí se mostrarán las publicaciones públicas de tu página Ganker
            Games.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-3">
            <iframe
              title="Facebook Page Feed"
              src={pagePluginSrc}
              width="100%"
              height="1200"
              style={{ border: "none", overflow: "hidden" }}
              scrolling="no"
              allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            />
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h3 className="text-lg font-bold text-white">Página conectada</h3>
              <p className="mt-2 break-all text-sm text-slate-300">
                {FACEBOOK_PAGE_URL}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <h3 className="text-lg font-bold text-white">Qué verás aquí</h3>
              <p className="mt-2 text-sm text-slate-300">
                Las publicaciones públicas más recientes de tu página de
                Facebook.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <a
                href={FACEBOOK_PAGE_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Abrir Ganker Games en Facebook
              </a>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}