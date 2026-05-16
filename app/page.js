"use client";

import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useMemo, useRef, useState } from "react";

const LANG_STORAGE_KEY = "gkg-lang";
const CART_STORAGE_KEY = "gkg-cart";
const SHOP_SNAPSHOT_KEY = "gkg-shop-snapshot-v2";
const SHOP_RECENT_GONE_KEY = "gkg-shop-recent-gone-v2";
const VB_TO_LOCAL_RATE = 0.09;
const AUTO_ROTATE_MS = 10000;

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
    sendWhatsApp: "Pagar por WhatsApp",
    shareLink: "Copiar enlace",
    copied: "Enlace copiado",
    itemShare: "Compartir",
    leavingSoon: "SE VA PRONTO",
    newBadge: "NUEVO",
    includes: "INCLUYE",
    setLabel: "Set",
    rarityLabel: "Rareza",
    timeLeft: "Se va en",
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
    sendWhatsApp: "Pay on WhatsApp",
    shareLink: "Copy link",
    copied: "Link copied",
    itemShare: "Share",
    leavingSoon: "LEAVING SOON",
    newBadge: "NEW",
    includes: "INCLUDES",
    setLabel: "Set",
    rarityLabel: "Rarity",
    timeLeft: "Leaves in",
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
  return String(url || "").trim().replace(/^http:/i, "https:").replace(/\?.*$/, "");
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

function extractHistory(rawHistory) {
  if (!Array.isArray(rawHistory)) return [];
  return rawHistory
    .map((entry) => ({
      inDate: entry?.inDate || entry?.date || entry?.added || "",
      outDate: entry?.outDate || entry?.until || "",
    }))
    .filter((entry) => entry.inDate || entry.outDate);
}

function getLatestInDate(item) {
  const history = extractHistory(item.shopHistory);
  const historyDates = history
    .map((entry) => entry.inDate)
    .filter(Boolean)
    .map((value) => new Date(value).getTime())
    .filter((value) => Number.isFinite(value));

  const directDates = [item.inDate, item.addedAt, item.updatedAt, item.addedDate]
    .filter(Boolean)
    .map((value) => new Date(value).getTime())
    .filter((value) => Number.isFinite(value));

  const all = [...historyDates, ...directDates];
  if (all.length === 0) return "";
  return new Date(Math.max(...all)).toISOString();
}

function getLatestOutDate(item) {
  const history = extractHistory(item.shopHistory);
  const historyDates = history
    .map((entry) => entry.outDate)
    .filter(Boolean)
    .map((value) => new Date(value).getTime())
    .filter((value) => Number.isFinite(value));

  const directDates = [item.outDate]
    .filter(Boolean)
    .map((value) => new Date(value).getTime())
    .filter((value) => Number.isFinite(value));

  const all = [...historyDates, ...directDates];
  if (all.length === 0) return "";
  return new Date(Math.max(...all)).toISOString();
}

function isWithin24Hours(dateString) {
  if (!dateString) return false;
  const diff = Math.abs(Date.now() - new Date(dateString).getTime());
  return Number.isFinite(diff) && diff <= 24 * 60 * 60 * 1000;
}

function isLeavingSoon(dateString) {
  if (!dateString) return false;
  const diff = new Date(dateString).getTime() - Date.now();
  return diff > 0 && diff <= 24 * 60 * 60 * 1000;
}

function isNewByHistory(item) {
  if (item.isNew === true) return true;
  const history = extractHistory(item.shopHistory);
  if (history.length === 0) return false;
  return history.length <= 1;
}

function isFreshNewItem(item) {
  return isNewByHistory(item) && isWithin24Hours(getLatestInDate(item));
}

function isRecentItem(item) {
  return isWithin24Hours(getLatestInDate(item));
}

function getCurrentPrice(item) {
  return Number(item?.price ?? item?.price?.finalPrice ?? item?.finalPrice ?? item?.vbucks ?? item?.priceVbucks ?? 0);
}

function getRawTypeKey(rawType, item = {}) {
  const value = [
    asText(rawType),
    asText(item.typeEnglish),
    asText(item.typeLocalized),
    asText(item.type),
    asText(item.displayType),
    asText(item.backendType),
    asText(item.backendValue),
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
    .toLowerCase();

  // Mascotas / pets. Algunas APIs las mandan como PetCarrier o con nombres localizados.
  if (
    value.includes("petcarrier") ||
    value.includes("pet carrier") ||
    value.includes("pet_carrier") ||
    value.includes("mascota") ||
    value.includes(" pet") ||
    value.includes("guauff") ||
    value.includes("llamila")
  ) {
    return "pet";
  }

  if (value.includes("bundle") || value.includes("pack") || value.includes("lot") || value.includes("lote")) return "bundle";
  if (
    value.includes("outfit") ||
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
  if (value.includes("vehicle") || value.includes("car") || value.includes("vehículo") || value.includes("vehiculo") || value.includes("carro")) return "vehicle";
  if (value.includes("instrument") || value.includes("instrumento")) return "instrument";

  return "other";
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

  // Regla GKG: si trae más de 4 objetos incluidos, se acomoda como Lote/Bundle.
  if (includedItems.length > 4) return "bundle";

  // Mascota debe ganar antes que mochila cuando la API lo mande como PetCarrier.
  if (rawKey === "pet" || includedTypeKeys.includes("pet")) return "pet";

  // Si trae un personaje/outfit, se acomoda como Skin aunque venga con mochila,
  // pico, papel tapiz, aura, emote, etc. Esto cubre personajes normales, LEGO
  // o estilos sin LEGO cuando la API los manda dentro del mismo objeto.
  if (rawKey === "outfit" || includedTypeKeys.includes("outfit")) return "outfit";

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

  // Si la API lo manda como bundle/pack, pero no trae más de 4 objetos,
  // no lo forzamos como Lote; usamos su tipo principal.
  if (rawKey === "bundle" && includedItems.length <= 4) {
    return includedTypeKeys[0] || "outfit";
  }

  return rawKey;
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
    pet: 2,
    wrap: 3,
    aura: 4,
    backpack: 5,
    pickaxe: 6,
    glider: 7,
    emote: 8,
    jamtrack: 9,
    shoe: 10,
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
  const preserveTypeRank = selectedSection !== "ALL";

  const applySearch = (list) => {
    if (!searchText) return list;
    return list.filter((item) =>
      [
        getDisplayName(item),
        asText(item.nameEnglish),
        item._section,
        getDisplayType(item, labels),
        item.devName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(searchText)
    );
  };

  if (selectedSection === "LEFT") {
    return sortItems(applySearch(recentlyGone), sortMode, true);
  }

  let filtered = [...items];

  if (selectedSection === "RECENT") filtered = filtered.filter((item) => item._isRecent);
  else if (selectedSection === "NEW") filtered = filtered.filter((item) => item._isFreshNew);
  else if (selectedSection !== "ALL") filtered = filtered.filter((item) => item._section === selectedSection);

  filtered = applySearch(filtered);
  return sortItems(filtered, sortMode, preserveTypeRank);
}

function groupItemsBySection(items) {
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

  return [...groups.values()].sort((a, b) =>
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
    ? item.displayAssets.flatMap((asset) => [
        asset?.url,
        asset?.image,
        asset?.featured,
        asset?.icon,
        asset?.full_background,
        asset?.background,
      ])
    : [];

  const imageObjectValues =
    item?.images && typeof item.images === "object" && !Array.isArray(item.images)
      ? Object.values(item.images)
      : [];

  const includeImages = getIncludedItems(item).map(
    (entry) => entry.image || entry?.images?.icon || entry?.images?.featured || entry?.images?.smallIcon
  );

  return dedupeStrings([
    item.image,
    item.featuredImage,
    item.icon,
    item.smallIcon,
    item.background,
    ...(Array.isArray(item.galleryImages) ? item.galleryImages : []),
    ...(Array.isArray(item.images) ? item.images : []),
    ...imageObjectValues,
    ...displayAssets,
    ...styleImages,
    ...variantImages,
    ...includeImages,
  ]);
}

function normalizeShopItems(payload) {
  const rawItems = Array.isArray(payload?.items)
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

  return rawItems.map((item, index) => {
    const id = item?.id || item?.mainId || item?.offerId || `${getDisplayName(item)}-${index}`;
    const includedItems = Array.isArray(item.includedItems)
      ? item.includedItems
      : Array.isArray(item.grants)
        ? item.grants
        : [];

    const normalized = {
      ...item,
      id,
      includedItems,
      price: getCurrentPrice(item),
      _section: getDisplaySection(item),
      _typeKey: getTypeKey(item.typeEnglish || item.typeLocalized || item.type, { ...item, includedItems }),
      _latestInDate: getLatestInDate(item),
      _latestOutDate: getLatestOutDate(item),
      _isRecent: isRecentItem(item),
      _isFreshNew: isFreshNewItem(item),
      _isLeavingSoon: isLeavingSoon(getLatestOutDate(item)),
      _galleryImages: getGalleryImages(item),
      isBundle: includedItems.length > 4,
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
      className={`inline-flex items-center justify-center rounded-full border border-[#74fff3]/55 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.96),rgba(183,255,244,0.86)_34%,rgba(26,184,174,0.96)_68%,rgba(5,86,96,1)_100%)] shadow-[0_0_10px_rgba(74,255,243,0.35),inset_0_0_10px_rgba(255,255,255,0.22)] ${className}`}
      aria-hidden="true"
    >
      <span className="translate-y-[0.5px] text-[0.72em] font-black leading-none text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
        V
      </span>
    </span>
  );
}

function RotatingImage({
  images,
  alt,
  className,
  style,
  smartBottomFit = false,
  smartBottomClassName = "",
  smartBottomStyle = {},
}) {
  const safeImages = Array.isArray(images) && images.length > 0 ? images : ["/ganker-logo.png"];
  const firstImage = safeImages[0];
  const [isTallImage, setIsTallImage] = useState(false);

  useEffect(() => {
    setIsTallImage(false);
  }, [firstImage]);

  return (
    <img
      src={firstImage}
      alt={alt}
      className={`${className} ${smartBottomFit && isTallImage ? smartBottomClassName : ""} transition-transform duration-300 ease-out`}
      style={smartBottomFit && isTallImage ? { ...style, ...smartBottomStyle } : style}
      loading="lazy"
      onLoad={(event) => {
        if (!smartBottomFit) return;

        const image = event.currentTarget;
        const width = image.naturalWidth || 1;
        const height = image.naturalHeight || 1;

        // Solo aplica a imágenes verticales/personajes.
        // Armas, mochilas, picos, alas y objetos horizontales se quedan igual.
        setIsTallImage(height / width >= 1.08);
      }}
      onError={(event) => {
        event.currentTarget.src = "/ganker-logo.png";
      }}
    />
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

  const details = cart
    .map((cartItem) => {
      const item = allItems.find((entry) => entry.id === cartItem.id);
      if (!item) return null;
      return { ...item, qty: cartItem.qty };
    })
    .filter(Boolean);

  const totalVbucks = details.reduce((sum, item) => sum + Number(item.price || 0) * item.qty, 0);
  const totalLocal = details.reduce((sum, item) => sum + Number(item.price || 0) * VB_TO_LOCAL_RATE * item.qty, 0);

  const shareCart = async () => {
    const ids = cart.map((item) => `${item.id}:${item.qty}`).join(",");
    const url = new URL(window.location.href);
    url.searchParams.set("cart", ids);
    await navigator.clipboard.writeText(url.toString());
    alert(labels.copied);
  };

  const sendWhatsApp = () => {
    const lines = [
      "🛒 Cotización de objetos GKG",
      "",
      ...details.flatMap((item, index) => {
        const itemVbucks = Number(item.price || 0) * item.qty;
        const itemLocal = itemVbucks * VB_TO_LOCAL_RATE;
        const imageUrl = item._galleryImages?.[0] || item.image || item.galleryImages?.[0] || "";
        return [
          `${index + 1}. ${getDisplayName(item)} x${item.qty}`,
          `   ${itemVbucks} ${labels.vbucks}`,
          `   ${language === "en" ? `$${itemLocal.toFixed(2)}` : `MX$${itemLocal.toFixed(2)}`}`,
          imageUrl ? `   Imagen: ${imageUrl}` : null,
        ].filter(Boolean);
      }),
      "",
      `Total: ${totalVbucks} ${labels.vbucks}`,
      `Total MX: ${language === "en" ? `$${totalLocal.toFixed(2)}` : `MX$${totalLocal.toFixed(2)}`}`,
      "",
      "Quiero pagar/cotizar estos objetos.",
    ];

    const text = lines.join("\n");
    const url = `https://wa.me/5216568558434?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-[130]">
      <div className="absolute inset-0 bg-black/62 backdrop-blur-[2px]" onClick={onClose} />
      <div className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-[#124633] bg-[rgba(4,18,13,0.84)] p-4 shadow-[0_0_45px_rgba(21,216,99,0.16)] backdrop-blur-xl ${isClosing ? "animate-[slideOutRight_220ms_ease-in]" : "animate-[slideInRight_220ms_ease-out]"}`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-2xl font-black">{labels.cart}</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#1a4e3a] bg-[#08140f] px-4 py-2 font-black text-white"
          >
            {labels.close}
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
          {details.length === 0 && (
            <div className="rounded-2xl border border-[#124633] bg-[#06110c] p-4 text-slate-300">
              {labels.emptyCart}
            </div>
          )}

          {details.map((item) => (
            <div key={item.id} className="rounded-2xl border border-[#124633] bg-[#06110c] p-3">
              <div className="flex gap-3">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-[#101812]">
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
                      className="h-8 w-8 rounded-lg border border-[#1a4e3a] bg-[#08140f] font-black"
                    >
                      -
                    </button>
                    <div className="min-w-[28px] text-center font-black">{item.qty}</div>
                    <button
                      type="button"
                      onClick={() => onUpdateQty(item.id, item.qty + 1)}
                      className="h-8 w-8 rounded-lg border border-[#1a4e3a] bg-[#08140f] font-black"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(item.id)}
                      className="ml-auto text-xs font-black text-red-300"
                    >
                      {labels.remove}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 shrink-0 rounded-2xl border border-[#124633] bg-[rgba(6,17,12,0.92)] p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between text-sm">
            <span>{labels.totalVbucks}</span>
            <span className="font-black">{totalVbucks} {labels.vbucks}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm">
            <span>{labels.total}</span>
            <span className="font-black">
              {language === "en" ? `$${totalLocal.toFixed(2)}` : `MX$${totalLocal.toFixed(2)}`}
            </span>
          </div>

          <div className="mt-4 grid gap-3">
            <button
              type="button"
              onClick={sendWhatsApp}
              className="rounded-2xl bg-[#15d863] px-4 py-3 text-sm font-black text-[#06110a]"
            >
              {labels.sendWhatsApp}
            </button>
            <button
              type="button"
              onClick={shareCart}
              className="rounded-2xl border border-[#1a4e3a] bg-[#08140f]/88 px-4 py-3 text-sm font-black text-white"
            >
              {labels.shareLink}
            </button>
            <button
              type="button"
              onClick={onClear}
              className="rounded-2xl border border-red-500/40 bg-red-500/12 px-4 py-3 text-sm font-black text-red-300"
            >
              {labels.remove}
            </button>
          </div>
        </div>
      </div>
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
  const isFreshNew = item._isFreshNew;
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
      className={`fixed inset-0 z-[125] overflow-y-auto bg-black/80 p-3 sm:p-6 transition-opacity duration-200 ${modalVisible ? "opacity-100" : "opacity-0"}`}
      onClick={handleModalClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className={`mx-auto w-full max-w-6xl rounded-[32px] bg-[#04120d] shadow-[0_0_60px_rgba(0,255,120,0.08)] transition-all duration-200 ${modalVisible ? "translate-y-0 scale-100 opacity-100" : "translate-y-5 scale-[0.96] opacity-0"} ${
          leavingSoon && isFreshNew
            ? "border-2 border-red-500 ring-2 ring-yellow-400/60"
            : leavingSoon
              ? "border-2 border-red-500"
              : isFreshNew
                ? "border-2 border-yellow-400"
                : "border border-[#124633]"
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#103c2c] p-5 sm:p-6">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.35em] text-[#59ffbd]">{item._section}</div>
            <h2 className="mt-2 text-4xl font-black italic leading-none text-white sm:text-5xl">
              {getDisplayName(currentDetail)}
            </h2>
            <div className="mt-2 text-lg text-slate-300">{displayType}</div>
          </div>

          <button
            type="button"
            onClick={handleModalClose}
            className="rounded-2xl border border-[#1a4e3a] bg-[#08140f] px-5 py-3 text-xl font-black text-white"
          >
            {labels.close}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
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
                className="aspect-[4/5] sm:aspect-[4/3] overflow-hidden"
                onTouchStart={handleImageTouchStart}
                onTouchEnd={handleImageTouchEnd}
              >
                <img
                  src={images[imageIndex] || "/ganker-logo.png"}
                  alt={getDisplayName(currentDetail)}
                  className="h-full w-full object-contain object-center p-10 sm:p-12 transition-all duration-500 ease-out scale-[0.72]"
                />
              </div>
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => {
                  const thumbTheme = getCardTheme(`${currentDetail._section || item._section || item.id}-${idx}`);
                  return (
                    <button
                      type="button"
                      key={`${img}-${idx}`}
                      onClick={() => setImageIndex(idx)}
                      className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border ${
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

          <div className="space-y-4">
            <div className="rounded-[28px] border border-[#154636] bg-[#07140f] p-5">
              <div className="rounded-2xl border border-[#144d38] bg-[linear-gradient(90deg,#082018,#0c2d1f)] px-5 py-4 text-center shadow-[0_0_18px_rgba(21,216,99,0.07)]">
                <div className="text-base font-black leading-none text-[#67ff9a] sm:text-lg">
                  {item.price || 0} {labels.vbucks}
                </div>
                <div className="mt-2 text-[1.55rem] font-black leading-none text-white sm:text-[1.8rem]">
                  {localPrice(language, item.price)}
                </div>
              </div>

              {item._latestOutDate && (
                <div className="mt-4 rounded-2xl border border-[#124d39] bg-[linear-gradient(180deg,#07170f_0%,#0b2217_100%)] px-4 py-3 text-center shadow-[0_0_18px_rgba(21,216,99,0.06)]">
                  <div className="text-xs font-bold uppercase tracking-[0.28em] text-[#67ff9a]">{labels.timeLeft}</div>
                  <div className="mt-1 text-xl font-black text-white sm:text-2xl">
                    {getTimeUntilDate(item._latestOutDate, language)}
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
                  onClick={() => onAddToCart(currentDetail)}
                  className="w-full rounded-2xl bg-[#19df6c] px-4 py-4 text-base font-black text-black"
                >
                  {labels.addToCart}
                </button>
              </div>
            </div>

            {includedItems.length > 0 && (
              <div className="rounded-[28px] border border-[#154636] bg-[#07140f] p-5">
                <div className="mb-4 text-base text-center font-black uppercase tracking-[0.35em] text-[#67ff9a]">
                  {labels.includes} {includedItems.length}
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
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
                        className={`rounded-2xl border p-3 text-center transition ${
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
                        <div className="mt-3 line-clamp-2 text-sm font-black uppercase leading-tight text-white">
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
  const theme = getCardTheme(groupKey || item._section || item.id);
  const displayType = getDisplayType(item, labels);
  const includedCount = Array.isArray(item.includedItems) ? item.includedItems.length : 0;
  const isLargeBundle = includedCount > 4;

  const borderClass =
    item._isLeavingSoon && item._isFreshNew
      ? "border-2 border-red-500 ring-2 ring-yellow-400/70"
      : item._isLeavingSoon
        ? "border-2 border-red-500"
        : item._isFreshNew
          ? "border-2 border-yellow-400"
          : "border border-white/10";

  if (isLargeBundle) {
    return (
      <article className="col-span-2 h-full">
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
          className="group block h-full w-full cursor-pointer text-left transition active:scale-[0.985]"
        >
          <div
            className={`relative h-full overflow-hidden rounded-[18px] shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-1 ${borderClass}`}
            style={{
              background: `linear-gradient(180deg, ${theme.middle} 0%, ${theme.top} 100%)`,
            }}
          >
            <div className="relative aspect-[2.15/1] min-h-[168px] overflow-hidden">
              <RotatingImage
                images={item._galleryImages}
                alt={getDisplayName(item)}
                className="relative z-10 h-full w-full object-contain object-center px-1 py-1 transition-transform duration-300 group-hover:scale-[1.015]"
                style={{ objectPosition: "center center" }}
              />


              <div className="absolute left-2 top-2 z-30 rounded bg-black/80 px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.16em] text-white/80 shadow-md">
                {labels.typeLabels.bundle}
              </div>

              {item._isLeavingSoon && (
                <div className="absolute left-2 top-8 z-30 rounded-full bg-red-500 px-2 py-1 text-[8px] font-black uppercase text-white shadow-lg sm:text-[10px]">
                  {labels.leavingSoon}
                </div>
              )}

              {item._isFreshNew && !item._isLeavingSoon && (
                <div className="absolute left-2 top-8 z-30 rounded-full bg-yellow-400 px-2 py-1 text-[8px] font-black uppercase text-[#231700] shadow-lg sm:text-[10px]">
                  {labels.newBadge}
                </div>
              )}

              <div className="absolute inset-x-0 bottom-0 z-30 p-2.5">
                <h2 className="line-clamp-1 text-[0.98rem] font-black leading-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.65)] sm:text-[1.1rem]">
                  {getDisplayName(item)}
                </h2>

                <div className="mt-1 flex max-w-full items-center gap-1.5 overflow-visible">
                  <VCoinIcon className="h-4 w-4 shrink-0 text-[10px]" />

                  <span className="shrink-0 text-[0.95rem] font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.55)] sm:text-[1.05rem]">
                    {item.price}
                  </span>

                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      onQuickAdd?.(item);
                    }}
                    aria-label={labels.addToCart}
                    title={labels.addToCart}
                    className="ml-0.5 inline-flex shrink-0 items-center gap-1 rounded-full border border-[#8cff9f] bg-[linear-gradient(135deg,#16e83d_0%,#0dbb2e_48%,#07851f_100%)] py-1 pl-2 pr-1 text-[8px] font-black leading-none text-white shadow-[0_0_0_1px_rgba(21,255,98,0.20),0_0_10px_rgba(21,255,98,0.40),0_4px_8px_rgba(0,0,0,0.28)] ring-1 ring-[#18ff63]/25 transition hover:scale-105 hover:brightness-110 active:scale-95 sm:text-[9px]"
                  >
                    <span className="whitespace-nowrap">{localPrice(language, item.price)}</span>
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/18 text-[12px] leading-none text-white">+</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="h-full">
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
        className="group block h-full w-full cursor-pointer text-left transition active:scale-[0.985]"
      >
        <div
          className={`relative h-full overflow-hidden rounded-[18px] shadow-[0_10px_24px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-1 ${borderClass}`}
          style={{
            background: `linear-gradient(180deg, ${theme.middle} 0%, ${theme.top} 100%)`,
          }}
        >
          <div className="relative min-h-[235px] overflow-hidden aspect-[0.88/1]">
            <div className="relative z-10 flex h-full w-full items-end justify-center px-2 pb-11 pt-2 transition-transform duration-300 group-hover:scale-[1.02]">
              <RotatingImage
                images={item._galleryImages}
                alt={getDisplayName(item)}
                className="h-full w-[88%] scale-[1.02] object-contain"
                style={{ objectPosition: "center 72%" }}
                smartBottomFit
                smartBottomClassName="!w-[84%] !scale-[1.08] translate-y-2"
                smartBottomStyle={{ objectPosition: "center bottom" }}
              />
            </div>


            {item._isLeavingSoon && (
              <div className="absolute left-2 top-2 z-30 rounded-full bg-red-500 px-2 py-1 text-[8px] font-black uppercase text-white shadow-lg sm:text-[10px]">
                {labels.leavingSoon}
              </div>
            )}

            {item._isFreshNew && !item._isLeavingSoon && (
              <div className="absolute left-2 top-2 z-30 rounded-full bg-yellow-400 px-2 py-1 text-[8px] font-black uppercase text-[#231700] shadow-lg sm:text-[10px]">
                {labels.newBadge}
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 z-30 p-2.5">
              <h2 className="line-clamp-2 text-[0.88rem] font-black leading-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.65)] sm:text-[1rem]">
                {getDisplayName(item)}
              </h2>

              <p className="mt-0.5 text-[8px] font-black uppercase tracking-wide text-white/85 drop-shadow-[0_2px_4px_rgba(0,0,0,0.65)] sm:text-[9px]">
                {displayType}
              </p>

              <div className="mt-1.5 flex max-w-full items-center gap-1.5 overflow-visible">
                <VCoinIcon className="h-4 w-4 shrink-0 text-[10px]" />

                <span className="shrink-0 text-[0.95rem] font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.55)] sm:text-[1.05rem]">
                  {item.price}
                </span>

                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onQuickAdd?.(item);
                  }}
                  aria-label={labels.addToCart}
                  title={labels.addToCart}
                  className="ml-0.5 inline-flex shrink-0 items-center gap-1 rounded-full border border-[#8cff9f] bg-[linear-gradient(135deg,#16e83d_0%,#0dbb2e_48%,#07851f_100%)] py-1 pl-2 pr-1 text-[8px] font-black leading-none text-white shadow-[0_0_0_1px_rgba(21,255,98,0.20),0_0_10px_rgba(21,255,98,0.40),0_4px_8px_rgba(0,0,0,0.28)] ring-1 ring-[#18ff63]/25 transition hover:scale-105 hover:brightness-110 active:scale-95 sm:text-[9px]"
                >
                  <span className="whitespace-nowrap">{localPrice(language, item.price)}</span>
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/18 text-[12px] leading-none text-white">+</span>
                </button>
              </div>
            </div>
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
            className="rounded-2xl border border-[#1eff7a]/35 bg-[#07140f]/86 px-4 py-3 text-sm font-black text-white shadow-[0_0_18px_rgba(21,216,99,0.10)] transition hover:border-[#67ff9a] hover:text-[#67ff9a]"
          >
            ✕
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
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [sortModalOpen, setSortModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [languageChanging, setLanguageChanging] = useState(false);
  const [nextLanguage, setNextLanguage] = useState(null);
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

        const response = await fetch(`/api/shop?lang=${language}`);
        const text = await response.text();
        const payload = text ? JSON.parse(text) : {};

        if (!response.ok) throw new Error(payload.error || "No se pudo cargar la tienda");

        const normalized = normalizeShopItems(payload);

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
          saveShopSnapshot(payload.items || []);
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
    () =>
      [...new Set(allItems.map((item) => item._section).filter(Boolean))].sort((a, b) =>
        a.localeCompare(b, language === "en" ? "en" : "es", { sensitivity: "base" })
      ),
    [allItems, language]
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

    return groupItemsBySection(visibleItems);
  }, [visibleItems, selectedSection, sortMode, labels.recentlyGone, labels.showAllSections]);

  useEffect(() => {
    if (!loading && groupsRef.current) {
      groupsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedSection, sortMode, search, loading]);

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
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(0,255,102,0.14),_transparent_20%),linear-gradient(180deg,_#000000_0%,_#021106_45%,_#000000_100%)] text-white">
      <style jsx global>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0.65; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0.65; }
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
              {language === "es-419" ? "Página" : "Web"}
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
                viewBox="0 0 64 64"
                className="h-4 w-4 sm:h-5 sm:w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="32" cy="32" r="18" />
                <path d="M14 32h36" />
                <path d="M32 14c5 5.4 8 11.3 8 18s-3 12.6-8 18c-5-5.4-8-11.3-8-18s3-12.6 8-18Z" />
                <path d="M8 18h12v12H8Z" />
                <path d="M44 34h12v12H44Z" />
              </svg>
            </button>

            <Link
              href={authHref}
              className="hidden rounded-2xl border border-cyan-300/35 bg-cyan-300/10 px-4 py-3 text-sm font-black text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.10)] transition hover:border-cyan-200 hover:bg-cyan-300/15 lg:inline-flex"
            >
              {authLabel}
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

      {showScrollTop && (
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
      )}

      {showScrollTop && (
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
      )}

      {showScrollTop && (
        <a
          href="https://youtube.com/shorts/A0SAjcySAsc?feature=share"
          target="_blank"
          rel="noreferrer"
          aria-label="Tutorial de compra"
          className="fixed left-4 top-[206px] z-[61] flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#8cff9f] bg-[linear-gradient(135deg,#0d2418_0%,#0a1c12_100%)] text-[#67ff9a] shadow-[0_0_0_2px_rgba(21,255,98,0.14),0_0_24px_rgba(21,255,98,0.32),0_10px_22px_rgba(0,0,0,0.40)] transition hover:scale-105 hover:border-[#b4ffc0] hover:text-white md:left-6 md:top-[234px] md:h-14 md:w-14"
        >
          <span className="absolute left-[calc(100%+0.32rem)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-red-300/40 bg-[linear-gradient(135deg,#ff2f2f_0%,#980000_100%)] px-1.5 py-[2px] text-[6px] font-black uppercase leading-none tracking-[0.05em] text-white shadow-[0_0_10px_rgba(255,0,0,0.30)] md:text-[7px]">
            Tuto de compra
          </span>
          <svg viewBox="0 0 24 24" className="h-6 w-6 md:h-7 md:w-7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="3" y="5" width="13" height="14" rx="3" />
            <path d="m10 10 4 2-4 2v-4Z" fill="currentColor" stroke="none" />
            <path d="m16 10 5-3v10l-5-3" />
          </svg>
        </a>
      )}

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

      <div className="mx-auto max-w-[1600px] px-4 pb-4 pt-[92px] md:px-6 md:pb-6 md:pt-[104px]">
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
                <button
                  type="button"
                  onClick={() => setFilterModalOpen(true)}
                  aria-label={labels.filterButton}
                  title={labels.filterButton}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#8cff9f] bg-[linear-gradient(135deg,#0d2418_0%,#0a1c12_100%)] text-[#67ff9a] shadow-[0_0_0_2px_rgba(21,255,98,0.14),0_0_22px_rgba(21,255,98,0.26),0_8px_18px_rgba(0,0,0,0.30)] transition hover:scale-105 hover:border-[#b4ffc0] hover:text-white"
                >
                  <span className="relative block h-5 w-5">
                    <span className="absolute left-0 top-0 h-[2px] w-5 rounded-full bg-current" />
                    <span className="absolute left-0 top-[7px] h-[2px] w-4 rounded-full bg-current" />
                    <span className="absolute left-0 top-[14px] h-[2px] w-3 rounded-full bg-current" />
                    <span className="absolute right-0 top-[-1px] h-1.5 w-1.5 rounded-full bg-current" />
                    <span className="absolute right-1 top-[6px] h-1.5 w-1.5 rounded-full bg-current" />
                    <span className="absolute right-2 top-[13px] h-1.5 w-1.5 rounded-full bg-current" />
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSortModalOpen(true)}
                  aria-label={labels.sortButton}
                  title={labels.sortButton}
                  className="flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#8cff9f] bg-[linear-gradient(135deg,#0d2418_0%,#0a1c12_100%)] text-[#67ff9a] shadow-[0_0_0_2px_rgba(21,255,98,0.14),0_0_22px_rgba(21,255,98,0.26),0_8px_18px_rgba(0,0,0,0.30)] transition hover:scale-105 hover:border-[#b4ffc0] hover:text-white"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
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

                <a
                  href="https://youtube.com/shorts/A0SAjcySAsc?feature=share"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Tutorial de compra"
                  title="Tutorial de compra"
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
                </a>
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
              const groupTheme = getCardTheme(group.id);

              return (
                <section key={group.id} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-4 w-4 rounded-full"
                      style={{
                        background: `linear-gradient(135deg, ${groupTheme.top} 0%, ${groupTheme.middle} 100%)`,
                      }}
                    />
                    <div>
                      <h3 className="text-2xl font-black uppercase italic text-white sm:text-3xl">
                        {group.title}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                    {group.items.map((item) => (
                      <ShopCard
                        key={item.id}
                        item={item}
                        labels={labels}
                        language={language}
                        onOpen={setModalEntry}
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