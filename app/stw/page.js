"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function getTimeUntil(dateString) {
  if (!dateString) return "00:00:00";

  const now = new Date();
  const target = new Date(dateString);
  const diff = target - now;

  if (!Number.isFinite(target.getTime()) || diff <= 0) {
    return "00:00:00";
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
}

function groupByZone(items) {
  const groups = {};

  for (const item of items) {
    if (!groups[item.zone]) groups[item.zone] = [];
    groups[item.zone].push(item);
  }

  return Object.entries(groups);
}

function MissionCard({ mission, mode = "normal", labels }) {
  const isVbucks = mode === "vbucks";

  return (
    <article
      className={`rounded-[24px] border p-4 shadow-[0_10px_30px_rgba(0,0,0,0.28)] ${
        isVbucks
          ? "border-[#1f5b3d] bg-[linear-gradient(180deg,_rgba(21,216,99,0.10)_0%,_rgba(5,14,8,0.96)_100%)]"
          : "border-[#1f3a2b] bg-[#0d1210]"
      }`}
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-[#15d863] px-3 py-1 text-xs font-extrabold text-[#06110a]">
          {mission.zone}
        </span>

        <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-bold text-slate-200">
          {mission.alertType}
        </span>

        {mission.powerLevel ? (
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs font-bold text-slate-300">
            PL {mission.powerLevel}
          </span>
        ) : null}
      </div>

      <h3 className="text-lg font-black leading-tight text-white">
        {mission.title}
      </h3>

      <p className="mt-3 text-sm leading-6 text-slate-300">
        {mission.rewardText || labels.noRewardDetails}
      </p>
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

  const labels =
    language === "en"
      ? {
          brandSub: "STW",
          title: "STW",
          subtitle:
            "V-Bucks and Save the World missions with daily updates.",
          nextReset: "Next reset",
          dailyRotation: "Daily rotation",
          vbucksTab: "V-Bucks",
          missionsTab: "Missions",
          shop: "Shop",
          news: "News",
          allZones: "All zones",
          allTypes: "All types",
          loading: "Loading STW...",
          loadError: "Could not load STW",
          vbucksToday: "V-Bucks today",
          missionsWithVbucks: "Missions with V-Bucks",
          dailyReset: "Daily reset",
          noVbucksToday: "There are no V-Bucks missions today.",
          noMissionsForFilter: "There are no missions for this filter.",
          noRewardDetails: "No reward details.",
        }
      : {
          brandSub: "STW",
          title: "STW",
          subtitle:
            "Pavos y misiones de Save the World con actualización diaria.",
          nextReset: "Próximo reset",
          dailyRotation: "Rotación diaria",
          vbucksTab: "Pavos",
          missionsTab: "Misiones",
          shop: "Tienda",
          news: "Noticias",
          allZones: "Todas las zonas",
          allTypes: "Todos los tipos",
          loading: "Cargando STW...",
          loadError: "No se pudo cargar STW",
          vbucksToday: "Pavos hoy",
          missionsWithVbucks: "Misiones con pavos",
          dailyReset: "Reset diario",
          noVbucksToday: "Hoy no hay misiones con pavos.",
          noMissionsForFilter: "No hay misiones para este filtro.",
          noRewardDetails: "Sin detalles de recompensa.",
        };

  async function loadSTW() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/stw", { cache: "no-store" });
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};

      if (!res.ok) {
        throw new Error(json.error || labels.loadError);
      }

      setData(json);
    } catch (err) {
      setError(err.message || labels.loadError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSTW();
  }, []);

  useEffect(() => {
    if (!data?.nextResetAt) return;

    setTimeLeft(getTimeUntil(data.nextResetAt));

    const interval = setInterval(() => {
      setTimeLeft(getTimeUntil(data.nextResetAt));
    }, 1000);

    return () => clearInterval(interval);
  }, [data?.nextResetAt]);

  const filteredMissions = useMemo(() => {
    if (!data?.missions) return [];

    return data.missions.filter((mission) => {
      const zoneOk = zone === "all" || mission.zone === zone;
      const typeOk = alertType === "all" || mission.alertType === alertType;
      return zoneOk && typeOk;
    });
  }, [data?.missions, zone, alertType]);

  const groupedVbucks = useMemo(() => {
    return groupByZone(data?.vbucks?.missions || []);
  }, [data?.vbucks?.missions]);

  const groupedMissions = useMemo(() => {
    return groupByZone(filteredMissions);
  }, [filteredMissions]);

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
                Ganker Games
              </p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#67ff9a] sm:text-xs">
                {labels.brandSub}
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
                className="rounded-xl border border-[#284635] bg-[#0b120d] px-4 py-2 text-sm font-bold text-white"
              >
                {labels.news}
              </Link>
              <Link
                href="/stw"
                className="rounded-xl bg-[#15d863] px-4 py-2 text-sm font-bold text-[#06110a]"
              >
                STW
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-6">
        <section className="mb-6 overflow-hidden rounded-[24px] border border-[#1d4a2d] bg-[linear-gradient(120deg,_rgba(0,255,102,0.10)_0%,_rgba(5,14,8,0.96)_35%,_rgba(2,7,3,0.96)_100%)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:rounded-[28px] md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.28em] text-[#67ff9a]">
                Ganker Games
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
            onClick={() => setTab("vbucks")}
            className={`rounded-2xl px-4 py-4 text-sm font-extrabold ${
              tab === "vbucks"
                ? "bg-[#15d863] text-[#06110a]"
                : "border border-[#284635] bg-[#0b120d] text-white"
            }`}
          >
            {labels.vbucksTab}
          </button>

          <button
            onClick={() => setTab("missions")}
            className={`rounded-2xl px-4 py-4 text-sm font-extrabold ${
              tab === "missions"
                ? "bg-[#15d863] text-[#06110a]"
                : "border border-[#284635] bg-[#0b120d] text-white"
            }`}
          >
            {labels.missionsTab}
          </button>
        </div>

        {tab === "missions" && (
          <div className="mb-6 grid gap-3 md:grid-cols-2">
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="rounded-2xl border border-[#284635] bg-[#0b120d] px-4 py-4 text-sm font-semibold text-white outline-none"
            >
              <option value="all">{labels.allZones}</option>
              {(data?.filters?.zones || []).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select
              value={alertType}
              onChange={(e) => setAlertType(e.target.value)}
              className="rounded-2xl border border-[#284635] bg-[#0b120d] px-4 py-4 text-sm font-semibold text-white outline-none"
            >
              <option value="all">{labels.allTypes}</option>
              {(data?.filters?.alertTypes || []).map((item) => (
                <option key={item} value={item}>
                  {item}
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
                {groupedVbucks.map(([zoneName, missions]) => (
                  <section key={zoneName}>
                    <h2 className="mb-4 text-2xl font-black uppercase italic text-[#67ff9a]">
                      {zoneName}
                    </h2>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {missions.map((mission) => (
                        <MissionCard
                          key={mission.id}
                          mission={mission}
                          mode="vbucks"
                          labels={labels}
                        />
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
              {groupedMissions.map(([zoneName, missions]) => (
                <section key={zoneName}>
                  <h2 className="mb-4 text-2xl font-black uppercase italic text-[#67ff9a]">
                    {zoneName}
                  </h2>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {missions.map((mission) => (
                      <MissionCard
                        key={mission.id}
                        mission={mission}
                        labels={labels}
                      />
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