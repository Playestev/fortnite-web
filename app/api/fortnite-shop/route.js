import { NextResponse } from "next/server";

function cleanText(value = "") {
  return String(value || "").trim();
}

function collectEntries(data) {
  const entries = [];

  if (Array.isArray(data?.entries)) entries.push(...data.entries);
  if (Array.isArray(data?.shop?.entries)) entries.push(...data.shop.entries);

  for (const key of ["featured", "daily", "specialFeatured", "specialDaily"]) {
    if (Array.isArray(data?.[key]?.entries)) {
      entries.push(...data[key].entries);
    }
  }

  if (Array.isArray(data?.sections)) {
    for (const section of data.sections) {
      if (Array.isArray(section?.entries)) entries.push(...section.entries);
    }
  }

  return entries;
}

function getItemImages(item = {}, entry = {}) {
  return (
    entry?.bundle?.image ||
    entry?.newDisplayAsset?.materialInstances?.[0]?.images?.OfferImage ||
    item?.images?.icon ||
    item?.images?.featured ||
    item?.images?.smallIcon ||
    item?.images?.lego?.small ||
    ""
  );
}

function normalizeEntry(entry) {
  const items = entry?.items || entry?.brItems || entry?.instruments || [];
  const firstItem = items?.[0] || {};
  const isBundle = Boolean(entry?.bundle);

  const typeValues = items
    .map((item) =>
      [
        item?.type?.value,
        item?.type?.displayValue,
        item?.type?.backendValue,
        item?.backendType,
        ...(item?.gameplayTags || []),
      ]
        .filter(Boolean)
        .join(" ")
    )
    .filter(Boolean);

  const categories = [
    isBundle ? "bundle lote paquete" : "",
    firstItem?.type?.value,
    firstItem?.type?.displayValue,
    firstItem?.type?.backendValue,
    firstItem?.backendType,
    ...(firstItem?.gameplayTags || []),
    ...typeValues,
  ]
    .filter(Boolean)
    .map(cleanText);

  const name =
    entry?.bundle?.name ||
    entry?.displayName ||
    firstItem?.name ||
    entry?.devName ||
    "Objeto Fortnite";

  const price =
    Number(entry?.finalPrice) ||
    Number(entry?.price?.finalPrice) ||
    Number(entry?.regularPrice) ||
    Number(entry?.price?.regularPrice) ||
    0;

  const typeDisplay =
    isBundle
      ? "Lote"
      : firstItem?.type?.displayValue || firstItem?.type?.value || "Objeto";

  return {
    id: entry?.offerId || entry?.offerIdDisplay || firstItem?.id || name,
    offerId: entry?.offerId || "",
    name,
    price,
    image: getItemImages(firstItem, entry),
    isBundle,
    type: firstItem?.type?.value || "",
    typeDisplay,
    category: categories.join(" "),
    categories,
    section: entry?.section?.name || entry?.sectionId || "",
    source: "Fortnite API",
  };
}

export async function GET() {
  try {
    const endpoints = [
      "https://fortnite-api.com/v2/shop?language=es-419",
      "https://fortnite-api.com/v2/shop/br/combined?language=es-419",
    ];

    let payload = null;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          headers: {
            Accept: "application/json",
          },
          cache: "no-store",
        });

        if (!response.ok) continue;

        const result = await response.json();

        if (result?.data) {
          payload = result.data;
          break;
        }
      } catch (error) {
        continue;
      }
    }

    const entries = collectEntries(payload);
    const items = entries
      .map(normalizeEntry)
      .filter((item, index, array) => {
        if (!item.name) return false;

        const key = `${item.name}-${item.price}-${item.typeDisplay}`;
        return array.findIndex((other) => `${other.name}-${other.price}-${other.typeDisplay}` === key) === index;
      });

    return NextResponse.json({
      ok: true,
      items,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message || "No se pudo cargar la tienda.",
        items: [],
      },
      { status: 500 }
    );
  }
}
