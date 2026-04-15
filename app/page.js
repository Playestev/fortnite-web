"use client";

import Link from "next/link";
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
  "Sandy Salute": "Saludo Arenoso",
  "Motor Monster": "Monstruo Motorizado",
  Hatcback: "Eclosión",
  "Side To Side": "De Lado a Lado",
  "Wild Blade": "Hoja Salvaje",
  "Captain Hook's Flag": "Bandera del Capitán Garfio",
  "Nike Air Kukini SE 'Leopard'": "Nike Air Kukini SE 'Leopard'",
  "Silver Surfer's Surfboard": "Tabla de Silver Surfer",
  Gabriela: "Gabriela",
  Demolisher: "Demoledora",
  "Tactical Crusher": "Trituradora Táctica",
};

const VB_TO_MXN_RATE = 0.09;
const LEAVING_SOON_HOURS = 24;
const WHATSAPP_BASE_URL = "https://wa.me/5216568558434";

function getTimeUntilNextShopUpdate(lang) {
  const now = new Date();

  const nextUtcMidnight = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0,
      0,
      0
    )
  );

  const diff = nextUtcMidnight - now;

  if (diff <= 0) {
    return lang === "es-419" ? "Actualizando..." : "Updating...";
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}:${String(seconds).padStart(2, "0")}`;
}

function getTimeUntilDate(dateString, lang) {
  if (!dateString) {
    return lang === "es-419" ? "Sin fecha" : "No date";
  }

  const now = new Date();
  const target = new Date(dateString);
  const diff = target - now;

  if (!Number.isFinite(target.getTime())) {
    return lang === "es-419" ? "Sin fecha" : "No date";
  }

  if (diff <= 0) {
    return lang === "es-419" ? "Ya salió" : "Gone";
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  return `${hours}h ${minutes}m`;
}

function isLeavingSoon(dateString) {
  if (!dateString) return false;

  const now = new Date();
  const target = new Date(dateString);
  const diff = target - now;

  if (!Number.isFinite(target.getTime()) || diff <= 0) return false;

  return diff <= LEAVING_SOON_HOURS * 60 * 60 * 1000;
}

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

  if (lang === "en") return englishName;

  const manualTranslation = NAME_TRANSLATIONS_ES_MX[englishName];
  if (manualTranslation) return manualTranslation;

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

function formatMxPrice(vbucks) {
  const numericPrice = Number(vbucks);

  if (!Number.isFinite(numericPrice)) {
    return "MXN N/D";
  }

  const mxnPrice = numericPrice * VB_TO_MXN_RATE;
  return `MX$${mxnPrice.toFixed(2)}`;
}

function encodeCart(cart) {
  return cart
    .filter((item) => item.qty > 0)
    .map((item) => `${encodeURIComponent(item.id)}:${item.qty}`)
    .join(",");
}

function decodeCart(value) {
  if (!value) return [];

  return value
    .split(",")
    .map((part) => {
      const [rawId, rawQty] = part.split(":");
      const id = decodeURIComponent(rawId || "");
      const qty = Number(rawQty);

      if (!id || !Number.isFinite(qty) || qty <= 0) return null;

      return { id, qty };
    })
    .filter(Boolean);
}

function ShopCard({ item, language, labels, onAddToCart }) {
  const displayName = getDisplayName(item, language);
  const secondaryEnglishName = getSecondaryEnglishName(item, language);
  const displayType = getDisplayType(item, language);
  const displaySection = getDisplaySection(item, language);
  const mxnPrice = formatMxPrice(item.price);
  const leavingSoon = isLeavingSoon(item.outDate);
  const leaveCountdown = getTimeUntilDate(item.outDate, language);

  return (
    <article
      className={`overflow-hidden rounded-[22px] bg-[#0d1210] shadow-[0_10px_30px_rgba(0,0,0,0.28)] transition duration-200 hover:-translate-y-1 ${
        leavingSoon
          ? "border-2 border-red-500 ring-2 ring-red-500/30"
          : "border border-[#1f3a2b]"
      }`}
    >
      <div className="relative">
        {item.image ? (
          <div className="flex h-56 w-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(0,255,87,0.18),_transparent_45%),linear-gradient(180deg,_#060706_0%,_#0b120d_100%)] p-3 sm:h-64 sm:p-4 md:h-72">
            <img
              src={item.image}
              alt={displayName}
              loading="lazy"
              className="h-full w-full object-contain"
            />
          </div>
        ) : (
          <div className="grid h-56 w-full place-items-center bg-[#101812] text-slate-400 sm:h-64 md:h-72">
            {labels.noImage}
          </div>
        )}

        {leavingSoon && (
          <div className="absolute left-3 top-3 rounded-full border border-red-300 bg-red-500 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-lg sm:text-xs">
            {labels.leavingSoon}
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#67ff9a] sm:text-sm">
          {displaySection}
        </p>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-extrabold leading-tight text-white sm:text-lg">
              {displayName}
            </h2>

            {secondaryEnglishName && (
              <p className="mt-1 text-[11px] italic text-slate-400 sm:text-xs">
                {secondaryEnglishName}
              </p>
            )}
          </div>

          <div className="shrink-0 rounded-full border border-[#88ffae] bg-[#15d863] px-3 py-1 text-xs font-extrabold text-[#06110a] shadow-lg sm:text-sm">
            {mxnPrice}
          </div>
        </div>

        <p className="mt-2 text-xs text-slate-300 sm:text-sm">{displayType}</p>

        <p className="mt-3 text-sm font-extrabold text-white sm:text-base">
          {item.price} {labels.vbucks}
        </p>

        {item.outDate && (
          <div
            className={`mt-3 rounded-xl px-3 py-2 ${
              leavingSoon
                ? "border border-red-500/50 bg-red-500/10"
                : "border border-[#28392f] bg-[#07100a]"
            }`}
          >
            <p className="text-[11px] text-slate-400 sm:text-xs">
              {labels.leavesIn}
            </p>
            <p
              className={`text-sm font-bold ${
                leavingSoon ? "text-red-300" : "text-[#8dffb3]"
              }`}
            >
              {leaveCountdown}
            </p>
          </div>
        )}

        <button
          onClick={() => onAddToCart(item)}
          className="mt-4 w-full rounded-xl bg-[#15d863] px-4 py-3 text-sm font-extrabold text-[#06110a] transition hover:bg-[#2cff7a]"
        >
          {labels.addToCart}
        </button>
      </div>
    </article>
  );
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
  const [timeLeft, setTimeLeft] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");

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

  useEffect(() => {
    setTimeLeft(getTimeUntilNextShopUpdate(language));

    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilNextShopUpdate(language));
    }, 1000);

    return () => clearInterval(interval);
  }, [language]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const cartFromUrl = new URLSearchParams(window.location.search).get("cart");
    const savedCart = window.localStorage.getItem("gkg-cart");

    if (cartFromUrl) {
      setCart(decodeCart(cartFromUrl));
      return;
    }

    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("gkg-cart", JSON.stringify(cart));
  }, [cart]);

  const labels =
    language === "es-419"
      ? {
          brand: "Ganker Games",
          title: "TIENDA",
          heroTitle: "Lo más destacado de hoy",
          heroText:
            "Explora la tienda diaria con precios en MXN, V-Bucks, filtros por sección y objetos que están por salir.",
          refresh: loadingRefresh ? "Actualizando..." : "Actualizar tienda",
          search: "Buscar skin, bundle, track, sección...",
          all: "Todas",
          filters: "Filtros",
          closeFilters: "Cerrar filtros",
          loading: "Cargando tienda...",
          noResults: "No se encontraron resultados con ese filtro.",
          noImage: "Sin imagen",
          vbucks: "V-Bucks",
          countdownTitle: "Próxima actualización",
          countdownNote: "La tienda cambia diario a las 00:00 UTC",
          leavingSoon: "Se va pronto",
          leavesIn: "Se va en",
          navShop: "Tienda",
          navNews: "Noticias",
          addToCart: "Agregar al carrito",
          cart: "Carrito",
          yourCart: "Tu carrito",
          emptyCart: "Tu carrito está vacío",
          quantity: "Cantidad",
          clearCart: "Vaciar carrito",
          shareCart: "Copiar enlace",
          sendWhatsApp: "Enviar por WhatsApp",
          close: "Cerrar",
          copied: "Enlace copiado",
          itemsLabel: "artículos",
          totalVbucks: "Total V-Bucks",
          totalMxn: "Total MXN",
          remove: "Quitar",
          orderText: "Hola, quiero cotizar este carrito de Ganker Games Fortnite:",
          sharedLink: "Link del carrito",
          openCart: "Abrir carrito",
        }
      : {
          brand: "Ganker Games",
          title: "SHOP",
          heroTitle: "Top picks for today",
          heroText:
            "Browse the daily shop with MXN pricing, V-Bucks, section filters and items that are leaving soon.",
          refresh: loadingRefresh ? "Refreshing..." : "Refresh shop",
          search: "Search skin, bundle, track, section...",
          all: "All",
          filters: "Filters",
          closeFilters: "Close filters",
          loading: "Loading shop...",
          noResults: "No results found for that filter.",
          noImage: "No image",
          vbucks: "V-Bucks",
          countdownTitle: "Next update",
          countdownNote: "The shop refreshes daily at 00:00 UTC",
          leavingSoon: "Leaving soon",
          leavesIn: "Leaves in",
          navShop: "Shop",
          navNews: "News",
          addToCart: "Add to cart",
          cart: "Cart",
          yourCart: "Your cart",
          emptyCart: "Your cart is empty",
          quantity: "Quantity",
          clearCart: "Clear cart",
          shareCart: "Copy link",
          sendWhatsApp: "Send on WhatsApp",
          close: "Close",
          copied: "Link copied",
          itemsLabel: "items",
          totalVbucks: "Total V-Bucks",
          totalMxn: "Total MXN",
          remove: "Remove",
          orderText: "Hi, I want a quote for this Ganker Games Fortnite cart:",
          sharedLink: "Cart link",
          openCart: "Open cart",
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

  const groupedItems = useMemo(() => {
    const groups = {};

    for (const item of items) {
      const groupName = getDisplaySection(item, language) || translatedAllLabel;

      if (!groups[groupName]) {
        groups[groupName] = [];
      }

      groups[groupName].push(item);
    }

    return Object.entries(groups).sort((a, b) =>
      a[0].localeCompare(b[0], language === "es-419" ? "es" : "en")
    );
  }, [items, language, translatedAllLabel]);

  const cartDetailed = useMemo(() => {
    return cart
      .map((cartItem) => {
        const item = allItems.find((shopItem) => shopItem.id === cartItem.id);

        if (!item) return null;

        const priceVbucks = Number(item.price) || 0;
        const priceMxn = priceVbucks * VB_TO_MXN_RATE;

        return {
          ...item,
          qty: cartItem.qty,
          totalVbucks: priceVbucks * cartItem.qty,
          totalMxn: priceMxn * cartItem.qty,
        };
      })
      .filter(Boolean);
  }, [cart, allItems]);

  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + item.qty, 0),
    [cart]
  );

  const cartTotalVbucks = useMemo(
    () => cartDetailed.reduce((total, item) => total + item.totalVbucks, 0),
    [cartDetailed]
  );

  const cartTotalMxn = useMemo(
    () => cartDetailed.reduce((total, item) => total + item.totalMxn, 0),
    [cartDetailed]
  );

  const selectedSectionTitle =
    section === translatedAllLabel ? labels.heroTitle : section;

  function handleSectionChange(sectionName) {
    setSection(sectionName);
    setShowMobileFilters(false);
  }

  function addToCart(item) {
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id);

      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, qty: cartItem.qty + 1 }
            : cartItem
        );
      }

      return [...prev, { id: item.id, qty: 1 }];
    });

    setCartOpen(true);
  }

  function updateCartQty(itemId, nextQty) {
    setCart((prev) => {
      if (nextQty <= 0) {
        return prev.filter((item) => item.id !== itemId);
      }

      return prev.map((item) =>
        item.id === itemId ? { ...item, qty: nextQty } : item
      );
    });
  }

  function removeFromCart(itemId) {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  }

  function clearCart() {
    setCart([]);
  }

  function buildShareLink() {
    if (typeof window === "undefined") return "";

    const encoded = encodeCart(cart);
    const url = new URL(window.location.origin + window.location.pathname);

    if (encoded) {
      url.searchParams.set("cart", encoded);
    }

    return url.toString();
  }

  async function copyCartLink() {
    const link = buildShareLink();

    if (!link) return;

    try {
      await navigator.clipboard.writeText(link);
      setCopyStatus(labels.copied);
      setTimeout(() => setCopyStatus(""), 2500);
    } catch {
      setCopyStatus("Error");
      setTimeout(() => setCopyStatus(""), 2500);
    }
  }

  function sendCartToWhatsApp() {
    const shareLink = buildShareLink();

    const lines = cartDetailed.map((item) => {
      const name = getDisplayName(item, language);
      return `• ${name} x${item.qty} - ${item.totalVbucks} ${labels.vbucks} - MX$${item.totalMxn.toFixed(
        2
      )}`;
    });

    const message = [
      labels.orderText,
      "",
      ...lines,
      "",
      `${labels.totalVbucks}: ${cartTotalVbucks} ${labels.vbucks}`,
      `${labels.totalMxn}: MX$${cartTotalMxn.toFixed(2)}`,
      "",
      `${labels.sharedLink}:`,
      shareLink,
    ].join("\n");

    window.open(`${WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`, "_blank");
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(0,255,102,0.14),_transparent_20%),linear-gradient(180deg,_#000000_0%,_#021106_45%,_#000000_100%)] text-white">
      <header className="sticky top-0 z-50 border-b border-[#153321] bg-[#030603]/90 backdrop-blur">
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
                Fortnite Shop
              </p>
            </div>
          </div>

          <nav className="ml-auto hidden items-center gap-2 md:flex">
            <Link
              href="/"
              className="rounded-xl bg-[#15d863] px-4 py-2 text-sm font-bold text-[#06110a]"
            >
              {labels.navShop}
            </Link>
            <Link
              href="/noticias"
              className="rounded-xl border border-[#284635] bg-[#0b120d] px-4 py-2 text-sm font-bold text-white transition hover:border-[#67ff9a]"
            >
              {labels.navNews}
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="rounded-xl border border-[#67ff9a] bg-[#0b120d] px-4 py-2 text-sm font-bold text-[#67ff9a]"
            >
              {labels.cart} ({cartCount})
            </button>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-6">
        <section className="mb-5 overflow-hidden rounded-[24px] border border-[#1d4a2d] bg-[linear-gradient(120deg,_rgba(0,255,102,0.10)_0%,_rgba(5,14,8,0.96)_35%,_rgba(2,7,3,0.96)_100%)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:mb-6 md:rounded-[28px] md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.28em] text-[#67ff9a] sm:text-sm md:tracking-[0.3em]">
                {labels.brand}
              </p>
              <h1 className="text-3xl font-black uppercase italic sm:text-4xl md:text-6xl">
                {labels.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base md:text-lg">
                {labels.heroText}
              </p>
            </div>

            <div className="rounded-2xl border border-[#255239] bg-[#040804]/80 p-4 backdrop-blur md:p-5">
              <p className="text-sm font-semibold text-[#67ff9a]">
                {labels.countdownTitle}
              </p>
              <p className="mt-2 text-2xl font-black tracking-wider sm:text-3xl md:text-4xl">
                {timeLeft}
              </p>
              <p className="mt-2 text-xs text-slate-300 sm:text-sm">
                {labels.countdownNote}
              </p>
            </div>
          </div>
        </section>

        <div className="mb-5 grid gap-3 md:hidden">
          <div className="grid grid-cols-3 gap-3">
            <Link
              href="/"
              className="rounded-xl bg-[#15d863] px-4 py-3 text-center text-sm font-extrabold text-[#06110a]"
            >
              {labels.navShop}
            </Link>
            <Link
              href="/noticias"
              className="rounded-xl border border-[#284635] bg-[#0b120d] px-4 py-3 text-center text-sm font-extrabold text-white"
            >
              {labels.navNews}
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              className="rounded-xl border border-[#67ff9a] bg-[#0b120d] px-4 py-3 text-center text-sm font-extrabold text-[#67ff9a]"
            >
              {labels.cart} ({cartCount})
            </button>
          </div>

          <input
            type="text"
            placeholder={labels.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border border-[#284635] bg-[#0c110d] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-[#67ff9a]"
          />

          <div className="grid grid-cols-[1fr_90px] gap-3">
            <button
              onClick={() => setShowMobileFilters((prev) => !prev)}
              className="rounded-xl border border-[#284635] bg-[#0d1210] px-4 py-3 text-sm font-extrabold text-white"
            >
              {showMobileFilters ? labels.closeFilters : labels.filters}
            </button>

            <select
              value={language}
              onChange={(e) => {
                const newLanguage = e.target.value;
                setSearch("");
                setLanguage(newLanguage);
                setSection(newLanguage === "es-419" ? "Todas" : "All");
              }}
              className="rounded-xl border border-[#284635] bg-[#0b120d] px-3 py-3 text-sm font-semibold text-white outline-none"
            >
              <option value="es-419">ES</option>
              <option value="en">EN</option>
            </select>
          </div>

          <button
            onClick={() => loadShop(true, language)}
            className="rounded-xl bg-[#15d863] px-4 py-3 text-sm font-extrabold text-[#06110a]"
          >
            {labels.refresh}
          </button>

          {showMobileFilters && (
            <div className="rounded-2xl border border-[#1f3a2b] bg-[#060b07]/95 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.28)]">
              <div className="max-h-[45vh] space-y-2 overflow-y-auto pr-1">
                {sections.map((sectionName) => {
                  const active = section === sectionName;

                  return (
                    <button
                      key={sectionName}
                      onClick={() => handleSectionChange(sectionName)}
                      className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-extrabold uppercase tracking-wide transition ${
                        active
                          ? "bg-[#15d863] text-[#06110a] shadow-lg"
                          : "bg-[#0d1210] text-white hover:bg-[#131b15]"
                      }`}
                    >
                      {sectionName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="hidden h-fit rounded-[28px] border border-[#1f3a2b] bg-[#060b07]/95 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.28)] lg:sticky lg:top-24 lg:block">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black uppercase tracking-wide text-white">
                {labels.filters}
              </h2>
            </div>

            <div className="max-h-[70vh] space-y-2 overflow-y-auto pr-1">
              {sections.map((sectionName) => {
                const active = section === sectionName;

                return (
                  <button
                    key={sectionName}
                    onClick={() => setSection(sectionName)}
                    className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-extrabold uppercase tracking-wide transition ${
                      active
                        ? "bg-[#15d863] text-[#06110a] shadow-lg"
                        : "bg-[#0d1210] text-white hover:bg-[#131b15]"
                    }`}
                  >
                    {sectionName}
                  </button>
                );
              })}
            </div>
          </aside>

          <section>
            <div className="mb-5 rounded-[24px] border border-[#1a2c21] bg-[#060b07]/95 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.25)] md:mb-6 md:rounded-[28px] md:p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-[#67ff9a] sm:text-sm md:tracking-[0.3em]">
                    {labels.brand}
                  </p>
                  <h2 className="mt-2 text-2xl font-black uppercase italic sm:text-3xl md:text-5xl">
                    {selectedSectionTitle}
                  </h2>
                </div>

                <div className="hidden w-full max-w-3xl flex-col gap-3 md:flex xl:items-end">
                  <div className="flex w-full flex-wrap items-center gap-3 xl:justify-end">
                    <div className="min-w-[280px] flex-1 xl:max-w-xl">
                      <input
                        type="text"
                        placeholder={labels.search}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-full border border-[#284635] bg-[#0c110d] px-5 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-[#67ff9a]"
                      />
                    </div>

                    <select
                      value={language}
                      onChange={(e) => {
                        const newLanguage = e.target.value;
                        setSearch("");
                        setLanguage(newLanguage);
                        setSection(newLanguage === "es-419" ? "Todas" : "All");
                      }}
                      className="rounded-xl border border-[#284635] bg-[#0b120d] px-4 py-3 text-sm font-semibold text-white outline-none focus:border-[#67ff9a]"
                    >
                      <option value="es-419">ES</option>
                      <option value="en">EN</option>
                    </select>

                    <button
                      onClick={() => loadShop(true, language)}
                      className="rounded-xl bg-[#15d863] px-4 py-3 text-sm font-extrabold text-[#06110a] transition hover:bg-[#2cff7a]"
                    >
                      {labels.refresh}
                    </button>
                  </div>
                </div>
              </div>
            </div>

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

            {!loading && !error && items.length === 0 && (
              <div className="rounded-2xl border border-[#1a2c21] bg-[#060b07] p-6 text-slate-300">
                {labels.noResults}
              </div>
            )}

            {!loading &&
              !error &&
              items.length > 0 &&
              section !== translatedAllLabel && (
                <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {items.map((item) => (
                    <ShopCard
                      key={item.id}
                      item={item}
                      language={language}
                      labels={labels}
                      onAddToCart={addToCart}
                    />
                  ))}
                </section>
              )}

            {!loading &&
              !error &&
              items.length > 0 &&
              section === translatedAllLabel && (
                <div className="space-y-8 md:space-y-10">
                  {groupedItems.map(([groupName, groupItems]) => (
                    <section key={groupName}>
                      <div className="mb-4 flex items-center justify-between gap-3">
                        <h3 className="text-xl font-black uppercase italic text-[#67ff9a] sm:text-2xl">
                          {groupName}
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {groupItems.map((item) => (
                          <ShopCard
                            key={item.id}
                            item={item}
                            language={language}
                            labels={labels}
                            onAddToCart={addToCart}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
          </section>
        </div>
      </div>

      {cartCount > 0 && !cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-4 right-4 z-40 rounded-full border border-[#88ffae] bg-[#15d863] px-5 py-3 text-sm font-extrabold text-[#06110a] shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
        >
          {labels.openCart} ({cartCount})
        </button>
      )}

      {cartOpen && (
        <div className="fixed inset-0 z-[70]">
          <div
            className="absolute inset-0 bg-black/65"
            onClick={() => setCartOpen(false)}
          />

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-[#1f3a2b] bg-[#050905] shadow-[0_0_40px_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between border-b border-[#1f3a2b] px-4 py-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.28em] text-[#67ff9a]">
                  {labels.brand}
                </p>
                <h2 className="mt-1 text-2xl font-black uppercase italic">
                  {labels.yourCart}
                </h2>
              </div>

              <button
                onClick={() => setCartOpen(false)}
                className="rounded-xl border border-[#284635] bg-[#0d1210] px-3 py-2 text-sm font-bold text-white"
              >
                {labels.close}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {cartDetailed.length === 0 ? (
                <div className="rounded-2xl border border-[#1f3a2b] bg-[#0d1210] p-4 text-slate-300">
                  {labels.emptyCart}
                </div>
              ) : (
                <div className="space-y-3">
                  {cartDetailed.map((item) => {
                    const displayName = getDisplayName(item, language);
                    const unitMxn = Number(item.price || 0) * VB_TO_MXN_RATE;

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-[#1f3a2b] bg-[#0d1210] p-3"
                      >
                        <div className="flex gap-3">
                          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[#101812]">
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={displayName}
                                className="h-full w-full object-contain"
                              />
                            ) : null}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="line-clamp-2 text-sm font-extrabold text-white">
                              {displayName}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {item.price} {labels.vbucks}
                            </p>
                            <p className="mt-1 text-xs text-[#67ff9a]">
                              MX${unitMxn.toFixed(2)} c/u
                            </p>

                            <div className="mt-3 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    updateCartQty(item.id, item.qty - 1)
                                  }
                                  className="grid h-8 w-8 place-items-center rounded-lg border border-[#284635] bg-[#060b07] text-white"
                                >
                                  -
                                </button>

                                <span className="min-w-[24px] text-center text-sm font-bold text-white">
                                  {item.qty}
                                </span>

                                <button
                                  onClick={() =>
                                    updateCartQty(item.id, item.qty + 1)
                                  }
                                  className="grid h-8 w-8 place-items-center rounded-lg border border-[#284635] bg-[#060b07] text-white"
                                >
                                  +
                                </button>
                              </div>

                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-xs font-bold text-red-300"
                              >
                                {labels.remove}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-[#1f3a2b] bg-[#040804] p-4">
              <div className="mb-4 space-y-2 rounded-2xl border border-[#1f3a2b] bg-[#0d1210] p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-300">{labels.totalVbucks}</span>
                  <span className="text-sm font-extrabold text-white">
                    {cartTotalVbucks} {labels.vbucks}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-slate-300">{labels.totalMxn}</span>
                  <span className="text-sm font-extrabold text-[#67ff9a]">
                    MX${cartTotalMxn.toFixed(2)}
                  </span>
                </div>
              </div>

              {copyStatus && (
                <p className="mb-3 text-sm font-bold text-[#67ff9a]">
                  {copyStatus}
                </p>
              )}

              <div className="grid gap-3">
                <button
                  onClick={copyCartLink}
                  disabled={cartDetailed.length === 0}
                  className="rounded-xl border border-[#67ff9a] bg-transparent px-4 py-3 text-sm font-extrabold text-[#67ff9a] transition hover:bg-[#15d863] hover:text-[#06110a] disabled:opacity-50"
                >
                  {labels.shareCart}
                </button>

                <button
                  onClick={sendCartToWhatsApp}
                  disabled={cartDetailed.length === 0}
                  className="rounded-xl bg-[#15d863] px-4 py-3 text-sm font-extrabold text-[#06110a] transition hover:bg-[#2cff7a] disabled:opacity-50"
                >
                  {labels.sendWhatsApp}
                </button>

                <button
                  onClick={clearCart}
                  disabled={cartDetailed.length === 0}
                  className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-extrabold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                >
                  {labels.clearCart}
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}