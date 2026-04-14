"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const FACEBOOK_PAGE_URL = "https://www.facebook.com/gankergames";

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function trimText(text, maxLength = 220) {
  if (!text) return "Publicación sin texto.";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "…";
}

export default function NoticiasPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const featuredPost = useMemo(() => posts[0] || null, [posts]);
  const otherPosts = useMemo(() => posts.slice(1), [posts]);

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
                Publicaciones recientes de Facebook con un diseño más limpio,
                visual y totalmente integrado a tu sitio.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-400/20 bg-[#08121f]/70 p-5 backdrop-blur">
              <p className="text-sm font-semibold text-emerald-300">
                Fuente conectada
              </p>
              <p className="mt-2 break-all text-sm text-slate-200">
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

        <div className="mb-6 flex items-center justify-between rounded-[28px] border border-white/5 bg-[#071426]/80 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.2)]">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-emerald-300">
              Feed nativo
            </p>
            <h2 className="mt-2 text-3xl font-black uppercase italic md:text-5xl">
              Publicaciones
            </h2>
          </div>

          <button
            onClick={loadPosts}
            className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-emerald-400"
          >
            Actualizar
          </button>
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-800 bg-[#071426] p-6">
            Cargando publicaciones...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && featuredPost && (
          <section className="mb-8 overflow-hidden rounded-[28px] border border-emerald-500/15 bg-[#071426]/90 shadow-[0_12px_40px_rgba(0,0,0,0.22)]">
            <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
              <div className="p-6">
                <p className="text-sm font-black uppercase tracking-[0.3em] text-emerald-300">
                  Destacado
                </p>
                <h3 className="mt-3 text-3xl font-black leading-tight text-white">
                  {trimText(featuredPost.message, 140)}
                </h3>
                <p className="mt-4 text-sm text-slate-400">
                  {formatDate(featuredPost.created_time)}
                </p>
                <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
                  {trimText(featuredPost.message, 420)}
                </p>
                <a
                  href={featuredPost.permalink_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 inline-flex rounded-xl bg-emerald-500 px-4 py-3 text-sm font-extrabold text-slate-950 transition hover:bg-emerald-400"
                >
                  Ver publicación
                </a>
              </div>

              <div className="min-h-[320px] bg-[#0c1830]">
                {featuredPost.image ? (
                  <img
                    src={featuredPost.image}
                    alt="Publicación destacada"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full min-h-[320px] place-items-center text-slate-500">
                    Sin imagen
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {!loading && !error && posts.length > 0 && (
          <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {otherPosts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-[24px] border border-emerald-500/15 bg-[#0c1830] shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition duration-200 hover:-translate-y-1 hover:border-emerald-400/40"
              >
                <div className="relative">
                  {post.image ? (
                    <img
                      src={post.image}
                      alt="Publicación de Facebook"
                      className="h-64 w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-64 w-full place-items-center bg-slate-800 text-slate-400">
                      Sin imagen
                    </div>
                  )}

                  <div className="absolute right-3 top-3 rounded-full border border-emerald-300 bg-emerald-500 px-3 py-1 text-xs font-extrabold text-slate-950 shadow-lg">
                    Facebook
                  </div>
                </div>

                <div className="p-4">
                  <p className="mb-2 text-sm font-semibold text-emerald-300">
                    Ganker Games
                  </p>

                  <h3 className="text-lg font-extrabold leading-tight text-white">
                    {trimText(post.message, 110)}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-300">
                    {trimText(post.message, 180)}
                  </p>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="text-xs text-slate-400">
                      {formatDate(post.created_time)}
                    </p>

                    <a
                      href={post.permalink_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-xl border border-emerald-400 bg-transparent px-3 py-2 text-xs font-extrabold text-emerald-300 transition hover:bg-emerald-500 hover:text-slate-950"
                    >
                      Ver post
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-[#071426] p-6 text-slate-300">
            No se encontraron publicaciones.
          </div>
        )}
      </div>
    </main>
  );
}