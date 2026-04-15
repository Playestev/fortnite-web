function toArray(value) {
  return Array.isArray(value) ? value : [];
}

function asDisplayText(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  if (typeof value === "object") {
    return value.displayValue || value.value || value.backendValue || value.text || value.name || value.title || "";
  }
  return "";
}

function uniqueStrings(values) {
  return [...new Set(values.filter((value) => typeof value === "string" && value.trim()))];
}

function getKey(item, index) { return item?.offerId || item?.devName || `item-${index}`; }
function getName(item) { const br=toArray(item?.brItems), ins=toArray(item?.instruments), cars=toArray(item?.cars), tr=toArray(item?.tracks); return asDisplayText(br[0]?.name)||asDisplayText(ins[0]?.name)||asDisplayText(cars[0]?.name)||asDisplayText(tr[0]?.title)||asDisplayText(item?.bundle?.name)||asDisplayText(item?.devName)||"Item"; }
function getType(item) { const br=toArray(item?.brItems), ins=toArray(item?.instruments), cars=toArray(item?.cars), tr=toArray(item?.tracks); return asDisplayText(br[0]?.type?.displayValue)||asDisplayText(br[0]?.type)||asDisplayText(ins[0]?.type?.displayValue)||asDisplayText(ins[0]?.type)||asDisplayText(cars[0]?.type?.displayValue)||asDisplayText(cars[0]?.type)||(tr.length?"Jam Track":"")||asDisplayText(item?.layout?.name)||"Fortnite"; }
function getSection(item) { return asDisplayText(item?.layout?.name) || "Shop"; }
function getImage(item) { const r=toArray(item?.newDisplayAsset?.renderImages), br=toArray(item?.brItems), ins=toArray(item?.instruments), cars=toArray(item?.cars), tr=toArray(item?.tracks); return asDisplayText(r[0]?.image)||asDisplayText(br[0]?.images?.featured)||asDisplayText(br[0]?.images?.icon)||asDisplayText(br[0]?.images?.smallIcon)||asDisplayText(ins[0]?.images?.large)||asDisplayText(ins[0]?.images?.small)||asDisplayText(cars[0]?.images?.large)||asDisplayText(cars[0]?.images?.small)||asDisplayText(tr[0]?.albumArt)||asDisplayText(item?.bundle?.image)||""; }
function getAddedDate(item) { const br=toArray(item?.brItems), ins=toArray(item?.instruments), cars=toArray(item?.cars), tr=toArray(item?.tracks); return asDisplayText(br[0]?.added)||asDisplayText(ins[0]?.added)||asDisplayText(cars[0]?.added)||asDisplayText(tr[0]?.added)||null; }
function getDescription(item) { const br=toArray(item?.brItems), ins=toArray(item?.instruments), cars=toArray(item?.cars), tr=toArray(item?.tracks); return asDisplayText(br[0]?.description)||asDisplayText(ins[0]?.description)||asDisplayText(cars[0]?.description)||asDisplayText(tr[0]?.description)||asDisplayText(tr[0]?.title)||""; }
function getRarity(item) { const br=toArray(item?.brItems), ins=toArray(item?.instruments), cars=toArray(item?.cars); return asDisplayText(br[0]?.rarity?.displayValue)||asDisplayText(br[0]?.rarity)||asDisplayText(br[0]?.series?.value)||asDisplayText(ins[0]?.rarity?.displayValue)||asDisplayText(ins[0]?.rarity)||asDisplayText(cars[0]?.rarity?.displayValue)||asDisplayText(cars[0]?.rarity)||""; }
function getSetText(item) { const br=toArray(item?.brItems), ins=toArray(item?.instruments), cars=toArray(item?.cars); return asDisplayText(br[0]?.set?.text)||asDisplayText(br[0]?.set)||asDisplayText(ins[0]?.set?.text)||asDisplayText(ins[0]?.set)||asDisplayText(cars[0]?.set?.text)||asDisplayText(cars[0]?.set)||""; }
function getShopHistoryCount(item) { const br=toArray(item?.brItems); const shopHistory = br[0]?.shopHistory; return Array.isArray(shopHistory) ? shopHistory.length : null; }

function collectGalleryImages(item) {
  const images = [];
  const push = (value) => { const safeValue = asDisplayText(value); if (safeValue) images.push(safeValue); };
  push(getImage(item));
  toArray(item?.newDisplayAsset?.renderImages).forEach((render) => push(render?.image));
  toArray(item?.brItems).forEach((brItem) => { push(brItem?.images?.featured); push(brItem?.images?.icon); push(brItem?.images?.smallIcon); push(brItem?.images?.large); push(brItem?.images?.bean); });
  toArray(item?.instruments).forEach((instrument) => { push(instrument?.images?.large); push(instrument?.images?.small); });
  toArray(item?.cars).forEach((car) => { push(car?.images?.large); push(car?.images?.small); });
  toArray(item?.tracks).forEach((track) => { push(track?.albumArt); });
  push(item?.bundle?.image);
  return uniqueStrings(images);
}

function collectIncludedItems(item) {
  const included = [];
  const pushIncluded = (entry) => {
    if (!entry) return;
    const name = asDisplayText(entry?.name) || asDisplayText(entry?.title);
    if (!name) return;
    const images = uniqueStrings([asDisplayText(entry?.images?.featured), asDisplayText(entry?.images?.icon), asDisplayText(entry?.images?.smallIcon), asDisplayText(entry?.images?.large), asDisplayText(entry?.images?.small), asDisplayText(entry?.images?.bean), asDisplayText(entry?.albumArt)]);
    included.push({ id: asDisplayText(entry?.id) || asDisplayText(entry?.offerId) || name, name, type: asDisplayText(entry?.type?.displayValue || entry?.type || (entry?.albumArt ? "Jam Track" : "Fortnite")), images, image: images[0] || "", description: asDisplayText(entry?.description), rarity: asDisplayText(entry?.rarity?.displayValue || entry?.rarity || entry?.series?.value || ""), setText: asDisplayText(entry?.set?.text || entry?.set || ""), addedDate: asDisplayText(entry?.added) || null });
  };
  toArray(item?.brItems).forEach(pushIncluded); toArray(item?.instruments).forEach(pushIncluded); toArray(item?.cars).forEach(pushIncluded); toArray(item?.tracks).forEach(pushIncluded);
  return included;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get("lang") || "es-419";
    const safeLang = ["es-419", "en"].includes(lang) ? lang : "es-419";
    const [englishRes, localizedRes] = await Promise.all([
      fetch("https://fortnite-api.com/v2/shop?language=en", { cache: "no-store" }),
      fetch(`https://fortnite-api.com/v2/shop?language=${safeLang}`, { cache: "no-store" }),
    ]);
    if (!englishRes.ok || !localizedRes.ok) throw new Error("No se pudo obtener la tienda de Fortnite");
    const englishJson = await englishRes.json();
    const localizedJson = await localizedRes.json();
    const englishEntries = toArray(englishJson?.data?.entries);
    const localizedEntries = toArray(localizedJson?.data?.entries);
    const localizedMap = new Map(localizedEntries.map((item, index) => [getKey(item, index), item]));

    const items = englishEntries.map((englishItem, index) => {
      const key = getKey(englishItem, index);
      const localizedItem = localizedMap.get(key) || englishItem;
      return {
        id: key,
        nameEnglish: getName(englishItem),
        nameLocalized: getName(localizedItem),
        image: getImage(localizedItem) || getImage(englishItem),
        galleryImages: collectGalleryImages(localizedItem),
        price: localizedItem?.finalPrice ?? localizedItem?.regularPrice ?? englishItem?.finalPrice ?? englishItem?.regularPrice ?? "N/D",
        sectionEnglish: getSection(englishItem),
        sectionLocalized: getSection(localizedItem),
        typeEnglish: getType(englishItem),
        typeLocalized: getType(localizedItem),
        devName: asDisplayText(englishItem?.devName) || asDisplayText(localizedItem?.devName) || "",
        outDate: asDisplayText(localizedItem?.outDate) || asDisplayText(englishItem?.outDate) || null,
        inDate: asDisplayText(localizedItem?.inDate) || asDisplayText(englishItem?.inDate) || null,
        addedDate: getAddedDate(localizedItem) || getAddedDate(englishItem),
        shopHistoryCount: getShopHistoryCount(localizedItem) ?? getShopHistoryCount(englishItem),
        descriptionEnglish: getDescription(englishItem),
        descriptionLocalized: getDescription(localizedItem),
        rarityEnglish: getRarity(englishItem),
        rarityLocalized: getRarity(localizedItem),
        setTextEnglish: getSetText(englishItem),
        setTextLocalized: getSetText(localizedItem),
        includedItems: collectIncludedItems(localizedItem),
      };
    });

    return Response.json({ language: safeLang, total: items.length, items });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Error interno al consultar la tienda" }, { status: 500 });
  }
}