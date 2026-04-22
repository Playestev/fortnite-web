"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

const LANG_STORAGE_KEY = "gkg-lang";
const CART_STORAGE_KEY = "gkg-cart";
const SHOP_SNAPSHOT_KEY = "gkg-shop-snapshot-v2";
const SHOP_RECENT_GONE_KEY = "gkg-shop-recent-gone-v2";
const VB_TO_LOCAL_RATE = 0.09;
const AUTO_ROTATE_MS = 10000;

const LABELS = {
  "es-419": {
    brand: "Ganker Games",
    brandSub: "FORTNITE SHOP",
    navShop: "Tienda",
    navNews: "Noticias",
    navSTW: "STW",
    cart: "Carrito",
    heroKicker: "GANKER GAMES",
    heroTitle: "TIENDA",
    heroDesc:
      "Explora la tienda diaria con precios en MXN, V-Bucks, filtros por sección y objetos que están por salir.",
    nextUpdate: "Próxima actualización",
    shopChangesAt: "La tienda cambia diario a las 00:00 UTC",
    searchPlaceholder: "Buscar skin, bundle, track, sección...",
    filterButton: "Filtro",
    sortButton: "Ordenar",
    all: "Todas",
    recent: "Reciente",
    newOnly: "Nuevos",
    recentlyGone: "Recién salieron",
    close: "Cerrar",
    addToCart: "Agregar al carrito",
    remove: "Quitar",
    emptyCart: "Tu carrito está vacío",
    total: "Total",
    totalVbucks: "Total V-Bucks",
    sendWhatsApp: "Enviar por WhatsApp",
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
    vbucks: "V-Bucks",
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
    typeLabels: {
      bundle: "Lote",
      outfit: "Skin",
      pickaxe: "Pico",
      backpack: "Mochila",
      glider: "Ala delta",
      emote: "Emote",
      wrap: "Envoltura",
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
    brand: "Ganker Games",
    brandSub: "FORTNITE SHOP",
    navShop: "Shop",
    navNews: "News",
    navSTW: "STW",
    cart: "Cart",
    heroKicker: "GANKER GAMES",
    heroTitle: "SHOP",
    heroDesc:
      "Browse the daily shop with local pricing, V-Bucks, section filters and items leaving soon.",
    nextUpdate: "Next update",
    shopChangesAt: "The shop refreshes daily at 00:00 UTC",
    searchPlaceholder: "Search skin, bundle, track, section...",
    filterButton: "Filter",
    sortButton: "Sort",
    all: "All",
    recent: "Recent",
    newOnly: "New",
    recentlyGone: "Recently gone",
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
    loading: "Loading shop...",
    noResults: "No results found with that filter.",
    noRecentlyGone: "No recently gone items registered yet.",
    vbucks: "V-Bucks",
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
    typeLabels: {
      bundle: "Bundle",
      outfit: "Outfit",
      pickaxe: "Pickaxe",
      backpack: "Back Bling",
      glider: "Glider",
      emote: "Emote",
      wrap: "Wrap",
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

function getRawTypeKey(rawType) {
  const value = asText(rawType).toLowerCase();

  if (value.includes("outfit") || value.includes("skin")) return "outfit";
  if (value.includes("back") || value.includes("backpack") || value.includes("mochila")) return "backpack";
  if (value.includes("pickaxe") || value.includes("harvesting") || value.includes("pico")) return "pickaxe";
  if (value.includes("glider") || value.includes("ala")) return "glider";
  if (value.includes("emote") || value.includes("gesto") || value.includes("emote")) return "emote";
  if (value.includes("jam") || value.includes("track") || value.includes("song") || value.includes("music")) return "jamtrack";
  if (value.includes("wrap")) return "wrap";
  if (value.includes("shoe") || value.includes("calzado")) return "shoe";
  if (value.includes("contrail") || value.includes("estela")) return "contrail";
  if (value.includes("loading")) return "loadingscreen";
  if (value.includes("spray") || value.includes("grafiti")) return "spray";
  if (value.includes("music")) return "music";
  if (value.includes("toy") || value.includes("juguete")) return "toy";
  if (value.includes("pet") || value.includes("mascota")) return "pet";
  if (value.includes("emoji")) return "emoji";
  if (value.includes("banner")) return "banner";
  if (value.includes("vehicle") || value.includes("car") || value.includes("vehículo") || value.includes("carro")) return "vehicle";
  if (value.includes("instrument") || value.includes("instrumento")) return "instrument";
  if (value.includes("bundle") || value.includes("pack") || value.includes("lot") || value.includes("lote")) return "bundle";

  return "other";
}

function getTypeKey(rawType, item = {}) {
  const includedItems = Array.isArray(item?.includedItems) ? item.includedItems : [];
  const includedTypeKeys = [...new Set(includedItems.map((entry) => getRawTypeKey(entry.typeEnglish || entry.typeLocalized || entry.type)).filter(Boolean))];

  if (item?.isBundle || includedItems.length >= 3) return "bundle";

  if (includedTypeKeys.length > 0) {
    const hasOutfit = includedTypeKeys.includes("outfit");
    const onlySkinSupport =
      hasOutfit &&
      includedTypeKeys.every((key) => ["outfit", "backpack", "emote"].includes(key));

    if (onlySkinSupport) return "outfit";
    if (includedTypeKeys.length >= 3) return "bundle";
    if (includedTypeKeys.length === 1) return includedTypeKeys[0];
  }

  return getRawTypeKey(rawType);
}

function getDisplayType(item, labels) {
  const key = getTypeKey(item.typeEnglish || item.typeLocalized || item.type, item);
  return labels.typeLabels[key] || labels.typeLabels.fallback;
}

function sortItems(items, sortMode) {
  const list = [...items];

  list.sort((a, b) => {
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
    return sortItems(applySearch(recentlyGone), sortMode);
  }

  let filtered = [...items];

  if (selectedSection === "RECENT") filtered = filtered.filter((item) => item._isRecent);
  else if (selectedSection === "NEW") filtered = filtered.filter((item) => item._isFreshNew);
  else if (selectedSection !== "ALL") filtered = filtered.filter((item) => item._section === selectedSection);

  filtered = applySearch(filtered);
  return sortItems(filtered, sortMode);
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
    const includedItems = Array.isArray(item.includedItems) ? item.includedItems : [];

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
      isBundle: item?.isBundle || includedItems.length > 1,
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

function RotatingImage({ images, alt, className, intervalMs = AUTO_ROTATE_MS }) {
  const safeImages = Array.isArray(images) && images.length > 0 ? images : ["/ganker-logo.png"];
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setIndex(0);
    setVisible(true);
  }, [safeImages.join("|")]);

  useEffect(() => {
    if (safeImages.length <= 1) return undefined;

    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % safeImages.length);
        setVisible(true);
      }, 260);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [safeImages, intervalMs]);

  return (
    <img
      src={safeImages[index]}
      alt={alt}
      className={`${className} transition-all duration-500 ease-out ${visible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
      loading="lazy"
      onError={(event) => {
        event.currentTarget.src = "/ganker-logo.png";
      }}
    />
  );
}

function FilterModal({ open, sections, labels, selectedSection, onSelect, onClose }) {
  if (!open) return null;

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

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-4xl rounded-[30px] border border-[#13412f] bg-[#04120d] p-5 shadow-[0_0_60px_rgba(0,255,120,0.08)] sm:p-6">
        <h3 className="text-center text-3xl font-black italic text-white sm:text-5xl">
          {labels.filterTitle}
        </h3>

        <div className="mt-6 grid max-h-[52vh] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2 xl:grid-cols-3">
          {options.map((option, index) => {
            const active = selectedSection === option.id;
            const colors = palette[index % palette.length];

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onSelect(option.id);
                  onClose();
                }}
                className={`rounded-2xl border px-4 py-4 text-left text-sm font-black uppercase tracking-wide transition ${
                  active ? "border-[#15d863] bg-[#15d863] text-[#06110a]" : colors
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
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
            className="rounded-2xl border border-[#1a4e3a] bg-[#08140f] px-4 py-4 text-sm font-black uppercase text-white"
          >
            {labels.close}
          </button>
        </div>
      </div>
    </div>
  );
}

function SortModal({ open, labels, sortMode, onSelect, onClose }) {
  if (!open) return null;

  const options = [
    { id: "FEATURED", label: labels.sortFeatured },
    { id: "RECENT", label: labels.sortRecent },
    { id: "PRICE_HIGH", label: labels.sortHighPrice },
    { id: "PRICE_LOW", label: labels.sortLowPrice },
    { id: "LEAVING_SOON", label: labels.sortLeavingSoon },
    { id: "AZ", label: labels.sortAZ },
  ];

  return (
    <div className="fixed inset-0 z-[121] flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-xl rounded-[30px] border border-[#13412f] bg-[#04120d] p-5 shadow-[0_0_60px_rgba(0,255,120,0.08)] sm:p-6">
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
              className={`rounded-2xl border px-4 py-4 text-left text-sm font-black uppercase tracking-wide transition ${
                sortMode === option.id
                  ? "border-[#15d863] bg-[#15d863] text-[#06110a]"
                  : "border-[#1a4e3a] bg-[#08140f] text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-2xl border border-[#1a4e3a] bg-[#08140f] px-4 py-4 text-sm font-black uppercase text-white"
        >
          {labels.close}
        </button>
      </div>
    </div>
  );
}

function CartDrawer({ open, labels, language, cart, allItems, onClose, onUpdateQty, onRemove, onClear }) {
  if (!open) return null;

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
    const lines = details.map((item) => `• ${getDisplayName(item)} x${item.qty} - ${item.price} ${labels.vbucks}`);
    const text = lines.join("\n");
    const url = `https://wa.me/5216568558434?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[130]">
      <div className="absolute inset-0 bg-black/75" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-full max-w-md border-l border-[#124633] bg-[#04120d] p-4">
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

        <div className="max-h-[calc(100vh-240px)] space-y-3 overflow-y-auto pr-1">
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

        <div className="mt-4 rounded-2xl border border-[#124633] bg-[#06110c] p-4">
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
              className="rounded-2xl border border-[#1a4e3a] bg-[#08140f] px-4 py-3 text-sm font-black text-white"
            >
              {labels.shareLink}
            </button>
            <button
              type="button"
              onClick={onClear}
              className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-black text-red-300"
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
    if (!Array.isArray(images) || images.length <= 1) return undefined;
    const interval = setInterval(() => {
      setImageIndex((prev) => (prev + 1) % images.length);
    }, AUTO_ROTATE_MS);
    return () => clearInterval(interval);
  }, [images]);

  if (!item) return null;

  const leavingSoon = item._isLeavingSoon;
  const isFreshNew = item._isFreshNew;
  const displayType = getDisplayType(currentDetail, labels);

  return (
    <div className="fixed inset-0 z-[125] overflow-y-auto bg-black/80 p-3 sm:p-6">
      <div
        className={`mx-auto w-full max-w-6xl rounded-[32px] bg-[#04120d] shadow-[0_0_60px_rgba(0,255,120,0.08)] ${
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
            onClick={onClose}
            className="rounded-2xl border border-[#1a4e3a] bg-[#08140f] px-5 py-3 text-xl font-black text-white"
          >
            {labels.close}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="relative overflow-hidden rounded-[28px] border border-[#124f39] bg-[linear-gradient(180deg,#11161a_0%,#141b1e_100%)]">
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                    className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/80 px-4 py-4 text-xl font-black text-white"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageIndex((prev) => (prev + 1) % images.length)}
                    className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-[#19df6c] px-4 py-4 text-xl font-black text-black"
                  >
                    ›
                  </button>
                </>
              )}

              <div className="aspect-[4/5] sm:aspect-[4/3] bg-[linear-gradient(180deg,#14181b_0%,#181d22_100%)]">
                <img
                  src={images[imageIndex] || "/ganker-logo.png"}
                  alt={getDisplayName(currentDetail)}
                  className="h-full w-full object-contain object-center p-4 transition-all duration-500 ease-out"
                />
              </div>
            </div>

            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    type="button"
                    key={`${img}-${idx}`}
                    onClick={() => setImageIndex(idx)}
                    className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border ${
                      idx === imageIndex ? "border-[#59ffbd]" : "border-[#184231]"
                    } bg-[#04120d]`}
                  >
                    <img src={img} alt={`thumb-${idx}`} className="h-full w-full object-contain object-center p-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] border border-[#154636] bg-[#07140f] p-5">
              <div className="rounded-2xl bg-[linear-gradient(90deg,#0c2f58,#0a3147)] px-5 py-4 text-[clamp(1.25rem,2.4vw,2.1rem)] font-black text-[#2ec0ff]">
                {item.price || 0} {labels.vbucks}
                <span className="ml-4 text-yellow-300">{localPrice(language, item.price)}</span>
              </div>

              {(leavingSoon || isFreshNew) && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {leavingSoon && (
                    <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-black text-white">
                      {labels.leavingSoon}
                    </span>
                  )}
                  {isFreshNew && (
                    <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-black text-[#231700]">
                      {labels.newBadge}
                    </span>
                  )}
                </div>
              )}

              {item._latestOutDate && (
                <div className="mt-4 rounded-2xl border border-[#3d3320] bg-[rgba(100,50,0,0.25)] px-4 py-4">
                  <div className="text-sm font-bold text-[#ffd27f]">{labels.timeLeft}</div>
                  <div className="mt-1 text-2xl font-black text-white">
                    {getTimeUntilDate(item._latestOutDate, language)}
                  </div>
                </div>
              )}

              {(currentDetail.descriptionLocalized || currentDetail.descriptionEnglish || currentDetail.description) && (
                <div className="mt-4 rounded-2xl border border-[#123e30] bg-[#081410] p-4 text-slate-300">
                  “{currentDetail.descriptionLocalized || currentDetail.descriptionEnglish || currentDetail.description}”
                </div>
              )}

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => onAddToCart(item)}
                  className="rounded-2xl bg-[#19df6c] px-4 py-4 text-base font-black text-black"
                >
                  {labels.addToCart}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const shareText = `${getDisplayName(item)} - ${window.location.href}`;
                    if (navigator.share) {
                      try {
                        await navigator.share({
                          title: getDisplayName(item),
                          text: shareText,
                          url: window.location.href,
                        });
                        return;
                      } catch {}
                    }
                    await navigator.clipboard.writeText(shareText);
                    alert(labels.copied);
                  }}
                  className="rounded-2xl border border-[#1c583f] bg-[#08140f] px-4 py-4 text-base font-black text-[#59ffbd]"
                >
                  {labels.itemShare}
                </button>
              </div>

              {(currentDetail.setTextLocalized || currentDetail.setTextEnglish || currentDetail.set) && (
                <div className="mt-4 text-sm text-slate-300">
                  <span className="font-black text-[#59ffbd]">{labels.setLabel}: </span>
                  {currentDetail.setTextLocalized || currentDetail.setTextEnglish || currentDetail.set}
                </div>
              )}

              {(currentDetail.rarityLocalized || currentDetail.rarityEnglish || currentDetail.rarity) && (
                <div className="mt-2 text-sm text-slate-300">
                  <span className="font-black text-[#59ffbd]">{labels.rarityLabel}: </span>
                  {currentDetail.rarityLocalized || currentDetail.rarityEnglish || currentDetail.rarity}
                </div>
              )}
            </div>

            {includedItems.length > 0 && (
              <div className="rounded-[28px] border border-[#154636] bg-[#07140f] p-5">
                <div className="mb-4 text-base font-black uppercase tracking-[0.35em] text-[#2ec0ff]">
                  {labels.includes} {includedItems.length}
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {includedItems.map((entry, index) => {
                    const active = selectedIncludedId === entry.id;
                    const entryImages = getGalleryImages(entry);
                    const entryImage = entryImages[0] || "/ganker-logo.png";

                    return (
                      <button
                        type="button"
                        key={`${entry.id || entry.name || index}`}
                        onClick={() => setSelectedIncludedId((prev) => (prev === entry.id ? "" : entry.id))}
                        className={`rounded-2xl border p-3 text-left transition ${
                          active ? "border-[#59ffbd] bg-[#0b1712]" : "border-[#154636] bg-[#08140f]"
                        }`}
                      >
                        <div className="aspect-square overflow-hidden rounded-xl bg-[#10161a]">
                          <img src={entryImage} alt={getDisplayName(entry)} className="h-full w-full object-contain object-center p-2" />
                        </div>
                        <div className="mt-3 line-clamp-2 text-sm font-black uppercase leading-tight text-white">
                          {getDisplayName(entry)}
                        </div>
                        <div className="mt-1 text-xs uppercase tracking-wide text-slate-400">
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

function ShopCard({ item, labels, language, onOpen, groupKey }) {
  const theme = getCardTheme(groupKey || item._section || item.id);
  const displayType = getDisplayType(item, labels);

  const borderClass =
    item._isLeavingSoon && item._isFreshNew
      ? "border-2 border-red-500 ring-2 ring-yellow-400/70"
      : item._isLeavingSoon
        ? "border-2 border-red-500"
        : item._isFreshNew
          ? "border-2 border-yellow-400"
          : "border border-[#1d5c3f]";

  return (
    <article className="h-full">
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="group block h-full w-full text-left"
      >
        <div
          className={`flex h-full min-h-[540px] flex-col overflow-hidden rounded-[24px] bg-[#07111f] shadow-[0_12px_30px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-1 ${borderClass}`}
        >
          <div
            className="relative aspect-[4/5] overflow-hidden"
            style={{
              background: `linear-gradient(180deg, ${theme.top} 0%, ${theme.middle} 58%, ${theme.bottom} 100%)`,
            }}
          >
            <div
              className="pointer-events-none absolute inset-x-10 bottom-10 z-0 h-24 rounded-full blur-3xl"
              style={{
                background: `radial-gradient(ellipse at center, ${withAlpha(theme.fade, 0.58)} 0%, ${withAlpha(theme.fade, 0.22)} 45%, rgba(0,0,0,0) 78%)`,
              }}
            />

            <RotatingImage
              images={item._galleryImages}
              alt={getDisplayName(item)}
              className="relative z-10 h-full w-full object-contain object-center px-5 pt-6 pb-24 transition-transform duration-300 group-hover:scale-[1.03]"
            />

            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[42%]"
              style={{
                background: `linear-gradient(to top, rgba(5,16,28,1) 0%, rgba(5,16,28,0.98) 18%, ${withAlpha(theme.fade, 0.38)} 46%, rgba(5,16,28,0.18) 78%, rgba(5,16,28,0) 100%)`,
              }}
            />

            <div
              className="pointer-events-none absolute inset-x-0 bottom-[-12px] z-20 h-24 blur-2xl"
              style={{
                background: `linear-gradient(to top, ${withAlpha(theme.fade, 0.55)} 0%, rgba(5,16,28,0.82) 58%, rgba(5,16,28,0) 100%)`,
              }}
            />

            {item._isLeavingSoon && (
              <div className="absolute left-3 top-3 z-30 rounded-full border border-white/20 bg-red-500 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-lg sm:text-xs">
                {labels.leavingSoon}
              </div>
            )}

            {item._isFreshNew && !item._isLeavingSoon && (
              <div className="absolute right-3 top-3 z-30 rounded-full border border-yellow-200 bg-yellow-400 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#231700] shadow-lg sm:text-xs">
                {labels.newBadge}
              </div>
            )}
          </div>

          <div className="flex min-h-[170px] flex-1 flex-col justify-between bg-[linear-gradient(180deg,#071426_0%,#05101c_100%)] p-4">
            <div>
              <h2 className="line-clamp-2 min-h-[56px] text-[1.06rem] font-extrabold leading-tight text-white sm:text-[1.18rem]">
                {getDisplayName(item)}
              </h2>

              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-300 sm:text-xs">
                {displayType}
              </p>
            </div>

            <div className="mt-5 flex items-end justify-between gap-3">
              <p className="text-[1.18rem] font-extrabold text-white sm:text-[1.35rem]">
                {item.price} {labels.vbucks}
              </p>

              <div className="shrink-0 rounded-full bg-[#1fe26d] px-4 py-2 text-[11px] font-extrabold text-[#06110a] shadow-lg sm:text-sm">
                {localPrice(language, item.price)}
              </div>
            </div>
          </div>
        </div>
      </button>
    </article>
  );
}

function MobileMenuDrawer({ open, labels, cartCount, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[140] md:hidden">
      <div className="absolute inset-0 bg-black/75" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-[86%] max-w-sm border-l border-[#124633] bg-[#04120d] p-4">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-lg font-black">{labels.brand}</p>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[#67ff9a]">{labels.brandSub}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#1a4e3a] bg-[#08140f] px-4 py-2 font-black text-white"
          >
            {labels.close}
          </button>
        </div>

        <div className="grid gap-3">
          <Link href="/" onClick={onClose} className="rounded-2xl bg-[#15d863] px-4 py-4 text-center text-base font-extrabold text-[#06110a]">
            {labels.navShop}
          </Link>
          <Link href="/noticias" onClick={onClose} className="rounded-2xl border border-[#284635] bg-[#0b120d] px-4 py-4 text-center text-base font-extrabold text-white">
            {labels.navNews}
          </Link>
          <Link href="/stw" onClick={onClose} className="rounded-2xl border border-[#284635] bg-[#0b120d] px-4 py-4 text-center text-base font-extrabold text-white">
            {labels.navSTW}
          </Link>
          <div className="rounded-2xl border border-[#67ff9a] bg-[#0b120d] px-4 py-4 text-center text-base font-extrabold text-[#67ff9a]">
            {labels.cart} ({cartCount})
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [language, setLanguage] = useState("es-419");
  const labels = LABELS[language];

  const [allItems, setAllItems] = useState([]);
  const [recentlyGone, setRecentlyGone] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedSection, setSelectedSection] = useState("ALL");
  const [sortMode, setSortMode] = useState("FEATURED");
  const [timeLeft, setTimeLeft] = useState("--:--:--");
  const [onlineCount, setOnlineCount] = useState(187);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [modalEntry, setModalEntry] = useState(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [sortModalOpen, setSortModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const groupsRef = useRef(null);

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
    setOnlineCount(164 + Math.floor(Math.random() * 58));
  }, []);

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
      setOnlineCount((prev) => {
        const swing = Math.random() > 0.5 ? 1 : -1;
        const next = prev + swing * (1 + Math.floor(Math.random() * 3));
        return Math.max(120, Math.min(399, next));
      });
    }, 1000);

    return () => clearInterval(interval);
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
  }, [visibleItems, selectedSection, labels.recentlyGone]);

  useEffect(() => {
    if (!loading && groupsRef.current) {
      groupsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedSection, sortMode, search, loading]);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + Number(item.qty || 0), 0),
    [cart]
  );

  function addToCart(item) {
    setCart((prev) => {
      const existing = prev.find((entry) => entry.id === item.id);
      if (existing) {
        return prev.map((entry) =>
          entry.id === item.id ? { ...entry, qty: entry.qty + 1 } : entry
        );
      }
      return [...prev, { id: item.id, qty: 1 }];
    });
    setCartOpen(true);
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

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(0,255,102,0.14),_transparent_20%),linear-gradient(180deg,_#000000_0%,_#021106_45%,_#000000_100%)] text-white">
      <header className="sticky top-0 z-50 border-b border-[#153321] bg-[#030603]/90 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src="/ganker-logo.png"
              alt="Ganker Games"
              className="h-12 w-12 shrink-0 rounded-full border border-[#19ff72]/40 object-cover shadow-[0_0_18px_rgba(25,255,114,0.25)]"
            />
            <div className="min-w-0">
              <p className="truncate text-base font-extrabold leading-none sm:text-lg">{labels.brand}</p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#67ff9a] sm:text-xs">
                {labels.brandSub}
              </p>
              <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-[#0fff8d]/35 bg-[#07140f] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#67ff9a] shadow-[0_0_18px_rgba(15,255,141,0.15)] sm:text-[11px]">
                <span className="h-2 w-2 rounded-full bg-[#15ff7a] shadow-[0_0_10px_rgba(21,255,122,0.9)]" />
                {labels.onlineNow}: {onlineCount} {labels.visitors}
              </div>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
              className="rounded-xl border border-[#284635] bg-[#0b120d] px-3 py-2 text-sm font-semibold text-white outline-none focus:border-[#67ff9a]"
            >
              <option value="es-419">ES</option>
              <option value="en">EN</option>
            </select>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="rounded-xl border border-[#67ff9a] bg-[#0b120d] px-3 py-2 text-sm font-bold text-[#67ff9a] md:hidden"
            >
              {labels.cart} ({cartCount})
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-xl border border-[#284635] bg-[#0b120d] px-3 py-2 text-sm font-bold text-white md:hidden"
            >
              {labels.menu}
            </button>

            <nav className="hidden items-center gap-2 md:flex">
              <Link href="/" className="rounded-xl bg-[#15d863] px-4 py-2 text-sm font-bold text-[#06110a]">
                {labels.navShop}
              </Link>
              <Link
                href="/noticias"
                className="rounded-xl border border-[#284635] bg-[#0b120d] px-4 py-2 text-sm font-bold text-white transition hover:border-[#67ff9a]"
              >
                {labels.navNews}
              </Link>
              <Link
                href="/stw"
                className="rounded-xl border border-[#284635] bg-[#0b120d] px-4 py-2 text-sm font-bold text-white transition hover:border-[#67ff9a]"
              >
                {labels.navSTW}
              </Link>
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="rounded-xl border border-[#67ff9a] bg-[#0b120d] px-4 py-2 text-sm font-bold text-[#67ff9a]"
              >
                {labels.cart} ({cartCount})
              </button>
            </nav>
          </div>
        </div>
      </header>

      <MobileMenuDrawer
        open={mobileMenuOpen}
        labels={labels}
        cartCount={cartCount}
        onClose={() => setMobileMenuOpen(false)}
      />

      <div className="mx-auto max-w-[1600px] px-4 py-4 md:px-6 md:py-6">
        <section className="mb-6 overflow-hidden rounded-[24px] border border-[#1d4a2d] bg-[linear-gradient(120deg,_rgba(0,255,102,0.10)_0%,_rgba(5,14,8,0.96)_35%,_rgba(2,7,3,0.96)_100%)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:rounded-[28px] md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.28em] text-[#67ff9a]">
                {labels.heroKicker}
              </p>
              <h1 className="text-3xl font-black uppercase italic sm:text-4xl md:text-6xl">
                {labels.heroTitle}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200 sm:text-base md:text-lg">
                {labels.heroDesc}
              </p>
            </div>

            <div className="rounded-2xl border border-[#255239] bg-[#040804]/80 p-4 backdrop-blur md:p-5">
              <p className="text-sm font-semibold text-[#67ff9a]">{labels.nextUpdate}</p>
              <p className="mt-2 text-2xl font-black tracking-wider sm:text-3xl md:text-4xl">
                {timeLeft}
              </p>
              <p className="mt-2 text-xs text-slate-300 sm:text-sm">{labels.shopChangesAt}</p>
            </div>
          </div>
        </section>

        <div className="mb-6 rounded-[24px] border border-[#1a2c21] bg-[#060b07]/95 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.25)] md:rounded-[28px] md:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-[#67ff9a]">
                {labels.heroKicker}
              </p>
              <h2 className="mt-2 text-2xl font-black uppercase italic sm:text-3xl md:text-5xl">
                {titleText}
              </h2>
            </div>

            <div className="flex w-full max-w-3xl flex-col gap-3 xl:items-end">
              <div className="flex w-full flex-wrap items-center gap-3 xl:justify-end">
                <div className="min-w-[260px] flex-1 xl:max-w-xl">
                  <input
                    type="text"
                    placeholder={labels.searchPlaceholder}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="w-full rounded-full border border-[#284635] bg-[#0c110d] px-5 py-3 text-sm text-white outline-none placeholder:text-slate-400 focus:border-[#67ff9a]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setSortModalOpen(true)}
                  className="rounded-xl border border-[#284635] bg-[#0d1210] px-5 py-3 text-sm font-extrabold text-white"
                >
                  {labels.sortButton}
                </button>

                <button
                  type="button"
                  onClick={() => setFilterModalOpen(true)}
                  className="rounded-xl border border-[#284635] bg-[#0d1210] px-5 py-3 text-sm font-extrabold text-white"
                >
                  {labels.filterButton}
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
                      <p className="text-[10px] font-black uppercase tracking-[0.30em] text-[#67ff9a]">
                        {labels.heroKicker}
                      </p>
                      <h3 className="text-2xl font-black uppercase italic text-white sm:text-3xl">
                        {group.title}
                      </h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    {group.items.map((item) => (
                      <ShopCard
                        key={item.id}
                        item={item}
                        labels={labels}
                        language={language}
                        onOpen={setModalEntry}
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