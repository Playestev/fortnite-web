"use client";

import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toPng } from "html-to-image";

const LANG_STORAGE_KEY = "gkg-lang";
const CART_STORAGE_KEY = "gkg-cart";
const SHOP_SNAPSHOT_KEY = "gkg-shop-snapshot-v4";
const SHOP_RECENT_GONE_KEY = "gkg-shop-recent-gone-v4";
const VB_TO_LOCAL_RATE = 0.09;
const AUTO_ROTATE_MS = 10000;
const PRODUCT_IMAGE_LOAD_TIMEOUT_MS = 12000;
const PRODUCT_IMAGE_MAX_FAILURES = 4;
const CLIENT_GKG_TUTORIAL_SKIP_KEY = "gkg-client-skip-tutorial-v1";
const SUMMARY_IMAGE_PLACEHOLDER =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
      <rect width="160" height="160" rx="24" fill="#06140d"/>
      <rect x="5" y="5" width="150" height="150" rx="20" fill="none" stroke="#15d863" stroke-width="4"/>
      <text x="80" y="93" text-anchor="middle" font-family="Arial,Helvetica,sans-serif" font-size="42" font-weight="900" fill="#67ff9a">GKG</text>
    </svg>`
  );

const STAR_POINTS = [
  { top: "6%", left: "8%", size: 2, delay: "0s", duration: "3.4s" },
  { top: "12%", left: "76%", size: 3, delay: "0.7s", duration: "4.2s" },
  { top: "18%", left: "28%", size: 2, delay: "1.1s", duration: "3.8s" },
  { top: "22%", left: "58%", size: 4, delay: "0.2s", duration: "4.6s" },
  { top: "29%", left: "88%", size: 2, delay: "1.6s", duration: "3.6s" },
  { top: "34%", left: "14%", size: 3, delay: "0.9s", duration: "4.1s" },
  { top: "41%", left: "47%", size: 2, delay: "1.8s", duration: "3.5s" },
  { top: "48%", left: "71%", size: 3, delay: "0.5s", duration: "4.8s" },
  { top: "55%", left: "21%", size: 2, delay: "1.4s", duration: "3.7s" },
  { top: "61%", left: "63%", size: 4, delay: "0.3s", duration: "4.4s" },
  { top: "68%", left: "39%", size: 2, delay: "1.0s", duration: "3.9s" },
  { top: "73%", left: "83%", size: 3, delay: "1.7s", duration: "4.7s" },
  { top: "79%", left: "11%", size: 2, delay: "0.4s", duration: "3.6s" },
  { top: "84%", left: "53%", size: 3, delay: "1.3s", duration: "4.5s" },
  { top: "89%", left: "91%", size: 2, delay: "0.8s", duration: "3.8s" },
  { top: "93%", left: "32%", size: 4, delay: "1.9s", duration: "4.9s" },
];

const LABELS = {
  "es-419": {
    brand: "GKG",
    brandSub: "TIENDA FORTNITE",
    objectsFortnite: "OBJETOS FORTNITE",
    changingLanguage: "Cambiando idioma",
    loadingLanguage: "Cargando...",
    navShop: "Tienda",
    navVbucks: "paVos",
    navNews: "Noticias",
    navSTW: "STW",
    login: "Iniciar sesión",
    myProfile: "Mi perfil",
    cart: "Carrito",
    heroKicker: "",
    heroTitle: "",
    heroDesc: "",
    nextUpdate: "Próxima actualización",
    shopChangesAt: "Cambio de tienda a las 18 horas en horario México",
    searchPlaceholder: "Buscar skin, bundle, track, sección...",
    searchButton: "Buscar",
    filterButton: "Filtro",
    sortButton: "Ordenar",
    all: "Todas",
    recent: "Reciente",
    newOnly: "¡Nuevos!",
    recentlyGone: "Dejaron la tienda",
    close: "Cerrar",
    addToCart: "Agregar al carrito",
    remove: "Quitar",
    emptyCart: "Tu carrito está vacío",
    total: "Total",
    totalVbucks: "Total V-Bucks",
    sendWhatsApp: "Mandar por WhatsApp",
    shareLink: "Copiar enlace",
    copied: "Enlace copiado",
    itemShare: "Compartir",
    leavingSoon: "SE VA PRONTO",
    newBadge: "NUEVO",
    includes: "INCLUYE",
    setLabel: "Set",
    rarityLabel: "Rareza",
    timeLeft: "Se va en",
    leavesOn: "Sale el",
    loading: "Cargando tienda...",
    noResults: "No se encontraron resultados con ese filtro.",
    noRecentlyGone: "Aún no hay objetos registrados como recién salidos.",
    vbucks: "paVos",
    showAllSections: "Mostrar todas las secciones",
    filterTitle: "FILTRO DE LA TIENDA",
    sortTitle: "ORDENAR TIENDA",
    onlineNow: "En línea",
    visitors: "visitantes",
    menu: "Menú",
    featuredToday: "LO MÁS DESTACADO DE HOY",
    sortFeatured: "Destacado",
    sortRecent: "Más reciente",
    sortHighPrice: "Precio alto",
    sortLowPrice: "Precio bajo",
    sortLeavingSoon: "Se van pronto",
    sortAZ: "A-Z",
    sortZA: "Z-A",
    resetSort: "Reiniciar",
    typeLabels: {
      bundle: "Lote",
      outfit: "Skin",
      pickaxe: "Pico",
      backpack: "Mochila",
      glider: "Ala delta",
      emote: "Emote",
      wrap: "Papel tapiz",
      aura: "Aura",
      jamtrack: "Canción",
      shoe: "Calzado",
      contrail: "Estela",
      loadingscreen: "Pantalla",
      spray: "Spray",
      music: "Música",
      toy: "Juguete",
      pet: "Mascota",
      emoji: "Emoji",
      banner: "Banner",
      vehicle: "Carro",
      instrument: "Instrumento",
      fallback: "Objeto",
    },
  },
  en: {
    brand: "GKG",
    brandSub: "FORTNITE SHOP",
    objectsFortnite: "FORTNITE ITEMS",
    changingLanguage: "Changing language",
    loadingLanguage: "Loading...",
    navShop: "Shop",
    navVbucks: "V-Bucks",
    navNews: "News",
    navSTW: "STW",
    login: "Log in",
    myProfile: "My profile",
    cart: "Cart",
    heroKicker: "",
    heroTitle: "",
    heroDesc: "",
    nextUpdate: "Next update",
    shopChangesAt: "The shop refreshes daily at 6:00 PM Mexico time",
    searchPlaceholder: "Search skin, bundle, track, section...",
    searchButton: "Search",
    filterButton: "Filter",
    sortButton: "Sort",
    all: "All",
    recent: "Recent",
    newOnly: "New!",
    recentlyGone: "Left the shop",
    close: "Close",
    addToCart: "Add to cart",
    remove: "Remove",
    emptyCart: "Your cart is empty",
    total: "Total",
    totalVbucks: "Total V-Bucks",
    sendWhatsApp: "Send on WhatsApp",
    shareLink: "Copy link",
    copied: "Link copied",
    itemShare: "Share",
    leavingSoon: "LEAVING SOON",
    newBadge: "NEW",
    includes: "INCLUDES",
    setLabel: "Set",
    rarityLabel: "Rarity",
    timeLeft: "Leaves in",
    leavesOn: "Leaves on",
    loading: "Loading shop...",
    noResults: "No results found with that filter.",
    noRecentlyGone: "No recently gone items registered yet.",
    vbucks: "paVos",
    showAllSections: "Show all sections",
    filterTitle: "SHOP FILTER",
    sortTitle: "SORT SHOP",
    onlineNow: "Online",
    visitors: "visitors",
    menu: "Menu",
    featuredToday: "TOP PICKS FOR TODAY",
    sortFeatured: "Featured",
    sortRecent: "Most recent",
    sortHighPrice: "High price",
    sortLowPrice: "Low price",
    sortLeavingSoon: "Leaving soon",
    sortAZ: "A-Z",
    sortZA: "Z-A",
    resetSort: "Reset",
    typeLabels: {
      bundle: "Bundle",
      outfit: "Outfit",
      pickaxe: "Pickaxe",
      backpack: "Back Bling",
      glider: "Glider",
      emote: "Emote",
      wrap: "Wrap",
      aura: "Aura",
      jamtrack: "Song",
      shoe: "Shoes",
      contrail: "Contrail",
      loadingscreen: "Loading Screen",
      spray: "Spray",
      music: "Music",
      toy: "Toy",
      pet: "Pet",
      emoji: "Emoji",
      banner: "Banner",
      vehicle: "Car",
      instrument: "Instrument",
      fallback: "Item",
    },
  },
};

const CARD_THEME_PALETTE = [
  { top: "#efb08c", middle: "#db865f", bottom: "#05101c", fade: "#db865f" },
  { top: "#9cc6ff", middle: "#5d95ff", bottom: "#05101c", fade: "#5d95ff" },
  { top: "#87e2c2", middle: "#37b67d", bottom: "#05101c", fade: "#37b67d" },
  { top: "#f3d37a", middle: "#d4a933", bottom: "#05101c", fade: "#d4a933" },
  { top: "#d9a9ff", middle: "#944de6", bottom: "#05101c", fade: "#944de6" },
  { top: "#90d6f7", middle: "#2fb8dd", bottom: "#05101c", fade: "#2fb8dd" },
  { top: "#f4a1ca", middle: "#d54d9b", bottom: "#05101c", fade: "#d54d9b" },
  { top: "#c2e48c", middle: "#7fb631", bottom: "#05101c", fade: "#7fb631" },
];

function asText(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "object") {
    return (
      value.displayValue ||
      value.backendValue ||
      value.value ||
      value.text ||
      value.name ||
      value.title ||
      ""
    );
  }
  return "";
}

function normalizeUrl(url) {
  if (typeof url !== "string") return "";
  const value = url.trim();
  if (!value) return "";
  if (value.startsWith("//")) return `https:${value}`;
  return value.replace(/^http:/i, "https:");
}

function dedupeStrings(values) {
  const seen = new Set();
  const result = [];
  for (const raw of values) {
    const value = normalizeUrl(raw);
    if (!value || seen.has(value)) continue;
    seen.add(value);
    result.push(value);
  }
  return result;
}

function getDisplaySection(item) {
  return (
    asText(item.sectionLocalized) ||
    asText(item.sectionEnglish) ||
    asText(item.section?.name) ||
    asText(item.section) ||
    "Shop"
  );
}

function getDisplayName(item) {
  return asText(item.nameLocalized) || asText(item.nameEnglish) || asText(item.name) || "Item";
}

function localPrice(language, vbucks) {
  const amount = Number(vbucks || 0);
  const price = amount * VB_TO_LOCAL_RATE;
  return language === "en" ? `$${price.toFixed(2)}` : `MX$${price.toFixed(2)}`;
}

function formatVbucks(value) {
  return new Intl.NumberFormat("es-MX", {
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function getCountdownToNextShopUpdate() {
  const now = new Date();
  const next = new Date(now);
  next.setUTCHours(24, 0, 0, 0);
  const diff = next.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getTimeUntilDate(dateString, language) {
  if (!dateString) return language === "en" ? "No date" : "Sin fecha";
  const diff = new Date(dateString).getTime() - Date.now();
  if (!Number.isFinite(diff)) return language === "en" ? "No date" : "Sin fecha";
  if (diff <= 0) return language === "en" ? "Gone" : "Ya salió";
  const totalMinutes = Math.floor(diff / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function getCompactTimeUntilDate(dateString, language) {
  if (!dateString) return language === "en" ? "NO DATE" : "SIN FECHA";
  const diff = new Date(dateString).getTime() - Date.now();
  if (!Number.isFinite(diff)) return language === "en" ? "NO DATE" : "SIN FECHA";
  if (diff <= 0) return language === "en" ? "LEFT" : "YA SALIÓ";

  const totalMinutes = Math.max(0, Math.floor(diff / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}D ${hours}H`;
  if (hours > 0) return `${hours}H ${minutes}M`;
  return `${Math.max(1, minutes)}M`;
}

function getShopDateTimestamp(value) {
  if (value === null || value === undefined || value === "") return NaN;

  if (typeof value === "number") {
    const milliseconds = value < 1e12 ? value * 1000 : value;
    return Number.isFinite(milliseconds) ? milliseconds : NaN;
  }

  const text = String(value).trim();
  if (!text) return NaN;

  if (/^\d{10,13}$/.test(text)) {
    const numeric = Number(text);
    const milliseconds = text.length <= 10 ? numeric * 1000 : numeric;
    return Number.isFinite(milliseconds) ? milliseconds : NaN;
  }

  return new Date(text).getTime();
}

function getDirectOutDateValues(item) {
  return [
    item?.outDate,
    item?.out_date,
    item?.out,
    item?.until,
    item?.expiresAt,
    item?.expirationDate,
    item?.endDate,
    item?.end_date,
    item?.dates?.outDate,
    item?.dates?.out,
    item?.shopDates?.outDate,
    item?.shopDates?.out,
    item?.offer?.outDate,
    item?.offer?.out_date,
    item?.offer?.dates?.outDate,
    item?.offer?.dates?.out,
    item?.shop?.outDate,
    item?.meta?.outDate,
  ].filter((value) => value !== null && value !== undefined && value !== "");
}

function hasValidApiOutDate(item) {
  return getDirectOutDateValues(item).some((value) =>
    Number.isFinite(getShopDateTimestamp(value))
  );
}

function formatShopDepartureDate(dateString, language) {
  const timestamp = getShopDateTimestamp(dateString);
  if (!Number.isFinite(timestamp)) return language === "en" ? "No date" : "Sin fecha";

  return new Intl.DateTimeFormat(language === "en" ? "en-US" : "es-MX", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function extractHistory(rawHistory) {
  if (!Array.isArray(rawHistory)) return [];
  return rawHistory
    .map((entry) =>
      typeof entry === "string"
        ? { inDate: entry, outDate: "" }
        : {
            inDate: entry?.inDate || entry?.date || entry?.added || "",
            outDate: entry?.outDate || entry?.until || "",
          }
    )
    .filter((entry) => entry.inDate || entry.outDate);
}

function getLatestInDate(item) {
  const history = extractHistory(item.shopHistory);
  const historyDates = history
    .map((entry) => entry.inDate)
    .filter(Boolean)
    .map((value) => new Date(value).getTime())
    .filter((value) => Number.isFinite(value));

  // inDate representa cuándo entró la oferta a la tienda. addedDate solo
  // indica cuándo se agregó el cosmético a los archivos del juego.
  const directDates = [item.inDate]
    .filter(Boolean)
    .map((value) => new Date(value).getTime())
    .filter((value) => Number.isFinite(value));

  const all = [...historyDates, ...directDates];
  if (all.length === 0) return "";
  return new Date(Math.max(...all)).toISOString();
}

function getLatestOutDate(item) {
  const directDates = getDirectOutDateValues(item)
    .map(getShopDateTimestamp)
    .filter((value) => Number.isFinite(value));

  if (directDates.length > 0) {
    const futureDates = directDates.filter((value) => value > Date.now());
    const selectedDate = futureDates.length > 0 ? Math.min(...futureDates) : Math.max(...directDates);
    return new Date(selectedDate).toISOString();
  }

  const history = extractHistory(item.shopHistory);
  const historyDates = history
    .map((entry) => entry.outDate)
    .filter(Boolean)
    .map(getShopDateTimestamp)
    .filter((value) => Number.isFinite(value));

  if (historyDates.length > 0) {
    const futureDates = historyDates.filter((value) => value > Date.now());
    const selectedDate = futureDates.length > 0 ? Math.min(...futureDates) : Math.max(...historyDates);
    return new Date(selectedDate).toISOString();
  }

  // La fecha debe venir de la API. No asignamos la próxima rotación a todos
  // porque cada oferta puede permanecer una cantidad distinta de días.
  return "";
}

function isWithin24Hours(dateString) {
  if (!dateString) return false;
  const diff = Date.now() - new Date(dateString).getTime();
  return Number.isFinite(diff) && diff >= 0 && diff <= 24 * 60 * 60 * 1000;
}

function isCurrentShopArrival(dateString) {
  if (!dateString) return false;
  const arrivalTime = new Date(dateString).getTime();
  const now = Date.now();
  if (!Number.isFinite(arrivalTime) || arrivalTime > now + 5 * 60 * 1000) return false;

  const latestShopReset = new Date(now);
  latestShopReset.setUTCHours(0, 0, 0, 0);
  return arrivalTime >= latestShopReset.getTime();
}

function isLeavingSoon(dateString) {
  if (!dateString) return false;
  const diff = new Date(dateString).getTime() - Date.now();
  return diff > 0 && diff <= 24 * 60 * 60 * 1000;
}

function isNewByHistory(item) {
  if (typeof item.isFirstAppearance === "boolean") {
    return item.isFirstAppearance;
  }
  if (item.isNew === true) return true;
  const history = extractHistory(item.shopHistory);
  if (history.length === 0) return false;
  return history.length <= 1;
}

function isFreshNewItem(item) {
  return isNewByHistory(item) && isWithin24Hours(getLatestInDate(item));
}

function isRecentItem(item) {
  const shopArrival = item?.inDate || getLatestInDate(item);
  return isCurrentShopArrival(shopArrival) || isWithin24Hours(shopArrival);
}

function getCurrentPrice(item) {
  const priceObject =
    item?.price && typeof item.price === "object" && !Array.isArray(item.price)
      ? item.price
      : {};
  const candidates = [
    typeof item?.price === "number" || typeof item?.price === "string" ? item.price : null,
    priceObject.finalPrice,
    priceObject.regularPrice,
    priceObject.basePrice,
    priceObject.price,
    item?.finalPrice,
    item?.regularPrice,
    item?.basePrice,
    item?.vbucks,
    item?.priceVbucks,
    item?.offer?.finalPrice,
    item?.offer?.price,
  ];

  for (const candidate of candidates) {
    const value = Number(String(candidate ?? "").replace(/,/g, ""));
    if (Number.isFinite(value) && value > 0) return value;
  }

  const devName = asText(item?.devName);
  const devPrice = devName.match(/(?:for|por)\s+(-?\d[\d,]*)\s+MtxCurrency/i);
  if (devPrice) {
    const value = Number(devPrice[1].replace(/,/g, ""));
    if (Number.isFinite(value) && value > 0) return value;
  }

  return 0;
}

function getTypeKeyFromText(rawValue) {
  const value = asText(rawValue).trim().toLowerCase();
  if (!value) return "other";

  if (/(^|\s|[_-])(bundle|pack|lot|lote|paquete)s?($|\s|[_-])/.test(value)) return "bundle";

  // Mascotas / pets. Algunas APIs las mandan como PetCarrier o con nombres localizados.
  if (
    value.includes("petcarrier") ||
    value.includes("sidekick") ||
    value.includes("compañero") ||
    value.includes("pet carrier") ||
    value.includes("pet_carrier") ||
    value.includes("mascota") ||
    /(^|\s)pet($|\s)/.test(value) ||
    value.includes("guauff") ||
    value.includes("llamila")
  ) {
    return "pet";
  }

  if (
    value.includes("outfit") ||
    value.includes("atuendo") ||
    value.includes("skin") ||
    value.includes("traje") ||
    value.includes("personaje") ||
    value.includes("lego outfit") ||
    value.includes("character") ||
    value.includes("ichigo") ||
    value.includes("rukia") ||
    value.includes("orihime") ||
    value.includes("uryu") ||
    value.includes("uryū") ||
    value.includes("renji") ||
    value.includes("ben tennyson") ||
    value.includes("gwen tennyson") ||
    value.includes("hoshimachi") ||
    value.includes("suisei")
  ) {
    return "outfit";
  }
  if (value.includes("wrap") || value.includes("weapon wrap") || value.includes("envoltura") || value.includes("papel tapiz") || value.includes("papel")) return "wrap";
  if (value.includes("aura")) return "aura";
  if (value.includes("back") || value.includes("backpack") || value.includes("back bling") || value.includes("mochila")) return "backpack";
  if (value.includes("pickaxe") || value.includes("harvesting") || value.includes("pico")) return "pickaxe";
  if (value.includes("glider") || value.includes("ala")) return "glider";
  if (value.includes("emote") || value.includes("gesture") || value.includes("gesto") || value.includes("baile")) return "emote";
  if (value.includes("jam") || value.includes("jam track") || value.includes("song") || value.includes("canción") || value.includes("cancion")) return "jamtrack";
  if (value.includes("shoe") || value.includes("shoes") || value.includes("calzado") || value.includes("tenis")) return "shoe";
  if (value.includes("contrail") || value.includes("estela")) return "contrail";
  if (value.includes("loading") || value.includes("pantalla")) return "loadingscreen";
  if (value.includes("spray") || value.includes("grafiti")) return "spray";
  if (value.includes("music") || value.includes("música") || value.includes("musica")) return "music";
  if (value.includes("toy") || value.includes("juguete")) return "toy";
  if (value.includes("emoji")) return "emoji";
  if (value.includes("banner")) return "banner";
  if (/\b(?:vehicles?|cars?|carros?|veh[ií]culos?|wheels?|ruedas?|llantas?|decals?)\b/i.test(value)) return "vehicle";
  if (value.includes("instrument") || value.includes("instrumento")) return "instrument";

  return "other";
}

function getRawTypeKey(rawType, item = {}) {
  // Primero se revisan únicamente los campos estructurados. Los nombres de los
  // objetos incluidos no deben convertir un lote en mascota, mochila o pico.
  const structuredValue = [
    asText(rawType),
    asText(item.typeEnglish),
    asText(item.typeLocalized),
    asText(item.type),
    asText(item.displayType),
    asText(item.backendType),
    asText(item.backendValue),
  ]
    .filter(Boolean)
    .join(" ");
  const structuredKey = getTypeKeyFromText(structuredValue);
  if (structuredKey !== "other") return structuredKey;

  return getTypeKeyFromText(
    [
      asText(item.devName),
      asText(item.nameEnglish),
      asText(item.nameLocalized),
      asText(item.name),
      asText(item.descriptionEnglish),
      asText(item.descriptionLocalized),
      asText(item.description),
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function getTypeKey(rawType, item = {}) {
  const includedItems = Array.isArray(item?.includedItems)
    ? item.includedItems
    : Array.isArray(item?.grants)
      ? item.grants
      : [];

  const includedTypeKeys = [
    ...new Set(
      includedItems
        .map((entry) => getRawTypeKey(entry.typeEnglish || entry.typeLocalized || entry.type, entry))
        .filter(Boolean)
    ),
  ];

  const rawKey = getRawTypeKey(rawType, item);
  const hasBundleFlag = typeof item?.isBundle === "boolean";
  const vehicleType = [
    rawType, item.typeEnglish, item.typeLocalized, item.type, item.backendType, item.backendValue,
  ].some((value) => getTypeKeyFromText(value) === "vehicle");
  const vehicleName = /^(?:porsche cayenne\b|ruedas?\b|llantas?\b|wheels?\b)/i.test(getDisplayName(item).trim());
  if (item.isVehicleOffer === true || vehicleType || vehicleName ||
      (includedTypeKeys.includes("vehicle") && !includedTypeKeys.includes("outfit"))) {
    return "vehicle";
  }

  // La presencia de entry.bundle en Fortnite-API es la autoridad. La cantidad
  // de objetos incluidos no determina si la oferta es un lote: una skin puede
  // incluir su mochila y continuar siendo una oferta de atuendo.
  if (item?.isBundle === true || (!hasBundleFlag && rawKey === "bundle")) {
    return "bundle";
  }

  const directKey = item?.isBundle === false && rawKey === "bundle"
    ? "other"
    : rawKey;

  if (directKey !== "other") return directKey;

  // Si la oferta no es un lote y contiene un atuendo con accesorios incluidos,
  // se presenta como Skin. Solo después se revisan mascotas u otros tipos.
  if (includedTypeKeys.includes("outfit")) return "outfit";
  if (includedTypeKeys.includes("pet")) return "pet";

  if (includedTypeKeys.length > 0) {
    const priority = [
      "wrap",
      "aura",
      "backpack",
      "pickaxe",
      "glider",
      "emote",
      "jamtrack",
      "shoe",
      "contrail",
      "loadingscreen",
      "spray",
      "music",
      "toy",
      "emoji",
      "banner",
      "vehicle",
      "instrument",
    ];

    const best = priority.find((key) => includedTypeKeys.includes(key));
    if (best) return best;
    if (includedTypeKeys.length === 1) return includedTypeKeys[0];
  }

  return includedTypeKeys[0] || "other";
}

function getDisplayType(item, labels) {
  const key = getTypeKey(item.typeEnglish || item.typeLocalized || item.type, item);
  return labels.typeLabels[key] || labels.typeLabels.fallback;
}

function getTypeSortRank(item) {
  const key = item?._typeKey || getTypeKey(item?.typeEnglish || item?.typeLocalized || item?.type, item);

  const ranks = {
    bundle: 0,
    outfit: 1,
    pickaxe: 2,
    glider: 3,
    backpack: 4,
    jamtrack: 5,
    shoe: 6,
    pet: 7,
    wrap: 8,
    aura: 9,
    emote: 10,
    contrail: 11,
    loadingscreen: 12,
    spray: 13,
    music: 14,
    toy: 15,
    emoji: 16,
    banner: 17,
    vehicle: 18,
    instrument: 19,
    other: 99,
  };

  return ranks[key] ?? 99;
}

function sortItems(items, sortMode, preserveTypeRank = true) {
  const list = [...items];

  list.sort((a, b) => {
    if (preserveTypeRank) {
      const newDiff = Number(Boolean(b._isFreshNew)) - Number(Boolean(a._isFreshNew));
      if (newDiff !== 0) return newDiff;
      const rankDiff = getTypeSortRank(a) - getTypeSortRank(b);
      if (rankDiff !== 0) return rankDiff;
    }

    if (sortMode === "NONE") return 0;

    if (sortMode === "PRICE_HIGH") {
      const diff = Number(b.price || 0) - Number(a.price || 0);
      if (diff !== 0) return diff;
    }

    if (sortMode === "PRICE_LOW") {
      const diff = Number(a.price || 0) - Number(b.price || 0);
      if (diff !== 0) return diff;
    }

    if (sortMode === "RECENT") {
      const diff =
        new Date(b._latestInDate || 0).getTime() - new Date(a._latestInDate || 0).getTime();
      if (diff !== 0) return diff;
    }

    if (sortMode === "LEAVING_SOON") {
      const aSoon = a._latestOutDate ? new Date(a._latestOutDate).getTime() : Infinity;
      const bSoon = b._latestOutDate ? new Date(b._latestOutDate).getTime() : Infinity;
      if (aSoon !== bSoon) return aSoon - bSoon;
    }

    if (sortMode === "AZ") {
      const byName = getDisplayName(a).localeCompare(getDisplayName(b), "es", { sensitivity: "base" });
      if (byName !== 0) return byName;
    }

    if (sortMode === "ZA") {
      const byName = getDisplayName(b).localeCompare(getDisplayName(a), "es", { sensitivity: "base" });
      if (byName !== 0) return byName;
    }

    if (sortMode === "FEATURED") {
      const aScore = (a._isFreshNew ? 3 : 0) + (a._isLeavingSoon ? 2 : 0) + (a._isRecent ? 1 : 0);
      const bScore = (b._isFreshNew ? 3 : 0) + (b._isLeavingSoon ? 2 : 0) + (b._isRecent ? 1 : 0);
      if (bScore !== aScore) return bScore - aScore;
    }

    return getDisplayName(a).localeCompare(getDisplayName(b), "es", { sensitivity: "base" });
  });

  return list;
}

function buildVisibleItems({ items, recentlyGone, selectedSection, search, labels, sortMode }) {
  const searchText = search.trim().toLowerCase();

  const applySearch = (list) => {
    if (!searchText) return list;

    return list.filter((item) => {
      const completeSearchText = [
        getDisplayName(item),
        asText(item.nameEnglish),
        item._section,
        getDisplayType(item, labels),
        item.devName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return completeSearchText.includes(searchText);
    });
  };

  if (selectedSection === "LEFT") {
    return sortItems(applySearch(recentlyGone), sortMode, true);
  }

  let filtered = [...items];

  if (selectedSection === "RECENT") filtered = filtered.filter((item) => item._isRecent);
  else if (selectedSection === "NEW") filtered = filtered.filter((item) => item._isFreshNew);
  else if (selectedSection !== "ALL") filtered = filtered.filter((item) => item._section === selectedSection);

  filtered = applySearch(filtered);
  return sortItems(filtered, sortMode);
}

function groupItemsBySection(items, sectionViews = {}) {
  const groups = new Map();

  items.forEach((item) => {
    const sectionName = item._section || "Shop";

    if (!groups.has(sectionName)) {
      groups.set(sectionName, {
        id: sectionName,
        title: sectionName,
        items: [],
      });
    }

    groups.get(sectionName).items.push(item);
  });

  const ranked = [...groups.values()].map((group) => ({
    ...group,
    priority: Math.max(...group.items.map((item) => {
      const isBundleOrSkin = item._typeKey === "bundle" || item._typeKey === "outfit";
      if (isBundleOrSkin && item._isFreshNew) return 4;
      if (isBundleOrSkin && item._isRecent) return 3;
      if (item._isFreshNew) return 2;
      return item._isRecent ? 1 : 0;
    })),
    views: Number(sectionViews[group.id]) || 0,
    featured: /a\s*[$s]ap\s+rocky/i.test(group.title) ? 1 : 0,
  }));
  return ranked.sort((a, b) =>
    b.priority - a.priority || b.views - a.views || b.featured - a.featured ||
    a.title.localeCompare(b.title, "es", { sensitivity: "base" })
  );
}

function getIncludedItems(item) {
  const raw = Array.isArray(item.includedItems)
    ? item.includedItems
    : Array.isArray(item.grants)
      ? item.grants
      : [];

  const seen = new Set();

  return raw.filter((entry) => {
    const key = [
      getDisplayName(entry),
      getTypeKey(entry.typeEnglish || entry.typeLocalized || entry.type, entry),
      normalizeUrl(entry.image || entry?.images?.icon || entry?.images?.featured),
    ].join("|");

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function collectImageUrls(value, path = "", depth = 0) {
  if (depth > 4 || value == null) return [];
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) {
    return value.flatMap((entry) => collectImageUrls(entry, path, depth + 1));
  }
  if (typeof value !== "object") return [];

  return Object.entries(value).flatMap(([key, entry]) => {
    const nextPath = `${path}.${key}`.toLowerCase();
    if (/(^|\.)(lego|bean|beans|juno)(\.|$)/.test(nextPath)) return [];
    return collectImageUrls(entry, nextPath, depth + 1);
  });
}

function getImageSortRank(image, preferredImage) {
  const value = normalizeUrl(image).toLowerCase();
  if (!value) return 999;
  if (preferredImage && value === preferredImage.toLowerCase()) return 0;
  if (/\/newdisplayassets\/.*\/renderimage_0\./i.test(value)) return 10;
  if (value.includes("/newdisplayassets/")) return 20;
  if (/\/featured\.(png|webp|jpe?g)(?:\?|$)/i.test(value)) return 30;
  if (/\/icon\.(png|webp|jpe?g)(?:\?|$)/i.test(value)) return 40;
  if (/\/smallicon\.(png|webp|jpe?g)(?:\?|$)/i.test(value)) return 50;
  return 60;
}

function sortOfferImages(images, preferredImage) {
  return dedupeStrings(images)
    .map((image, index) => ({ image, index }))
    .sort((a, b) => {
      const rank =
        getImageSortRank(a.image, preferredImage) -
        getImageSortRank(b.image, preferredImage);
      return rank || a.index - b.index;
    })
    .map((entry) => entry.image);
}

function getGalleryImages(item) {
  const variantImages = Array.isArray(item.variants)
    ? item.variants.flatMap((variant) =>
        [
          variant?.image,
          variant?.icon,
          variant?.featured,
          variant?.preview,
          ...(Array.isArray(variant?.images) ? variant.images : []),
          ...(Array.isArray(variant?.options)
            ? variant.options.flatMap((option) => [
                option?.image,
                option?.icon,
                option?.featured,
                option?.preview,
                ...(Array.isArray(option?.images) ? option.images : []),
              ])
            : []),
        ].filter(Boolean)
      )
    : [];

  const styleImages = Array.isArray(item.styles)
    ? item.styles.flatMap((style) => [
        style?.image,
        style?.icon,
        style?.featured,
        style?.preview,
        ...(Array.isArray(style?.images) ? style.images : []),
      ])
    : [];

  const displayAssets = Array.isArray(item.displayAssets)
    ? item.displayAssets
        .filter((asset) => {
          const tag = String(asset?.productTag || "").toLowerCase();
          return tag !== "product.juno" && tag !== "product.bean";
        })
        .flatMap((asset) => [
          asset?.url,
          asset?.image,
          asset?.featured,
          asset?.icon,
          asset?.full_background,
          asset?.background,
        ])
    : [];

  const renderImages = [
    ...(Array.isArray(item?.newDisplayAsset?.renderImages)
      ? item.newDisplayAsset.renderImages
      : []),
    ...(Array.isArray(item?.renderImages) ? item.renderImages : []),
  ];
  const battleRoyaleRenders = renderImages
    .filter((render) => render?.productTag === "Product.BR")
    .flatMap((render) => [render?.image, render?.url]);
  const safeOtherRenders = renderImages
    .filter((render) => {
      const tag = String(render?.productTag || "").toLowerCase();
      return tag !== "product.juno" && tag !== "product.bean";
    })
    .flatMap((render) => [render?.image, render?.url]);

  const imageObjectValues = collectImageUrls(item?.images);

  const includeImages = getIncludedItems(item).map(
    (entry) => entry.image || entry?.images?.featured || entry?.images?.icon || entry?.images?.smallIcon
  );

  const preferredImage = normalizeUrl(
    item.primaryImage || item?.bundle?.image || item.offerImage
  );
  const offerType = getTypeKey(
    item.typeEnglish || item.typeLocalized || item.type,
    item
  );
  const candidates = [
    preferredImage,
    item?.bundle?.image,
    ...battleRoyaleRenders,
    item.image,
    item.featuredImage,
    item.icon,
    item.smallIcon,
    item.background,
    ...(Array.isArray(item.galleryImages) ? item.galleryImages : []),
    ...(Array.isArray(item.images) ? item.images : []),
    ...imageObjectValues,
    ...safeOtherRenders,
    ...displayAssets,
    ...styleImages,
    ...variantImages,
    ...includeImages,
  ].filter((image) => {
    if (offerType !== "outfit") return true;
    return !/\/cosmetics\/(?:lego|beans?)\//i.test(normalizeUrl(image));
  });

  return sortOfferImages(candidates, preferredImage);
}

function getRawShopItems(payload) {
  return Array.isArray(payload?.items)
    ? payload.items
    : Array.isArray(payload?.shop)
      ? payload.shop
      : Array.isArray(payload?.data?.items)
        ? payload.data.items
        : Array.isArray(payload?.data?.shop)
          ? payload.data.shop
          : Array.isArray(payload)
            ? payload
            : [];
}

function normalizeShopItems(payload) {
  const rawItems = getRawShopItems(payload);

  return rawItems.map((item, index) => {
    const id = item?.id || item?.mainId || item?.offerId || `${getDisplayName(item)}-${index}`;
    const includedItems = Array.isArray(item.includedItems)
      ? item.includedItems
      : Array.isArray(item.grants)
        ? item.grants
        : [];

    const hasBundleFlag = typeof item?.isBundle === "boolean";
    const isBundle = hasBundleFlag
      ? item.isBundle
      : getRawTypeKey(item.typeEnglish || item.typeLocalized || item.type, item) === "bundle";

    const normalized = {
      ...item,
      id,
      includedItems,
      isBundle,
      price: getCurrentPrice(item),
      _section: getDisplaySection(item),
      _typeKey: getTypeKey(item.typeEnglish || item.typeLocalized || item.type, {
        ...item,
        includedItems,
        isBundle,
      }),
      _latestInDate: getLatestInDate(item),
      _latestOutDate: getLatestOutDate(item),
      _isRecent: isRecentItem(item),
      _isFreshNew: isFreshNewItem(item),
      _isLeavingSoon: isLeavingSoon(getLatestOutDate(item)),
      _galleryImages: getGalleryImages(item),
    };

    normalized._typeKey = getTypeKey(item.typeEnglish || item.typeLocalized || item.type, normalized);
    return normalized;
  });
}

function saveShopSnapshot(items) {
  try {
    const compact = items.map((item) => ({
      id: item.id,
      nameEnglish: item.nameEnglish,
      nameLocalized: item.nameLocalized,
      image: item.image,
      galleryImages: item.galleryImages,
      primaryImage: item.primaryImage,
      price: item.price,
      sectionEnglish: item.sectionEnglish,
      sectionLocalized: item.sectionLocalized,
      typeEnglish: item.typeEnglish,
      typeLocalized: item.typeLocalized,
      devName: item.devName,
      outDate: item.outDate,
      inDate: item.inDate,
      addedDate: item.addedDate,
      descriptionEnglish: item.descriptionEnglish,
      descriptionLocalized: item.descriptionLocalized,
      rarityEnglish: item.rarityEnglish,
      rarityLocalized: item.rarityLocalized,
      setTextEnglish: item.setTextEnglish,
      setTextLocalized: item.setTextLocalized,
      includedItems: item.includedItems,
      shopHistory: item.shopHistory,
      isFirstAppearance: item.isFirstAppearance,
      isBundle: item.isBundle,
    }));
    window.localStorage.setItem(SHOP_SNAPSHOT_KEY, JSON.stringify(compact));
  } catch {}
}

function readSnapshot() {
  try {
    const raw = window.localStorage.getItem(SHOP_SNAPSHOT_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? normalizeShopItems({ items: parsed }) : [];
  } catch {
    return [];
  }
}

function readRecentlyGone() {
  try {
    const raw = window.localStorage.getItem(SHOP_RECENT_GONE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? normalizeShopItems({ items: parsed }) : [];
  } catch {
    return [];
  }
}

function saveRecentlyGone(items) {
  try {
    window.localStorage.setItem(SHOP_RECENT_GONE_KEY, JSON.stringify(items));
  } catch {}
}

function mergeRecentlyGone(previousGone, goneNow) {
  const merged = [...goneNow, ...previousGone];
  const seen = new Set();
  const result = [];
  for (const item of merged) {
    if (!item?.id || seen.has(item.id)) continue;
    seen.add(item.id);
    result.push(item);
  }
  return result.slice(0, 48);
}

function hashString(value) {
  const text = String(value || "");
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function hexToRgb(hex) {
  const safeHex = String(hex || "").replace("#", "");
  if (safeHex.length !== 6) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(safeHex.slice(0, 2), 16),
    g: parseInt(safeHex.slice(2, 4), 16),
    b: parseInt(safeHex.slice(4, 6), 16),
  };
}

function withAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getCardTheme(key) {
  return CARD_THEME_PALETTE[hashString(key) % CARD_THEME_PALETTE.length];
}


function VCoinIcon({ className = "" }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border border-white/80 bg-white shadow-[0_2px_6px_rgba(0,0,0,0.38)] ${className}`}
      aria-hidden="true"
    >
      <span className="translate-y-[0.5px] text-[0.72em] font-black italic leading-none text-[#30283a]">
        V
      </span>
    </span>
  );
}

const PRODUCT_IMAGE_BOUNDS_CACHE = new Map();

function getApiImageSrc(rawUrl) {
  const value = normalizeUrl(rawUrl);

  if (!value) return SUMMARY_IMAGE_PLACEHOLDER;
  if (
    value.startsWith("/") ||
    value.startsWith("data:") ||
    value.startsWith("blob:")
  ) {
    return value;
  }

  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "https:") return SUMMARY_IMAGE_PLACEHOLDER;
    return `/api/gkg-image?url=${encodeURIComponent(parsed.toString())}`;
  } catch {
    return SUMMARY_IMAGE_PLACEHOLDER;
  }
}

function getBundlePresentation(item, language) {
  const name = getDisplayName(item);
  if (item._typeKey !== "bundle") return { title: name, caption: "", heroes: [], extras: [] };
  const officialName = asText(item.bundle?.name).trim() || name;
  const title = /\b(?:lote|bundle|paquete|pack)\b/i.test(officialName)
    ? officialName : language === "en" ? `${officialName} Bundle` : `Lote ${officialName}`;
  const included = getIncludedItems(item);
  const count = included.length;
  const caption = count ? (language === "en"
    ? `Includes ${count} ${count === 1 ? "item" : "items"}`
    : `Incluye ${count} ${count === 1 ? "objeto" : "objetos"}`) : "";
  if (item.hasBundleArtwork === true || normalizeUrl(item.bundle?.image)) return { title, caption, heroes: [], extras: [] };
  const entries = included.map((entry) => ({
    image: normalizeUrl(entry.image || entry.galleryImages?.[0] || entry.images?.featured || entry.images?.icon),
    outfit: getRawTypeKey(entry.typeEnglish || entry.typeLocalized || entry.type, entry) === "outfit",
  })).filter(({ image }) => image);
  const images = dedupeStrings([...entries.filter(({ outfit }) => outfit), ...entries].map(({ image }) => image));
  const heroCount = Math.min(2, new Set(entries.filter(({ outfit }) => outfit).map(({ image }) => image)).size) || 1;
  return { title, caption, heroes: images.slice(0, heroCount), extras: images.slice(heroCount, heroCount + 4) };
}

async function buildShopGroupPng(group, language) {
  const count = group.items.length;
  const columns = Math.min(Math.max(1, count), count >= 8 ? 4 : 3);
  const cardScale = 1.6;
  const width = 32 + columns * 308 * cardScale + (columns - 1) * 16;
  const rows = Math.ceil(group.items.length / columns);
  const height = 116 + rows * 328 * cardScale + Math.max(0, rows - 1) * 16;
  const scale = Math.min(1.5, 12000 / height, Math.sqrt(16000000 / (width * height)));
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(width * scale);
  canvas.height = Math.ceil(height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.scale(scale, scale);
  const backdrop = ctx.createLinearGradient(0, 0, width, height);
  backdrop.addColorStop(0, "#143e2e");
  backdrop.addColorStop(1, "#050f09");
  ctx.fillStyle = backdrop;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#67ff9a";
  ctx.font = "bold 20px Arial";
  ctx.fillText("GANKER GAMES  /  TIENDA FORTNITE", 22, 36);
  ctx.fillStyle = "#fff";
  ctx.font = "900 34px Arial";
  ctx.fillText(group.title.toUpperCase(), 22, 80, width - 44);

  function loadImage(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      const timer = window.setTimeout(() => resolve(null), 9000);
      img.onload = () => { window.clearTimeout(timer); resolve(img); };
      img.onerror = () => { window.clearTimeout(timer); resolve(null); };
      img.src = getApiImageSrc(url);
    });
  }

  // Some API artwork contains a wide transparent border. Fit its visible
  // bounds, but draw from the original image to preserve export quality.
  const probe = document.createElement("canvas");
  const probeCtx = probe.getContext("2d", { willReadFrequently: true });
  function drawArtwork(image, x, y, width, height) {
    const iw = image.naturalWidth, ih = image.naturalHeight;
    if (!iw || !ih) return;
    let sx = 0, sy = 0, sw = iw, sh = ih;
    if (probeCtx) {
      try {
        const ratio = Math.min(1, 256 / Math.max(iw, ih));
        const pw = probe.width = Math.max(1, Math.round(iw * ratio));
        const ph = probe.height = Math.max(1, Math.round(ih * ratio));
        probeCtx.drawImage(image, 0, 0, pw, ph);
        const pixels = probeCtx.getImageData(0, 0, pw, ph).data;
        let left = pw, top = ph, right = -1, bottom = -1;
        for (let py = 0; py < ph; py++) {
          for (let px = 0; px < pw; px++) {
            if (pixels[(py * pw + px) * 4 + 3] === 0) continue;
            left = Math.min(left, px); right = Math.max(right, px);
            top = Math.min(top, py); bottom = Math.max(bottom, py);
          }
        }
        if (right >= left) {
          sx = Math.max(0, left - 2) * iw / pw;
          sy = Math.max(0, top - 2) * ih / ph;
          sw = Math.min(pw, right + 3) * iw / pw - sx;
          sh = Math.min(ph, bottom + 3) * ih / ph - sy;
        }
      } catch {
        // Still export the original artwork if pixel inspection is unavailable.
      }
    }
    const fit = Math.min(width / sw, height / sh);
    const w = sw * fit, h = sh * fit;
    ctx.drawImage(image, sx, sy, sw, sh, x + (width - w) / 2, y + (height - h) / 2, w, h);
  }

  for (let start = 0; start < count; start += 8) {
    await Promise.all(group.items.slice(start, start + 8).map(async (item, offset) => {
      const index = start + offset;
      const bundle = getBundlePresentation(item, language);
      const [heroes, extras] = await Promise.all([bundle.heroes, bundle.extras].map(async (urls) =>
        (await Promise.all(urls.map(loadImage))).filter(Boolean)));
      const candidates = heroes.length ? [] : (item._galleryImages || []).slice(0, 2);
      let img = null;
      for (const url of candidates) {
        img = await loadImage(url);
        if (img) break;
      }
      ctx.save();
      ctx.translate(16 + index % columns * (308 * cardScale + 16),
        100 + Math.floor(index / columns) * (328 * cardScale + 16));
      ctx.scale(cardScale, cardScale);
      const x = 0;
      const y = 0;
      const gradient = ctx.createLinearGradient(x, y, x, y + 328);
      gradient.addColorStop(0, "#138956");
      gradient.addColorStop(1, "#43ad87");
      ctx.beginPath();
      ctx.roundRect(x, y, 308, 328, 19);
      ctx.clip();
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, 308, 328);
      if (img) drawArtwork(img, x + 6, y + 6, 296, bundle.caption ? 191 : 238);
      const fade = ctx.createLinearGradient(x, y + 196, x, y + 328);
      fade.addColorStop(0, "rgba(4,24,17,0)");
      fade.addColorStop(1, "#061a12");
      ctx.fillStyle = fade;
      ctx.fillRect(x, y + 196, 308, 132);
      heroes.forEach((hero, i) => {
        const cell = 292 / heroes.length;
        drawArtwork(hero, x + 8 + i * cell, y + 4, cell, extras.length ? 150 : 193);
      });
      if (heroes.length && extras.length) {
        ctx.fillStyle = "#092d20";
        ctx.beginPath();
        ctx.roundRect(x + 14, y + 157, 280, 43, 9);
        ctx.fill();
        extras.forEach((extra, i) => {
          const cell = 272 / extras.length;
          drawArtwork(extra, x + 18 + i * cell, y + 160, cell, 37);
        });
      }
      if (item._isFreshNew) {
        ctx.fillStyle = "#f1ff36";
        ctx.beginPath();
        ctx.roundRect(x + 14, y + 211, 94, 22, 6);
        ctx.fill();
        ctx.fillStyle = "#111";
        ctx.font = "italic 900 14px Arial";
        ctx.fillText(language === "en" ? "NEW!" : "¡NUEVO!", x + 22, y + 227);
      }
      ctx.fillStyle = "#fff";
      ctx.font = "900 21px Arial";
      ctx.fillText(bundle.title, x + 14, y + (bundle.caption ? 251 : 255), 280);
      if (bundle.caption) {
        ctx.fillStyle = "#d4e7da";
        ctx.font = "bold 13px Arial";
        ctx.fillText(bundle.caption, x + 14, y + 268, 280);
      }
      ctx.fillStyle = "#67ff9a";
      ctx.font = "900 36px Arial";
      const price = Number(item.price);
      ctx.fillText(price > 0 ? localPrice(language, price) : "—", x + 14, y + (bundle.caption ? 300 : 288), 280);
      ctx.fillStyle = "#d4e7da";
      ctx.font = "bold 17px Arial";
      ctx.fillText(price > 0 ? formatVbucks(price) + (language === "en" ? " V-Bucks" : " paVos") : "—", x + 14, y + (bundle.caption ? 320 : 314), 280);
      ctx.restore();
    }));
  }

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("PNG unavailable");
  return blob;
}

function RotatingImage({
  images,
  alt,
  className,
  fitPadding = 0.04,
  preferUncropped = false,
}) {
  const safeImages = useMemo(() => {
    const normalizedImages = Array.isArray(images)
      ? dedupeStrings(images.map(normalizeUrl).filter(Boolean))
      : [];

    return normalizedImages.length > 0
      ? normalizedImages
      : [SUMMARY_IMAGE_PLACEHOLDER];
  }, [images]);
  const firstImage = safeImages[0];
  const imageListKey = safeImages.join("\n");
  const featuredImage = safeImages.find(
    (image, index) => index > 0 && /\/featured\.(png|webp|jpe?g)(?:\?|$)/i.test(image)
  );
  const frameRef = useRef(null);
  const imageRef = useRef(null);
  const imageSettledRef = useRef(false);
  const imageFailureCountRef = useRef(0);
  const [activeImage, setActiveImage] = useState(firstImage);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageUnavailable, setImageUnavailable] = useState(false);
  const [visibleBounds, setVisibleBounds] = useState(null);
  const [fittedStyle, setFittedStyle] = useState(null);
  const [imageLoadVersion, setImageLoadVersion] = useState(0);

  useEffect(() => {
    imageSettledRef.current = false;
    imageFailureCountRef.current = 0;
    setActiveImage(firstImage);
    setImageUnavailable(false);
  }, [firstImage, imageListKey]);

  useEffect(() => {
    const frame = frameRef.current;

    if (!frame || typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          return;
        }

        // Si una imagen aun no termina y la tarjeta vuelve a quedar lejos,
        // se desmonta para liberar ancho de banda a favor de lo que se ve.
        if (!imageSettledRef.current) setShouldLoad(false);
      },
      {
        // Precarga solo las filas cercanas. Un margen muy grande inicia
        // decenas de PNG de 1024/2048 px y retrasa las tarjetas visibles.
        rootMargin: "600px 0px",
        threshold: 0.01,
      }
    );

    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    imageSettledRef.current = false;
    setVisibleBounds(PRODUCT_IMAGE_BOUNDS_CACHE.get(activeImage) || null);
    setFittedStyle(null);
    setImageLoadVersion(0);
    setIsLoaded(false);
    setImageUnavailable(false);
  }, [activeImage]);

  const advanceToNextImage = useCallback(() => {
    imageFailureCountRef.current += 1;
    const activeIndex = safeImages.indexOf(activeImage);
    const nextImage = safeImages.find(
      (image, index) => index > activeIndex && image !== activeImage
    );

    if (
      nextImage &&
      imageFailureCountRef.current < PRODUCT_IMAGE_MAX_FAILURES
    ) {
      imageSettledRef.current = false;
      setIsLoaded(false);
      setImageUnavailable(false);
      setActiveImage(nextImage);
      return;
    }

    // El respaldo se dibuja con HTML y no necesita red, por lo que tampoco
    // puede quedarse cargando si todas las URL de la API fallan.
    setVisibleBounds(null);
    setFittedStyle(null);
    imageSettledRef.current = true;
    setImageUnavailable(true);
    setIsLoaded(true);
  }, [activeImage, safeImages]);

  useEffect(() => {
    if (!shouldLoad || isLoaded || imageUnavailable) return undefined;

    // Algunos CDN dejan la solicitud abierta sin disparar onLoad ni onError.
    // Este limite evita que una tarjeta conserve el spinner indefinidamente.
    const timeoutId = window.setTimeout(() => {
      advanceToNextImage();
    }, PRODUCT_IMAGE_LOAD_TIMEOUT_MS);

    return () => window.clearTimeout(timeoutId);
  }, [advanceToNextImage, imageUnavailable, isLoaded, shouldLoad]);

  useEffect(() => {
    const frame = frameRef.current;
    const image = imageRef.current;
    if (!frame || !image || !visibleBounds) return undefined;

    const updateFit = () => {
      const frameWidth = frame.clientWidth;
      const frameHeight = frame.clientHeight;
      const naturalWidth = image.naturalWidth;
      const naturalHeight = image.naturalHeight;

      if (!frameWidth || !frameHeight || !naturalWidth || !naturalHeight) return;

      const padding = Math.max(0, Math.min(Number(fitPadding) || 0, 0.2));
      const availableWidth = frameWidth * (1 - padding * 2);
      const availableHeight = frameHeight * (1 - padding * 2);
      const scale = Math.min(
        availableWidth / visibleBounds.width,
        availableHeight / visibleBounds.height
      );

      const visibleLeft = (frameWidth - visibleBounds.width * scale) / 2;
      const visibleTop = (frameHeight - visibleBounds.height * scale) / 2;

      setFittedStyle({
        width: `${naturalWidth * scale}px`,
        height: `${naturalHeight * scale}px`,
        left: `${visibleLeft - visibleBounds.x * scale}px`,
        top: `${visibleTop - visibleBounds.y * scale}px`,
      });
    };

    updateFit();

    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", updateFit);
      return () => window.removeEventListener("resize", updateFit);
    }

    const observer = new ResizeObserver(updateFit);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [fitPadding, imageLoadVersion, visibleBounds]);

  function detectVisibleBounds(image) {
    const cachedBounds = PRODUCT_IMAGE_BOUNDS_CACHE.get(activeImage);
    if (cachedBounds) {
      if (
        preferUncropped &&
        activeImage === firstImage &&
        featuredImage &&
        cachedBounds.touchesBottom
      ) {
        setActiveImage(featuredImage);
        return;
      }

      setVisibleBounds(cachedBounds);
      return;
    }

    const naturalWidth = image.naturalWidth || 1;
    const naturalHeight = image.naturalHeight || 1;
    const maxScanSize = 192;
    const ratio = Math.min(1, maxScanSize / Math.max(naturalWidth, naturalHeight));
    const scanWidth = Math.max(1, Math.round(naturalWidth * ratio));
    const scanHeight = Math.max(1, Math.round(naturalHeight * ratio));

    try {
      const canvas = document.createElement("canvas");
      canvas.width = scanWidth;
      canvas.height = scanHeight;

      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("Canvas no disponible");

      context.clearRect(0, 0, scanWidth, scanHeight);
      context.drawImage(image, 0, 0, scanWidth, scanHeight);

      const pixels = context.getImageData(0, 0, scanWidth, scanHeight).data;
      let minX = scanWidth;
      let minY = scanHeight;
      let maxX = -1;
      let maxY = -1;

      for (let y = 0; y < scanHeight; y += 1) {
        for (let x = 0; x < scanWidth; x += 1) {
          if (pixels[(y * scanWidth + x) * 4 + 3] <= 16) continue;
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }

      if (maxX < minX || maxY < minY) throw new Error("Imagen transparente");

      const contentWidth = maxX - minX + 1;
      const contentHeight = maxY - minY + 1;
      const marginX = contentWidth * 0.02;
      const marginY = contentHeight * 0.02;
      const scaleX = naturalWidth / scanWidth;
      const scaleY = naturalHeight / scanHeight;
      const left = Math.max(0, minX - marginX);
      const top = Math.max(0, minY - marginY);
      const right = Math.min(scanWidth, maxX + 1 + marginX);
      const bottom = Math.min(scanHeight, maxY + 1 + marginY);
      const bounds = {
        x: left * scaleX,
        y: top * scaleY,
        width: Math.max(1, (right - left) * scaleX),
        height: Math.max(1, (bottom - top) * scaleY),
        touchesBottom: maxY >= scanHeight - 2,
      };

      PRODUCT_IMAGE_BOUNDS_CACHE.set(activeImage, bounds);

      if (
        preferUncropped &&
        activeImage === firstImage &&
        featuredImage &&
        bounds.touchesBottom
      ) {
        setActiveImage(featuredImage);
        return;
      }

      setVisibleBounds(bounds);
    } catch {
      const fullImageBounds = {
        x: 0,
        y: 0,
        width: naturalWidth,
        height: naturalHeight,
        touchesBottom: false,
      };

      PRODUCT_IMAGE_BOUNDS_CACHE.set(activeImage, fullImageBounds);
      setVisibleBounds(fullImageBounds);
    }
  }

  return (
    <span ref={frameRef} className={`relative block overflow-hidden ${className}`}>
      {!isLoaded && !imageUnavailable && (
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center bg-black/10"
        >
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#67ff9a]" />
        </span>
      )}

      {imageUnavailable && (
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="rounded-xl border-2 border-[#15d863] bg-[#06140d]/85 px-4 py-3 text-xl font-black tracking-wider text-[#67ff9a] shadow-lg">
            GKG
          </span>
        </span>
      )}

      {shouldLoad && !imageUnavailable && (
        <img
          key={activeImage}
          ref={imageRef}
          src={getApiImageSrc(activeImage)}
          alt={alt}
          className={`pointer-events-none select-none transition-opacity duration-300 ${
            isLoaded ? "opacity-100" : "opacity-0"
          } ${
            fittedStyle
              ? "absolute max-w-none"
              : "h-full w-full object-contain"
          }`}
          style={fittedStyle || undefined}
          loading="eager"
          decoding="async"
          fetchPriority="auto"
          draggable="false"
          onLoad={(event) => {
            imageSettledRef.current = true;
            setImageUnavailable(false);
            setIsLoaded(true);
            detectVisibleBounds(event.currentTarget);
            setImageLoadVersion((current) => current + 1);
          }}
          onError={advanceToNextImage}
        />
      )}
    </span>
  );
}

function FilterModal({ open, sections, labels, selectedSection, onSelect, onClose }) {
  const [shouldRender, setShouldRender] = useState(open);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    let timeoutId;

    if (open) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      timeoutId = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 220);
    }

    return () => clearTimeout(timeoutId);
  }, [open, shouldRender]);

  if (!shouldRender) return null;

  const options = [
    { id: "RECENT", label: labels.recent },
    { id: "NEW", label: labels.newOnly },
    { id: "LEFT", label: labels.recentlyGone },
    ...sections.map((name) => ({ id: name, label: name })),
  ];

  const palette = [
    "border-[#15d863]/50 bg-[#15d863]/10 text-[#9cffbe]",
    "border-cyan-500/50 bg-cyan-500/10 text-cyan-300",
    "border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-300",
    "border-yellow-400/50 bg-yellow-400/10 text-yellow-200",
    "border-orange-500/50 bg-orange-500/10 text-orange-300",
    "border-violet-500/50 bg-violet-500/10 text-violet-300",
  ];

  function getFilterOptionClass(option, index, active) {
    if (option.id === "RECENT") {
      return active
        ? "border-cyan-300 bg-cyan-400 text-[#001216] shadow-[0_0_20px_rgba(34,211,238,0.35)]"
        : "border-cyan-500/55 bg-cyan-500/12 text-cyan-200";
    }

    if (option.id === "NEW") {
      return active
        ? "border-yellow-200 bg-yellow-300 text-[#1b1600] shadow-[0_0_20px_rgba(250,204,21,0.35)]"
        : "border-yellow-400/60 bg-yellow-400/12 text-yellow-200";
    }

    if (option.id === "LEFT") {
      return active
        ? "border-red-300 bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.35)]"
        : "border-red-500/60 bg-red-500/12 text-red-200";
    }

    return active ? "border-[#15d863] bg-[#15d863] text-[#06110a]" : palette[index % palette.length];
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-[2px] transition-opacity duration-200 ${isClosing ? "opacity-0" : "opacity-100"}`}
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-4xl rounded-[30px] border border-[#13412f] bg-[rgba(4,18,13,0.88)] p-5 shadow-[0_0_60px_rgba(0,255,120,0.08)] backdrop-blur-xl transition-all duration-200 sm:p-6 ${
          isClosing ? "translate-y-5 scale-[0.97] opacity-0" : "translate-y-0 scale-100 opacity-100"
        }`}
      >
        <h3 className="text-center text-3xl font-black italic text-white sm:text-5xl">
          {labels.filterTitle}
        </h3>

        <div className="mt-6 grid max-h-[52vh] grid-cols-2 gap-3 overflow-y-auto pr-1 xl:grid-cols-3">
          {options.map((option, index) => {
            const active = selectedSection === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onSelect(option.id);
                  onClose();
                }}
                className={`flex min-h-[84px] items-center justify-center rounded-2xl border px-3 py-4 text-center text-sm font-black uppercase leading-tight tracking-wide transition ${getFilterOptionClass(option, index, active)}`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              onSelect("ALL");
              onClose();
            }}
            className="rounded-2xl bg-[#15d863] px-4 py-4 text-sm font-black uppercase text-[#06110a]"
          >
            {labels.showAllSections}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[#1a4e3a] bg-[#08140f]/85 px-4 py-4 text-sm font-black uppercase text-white"
          >
            {labels.close}
          </button>
        </div>
      </div>
    </div>
  );
}

function SortModal({ open, labels, sortMode, onSelect, onClose }) {
  const [shouldRender, setShouldRender] = useState(open);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    let timeoutId;

    if (open) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      timeoutId = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 220);
    }

    return () => clearTimeout(timeoutId);
  }, [open, shouldRender]);

  if (!shouldRender) return null;

  const options = [
    { id: "FEATURED", label: labels.sortFeatured },
    { id: "RECENT", label: labels.sortRecent },
    { id: "PRICE_HIGH", label: labels.sortHighPrice },
    { id: "PRICE_LOW", label: labels.sortLowPrice },
    { id: "LEAVING_SOON", label: labels.sortLeavingSoon },
    { id: "AZ", label: labels.sortAZ },
    { id: "ZA", label: labels.sortZA },
  ];

  return (
    <div className="fixed inset-0 z-[121] flex items-center justify-center p-4">
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-[2px] transition-opacity duration-200 ${isClosing ? "opacity-0" : "opacity-100"}`}
        onClick={onClose}
      />
      <div
        className={`relative w-full max-w-xl rounded-[30px] border border-[#13412f] bg-[rgba(4,18,13,0.88)] p-5 shadow-[0_0_60px_rgba(0,255,120,0.08)] backdrop-blur-xl transition-all duration-200 sm:p-6 ${
          isClosing ? "translate-y-5 scale-[0.97] opacity-0" : "translate-y-0 scale-100 opacity-100"
        }`}
      >
        <h3 className="text-center text-3xl font-black italic text-white sm:text-4xl">
          {labels.sortTitle}
        </h3>

        <div className="mt-6 grid gap-3">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => {
                onSelect(option.id);
                onClose();
              }}
              className={`rounded-2xl border px-4 py-4 text-center text-sm font-black uppercase tracking-wide transition ${
                sortMode === option.id
                  ? "border-[#15d863] bg-[#15d863] text-[#06110a]"
                  : "border-[#1a4e3a] bg-[#08140f]/85 text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[#1a4e3a] bg-[#08140f]/85 px-4 py-4 text-sm font-black uppercase text-white"
          >
            {labels.close}
          </button>

          <button
            type="button"
            onClick={() => {
              onSelect("NONE");
              onClose();
            }}
            className="rounded-2xl border border-[#8cff9f]/60 bg-[#15d863]/15 px-4 py-4 text-sm font-black uppercase text-[#67ff9a] shadow-[0_0_18px_rgba(21,216,99,0.10)]"
          >
            {labels.resetSort}
          </button>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ open, labels, language, cart, allItems, onClose, onUpdateQty, onRemove, onClear }) {
  const [shouldRender, setShouldRender] = useState(open);
  const [isClosing, setIsClosing] = useState(false);
  const [recipientUsername, setRecipientUsername] = useState("");
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [primaryItemIds, setPrimaryItemIds] = useState([]);
  const [removedDeliveryIds, setRemovedDeliveryIds] = useState({});
  const [splitUsers, setSplitUsers] = useState([
    { id: "secondary-1", name: "", itemIds: [] },
  ]);
  const [giftModalOpen, setGiftModalOpen] = useState(false);
  const [giftModalVisible, setGiftModalVisible] = useState(false);
  const summaryImageRef = useRef(null);
  const principalUsernameInputRef = useRef(null);
  const secondaryUsernameInputRef = useRef(null);
  const [summaryDateLabel, setSummaryDateLabel] = useState("");
  const [summaryDownloading, setSummaryDownloading] = useState(false);
  const [principalUsernameError, setPrincipalUsernameError] = useState("");
  const [secondaryUsernameError, setSecondaryUsernameError] = useState("");
  const [principalUsernameShake, setPrincipalUsernameShake] = useState(false);
  const [secondaryUsernameShake, setSecondaryUsernameShake] = useState(false);

  const details = useMemo(
    () =>
      cart
        .map((cartItem) => {
          const item = allItems.find((entry) => entry.id === cartItem.id);
          if (!item) return null;
          return { ...item, qty: cartItem.qty };
        })
        .filter(Boolean),
    [cart, allItems]
  );

  const deliveryUnits = useMemo(() => details.flatMap((item) =>
    Array.from({ length: Number(item.qty) || 0 }, (_, index) => ({
      ...item,
      id: JSON.stringify([item.id, index]),
      unitNumber: index + 1,
      originalQuantity: item.qty,
      qty: 1,
    }))
  ), [details]);
  const detailIds = useMemo(() => deliveryUnits.map((item) => item.id), [deliveryUnits]);
  const previousDetailIds = useRef([]);
  const detailKey = detailIds.join("|");

  useEffect(() => {
    let timeoutId;

    if (open) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      timeoutId = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 220);
    }

    return () => clearTimeout(timeoutId);
  }, [open, shouldRender]);

  useEffect(() => {
    const addedIds = detailIds.filter((id) => !previousDetailIds.current.includes(id));
    previousDetailIds.current = detailIds;
    setRemovedDeliveryIds((current) => Object.fromEntries(
      Object.entries(current).map(([id, units]) => [id, units.filter((unit) => detailIds.includes(unit))])
    ));
    if (!detailIds.length) {
      setPrimaryItemIds([]);
      setSplitUsers((current) =>
        current.map((user, index) => ({
          ...user,
          id: user.id || `secondary-${index + 1}`,
          itemIds: [],
        }))
      );
      return;
    }

    setPrimaryItemIds((current) => [...current.filter((id) => detailIds.includes(id)), ...addedIds]);
    setSplitUsers((current) =>
      current.map((user, index) => ({
        ...user,
        id: user.id || `secondary-${index + 1}`,
        itemIds: (user.itemIds || []).filter((id) => detailIds.includes(id)),
      }))
    );
  }, [detailKey]);

  if (!shouldRender) return null;

  const totalVbucks = details.reduce((sum, item) => sum + Number(item.price || 0) * item.qty, 0);
  const totalLocal = details.reduce((sum, item) => sum + Number(item.price || 0) * VB_TO_LOCAL_RATE * item.qty, 0);
  const cleanRecipient = recipientUsername.trim();
  const activeSplitUsers = splitEnabled
    ? splitUsers
        .map((user) => ({
          ...user,
          name: String(user.name || "").trim(),
          itemIds: Array.isArray(user.itemIds) ? user.itemIds : [],
        }))
        .filter((user) => user.name)
    : [];

  const deliveryItems = splitEnabled
    ? [...getItemsForIds(primaryItemIds), ...activeSplitUsers.flatMap((user) => getItemsForIds(user.itemIds))]
    : details;
  const deliveryVbucks = deliveryItems.reduce((sum, item) => sum + Number(item.price || 0) * item.qty, 0);

  function getItemsForIds(ids = []) {
    const selectedIds = Array.isArray(ids) ? ids : [];
    return deliveryUnits.filter((item) => selectedIds.includes(item.id));
  }

  function validateDeliveryUnits() {
    if (!splitEnabled) return true;
    const assigned = [
      ...getItemsForIds(primaryItemIds),
      ...activeSplitUsers.flatMap((user) => getItemsForIds(user.itemIds)),
    ];
    const unique = new Set(assigned.map((item) => item.id));
    if (unique.size === deliveryUnits.length) return true;
    alert(language === "en"
      ? "Assign each cart item to at least one user or remove it."
      : "Asigna cada objeto del carrito a por lo menos un usuario o elimínalo.");
    return false;
  }

  function toggleRecipientItem(recipientId, itemId) {
    if (recipientId === "principal") {
      setPrimaryItemIds((current) =>
        current.includes(itemId)
          ? current.filter((id) => id !== itemId)
          : [...current, itemId]
      );
      return;
    }

    setSplitUsers((current) =>
      current.map((user) =>
        user.id === recipientId
          ? {
              ...user,
              itemIds: user.itemIds?.includes(itemId)
                ? user.itemIds.filter((id) => id !== itemId)
                : [...(user.itemIds || []), itemId],
            }
          : user
      )
    );
  }

  function deleteDeliveryUnit(recipientId, unit) {
    const assignedElsewhere = splitEnabled && (recipientId === "principal"
      ? splitUsers.some((user) => user.itemIds?.includes(unit.id))
      : primaryItemIds.includes(unit.id));
    if (assignedElsewhere) {
      setRemovedDeliveryIds((current) => ({
        ...current,
        [recipientId]: [...(current[recipientId] || []), unit.id],
      }));
      if (recipientId === "principal") {
        setPrimaryItemIds((current) => current.filter((id) => id !== unit.id));
      } else {
        setSplitUsers((current) => current.map((user) => user.id === recipientId
          ? { ...user, itemIds: (user.itemIds || []).filter((id) => id !== unit.id) }
          : user));
      }
      return;
    }
    const [cartId] = JSON.parse(unit.id);
    const lastId = JSON.stringify([cartId, Number(unit.originalQuantity) - 1]);
    const removeAndReindex = (ids) => (ids || [])
      .filter((id) => id !== unit.id)
      .map((id) => id === lastId ? unit.id : id);
    setPrimaryItemIds(removeAndReindex);
    setRemovedDeliveryIds((current) => Object.fromEntries(
      Object.entries(current).map(([id, units]) => [id, removeAndReindex(units)])
    ));
    setSplitUsers((current) => current.map((user) => ({
      ...user, itemIds: removeAndReindex(user.itemIds),
    })));
    onUpdateQty(cartId, Number(unit.originalQuantity) - 1);
  }

  function selectAllForRecipient(recipientId) {
    const availableIds = detailIds.filter((id) => !removedDeliveryIds[recipientId]?.includes(id));
    if (recipientId === "principal") {
      setPrimaryItemIds(availableIds);
      return;
    }

    setSplitUsers((current) =>
      current.map((user) =>
        user.id === recipientId ? { ...user, itemIds: availableIds } : user
      )
    );
  }

  function clearItemsForRecipient(recipientId) {
    if (recipientId === "principal") {
      setPrimaryItemIds([]);
      return;
    }

    setSplitUsers((current) =>
      current.map((user) =>
        user.id === recipientId ? { ...user, itemIds: [] } : user
      )
    );
  }

  function updateSplitUser(index, value) {
    setSplitUsers((current) =>
      current.map((user, currentIndex) =>
        currentIndex === index ? { ...user, name: value } : user
      )
    );

    if (String(value || "").trim()) {
      setSecondaryUsernameError("");
    }
  }

  function resetSecondaryUser() {
    setSplitUsers([{ id: "secondary-1", name: "", itemIds: [] }]);
  }

  function toggleSecondaryUser(enabled) {
    setSplitEnabled(enabled);

    if (enabled) {
      setSplitUsers((current) => {
        const firstUser = current?.[0] || { id: "secondary-1", name: "", itemIds: [] };

        return [
          {
            id: "secondary-1",
            name: firstUser.name || "",
            itemIds: (firstUser.itemIds || []).filter((id) => detailIds.includes(id)),
          },
        ];
      });
    } else {
      resetSecondaryUser();
      setSecondaryUsernameError("");
      setSecondaryUsernameShake(false);
    }
  }

  function shakeUsernameField(target) {
    if (target === "principal") {
      setPrincipalUsernameShake(false);
      window.requestAnimationFrame(() => {
        setPrincipalUsernameShake(true);
        window.setTimeout(() => setPrincipalUsernameShake(false), 460);
      });
      window.setTimeout(() => principalUsernameInputRef.current?.focus?.(), 30);
      return;
    }

    setSecondaryUsernameShake(false);
    window.requestAnimationFrame(() => {
      setSecondaryUsernameShake(true);
      window.setTimeout(() => setSecondaryUsernameShake(false), 460);
    });
    window.setTimeout(() => secondaryUsernameInputRef.current?.focus?.(), 30);
  }

  function showPrincipalUsernameError(message) {
    setPrincipalUsernameError(message);
    shakeUsernameField("principal");
  }

  function showSecondaryUsernameError(message) {
    setSecondaryUsernameError(message);
    shakeUsernameField("secondary");
  }

  function formatMoney(value) {
    return language === "en" ? `$${value.toFixed(2)}` : `MX$${value.toFixed(2)}`;
  }

  function getSummaryImageSrc(rawUrl) {
    const value = String(rawUrl || "").trim();

    if (!value) return "/ganker-logo.png";
    if (value.startsWith("/") || value.startsWith("data:") || value.startsWith("blob:")) {
      return value;
    }

    try {
      const parsed = new URL(value);
      if (parsed.protocol !== "https:") return "/ganker-logo.png";
      return `/api/gkg-image?url=${encodeURIComponent(parsed.toString())}`;
    } catch {
      return "/ganker-logo.png";
    }
  }

  function getSummaryDateLabel() {
    return new Intl.DateTimeFormat(language === "en" ? "en-US" : "es-MX", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(new Date());
  }

  async function waitForSummaryImages(node) {
    const images = Array.from(node?.querySelectorAll?.("img") || []);

    await Promise.all(
      images.map(async (image) => {
        if (!image.complete) {
          await new Promise((resolve) => {
            image.addEventListener("load", resolve, { once: true });
            image.addEventListener("error", resolve, { once: true });
          });
        }

        if (typeof image.decode === "function") {
          try {
            await image.decode();
          } catch {}
        }
      })
    );
  }

  async function downloadSummaryImage() {
    if (details.length === 0) {
      alert(labels.emptyCart);
      return;
    }

    if (!cleanRecipient) {
      showPrincipalUsernameError(
        language === "en"
          ? "Add the Fortnite username before downloading the summary."
          : "Agrega el usuario de Fortnite antes de descargar el resumen."
      );
      return;
    }

    setPrincipalUsernameError("");

    if (splitEnabled) {
      const secondaryUser = activeSplitUsers[0];
      const primaryItems = getItemsForIds(primaryItemIds);
      const secondaryItems = secondaryUser ? getItemsForIds(secondaryUser.itemIds) : [];

      if (!secondaryUser?.name) {
        showSecondaryUsernameError(
          language === "en"
            ? "Add the secondary Fortnite username before downloading the summary."
            : "Agrega el usuario adicional de Fortnite antes de descargar el resumen."
        );
        return;
      }

      setSecondaryUsernameError("");

      if (primaryItems.length === 0) {
        alert(
          language === "en"
            ? "Select at least one item for the main user."
            : "Selecciona al menos un objeto para el usuario principal."
        );
        return;
      }

      if (secondaryItems.length === 0) {
        alert(
          language === "en"
            ? "Select at least one item for the secondary user."
            : "Selecciona al menos un objeto para el usuario adicional."
        );
        return;
      }
    }

    if (!validateDeliveryUnits()) return;
    setSummaryDownloading(true);
    setSummaryDateLabel(getSummaryDateLabel());

    try {
      await new Promise((resolve) =>
        window.requestAnimationFrame(() => window.requestAnimationFrame(resolve))
      );

      const node = summaryImageRef.current;
      if (!node) throw new Error("No se encontró el resumen para exportar.");

      if (document.fonts?.ready) {
        try {
          await document.fonts.ready;
        } catch {}
      }

      await waitForSummaryImages(node);

      const dataUrl = await toPng(node, {
        cacheBust: true,
        includeQueryParams: true,
        pixelRatio: 2,
        backgroundColor: "#020805",
        // El resumen usa Arial, así evitamos que html-to-image intente
        // descargar/embeber fuentes externas de toda la aplicación.
        fontEmbedCSS: "",
        // Si una miniatura externa falla, la exportación continúa.
        imagePlaceholder: SUMMARY_IMAGE_PLACEHOLDER,
      });

      const safeUser = cleanRecipient
        .replace(/[^a-zA-Z0-9_-]+/g, "-")
        .replace(/^-+|-+$/g, "") || "usuario";

      const link = document.createElement("a");
      link.download = `GKG-Resumen-Objetos-${safeUser}-${Date.now()}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : JSON.stringify(error);

      console.error("Error al generar el resumen de objetos:", error, errorMessage);
      alert(
        language === "en"
          ? `The image could not be generated.${errorMessage ? `\n${errorMessage}` : ""}`
          : `No se pudo generar la imagen.${errorMessage ? `\n${errorMessage}` : ""}`
      );
    } finally {
      setSummaryDownloading(false);
    }
  }

  function buildItemLines(items) {
    return items.flatMap((item, index) => {
      const itemVbucks = Number(item.price || 0) * item.qty;
      const itemLocal = itemVbucks * VB_TO_LOCAL_RATE;
      const imageUrl = item._galleryImages?.[0] || item.image || item.galleryImages?.[0] || "";

      return [
        `${index + 1}. ${getDisplayName(item)} x${item.qty}`,
        `   ${itemVbucks} ${labels.vbucks}`,
        `   ${formatMoney(itemLocal)}`,
        imageUrl ? `   Imagen: ${imageUrl}` : null,
      ].filter(Boolean);
    });
  }

  const shareCart = async () => {
    const ids = cart.map((item) => `${item.id}:${item.qty}`).join(",");
    const url = new URL(window.location.href);
    url.searchParams.set("cart", ids);
    await navigator.clipboard.writeText(url.toString());
    alert(labels.copied);
  };

  const confirmSendWhatsApp = () => {
    if (details.length === 0) {
      alert(labels.emptyCart);
      return;
    }

    if (!cleanRecipient) {
      showPrincipalUsernameError(
        language === "en"
          ? "Add the Fortnite username before sending by WhatsApp."
          : "Agrega el usuario de Fortnite antes de enviar por WhatsApp."
      );
      return;
    }

    setPrincipalUsernameError("");

    const primaryItems = splitEnabled ? getItemsForIds(primaryItemIds) : details;

    if (primaryItems.length === 0) {
      alert(
        language === "en"
          ? "Select at least one item for the main user."
          : "Selecciona al menos un objeto para el usuario principal."
      );
      return;
    }

    if (splitEnabled) {
      if (activeSplitUsers.length < 1) {
        showSecondaryUsernameError(
          language === "en"
            ? "Add the secondary Fortnite username before sending by WhatsApp."
            : "Agrega el usuario adicional de Fortnite antes de enviar por WhatsApp."
        );
        return;
      }

      setSecondaryUsernameError("");

      const userWithoutItems = activeSplitUsers.find((user) => getItemsForIds(user.itemIds).length === 0);
      if (userWithoutItems) {
        alert(
          language === "en"
            ? "Select at least one item for the secondary user."
            : "Selecciona al menos un objeto para el usuario adicional."
        );
        return;
      }
    }

    if (!validateDeliveryUnits()) return;
    const lines = [
      "🛒 Cotización de objetos GKG",
      "",
      "🎮 Datos de entrega",
      `Usuario principal a enviar: ${cleanRecipient}`,
      "",
      "📦 Objetos del carrito",
      ...buildItemLines(primaryItems),
    ];

    if (splitEnabled) {
      activeSplitUsers.forEach((user, index) => {
        const selectedItems = getItemsForIds(user.itemIds);
        lines.push(
          "",
          `Usuario adicional a enviar: ${user.name}`,
          ...buildItemLines(selectedItems)
        );
      });
    }

    lines.push(
      "",
      `Total: ${deliveryVbucks} ${labels.vbucks}`,
      `Total MX: ${formatMoney(deliveryVbucks * VB_TO_LOCAL_RATE)}`,
      "",
      "Quiero cotizar/enviar estos objetos por regalo."
    );

    const text = lines.join("\n");
    const url = `https://wa.me/5215666494110?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setGiftModalVisible(false);
    window.setTimeout(() => setGiftModalOpen(false), 240);
  };

  const closeGiftModal = () => {
    setGiftModalVisible(false);
    setPrincipalUsernameError("");
    setSecondaryUsernameError("");
    setPrincipalUsernameShake(false);
    setSecondaryUsernameShake(false);
    window.setTimeout(() => setGiftModalOpen(false), 240);
  };

  const openGiftModal = () => {
    if (details.length === 0) {
      alert(labels.emptyCart);
      return;
    }

    setGiftModalOpen(true);
    setGiftModalVisible(false);
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setGiftModalVisible(true));
    });
  };

  function RecipientItemSelector({ recipientId, selectedIds = [] }) {
    if (details.length === 0) return null;

    return (
      <div className="mt-3 rounded-2xl bg-[#04120d] p-3 shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[10px] font-black uppercase tracking-[0.22em] text-[#63ff9b]">
            Selecciona qué objetos recibirá
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => selectAllForRecipient(recipientId)}
              className="rounded-lg border border-[#67ff9a]/30 px-2 py-1 text-[10px] font-black text-[#67ff9a]"
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => clearItemsForRecipient(recipientId)}
              className="rounded-lg border border-red-500/30 px-2 py-1 text-[10px] font-black text-red-200"
            >
              Ninguno
            </button>
          </div>
        </div>

        <div className="grid gap-2">
          {deliveryUnits.filter((item) => !removedDeliveryIds[recipientId]?.includes(item.id)).map((item) => {
            const checked = selectedIds.includes(item.id);
            const itemTotal = Number(item.price || 0) * item.qty;

            return (
              <div
                key={`${recipientId}-${item.id}`}
                className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 transition ${
                  checked
                    ? "bg-[#15d863]/12 shadow-[0_6px_18px_rgba(0,0,0,0.16)]"
                    : "bg-[#08140f]/80 shadow-[0_5px_16px_rgba(0,0,0,0.12)]"
                }`}
              >
                <input
                  type="checkbox"
                  aria-label={getDisplayName(item)}
                  checked={checked}
                  onChange={() => toggleRecipientItem(recipientId, item.id)}
                  className="h-4 w-4 shrink-0 accent-[#15d863]"
                />

                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#101812] shadow-[0_4px_12px_rgba(0,0,0,0.20)]">
                  <img
                    src={getSummaryImageSrc(item._galleryImages?.[0] || item.image || item.galleryImages?.[0])}
                    alt={getDisplayName(item)}
                    className="h-full w-full object-contain object-center p-1.5"
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.src = "/ganker-logo.png";
                    }}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 text-xs font-black text-white">
                    {getDisplayName(item)}{item.originalQuantity > 1 ? ` · ${item.unitNumber}/${item.originalQuantity}` : ""}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {itemTotal} {labels.vbucks} · {formatMoney(itemTotal * VB_TO_LOCAL_RATE)}
                  </div>
                </div>
                {(
                  <button
                    type="button"
                    onClick={() => deleteDeliveryUnit(recipientId, item)}
                    aria-label={language === "en" ? "Remove copy from cart" : "Eliminar copia del carrito"}
                    title={language === "en" ? "Remove copy from cart" : "Eliminar copia del carrito"}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-red-300 hover:bg-red-500/15"
                  >
                    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7m4-7v7" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }


  function renderSummaryImage() {
    const totalQuantity = deliveryItems.reduce((sum, item) => sum + Number(item.qty || 0), 0);
    const primarySummaryItems = getItemsForIds(primaryItemIds);
    const secondarySummaryUser = activeSplitUsers[0] || null;
    const secondarySummaryItems = secondarySummaryUser
      ? getItemsForIds(secondarySummaryUser.itemIds)
      : [];

    const summaryGroups = splitEnabled
      ? [
          {
            id: "principal",
            role: language === "en" ? "Main user" : "Usuario principal",
            username: cleanRecipient || (language === "en" ? "No user" : "Sin usuario"),
            items: primarySummaryItems,
          },
          {
            id: "secondary",
            role: language === "en" ? "Additional user" : "Usuario adicional",
            username:
              secondarySummaryUser?.name ||
              (language === "en" ? "No user" : "Sin usuario"),
            items: secondarySummaryItems,
          },
        ]
      : [
          {
            id: "principal",
            role: language === "en" ? "Fortnite user" : "Usuario de Fortnite",
            username: cleanRecipient || (language === "en" ? "No user" : "Sin usuario"),
            items: details,
          },
        ];

    function renderSummaryItemsTable(group) {
      const groupVbucks = group.items.reduce(
        (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0),
        0
      );

      return (
        <div key={`summary-group-${group.id}`} style={{ marginBottom: splitEnabled ? "24px" : 0 }}>
          {(
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "18px",
                marginBottom: "14px",
                padding: "16px 18px",
                borderRadius: "18px",
                border: "1px solid rgba(103,255,154,0.30)",
                background: "rgba(21,216,99,0.07)",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    color: "#67ff9a",
                    fontSize: "13px",
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {group.role}
                </div>
                <div
                  style={{
                    marginTop: "4px",
                    color: "#ffffff",
                    fontSize: "25px",
                    fontWeight: 900,
                    wordBreak: "break-word",
                  }}
                >
                  {group.username}
                </div>
              </div>

              <div style={{ flexShrink: 0, textAlign: "right" }}>
                <div
                  style={{
                    color: "#9db3a8",
                    fontSize: "12px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                  }}
                >
                  {language === "en" ? "Assigned" : "Asignado"}
                </div>
                <div
                  style={{
                    marginTop: "4px",
                    color: "#67ff9a",
                    fontSize: "22px",
                    fontWeight: 900,
                  }}
                >
                  {groupVbucks.toLocaleString("es-MX")} {labels.vbucks}
                </div>
              </div>
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "112px minmax(0, 1fr) 120px 210px",
              gap: "16px",
              padding: "0 16px 12px",
              color: "#67ff9a",
              fontSize: "14px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            <div>{language === "en" ? "Item" : "Objeto"}</div>
            <div>{language === "en" ? "Name" : "Nombre"}</div>
            <div style={{ textAlign: "center" }}>{language === "en" ? "Qty" : "Cantidad"}</div>
            <div style={{ textAlign: "right" }}>{language === "en" ? "Price (V-Bucks)" : "Precio (paVos)"}</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {group.items.map((item) => {
              const imageUrl =
                item._galleryImages?.[0] ||
                item.image ||
                item.galleryImages?.[0] ||
                "/ganker-logo.png";
              const unitPrice = Number(item.price || 0);
              const itemTotalVbucks = unitPrice * Number(item.qty || 0);

              return (
                <div
                  key={`summary-image-${group.id}-${item.id}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "112px minmax(0, 1fr) 120px 210px",
                    gap: "16px",
                    alignItems: "center",
                    padding: "14px 16px",
                    borderRadius: "20px",
                    border: "1px solid rgba(26,78,58,0.88)",
                    background: "#06110c",
                  }}
                >
                  <div
                    style={{
                      width: "96px",
                      height: "96px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      borderRadius: "16px",
                      background: "#101812",
                    }}
                  >
                    <img
                      src={getSummaryImageSrc(imageUrl)}
                      alt={getDisplayName(item)}
                      onError={(event) => {
                        if (!event.currentTarget.src.endsWith("/ganker-logo.png")) {
                          event.currentTarget.src = "/ganker-logo.png";
                        }
                      }}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        padding: "7px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "24px",
                        lineHeight: 1.18,
                        fontWeight: 900,
                        wordBreak: "break-word",
                      }}
                    >
                      {getDisplayName(item)}
                    </div>
                    {Number(item.qty || 0) > 1 && (
                      <div
                        style={{
                          marginTop: "7px",
                          color: "#9db3a8",
                          fontSize: "15px",
                          fontWeight: 700,
                        }}
                      >
                        {unitPrice} {labels.vbucks} {language === "en" ? "each" : "c/u"}
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      textAlign: "center",
                      fontSize: "28px",
                      fontWeight: 900,
                    }}
                  >
                    {item.qty}
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "28px", fontWeight: 900, color: "#ffffff" }}>
                      {itemTotalVbucks.toLocaleString("es-MX")}
                    </div>
                    <div
                      style={{
                        marginTop: "4px",
                        color: "#67ff9a",
                        fontSize: "15px",
                        fontWeight: 900,
                      }}
                    >
                      {labels.vbucks}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          left: "-12000px",
          top: 0,
          width: "1080px",
          pointerEvents: "none",
          zIndex: -1,
        }}
      >
        <div
          ref={summaryImageRef}
          style={{
            width: "1080px",
            boxSizing: "border-box",
            padding: "42px",
            color: "#ffffff",
            background:
              "linear-gradient(180deg, #020805 0%, #04120d 52%, #020805 100%)",
            fontFamily: "Arial, Helvetica, sans-serif",
          }}
        >
          <div
            style={{
              border: "2px solid rgba(21,216,99,0.55)",
              borderRadius: "34px",
              overflow: "hidden",
              background: "rgba(2,8,5,0.96)",
              boxShadow: "0 0 42px rgba(21,216,99,0.12)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "24px",
                padding: "34px 36px 28px",
                borderBottom: "1px solid rgba(103,255,154,0.24)",
              }}
            >
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    marginBottom: "8px",
                    color: "#67ff9a",
                    fontSize: "18px",
                    fontWeight: 900,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                  }}
                >
                  GKG Tienda Fortnite
                </div>
                <div
                  style={{
                    fontSize: "48px",
                    lineHeight: 1.05,
                    fontWeight: 900,
                    textTransform: "uppercase",
                  }}
                >
                  {language === "en" ? "Item Summary" : "Resumen de Objetos"}
                </div>
              </div>

              <div
                style={{
                  minWidth: "250px",
                  textAlign: "right",
                }}
              >
                <div
                  style={{
                    marginBottom: "6px",
                    color: "#67ff9a",
                    fontSize: "12px",
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}
                >
                  {language === "en" ? "Date / time" : "Fecha / hora"}
                </div>
                <div style={{ fontSize: "18px", fontWeight: 800, lineHeight: 1.35, color: "#dfffee" }}>
                  {summaryDateLabel || getSummaryDateLabel()}
                </div>
              </div>
            </div>

            <div style={{ padding: "28px 36px 12px" }}>
              {summaryGroups.map((group) => renderSummaryItemsTable(group))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "18px",
                padding: "22px 36px 32px",
              }}
            >
              <div
                style={{
                  borderRadius: "22px",
                  padding: "20px 22px",
                  border: "1px solid rgba(103,255,154,0.28)",
                  background: "#06110c",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    marginBottom: "6px",
                    color: "#9db3a8",
                    fontSize: "15px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                  }}
                >
                  {language === "en" ? "Total items" : "Total de objetos"}
                </div>
                <div style={{ fontSize: "34px", fontWeight: 900 }}>{totalQuantity}</div>
                {splitEnabled && (
                  <div
                    style={{
                      marginTop: "5px",
                      color: "#67ff9a",
                      fontSize: "14px",
                      fontWeight: 800,
                      textAlign: "center",
                    }}
                  >
                    {language === "en" ? "Distributed between 2 users" : "Distribuidos entre 2 usuarios"}
                  </div>
                )}
              </div>

              <div
                style={{
                  borderRadius: "22px",
                  padding: "20px 22px",
                  textAlign: "center",
                  border: "1px solid rgba(103,255,154,0.46)",
                  background: "rgba(21,216,99,0.08)",
                }}
              >
                <div
                  style={{
                    marginBottom: "6px",
                    color: "#9db3a8",
                    fontSize: "15px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                  }}
                >
                  {language === "en" ? "Total in pesos" : "Total en pesos"}
                </div>
                <div style={{ color: "#67ff9a", fontSize: "38px", fontWeight: 900 }}>
                  {formatMoney(deliveryVbucks * VB_TO_LOCAL_RATE)}
                </div>
              </div>
            </div>

            <div
              style={{
                padding: "18px 36px 22px",
                textAlign: "center",
                borderTop: "1px solid rgba(103,255,154,0.16)",
                color: "#8ca399",
                fontSize: "15px",
                fontWeight: 700,
              }}
            >
              {language === "en"
                ? "Summary generated from GKG Fortnite Shop"
                : "Resumen generado desde GKG Tienda Fortnite"}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderGiftDataModal() {
    return (
      <>
        <style>{`
          @keyframes gkgUsernameShake {
            0%, 100% { transform: translateX(0); }
            15% { transform: translateX(-7px); }
            30% { transform: translateX(7px); }
            45% { transform: translateX(-5px); }
            60% { transform: translateX(5px); }
            75% { transform: translateX(-3px); }
            90% { transform: translateX(3px); }
          }

          .gkg-username-shake {
            animation: gkgUsernameShake 430ms ease-in-out;
          }
        `}</style>
      <div
        className={`fixed inset-0 z-[145] flex items-end justify-center p-0 backdrop-blur-[3px] transition-all duration-300 ease-out sm:items-center sm:p-4 ${
          giftModalVisible ? "bg-black/72 opacity-100" : "bg-black/0 opacity-0"
        }`}
      >
        <div
          className={`flex h-[100dvh] w-full flex-col overflow-hidden rounded-none border-0 bg-[rgba(4,18,13,0.98)] shadow-[0_0_60px_rgba(21,216,99,0.16)] transition-all duration-300 ease-out sm:h-auto sm:max-h-[92dvh] sm:max-w-2xl sm:rounded-[30px] sm:border sm:border-[#124633]/70 ${
            giftModalVisible
              ? "translate-y-0 scale-100 opacity-100"
              : "translate-y-8 scale-[0.97] opacity-0 sm:translate-y-5"
          }`}
          onClick={(event) => event.stopPropagation()}
        >
          <div className="shrink-0 bg-[rgba(4,18,13,0.98)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#63ff9b]">
                  Datos de regalo
                </p>
                <h3 className="mt-1 text-2xl font-black text-white">
                  Confirmar envío por WhatsApp
                </h3>
                <p className="mt-1 text-xs leading-5 text-slate-400">
                  Debes poner los datos de regalo para continuar. Agrega el usuario principal y, si vas a dividir, selecciona qué objetos recibirá cada usuario.
                </p>
              </div>

              <button
                type="button"
                onClick={closeGiftModal}
                className="shrink-0 rounded-xl border border-[#1a4e3a]/70 bg-[#08140f] px-4 py-2 text-sm font-black text-white"
              >
                {labels.close}
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 pb-6 [-webkit-overflow-scrolling:touch] [touch-action:pan-y] [&::-webkit-scrollbar]:hidden">
            <div className="rounded-2xl bg-[#06110c] p-3 shadow-[0_10px_28px_rgba(0,0,0,0.16)]">
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-wide text-white">
                  Usuario principal a enviar *
                </span>
                <input
                  ref={principalUsernameInputRef}
                  type="text"
                  value={recipientUsername}
                  onChange={(event) => {
                    setRecipientUsername(event.target.value);
                    if (event.target.value.trim()) setPrincipalUsernameError("");
                  }}
                  placeholder="Ej. GankerGames"
                  aria-invalid={Boolean(principalUsernameError)}
                  aria-describedby={principalUsernameError ? "gkg-principal-username-error" : undefined}
                  className={`w-full rounded-2xl border bg-[#08140f] px-4 py-3 text-sm font-bold text-white outline-none shadow-[0_5px_16px_rgba(0,0,0,0.14)] transition placeholder:text-slate-500 ${
                    principalUsernameError
                      ? "border-red-500 ring-1 ring-red-500/35 focus:border-red-400 focus:ring-red-500/35"
                      : "border-[#1a4e3a]/80 focus:border-[#67ff9a] focus:ring-1 focus:ring-[#67ff9a]/35"
                  } ${principalUsernameShake ? "gkg-username-shake" : ""}`}
                />
                {principalUsernameError && (
                  <p
                    id="gkg-principal-username-error"
                    className="mt-2 text-[11px] font-bold leading-4 text-red-400"
                  >
                    {principalUsernameError}
                  </p>
                )}
              </label>

              <RecipientItemSelector recipientId="principal" selectedIds={primaryItemIds} />
            </div>

            <div className="rounded-2xl bg-[#06110c] p-3 shadow-[0_10px_28px_rgba(0,0,0,0.16)]">
              <label className="flex cursor-pointer items-center justify-between gap-3">
                <span>
                  <span className="block text-sm font-black text-white">Agregar 1 usuario adicional</span>
                  <span className="block text-xs leading-5 text-slate-400">
                    Actívalo solo si una parte del carrito irá a otra cuenta. Podrás elegir qué objetos recibe.
                  </span>
                </span>

                <input
                  type="checkbox"
                  checked={splitEnabled}
                  onChange={(event) => toggleSecondaryUser(event.target.checked)}
                  className="h-5 w-5 accent-[#15d863]"
                />
              </label>

              {splitEnabled && (
                <div className="mt-3 space-y-3">
                  {splitUsers.slice(0, 1).map((user, index) => (
                    <div key={user.id} className="rounded-2xl bg-[#04120d] p-3 shadow-[0_8px_22px_rgba(0,0,0,0.15)]">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-xs font-black uppercase tracking-wide text-white">
                          Usuario adicional
                        </span>

                        <button
                          type="button"
                          onClick={() => toggleSecondaryUser(false)}
                          className="rounded-xl border border-red-500/35 bg-red-500/10 px-3 py-2 text-xs font-black text-red-200"
                          aria-label="Quitar usuario adicional"
                        >
                          Quitar
                        </button>
                      </div>

                      <input
                        ref={secondaryUsernameInputRef}
                        type="text"
                        value={user.name}
                        onChange={(event) => updateSplitUser(index, event.target.value)}
                        placeholder="Nombre del usuario adicional"
                        aria-invalid={Boolean(secondaryUsernameError)}
                        aria-describedby={secondaryUsernameError ? "gkg-secondary-username-error" : undefined}
                        className={`w-full rounded-xl border bg-[#08140f] px-3 py-2 text-sm font-bold text-white outline-none shadow-[0_5px_16px_rgba(0,0,0,0.14)] transition placeholder:text-slate-500 ${
                          secondaryUsernameError
                            ? "border-red-500 ring-1 ring-red-500/35 focus:border-red-400 focus:ring-red-500/35"
                            : "border-[#1a4e3a]/80 focus:border-[#67ff9a] focus:ring-1 focus:ring-[#67ff9a]/35"
                        } ${secondaryUsernameShake ? "gkg-username-shake" : ""}`}
                      />
                      {secondaryUsernameError && (
                        <p
                          id="gkg-secondary-username-error"
                          className="mt-2 text-[11px] font-bold leading-4 text-red-400"
                        >
                          {secondaryUsernameError}
                        </p>
                      )}

                      <RecipientItemSelector recipientId={user.id} selectedIds={user.itemIds || []} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 bg-[rgba(4,18,13,0.98)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-18px_30px_rgba(4,18,13,.92)]">
            <div className="grid gap-3">
              <button
                type="button"
                onClick={downloadSummaryImage}
                disabled={summaryDownloading}
                aria-label="Opción 1: Descargar Imagen"
                title="Opción 1: Descargar Imagen"
                className="relative mx-auto w-[94%] overflow-hidden bg-transparent p-0 shadow-none transition duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0 disabled:cursor-wait disabled:opacity-60"
              >
                <img
                  src="/gkg-opcion-1-descargar-imagen.png"
                  alt="Opción 1: Descargar Imagen"
                  className="block h-auto w-full"
                />
                {summaryDownloading && (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-xs font-black uppercase tracking-wide text-white">
                    Generando imagen...
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={confirmSendWhatsApp}
                aria-label="Opción 2: Enviar en Texto por WhatsApp"
                title="Opción 2: Enviar en Texto por WhatsApp"
                className="mx-auto w-[94%] overflow-hidden bg-transparent p-0 shadow-none transition duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
              >
                <img
                  src="/gkg-opcion-2-whatsapp-texto.png"
                  alt="Opción 2: Enviar en Texto por WhatsApp"
                  className="block h-auto w-full"
                />
              </button>
            </div>
          </div>
        </div>
      </div>
      </>
    );
  }

  return (
    <div className="fixed inset-0 z-[130]">
      <div className="absolute inset-0 bg-black/62 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-hidden border-l border-[#1eff7a]/30 bg-[rgba(3,16,9,0.84)] shadow-[0_0_45px_rgba(21,216,99,0.16)] backdrop-blur-xl sm:max-w-lg ${
          isClosing ? "animate-[slideOutRight_220ms_ease-in]" : "animate-[slideInRight_220ms_ease-out]"
        }`}
      >
        <div className="shrink-0 border-b border-[#1eff7a]/25 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#63ff9b]">
                GKG
              </p>
              <h3 className="text-2xl font-black">{labels.cart}</h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label={labels.close}
              title={labels.close}
              className="h-12 w-12 overflow-hidden rounded-xl bg-transparent p-0 shadow-none transition duration-200 hover:-translate-y-0.5 hover:brightness-110"
            >
              <img
                src="/gkg-close-icon.png"
                alt={labels.close}
                className="block h-full w-full object-contain"
              />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 pr-2">
          {details.length === 0 && (
            <div className="rounded-2xl border border-[#1eff7a]/30 bg-[#07140f]/86 p-4 text-slate-300 shadow-[0_0_20px_rgba(21,216,99,0.06)]">
              {labels.emptyCart}
            </div>
          )}

          {details.map((item) => (
            <div key={item.id} className="rounded-2xl bg-[#07140f]/86 p-3 shadow-[0_0_20px_rgba(21,216,99,0.06)]">
              <div className="flex gap-3">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#101812]">
                  <img
                    src={item._galleryImages?.[0] || "/ganker-logo.png"}
                    alt={getDisplayName(item)}
                    className="h-full w-full object-contain object-center p-2"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="line-clamp-2 text-sm font-black text-white">{getDisplayName(item)}</div>
                  <div className="mt-1 text-xs text-slate-400">
                    {item.price} {labels.vbucks} · {localPrice(language, item.price)}
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onUpdateQty(item.id, Math.max(0, item.qty - 1))}
                      className="h-9 w-9 rounded-xl bg-[#07140f]/86 font-black text-white shadow-[0_0_16px_rgba(21,216,99,0.08)] transition hover:text-[#67ff9a]"
                    >
                      -
                    </button>
                    <div className="min-w-[28px] text-center font-black">{item.qty}</div>
                    <button
                      type="button"
                      onClick={() => onUpdateQty(item.id, item.qty + 1)}
                      className="h-9 w-9 rounded-xl bg-[#07140f]/86 font-black text-white shadow-[0_0_16px_rgba(21,216,99,0.08)] transition hover:text-[#67ff9a]"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      aria-label={language === "en" ? "Remove item" : "Quitar objeto"}
                      title={language === "en" ? "Remove item" : "Quitar objeto"}
                      className="ml-auto h-11 w-11 overflow-hidden rounded-xl bg-transparent p-0 shadow-none transition duration-200 hover:-translate-y-0.5 hover:brightness-110"
                    >
                      <img
                        src="/gkg-trash-icon.png"
                        alt={language === "en" ? "Remove item" : "Quitar objeto"}
                        className="block h-full w-full object-contain"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

        </div>

        <div className="shrink-0 border-t border-[#1eff7a]/25 bg-[rgba(3,16,9,0.92)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
          <div className="rounded-2xl border border-[#1eff7a]/30 bg-[#07140f]/86 p-4 shadow-[0_0_22px_rgba(21,216,99,0.08)]">
            <div className="flex items-center justify-between text-sm">
              <span>{labels.totalVbucks}</span>
              <span className="font-black">{totalVbucks} {labels.vbucks}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span>{labels.total}</span>
              <span className="font-black">{formatMoney(totalLocal)}</span>
            </div>

            <div className="mt-4 grid gap-3">
              <button
                type="button"
                onClick={openGiftModal}
                aria-label={labels.sendWhatsApp}
                title={labels.sendWhatsApp}
                className="w-full overflow-hidden rounded-2xl bg-transparent p-0 shadow-none transition duration-200 hover:-translate-y-0.5 hover:brightness-110 active:translate-y-0"
              >
                <img
                  src="/whatsapp-button.png"
                  alt={labels.sendWhatsApp}
                  className="block h-auto w-full"
                />
              </button>
              <button
                type="button"
                onClick={shareCart}
                aria-label={labels.shareLink}
                title={labels.shareLink}
                className="w-full overflow-hidden rounded-2xl bg-transparent p-0 shadow-none transition duration-200 hover:-translate-y-0.5 hover:brightness-110"
              >
                <img
                  src="/gkg-copiar-enlace.png"
                  alt={labels.shareLink}
                  className="block h-auto w-full"
                />
              </button>
              <button
                type="button"
                onClick={onClear}
                aria-label={language === "en" ? "Clear cart" : "Vaciar carrito"}
                title={language === "en" ? "Clear cart" : "Vaciar carrito"}
                className="w-full overflow-hidden rounded-2xl bg-transparent p-0 shadow-none transition duration-200 hover:-translate-y-0.5 hover:brightness-110"
              >
                <img
                  src="/gkg-vaciar-carrito.png"
                  alt={language === "en" ? "Clear cart" : "Vaciar carrito"}
                  className="block h-auto w-full"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {giftModalOpen && renderGiftDataModal()}
      {renderSummaryImage()}
    </div>
  );
}

function ItemModal({ item, labels, language, onClose, onAddToCart }) {
  const [selectedIncludedId, setSelectedIncludedId] = useState("");
  const [touchStartX, setTouchStartX] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const includedItems = getIncludedItems(item);

  const currentDetail = useMemo(() => {
    if (!selectedIncludedId) return item;
    return includedItems.find((entry) => entry.id === selectedIncludedId) || item;
  }, [item, includedItems, selectedIncludedId]);

  const images = currentDetail._galleryImages || getGalleryImages(currentDetail);
  const [imageIndex, setImageIndex] = useState(0);

  useEffect(() => {
    setImageIndex(0);
  }, [currentDetail?.id]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setModalVisible(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  if (!item) return null;

  const leavingSoon = item._isLeavingSoon;
  const isFreshNew = Boolean(item._isFreshNew && !item._isLeavingSoon);
  const displayType = getDisplayType(currentDetail, labels);
  const mainDescription = currentDetail.descriptionLocalized || currentDetail.descriptionEnglish || currentDetail.description || "";
  const extraDescriptionCandidates = [
    currentDetail.descriptionEnglish,
    currentDetail.descriptionLocalized,
    currentDetail.devName,
  ].filter(Boolean);
  const extraDescription = extraDescriptionCandidates.find((entry) => entry && entry !== mainDescription) || "";
  const currentTheme = getCardTheme(currentDetail._section || item._section || currentDetail.id || item.id);
  const currentImageStyle = {
    backgroundImage: `linear-gradient(180deg, ${withAlpha(currentTheme.top, 0.98)} 0%, ${withAlpha(currentTheme.middle, 0.88)} 58%, ${withAlpha(currentTheme.bottom, 0.96)} 100%)`,
  };
  const shareText = [
    `Cotización de objeto: ${getDisplayName(currentDetail)}`,
    `Tipo: ${displayType}`,
    `Precio: ${item.price || 0} ${labels.vbucks}`,
    `Precio MXN: ${localPrice(language, item.price)}`,
    mainDescription ? `Descripción: ${mainDescription}` : null,
    `Imagen: ${images[imageIndex] || item.image || ""}`,
    "Cotización generada desde GKG Tienda Fortnite",
  ]
    .filter(Boolean)
    .join("\n");

  function handleWhatsAppShare() {
    if (typeof window === "undefined") return;
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function showPrevImage() {
    if (images.length <= 1) return;
    setImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }

  function showNextImage() {
    if (images.length <= 1) return;
    setImageIndex((prev) => (prev + 1) % images.length);
  }

  function handleImageTouchStart(event) {
    setTouchStartX(event.touches?.[0]?.clientX ?? null);
  }

  function handleImageTouchEnd(event) {
    if (touchStartX == null || images.length <= 1) return;
    const endX = event.changedTouches?.[0]?.clientX ?? touchStartX;
    const deltaX = endX - touchStartX;
    if (Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        showNextImage();
      } else {
        showPrevImage();
      }
    }
    setTouchStartX(null);
  }

  function handleModalClose() {
    setModalVisible(false);
    window.setTimeout(onClose, 220);
  }

  return (
    <div
      className={`fixed inset-0 z-[125] overflow-y-auto bg-black/80 p-3 transition-opacity duration-200 sm:flex sm:items-center sm:justify-center sm:p-6 ${modalVisible ? "opacity-100" : "opacity-0"}`}
      onClick={handleModalClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className={`gkg-item-modal-box mx-auto w-full max-w-[820px] overflow-hidden rounded-[24px] bg-[#04120d] shadow-[0_0_60px_rgba(0,255,120,0.08)] transition-all duration-200 sm:max-h-[calc(100dvh-2rem)] sm:overflow-y-auto ${modalVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-5 scale-[0.96] opacity-0"} ${
          leavingSoon && isFreshNew
            ? "border-2 border-red-500 ring-2 ring-yellow-400/60"
            : leavingSoon
              ? "border-2 border-red-500"
              : isFreshNew
                ? "border-2 border-yellow-400"
                : "border border-[#124633]"
        }`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[#103c2c] p-4 sm:p-5">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.35em] text-[#59ffbd]">{item._section}</div>
            <h2 className="mt-2 text-3xl font-black italic leading-none text-white sm:text-4xl">
              {getDisplayName(currentDetail)}
            </h2>
            <div className="mt-2 text-base text-slate-300">{displayType}</div>
          </div>

          <button
            type="button"
            onClick={handleModalClose}
            className="rounded-2xl border border-[#1a4e3a] bg-[#08140f] px-4 py-2.5 text-base font-black text-white sm:text-lg"
          >
            {labels.close}
          </button>
        </div>

        <div className="gkg-item-modal-grid grid min-w-0 grid-cols-1 gap-4 p-3 sm:p-4 lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
          <div className="min-w-0">
            <div className="relative overflow-hidden rounded-[28px] border border-[#124f39]" style={currentImageStyle}>
              {leavingSoon && (
                <div className="absolute left-3 top-3 z-20 rounded-full bg-red-500 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-white shadow-lg sm:text-xs">
                  {labels.leavingSoon}
                </div>
              )}

              {isFreshNew && !leavingSoon && (
                <div className="absolute left-3 top-3 z-20 rounded-full bg-yellow-400 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-[#231700] shadow-lg sm:text-xs">
                  {labels.newBadge}
                </div>
              )}

              <button
                type="button"
                onClick={handleWhatsAppShare}
                aria-label={labels.itemShare}
                title={labels.itemShare}
                className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-2xl border border-[#1eff7a]/35 bg-[#07140f]/95 text-[#67ff9a] shadow-[0_0_18px_rgba(21,216,99,0.10)] transition hover:border-[#67ff9a] hover:bg-[#0b1f15]"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M7 7h-1.5A2.5 2.5 0 0 0 3 9.5v9A2.5 2.5 0 0 0 5.5 21h9A2.5 2.5 0 0 0 17 18.5V17" />
                  <path d="M10 14 21 3" />
                  <path d="M14 3h7v7" />
                </svg>
              </button>

              <div
                className="gkg-item-modal-main-image aspect-[4/5] overflow-hidden sm:h-[300px] sm:aspect-auto lg:h-[280px]"
                onTouchStart={handleImageTouchStart}
                onTouchEnd={handleImageTouchEnd}
              >
                <img
                  src={images[imageIndex] || "/ganker-logo.png"}
                  alt={getDisplayName(currentDetail)}
                  className="gkg-item-modal-main-image-content h-full w-full object-contain object-center p-4 transition-all duration-500 ease-out scale-[0.70] sm:p-5 lg:p-5"
                />
              </div>
            </div>

            {images.length > 1 && (
              <div className="gkg-item-modal-thumbs mt-3 flex max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-2">
                {images.map((img, idx) => {
                  const thumbTheme = getCardTheme(`${currentDetail._section || item._section || item.id}-${idx}`);
                  return (
                    <button
                      type="button"
                      key={`${img}-${idx}`}
                      onClick={() => setImageIndex(idx)}
                      className={`gkg-item-modal-thumb h-14 w-14 shrink-0 overflow-hidden rounded-xl border sm:h-[58px] sm:w-[58px] ${
                        idx === imageIndex ? "border-[#59ffbd]" : "border-[#184231]"
                      }`}
                      style={{
                        backgroundImage: `linear-gradient(180deg, ${withAlpha(thumbTheme.top, 0.98)} 0%, ${withAlpha(thumbTheme.middle, 0.88)} 60%, ${withAlpha(thumbTheme.bottom, 0.96)} 100%)`,
                      }}
                    >
                      <img src={img} alt={`thumb-${idx}`} className="h-full w-full object-contain object-center p-1.5 scale-[0.88]" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="gkg-item-modal-info min-w-0 space-y-3">
            <div className="rounded-[22px] border border-[#154636] bg-[#07140f] p-4">
              <div className="rounded-2xl border border-[#144d38] bg-[linear-gradient(90deg,#082018,#0c2d1f)] px-5 py-4 text-center shadow-[0_0_18px_rgba(21,216,99,0.07)]">
                <div className="text-base font-black leading-none text-[#67ff9a] sm:text-lg">
                  {item.price || 0} {labels.vbucks}
                </div>
                <div className="mt-2 text-[1.4rem] font-black leading-none text-white sm:text-[1.65rem]">
                  {localPrice(language, item.price)}
                </div>
              </div>

              {item._latestOutDate && (
                <div className="mt-4 rounded-2xl border border-[#124d39] bg-[linear-gradient(180deg,#07170f_0%,#0b2217_100%)] px-4 py-3 text-center shadow-[0_0_18px_rgba(21,216,99,0.06)]">
                  <div className="text-xs font-bold uppercase tracking-[0.28em] text-[#67ff9a]">{labels.timeLeft}</div>
                  <div className="mt-1 text-xl font-black text-white sm:text-2xl">
                    {getTimeUntilDate(item._latestOutDate, language)}
                  </div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-wide text-white/70">
                    {labels.leavesOn} {formatShopDepartureDate(item._latestOutDate, language)}
                  </div>
                </div>
              )}

              {mainDescription && (
                <div className="mt-4 rounded-2xl border border-[#123e30] bg-[#081410] p-4 text-slate-300">
                  <div className="text-sm leading-relaxed text-white/90">“{mainDescription}”</div>
                  {extraDescription && (
                    <div className="mt-2 text-xs leading-relaxed text-slate-400">{extraDescription}</div>
                  )}
                </div>
              )}

              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => onAddToCart(item)}
                  className="w-full rounded-2xl bg-[#19df6c] px-4 py-3.5 text-sm font-black text-black sm:text-base"
                >
                  {labels.addToCart}
                </button>
              </div>
            </div>

            {includedItems.length > 0 && (
              <div className="rounded-[22px] border border-[#154636] bg-[#07140f] p-4">
                <div className="mb-4 text-base text-center font-black uppercase tracking-[0.35em] text-[#67ff9a]">
                  {labels.includes} {includedItems.length}
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {includedItems.map((entry, index) => {
                    const active = selectedIncludedId === entry.id;
                    const entryImages = getGalleryImages(entry);
                    const entryImage = entryImages[0] || "/ganker-logo.png";
                    const entryTheme = getCardTheme(entry._section || entry.name || entry.id || `${index}`);

                    return (
                      <button
                        type="button"
                        key={`${entry.id || entry.name || index}`}
                        onClick={() => setSelectedIncludedId((prev) => (prev === entry.id ? "" : entry.id))}
                        className={`min-w-0 rounded-xl border p-2 text-center transition ${
                          active ? "border-[#59ffbd] bg-[#0b1712]" : "border-[#154636] bg-[#08140f]"
                        }`}
                      >
                        <div
                          className="aspect-square overflow-hidden rounded-xl"
                          style={{
                            backgroundImage: `linear-gradient(180deg, ${withAlpha(entryTheme.top, 0.98)} 0%, ${withAlpha(entryTheme.middle, 0.88)} 60%, ${withAlpha(entryTheme.bottom, 0.96)} 100%)`,
                          }}
                        >
                          <img src={entryImage} alt={getDisplayName(entry)} className="h-full w-full object-contain object-center p-2 scale-[0.88]" />
                        </div>
                        <div className="mt-2 line-clamp-2 text-xs font-black uppercase leading-tight text-white sm:text-sm">
                          {getDisplayName(entry)}
                        </div>
                        <div className="mt-1 text-xs uppercase tracking-wide text-slate-300">
                          {getDisplayType(entry, labels)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ShopCard({ item, labels, language, onOpen, onQuickAdd, groupKey }) {
  const displayType = getDisplayType(item, labels);
  const bundle = getBundlePresentation(item, language);
  const isNewArrival = Boolean(item._isFreshNew && !item._isLeavingSoon);
  const hasDepartureDate = Boolean(item._latestOutDate);
  const timeRemaining = hasDepartureDate
    ? getCompactTimeUntilDate(item._latestOutDate, language)
    : "";
  const hasValidPrice = Number(item.price) > 0;
  const hasAlreadyLeft = timeRemaining === "YA SALIÓ" || timeRemaining === "LEFT";
  const departureText = hasDepartureDate
    ? hasAlreadyLeft
      ? timeRemaining
      : `${labels.timeLeft} ${timeRemaining}`
    : "";
  const departureDateText = hasDepartureDate
    ? `${labels.leavesOn} ${formatShopDepartureDate(item._latestOutDate, language)}`
    : "";

  const borderClass = item._isLeavingSoon
    ? "border-[3px] border-red-500 ring-2 ring-red-500/40 shadow-[0_0_18px_rgba(239,68,68,0.28),0_10px_25px_rgba(0,0,0,0.45)]"
    : isNewArrival
      ? "border-[3px] border-yellow-300 ring-2 ring-yellow-300/45 shadow-[0_0_18px_rgba(250,204,21,0.24),0_10px_25px_rgba(0,0,0,0.45)]"
      : "border border-white/15 shadow-[0_10px_25px_rgba(0,0,0,0.42)]";

  return (
    <article className="h-full min-w-0 w-full">
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpen(item)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpen(item);
          }
        }}
        className="group block h-full min-w-0 w-full cursor-pointer text-left transition active:scale-[0.985]"
      >
        <div
          className={`relative flex h-full min-h-[220px] flex-col overflow-hidden rounded-[10px] transition duration-300 hover:-translate-y-1 hover:brightness-105 ${borderClass}`}
        >
          <div
            className="relative aspect-[0.82/1] overflow-hidden sm:aspect-square"
            style={{
              background: "linear-gradient(180deg, #146b42 0%, #0a3a26 58%, #04130d 100%)",
            }}
          >
            <div className={`absolute inset-x-1 top-1 z-10 transition-transform duration-300 group-hover:scale-[1.035] ${bundle.caption ? "bottom-[4.6rem]" : "bottom-[3.55rem]"}`}>
              {bundle.heroes.length > 0 ? (
                <div className="relative z-10 flex h-full flex-col gap-1 px-1 pt-3">
                  <div className="flex min-h-0 flex-1 justify-center gap-1">
                    {bundle.heroes.map((url) => (
                      <RotatingImage key={url} images={[url]} alt="" className="h-full min-w-0 flex-1" fitPadding={0.015} preferUncropped />
                    ))}
                  </div>
                  {bundle.extras.length > 0 && (
                    <div className="flex h-8 shrink-0 justify-center gap-1 rounded-md bg-black/40 px-1 sm:h-10">
                      {bundle.extras.map((url) => (
                        <RotatingImage key={url} images={[url]} alt="" className="h-full min-w-0 flex-1" fitPadding={0.035} preferUncropped />
                      ))}
                    </div>
                  )}
                </div>
              ) : <RotatingImage
                images={item._galleryImages}
                alt={getDisplayName(item)}
                className="h-full w-full"
                fitPadding={0.012}
                preferUncropped={item._typeKey !== "bundle"}
              />}
            </div>

            <div className="pointer-events-none absolute inset-0 z-20 bg-[linear-gradient(180deg,transparent_46%,rgba(0,0,0,0.16)_64%,rgba(0,0,0,0.88)_100%)]" />

            <div className="pointer-events-none absolute left-1 top-1 z-30 flex flex-col items-start gap-1">
              <span className="rounded-md bg-[#07140f]/95 px-2 py-1 text-[9px] font-black uppercase leading-none tracking-wide text-[#67ff9a] shadow-md sm:text-[10px]">
                {displayType}
              </span>
              {isNewArrival && (
                <span className="rounded-md bg-yellow-300 px-2 py-0.5 text-[9px] font-black uppercase leading-none tracking-wide text-black shadow-md sm:text-[10px]">
                  {labels.newBadge}
                </span>
              )}
            </div>

            {item._isLeavingSoon && (
              <div className="absolute right-1 top-1 z-30 rounded-md bg-red-500 px-1.5 py-0.5 text-[8px] font-black uppercase leading-none text-white shadow-[0_2px_6px_rgba(0,0,0,0.4)] sm:text-[9px]">
                {labels.leavingSoon}
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 z-30 p-2">
              <h2 className="line-clamp-2 min-h-[2.15em] text-[0.78rem] font-black uppercase leading-[1.05] text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.85)] sm:text-[0.9rem]">
                {bundle.title}
              </h2>
              {bundle.caption && <p className="text-[10px] font-semibold leading-tight text-emerald-100">{bundle.caption}</p>}

              <div className="mt-1 flex min-w-0 items-center gap-1.5">
                <VCoinIcon className="h-4 w-4 shrink-0 text-[9px] sm:h-[18px] sm:w-[18px] sm:text-[10px]" />
                <span className="shrink-0 whitespace-nowrap pr-0.5 text-base font-black not-italic leading-tight tabular-nums text-white drop-shadow-[0_2px_3px_rgba(0,0,0,0.85)] sm:italic">
                  {hasValidPrice ? formatVbucks(item.price) : language === "en" ? "N/A" : "N/D"}
                </span>

                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    if (!hasValidPrice) return;
                    onQuickAdd?.(item);
                  }}
                  disabled={!hasValidPrice}
                  aria-label={`${labels.addToCart}: ${localPrice(language, item.price)}`}
                  title={`${labels.addToCart} · ${localPrice(language, item.price)}`}
                  className="ml-auto inline-flex min-h-6 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-md border border-white/90 bg-white px-1.5 text-[#252234] shadow-[0_2px_7px_rgba(0,0,0,0.5)] transition hover:brightness-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-7 sm:px-2"
                >
                  <span className="text-[10px] font-black leading-tight tabular-nums sm:text-xs">
                    {hasValidPrice ? `MX$${(Number(item.price) * VB_TO_LOCAL_RATE).toFixed(2)}` : "—"}
                  </span>
                  <span aria-hidden="true" className="text-base font-black leading-none">+</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex min-h-[48px] items-center gap-1.5 border-t border-[#1f6848]/70 bg-[#07140f] px-2 py-1.5 text-white">
            {hasDepartureDate && (
              <>
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 shrink-0 text-white/75"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
                <div className="min-w-0 leading-tight">
                  <div className="whitespace-nowrap text-[0.66rem] font-black uppercase sm:text-[0.73rem]">
                    {departureText}
                  </div>
                  <div className="mt-0.5 whitespace-nowrap text-[0.53rem] font-bold uppercase text-white/70 sm:text-[0.59rem]">
                    {departureDateText}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
function MobileMenuDrawer({ open, labels, cartCount, authHref, authLabel, onClose, onCartOpen }) {
  const [shouldRender, setShouldRender] = useState(open);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    let timeoutId;

    if (open) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      timeoutId = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 220);
    }

    return () => clearTimeout(timeoutId);
  }, [open, shouldRender]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-[140]">
      <div className="absolute inset-0 bg-black/62 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={`absolute right-0 top-0 h-full w-[86%] max-w-sm border-l border-[#1eff7a]/30 bg-[rgba(3,16,9,0.84)] p-5 shadow-[0_0_45px_rgba(21,216,99,0.16)] backdrop-blur-xl ${
          isClosing ? "animate-[slideOutRight_220ms_ease-in]" : "animate-[slideInRight_220ms_ease-out]"
        }`}
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/ganker-logo.png"
              alt="GKG"
              className="h-12 w-12 rounded-full border border-[#19ff72]/45 object-cover shadow-[0_0_18px_rgba(25,255,114,0.25)]"
            />
            <div>
              <p className="text-2xl font-black italic leading-none text-white">{labels.brand}</p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.3em] text-[#67ff9a]">
                {labels.brandSub}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={labels.close}
            title={labels.close}
            className="h-12 w-12 overflow-hidden rounded-xl bg-transparent p-0 shadow-none transition duration-200 hover:-translate-y-0.5 hover:brightness-110"
          >
            <img
              src="/gkg-close-icon.png"
              alt={labels.close}
              className="block h-full w-full object-contain"
            />
          </button>
        </div>

        <div className="grid gap-3">
          <Link
            href="/"
            onClick={onClose}
            className="rounded-2xl bg-[#15d863] px-4 py-4 text-center text-base font-black text-[#06110a] shadow-[0_0_22px_rgba(21,216,99,0.22)]"
          >
            {labels.navShop}
          </Link>

          <Link
            href="/vbucks"
            onClick={onClose}
            className="rounded-2xl border border-cyan-300/45 bg-cyan-300/10 px-4 py-4 text-center text-base font-black text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.12)] transition hover:border-cyan-200 hover:bg-cyan-300/15"
          >
            {labels.navVbucks}
          </Link>

          <Link
            href={authHref}
            onClick={onClose}
            className="rounded-2xl border border-cyan-300/45 bg-cyan-300/10 px-4 py-4 text-center text-base font-black text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.12)] transition hover:border-cyan-200 hover:bg-cyan-300/15"
          >
            {authLabel}
          </Link>

          <button
            type="button"
            onClick={() => {
              onClose();
              onCartOpen();
            }}
            className="rounded-2xl border border-[#67ff9a] bg-[#0b120d]/88 px-4 py-4 text-center text-base font-black text-[#67ff9a] shadow-[0_0_22px_rgba(21,216,99,0.12)]"
          >
            {labels.cart} ({cartCount})
          </button>
        </div>
      </div>
    </div>
  );
}

function SparkleBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(22,232,61,0.10),transparent_20%),radial-gradient(circle_at_82%_22%,rgba(103,255,154,0.08),transparent_18%),radial-gradient(circle_at_50%_78%,rgba(21,216,99,0.08),transparent_22%)]" />
      {STAR_POINTS.map((star, index) => (
        <span
          key={index}
          className="absolute rounded-full bg-[#79ffb0] opacity-70 shadow-[0_0_8px_rgba(121,255,176,0.65),0_0_16px_rgba(21,216,99,0.32)]"
          style={{
            top: star.top,
            left: star.left,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animation: `twinkle ${star.duration} ease-in-out ${star.delay} infinite`,
          }}
        />
      ))}
    </div>
  );
}

function TutorialPreviewModal({ open, onClose, onSkipClient }) {
  const [mounted, setMounted] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(10);
  const iframeRef = useRef(null);
  const playerRef = useRef(null);
  const hasPlayedRef = useRef(false);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open || !mounted || typeof document === "undefined") return undefined;

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverscroll = document.body.style.overscrollBehavior;
    const previousHtmlOverscroll = document.documentElement.style.overscrollBehavior;

    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    document.documentElement.style.overscrollBehavior = "none";

    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overscrollBehavior = previousBodyOverscroll;
      document.documentElement.style.overscrollBehavior = previousHtmlOverscroll;
    };
  }, [open, mounted]);

  useEffect(() => {
    if (!open || !mounted || typeof window === "undefined") return undefined;

    hasPlayedRef.current = false;
    setHasPlayed(false);
    setSecondsLeft(10);

    const startedAt = Date.now();

    const intervalId = window.setInterval(() => {
      if (hasPlayedRef.current) {
        window.clearInterval(intervalId);
        return;
      }

      const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
      const remainingSeconds = Math.max(0, 10 - elapsedSeconds);

      setSecondsLeft(remainingSeconds);

      if (remainingSeconds <= 0) {
        window.clearInterval(intervalId);

        if (!hasPlayedRef.current) {
          onCloseRef.current?.();
        }
      }
    }, 250);

    return () => window.clearInterval(intervalId);
  }, [open, mounted]);

  useEffect(() => {
    if (!open || !mounted || typeof window === "undefined") return undefined;

    let disposed = false;
    let previousReadyHandler;

    function markAsPlayed() {
      if (disposed || hasPlayedRef.current) return;

      hasPlayedRef.current = true;
      setHasPlayed(true);
    }

    function initializePlayer() {
      if (
        disposed ||
        !iframeRef.current ||
        !window.YT ||
        typeof window.YT.Player !== "function"
      ) {
        return;
      }

      try {
        playerRef.current?.destroy?.();
      } catch {}

      try {
        playerRef.current = new window.YT.Player(iframeRef.current, {
          events: {
            onStateChange(event) {
              if (event?.data === 1) {
                markAsPlayed();
              }
            },
          },
        });
      } catch {}
    }

    if (window.YT && typeof window.YT.Player === "function") {
      initializePlayer();
    } else {
      previousReadyHandler = window.onYouTubeIframeAPIReady;

      window.onYouTubeIframeAPIReady = () => {
        if (typeof previousReadyHandler === "function") {
          previousReadyHandler();
        }

        initializePlayer();
      };

      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.body.appendChild(script);
      }
    }

    return () => {
      disposed = true;

      try {
        playerRef.current?.destroy?.();
      } catch {}

      playerRef.current = null;
    };
  }, [open, mounted]);

  if (!open || !mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Tutorial de compra"
      className="gkg-tutorial-overlay"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483647,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflowY: "auto",
        overscrollBehavior: "contain",
        padding: "12px",
        backgroundColor: "#010604",
        isolation: "isolate",
      }}
    >
      <style>{`
        .gkg-tutorial-card {
          display: flex;
          width: min(92vw, 336px);
          max-height: calc(100dvh - 24px);
          flex-direction: column;
          overflow: hidden;
          border: 1px solid rgba(30, 255, 122, 0.48);
          border-radius: 26px;
          background: #031109;
          box-shadow: 0 0 58px rgba(21, 216, 99, 0.24);
        }

        .gkg-tutorial-header,
        .gkg-tutorial-footer {
          flex-shrink: 0;
          background: #04150d;
        }

        .gkg-tutorial-header {
          border-bottom: 1px solid #124633;
          padding: 14px 16px 12px;
          text-align: center;
        }

        .gkg-tutorial-content {
          min-height: 0;
          flex: 1;
          overflow-y: auto;
          overscroll-behavior: contain;
          padding: 14px;
          background: #031109;
          -webkit-overflow-scrolling: touch;
        }

        .gkg-tutorial-short {
          position: relative;
          width: min(62vw, 218px);
          aspect-ratio: 9 / 16;
          margin: 0 auto;
          overflow: hidden;
          border: 1px solid rgba(30, 255, 122, 0.38);
          border-radius: 20px;
          background: #000;
          box-shadow: 0 0 24px rgba(21, 216, 99, 0.16);
        }

        .gkg-tutorial-footer {
          border-top: 1px solid #124633;
          padding: 14px 14px max(14px, env(safe-area-inset-bottom));
        }

        @media (min-width: 768px) {
          .gkg-tutorial-card {
            width: 292px;
            max-height: min(88vh, 680px);
          }

          .gkg-tutorial-short {
            width: 176px;
          }
        }
      `}</style>

      <section className="gkg-tutorial-card">
        <div className="gkg-tutorial-header">
          <p className="text-[10px] font-black uppercase tracking-[0.34em] text-[#67ff9a]">
            GKG Tienda
          </p>

          <h2 className="mt-1 text-xl font-black italic text-white">
            Tutorial de compra
          </h2>

          <p className="mt-2 text-xs leading-5 text-slate-300">
            Revisa este Short antes de continuar en la tienda.
          </p>

          <p className="mt-2 text-[11px] font-bold leading-4 text-[#8effb5]">
            {hasPlayed
              ? "Video en reproducción."
              : `Si no reproduces el video, se cerrará automáticamente en ${secondsLeft} s.`}
          </p>
        </div>

        <div className="gkg-tutorial-content">
          <div className="gkg-tutorial-short">
            <iframe
              ref={iframeRef}
              title="Tutorial de compra Ganker Games"
              src="https://www.youtube.com/embed/A0SAjcySAsc?rel=0&modestbranding=1&playsinline=1&enablejsapi=1"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                border: 0,
              }}
            />
          </div>
        </div>

        <div className="gkg-tutorial-footer">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-2xl bg-[#15d863] px-4 py-3.5 text-sm font-black text-[#06110a] shadow-[0_0_20px_rgba(21,216,99,0.22)] transition hover:brightness-110"
          >
            Continuar con la tienda
          </button>

          <button
            type="button"
            onClick={onSkipClient}
            className="mt-3 w-full rounded-2xl border border-[#1eff7a]/35 bg-[#07140f] px-4 py-3 text-xs font-black text-[#67ff9a] transition hover:border-[#8cff9f] hover:bg-[#0b1f15]"
          >
            Soy Cliente GKG: omitir video
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}

export default function Home() {
  const [language, setLanguage] = useState("es-419");
  const labels = LABELS[language];
  const supabase = useMemo(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) return null;

    return createBrowserClient(supabaseUrl, supabaseAnonKey);
  }, []);

  const [sessionUser, setSessionUser] = useState(null);

  const [allItems, setAllItems] = useState([]);
  const [recentlyGone, setRecentlyGone] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedSection, setSelectedSection] = useState("ALL");
  const [sortMode, setSortMode] = useState("NONE");
  const [timeLeft, setTimeLeft] = useState("--:--:--");
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartPulse, setCartPulse] = useState(false);
  const [modalEntry, setModalEntry] = useState(null);
  const [groupExport, setGroupExport] = useState(null);
  useEffect(() => {
    const href = groupExport?.href;
    return () => { if (href) URL.revokeObjectURL(href); };
  }, [groupExport]);
  const [sectionViews, setSectionViews] = useState({});

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("gkg-section-views-v1") || "{}");
      if (saved && typeof saved === "object" && !Array.isArray(saved)) setSectionViews(saved);
    } catch {}
  }, []);

  function openShopItem(item) {
    const section = item._section || "Shop";
    const next = { ...sectionViews, [section]: (Number(sectionViews[section]) || 0) + 1 };
    setSectionViews(next);
    try {
      localStorage.setItem("gkg-section-views-v1", JSON.stringify(next));
    } catch {}
    setModalEntry(item);
  }
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [sortModalOpen, setSortModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [languageChanging, setLanguageChanging] = useState(false);
  const [nextLanguage, setNextLanguage] = useState(null);
  const [tutorialPreviewOpen, setTutorialPreviewOpen] = useState(false);
  const groupsRef = useRef(null);

  const handleLanguageChange = (targetLang) => {
    if (!targetLang || targetLang === language || languageChanging) return;
    setNextLanguage(targetLang);
    setLanguageChanging(true);

    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        setLanguage(targetLang);
      }, 420);

      window.setTimeout(() => {
        setLanguageChanging(false);
        setNextLanguage(null);
      }, 1100);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const shouldSkipTutorial =
        window.localStorage.getItem(CLIENT_GKG_TUTORIAL_SKIP_KEY) === "1";

      setTutorialPreviewOpen(!shouldSkipTutorial);
    } catch {
      setTutorialPreviewOpen(true);
    }

    const savedLang = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (savedLang === "es-419" || savedLang === "en") setLanguage(savedLang);

    const savedCart = window.localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) setCart(parsed);
      } catch {}
    }

    const gone = readRecentlyGone();
    setRecentlyGone(gone);
    setTimeLeft(getCountdownToNextShopUpdate());
  }, []);

  useEffect(() => {
    if (!supabase) return undefined;

    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setSessionUser(data?.session?.user || null);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionUser(session?.user || null);
    });

    return () => {
      mounted = false;
      authListener?.subscription?.unsubscribe?.();
    };
  }, [supabase]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LANG_STORAGE_KEY, language);
    }
  }, [language]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getCountdownToNextShopUpdate());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 260);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    async function loadShop() {
      try {
        setLoading(true);
        setError("");

        // Se consulta en paralelo la metadata oficial: historial, tipo real de
        // oferta e imagen Product.BR. Esto evita deducir un lote por el número
        // de artículos o escoger una versión LEGO por el orden del array.
        const newnessRequest = fetch(`/api/gkg-shop-newness?lang=${language}&schema=offers-v6`).catch(
          () => null
        );

        const response = await fetch(`/api/shop?lang=${language}&_=${Date.now()}`, {
          cache: "no-store",
          headers: { "Cache-Control": "no-cache" },
        });
        const text = await response.text();
        let payload = text ? JSON.parse(text) : {};

        if (!response.ok) throw new Error(payload.error || "No se pudo cargar la tienda");

        const primaryItems = getRawShopItems(payload);
        const datesAreIncomplete =
          primaryItems.length === 0 ||
          primaryItems.some((item) => !hasValidApiOutDate(item));

        if (datesAreIncomplete) {
          const sourceResponse = await fetch(
            `/api/gkg-shop-source?lang=${language}&_=${Date.now()}`,
            {
              cache: "no-store",
              headers: { "Cache-Control": "no-cache" },
            }
          );

          if (sourceResponse.ok) {
            const sourceText = await sourceResponse.text();
            const sourcePayload = sourceText ? JSON.parse(sourceText) : {};
            const sourceItems = getRawShopItems(sourcePayload);

            if (
              sourceItems.length > 0 &&
              sourceItems.every((item) => hasValidApiOutDate(item))
            ) {
              payload = sourcePayload;
            }
          }
        }

        let rawItems = getRawShopItems(payload);
        const newnessResponse = await newnessRequest;

        if (newnessResponse?.ok) {
          try {
            const newnessText = await newnessResponse.text();
            const newnessPayload = newnessText ? JSON.parse(newnessText) : {};
            const newnessItems = getRawShopItems(newnessPayload);
            const newnessById = new Map(
              newnessItems
                .map((item) => [String(item?.id || item?.offerId || ""), item])
                .filter(([id]) => id)
            );

            const getOfferId = (item) => String(item?.offerId || item?.id || "");
            const canVerifyOffers = newnessPayload.hasOfferIndex === true &&
              rawItems.some((item) => newnessById.has(getOfferId(item)));
            rawItems = rawItems.filter((item) => {
              if (!canVerifyOffers || getDisplaySection(item).trim().toLowerCase() !== "shop") return true;
              return newnessById.has(getOfferId(item));
            }).map((item) => {
              const itemId = getOfferId(item);
              const historyData = newnessById.get(itemId);

              if (!historyData) {
                return { ...item, isFirstAppearance: false };
              }

              const useOfferArtwork = historyData.isBundle !== true || historyData.hasBundleArtwork === true;
              const authoritativeGallery = useOfferArtwork && Array.isArray(historyData.galleryImages)
                ? historyData.galleryImages.filter(Boolean)
                : [];
              const primaryImage = normalizeUrl(
                useOfferArtwork ? historyData.primaryImage || authoritativeGallery[0] : ""
              );
              const currentIncludedItems = Array.isArray(item.includedItems)
                ? item.includedItems
                : [];
              const currentIncludedById = new Map(
                currentIncludedItems
                  .map((entry) => [String(entry?.id || ""), entry])
                  .filter(([id]) => id)
              );
              const authoritativeIncludedItems = Array.isArray(historyData.includedItems)
                ? historyData.includedItems
                    .filter((entry) => entry?.id)
                    .map((entry) => ({
                      ...(currentIncludedById.get(String(entry.id)) || {}),
                      ...entry,
                    }))
                : [];

              const preserveBundle = historyData.isBundle === false &&
                (item.isBundle === true || /^(?:bundle|lote)$/i.test(asText(item.typeEnglish).trim())) &&
                new Set([...currentIncludedItems, ...authoritativeIncludedItems]
                  .filter((entry) => getRawTypeKey(entry.typeEnglish || entry.typeLocalized, entry) === "outfit")
                  .map((entry) => entry.id || getDisplayName(entry))).size > 1;
              if (preserveBundle) return { ...item, isBundle: true, isFirstAppearance: historyData.isFirstAppearance === true };

              return {
                ...item,
                nameLocalized: historyData.offerName || item.nameLocalized,
                isBundle:
                  typeof historyData.isBundle === "boolean"
                    ? historyData.isBundle
                    : item.isBundle,
                isVehicleOffer: historyData.isVehicleOffer ?? item.isVehicleOffer,
                hasBundleArtwork: historyData.hasBundleArtwork,
                typeEnglish: historyData.typeEnglish || item.typeEnglish,
                typeLocalized: historyData.typeLocalized || item.typeLocalized,
                primaryImage: primaryImage || item.primaryImage,
                image: primaryImage || item.image,
                galleryImages:
                  authoritativeGallery.length > 0
                    ? authoritativeGallery
                    : item.galleryImages,
                includedItems:
                  authoritativeIncludedItems.length > 0
                    ? authoritativeIncludedItems
                    : item.includedItems,
                isFirstAppearance: historyData.isFirstAppearance === true,
              };
            });
          } catch {
            // Si el historial falla, la tienda continúa sin inventar etiquetas.
          }
        }

        const normalized = normalizeShopItems({ items: rawItems });

        if (typeof window !== "undefined") {
          const previousSnapshot = readSnapshot();
          const currentIds = new Set(normalized.map((item) => item.id));

          const goneNow = previousSnapshot
            .filter((item) => !currentIds.has(item.id))
            .map((item) => ({
              ...item,
              outDate: item.outDate || new Date().toISOString(),
            }));

          const mergedGone = mergeRecentlyGone(readRecentlyGone(), goneNow);
          setRecentlyGone(mergedGone);
          saveRecentlyGone(mergedGone);
          saveShopSnapshot(rawItems);
        }

        setAllItems(normalized);
      } catch (err) {
        setError(err.message || "No se pudo cargar la tienda");
      } finally {
        setLoading(false);
      }
    }

    loadShop();
  }, [language]);

  const sections = useMemo(
    () => groupItemsBySection(allItems, sectionViews).map((group) => group.id),
    [allItems, sectionViews]
  );

  const visibleItems = useMemo(
    () =>
      buildVisibleItems({
        items: allItems,
        recentlyGone,
        selectedSection,
        search,
        labels,
        sortMode,
      }),
    [allItems, recentlyGone, selectedSection, search, labels, sortMode]
  );

  const visibleGroups = useMemo(() => {
    if (selectedSection === "LEFT") {
      return [
        {
          id: "LEFT",
          title: labels.recentlyGone,
          items: visibleItems,
        },
      ].filter((group) => group.items.length > 0);
    }

    if (selectedSection === "ALL" && sortMode !== "NONE") {
      return [
        {
          id: "ALL_SORTED",
          title: labels.showAllSections.replace("Mostrar ", ""),
          items: visibleItems,
        },
      ].filter((group) => group.items.length > 0);
    }

    if (selectedSection !== "ALL" && selectedSection !== "RECENT" && selectedSection !== "NEW") {
      return [
        {
          id: selectedSection,
          title: selectedSection,
          items: visibleItems,
        },
      ].filter((group) => group.items.length > 0);
    }

    return groupItemsBySection(visibleItems, sectionViews);
  }, [visibleItems, sectionViews, selectedSection, sortMode, labels.recentlyGone, labels.showAllSections]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.qty || 0), 0),
    [cart]
  );

  function addToCart(item, openCartPanel = true) {
    setCart((prev) => {
      const existing = prev.find((entry) => entry.id === item.id);
      if (existing) {
        return prev.map((entry) =>
          entry.id === item.id ? { ...entry, qty: entry.qty + 1 } : entry
        );
      }
      return [...prev, { id: item.id, qty: 1 }];
    });

    setCartPulse(true);
    window.setTimeout(() => setCartPulse(false), 620);

    if (openCartPanel) {
      setCartOpen(true);
    }
  }

  function updateCartQty(id, qty) {
    if (qty <= 0) {
      setCart((prev) => prev.filter((entry) => entry.id !== id));
      return;
    }
    setCart((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, qty } : entry))
    );
  }


  function applySearch() {
    setSearch(searchInput.trim());
    setSearchInput("");
  }

  function handleSearchKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      applySearch();
    }
  }

  function scrollToTop() {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function scrollToBottom() {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
  }

  const titleText =
    selectedSection === "ALL"
      ? labels.featuredToday
      : selectedSection === "RECENT"
        ? labels.recent
        : selectedSection === "NEW"
          ? labels.newOnly
          : selectedSection === "LEFT"
            ? labels.recentlyGone
            : selectedSection;

  const authHref = sessionUser?.id ? "/perfil" : "/login";
  const authLabel = sessionUser?.id ? labels.myProfile : labels.login;

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(0,255,102,0.14),_transparent_20%),linear-gradient(180deg,_#000000_0%,_#021106_45%,_#000000_100%)] text-white">
      <style jsx global>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0.65; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0.65; }
        }
        .gkg-item-modal-thumbs::-webkit-scrollbar {
          height: 6px;
        }

        .gkg-item-modal-thumbs::-webkit-scrollbar-track {
          background: rgba(7, 20, 15, 0.9);
          border-radius: 999px;
        }

        .gkg-item-modal-thumbs::-webkit-scrollbar-thumb {
          background: rgba(89, 255, 189, 0.48);
          border-radius: 999px;
        }

        @media (min-width: 1024px) {
          .gkg-item-modal-box {
            width: min(92vw, 820px) !important;
            max-width: 820px !important;
            max-height: calc(100dvh - 32px) !important;
          }

          .gkg-item-modal-grid {
            grid-template-columns: minmax(0, 0.88fr) minmax(0, 1.12fr) !important;
            gap: 12px !important;
            padding: 12px !important;
          }

          .gkg-item-modal-main-image {
            height: 280px !important;
            aspect-ratio: auto !important;
          }

          .gkg-item-modal-main-image-content {
            padding: 16px !important;
            transform: scale(0.70) !important;
          }

          .gkg-item-modal-thumb {
            width: 54px !important;
            height: 54px !important;
          }

          .gkg-item-modal-info {
            gap: 12px !important;
          }
        }

        @keyframes cartPop {
          0% { transform: scale(1); }
          35% { transform: scale(1.18) rotate(-6deg); }
          65% { transform: scale(0.94) rotate(4deg); }
          100% { transform: scale(1); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.18; transform: scale(0.8); }
          35% { opacity: 0.95; transform: scale(1.25); }
          50% { opacity: 0.55; transform: scale(0.95); }
          75% { opacity: 0.9; transform: scale(1.15); }
        }
      `}</style>
      <SparkleBackground />
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-[#153321] bg-[#020905]/92 backdrop-blur-xl shadow-[0_8px_28px_rgba(0,0,0,0.38)]">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3 md:px-6">
          <Link href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <span className="shrink-0 text-[2rem] font-black italic leading-none tracking-tight text-white drop-shadow-[3px_3px_0_rgba(0,0,0,.9)] md:text-4xl">
              {labels.brand}
            </span>
            <span className="hidden text-[10px] font-black uppercase tracking-[0.28em] text-[#67ff9a] drop-shadow-[0_0_10px_rgba(103,255,154,0.42)] min-[360px]:inline sm:text-xs sm:tracking-[0.35em]">
              {language === "es-419" ? "Tienda" : "Shop"}
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-2 md:gap-3">
            <button
              type="button"
              onClick={() => handleLanguageChange(language === "es-419" ? "en" : "es-419")}
              aria-label={language === "es-419" ? "Cambiar a inglés" : "Switch to Spanish"}
              className="flex h-11 items-center gap-1.5 rounded-2xl border border-[#1eff7a]/35 bg-[#021509] px-2.5 text-xs font-black uppercase tracking-wide text-[#63ff9b] shadow-[0_0_20px_rgba(30,255,122,.12)] hover:border-[#63ff9b] sm:h-12 sm:gap-2 sm:px-4 sm:text-sm"
            >
              <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black text-white sm:text-[11px]">
                {language === "es-419" ? "ESP" : "ENG"}
              </span>
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.9"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="8.5" />
                <path d="M3.8 12h16.4" />
                <path d="M12 3.5c2.8 2.4 4.3 5.4 4.3 8.5S14.8 18.1 12 20.5" />
                <path d="M12 3.5C9.2 5.9 7.7 8.9 7.7 12S9.2 18.1 12 20.5" />
              </svg>
            </button>

            <Link
              href={authHref}
              aria-label={authLabel}
              title={authLabel}
              className="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-[#1eff7a]/35 bg-[#07140f] p-1.5 text-[#67ff9a] shadow-[0_0_18px_rgba(21,216,99,0.10)] transition hover:scale-105 hover:border-[#67ff9a] hover:bg-[#0b1f15] md:h-12 md:w-12"
            >
              <img
                src="/gankergames-profile-icon.png"
                alt={authLabel}
                className="h-full w-full object-contain"
              />
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label={labels.menu}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#1eff7a]/35 bg-[#07140f] text-[#67ff9a] shadow-[0_0_18px_rgba(21,216,99,0.10)] transition hover:border-[#67ff9a] hover:bg-[#0b1f15] md:h-12 md:w-12"
            >
              <span className="flex flex-col gap-1.5">
                <span className="block h-0.5 w-5 rounded-full bg-current" />
                <span className="block h-0.5 w-5 rounded-full bg-current" />
                <span className="block h-0.5 w-5 rounded-full bg-current" />
              </span>
            </button>
          </div>
        </div>
      </header>

      <MobileMenuDrawer
        open={mobileMenuOpen}
        labels={labels}
        cartCount={cartCount}
        authHref={authHref}
        authLabel={authLabel}
        onClose={() => setMobileMenuOpen(false)}
        onCartOpen={() => setCartOpen(true)}
      />

      <button
        type="button"
        onClick={() => setFilterModalOpen(true)}
        aria-label={labels.filterButton}
        className="fixed left-4 top-[86px] z-[61] flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#8cff9f] bg-[linear-gradient(135deg,#0d2418_0%,#0a1c12_100%)] text-[#67ff9a] shadow-[0_0_0_2px_rgba(21,255,98,0.14),0_0_24px_rgba(21,255,98,0.32),0_10px_22px_rgba(0,0,0,0.40)] transition hover:scale-105 hover:border-[#b4ffc0] hover:text-white md:left-6 md:top-[98px] md:h-14 md:w-14"
      >
        <span className="relative block h-5 w-5 md:h-6 md:w-6">
          <span className="absolute left-0 top-0 h-[2px] w-full rounded-full bg-current" />
          <span className="absolute left-0 top-[7px] h-[2px] w-[82%] rounded-full bg-current md:top-[8px]" />
          <span className="absolute left-0 top-[14px] h-[2px] w-[62%] rounded-full bg-current md:top-[16px]" />
          <span className="absolute right-0 top-[-2px] h-1.5 w-1.5 rounded-full bg-current md:h-2 md:w-2" />
          <span className="absolute right-1 top-[5px] h-1.5 w-1.5 rounded-full bg-current md:top-[6px] md:h-2 md:w-2" />
          <span className="absolute right-2 top-[12px] h-1.5 w-1.5 rounded-full bg-current md:top-[14px] md:h-2 md:w-2" />
        </span>
      </button>

      <button
        type="button"
        onClick={() => setSortModalOpen(true)}
        aria-label={labels.sortButton}
        className="fixed left-4 top-[146px] z-[61] flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#8cff9f] bg-[linear-gradient(135deg,#0d2418_0%,#0a1c12_100%)] text-[#67ff9a] shadow-[0_0_0_2px_rgba(21,255,98,0.14),0_0_24px_rgba(21,255,98,0.32),0_10px_22px_rgba(0,0,0,0.40)] transition hover:scale-105 hover:border-[#b4ffc0] hover:text-white md:left-6 md:top-[166px] md:h-14 md:w-14"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-7 w-7 md:h-8 md:w-8"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 6h7" />
          <path d="M4 12h5" />
          <path d="M4 18h3" />
          <path d="M15 19V5" />
          <path d="m11 9 4-4 4 4" />
          <path d="M21 5v14" />
          <path d="m17 15 4 4 4-4" />
        </svg>
      </button>

      {!showScrollTop && (
        <button
          type="button"
          onClick={scrollToBottom}
          aria-label="Ir al fondo"
          className="fixed bottom-24 right-5 z-[61] flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#8cff9f] bg-[linear-gradient(135deg,#0d2418_0%,#0a1c12_100%)] text-[#67ff9a] shadow-[0_0_0_2px_rgba(21,255,98,0.14),0_0_24px_rgba(21,255,98,0.32),0_10px_22px_rgba(0,0,0,0.40)] transition hover:scale-105 hover:border-[#b4ffc0] hover:text-white md:bottom-[108px] md:right-7 md:h-14 md:w-14"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5v13" />
            <path d="m6 12 6 6 6-6" />
          </svg>
        </button>
      )}

      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Volver arriba"
          className="fixed bottom-24 right-5 z-[61] flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#8cff9f] bg-[linear-gradient(135deg,#0d2418_0%,#0a1c12_100%)] text-[#67ff9a] shadow-[0_0_0_2px_rgba(21,255,98,0.14),0_0_24px_rgba(21,255,98,0.32),0_10px_22px_rgba(0,0,0,0.40)] transition hover:scale-105 hover:border-[#b4ffc0] hover:text-white md:bottom-[108px] md:right-7 md:h-14 md:w-14"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 19V6" />
            <path d="m6 12 6-6 6 6" />
          </svg>
        </button>
      )}

      <button
        type="button"
        onClick={() => setCartOpen(true)}
        className={`fixed bottom-5 right-5 z-[60] flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-[#8cff9f] bg-[linear-gradient(135deg,#16e83d_0%,#0dbb2e_48%,#07851f_100%)] text-white shadow-[0_0_0_2px_rgba(21,255,98,0.20),0_0_24px_rgba(21,255,98,0.68),0_10px_22px_rgba(0,0,0,0.46)] ring-2 ring-[#18ff63]/35 transition hover:scale-105 hover:shadow-[0_0_0_2px_rgba(21,255,98,0.28),0_0_34px_rgba(21,255,98,0.88),0_10px_22px_rgba(0,0,0,0.46)] active:scale-95 md:bottom-7 md:right-7 md:h-14 md:w-14 ${cartPulse ? "animate-[cartPop_620ms_ease-out]" : ""}` }
        aria-label={labels.cart}
      >
        <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_22%,rgba(255,255,255,0.30),rgba(255,255,255,0.08)_33%,rgba(255,255,255,0)_62%)]" />

        {cartPulse && (
          <span className="absolute right-[calc(100%+0.55rem)] top-1/2 z-20 -translate-y-1/2 whitespace-nowrap rounded-full border border-[#8cff9f] bg-[#07140f] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-[#67ff9a] shadow-[0_0_18px_rgba(21,216,99,0.35)]">
            Agregado
          </span>
        )}

        <svg
          viewBox="0 0 24 24"
          className="relative z-10 h-[58%] w-[58%] drop-shadow-[0_3px_5px_rgba(0,0,0,0.28)] md:h-[60%] md:w-[60%]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="9" cy="20" r="1.25" fill="currentColor" stroke="none" />
          <circle cx="17" cy="20" r="1.25" fill="currentColor" stroke="none" />
          <path d="M3 4h2.2l1.6 8.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.76L19 7H6.1" />
          <path d="M8 16h10" />
        </svg>

        {cartCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 z-20 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-red-600 px-1 text-[11px] font-black leading-none text-white shadow-[0_0_14px_rgba(255,0,0,0.75)] md:h-7 md:min-w-7 md:text-[12px]">
            {cartCount}
          </span>
        )}
      </button>

      <div className="mx-auto w-full max-w-[1600px] px-3 pb-4 pt-[92px] sm:px-4 md:px-6 md:pb-6 md:pt-[104px]">
        <section className="mb-5 overflow-hidden rounded-[22px] border border-[#1d4a2d] bg-[linear-gradient(120deg,_rgba(0,255,102,0.10)_0%,_rgba(5,14,8,0.96)_35%,_rgba(2,7,3,0.96)_100%)] p-3 shadow-[0_16px_45px_rgba(0,0,0,0.32)] md:rounded-[26px] md:p-4">
          <div className="rounded-[20px] border border-[#255239] bg-[#040804]/80 p-4 text-center backdrop-blur md:p-5">
            <p className="text-center text-sm font-black uppercase tracking-[0.34em] text-[#7dffae] drop-shadow-[0_0_12px_rgba(103,255,154,0.36)] md:text-base">{labels.objectsFortnite}</p>
            <p className="mt-3 text-center text-sm font-black text-white md:text-base">{labels.nextUpdate}</p>
            <p className="mt-2 text-center text-3xl font-black tracking-wider sm:text-4xl md:text-5xl">
              {timeLeft}
            </p>
            <p className="mt-2 text-center text-xs text-slate-300 md:text-sm">{labels.shopChangesAt}</p>
          </div>
        </section>

        <div className="mb-6 rounded-[24px] border border-[#1a2c21] bg-[#060b07]/95 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.25)] md:rounded-[28px] md:p-5">
          <div className="flex flex-col gap-4">
            <div className="min-w-0">
              <h2 className="text-2xl font-black uppercase italic sm:text-3xl md:text-5xl">
                {titleText}
              </h2>
            </div>

            <div className="flex w-full flex-col gap-3">
              <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex min-w-0 flex-1 items-center overflow-hidden rounded-full border border-[#284635] bg-[#0c110d] shadow-[0_0_0_1px_rgba(21,216,99,0.02)]">
                  <input
                    type="text"
                    placeholder={labels.searchPlaceholder}
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="w-full bg-transparent px-5 py-3 text-sm text-white outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={applySearch}
                    className="mr-1 rounded-full bg-[#15d863] px-4 py-2 text-sm font-black text-[#06110a] transition hover:brightness-110"
                  >
                    {labels.searchButton}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/vbucks"
                  aria-label="paVos"
                  title="paVos"
                  className="flex h-12 w-[112px] items-center justify-center overflow-hidden rounded-2xl border-2 border-[#8cff9f] bg-[linear-gradient(135deg,#0d2418_0%,#0a1c12_100%)] px-3 text-white shadow-[0_0_0_2px_rgba(21,255,98,0.14),0_0_22px_rgba(21,255,98,0.26),0_8px_18px_rgba(0,0,0,0.30)] transition hover:scale-105 hover:border-[#b4ffc0] hover:text-white"
                >
                  <span className="text-[21px] font-black leading-none tracking-[-0.04em] text-white drop-shadow-[0_2px_3px_rgba(0,0,0,.32)]">
                    PaVos
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => setTutorialPreviewOpen(true)}
                  aria-label="Abrir tutorial de compra"
                  title="Abrir tutorial de compra"
                  className="relative flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#8cff9f] bg-[linear-gradient(135deg,#0d2418_0%,#0a1c12_100%)] text-[#67ff9a] shadow-[0_0_0_2px_rgba(21,255,98,0.14),0_0_22px_rgba(21,255,98,0.26),0_8px_18px_rgba(0,0,0,0.30)] transition hover:scale-105 hover:border-[#b4ffc0] hover:text-white"
                >
                  <span className="absolute left-[calc(100%+0.32rem)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-red-300/40 bg-[linear-gradient(135deg,#ff2f2f_0%,#980000_100%)] px-1.5 py-[2px] text-[7px] font-black uppercase tracking-[0.08em] leading-none text-white shadow-[0_0_10px_rgba(255,0,0,0.30)]">
                    Tuto de compra
                  </span>
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <rect x="3" y="5" width="13" height="14" rx="3" />
                    <path d="m10 10 4 2-4 2v-4Z" fill="currentColor" stroke="none" />
                    <path d="m16 10 5-3v10l-5-3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div ref={groupsRef} />

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

        {!loading && !error && visibleItems.length === 0 && (
          <div className="rounded-2xl border border-[#1a2c21] bg-[#060b07] p-6 text-slate-300">
            {selectedSection === "LEFT" ? labels.noRecentlyGone : labels.noResults}
          </div>
        )}

        {!loading && !error && visibleGroups.length > 0 && (
          <div className="space-y-10">
            {visibleGroups.map((group) => {
              return (
                <section key={group.id} className="space-y-2.5">
                  <div className="flex items-center gap-2 px-0.5">
                    <h3 className="text-xl font-black uppercase italic leading-none text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] sm:text-2xl">
                      {group.title}
                    </h3>
                    <button
                      type="button"
                      title={language === "en" ? "Download section image" : "Descargar imagen de la sección"}
                      aria-label={language === "en" ? "Download section image" : "Descargar imagen de la sección"}
                      disabled={groupExport?.status === "loading"}
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-md hover:bg-white/10 disabled:opacity-50"
                      onClick={async () => {
                        setGroupExport({ id: group.id, status: "loading" });
                        try {
                          const png = await buildShopGroupPng(group, language);
                          setGroupExport({ id: group.id, href: URL.createObjectURL(png), status: "ready" });
                        } catch {
                          setGroupExport({ id: group.id, status: "error" });
                        }
                      }}
                    >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5 shrink-0 text-white/80"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                    </button>
                    {groupExport?.id === group.id && (
                      <span className="text-xs text-[#67ff9a]" role="status">
                        {groupExport.status === "loading" ? (language === "en" ? "Preparing PNG…" : "Preparando PNG…")
                          : groupExport.href ? (
                            <a href={groupExport.href} download={`GKG-${group.title.replace(/[^\p{L}\p{N}]+/gu, "-")}.png`} className="font-bold underline">
                              {language === "en" ? "Save PNG" : "Guardar PNG"}
                            </a>
                          ) : (language === "en" ? "Try again" : "Intenta de nuevo")}
                      </span>
                    )}
                  </div>

                  <div data-export-grid className="mx-auto grid w-full grid-cols-2 gap-1.5 sm:grid-cols-3 md:grid-cols-4 min-[1100px]:grid-cols-6 sm:gap-2">
                    {group.items.map((item) => (
                      <ShopCard
                        key={item.id}
                        item={item}
                        labels={labels}
                        language={language}
                        onOpen={openShopItem}
                        onQuickAdd={(entry) => addToCart(entry, false)}
                        groupKey={group.id}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      <TutorialPreviewModal
        open={tutorialPreviewOpen}
        onClose={() => setTutorialPreviewOpen(false)}
        onSkipClient={() => {
          try {
            window.localStorage.setItem(CLIENT_GKG_TUTORIAL_SKIP_KEY, "1");
          } catch {}

          setTutorialPreviewOpen(false);
        }}
      />

      {languageChanging && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/72 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-sm rounded-[30px] border border-[#1eff7a]/35 bg-[linear-gradient(180deg,rgba(4,18,13,0.95)_0%,rgba(4,14,11,0.92)_100%)] p-6 text-center shadow-[0_0_55px_rgba(21,216,99,0.14)]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#8cff9f]/55 bg-[radial-gradient(circle_at_30%_30%,rgba(22,232,61,0.28),rgba(6,30,18,0.95)_70%)] text-[#67ff9a] shadow-[0_0_24px_rgba(21,216,99,0.28)]">
              <svg viewBox="0 0 64 64" className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="32" cy="32" r="18" />
                <path d="M14 32h36" />
                <path d="M32 14c5 5.4 8 11.3 8 18s-3 12.6-8 18c-5-5.4-8-11.3-8-18s3-12.6 8-18Z" />
                <path d="M8 18h12v12H8Z" />
                <path d="M44 34h12v12H44Z" />
                <path d="M12 26l4-8" />
                <path d="M50 46l4-8" />
                <path d="M48 38h4" />
              </svg>
            </div>
            <p className="mt-5 text-2xl font-black italic text-white">{labels.changingLanguage}</p>
            <p className="mt-2 text-sm font-black uppercase tracking-[0.25em] text-[#67ff9a]">{labels.loadingLanguage}</p>
            <img
              src="/ganker-logo.png"
              alt="GKG"
              className="mx-auto mt-5 h-16 w-16 rounded-full border border-[#19ff72]/45 object-cover shadow-[0_0_18px_rgba(25,255,114,0.25)]"
            />
            <p className="mt-3 text-xs font-black uppercase tracking-[0.2em] text-[#ff4d4d]">
              {(nextLanguage || language) === "es-419" ? "ESP" : "EN"}
            </p>
          </div>
        </div>
      )}

      <FilterModal
        open={filterModalOpen}
        sections={sections}
        labels={labels}
        selectedSection={selectedSection}
        onSelect={setSelectedSection}
        onClose={() => setFilterModalOpen(false)}
      />

      <SortModal
        open={sortModalOpen}
        labels={labels}
        sortMode={sortMode}
        onSelect={setSortMode}
        onClose={() => setSortModalOpen(false)}
      />

      <CartDrawer
        open={cartOpen}
        labels={labels}
        language={language}
        cart={cart}
        allItems={allItems}
        onClose={() => setCartOpen(false)}
        onUpdateQty={updateCartQty}
        onRemove={(id) => setCart((prev) => prev.filter((entry) => entry.id !== id))}
        onClear={() => setCart([])}
      />

      {modalEntry && (
        <ItemModal
          item={modalEntry}
          labels={labels}
          language={language}
          onClose={() => setModalEntry(null)}
          onAddToCart={addToCart}
        />
      )}
    </main>
  );
}
