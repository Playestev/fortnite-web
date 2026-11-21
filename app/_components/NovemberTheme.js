"use client";

import { useEffect, useState } from "react";

const themeKey = "gkg-shop-theme";
const themeEvent = "gkg-shop-theme-change";

export function NovemberThemeSync() {
  useEffect(() => {
    function sync(event) {
      if (event?.type === themeEvent && typeof event.detail === "boolean") {
        document.documentElement.dataset.gkgSeason = event.detail ? "november" : "classic";
        return;
      }
      let autumn = true;
      try { autumn = window.localStorage.getItem(themeKey) !== "default"; } catch {}
      document.documentElement.dataset.gkgSeason = autumn ? "november" : "classic";
    }
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(themeEvent, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(themeEvent, sync);
      delete document.documentElement.dataset.gkgSeason;
    };
  }, []);
  return null;
}

export function useNovemberTheme() {
  const [active, setActive] = useState(true);
  useEffect(() => {
    const syncTheme = () => {
      try { setActive(window.localStorage.getItem(themeKey) !== "default"); } catch {}
    };
    syncTheme();
    window.addEventListener("storage", syncTheme);
    return () => window.removeEventListener("storage", syncTheme);
  }, []);
  return [active, () => {
    const next = !active;
    setActive(next);
    try { window.localStorage.setItem(themeKey, next ? "november" : "default"); } catch {}
    window.dispatchEvent(new CustomEvent(themeEvent, { detail: next }));
  }];
}

export function NovemberSwitch({ active, onToggle, english = false }) {
  return (
    <div className="relative z-10 flex justify-center px-3 py-3">
      <button type="button" role="switch" aria-checked={active} onClick={onToggle}
        className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        style={active ? { color: "#ffb47d", borderColor: "#c86436", background: "#22110c" }
          : { color: "#67ff9a", borderColor: "#398656", background: "#07140f" }}>
        <span aria-hidden="true">🍂</span>
        {english ? "November theme" : "Tema de noviembre"}
        <span aria-hidden="true" className="inline-flex h-4 w-8 items-center rounded-full p-0.5"
          style={{ justifyContent: active ? "flex-end" : "flex-start", background: active ? "#f58a42" : "#37473e" }}>
          <span className="h-3 w-3 rounded-full bg-white" />
        </span>
      </button>
    </div>
  );
}

export function NovemberBackdrop() {
  return (
    <>
      <style>{`
        main[data-gkg-theme="november"] { isolation:isolate; background:linear-gradient(180deg,#1b0d08,#0b0706 65%,#050404); }
        [data-gkg-theme="november"] img:is([src="/gankergames-header-logo.png"],[src="/gankergames-profile-icon.png"],[src="/gankergames-logo.png"]) {
          filter: hue-rotate(-100deg) saturate(.88) brightness(1.2);
        }
        [data-gkg-theme="november"] :is([class*="border-[#8cff9f]"],[class*="border-[#b4ffc0]"]) {
          border-color:#ed8a50;
        }
        [data-gkg-theme="november"] [class*="135deg,#0d2418"] {
          background-image:linear-gradient(135deg,#482319,#21110e);
        }
        [data-gkg-theme="november"] [class*="rgba(22,232,61,0.28)"] {
          background-image:radial-gradient(circle at 30% 30%,#9c492d,#25120e 72%);
        }
        [data-gkg-theme="november"] :is([class*="shadow-"][class*="rgba(21,255,98"],[class*="shadow-"][class*="rgba(30,255,122"]):not(img) {
          box-shadow:0 0 0 2px #f4814126,0 0 21px #c7554045;
        }
        [data-gkg-theme="november"] :is([class*="text-[#63ff9b]"],[class*="text-[#67ff9a]"],[class*="text-[#1eff7a]"]) { color:#ffb47d; }
        [data-gkg-theme="november"] :is([class*="border-[#1eff7a]"],[class*="border-[#67ff9a]"],[class*="border-[#63ff9b]"],[class*="border-[#0f3d22]"]) { border-color:#82432a; }
        [data-gkg-theme="november"] :is([class*="bg-[#021509]"],[class*="bg-[#020804]"],[class*="bg-[#07140f]"],[class*="bg-[#04140b]"],[class*="bg-[#08140f]"],[class*="bg-[#04120d]"],[class*="bg-[#0b1f15]"],[class*="bg-[#021109]"],[class*="bg-[#001207]"]) { background-color:#1c100d; }
        [data-gkg-theme="november"] :is([class~="bg-[#1eff7a]"],[class~="bg-[#15d863]"],[class~="bg-[#63ff9b]"]) { background-color:#f58a42; }
        [data-gkg-theme="november"] :is([class^="bg-[#1eff7a]/"],[class*=" bg-[#1eff7a]/"]) { background-color:#e68a4426; }
        [data-gkg-theme="november"] [class*="hover:bg-[#1eff7a]/"]:hover { background-color:#e68a4433; }
        [data-gkg-theme="november"] [class*="bg-[rgba(3,16,9,0.92)]"] {
          background:linear-gradient(180deg,#281610,#170c09);
        }
        [data-gkg-theme="november"] .gkg-november-notifications button:has(svg) {
          background-color:#24130e;
          border-color:#82432a;
          color:#ffb47d;
        }
        [data-gkg-theme="november"] .gkg-november-notifications button:has(svg):hover {
          background-color:#3d2116;
          border-color:#ed8a50;
        }
        [data-gkg-theme="november"] :is(button,a):is([class~="bg-[#1eff7a]"],[class~="bg-[#15d863]"],[class~="bg-[#63ff9b]"]) { color:#241109; }
        [data-gkg-theme="november"] [class*="#06240f_0%"] { background-image:linear-gradient(145deg,#502015,#190d0a 75%); }
        [data-gkg-theme="november"] [class*="[background-image:linear-gradient(rgba(30,255,122"] { opacity:0; }
        [data-gkg-theme="november"] [class*="shadow-"][class*="rgba(21,216,99"]:not(img) { box-shadow:0 6px 22px #a3462638; }
        .gkg-site-leaves { position:fixed; inset:0; z-index:-1; overflow:hidden; pointer-events:none; }
        .gkg-site-leaves svg { position:absolute; top:-36px; opacity:.6; animation:gkgSiteLeafFall linear infinite; }
        @keyframes gkgSiteLeafFall { from { transform:translate3d(0,-4vh,0) rotate(-35deg); } to { transform:translate3d(var(--leaf-drift),115vh,0) rotate(315deg); } }
        @media(prefers-reduced-motion:reduce) {
          .gkg-site-leaves svg { animation:none; }
          .gkg-site-leaves svg:nth-child(3n+1) { top:19%; }
          .gkg-site-leaves svg:nth-child(3n+2) { top:49%; }
          .gkg-site-leaves svg:nth-child(3n) { top:82%; }
        }
      `}</style>
      <div className="gkg-site-leaves" aria-hidden="true">
        {Array.from({ length: 16 }, (_, i) => (
          <svg key={i} viewBox="0 0 40 40" style={{
            left: `${(i * 37 + 4) % 100}%`, width: `${13 + (i * 7) % 17}px`,
            color: ["#ff943d", "#d4482e", "#f5b35d", "#ad3629"][i % 4],
            animationDuration: `${13 + i % 7}s`, animationDelay: `-${i * 1.73}s`,
            "--leaf-drift": i % 2 ? "64px" : "-52px",
          }}>
            <path fill="currentColor" d="M18 33C8 30 5 24 5 17l8 2L11 8l8 5L24 2l4 11 8-3-3 10 5-1c-2 9-9 14-20 14Z" />
            <path d="M15 38c6-7 8-12 10-23" fill="none" stroke="#642619" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        ))}
      </div>
    </>
  );
}
