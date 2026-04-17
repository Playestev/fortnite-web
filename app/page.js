"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const LANG_STORAGE_KEY = "gkg-lang";
const CART_STORAGE_KEY = "gkg-cart";
const VB_TO_LOCAL_RATE = 0.09;
const AUTO_ROTATE_MS = 5000;

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
    all: "Todas",
    recent: "Reciente",
    newOnly: "Nuevos",
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
    vbucks: "V-Bucks",
    showAllSections: "Mostrar todas las secciones",
    filterTitle: "FILTRO DE LA TIENDA",
    typeLabels: {
      bundle: "Lote",
      outfit: "Skin",
      pickaxe: "Pico",
      backpack: "Mochila retro",
      glider: "Ala delta",
      emote: "Gesto",
      wrap: "Envoltura",
      jamtrack: "Pista Jam",
      shoe: "Calzado",
      contrail: "Estela",
      loadingscreen: "Pantalla de carga",
      spray: "Grafiti",
      music: "Música",
      toy: "Juguete",
      pet: "Mascota",
      emoji: "Emoji",
      banner: "Banner",
      vehicle: "Vehículo",
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
    all: "All",
    recent: "Recent",
    newOnly: "New",
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
    vbucks: "V-Bucks",
    showAllSections: "Show all sections",
    filterTitle: "SHOP FILTER",
    typeLabels: {
      bundle: "Bundle",
      outfit: "Outfit",
      pickaxe: "Pickaxe",
      backpack: "Back Bling",
      glider: "Glider",
      emote: "Emote",
      wrap: "Wrap",
      jamtrack: "Jam Track",
      shoe: "Shoes",
      contrail: "Contrail",
      loadingscreen: "Loading Screen",
      spray: "Spray",
      music: "Music",
      toy: "Toy",
      pet: "Pet",
      emoji: "Emoji",
      banner: "Banner",
      vehicle: "Vehicle",
      instrument: "Instrument",
      fallback: "Item",
    },
  },
};

const TYPE_ORDER = {
  bundle: 0,
  outfit: 1,
  pickaxe: 2,
  backpack: 3,
  glider: 4,
  emote: 5,
  wrap: 6,
  jamtrack: 7,
  shoe: 8,
  contrail: 9,
  loadingscreen: 10,
  spray: 11,
  music: 12,
  toy: 13,
  pet: 14,
  emoji: 15,
  banner: 16,
  vehicle: 17,
  instrument: 18,
  fallback: 99,
};

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
  return String(url || "")
    .trim()
    .replace(/^http:/i, "https:")
    .replace(/\?.*$/, "");
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

function getTypeKey(rawType) {
  const value = asText(rawType).toLowerCase();

  if (!value) return "fallback";
  if (value.includes("bundle") || value.includes("pack")) return "bundle";
  if (value.includes("outfit") || value.includes("skin")) return "outfit";
  if (value.includes("pickaxe") || value.includes("harvesting")) return "pickaxe";
  if (value.includes("back") || value.includes("backpack")) return "backpack";
  if (value.includes("glider")) return "glider";
  if (value.includes("emote")) return "emote";
  if (value.includes("wrap")) return "wrap";
  if (value.includes("jam")) return "jamtrack";
  if (value.includes("shoe")) return "shoe";
  if (value.includes("contrail")) return "contrail";
  if (value.includes("loading")) return "loadingscreen";
  if (value.includes("spray")) return "spray";
  if (value.includes("music")) return "music";
  if (value.includes("toy")) return "toy";
  if (value.includes("pet")) return "pet";
  if (value.includes("emoji")) return "emoji";
  if (value.includes("banner")) return "banner";
  if (value.includes("vehicle") || value.includes("car")) return "vehicle";
  if (value.includes("instrument")) return "instrument";
  return "fallback";
}

function getCurrentPrice(item) {
  return Number(
    item?.price ??
      item?.price?.finalPrice ??
      item?.finalPrice ??
      item?.vbucks ??
      item?.priceVbucks ??
      0
  );
}

function getDisplayType(item, labels) {
  const key = getTypeKey(item.typeEnglish || item.typeLocalized || item.type);
  return labels.typeLabels[key] || labels.typeLabels.fallback;
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
  return (
    asText(item.nameLocalized) ||
    asText(item.nameEnglish) ||
    asText(item.name) ||
    "Item"
  );
}

function getSecondaryEnglishName(item, language) {
  if (language !== "es-419") return "";
  const localized = asText(item.nameLocalized);
  const english = asText(item.nameEnglish);
  if (!localized || !english) return "";
  if (localized.trim().toLowerCase() === english.trim().toLowerCase()) return "";
  return english;
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

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;
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

  const directDates = [item.inDate, item.addedAt, item.updatedAt]
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

function sortItems(items) {
  return [...items].sort((a, b) => {
    const aType = getTypeKey(a.typeEnglish || a.typeLocalized || a.type);
    const bType = getTypeKey(b.typeEnglish || b.typeLocalized || b.type);

    const orderDiff = (TYPE_ORDER[aType] ?? 99) - (TYPE_ORDER[bType] ?? 99);
    if (orderDiff !== 0) return orderDiff;

    return getDisplayName(a).localeCompare(getDisplayName(b), "es", {
      sensitivity: "base",
    });
  });
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
      getTypeKey(entry.typeEnglish || entry.typeLocalized || entry.type),
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
    (entry) =>
      entry.image ||
      entry?.images?.icon ||
      entry?.images?.featured ||
      entry?.images?.smallIcon
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
    const id =
      item?.id ||
      item?.mainId ||
      item?.offerId ||
      `${getDisplayName(item)}-${index}`;

    return {
      ...item,
      id,
      price: getCurrentPrice(item),
      _section: getDisplaySection(item),
      _typeKey: getTypeKey(item.typeEnglish || item.typeLocalized || item.type),
      _latestInDate: getLatestInDate(item),
      _latestOutDate: getLatestOutDate(item),
      _isRecent: isRecentItem(item),
      _isFreshNew: isFreshNewItem(item),
      _isLeavingSoon: isLeavingSoon(getLatestOutDate(item)),
      _galleryImages: getGalleryImages(item),
    };
  });
}

function buildGroups(items, selectedSection, search, labels) {
  let filtered = [...items];

  if (selectedSection === "RECENT") {
    filtered = filtered.filter((item) => item._isRecent);
  } else if (selectedSection === "NEW") {
    filtered = filtered.filter((item) => item._isFreshNew);
  } else if (selectedSection !== "ALL") {
    filtered = filtered.filter((item) => item._section === selectedSection);
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter((item) =>
      [
        getDisplayName(item),
        asText(item.nameEnglish),
        item._section,
        getDisplayType(item, labels),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }

  if (selectedSection === "ALL") {
    const groups = {};
    filtered.forEach((item) => {
      if (!groups[item._section]) groups[item._section] = [];
      groups[item._section].push(item);
    });

    return Object.entries(groups)
      .map(([sectionName, entries]) => ({
        sectionName,
        items: sortItems(entries),
      }))
      .sort((a, b) => a.sectionName.localeCompare(b.sectionName, "es", { sensitivity: "base" }));
  }

  const title =
    selectedSection === "RECENT"
      ? labels.recent
      : selectedSection === "NEW"
      ? labels.newOnly
      : selectedSection;

  return [{ sectionName: title, items: sortItems(filtered) }];
}

function RotatingImage({ images, alt, className, intervalMs = AUTO_ROTATE_MS }) {
  const safeImages = Array.isArray(images) && images.length > 0 ? images : ["/ganker-logo.png"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [safeImages.join("|")]);

  useEffect(() => {
    if (safeImages.length <= 1) return undefined;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % safeImages.length);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [safeImages, intervalMs]);

  return (
    <img
      src={safeImages[index]}
      alt={alt}
      className={className}
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

function CartDrawer({
  open,
  labels,
  language,
  cart,
  allItems,
  onClose,
  onUpdateQty,
  onRemove,
  onClear,
}) {
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
                  <div className="line-clamp-2 text-sm font-black text-white">
                    {getDisplayName(item)}
                  </div>
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
            <span className="font-black">{language === "en" ? `$${totalLocal.toFixed(2)}` : `MX$${totalLocal.toFixed(2)}`}</span>
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
            <div className="text-xs font-black uppercase tracking-[0.35em] text-[#59ffbd]">
              {item._section}
            </div>
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
                <RotatingImage
                  images={images}
                  alt={getDisplayName(currentDetail)}
                  className="h-full w-full object-contain object-center p-4"
                  intervalMs={AUTO_ROTATE_MS}
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
                    <img
                      src={img}
                      alt={`thumb-${idx}`}
                      className="h-full w-full object-contain object-center p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-[28px] border border-[#154636] bg-[#07140f] p-5">
              <div className="rounded-2xl bg-[linear-gradient(90deg,#073457,#0a3147)] px-5 py-4 text-[clamp(1.25rem,2.4vw,2.1rem)] font-black text-[#2ec0ff]">
                {item.price || 0} {labels.vbucks}
                <span className="ml-4 text-yellow-300">
                  {localPrice(language, item.price)}
                </span>
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
                          <img
                            src={entryImage}
                            alt={getDisplayName(entry)}
                            className="h-full w-full object-contain object-center p-2"
                          />
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

function ShopCard({ item, labels, language, onOpen, onAddToCart }) {
  return (
    <article>
      <div
        className={`overflow-hidden rounded-[22px] bg-[#0d1210] shadow-[0_10px_30px_rgba(0,0,0,0.28)] transition duration-200 hover:-translate-y-1 ${
          item._isLeavingSoon && item._isFreshNew
            ? "border-2 border-red-500 ring-2 ring-yellow-400/60"
            : item._isLeavingSoon
            ? "border-2 border-red-500 ring-2 ring-red-500/30"
            : item._isFreshNew
            ? "border-2 border-yellow-400 ring-2 ring-yellow-400/30"
            : "border border-[#1f3a2b]"
        }`}
      >
        <div className="relative">
          <button type="button" onClick={() => onOpen(item)} className="block w-full">
            <div className="relative flex h-48 w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(0,255,87,0.18),_transparent_45%),linear-gradient(180deg,_#060706_0%,_#0b120d_100%)] p-3 sm:h-64">
              <RotatingImage
                images={item._galleryImages}
                alt={getDisplayName(item)}
                className="max-h-full max-w-full object-contain object-center"
              />
            </div>
          </button>

          {item._isLeavingSoon && (
            <div className="absolute left-3 top-3 rounded-full border border-red-300 bg-red-500 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white shadow-lg sm:text-xs">
              {labels.leavingSoon}
            </div>
          )}

          {item._isFreshNew && (
            <div className="absolute right-3 top-3 rounded-full border border-yellow-200 bg-yellow-400 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-[#231700] shadow-lg sm:text-xs">
              {labels.newBadge}
            </div>
          )}
        </div>

        <div className="p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#67ff9a] sm:text-sm">
            {item._section}
          </p>

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h2 className="line-clamp-2 text-base font-extrabold leading-tight text-white sm:text-lg">
                {getDisplayName(item)}
              </h2>
              {getSecondaryEnglishName(item, language) && (
                <p className="mt-1 text-[11px] italic text-slate-400 sm:text-xs">
                  {getSecondaryEnglishName(item, language)}
                </p>
              )}
            </div>

            <div className="shrink-0 rounded-full border border-[#88ffae] bg-[#15d863] px-3 py-1 text-xs font-extrabold text-[#06110a] shadow-lg sm:text-sm">
              {localPrice(language, item.price)}
            </div>
          </div>

          <p className="mt-2 text-xs text-slate-300 sm:text-sm">
            {getDisplayType(item, labels)}
          </p>

          <p className="mt-3 text-sm font-extrabold text-white sm:text-base">
            {item.price} {labels.vbucks}
          </p>

          {item._latestOutDate && (
            <div
              className={`mt-3 rounded-xl px-3 py-2 ${
                item._isLeavingSoon
                  ? "border border-red-500/50 bg-red-500/10"
                  : "border border-[#28392f] bg-[#07100a]"
              }`}
            >
              <p className="text-[11px] text-slate-400 sm:text-xs">{labels.timeLeft}</p>
              <p className={`text-sm font-bold ${item._isLeavingSoon ? "text-red-300" : "text-[#8dffb3]"}`}>
                {getTimeUntilDate(item._latestOutDate, language)}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => onAddToCart(item)}
            className="mt-4 w-full rounded-xl bg-[#15d863] px-4 py-3 text-sm font-extrabold text-[#06110a] transition hover:bg-[#2cff7a]"
          >
            {labels.addToCart}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  const [language, setLanguage] = useState("es-419");
  const labels = LABELS[language];

  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedSection, setSelectedSection] = useState("ALL");
  const [timeLeft, setTimeLeft] = useState(getCountdownToNextShopUpdate());
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [modalEntry, setModalEntry] = useState(null);
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedLang = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (savedLang === "es-419" || savedLang === "en") {
      setLanguage(savedLang);
    }

    const savedCart = window.localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) setCart(parsed);
      } catch {}
    }
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

        if (!response.ok) {
          throw new Error(payload.error || "No se pudo cargar la tienda");
        }

        setAllItems(normalizeShopItems(payload));
      } catch (err) {
        setError(err.message || "No se pudo cargar la tienda");
      } finally {
        setLoading(false);
      }
    }

    loadShop();
  }, [language]);

  const sections = useMemo(() => {
    return [...new Set(allItems.map((item) => item._section).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, language === "en" ? "en" : "es", { sensitivity: "base" })
    );
  }, [allItems, language]);

  const groupedItems = useMemo(() => {
    return buildGroups(allItems, selectedSection, search, labels);
  }, [allItems, labels, search, selectedSection]);

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
              <p className="truncate text-base font-extrabold leading-none sm:text-lg">
                {labels.brand}
              </p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#67ff9a] sm:text-xs">
                {labels.brandSub}
              </p>
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

            <nav className="hidden items-center gap-2 md:flex">
              <Link href="/" className="rounded-xl bg-[#15d863] px-4 py-2 text-sm font-bold text-[#06110a]">
                {labels.navShop}
              </Link>
              <Link href="/noticias" className="rounded-xl border border-[#284635] bg-[#0b120d] px-4 py-2 text-sm font-bold text-white transition hover:border-[#67ff9a]">
                {labels.navNews}
              </Link>
              <Link href="/stw" className="rounded-xl border border-[#284635] bg-[#0b120d] px-4 py-2 text-sm font-bold text-white transition hover:border-[#67ff9a]">
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

      <div className="mx-auto max-w-[1600px] px-4 py-4 md:px-6 md:py-6">
        <div className="mb-5 grid grid-cols-3 gap-3 md:hidden">
          <Link href="/" className="rounded-xl bg-[#15d863] px-4 py-3 text-center text-sm font-extrabold text-[#06110a]">
            {labels.navShop}
          </Link>
          <Link href="/noticias" className="rounded-xl border border-[#284635] bg-[#0b120d] px-4 py-3 text-center text-sm font-extrabold text-white">
            {labels.navNews}
          </Link>
          <Link href="/stw" className="rounded-xl border border-[#284635] bg-[#0b120d] px-4 py-3 text-center text-sm font-extrabold text-white">
            {labels.navSTW}
          </Link>
        </div>

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
              <p className="text-sm font-semibold text-[#67ff9a]">
                {labels.nextUpdate}
              </p>
              <p className="mt-2 text-2xl font-black tracking-wider sm:text-3xl md:text-4xl">
                {timeLeft}
              </p>
              <p className="mt-2 text-xs text-slate-300 sm:text-sm">
                {labels.shopChangesAt}
              </p>
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
                {selectedSection === "ALL"
                  ? language === "en"
                    ? "TOP PICKS FOR TODAY"
                    : "LO MÁS DESTACADO DE HOY"
                  : selectedSection === "RECENT"
                  ? labels.recent
                  : selectedSection === "NEW"
                  ? labels.newOnly
                  : selectedSection}
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
                  onClick={() => setFilterModalOpen(true)}
                  className="rounded-xl border border-[#284635] bg-[#0d1210] px-5 py-3 text-sm font-extrabold text-white"
                >
                  {labels.filterButton}
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

        {!loading && !error && groupedItems.length === 0 && (
          <div className="rounded-2xl border border-[#1a2c21] bg-[#060b07] p-6 text-slate-300">
            {labels.noResults}
          </div>
        )}

        {!loading && !error && groupedItems.length > 0 && (
          <div className="space-y-8">
            {groupedItems.map((group) => (
              <section key={group.sectionName}>
                <h3 className="mb-4 text-xl font-black uppercase italic text-[#67ff9a] sm:text-2xl">
                  {group.sectionName}
                </h3>

                <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                  {group.items.map((item) => (
                    <ShopCard
                      key={item.id}
                      item={item}
                      labels={labels}
                      language={language}
                      onOpen={setModalEntry}
                      onAddToCart={addToCart}
                    />
                  ))}
                </div>
              </section>
            ))}
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