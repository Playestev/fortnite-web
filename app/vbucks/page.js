"use client";

import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { useEffect, useMemo, useState } from "react";

const LANG_STORAGE_KEY = "gkg-lang";
const VBUCKS_CART_KEY = "gkg-vbucks-cart";
const GKG_WHATSAPP_NUMBER = "5216568558434";

const PACKS = [
  {
    id: "vbucks-800",
    amount: 800,
    price: 110,
    title: "800 paVos",
    gradient: "from-[#00f5a0] via-[#00d9f5] to-[#035970]",
    glow: "rgba(34,211,238,.35)",
  },
  {
    id: "vbucks-2400",
    amount: 2400,
    price: 280,
    title: "2,400 paVos",
    gradient: "from-[#15d863] via-[#00c8ff] to-[#1434a4]",
    glow: "rgba(21,216,99,.35)",
  },
  {
    id: "vbucks-4500",
    amount: 4500,
    price: 450,
    title: "4,500 paVos",
    gradient: "from-[#c026d3] via-[#7c3aed] to-[#2e1065]",
    glow: "rgba(217,70,239,.35)",
  },
  {
    id: "vbucks-12500",
    amount: 12500,
    price: 960,
    title: "12,500 paVos",
    gradient: "from-[#facc15] via-[#fb923c] to-[#7c2d12]",
    glow: "rgba(251,146,60,.35)",
  },
  {
    id: "vbucks-25000",
    amount: 25000,
    price: 1830,
    title: "25,000 paVos",
    gradient: "from-[#fb7185] via-[#ef4444] to-[#7f1d1d]",
    glow: "rgba(239,68,68,.35)",
  },
  {
    id: "vbucks-37500",
    amount: 37500,
    price: 2700,
    title: "37,500 paVos",
    gradient: "from-[#22d3ee] via-[#14b8a6] to-[#064e3b]",
    glow: "rgba(20,184,166,.35)",
  },
];

const LABELS = {
  "es-419": {
    brandSub: "TIENDA PAVOS",
    shop: "Tienda",
    vbucks: "paVos",
    login: "Iniciar sesión",
    myProfile: "Mi perfil",
    cart: "Carrito",
    close: "Cerrar",
    add: "Agregar al carrito",
    added: "Agregado",
    empty: "Tu carrito está vacío",
    total: "Total",
    totalVbucks: "Total paVos",
    remove: "Quitar",
    shareLink: "Copiar enlace",
    copied: "Enlace copiado",
    sendWhatsApp: "Mandar por WhatsApp",
    giftData: "Datos de regalo",
    giftHelp: "Debes poner los datos de regalo para continuar.",
    mainUser: "Usuario principal a enviar",
    addSecondUser: "Agregar 1 usuario adicional",
    secondUser: "Usuario adicional",
    selectItems: "Selecciona qué paquetes recibirá",
    all: "Todos",
    none: "Ninguno",
    confirmWhatsApp: "Confirmar y mandar por WhatsApp",
    heroKicker: "PAQUETES GANKER GAMES",
    heroTitle: "Compra paVos por regalo",
    heroDesc:
      "Selecciona el paquete, agrégalo al carrito y manda la cotización por WhatsApp con el usuario donde se enviarán.",
    oneColumnNote: "En celular se muestra en 1 columna para que sea fácil elegir.",
  },
  en: {
    brandSub: "V-BUCKS STORE",
    shop: "Shop",
    vbucks: "V-Bucks",
    login: "Log in",
    myProfile: "My profile",
    cart: "Cart",
    close: "Close",
    add: "Add to cart",
    added: "Added",
    empty: "Your cart is empty",
    total: "Total",
    totalVbucks: "Total V-Bucks",
    remove: "Remove",
    shareLink: "Copy link",
    copied: "Link copied",
    sendWhatsApp: "Send by WhatsApp",
    giftData: "Gift data",
    giftHelp: "You must add gift data to continue.",
    mainUser: "Main username to send",
    addSecondUser: "Add 1 extra user",
    secondUser: "Extra user",
    selectItems: "Select which packs this user receives",
    all: "All",
    none: "None",
    confirmWhatsApp: "Confirm and send by WhatsApp",
    heroKicker: "GANKER GAMES PACKS",
    heroTitle: "Buy V-Bucks by gift",
    heroDesc:
      "Choose a pack, add it to cart and send the quote by WhatsApp with the username where it will be delivered.",
    oneColumnNote: "On mobile this page uses 1 column for easier selection.",
  },
};

function formatMx(amount) {
  return `MX$${Number(amount || 0).toLocaleString("es-MX", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatVbucks(amount) {
  return `${Number(amount || 0).toLocaleString("es-MX")} paVos`;
}

function VCoin({ className = "" }) {
  return (
    <span
      className={`relative inline-flex items-center justify-center rounded-full border border-cyan-100/70 bg-[radial-gradient(circle_at_32%_22%,rgba(255,255,255,.98),rgba(160,246,255,.92)_30%,rgba(56,189,248,.88)_58%,rgba(6,78,113,1)_100%)] text-white shadow-[0_0_18px_rgba(34,211,238,.35),inset_0_0_16px_rgba(255,255,255,.25)] ${className}`}
    >
      <span className="absolute inset-[14%] rounded-full border border-cyan-100/45" />
      <span className="relative text-[0.55em] font-black italic leading-none drop-shadow-[0_2px_4px_rgba(0,0,0,.45)]">
        V
      </span>
    </span>
  );
}

function CoinPile() {
  return (
    <div className="relative mx-auto h-32 w-48 sm:h-36 sm:w-56">
      {Array.from({ length: 15 }).map((_, index) => {
        const left = 8 + (index % 5) * 32;
        const top = 72 - Math.floor(index / 5) * 20 + (index % 2) * 4;
        return (
          <span
            key={index}
            className="absolute h-9 w-16 rounded-[50%] border border-cyan-100/45 bg-[linear-gradient(180deg,#e6fbff,#84e9f3_45%,#228ea1)] shadow-[0_8px_10px_rgba(0,0,0,.22)]"
            style={{ left, top }}
          >
            <span className="absolute inset-x-2 top-2 h-2 rounded-full bg-white/60 blur-[1px]" />
          </span>
        );
      })}
      <VCoin className="absolute bottom-0 left-1/2 h-20 w-20 -translate-x-1/2 text-[3.2rem]" />
    </div>
  );
}

function PackageCard({ pack, onAdd, labels }) {
  return (
    <article
      className={`group relative min-h-[430px] overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-br ${pack.gradient} p-1 shadow-[0_0_28px_var(--pack-glow)] transition hover:-translate-y-1 hover:shadow-[0_0_42px_var(--pack-glow)]`}
      style={{ "--pack-glow": pack.glow }}
    >
      <div className="flex h-full flex-col overflow-hidden rounded-[24px] bg-black/14">
        <div className="relative flex flex-1 items-center justify-center px-5 pt-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(255,255,255,.22),transparent_32%),linear-gradient(160deg,rgba(255,255,255,.18),transparent_35%)]" />
          <CoinPile />
        </div>

        <div className="relative bg-[linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.35))] px-5 pb-5 pt-4 text-center">
          <h2 className="text-3xl font-black leading-none text-white drop-shadow-[0_3px_8px_rgba(0,0,0,.38)]">
            {pack.amount.toLocaleString("es-MX")}
          </h2>
          <p className="mt-1 text-xl font-black uppercase tracking-wide text-white">
            {labels.vbucks}
          </p>

          <button
            type="button"
            onClick={() => onAdd(pack)}
            className="mt-5 w-full rounded-2xl bg-[#fff200] px-5 py-4 text-2xl font-black text-black shadow-[0_12px_24px_rgba(0,0,0,.28)] transition hover:scale-[1.02] active:scale-[.98]"
          >
            {formatMx(pack.price)}
          </button>

          <button
            type="button"
            onClick={() => onAdd(pack)}
            className="mt-3 w-full rounded-2xl border border-white/30 bg-black/18 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-black/28"
          >
            {labels.add}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function VbucksPage() {
  const [language, setLanguage] = useState("es-419");
  const labels = LABELS[language];
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [giftModalOpen, setGiftModalOpen] = useState(false);
  const [recipientUsername, setRecipientUsername] = useState("");
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [secondaryUser, setSecondaryUser] = useState("");
  const [primaryIds, setPrimaryIds] = useState([]);
  const [secondaryIds, setSecondaryIds] = useState([]);
  const [message, setMessage] = useState("");
  const [sessionUser, setSessionUser] = useState(null);

  const supabase = useMemo(() => {
    if (typeof window === "undefined") return null;
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createBrowserClient(url, key);
  }, []);

  const authHref = sessionUser ? "/perfil" : "/login";
  const authLabel = sessionUser ? labels.myProfile : labels.login;

  const details = cart
    .map((entry) => {
      const pack = PACKS.find((item) => item.id === entry.id);
      return pack ? { ...pack, qty: entry.qty } : null;
    })
    .filter(Boolean);

  const detailIds = details.map((item) => item.id);
  const totalVbucks = details.reduce((sum, item) => sum + item.amount * item.qty, 0);
  const totalMx = details.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = details.reduce((sum, item) => sum + item.qty, 0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const savedLang = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (savedLang === "es-419" || savedLang === "en") setLanguage(savedLang);

    const savedCart = window.localStorage.getItem(VBUCKS_CART_KEY);
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) setCart(parsed);
      } catch {}
    }
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
      window.localStorage.setItem(VBUCKS_CART_KEY, JSON.stringify(cart));
    }
  }, [cart]);

  useEffect(() => {
    setPrimaryIds((current) => syncIds(current, detailIds));
    setSecondaryIds((current) => syncIds(current, detailIds));
  }, [cart.length]);

  function syncIds(current, validIds) {
    const filtered = (current || []).filter((id) => validIds.includes(id));
    return filtered.length ? filtered : validIds;
  }

  function toggleLanguage() {
    setLanguage((current) => (current === "es-419" ? "en" : "es-419"));
  }

  function addToCart(pack) {
    setCart((current) => {
      const existing = current.find((item) => item.id === pack.id);
      if (existing) {
        return current.map((item) =>
          item.id === pack.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...current, { id: pack.id, qty: 1 }];
    });

    setMessage(`${pack.title} ${labels.added}`);
    setCartOpen(true);

    window.setTimeout(() => setMessage(""), 1600);
  }

  function updateQty(id, qty) {
    if (qty <= 0) {
      setCart((current) => current.filter((item) => item.id !== id));
      return;
    }

    setCart((current) => current.map((item) => (item.id === id ? { ...item, qty } : item)));
  }

  function toggleSelected(setter, id) {
    setter((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  function selectAll(setter) {
    setter(detailIds);
  }

  function selectNone(setter) {
    setter([]);
  }

  function renderAssignedItems(ids) {
    return details.filter((item) => ids.includes(item.id));
  }

  function buildUserLines(title, username, ids) {
    const assigned = renderAssignedItems(ids);

    return [
      `${title}: ${username}`,
      "",
      "🎮 Objetos del carrito",
      ...assigned.flatMap((item, index) => [
        `${index + 1}. ${item.title} x${item.qty}`,
        `   ${formatVbucks(item.amount * item.qty)}`,
        `   ${formatMx(item.price * item.qty)}`,
      ]),
      "",
    ];
  }

  async function shareCart() {
    const ids = cart.map((item) => `${item.id}:${item.qty}`).join(",");
    const url = new URL(window.location.href);
    url.searchParams.set("cart", ids);

    await navigator.clipboard.writeText(url.toString());
    setMessage(labels.copied);
    window.setTimeout(() => setMessage(""), 1600);
  }

  function openGiftModal() {
    if (!details.length) return;
    setPrimaryIds((current) => syncIds(current, detailIds));
    setSecondaryIds((current) => syncIds(current, detailIds));
    setGiftModalOpen(true);
  }

  function confirmWhatsApp() {
    const mainUser = recipientUsername.trim();
    const extraUser = secondaryUser.trim();

    if (!mainUser) {
      setMessage("Agrega el usuario principal.");
      return;
    }

    if (!primaryIds.length) {
      setMessage("Selecciona al menos un paquete para el usuario principal.");
      return;
    }

    if (splitEnabled && !extraUser) {
      setMessage("Agrega el usuario adicional.");
      return;
    }

    if (splitEnabled && !secondaryIds.length) {
      setMessage("Selecciona al menos un paquete para el usuario adicional.");
      return;
    }

    const lines = [
      "🛒 Cotización de paVos GKG",
      "",
      "🎁 Datos de entrega",
      ...buildUserLines("Usuario principal a enviar", mainUser, primaryIds),
      ...(splitEnabled
        ? buildUserLines("Usuario adicional a enviar", extraUser, secondaryIds)
        : []),
      `Total: ${formatVbucks(totalVbucks)}`,
      `Total MX: ${formatMx(totalMx)}`,
      "",
      "Quiero cotizar/enviar estos paVos por regalo.",
    ];

    window.open(
      `https://wa.me/${GKG_WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`,
      "_blank",
      "noopener,noreferrer"
    );

    setGiftModalOpen(false);
  }

  function CartDrawer() {
    if (!cartOpen) return null;

    return (
      <div className="fixed inset-0 z-[130]">
        <div className="absolute inset-0 bg-black/62 backdrop-blur-[2px]" onClick={() => setCartOpen(false)} />
        <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-[#124633] bg-[rgba(4,18,13,0.95)] p-4 shadow-[0_0_45px_rgba(21,216,99,0.16)] backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#67ff9a]">
                Ganker Games
              </p>
              <h3 className="text-2xl font-black">{labels.cart}</h3>
            </div>
            <button
              type="button"
              onClick={() => setCartOpen(false)}
              className="rounded-xl border border-[#1a4e3a] bg-[#08140f] px-4 py-2 font-black text-white"
            >
              {labels.close}
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
            {!details.length && (
              <div className="rounded-2xl border border-[#124633] bg-[#06110c] p-4 text-slate-300">
                {labels.empty}
              </div>
            )}

            {details.map((item) => (
              <div key={item.id} className="rounded-2xl border border-[#124633] bg-[#06110c] p-3">
                <div className="flex gap-3">
                  <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient}`}>
                    <VCoin className="h-14 w-14 text-[2.4rem]" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-black text-white">{item.title}</div>
                    <div className="mt-1 text-xs text-slate-400">
                      {formatMx(item.price)} · {formatVbucks(item.amount)}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, item.qty - 1)}
                        className="h-8 w-8 rounded-lg border border-[#1a4e3a] bg-[#08140f] font-black"
                      >
                        -
                      </button>
                      <div className="min-w-[28px] text-center font-black">{item.qty}</div>
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, item.qty + 1)}
                        className="h-8 w-8 rounded-lg border border-[#1a4e3a] bg-[#08140f] font-black"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => updateQty(item.id, 0)}
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

          <div className="mt-4 shrink-0 rounded-2xl border border-[#124633] bg-[#06110c] p-4">
            <div className="flex items-center justify-between text-sm">
              <span>{labels.totalVbucks}</span>
              <span className="font-black">{formatVbucks(totalVbucks)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span>{labels.total}</span>
              <span className="font-black">{formatMx(totalMx)}</span>
            </div>

            <div className="mt-4 grid gap-3">
              <button
                type="button"
                onClick={openGiftModal}
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
                onClick={() => setCart([])}
                className="rounded-2xl border border-red-500/40 bg-red-500/12 px-4 py-3 text-sm font-black text-red-300"
              >
                {labels.remove}
              </button>
            </div>
          </div>
        </aside>
      </div>
    );
  }

  function Selector({ title, ids, setIds }) {
    return (
      <div className="mt-4 rounded-2xl bg-[#06110c] p-3 shadow-[inset_0_0_0_1px_rgba(30,255,122,.18)]">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#63ff9b]">
            {title}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => selectAll(setIds)}
              className="rounded-lg border border-[#1eff7a]/35 px-2 py-1 text-[10px] font-black text-[#63ff9b]"
            >
              {labels.all}
            </button>
            <button
              type="button"
              onClick={() => selectNone(setIds)}
              className="rounded-lg border border-red-400/35 px-2 py-1 text-[10px] font-black text-red-200"
            >
              {labels.none}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {details.map((item) => (
            <label
              key={item.id}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#1a4e3a]/70 bg-[#08140f] p-3"
            >
              <input
                type="checkbox"
                checked={ids.includes(item.id)}
                onChange={() => toggleSelected(setIds, item.id)}
                className="h-5 w-5 accent-[#15d863]"
              />
              <span className="min-w-0">
                <span className="block text-sm font-black text-white">{item.title} x{item.qty}</span>
                <span className="block text-xs text-slate-400">
                  {formatVbucks(item.amount * item.qty)} · {formatMx(item.price * item.qty)}
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  function GiftModal() {
    if (!giftModalOpen) return null;

    return (
      <div className="fixed inset-0 z-[150] flex items-end justify-center bg-black/72 p-0 backdrop-blur-[3px] sm:items-center sm:p-4">
        <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[rgba(4,18,13,0.98)] shadow-[0_0_60px_rgba(21,216,99,0.16)] sm:h-auto sm:max-h-[92dvh] sm:max-w-2xl sm:rounded-[30px] sm:border sm:border-[#124633]/70">
          <div className="shrink-0 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#63ff9b]">
                  {labels.giftData}
                </p>
                <h3 className="mt-1 text-2xl font-black text-white">{labels.sendWhatsApp}</h3>
                <p className="mt-1 text-xs leading-5 text-slate-400">{labels.giftHelp}</p>
              </div>

              <button
                type="button"
                onClick={() => setGiftModalOpen(false)}
                className="shrink-0 rounded-xl border border-[#1a4e3a]/70 bg-[#08140f] px-4 py-2 text-sm font-black text-white"
              >
                {labels.close}
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 pb-6 [-webkit-overflow-scrolling:touch] [touch-action:pan-y] [&::-webkit-scrollbar]:hidden">
            <div className="rounded-2xl bg-[#06110c] p-3 shadow-[inset_0_0_0_1px_rgba(30,255,122,.18)]">
              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-wide text-white">
                  {labels.mainUser} *
                </span>
                <input
                  type="text"
                  value={recipientUsername}
                  onChange={(event) => setRecipientUsername(event.target.value)}
                  placeholder="Ej. GankerGames"
                  className="w-full rounded-2xl border border-[#1a4e3a]/70 bg-[#08140f] px-4 py-3 text-sm font-bold text-white outline-none transition placeholder:text-slate-500 focus:border-[#67ff9a]"
                />
              </label>

              <Selector title={labels.selectItems} ids={primaryIds} setIds={setPrimaryIds} />
            </div>

            <div className="rounded-2xl bg-[#06110c] p-3 shadow-[inset_0_0_0_1px_rgba(30,255,122,.18)]">
              <label className="flex cursor-pointer items-center justify-between gap-3">
                <span>
                  <span className="block text-sm font-black text-white">{labels.addSecondUser}</span>
                  <span className="block text-xs leading-5 text-slate-400">
                    Actívalo solo si una parte del carrito irá a otra cuenta.
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={splitEnabled}
                  onChange={(event) => setSplitEnabled(event.target.checked)}
                  className="h-5 w-5 accent-[#15d863]"
                />
              </label>

              {splitEnabled && (
                <div className="mt-3 rounded-2xl bg-[#04120d] p-3 shadow-[inset_0_0_0_1px_rgba(30,255,122,.16)]">
                  <label className="block">
                    <span className="mb-2 block text-xs font-black uppercase tracking-wide text-white">
                      {labels.secondUser}
                    </span>
                    <input
                      type="text"
                      value={secondaryUser}
                      onChange={(event) => setSecondaryUser(event.target.value)}
                      placeholder="Nombre del usuario adicional"
                      className="w-full rounded-xl border border-[#1a4e3a]/70 bg-[#08140f] px-3 py-2 text-sm font-bold text-white outline-none transition placeholder:text-slate-500 focus:border-[#67ff9a]"
                    />
                  </label>

                  <Selector title={labels.selectItems} ids={secondaryIds} setIds={setSecondaryIds} />
                </div>
              )}
            </div>
          </div>

          <div className="shrink-0 bg-[rgba(4,18,13,0.98)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-18px_30px_rgba(4,18,13,.92)]">
            {message && (
              <p className="mb-3 rounded-xl border border-[#1eff7a]/25 bg-[#1eff7a]/10 px-3 py-2 text-sm font-bold text-[#63ff9b]">
                {message}
              </p>
            )}
            <button
              type="button"
              onClick={confirmWhatsApp}
              className="w-full rounded-2xl bg-[#15d863] px-4 py-4 text-sm font-black text-[#06110a] shadow-[0_0_18px_rgba(21,216,99,0.18)] transition hover:brightness-110"
            >
              {labels.confirmWhatsApp}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(0,255,102,0.14),_transparent_20%),linear-gradient(180deg,_#000000_0%,_#021106_45%,_#000000_100%)] text-white">
      <header className="sticky top-0 z-50 border-b border-[#104a2f] bg-[#03100a]/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="text-3xl font-black italic leading-none text-white sm:text-4xl">
              GKG
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-[#67ff9a] sm:text-xs">
              {labels.brandSub}
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex h-11 items-center gap-2 rounded-2xl border border-[#1eff7a]/35 bg-[#021509] px-3 text-xs font-black uppercase tracking-wide text-[#63ff9b]"
            >
              <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black text-white">
                {language === "es-419" ? "ESP" : "ENG"}
              </span>
              🌐
            </button>

            <Link
              href={authHref}
              className="hidden rounded-2xl border border-cyan-300/35 bg-cyan-300/10 px-4 py-3 text-sm font-black text-cyan-100 sm:inline-flex"
            >
              {authLabel}
            </Link>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[#1eff7a]/35 bg-[#07140f] text-[#67ff9a]"
            >
              🛒
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#15d863] px-1 text-[10px] font-black text-black">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="grid gap-6 rounded-[34px] border border-[#124633] bg-[#04120d]/75 p-5 shadow-[0_0_45px_rgba(21,216,99,.08)] backdrop-blur md:grid-cols-[1fr_.75fr] md:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.42em] text-[#67ff9a]">
              {labels.heroKicker}
            </p>
            <h1 className="mt-3 text-4xl font-black italic leading-none text-white sm:text-6xl">
              {labels.heroTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              {labels.heroDesc}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-2xl bg-[#15d863] px-5 py-3 text-sm font-black text-[#06110a]"
              >
                {labels.shop}
              </Link>
              <button
                type="button"
                onClick={() => setCartOpen(true)}
                className="rounded-2xl border border-[#1eff7a]/35 bg-[#07140f] px-5 py-3 text-sm font-black text-[#67ff9a]"
              >
                {labels.cart} ({cartCount})
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center rounded-[28px] border border-cyan-200/25 bg-cyan-300/10 p-6">
            <VCoin className="h-40 w-40 text-[7rem] sm:h-56 sm:w-56 sm:text-[10rem]" />
          </div>
        </div>

        {message && (
          <div className="mt-4 rounded-2xl border border-[#1eff7a]/30 bg-[#1eff7a]/10 px-4 py-3 text-sm font-bold text-[#63ff9b]">
            {message}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {PACKS.map((pack) => (
            <PackageCard key={pack.id} pack={pack} labels={labels} onAdd={addToCart} />
          ))}
        </div>

        <p className="mt-6 rounded-2xl border border-yellow-300/25 bg-yellow-300/10 px-4 py-3 text-sm font-bold text-yellow-100">
          {labels.oneColumnNote}
        </p>
      </section>

      <button
        type="button"
        onClick={() => setCartOpen(true)}
        className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-[#8cff9f] bg-[#15d863] text-2xl shadow-[0_0_28px_rgba(21,216,99,.62)]"
      >
        🛒
      </button>

      <CartDrawer />
      <GiftModal />
    </main>
  );
}
