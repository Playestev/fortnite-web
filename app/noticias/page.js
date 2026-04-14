import Link from "next/link";

const FACEBOOK_PAGE_URL = "https://www.facebook.com/gankergames";

const pagePluginSrc = `https://www.facebook.com/plugins/page.php?href=${encodeURIComponent(
  FACEBOOK_PAGE_URL
)}&tabs=timeline&width=500&height=1400&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=false`;

export default function NoticiasPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(52,211,153,0.18),_transparent_24%),linear-gradient(180deg,_#06132a_0%,_#041022_50%,_#030b18_100%)] text-white">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#07111f]/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 md:px-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500 font-black text-slate-950 shadow-lg">
              GG
            </div>
            <div>
              <p className="text-lg font-extrabold leading-none">Ganker Games</p>
              <p className="text-xs uppercase tracking-[0.25em] text-emerald-300">
                Noticias
              </p>
            </div>
          </div>

          <nav className="ml-auto flex items-center gap-2">
            <Link
              href="/"
              className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-bold text-white transition hover:border-emerald-400"
            >
              Tienda
            </Link>
            <Link
              href="/noticias"
              className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-slate-950"
            >
              Noticias
            </Link>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <section className="mb-6 overflow-hidden rounded-[28px] border border-emerald-500/20 bg-[linear-gradient(120deg,_rgba(16,185,129,0.20)_0%,_rgba(6,24,54,0.95)_35%,_rgba(7,36,66,0.88)_100%)] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-2 text-sm font-black uppercase tracking-[0.3em] text-emerald-300">
                Ganker Games
              </p>
              <h1 className="text-4xl font-black uppercase italic md:text-6xl">
                Noticias
              </h1>
              <p className="mt-3 max-w-2xl text-base text-slate-200 md:text-lg">
                Publicaciones recientes de Facebook integradas en tu página con
                un estilo gamer y más limpio.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-400/20 bg-[#08121f]/70 p-5 backdrop-blur">
              <p className="text-sm font-semibold text-emerald-300">
                Página conectada
              </p>
              <p className="mt-2 text-sm break-all text-slate-200">
                {FACEBOOK_PAGE_URL}
              </p>
              <a
                href={FACEBOOK_PAGE_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex rounded-xl bg-emerald-500 px-4 py-2 text-sm font-extrabold text-slate-950 transition hover:bg-emerald-400"
              >
                Abrir en Facebook
              </a>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-[28px] border border-emerald-500/15 bg-[#071426]/90 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.22)]">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.3em] text-emerald-300">
                  Feed oficial
                </p>
                <h2 className="mt-2 text-3xl font-black uppercase italic">
                  Ganker Games
                </h2>
              </div>
              <div className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-black text-slate-950">
                Facebook
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-white">
              <iframe
                title="Facebook Page Feed"
                src={pagePluginSrc}
                width="100%"
                height="1400"
                style={{ border: "none", overflow: "hidden" }}
                scrolling="no"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
              />
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-emerald-500/15 bg-[#071426]/90 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.22)]">
              <p className="text-sm font-black uppercase tracking-[0.3em] text-emerald-300">
                Qué hace esta sección
              </p>
              <h3 className="mt-2 text-xl font-black text-white">
                Noticias automáticas
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Las publicaciones nuevas que hagas en tu página pública de
                Facebook se reflejan aquí mediante el timeline incrustado.
              </p>
            </div>

            <div className="rounded-[28px] border border-emerald-500/15 bg-[#071426]/90 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.22)]">
              <p className="text-sm font-black uppercase tracking-[0.3em] text-emerald-300">
                Ideal para
              </p>
              <div className="mt-3 space-y-3 text-sm text-slate-300">
                <div className="rounded-2xl bg-[#0d1c31] px-4 py-3">
                  Publicar noticias rápidas de Fortnite
                </div>
                <div className="rounded-2xl bg-[#0d1c31] px-4 py-3">
                  Llevar tráfico de Facebook a tu sitio
                </div>
                <div className="rounded-2xl bg-[#0d1c31] px-4 py-3">
                  Tener una sección viva sin subir noticias manualmente
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-emerald-500/15 bg-[#071426]/90 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.22)]">
              <p className="text-sm font-black uppercase tracking-[0.3em] text-emerald-300">
                Siguiente mejora
              </p>
              <h3 className="mt-2 text-xl font-black text-white">
                Noticias nativas
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Después puedes convertir tus publicaciones en tarjetas propias
                con imagen, fecha y enlace para que se vea todavía más pro.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}