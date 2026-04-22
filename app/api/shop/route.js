function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function asDisplayText(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);

  if (typeof value === "object") {
    return (
      value.displayValue ||
      value.value ||
      value.backendValue ||
      value.text ||
      value.name ||
      value.title ||
      ""
    );
  }

  return "";
}

function uniqueStrings(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.trim()))];
}

function getKey(item, index) {
  return item?.offerId || item?.devName || `item-${index}`;
}

function getFirstCosmeticArray(item) {
  return (
    toArray(item?.brItems).length
      ? toArray(item?.brItems)
      : toArray(item?.instruments).length
        ? toArray(item?.instruments)
        : toArray(item?.cars).length
          ? toArray(item?.cars)
          : toArray(item?.tracks)
  );
}

function getName(item) {
  const brItems = toArray(item?.brItems);
  const instruments = toArray(item?.instruments);
  const cars = toArray(item?.cars);
  const tracks = toArray(item?.tracks);

  return (
    asDisplayText(brItems[0]?.name) ||
    asDisplayText(instruments[0]?.name) ||
    asDisplayText(cars[0]?.name) ||
    asDisplayText(tracks[0]?.title) ||
    asDisplayText(item?.bundle?.name) ||
    asDisplayText(item?.devName) ||
    "Item"
  );
}

function getType(item, forceBundle = false) {
  const brItems = toArray(item?.brItems);
  const instruments = toArray(item?.instruments);
  const cars = toArray(item?.cars);
  const tracks = toArray(item?.tracks);

  if (forceBundle) return "Bundle";

  return (
    asDisplayText(brItems[0]?.type?.displayValue) ||
    asDisplayText(brItems[0]?.type) ||
    asDisplayText(instruments[0]?.type?.displayValue) ||
    asDisplayText(instruments[0]?.type) ||
    asDisplayText(cars[0]?.type?.displayValue) ||
    asDisplayText(cars[0]?.type) ||
    (tracks.length ? "Jam Track" : "") ||
    asDisplayText(item?.layout?.name) ||
    "Fortnite"
  );
}

function getSection(item) {
  return asDisplayText(item?.layout?.name) || "Shop";
}

function getImage(item) {
  const renderImages = toArray(item?.newDisplayAsset?.renderImages);
  const brItems = toArray(item?.brItems);
  const instruments = toArray(item?.instruments);
  const cars = toArray(item?.cars);
  const tracks = toArray(item?.tracks);

  return (
    asDisplayText(renderImages[0]?.image) ||
    asDisplayText(brItems[0]?.images?.featured) ||
    asDisplayText(brItems[0]?.images?.large) ||
    asDisplayText(instruments[0]?.images?.large) ||
    asDisplayText(cars[0]?.images?.large) ||
    asDisplayText(tracks[0]?.albumArt) ||
    asDisplayText(item?.bundle?.image) ||
    asDisplayText(brItems[0]?.images?.icon) ||
    ""
  );
}

function getAddedDate(item) {
  const brItems = toArray(item?.brItems);
  const instruments = toArray(item?.instruments);
  const cars = toArray(item?.cars);
  const tracks = toArray(item?.tracks);

  return (
    asDisplayText(brItems[0]?.added) ||
    asDisplayText(instruments[0]?.added) ||
    asDisplayText(cars[0]?.added) ||
    asDisplayText(tracks[0]?.added) ||
    null
  );
}

function getDescription(item) {
  const brItems = toArray(item?.brItems);
  const instruments = toArray(item?.instruments);
  const cars = toArray(item?.cars);
  const tracks = toArray(item?.tracks);

  return (
    asDisplayText(brItems[0]?.description) ||
    asDisplayText(instruments[0]?.description) ||
    asDisplayText(cars[0]?.description) ||
    asDisplayText(tracks[0]?.description) ||
    asDisplayText(tracks[0]?.title) ||
    ""
  );
}

function getRarity(item) {
  const brItems = toArray(item?.brItems);
  const instruments = toArray(item?.instruments);
  const cars = toArray(item?.cars);

  return (
    asDisplayText(brItems[0]?.rarity?.displayValue) ||
    asDisplayText(brItems[0]?.rarity) ||
    asDisplayText(brItems[0]?.series?.value) ||
    asDisplayText(instruments[0]?.rarity?.displayValue) ||
    asDisplayText(instruments[0]?.rarity) ||
    asDisplayText(cars[0]?.rarity?.displayValue) ||
    asDisplayText(cars[0]?.rarity) ||
    ""
  );
}

function getSetText(item) {
  const brItems = toArray(item?.brItems);
  const instruments = toArray(item?.instruments);
  const cars = toArray(item?.cars);

  return (
    asDisplayText(brItems[0]?.set?.text) ||
    asDisplayText(brItems[0]?.set) ||
    asDisplayText(instruments[0]?.set?.text) ||
    asDisplayText(instruments[0]?.set) ||
    asDisplayText(cars[0]?.set?.text) ||
    asDisplayText(cars[0]?.set) ||
    ""
  );
}

function isLikelyLowQuality(url) {
  const text = String(url || "").toLowerCase();
  return (
    text.includes("smallicon") ||
    text.includes("small_icon") ||
    text.includes("/small") ||
    text.includes("/bean") ||
    text.includes("cosmeticvariant") ||
    text.includes("/sprays/") ||
    text.includes("/emoji/") ||
    text.includes("/emoticon/")
  );
}

function collectGalleryImages(item) {
  const images = [];

  const push = (value) => {
    const safeValue = asDisplayText(value);
    if (!safeValue) return;
    if (isLikelyLowQuality(safeValue)) return;
    images.push(safeValue);
  };

  toArray(item?.newDisplayAsset?.renderImages).forEach((render) => {
    push(render?.image);
  });

  toArray(item?.displayAssets).forEach((asset) => {
    push(asset?.url);
    push(asset?.background);
    push(asset?.full_background);
    push(asset?.image);
  });

  toArray(item?.brItems).forEach((brItem) => {
    push(brItem?.images?.featured);
    push(brItem?.images?.large);
  });

  toArray(item?.instruments).forEach((instrument) => {
    push(instrument?.images?.large);
  });

  toArray(item?.cars).forEach((car) => {
    push(car?.images?.large);
  });

  toArray(item?.tracks).forEach((track) => {
    push(track?.albumArt);
  });

  push(item?.bundle?.image);
  push(getImage(item));

  return uniqueStrings(images).slice(0, 12);
}

function collectIncludedItems(item) {
  const included = [];

  const pushIncluded = (entry) => {
    if (!entry) return;

    const name = asDisplayText(entry?.name) || asDisplayText(entry?.title);
    if (!name) return;

    const images = uniqueStrings([
      asDisplayText(entry?.images?.featured),
      asDisplayText(entry?.images?.large),
      asDisplayText(entry?.images?.icon),
      asDisplayText(entry?.albumArt),
    ]);

    included.push({
      id: asDisplayText(entry?.id) || asDisplayText(entry?.offerId) || name,
      name,
      type: asDisplayText(
        entry?.type?.displayValue ||
          entry?.type ||
          (entry?.albumArt ? "Jam Track" : "Fortnite")
      ),
      images,
      image: images[0] || "",
      description: asDisplayText(entry?.description),
      rarity: asDisplayText(
        entry?.rarity?.displayValue ||
          entry?.rarity ||
          entry?.series?.value ||
          ""
      ),
      setText: asDisplayText(entry?.set?.text || entry?.set || ""),
      addedDate: asDisplayText(entry?.added) || null,
      shopHistory: Array.isArray(entry?.shopHistory) ? entry.shopHistory : [],
    });
  };

  toArray(item?.brItems).forEach(pushIncluded);
  toArray(item?.instruments).forEach(pushIncluded);
  toArray(item?.cars).forEach(pushIncluded);
  toArray(item?.tracks).forEach(pushIncluded);

  return included;
}

function getShopHistory(item) {
  const firstPool = getFirstCosmeticArray(item);
  const first = firstPool?.[0];
  if (Array.isArray(first?.shopHistory)) return first.shopHistory;
  if (Array.isArray(item?.shopHistory)) return item.shopHistory;
  return [];
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang") || "es-419";

    const allowedLanguages = ["es-419", "en"];
    const safeLang = allowedLanguages.includes(lang) ? lang : "es-419";

    const englishUrl = "https://fortnite-api.com/v2/shop?language=en";
    const localizedUrl = `https://fortnite-api.com/v2/shop?language=${safeLang}`;

    const [englishRes, localizedRes] = await Promise.all([
      fetch(englishUrl, { cache: "no-store" }),
      fetch(localizedUrl, { cache: "no-store" }),
    ]);

    if (!englishRes.ok || !localizedRes.ok) {
      throw new Error("No se pudo obtener la tienda de Fortnite");
    }

    const englishJson = await englishRes.json();
    const localizedJson = await localizedRes.json();

    const englishEntries = toArray(englishJson?.data?.entries);
    const localizedEntries = toArray(localizedJson?.data?.entries);

    const localizedMap = new Map(localizedEntries.map((item, index) => [getKey(item, index), item]));

    const items = englishEntries.map((englishItem, index) => {
      const key = getKey(englishItem, index);
      const localizedItem = localizedMap.get(key) || englishItem;
      const includedItems = collectIncludedItems(localizedItem);
      const forceBundle = Boolean(localizedItem?.bundle) || includedItems.length > 1;

      return {
        id: key,
        nameEnglish: getName(englishItem),
        nameLocalized: getName(localizedItem),
        image: getImage(localizedItem) || getImage(englishItem),
        galleryImages: collectGalleryImages(localizedItem),
        price:
          localizedItem?.finalPrice ??
          localizedItem?.regularPrice ??
          englishItem?.finalPrice ??
          englishItem?.regularPrice ??
          "N/D",
        sectionEnglish: getSection(englishItem),
        sectionLocalized: getSection(localizedItem),
        typeEnglish: getType(englishItem, forceBundle),
        typeLocalized: getType(localizedItem, forceBundle),
        devName:
          asDisplayText(englishItem?.devName) ||
          asDisplayText(localizedItem?.devName) ||
          "",
        outDate:
          asDisplayText(localizedItem?.outDate) ||
          asDisplayText(englishItem?.outDate) ||
          null,
        inDate:
          asDisplayText(localizedItem?.inDate) ||
          asDisplayText(englishItem?.inDate) ||
          null,
        addedDate: getAddedDate(localizedItem) || getAddedDate(englishItem),
        descriptionEnglish: getDescription(englishItem),
        descriptionLocalized: getDescription(localizedItem),
        rarityEnglish: getRarity(englishItem),
        rarityLocalized: getRarity(localizedItem),
        setTextEnglish: getSetText(englishItem),
        setTextLocalized: getSetText(localizedItem),
        includedItems,
        shopHistory: getShopHistory(localizedItem),
        isBundle: forceBundle,
      };
    });

    return Response.json({
      language: safeLang,
      total: items.length,
      items,
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Error interno al consultar la tienda",
      },
      { status: 500 }
    );
  }
}