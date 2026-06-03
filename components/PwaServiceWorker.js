"use client";

import { useEffect } from "react";

const RELOAD_GUARD_KEY = "gkg-sw-last-reload";

export default function PwaServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let active = true;

    async function registerAndUpdateServiceWorker() {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          updateViaCache: "none",
        });

        if (!active) return;

        // Busca una versión nueva del service worker al abrir la app.
        await registration.update();
      } catch (error) {
        console.error("No se pudo actualizar el service worker:", error);
      }
    }

    function handleControllerChange() {
      const now = Date.now();
      const lastReload = Number(
        window.sessionStorage.getItem(RELOAD_GUARD_KEY) || 0
      );

      // Evita ciclos de recarga si el navegador dispara el evento más de una vez.
      if (now - lastReload < 10000) return;

      window.sessionStorage.setItem(RELOAD_GUARD_KEY, String(now));
      window.location.reload();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        registerAndUpdateServiceWorker();
      }
    }

    registerAndUpdateServiceWorker();

    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange
    );

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;

      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);

  return null;
}