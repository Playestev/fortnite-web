"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "gkg-cookie-notice-accepted";

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = window.localStorage.getItem(STORAGE_KEY);

    if (!accepted) {
      setVisible(true);
    }
  }, []);

  function acceptNotice() {
    window.localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] px-4 pb-4">
      <div className="mx-auto max-w-4xl rounded-[22px] border border-[#1eff7a]/35 bg-[#04120d]/95 p-4 text-white shadow-[0_0_35px_rgba(21,216,99,0.20)] backdrop-blur-xl md:flex md:items-center md:justify-between md:gap-5">
        <div>
          <p className="text-sm font-black text-[#67ff9a]">
            🍪 Cookies y almacenamiento técnico
          </p>

          <p className="mt-2 text-xs leading-5 text-slate-300">
            Utilizamos almacenamiento estrictamente necesario para mantener tu
            sesión, recordar preferencias y permitir el funcionamiento de
            Ganker Games como app instalable.
          </p>

          <Link
            href="/politica-de-cookies"
            className="mt-2 inline-block text-xs font-black text-[#67ff9a] underline transition hover:text-white"
          >
            Consultar política de cookies
          </Link>
        </div>

        <button
          type="button"
          onClick={acceptNotice}
          className="mt-4 w-full rounded-2xl bg-[#15d863] px-5 py-3 text-sm font-black text-[#06110a] shadow-[0_0_18px_rgba(21,216,99,0.20)] transition hover:bg-[#67ff9a] md:mt-0 md:w-auto md:min-w-[150px]"
        >
          Entendido
        </button>
      </div>
    </div>
  );
}