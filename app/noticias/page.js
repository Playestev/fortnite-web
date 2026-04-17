"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const LANG_STORAGE_KEY = "gkg-lang";
const FACEBOOK_URL =
  process.env.NEXT_PUBLIC_FACEBOOK_PAGE_URL ||
  "https://www.facebook.com/gankergames";

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

function extractTitle(message = "") {
  if (!message) return "";

  const clean = message
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (!clean.length) return "";

  const firstLine = clean[0];

  if (firstLine === firstLine.toUpperCase() || firstLine.length <= 90) {
    return firstLine;
  }

  const firstSentence = message.split(/[.!?\n]/)[0]?.trim() || "";
  return firstSentence || "Publicación";
}

function stripTitleFromMessage(message = "", title = "") {
  if (!message) return "";
  if (!title) return message.trim();

  const normalizedMessage = message.trim();

  if (normalizedMessage.startsWith(title)) {
    return normalizedMessage.slice(title.length).trim();
  }

  return normalizedMessage;
}

function extractImages(post) {
  const images = [];

  if (Array.isArray(post?.images)) {
    images.push(...post.images.filter(Boolean));
  }

  const attachments = Array.isArray(post?.attachments?.data)
    ? post.attachments.data
    : Array.isArray(post?.attachments)
      ? post.attachments
      : [];

  const firstAttachment = attachments[0] || {};
  const subattachments = Array.isArray(firstAttachment?.subattachments?.data)
    ? firstAttachment.subattachments.data
    : [];

  if (post?.full_picture) {
    images.push(post.full_picture);
  }

  if (firstAttachment?.media?.image?.src) {
    images.push(firstAttachment.media.image.src);
  }

  subattachments.forEach((item) => {
    const img = item?.media?.image?.src;
    if (img) images.push(img);
  });

  if (post?.image) {
    images.push(post.image);
  }

  return [...new Set(images.filter(Boolean))];
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
    const images = extractImages(post);
    const message = post?.message || post?.story || post?.text || "";
    const title = extractTitle(message);
    const body = stripTitleFromMessage(message, title);

    const link =
      post?.permalink_url ||
      post?.link ||
      post?.url ||
      FACEBOOK_URL;

    return {
      id: post?.id || `post-${index}`,
      title: title || "Publicación",
      body,
      message,
      images,
      image: images[0] || "",
      createdTime:
        post?.created_time ||
        post?.createdAt ||
        post?.date ||
        "",
      link,
    };
  });
}

function PostCarousel({
  images,
  alt,
  labels,
  className = "",
  imageClassName = "",
  showDots = true,
  compact = false,
}) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(0);

  const safeImages = Array.isArray(images) ? images.filter(Boolean) : [];
  const hasMany = safeImages.length > 1;

  useEffect(() => {
    setCurrent(0);
  }, [safeImages.length]);

  if (!safeImages.length) {
    return (
      <div
        className={`flex items-center justify-center bg-[#101812] text-xs font-black uppercase tracking-[0.28em] text-[#67ff9a] ${className}`}
      >
        FB
      </div>
    );
  }

  const goPrev = () => {
    setCurrent((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  };

  const goNext = () => {
    setCurrent((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  };

  const onTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const onTouchEnd = (e) => {
    const endX = e.changedTouches[0].screenX;
    const diff = touchStartX.current - endX;

    if (Math.abs(diff) < 40 || !hasMany) return;

    if (diff > 0) goNext();
    else goPrev();
  };

  return (
    <div
      className={`relative overflow-hidden bg-[#111] ${className}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <img
        src={safeImages[current]}
        alt={alt}
        className={`h-full w-full ${imageClassName}`}
      />

      {hasMany && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label={labels.previousImage}
            className={`absolute left-3 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white shadow-lg transition hover:bg-black/70 ${
              compact ? "h-8 w-8 text-xl" : "h-10 w-10 text-2xl"
            }`}
          >
            ‹
          </button>

          <button
            type="button"
            onClick={goNext}
            aria-label={labels.nextImage}
            className={`absolute right-3 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/55 text-white shadow-lg transition hover:bg-black/70 ${
              compact ? "h-8 w-8 text-xl" : "h-10 w-10 text-2xl"
            }`}
          >
            ›
          </button>

          {showDots && (
            <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
              {safeImages.map((_, index) => (
                <span
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    index === current ? "bg-[#67ff9a]" : "bg-white/45"
                  }`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function NewsCard({ post, labels, language }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[24px] border border-[#1f3a2b] bg-[#0d1210] shadow-[0_18px_50px_rgba(0,0,0,0.22)]">
      <PostCarousel
        images={post.images}
        alt={post.title}
        labels={labels}
        compact
        className="aspect-[16/10] w-full bg-[radial-gradient(circle_at_top,_rgba(0,255,102,0.08),_rgba(0,0,0,0.98))]"
        imageClassName="h-full w-full object-contain p-3"
        showDots={post.images?.length > 1}
      />

      <div className="flex flex-1 flex-col p-4 md:p-5">
        <p className="text-xs font-black uppercase tracking-[0.20em] text-[#67ff9a]">
          {labels.published}
        </p>

        <p className="mt-2 text-sm text-slate-400">
          {formatDate(post.createdTime, language)}
        </p>

        <h3 className="mt-4 text-lg font-black uppercase leading-snug text-white">
          {post.title}
        </h3>

        {expanded && post.body ? (
          <p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-200">
            {post.body}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap gap-3 pt-5">
          {post.body ? (
            <button
              type="button"
              onClick={() => setExpanded((prev) => !prev)}
              className="inline-flex rounded-xl border border-[#2a5a3f] bg-[#0a130d] px-4 py-2.5 text-sm font-extrabold text-[#67ff9a] transition hover:opacity-90"
            >
              {expanded ? labels.readLess : labels.readMoreText}
            </button>
          ) : null}

          <a
            href={post.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-xl bg-[#15d863] px-4 py-2.5 text-sm font-extrabold text-[#06110a] transition hover:opacity-90"
          >
            {labels.readMore}
          </a>
        </div>
      </div>
    </article>
  );
}

export default function NoticiasPage() {
  const [language, setLanguage] = useState("es-419");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const savedLang = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (savedLang === "es-419" || savedLang === "en") {
      setLanguage(savedLang);
    }
  }, []);

  useEffect(() => {
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
          noResults: "No posts match your search.",
          readMore: "View post",
          readMoreText: "Read more",
          readLess: "Read less",
          shop: "Shop",
          news: "News",
          stw: "STW",
          published: "Published",
          nativeFeed: "Native feed",
          previousImage: "Previous image",
          nextImage: "Next image",
          searchPlaceholder: "Search by keyword...",
          searchLabel: "Search",
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
          noResults: "No se encontraron publicaciones con esa búsqueda.",
          readMore: "Ver publicación",
          readMoreText: "Ver más",
          readLess: "Ver menos",
          shop: "Tienda",
          news: "Noticias",
          stw: "STW",
          published: "Publicado",
          nativeFeed: "Feed nativo",
          previousImage: "Imagen anterior",
          nextImage: "Imagen siguiente",
          searchPlaceholder: "Buscar por palabra clave...",
          searchLabel: "Buscar",
        };

  async function loadPosts() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/facebook-posts", { cache: "no-store" });
      const text = await res.text();

      let json = {};
      try {
        json = text ? JSON.parse(text) : {};
      } catch {
        json = {};
      }

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredPosts = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return posts;

    return posts.filter((post) => {
      const text = [
        post.title,
        post.body,
        post.message,
        formatDate(post.createdTime, language),
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(term);
    });
  }, [posts, search, language]);

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
                href={FACEBOOK_URL}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex rounded-xl bg-[#15d863] px-4 py-2 text-sm font-extrabold text-[#06110a] transition hover:opacity-90"
              >
                {labels.openFacebook}
              </a>
            </div>
          </div>
        </section>

        <section className="mb-6 rounded-[24px] border border-[#1f3a2b] bg-[#060b07]/95 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.25)] md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#67ff9a]">
                {labels.nativeFeed}
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase italic md:text-5xl">
                {labels.latestPosts}
              </h2>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="w-full sm:w-[320px]">
                <label className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-[#67ff9a]">
                  {labels.searchLabel}
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={labels.searchPlaceholder}
                  className="w-full rounded-xl border border-[#284635] bg-[#0b120d] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-[#67ff9a]"
                />
              </div>

              <button
                onClick={loadPosts}
                className="rounded-xl bg-[#15d863] px-5 py-3 text-sm font-extrabold text-[#06110a] transition hover:opacity-90 sm:self-end"
              >
                {labels.refresh}
              </button>
            </div>
          </div>
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

        {!loading && !error && posts.length > 0 && filteredPosts.length === 0 && (
          <div className="rounded-2xl border border-[#1a2c21] bg-[#060b07] p-6 text-slate-300">
            {labels.noResults}
          </div>
        )}

        {!loading && !error && filteredPosts.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredPosts.map((post) => (
              <NewsCard
                key={post.id}
                post={post}
                labels={labels}
                language={language}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
