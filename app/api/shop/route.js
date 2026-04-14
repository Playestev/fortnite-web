function getKey(item, index) {
  return item.offerId || item.devName || `item-${index}`;
}

function getName(item) {
  return (
    item.brItems?.[0]?.name ||
    item.instruments?.[0]?.name ||
    item.cars?.[0]?.name ||
    item.tracks?.[0]?.title ||
    item.bundle?.name ||
    item.devName ||
    "Item"
  );
}

function getImage(item) {
  return (
    item.newDisplayAsset?.renderImages?.[0]?.image ||
    item.brItems?.[0]?.images?.featured ||
    item.brItems?.[0]?.images?.icon ||
    item.instruments?.[0]?.images?.large ||
    item.instruments?.[0]?.images?.small ||
    item.cars?.[0]?.images?.large ||
    item.tracks?.[0]?.albumArt ||
    item.bundle?.image ||
    ""
  );
}

function getType(item) {
  return (
    item.brItems?.[0]?.type?.displayValue ||
    item.layout?.name ||
    (item.tracks ? "Jam Track" : "Fortnite")
  );
}

function getSection(item) {
  return item.layout?.name || "Shop";
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
      return Response.json(
        { error: "No se pudo obtener la tienda de Fortnite" },
        { status: 500 }
      );
    }

    const englishJson = await englishRes.json();
    const localizedJson = await localizedRes.json();

    const englishEntries = englishJson.data?.entries || [];
    const localizedEntries = localizedJson.data?.entries || [];

    const localizedMap = new Map(
      localizedEntries.map((item, index) => [getKey(item, index), item])
    );

    const items = englishEntries.map((englishItem, index) => {
      const key = getKey(englishItem, index);
      const localizedItem = localizedMap.get(key) || englishItem;

      return {
        id: key,
        nameEnglish: getName(englishItem),
        nameLocalized: getName(localizedItem),
        image: getImage(localizedItem) || getImage(englishItem),
        price: localizedItem.finalPrice ?? localizedItem.regularPrice ?? "N/D",
        sectionEnglish: getSection(englishItem),
        sectionLocalized: getSection(localizedItem),
        typeEnglish: getType(englishItem),
        typeLocalized: getType(localizedItem),
        devName: englishItem.devName || localizedItem.devName || "",
      };
    });

    return Response.json({
      language: safeLang,
      total: items.length,
      items,
    });
  } catch (error) {
    return Response.json(
      { error: "Error interno al consultar la tienda" },
      { status: 500 }
    );
  }
}