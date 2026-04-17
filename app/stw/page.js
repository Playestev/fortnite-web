"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const LANG_STORAGE_KEY = "gkg-lang";

const LABELS = {
  "es-419": {
    brand: "Ganker Games",
    brandSub: "STW",
    navShop: "Tienda",
    navNews: "Noticias",
    navSTW: "STW",
    heroKicker: "GANKER GAMES",
    heroTitle: "STW",
    heroDesc: "Pavos y misiones de Save the World con actualización diaria.",
    nextReset: "Próximo reset",
    dailyRotation: "Rotación diaria",
    vbucksTab: "Pavos",
    missionsTab: "Misiones",
    allZones: "Todas las zonas",
    allTypes: "Todos los tipos",
    loading: "Cargando STW...",
    noData: "No se pudo cargar STW",
    vbucksToday: "Pavos hoy",
    missionsWithVbucks: "Misiones con pavos",
    dailyReset: "Reset diario",
    noVbucksToday: "Hoy no hay misiones con pavos.",
    noMissionsForFilter: "No hay misiones para este filtro.",
    rewards: "Recompensas",
  },
  en: {
    brand: "Ganker Games",
    brandSub: "STW",
    navShop: "Shop",
    navNews: "News",
    navSTW: "STW",
    heroKicker: "GANKER GAMES",
    heroTitle: "STW",
    heroDesc: "Save the World missions and V-Bucks with daily updates.",
    nextReset: "Next reset",
    dailyRotation: "Daily rotation",
    vbucksTab: "V-Bucks",
    missionsTab: "Missions",
    allZones: "All zones",
    allTypes: "All types",
    loading: "Loading STW...",
    noData: "Could not load STW",
    vbucksToday: "V-Bucks today",
    missionsWithVbucks: "Missions with V-Bucks",
    dailyReset: "Daily reset",
    noVbucksToday: "There are no V-Bucks missions today.",
    noMissionsForFilter: "There are no missions for this filter.",
    rewards: "Rewards",
  },
};

const ZONE_TRANSLATIONS = {
  Stonewood: "Stonewood",
  Plankerton: "Plankerton",
  "Canny Valley": "Valle Latoso",
  "Twine Peaks": "Cumbres Leñosas",
  Ventures: "Aventuras",
};

const ALERT_TRANSLATIONS = {
  "Storm Alerts": "Alertas de tormenta",
  "Mini Boss Alerts": "Alertas de miniboss",
  "Mega Alerts": "Mega alertas",
  "Elemental Alerts": "Alertas elementales",
  Misc: "Varios",
};

const TEXT_TRANSLATIONS = {
  Resupply: "Reabastecimiento",
  "Ride the Lightning": "Ride the Lightning",
  "Retrieve the Data": "Recupera los datos",
  "Repair the Shelter": "Repara el refugio",
  "Evacuate the Shelter": "Evacua el refugio",
  "Destroy the Encampments": "Destruye los campamentos",
  "Build the Radar": "Construye el radar",
  "Refuel the Homebase": "Recarga la base",
  "Rescue the Survivors": "Rescata a los supervivientes",
  "Fight the Storm": "Lucha contra la tormenta",
  "Deliver the Bomb": "Entrega la bomba",
  "Launch the Rocket": "Lanza el cohete",
  "Eliminate and Collect": "Elimina y recolecta",
  "Category 1 Fight the Storm": "Categoría 1: Lucha contra la tormenta",
  "Category 2 Fight the Storm": "Categoría 2: Lucha contra la tormenta",
  "Category 3 Fight the Storm": "Categoría 3: Lucha contra la tormenta",
  "Category 4 Fight the Storm": "Categoría 4: Lucha contra la tormenta",
  Suburbs: "Suburbios",
  Forest: "Bosque",
  Grasslands: "Praderas",
  City: "Ciudad",
  "Industrial Park": "Parque industrial",
  common: "común",
  uncommon: "poco común",
  rare: "raro",
  epic: "épico",
  legendary: "legendario",
  survivor: "superviviente",
  defender: "defensor",
  schematic: "esquema",
  hero: "héroe",
  people: "personas",
  gold: "oro",
  "pure drop of rain": "Gota pura de lluvia",
  "lightning in a bottle": "Rayo embotellado",
  "eye of the storm": "Ojo de la tormenta",
  "storm shard": "Fragmento de tormenta",
};

function getTimeUntil(dateString) {
  if (!dateString) return "00:00:00";

  const diff = new Date(dateString).getTime() - Date.now();
  if (!Number.isFinite(diff) || diff <= 0) return "00:00:00";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
}

function translateText(text, language) {
  if (language === "en" || !text) return text;

  let result = String(text);
  Object.entries(TEXT_TRANSLATIONS).forEach(([from, to]) => {
    const regex = new RegExp(from, "gi");
    result = result.replace(regex, to);
  });

  return result;
}

function translateZone(zone, language) {
  if (language === "en") return zone;
  return ZONE_TRANSLATIONS[zone] || zone;
}

function translateAlertType(type, language) {
  if (language === "en") return type;
  return ALERT_TRANSLATIONS[type] || type;
}

function groupByZone(items) {
  const groups = {};
  items.forEach((item) => {
    if (!groups[item.zone]) groups[item.zone] = [];
    groups[item.zone].push(item);
  });
  return Object.entries(groups);
}

function MissionCard({ mission, labels, language, accent = "green" }) {
  const accentClass =
    accent === "cyan"
      ? "border-cyan-500/30 bg-cyan-500/10"
      : "border-[#1f3a2b] bg-[#0d1210]";

  return (
    <article className={`rounded-[24px] border p-4 shadow-[0_10px_30px_rgba(0,0,0,0.28)] ${accentClass}`}>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[#15d863] px-3 py-1 text-xs font-extrabold text-[#06110a]">
          {translateZone(mission.zone, language)}
        </span>

        {mission.alertType && (
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-bold text-slate-200">
            {translateAlertType(mission.alertType, language)}
          </span>
        )}

        {mission.powerLevel ? (
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-bold text-slate-300">
            PL {mission.powerLevel}
          </span>
        ) : null}
      </div>

      <h3 className={`text-lg font-black leading-tight ${accent === "cyan" ? "text-cyan-300" : "text-white"}`}>
        {translateText(mission.title, language)}
      </h3>

      <div className="mt-4 rounded-2xl border border-[#1f3a2b] bg-[#08110d] p-3">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#67ff9a]">
          {labels.rewards}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-200">
          {translateText(mission.rewardText || "", language) || "—"}
        </p>
      </div>
    </article>
  );
}

export default function STWPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("vbucks");
  const [zone, setZone] = useState("all");
  const [alertType, setAlertType] = useState("all");
  const [timeLeft, setTimeLeft] = useState("00:00:00");
  const [language, setLanguage] = useState("es-419");

  const labels = LABELS[language];

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

  useEffect(() => {
    async function loadSTW() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/stw", { cache: "no-store" });
        const text = await response.text();
        const json = text ? JSON.parse(text) : {};

        if (!response.ok) {
          throw new Error(json.error || labels.noData);
        }

        setData(json);
      } catch (err) {
        setError(err.message || labels.noData);
      } finally {
        setLoading(false);
      }
    }

    loadSTW();
  }, [labels.noData]);

  useEffect(() => {
    if (!data?.nextResetAt) return undefined;

    setTimeLeft(getTimeUntil(data.nextResetAt));
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntil(data.nextResetAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [data?.nextResetAt]);

  const filteredMissions = useMemo(() => {
    const missions = Array.isArray(data?.missions) ? data.missions : [];

    return missions.filter((mission) => {
      const zoneOk = zone === "all" || mission.zone === zone;
      const typeOk = alertType === "all" || mission.alertType === alertType;
      return zoneOk && typeOk;
    });
  }, [data?.missions, zone, alertType]);

  const groupedMissions = useMemo(() => groupByZone(filteredMissions), [filteredMissions]);
  const groupedVbucks = useMemo(
    () => groupByZone(Array.isArray(data?.vbucks?.missions) ? data.vbucks.missions : []),
    [data?.vbucks?.missions]
  );

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
                {labels.brandSub}
              </p>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="rounded-xl border border-[#284635] bg-[#0b120d] px-3 py-2 text-sm font-semibold text-white outline-none focus:border-[#67ff9a]"
            >
              <option value="es-419">ES</option>
              <option value="en">EN</option>
            </select>

            <nav className="hidden items-center gap-2 md:flex">
              <Link href="/" className="rounded-xl border border-[#284635] bg-[#0b120d] px-4 py-2 text-sm font-bold text-white">
                {labels.navShop}
              </Link>
              <Link href="/noticias" className="rounded-xl border border-[#284635] bg-[#0b120d] px-4 py-2 text-sm font-bold text-white">
                {labels.navNews}
              </Link>
              <Link href="/stw" className="rounded-xl bg-[#15d863] px-4 py-2 text-sm font-bold text-[#06110a]">
                {labels.navSTW}
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pt-4 md:hidden">
        <div className="grid grid-cols-3 gap-3">
          <Link href="/" className="rounded-xl border border-[#284635] bg-[#0b120d] px-4 py-3 text-center text-sm font-extrabold text-white">
            {labels.navShop}
          </Link>
          <Link href="/noticias" className="rounded-xl border border-[#284635] bg-[#0b120d] px-4 py-3 text-center text-sm font-extrabold text-white">
            {labels.navNews}
          </Link>
          <Link href="/stw" className="rounded-xl bg-[#15d863] px-4 py-3 text-center text-sm font-extrabold text-[#06110a]">
            {labels.navSTW}
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-6">
        <section className="mb-6 overflow-hidden rounded-[24px] border border-[#1d4a2d] bg-[linear-gradient(120deg,_rgba(0,255,102,0.10)_0%,_rgba(5,14,8,0.96)_35%,_rgba(2,7,3,0.96)_100%)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:rounded-[28px] md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.28em] text-[#67ff9a]">
                {labels.heroKicker}
              </p>
              <h1 className="text-3xl font-black uppercase italic sm:text-4xl md:text-6xl">
                {labels.heroTitle}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base md:text-lg">
                {labels.heroDesc}
              </p>
            </div>

            <div className="rounded-2xl border border-[#255239] bg-[#040804]/80 p-4 backdrop-blur md:p-5">
              <p className="text-sm font-semibold text-[#67ff9a]">
                {labels.nextReset}
              </p>
              <p className="mt-2 text-2xl font-black tracking-wider sm:text-3xl md:text-4xl">
                {timeLeft}
              </p>
              <p className="mt-2 text-xs text-slate-300 sm:text-sm">
                {labels.dailyRotation}
              </p>
            </div>
          </div>
        </section>

        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setTab("vbucks")}
            className={`rounded-2xl px-4 py-4 text-sm font-extrabold ${
              tab === "vbucks" ? "bg-[#15d863] text-[#06110a]" : "border border-[#284635] bg-[#0b120d] text-white"
            }`}
          >
            {labels.vbucksTab}
          </button>

          <button
            type="button"
            onClick={() => setTab("missions")}
            className={`rounded-2xl px-4 py-4 text-sm font-extrabold ${
              tab === "missions" ? "bg-[#15d863] text-[#06110a]" : "border border-[#284635] bg-[#0b120d] text-white"
            }`}
          >
            {labels.missionsTab}
          </button>
        </div>

        {tab === "missions" && (
          <div className="mb-6 grid gap-3 md:grid-cols-2">
            <select
              value={zone}
              onChange={(event) => setZone(event.target.value)}
              className="rounded-2xl border border-[#284635] bg-[#0b120d] px-4 py-4 text-sm font-semibold text-white outline-none"
            >
              <option value="all">{labels.allZones}</option>
              {(data?.filters?.zones || []).map((entry) => (
                <option key={entry} value={entry}>
                  {translateZone(entry, language)}
                </option>
              ))}
            </select>

            <select
              value={alertType}
              onChange={(event) => setAlertType(event.target.value)}
              className="rounded-2xl border border-[#284635] bg-[#0b120d] px-4 py-4 text-sm font-semibold text-white outline-none"
            >
              <option value="all">{labels.allTypes}</option>
              {(data?.filters?.alertTypes || []).map((entry) => (
                <option key={entry} value={entry}>
                  {translateAlertType(entry, language)}
                </option>
              ))}
            </select>
          </div>
        )}

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

        {!loading && !error && tab === "vbucks" && (
          <>
            <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-[22px] border border-[#1f3a2b] bg-[#0d1210] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                <p className="text-sm font-black uppercase tracking-[0.25em] text-[#67ff9a]">
                  {labels.vbucksToday}
                </p>
                <p className="mt-3 text-4xl font-black text-white">
                  {data?.vbucks?.totalVbucks || 0}
                </p>
              </div>

              <div className="rounded-[22px] border border-[#1f3a2b] bg-[#0d1210] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                <p className="text-sm font-black uppercase tracking-[0.25em] text-[#67ff9a]">
                  {labels.missionsWithVbucks}
                </p>
                <p className="mt-3 text-4xl font-black text-white">
                  {data?.vbucks?.totalMissions || 0}
                </p>
              </div>

              <div className="rounded-[22px] border border-[#1f3a2b] bg-[#0d1210] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
                <p className="text-sm font-black uppercase tracking-[0.25em] text-[#67ff9a]">
                  {labels.dailyReset}
                </p>
                <p className="mt-3 text-3xl font-black text-white">
                  {timeLeft}
                </p>
              </div>
            </section>

            {groupedVbucks.length === 0 ? (
              <div className="rounded-2xl border border-[#1a2c21] bg-[#060b07] p-6 text-slate-300">
                {labels.noVbucksToday}
              </div>
            ) : (
              <div className="space-y-8">
                {groupedVbucks.map(([zoneName, entries]) => (
                  <section key={zoneName}>
                    <h2 className="mb-4 text-2xl font-black uppercase italic text-[#67ff9a]">
                      {translateZone(zoneName, language)}
                    </h2>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                      {entries.map((mission) => (
                        <MissionCard key={mission.id} mission={mission} labels={labels} language={language} accent="cyan" />
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </>
        )}

        {!loading && !error && tab === "missions" && (
          groupedMissions.length === 0 ? (
            <div className="rounded-2xl border border-[#1a2c21] bg-[#060b07] p-6 text-slate-300">
              {labels.noMissionsForFilter}
            </div>
          ) : (
            <div className="space-y-8">
              {groupedMissions.map(([zoneName, entries]) => (
                <section key={zoneName}>
                  <h2 className="mb-4 text-2xl font-black uppercase italic text-[#67ff9a]">
                    {translateZone(zoneName, language)}
                  </h2>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {entries.map((mission) => (
                      <MissionCard key={mission.id} mission={mission} labels={labels} language={language} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )
        )}
      </div>
    </main>
  );
}
