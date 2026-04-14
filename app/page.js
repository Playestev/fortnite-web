export const dynamic = "force-dynamic";

async function getShop() {
  const res = await fetch("https://fortnite-api.com/v2/shop", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("No se pudo cargar la tienda");
  }

  const json = await res.json();
  return json.data?.entries?.slice(0, 12) || [];
}

export default async function Home() {
  const items = await getShop();

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">
        <header className="mb-10">
          <h1 className="text-4xl md:text-5xl font-bold">FORTNITE SHOP</h1>
          <p className="text-slate-300 mt-3 text-lg">
            Tienda del día de Fortnite
          </p>
        </header>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item, index) => {
            const name =
              item.brItems?.[0]?.name ||
              item.bundle?.name ||
              item.devName ||
              "Artículo";

            const image =
              item.newDisplayAsset?.renderImages?.[0]?.image ||
              item.brItems?.[0]?.images?.featured ||
              item.brItems?.[0]?.images?.icon ||
              "";

            const price = item.finalPrice ?? "N/D";
            const section = item.layout?.name || "Tienda";

            return (
              <article
                key={item.offerId || item.devName || index}
                className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-lg"
              >
                {image ? (
                  <img
                    src={image}
                    alt={name}
                    className="w-full h-72 object-cover"
                  />
                ) : (
                  <div className="w-full h-72 bg-slate-800 grid place-items-center text-slate-400">
                    Sin imagen
                  </div>
                )}

                <div className="p-4">
                  <p className="text-sm text-cyan-400 mb-2">{section}</p>
                  <h2 className="text-lg font-semibold">{name}</h2>
                  <p className="text-slate-300 mt-2">{price} V-Bucks</p>
                </div>
              </article>
            );
          })}
        </section>
      </div>
    </main>
  );
}