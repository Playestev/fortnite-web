import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FORTNITE_SHOP_API = "https://fortnite-api.com/v2/shop";
const COSMETIC_GROUPS = [
  "brItems",
  "sidekicks",
  "sidekickItems",
  "tracks",
  "cars",
  "instruments",
  "legoKits",
  "beans",
];

function toShopDay(value) {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return "";
  return new Date(timestamp).toISOString().slice(0, 10);
}

function getUniqueHistoryDays(item) {
  if (!Array.isArray(item?.shopHistory)) return [];

  return [
    ...new Set(item.shopHistory.map(toShopDay).filter(Boolean)),
  ].sort();
}

function getEntryCosmetics(entry) {
  return COSMETIC_GROUPS.flatMap((key) =>
    Array.isArray(entry?.[key]) ? entry[key] : []
  );
}

function normalizeImageUrl(value) {
  if (typeof value !== "string") return "";
  const url = value.trim();
  if (!url) return "";
  if (url.startsWith("//")) return `https:${url}`;
  return url.replace(/^http:/i, "https:");
}

function uniqueImages(values) {
  const seen = new Set();

  return values.reduce((images, rawValue) => {
    const image = normalizeImageUrl(rawValue);
    if (!image || seen.has(image)) return images;
    seen.add(image);
    images.push(image);
    return images;
  }, []);
}

function getCosmeticImages(cosmetic) {
  return uniqueImages([
    cosmetic?.images?.featured,
    cosmetic?.images?.icon,
    cosmetic?.images?.smallIcon,
  ]);
}

function getOfferPresentation(entry, language) {
  const cosmetics = getEntryCosmetics(entry);
  const primaryCosmetic = cosmetics.find((cosmetic) =>
    /outfit|athenacharacter/i.test(cosmetic?.type?.value || cosmetic?.type?.backendValue || "")
  ) || cosmetics[0] || null;
  const typeFor = (cosmetic) => {
    const type = cosmetic?.type || {};
    if ([...(entry.sidekicks || []), ...(entry.sidekickItems || [])].includes(cosmetic)) return "sidekick";
    return type.value || type.backendValue || type.displayValue || "";
  };
  const sameOutfitName = entry?.bundle?.name && primaryCosmetic?.name &&
    entry.bundle.name.trim().toLowerCase() === primaryCosmetic.name.trim().toLowerCase();
  const outfitWithIncludedBackpack = sameOutfitName &&
    /outfit|athenacharacter/i.test(typeFor(primaryCosmetic)) &&
    cosmetics.every((cosmetic) => cosmetic === primaryCosmetic ||
      /backpack|back.?bling/i.test(typeFor(cosmetic)));
  const hasMultipleOutfits = new Set(cosmetics.filter((cosmetic) =>
    /outfit|athenacharacter/i.test(typeFor(cosmetic))
  ).map((cosmetic) => cosmetic.id || cosmetic.name).filter(Boolean)).size > 1;
  const bundleAsset = /bundle/i.test(entry?.newDisplayAsset?.id || entry?.newDisplayAssetPath || "");
  const isBundle = bundleAsset || (Boolean(entry?.bundle) && !outfitWithIncludedBackpack) || hasMultipleOutfits;
  const isVehicleOffer = Array.isArray(entry.cars) && entry.cars.length > 0 &&
    !cosmetics.some((cosmetic) => /outfit|athenacharacter/i.test(typeFor(cosmetic)));
  const renderImages = Array.isArray(entry?.newDisplayAsset?.renderImages)
    ? entry.newDisplayAsset.renderImages
    : [];

  // Cuando una skin tiene estilos para LEGO/Fall Guys, Fortnite-API puede
  // colocar Product.Juno antes que Product.BR. La tienda debe enseñar el
  // render Battle Royale, no una variante LEGO elegida por el orden del array.
  const battleRoyaleRenders = renderImages
    .filter((render) => render?.productTag === "Product.BR")
    .map((render) => render?.image);
  const nonJunoRenders = renderImages
    .filter((render) => {
      const tag = String(render?.productTag || "").toLowerCase();
      return tag !== "product.juno" && tag !== "product.bean";
    })
    .map((render) => render?.image);
  const fallbackRenders = renderImages.map((render) => render?.image);

  const cosmeticImages = cosmetics.flatMap(getCosmeticImages);
  const mainCosmeticImages = getCosmeticImages(primaryCosmetic);
  const safeRenders = Array.isArray(entry?.brItems) && entry.brItems.length > 0
    ? battleRoyaleRenders
    : nonJunoRenders.length > 0
      ? nonJunoRenders
      : fallbackRenders;

  // The asset ID classifies the offer, but its renders can depict only one
  // included skin. Only explicit bundle artwork disables the composition.
  const bundleArtwork = isBundle ? uniqueImages([entry.bundle?.image]) : [];
  const galleryImages = uniqueImages([
    ...bundleArtwork,
    ...(isBundle ? [] : safeRenders),
    ...mainCosmeticImages,
    ...cosmeticImages,
  ]);

  const primaryType = primaryCosmetic?.type || {};
  const includedItems = cosmetics.map((cosmetic) => {
    const images = getCosmeticImages(cosmetic);
    const type = cosmetic?.type || {};

    return {
      id: cosmetic?.id || "",
      nameLocalized: cosmetic?.name || "",
      typeEnglish: typeFor(cosmetic),
      typeLocalized: type?.displayValue || type?.value || "",
      image: images[0] || "",
      galleryImages: images,
    };
  });

  return {
    isBundle,
    hasBundleArtwork: bundleArtwork.length > 0,
    isVehicleOffer,
    offerName:
      entry?.bundle?.name || (isBundle ? "" : primaryCosmetic?.name) || "",
    typeEnglish: isVehicleOffer ? "vehicle" : isBundle
      ? "bundle"
      : typeFor(primaryCosmetic),
    typeLocalized: isVehicleOffer ? (language === "en" ? "Car" : "Carro") : isBundle
      ? language === "en"
        ? "Bundle"
        : "Lote"
      : primaryType?.displayValue || primaryType?.value || "",
    primaryImage: galleryImages[0] || "",
    galleryImages,
    includedItems,
  };
}

function isFirstShopAppearance(entry) {
  const currentShopDay = toShopDay(entry?.inDate);
  const cosmetics = getEntryCosmetics(entry);

  if (!currentShopDay || cosmetics.length === 0) return false;

  // Una oferta es NUEVA solo cuando cada cosmético que incluye tiene una
  // única aparición histórica y esa aparición corresponde a su entrada actual.
  return cosmetics.every((cosmetic) => {
    const historyDays = getUniqueHistoryDays(cosmetic);
    return historyDays.length === 1 && historyDays[0] === currentShopDay;
  });
}

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const requestedLanguage = requestUrl.searchParams.get("lang");
  const language = requestedLanguage === "en" ? "en" : "es-419";
  const upstreamUrl = new URL(FORTNITE_SHOP_API);

  upstreamUrl.searchParams.set("language", language);
  // 4 = INCLUDE_SHOP_HISTORY. Sin esta bandera la API devuelve [] para todos.
  upstreamUrl.searchParams.set("responseFlags", "4");

  try {
    const response = await fetch(upstreamUrl, {
      cache: "force-cache",
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(20000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "No se pudo consultar el historial de la tienda." },
        { status: 502, headers: { "Cache-Control": "no-store" } }
      );
    }

    const payload = await response.json();
    const entries = Array.isArray(payload?.data?.entries)
      ? payload.data.entries
      : [];

    const items = entries
      .map((entry) => ({
        id: entry?.offerId || "",
        offerId: entry?.offerId || "",
        isFirstAppearance: isFirstShopAppearance(entry),
        ...getOfferPresentation(entry, language),
      }))
      .filter((item) => item.id);

    return NextResponse.json(
      { items, hasOfferIndex: items.length > 0 },
      {
        status: 200,
        headers: {
          "Cache-Control":
            "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
          "CDN-Cache-Control":
            "public, max-age=300, stale-while-revalidate=600",
          "Vercel-CDN-Cache-Control":
            "public, max-age=300, stale-while-revalidate=600",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "No se pudo conectar con el historial de Fortnite-API." },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}
