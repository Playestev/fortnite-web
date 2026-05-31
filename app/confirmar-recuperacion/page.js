"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ConfirmarRecuperacionPage() {
  const supabase = useMemo(() => createClient(), []);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleContinue() {
    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get("token_hash");
    const type = params.get("type");

    if (!tokenHash || type !== "recovery") {
      setMessage(
        "El enlace de recuperación no es válido o está incompleto. Solicita uno nuevo."
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: "recovery",
      });

      if (error) throw error;

      // Retira el código temporal de la barra del navegador.
      window.history.replaceState(
        {},
        document.title,
        "/confirmar-recuperacion"
      );

      // Usa una navegación completa para que la nueva página lea
      // la sesión ya guardada por Supabase sin quedarse renderizando.
      window.location.replace("/reset-password");
    } catch (error) {
      setMessage(
        "El enlace ya venció, ya fue utilizado o no es válido. Solicita un correo nuevo."
      );
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(0,255,102,0.18),_transparent_28%),linear-gradient(180deg,#000_0%,#021106_100%)] px-4 py-10 text-white">
      <div className="w-full max-w-3xl rounded-[28px] border border-[#1eff7a]/30 bg-[#04120d]/90 p-6 shadow-[0_0_40px_rgba(21,216,99,0.14)] md:p-8">
        <h1 className="text-3xl font-black italic">
          Confirmar recuperación
        </h1>

        <p className="mt-2 text-sm text-slate-300">
          Presiona el botón para confirmar que deseas establecer una nueva contraseña para tu cuenta.
        </p>

        {message && (
          <div className="mt-7 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
            {message}
          </div>
        )}

        <button
          type="button"
          onClick={handleContinue}
          disabled={loading}
          className="mt-7 w-full rounded-2xl bg-[#1eff7a] px-4 py-4 font-black text-black shadow-[0_0_24px_rgba(30,255,122,0.22)] transition hover:bg-[#67ff9a] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Validando enlace..." : "Continuar para cambiar contraseña"}
        </button>

        <Link
          href="/olvide-contrasena"
          className="mt-5 block text-center text-sm font-black text-[#67ff9a] transition hover:text-white"
        >
          Solicitar otro enlace
        </Link>
      </div>
    </main>
  );
}
