"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const SYMBOL_REGEX = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

function validateNewPassword(password) {
  if (password.length < 8) {
    return "La contraseña nueva debe tener mínimo 8 caracteres.";
  }

  if (!/[A-Z]/.test(password)) {
    return "La contraseña nueva debe tener al menos una letra mayúscula.";
  }

  if (!/[a-z]/.test(password)) {
    return "La contraseña nueva debe tener al menos una letra minúscula.";
  }

  if (!/[0-9]/.test(password)) {
    return "La contraseña nueva debe tener al menos un número.";
  }

  if (!SYMBOL_REGEX.test(password)) {
    return "La contraseña nueva debe tener al menos un signo o símbolo.";
  }

  return "";
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [checkingLink, setCheckingLink] = useState(true);
  const [canResetPassword, setCanResetPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");

  useEffect(() => {
    let active = true;
    let fallbackTimeout;

    function allowPasswordReset() {
      if (!active) return;
      setCanResetPassword(true);
      setCheckingLink(false);
      setMessage("");
    }

    function rejectPasswordReset() {
      if (!active) return;
      setCanResetPassword(false);
      setCheckingLink(false);
      setMessage(
        "El enlace de recuperación no es válido o ya venció. Solicita uno nuevo."
      );
      setMessageType("error");
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      if (event === "PASSWORD_RECOVERY" || session) {
        allowPasswordReset();
      }
    });

    async function prepareRecoverySession() {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const code = searchParams.get("code");

        // Si Supabase usa PKCE, el enlace llega con ?code=...
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) throw error;

          allowPasswordReset();
          return;
        }

        // Si Supabase procesa el enlace desde el fragmento de la URL,
        // la sesión puede estar disponible directamente o unos instantes después.
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          allowPasswordReset();
          return;
        }

        fallbackTimeout = window.setTimeout(async () => {
          const {
            data: { session: delayedSession },
          } = await supabase.auth.getSession();

          if (delayedSession) {
            allowPasswordReset();
          } else {
            rejectPasswordReset();
          }
        }, 1200);
      } catch {
        rejectPasswordReset();
      }
    }

    prepareRecoverySession();

    return () => {
      active = false;
      if (fallbackTimeout) window.clearTimeout(fallbackTimeout);
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!canResetPassword) {
      setMessage("Solicita un nuevo enlace de recuperación.");
      setMessageType("error");
      return;
    }

    const passwordError = validateNewPassword(newPassword);

    if (passwordError) {
      setMessage(passwordError);
      setMessageType("error");
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("Las contraseñas no coinciden.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage("");
    setMessageType("info");

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setMessage("Contraseña actualizada correctamente. Ya puedes iniciar sesión.");
      setMessageType("success");

      await supabase.auth.signOut();

      window.setTimeout(() => {
        router.replace("/login");
        router.refresh();
      }, 1800);
    } catch (error) {
      setMessage(error.message || "No se pudo actualizar la contraseña.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(0,255,102,0.18),_transparent_28%),linear-gradient(180deg,#000_0%,#021106_100%)] px-4 py-10 text-white">
      <div className="w-full max-w-3xl rounded-[28px] border border-[#1eff7a]/30 bg-[#04120d]/90 p-6 shadow-[0_0_40px_rgba(21,216,99,0.14)] md:p-8">
        <h1 className="text-3xl font-black italic">Nueva contraseña</h1>

        <p className="mt-2 text-sm text-slate-300">
          Escribe tu nueva contraseña y confírmala para recuperar tu cuenta.
        </p>

        {checkingLink ? (
          <div className="mt-7 rounded-2xl border border-[#1eff7a]/25 bg-[#07140f] p-4 text-sm text-[#67ff9a]">
            Validando enlace de recuperación...
          </div>
        ) : canResetPassword ? (
          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-black">
                  Contraseña nueva <span className="text-[#67ff9a]">*</span>
                </label>

                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Mínimo 8 caracteres"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    className="w-full rounded-2xl border border-[#1eff7a]/30 bg-[#08140f] px-4 py-4 pr-16 text-white outline-none focus:border-[#67ff9a]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowNewPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-[#67ff9a] transition hover:text-white"
                  >
                    {showNewPassword ? "Ocultar" : "Ver"}
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-black">
                  Repetir contraseña nueva <span className="text-[#67ff9a]">*</span>
                </label>

                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    placeholder="Confirma tu contraseña"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    className="w-full rounded-2xl border border-[#1eff7a]/30 bg-[#08140f] px-4 py-4 pr-16 text-white outline-none focus:border-[#67ff9a]"
                  />

                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((current) => !current)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-[#67ff9a] transition hover:text-white"
                  >
                    {showConfirmPassword ? "Ocultar" : "Ver"}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#1eff7a]/20 bg-[#07140f] p-3 text-xs leading-5 text-slate-300">
              Usa mínimo 8 caracteres, una mayúscula, una minúscula, un número y un signo.
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
              {loading ? "Guardando..." : "Guardar contraseña"}
            </button>
          </form>
        ) : (
          <div className="mt-7">
            {message && (
              <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">
                {message}
              </div>
            )}

            <Link
              href="/olvide-contrasena"
              className="mt-5 block w-full rounded-2xl bg-[#1eff7a] px-4 py-4 text-center font-black text-black transition hover:bg-[#67ff9a]"
            >
              Solicitar otro enlace
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
