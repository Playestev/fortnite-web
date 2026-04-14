function getName(item) {
  return (
    item.brItems?.[0]?.name ||
    item.instruments?.[0]?.name ||
    item.cars?.[0]?.name ||
    item.tracks?.[0]?.title ||
    item.bundle?.name ||
    item.devName ||
    "Artículo"
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

export async function GET() {
  try {
    const res = await fetch("https://fortnite-api.com/v2/shop", {
      cache: "no-store",
    });

    if (!res.ok) {
      return Response.json(
        { error: "No se pudo obtener la tienda de Fortnite" },
        { status: 500 }
      );
    }

    const json = await res.json();
    const entries = json.data?.entries || [];

    const items = entries.map((item, index) => ({
      id: item.offerId || item.devName || `item-${index}`,
      name: getName(item),
      image: getImage(item),
      price: item.finalPrice ?? item.regularPrice ?? "N/D",
      section: item.layout?.name || "Tienda",
      type: getType(item),
      devName: item.devName || "",
    }));

    return Response.json({
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