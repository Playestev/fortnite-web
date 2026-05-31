"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function OlvideContrasenaPage() {
  const supabase = useMemo(() => createClient(), []);

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setMessage("Escribe un correo electrónico válido.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");
    setMessageType("info");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        // El correo abre una pantalla intermedia.
        // El token NO se valida automáticamente al cargar la página.
        redirectTo: `${window.location.origin}/confirmar-recuperacion`,
      });

      if (error) throw error;

      setMessage(
        "Si el correo pertenece a una cuenta, recibirás un enlace para cambiar tu contraseña. Revisa también spam o correo no deseado."
      );
      setMessageType("success");
    } catch (error) {
      setMessage(
        error.message || "No se pudo enviar el correo de recuperación."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(0,255,102,0.18),_transparent_28%),linear-gradient(180deg,#000_0%,#021106_100%)] px-4 py-10 text-white">
      <div className="w-full max-w-3xl rounded-[28px] border border-[#1eff7a]/30 bg-[#04120d]/90 p-6 shadow-[0_0_40px_rgba(21,216,99,0.14)] md:p-8">
        <h1 className="text-3xl font-black italic">
          ¿Olvidaste tu contraseña?
        </h1>

        <p className="mt-2 text-sm text-slate-300">
          Escribe tu correo y te enviaremos un enlace para restaurar tu contraseña.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-black">
              Correo <span className="text-[#67ff9a]">*</span>
            </label>

            <input
              type="email"
              required
              autoComplete="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-[#1eff7a]/30 bg-[#08140f] px-4 py-4 text-white outline-none focus:border-[#67ff9a]"
            />
          </div>

          {message && (
            <div
              className={`rounded-2xl border p-3 text-sm ${
                messageType === "error"
                  ? "border-red-500/40 bg-red-500/10 text-red-300"
                  : "border-[#1eff7a]/30 bg-[#07140f] text-[#67ff9a]"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#1eff7a] px-4 py-4 font-black text-black shadow-[0_0_24px_rgba(30,255,122,0.22)] transition hover:bg-[#67ff9a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Enviando..." : "Enviar correo de recuperación"}
          </button>
        </form>

        <Link
          href="/login"
          className="mt-5 block text-center text-sm font-black text-[#67ff9a] transition hover:text-white"
        >
          Volver a iniciar sesión
        </Link>
      </div>
    </main>
  );
}
