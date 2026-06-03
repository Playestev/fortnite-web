"use client";

import { useEffect, useState } from "react";

export default function PwaInstallButton() {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // Registrar el service worker
    async function registerServiceWorker() {
      if (!("serviceWorker" in navigator)) return;

      try {
        await navigator.serviceWorker.register("/sw.js");
        console.log("Service worker registrado correctamente.");
      } catch (error) {
        console.error("No se pudo registrar el service worker:", error);
      }
    }

    if (document.readyState === "complete") {
      registerServiceWorker();
    } else {
      window.addEventListener("load", registerServiceWorker);
    }

    // Detectar si ya se abrió como app instalada
    const standaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    setIsInstalled(standaloneMode);

    // Detectar iPhone o iPad
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIos(/iphone|ipad|ipod/.test(userAgent));

    // Guardar el aviso de instalación para mostrarlo al presionar el botón
    function handleBeforeInstallPrompt(event) {
      event.preventDefault();
      setInstallPrompt(event);
    }

    // Ocultar el botón cuando termine la instalación
    function handleAppInstalled() {
      setInstallPrompt(null);
      setIsInstalled(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("load", registerServiceWorker);
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  async function installApp() {
    if (!installPrompt) return;

    await installPrompt.prompt();
    await installPrompt.userChoice;

    setInstallPrompt(null);
  }

  // No mostrar nada si la app ya está instalada
  if (isInstalled) return null;

  // En iPhone la instalación se hace manualmente desde Safari
  if (isIos) {
    return (
      <div className="mt-4 rounded-2xl border border-[#1eff7a]/35 bg-[#07140f]/90 p-4 text-sm text-white">
        <p className="font-black text-[#67ff9a]">
          📲 Instalar Ganker Games en iPhone
        </p>

        <p className="mt-2 text-xs leading-relaxed text-zinc-300">
          Abre esta página en Safari, presiona Compartir y elige
          <strong className="text-white"> “Agregar a pantalla de inicio”</strong>.
        </p>
      </div>
    );
  }

  // En Android solo aparece cuando Chrome confirma que la PWA es instalable
  if (!installPrompt) return null;

  return (
    <button
      type="button"
      onClick={installApp}
      className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#1eff7a]/60 bg-[#1eff7a] px-5 py-4 text-sm font-black text-black shadow-[0_0_22px_rgba(30,255,122,.25)] transition hover:bg-[#67ff9a]"
    >
      📲 Instalar app de Ganker Games
    </button>
  );
}