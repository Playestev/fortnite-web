"use client";

import { useEffect, useMemo, useState } from "react";

export default function Home() {
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [section, setSection] = useState("Todas");

  async function loadShop(showRefreshState = false) {
    try {
      if (showRefreshState) {
        setLoadingRefresh(true);
      } else {
        setLoading(true);
      }

      setError("");

      const res = await fetch("/api/shop");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "No se pudo cargar la tienda");
      }

      setAllItems(data.items || []);
      setItems(data.items || []);
    } catch (err) {
      setError(err.message || "Ocurrió un error");
    } finally {
      setLoading(false);
      setLoadingRefresh(false);
    }
  }

  useEffect(() => {
    loadShop();
  }, []);

  const sections = useMemo(() => {
    const uniqueSections = [...new Set(allItems.map((item) => item.section))];
    return ["Todas", ...uniqueSections.sort()];
  }, [allItems]);

  useEffect(() => {
    let filtered = [...allItems];

    if (section !== "Todas") {
      filtered = filtered.filter((item) => item.section === section);
    }

    const text = search.trim().toLowerCase();

    if (text) {
      filtered = filtered.filter((item) => {
        return (
          item.name?.toLowerCase().includes(text) ||
          item.type?.toLowerCase().includes(text) ||
          item.section?.toLowerCase().includes(text) ||
          item.devName?.toLowerCase().includes(text)
        );
      });
    }

    setItems(filtered);
  }, [search, section, allItems]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">FORTNITE SHOP</h1>
              <p className="text-slate-300 mt-2 text-lg">
                Tienda completa del día de Fortnite
              </p>
            </div>

            <button
              onClick={() => loadShop(true)}
              className="rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400 transition"
            >
              {loadingRefresh ? "Actualizando..." : "Actualizar tienda"}
            </button>
          </div>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-2">
          <input
            type="text"
            placeholder="Buscar skin, bundle, track, sección..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
          />

          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
          >
            {sections.map((sectionName) => (
              <option key={sectionName} value={sectionName}>
                {sectionName}
              </option>
            ))}
          </select>
        </section>

        <section className="mb-6 flex flex-wrap gap-3 text-sm text-slate-300">
          <div className="rounded-full bg-slate-900 px-4 py-2 border border-slate-800">
            Total en API: <span className="text-white font-semibold">{allItems.length}</span>
          </div>
          <div className="rounded-full bg-slate-900 px-4 py-2 border border-slate-800">
            Mostrando: <span className="text-white font-semibold">{items.length}</span>
          </div>
        </section>

        {loading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            Cargando tienda...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
            No se encontraron resultados con ese filtro.
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-lg hover:-translate-y-1 transition"
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-72 w-full object-cover"
                  />
                ) : (
                  <div className="grid h-72 w-full place-items-center bg-slate-800 text-slate-400">
                    Sin imagen
                  </div>
                )}

                <div className="p-4">
                  <p className="mb-2 text-sm text-cyan-400">{item.section}</p>
                  <h2 className="text-lg font-semibold leading-tight">
                    {item.name}
                  </h2>
                  <p className="mt-2 text-sm text-slate-400">{item.type}</p>
                  <p className="mt-3 text-base font-bold text-white">
                    {item.price} V-Bucks
                  </p>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}