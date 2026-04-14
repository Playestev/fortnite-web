"use client";

import { useEffect, useMemo, useState } from "react";

const NAME_TRANSLATIONS_ES_MX = {
  "Oathbound Lexa": "Lexa del Juramento",
  "Metal Mouth": "Boca Metálica",
  "Twisted Fate Blade": "Hoja del Destino Retorcido",
  Oathbound: "Juramento",
  "Toy Story Alien": "Alien de Toy Story",
  "Destroy Buzz": "Destruye a Buzz",
  "Buzz Lightyear Mic": "Micrófono de Buzz Lightyear",
  "Pizza Planet Delivery Truck": "Camioneta de reparto de Pizza Planet",
  "Kate's Quiver": "Carcaj de Kate",
  "Airflow Vibes": "Vibras de Flujo",
  "Cosmonautic Helmet": "Casco Cosmonáutico",
  "Fluttering Notes": "Notas Revoloteando",
  Renegade: "Renegada",
  "Star Wand": "Varita Estelar",
  Lyrik: "Lírik",
  "Destroy Buzz": "Destruye a Buzz",
  "Sandy Salute": "Saludo Arenoso",
  "Motor Monster": "Monstruo Motorizado",
  "Hatcback": "Eclosión",
  "Side To Side": "De Lado a Lado",
  "Wild Blade": "Hoja Salvaje",
  "Captain Hook's Flag": "Bandera del Capitán Garfio",
  "Destroy Buzz": "Destruye a Buzz",
  "Nike Air Kukini SE 'Leopard'": "Nike Air Kukini SE 'Leopard'",
  "Silver Surfer's Surfboard": "Tabla de Silver Surfer",
  Gabriela: "Gabriela",
  Demolisher: "Demoledora",
  "Tactical Crusher": "Trituradora Táctica",
};

function translateType(type, lang) {
  const english = type || "";

  if (lang === "en") return english;

  const map = {
    Outfit: "Skin",
    Pickaxe: "Pico",
    Wrap: "Envoltura",
    Emote: "Gesto",
    "Back Bling": "Mochila retro",
    Glider: "Ala delta",
    "Loading Screen": "Pantalla de carga",
    Music: "Música",
    Bundle: "Lote",
    Spray: "Grafiti",
    Toy: "Juguete",
    Emoji: "Emoji",
    Emoticon: "Emoticono",
    Contrail: "Estela",
    Pet: "Mascota",
    "Harvesting Tool": "Herramienta de recolección",
    "Jam Track": "Pista Jam",
    Backpack: "Mochila",
    Vehicle: "Vehículo",
    Car: "Auto",
    Instrument: "Instrumento",
    Sidekick: "Accesorio",
  };

  return map[english] || english;
}

function translateSection(section, lang) {
  const english = section || "";

  if (lang === "en") return english;

  const map = {
    Featured: "Destacado",
    Daily: "Diario",
    "Special Offers": "Ofertas especiales",
    Bundles: "Lotes",
    "Signature Style": "Estilo distintivo",
    Marvel: "Marvel",
    "Star Wars": "Star Wars",
    "Icon Series": "Serie de ídolos",
    FNCS: "FNCS",
    "Turn The Music Up": "Sube la música",
    "Jam Tracks": "Pistas Jam",
    Coachella: "Coachella",
    "Toy Story": "Toy Story",
    Gear: "Accesorios",
    Offers: "Ofertas",
    Cars: "Autos",
    Instruments: "Instrumentos",
    Festival: "Festival",
    "Battle Ready": "Listos para la batalla",
    "Rick and Morty": "Rick and Morty",
    "Teenage Mutant Ninja Turtles": "Tortugas Ninja",
    DC: "DC",
    GamingLegends: "Leyendas del gaming",
    Summer: "Verano",
    Winterfest: "Festival de Invierno",
    Lava: "Lava",
    "No Sweat": "No Sweat",
    "Phineas and Ferb": "Phineas y Ferb",
    Terminator: "Terminator",
    Shop: "Tienda",
    Arenas: "Arenas",
    Tienda: "Tienda",
  };

  return map[english] || english;
}

function getDisplayName(item, lang) {
  const englishName = item.nameEnglish || item.nameLocalized || "";
  const localizedName = item.nameLocalized || englishName;

  if (lang === "en") {
    return englishName;
  }

  const manualTranslation = NAME_TRANSLATIONS_ES_MX[englishName];
  if (manualTranslation) {
    return manualTranslation;
  }

  if (
    localizedName &&
    localizedName.trim().toLowerCase() !== englishName.trim().toLowerCase()
  ) {
    return localizedName;
  }

  return englishName;
}

function getSecondaryEnglishName(item, lang) {
  if (lang !== "es-419") return "";

  const englishName = item.nameEnglish || "";
  const displayName = getDisplayName(item, lang);

  if (
    englishName &&
    displayName &&
    englishName.trim().toLowerCase() !== displayName.trim().toLowerCase()
  ) {
    return englishName;
  }

  return "";
}

function getDisplayType(item, lang) {
  const englishType = item.typeEnglish || item.typeLocalized || "";
  return translateType(englishType, lang);
}

function getDisplaySection(item, lang) {
  const englishSection = item.sectionEnglish || item.sectionLocalized || "";
  return translateSection(englishSection, lang);
}

export default function Home() {
  const [items, setItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRefresh, setLoadingRefresh] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [section, setSection] = useState("Todas");
  const [language, setLanguage] = useState("es-419");

  async function loadShop(showRefreshState = false, selectedLanguage = language) {
    try {
      if (showRefreshState) {
        setLoadingRefresh(true);
      } else {
        setLoading(true);
      }

      setError("");

      const res = await fetch(`/api/shop?lang=${selectedLanguage}`);
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};

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
    loadShop(false, language);
  }, [language]);

  const labels =
    language === "es-419"
      ? {
          title: "FORTNITE SHOP",
          subtitle: "Tienda completa del día de Fortnite",
          refresh: loadingRefresh ? "Actualizando..." : "Actualizar tienda",
          search: "Buscar skin, bundle, track, sección...",
          all: "Todas",
          total: "Total en API",
          showing: "Mostrando",
          loading: "Cargando tienda...",
          noResults: "No se encontraron resultados con ese filtro.",
          noImage: "Sin imagen",
          vbucks: "V-Bucks",
        }
      : {
          title: "FORTNITE SHOP",
          subtitle: "Full daily Fortnite shop",
          refresh: loadingRefresh ? "Refreshing..." : "Refresh shop",
          search: "Search skin, bundle, track, section...",
          all: "All",
          total: "Total in API",
          showing: "Showing",
          loading: "Loading shop...",
          noResults: "No results found for that filter.",
          noImage: "No image",
          vbucks: "V-Bucks",
        };

  const translatedAllLabel = language === "es-419" ? "Todas" : "All";

  const sections = useMemo(() => {
    const uniqueSections = [
      ...new Set(allItems.map((item) => getDisplaySection(item, language))),
    ].filter(Boolean);

    return [
      translatedAllLabel,
      ...uniqueSections.sort((a, b) =>
        a.localeCompare(b, language === "es-419" ? "es" : "en")
      ),
    ];
  }, [allItems, language, translatedAllLabel]);

  useEffect(() => {
    let filtered = [...allItems];

    if (section !== translatedAllLabel) {
      filtered = filtered.filter(
        (item) => getDisplaySection(item, language) === section
      );
    }

    const text = search.trim().toLowerCase();

    if (text) {
      filtered = filtered.filter((item) => {
        const displayName = getDisplayName(item, language).toLowerCase();
        const englishName = (item.nameEnglish || "").toLowerCase();
        const displayType = getDisplayType(item, language).toLowerCase();
        const displaySection = getDisplaySection(item, language).toLowerCase();
        const devName = (item.devName || "").toLowerCase();

        return (
          displayName.includes(text) ||
          englishName.includes(text) ||
          displayType.includes(text) ||
          displaySection.includes(text) ||
          devName.includes(text)
        );
      });
    }

    setItems(filtered);
  }, [search, section, allItems, language, translatedAllLabel]);

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <header className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold">{labels.title}</h1>
              <p className="text-slate-300 mt-2 text-lg">{labels.subtitle}</p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <select
                value={language}
                onChange={(e) => {
                  const newLanguage = e.target.value;
                  setSearch("");
                  setLanguage(newLanguage);
                  setSection(newLanguage === "es-419" ? "Todas" : "All");
                }}
                className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-2 text-white outline-none focus:border-cyan-400"
              >
                <option value="es-419">Español (México / Latam)</option>
                <option value="en">English</option>
              </select>

              <button
                onClick={() => loadShop(true, language)}
                className="rounded-xl bg-cyan-500 px-4 py-2 font-semibold text-slate-950 hover:bg-cyan-400 transition"
              >
                {labels.refresh}
              </button>
            </div>
          </div>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-2">
          <input
            type="text"
            placeholder={labels.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
          />

          <select
            value={section}
            onChange={(e) => setSection(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-400"
          >
            <option value={translatedAllLabel}>{labels.all}</option>
            {sections
              .filter((sectionName) => sectionName !== translatedAllLabel)
              .map((sectionName) => (
                <option key={sectionName} value={sectionName}>
                  {sectionName}
                </option>
              ))}
          </select>
        </section>

        <section className="mb-6 flex flex-wrap gap-3 text-sm text-slate-300">
          <div className="rounded-full bg-slate-900 px-4 py-2 border border-slate-800">
            {labels.total}:{" "}
            <span className="text-white font-semibold">{allItems.length}</span>
          </div>
          <div className="rounded-full bg-slate-900 px-4 py-2 border border-slate-800">
            {labels.showing}:{" "}
            <span className="text-white font-semibold">{items.length}</span>
          </div>
        </section>

        {loading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            {labels.loading}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-300">
            {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
            {labels.noResults}
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => {
              const displayName = getDisplayName(item, language);
              const secondaryEnglishName = getSecondaryEnglishName(
                item,
                language
              );
              const displayType = getDisplayType(item, language);
              const displaySection = getDisplaySection(item, language);

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-lg hover:-translate-y-1 transition"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={displayName}
                      className="h-72 w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-72 w-full place-items-center bg-slate-800 text-slate-400">
                      {labels.noImage}
                    </div>
                  )}

                  <div className="p-4">
                    <p className="mb-2 text-sm text-cyan-400">
                      {displaySection}
                    </p>

                    <h2 className="text-lg font-semibold leading-tight">
                      {displayName}
                    </h2>

                    {secondaryEnglishName && (
                      <p className="mt-1 text-xs italic text-slate-500">
                        {secondaryEnglishName}
                      </p>
                    )}

                    <p className="mt-2 text-sm text-slate-400">{displayType}</p>

                    <p className="mt-3 text-base font-bold text-white">
                      {item.price} {labels.vbucks}
                    </p>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}