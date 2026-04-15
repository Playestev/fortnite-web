"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const FACEBOOK_PAGE_URL = "https://www.facebook.com/gankergames";

function formatDate(dateString, lang) {
  if (!dateString) return "";

  const date = new Date(dateString);

  return new Intl.DateTimeFormat(lang === "en" ? "en-US" : "es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function trimText(text, maxLength = 220, fallback = "") {
  if (!text) return fallback;
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "…";
}

export default function NoticiasPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("es-419");

  async function loadPosts() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/facebook-posts");
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

      if (!res.ok) {
        throw new Error(data.error || "No se pudieron cargar las publicaciones");
      }

      setPosts(data.posts || []);
    } catch (err) {
      setError(err.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  const labels =
    language === "es-419"
      ? {
          brand: "Ganker Games",
          navShop: "Tienda",
          navNews: "Noticias",
          title: "Noticias",
          heroText:
            "Publicaciones recientes de Facebook con un diseño más limpio, visual y totalmente integrado a tu sitio.",
          source: "Fuente conectada",
          openFacebook: "Abrir en Facebook",
          nativeFeed: "Feed nativo",
          publications: "Publicaciones",
          refresh: "Actualizar",
          loading: "Cargando publicaciones...",
          empty: "No se encontraron publicaciones.",
          featured: "Destacado",
          pageName: "Ganker Games",
          facebook: "Facebook",
          seePost: "Ver post",
          noImage: "Sin imagen",
          autoNews: "Noticias automáticas",
          autoNewsText:
            "Las publicaciones nuevas que hagas en tu página pública de Facebook se reflejan aquí con estilo propio.",
          nextUpgrade: "Siguiente mejora",
          nextUpgradeText:
            "Después puedes agregar categorías, búsqueda y tarjetas todavía más avanzadas.",
          untitled: "Publicación sin texto.",
        }
      : {
          brand: "Ganker Games",
          navShop: "Shop",
          navNews: "News",
          title: "News",
          heroText:
            "Recent Facebook posts with a cleaner visual style fully integrated into your website.",
          source: "Connected source",
          openFacebook: "Open on Facebook",
          nativeFeed: "Native feed",
          publications: "Posts",
          refresh: "Refresh",
          loading: "Loading posts...",
          empty: "No posts found.",
          featured: "Featured",
          pageName: "Ganker Games",
          facebook: "Facebook",
          seePost: "View post",
          noImage: "No image",
          autoNews: "Automatic news",
          autoNewsText:
            "New public posts from your Facebook page can appear here with a custom design.",
          nextUpgrade: "Next upgrade",
          nextUpgradeText:
            "Later you can add categories, search and even more advanced cards.",
          untitled: "Post without text.",
        };

  const featuredPost = useMemo(() => posts[0] || null, [posts]);
  const otherPosts = useMemo(() => posts.slice(1), [posts]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(0,255,102,0.14),_transparent_20%),linear-gradient(180deg,_#000000_0%,_#021106_45%,_#000000_100%)] text-white">
      <header className="sticky top-0 z-50 border-b border-[#153321] bg-[#030603]/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src="/ganker-logo.png"
              alt="Ganker Games"
              className="h-12 w-12 shrink-0 rounded-full border border-[#19ff72]/40 object-cover shadow-[0_0_18px_rgba(25,255,114,0.25)]"
            />
            <div className="min-w-0">
              <p className="truncate text-base font-extrabold leading-none sm:text-lg">
                {labels.brand}
              </p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#67ff9a] sm:text-xs">
                {labels.navNews}
              </p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-xl border border-[#284635] bg-[#0b120d] px-3 py-2 text-sm font-semibold text-white outline-none focus:border-[#67ff9a]"
            >
              <option value="es-419">ES</option>
              <option value="en">EN</option>
            </select>

            <Link
              href="/"
              className="hidden rounded-xl border border-[#284635] bg-[#0b120d] px-4 py-2 text-sm font-bold text-white transition hover:border-[#67ff9a] md:inline-flex"
            >
              {labels.navShop}
            </Link>
            <Link
              href="/noticias"
              className="hidden rounded-xl bg-[#15d863] px-4 py-2 text-sm font-bold text-[#06110a] md:inline-flex"
            >
              {labels.navNews}
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-6">
        <section className="mb-6 overflow-hidden rounded-[24px] border border-[#1d4a2d] bg-[linear-gradient(120deg,_rgba(0,255,102,0.10)_0%,_rgba(5,14,8,0.96)_35%,_rgba(2,7,3,0.96)_100%)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:rounded-[28px] md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.28em] text-[#67ff9a] sm:text-sm md:tracking-[0.3em]">
                {labels.brand}
              </p>
              <h1 className="text-3xl font-black uppercase italic sm:text-4xl md:text-6xl">
                {labels.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base md:text-lg">
                {labels.heroText}
              </p>
            </div>

            <div className="rounded-2xl border border-[#255239] bg-[#040804]/80 p-4 backdrop-blur md:p-5">
              <p className="text-sm font-semibold text-[#67ff9a]">
                {labels.source}
              </p>
              <p className="mt-2 break-all text-sm text-slate-200">
                {FACEBOOK_PAGE_URL}
              </p>
              <a
                href={FACEBOOK_PAGE_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex rounded-xl bg-[#15d863] px-4 py-2 text-sm font-extrabold text-[#06110a] transition hover:bg-[#2cff7a]"
              >
                {labels.openFacebook}
              </a>
            </div>
          </div>
        </section>

        <div className="mb-6 rounded-[24px] border border-[#1a2c21] bg-[#060b07]/95 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.25)] md:rounded-[28px] md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#67ff9a] sm:text-sm md:tracking-[0.3em]">
                {labels.nativeFeed}
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase italic sm:text-3xl md:text-5xl">
                {labels.publications}
              </h2>
            </div>

            <div className="flex gap-3">
              <Link
                href="/"
                className="rounded-xl border border-[#284635] bg-[#0b120d] px-4 py-3 text-sm font-extrabold text-white md:hidden"
              >
                {labels.navShop}
              </Link>

              <button
                onClick={loadPosts}
                className="rounded-xl bg-[#15d863] px-4 py-3 text-sm font-extrabold text-[#06110a] transition hover:bg-[#2cff7a]"
              >
                {labels.refresh}
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-[#1a2c21] bg-[#060b07] p-6">
            {labels.loading}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && featuredPost && (
          <section className="mb-8 overflow-hidden rounded-[24px] border border-[#1f3a2b] bg-[#060b07]/95 shadow-[0_12px_40px_rgba(0,0,0,0.28)] md:rounded-[28px]">
            <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
              <div className="p-5 md:p-6">
                <p className="text-sm font-black uppercase tracking-[0.3em] text-[#67ff9a]">
                  {labels.featured}
                </p>
                <h3 className="mt-3 text-2xl font-black leading-tight text-white md:text-3xl">
                  {trimText(featuredPost.message, 140, labels.untitled)}
                </h3>
                <p className="mt-4 text-sm text-slate-400">
                  {formatDate(featuredPost.created_time, language)}
                </p>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
                  {trimText(featuredPost.message, 420, labels.untitled)}
                </p>
                <a
                  href={featuredPost.permalink_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex rounded-xl bg-[#15d863] px-4 py-3 text-sm font-extrabold text-[#06110a] transition hover:bg-[#2cff7a]"
                >
                  {labels.seePost}
                </a>
              </div>

              <div className="min-h-[320px] bg-[radial-gradient(circle_at_top,_rgba(0,255,102,0.16),_transparent_45%),linear-gradient(180deg,_#060706_0%,_#0b120d_100%)]">
                {featuredPost.image ? (
                  <div className="flex h-full min-h-[320px] items-center justify-center p-4">
                    <img
                      src={featuredPost.image}
                      alt="Publicación destacada"
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="grid h-full min-h-[320px] place-items-center text-slate-500">
                    {labels.noImage}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {!loading && !error && posts.length > 0 && (
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {otherPosts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-[22px] border border-[#1f3a2b] bg-[#0d1210] shadow-[0_10px_30px_rgba(0,0,0,0.28)] transition duration-200 hover:-translate-y-1 hover:border-[#67ff9a]/40"
              >
                <div className="relative">
                  {post.image ? (
                    <div className="flex h-56 w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(0,255,102,0.16),_transparent_45%),linear-gradient(180deg,_#060706_0%,_#0b120d_100%)] p-3">
                      <img
                        src={post.image}
                        alt="Publicación de Facebook"
                        loading="lazy"
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="grid h-56 w-full place-items-center bg-[#101812] text-slate-400">
                      {labels.noImage}
                    </div>
                  )}

                  <div className="absolute right-3 top-3 rounded-full border border-[#88ffae] bg-[#15d863] px-3 py-1 text-xs font-extrabold text-[#06110a] shadow-lg">
                    {labels.facebook}
                  </div>
                </div>

                <div className="p-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#67ff9a] sm:text-sm">
                    {labels.pageName}
                  </p>

                  <h3 className="text-lg font-extrabold leading-tight text-white">
                    {trimText(post.message, 110, labels.untitled)}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {trimText(post.message, 180, labels.untitled)}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-xs text-slate-400">
                      {formatDate(post.created_time, language)}
                    </p>

                    <a
                      href={post.permalink_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-[#67ff9a] bg-transparent px-3 py-2 text-xs font-extrabold text-[#67ff9a] transition hover:bg-[#15d863] hover:text-[#06110a]"
                    >
                      {labels.seePost}
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="rounded-2xl border border-[#1a2c21] bg-[#060b07] p-6 text-slate-300">
            {labels.empty}
          </div>
        )}

        {!loading && !error && (
          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[22px] border border-[#1f3a2b] bg-[#060b07]/95 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.22)]">
              <p className="text-sm font-black uppercase tracking-[0.3em] text-[#67ff9a]">
                {labels.autoNews}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {labels.autoNewsText}
              </p>
            </div>

            <div className="rounded-[22px] border border-[#1f3a2b] bg-[#060b07]/95 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.22)]">
              <p className="text-sm font-black uppercase tracking-[0.3em] text-[#67ff9a]">
                {labels.nextUpgrade}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                {labels.nextUpgradeText}
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}