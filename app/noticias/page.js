"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const LANG_STORAGE_KEY = "gkg-lang";

function formatDate(dateString, language) {
  if (!dateString) return "";

  try {
    return new Intl.DateTimeFormat(language === "en" ? "en-US" : "es-MX", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}

function normalizePosts(payload) {
  const raw =
    payload?.posts ||
    payload?.data ||
    payload?.items ||
    payload?.results ||
    [];

  if (!Array.isArray(raw)) return [];

  return raw.map((post, index) => {
    const attachments = Array.isArray(post?.attachments?.data)
      ? post.attachments.data
      : Array.isArray(post?.attachments)
      ? post.attachments
      : [];

    const firstAttachment = attachments[0] || {};
    const firstSubattachment = Array.isArray(firstAttachment?.subattachments?.data)
      ? firstAttachment.subattachments.data[0]
      : null;

    const image =
      post?.full_picture ||
      firstAttachment?.media?.image?.src ||
      firstSubattachment?.media?.image?.src ||
      post?.image ||
      "";

    const message =
      post?.message ||
      post?.story ||
      post?.text ||
      "";

    const link =
      post?.permalink_url ||
      post?.link ||
      post?.url ||
      "https://www.facebook.com/gankergames";

    return {
      id: post?.id || `post-${index}`,
      message,
      image,
      createdTime:
        post?.created_time ||
        post?.createdAt ||
        post?.date ||
        "",
      link,
    };
  });
}

export default function NoticiasPage() {
  const [language, setLanguage] = useState("es-419");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedLang = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (savedLang === "es-419" || savedLang === "en") {
      setLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LANG_STORAGE_KEY, language);
  }, [language]);

  const labels =
    language === "en"
      ? {
          brand: "Ganker Games",
          section: "News",
          title: "NEWS",
          subtitle:
            "Recent Facebook posts integrated into your site with a cleaner visual layout.",
          sourceTitle: "Connected source",
          sourceText: "Facebook page linked",
          openFacebook: "Open Facebook",
          latestPosts: "Latest posts",
          refresh: "Refresh",
          loading: "Loading posts...",
          error: "Could not load posts.",
          empty: "No posts available right now.",
          readMore: "View post",
          shop: "Shop",
          news: "News",
          stw: "STW",
          published: "Published",
          nativeFeed: "Native feed",
        }
      : {
          brand: "Ganker Games",
          section: "Noticias",
          title: "NOTICIAS",
          subtitle:
            "Publicaciones recientes de Facebook integradas a tu sitio con un diseño más limpio.",
          sourceTitle: "Fuente conectada",
          sourceText: "Página de Facebook vinculada",
          openFacebook: "Abrir Facebook",
          latestPosts: "Publicaciones recientes",
          refresh: "Actualizar",
          loading: "Cargando publicaciones...",
          error: "No se pudieron cargar las publicaciones.",
          empty: "No hay publicaciones disponibles en este momento.",
          readMore: "Ver publicación",
          shop: "Tienda",
          news: "Noticias",
          stw: "STW",
          published: "Publicado",
          nativeFeed: "Feed nativo",
        };

  async function loadPosts() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/facebook-posts", { cache: "no-store" });
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};

      if (!res.ok) {
        throw new Error(json?.error || labels.error);
      }

      setPosts(normalizePosts(json));
    } catch (err) {
      setError(err?.message || labels.error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  const featuredPost = useMemo(() => posts[0] || null, [posts]);
  const restPosts = useMemo(() => posts.slice(1), [posts]);

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(0,255,102,0.14),_transparent_20%),linear-gradient(180deg,_#000000_0%,_#021106_45%,_#000000_100%)] text-white">
      <header className="sticky top-0 z-40 border-b border-[#153321] bg-[#030603]/90 backdrop-blur">
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
                {labels.section}
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

            <nav className="hidden items-center gap-2 md:flex">
              <Link
                href="/"
                className="rounded-xl border border-[#284635] bg-[#0b120d] px-4 py-2 text-sm font-bold text-white"
              >
                {labels.shop}
              </Link>
              <Link
                href="/noticias"
                className="rounded-xl bg-[#15d863] px-4 py-2 text-sm font-bold text-[#06110a]"
              >
                {labels.news}
              </Link>
              <Link
                href="/stw"
                className="rounded-xl border border-[#284635] bg-[#0b120d] px-4 py-2 text-sm font-bold text-white"
              >
                {labels.stw}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pt-4 md:hidden">
        <div className="grid grid-cols-3 gap-3">
          <Link
            href="/"
            className="rounded-xl border border-[#284635] bg-[#0b120d] px-4 py-3 text-center text-sm font-extrabold text-white"
          >
            {labels.shop}
          </Link>
          <Link
            href="/noticias"
            className="rounded-xl bg-[#15d863] px-4 py-3 text-center text-sm font-extrabold text-[#06110a]"
          >
            {labels.news}
          </Link>
          <Link
            href="/stw"
            className="rounded-xl border border-[#284635] bg-[#0b120d] px-4 py-3 text-center text-sm font-extrabold text-white"
          >
            {labels.stw}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-6">
        <section className="mb-6 overflow-hidden rounded-[24px] border border-[#1d4a2d] bg-[linear-gradient(120deg,_rgba(0,255,102,0.10)_0%,_rgba(5,14,8,0.96)_35%,_rgba(2,7,3,0.96)_100%)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:rounded-[28px] md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.28em] text-[#67ff9a]">
                {labels.brand}
              </p>
              <h1 className="text-3xl font-black uppercase italic sm:text-4xl md:text-6xl">
                {labels.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base md:text-lg">
                {labels.subtitle}
              </p>
            </div>

            <div className="rounded-2xl border border-[#255239] bg-[#040804]/80 p-4 backdrop-blur md:p-5">
              <p className="text-sm font-semibold text-[#67ff9a]">
                {labels.sourceTitle}
              </p>
              <p className="mt-2 text-sm text-slate-200">
                {labels.sourceText}
              </p>
              <a
                href="https://www.facebook.com/gankergames"
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex rounded-xl bg-[#15d863] px-4 py-2 text-sm font-extrabold text-[#06110a]"
              >
                {labels.openFacebook}
              </a>
            </div>
          </div>
        </section>

        <section className="mb-6 flex flex-col gap-3 rounded-[24px] border border-[#1f3a2b] bg-[#060b07]/95 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.25)] md:flex-row md:items-center md:justify-between md:p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#67ff9a]">
              {labels.nativeFeed}
            </p>
            <h2 className="mt-2 text-2xl font-black uppercase italic md:text-5xl">
              {labels.latestPosts}
            </h2>
          </div>

          <button
            onClick={loadPosts}
            className="rounded-xl bg-[#15d863] px-5 py-3 text-sm font-extrabold text-[#06110a]"
          >
            {labels.refresh}
          </button>
        </section>

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

        {!loading && !error && posts.length === 0 && (
          <div className="rounded-2xl border border-[#1a2c21] bg-[#060b07] p-6 text-slate-300">
            {labels.empty}
          </div>
        )}

        {!loading && !error && featuredPost && (
          <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
            <article className="overflow-hidden rounded-[28px] border border-[#1f3a2b] bg-[#0d1210] shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
              {featuredPost.image ? (
                <div className="flex max-h-[520px] min-h-[280px] items-center justify-center overflow-hidden bg-[#111] md:min-h-[360px]">
                  <img
                    src={featuredPost.image}
                    alt="featured-post"
                    className="h-full w-full object-cover object-center"
                  />
                </div>
              ) : null}

              <div className="p-5 md:p-6">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#67ff9a]">
                  {labels.published}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  {formatDate(featuredPost.createdTime, language)}
                </p>

                <p className="mt-4 whitespace-pre-line text-sm leading-7 text-slate-100 md:text-base">
                  {featuredPost.message || labels.empty}
                </p>

                <a
                  href={featuredPost.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex rounded-xl bg-[#15d863] px-4 py-3 text-sm font-extrabold text-[#06110a]"
                >
                  {labels.readMore}
                </a>
              </div>
            </article>

            <aside className="space-y-4">
              {restPosts.slice(0, 4).map((post) => (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-[22px] border border-[#1f3a2b] bg-[#0d1210]"
                >
                  <div className="flex gap-3 p-3">
                    <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#101812]">
                      {post.image ? (
                        <img
                          src={post.image}
                          alt="post"
                          className="h-full w-full object-cover object-center"
                        />
                      ) : (
                        <div className="text-xs text-slate-500">FB</div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#67ff9a]">
                        {formatDate(post.createdTime, language)}
                      </p>
                      <p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-200">
                        {post.message || labels.empty}
                      </p>
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex text-xs font-extrabold text-[#67ff9a]"
                      >
                        {labels.readMore}
                      </a>
                    </div>
                  </div>
                </article>
              ))}
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}