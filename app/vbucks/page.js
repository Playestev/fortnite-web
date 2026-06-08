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
    accent: "#2bff88",
    accentSoft: "#19d86a",
    glow: "rgba(43,255,136,.35)",
  },
  {
    id: "vbucks-2400",
    amount: 2400,
    price: 280,
    title: "2,400 paVos",
    accent: "#73ffb5",
    accentSoft: "#20d48b",
    glow: "rgba(32,212,139,.33)",
  },
  {
    id: "vbucks-4500",
    amount: 4500,
    price: 450,
    title: "4,500 paVos",
    accent: "#5cf5ff",
    accentSoft: "#1ccdd8",
    glow: "rgba(28,205,216,.30)",
  },
  {
    id: "vbucks-12500",
    amount: 12500,
    price: 960,
    title: "12,500 paVos",
    accent: "#9bff7d",
    accentSoft: "#51d246",
    glow: "rgba(81,210,70,.30)",
  },
  {
    id: "vbucks-25000",
    amount: 25000,
    price: 1830,
    title: "25,000 paVos",
    accent: "#42ffcf",
    accentSoft: "#16c89b",
    glow: "rgba(22,200,155,.32)",
  },
  {
    id: "vbucks-37500",
    amount: 37500,
    price: 2700,
    title: "37,500 paVos",
    accent: "#b3ffd3",
    accentSoft: "#39d985",
    glow: "rgba(57,217,133,.34)",
  },
];

const PLATFORM_ITEMS = {
  "es-419": ["Xbox", "PlayStation", "Nintendo", "PC", "Play Store", "iOS", "GeForce Now"],
  en: ["Xbox", "PlayStation", "Nintendo", "PC", "Play Store", "iOS", "GeForce Now"],
};

const LABELS = {
  "es-419": {
    brand: "GKG",
    brandSub: "TIENDA",
    sidebarBrandSub: "TIENDA FORTNITE",
    shop: "Tienda",
    vbucks: "Recarga",
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
    clear: "Quitar",
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
    heroTitle: "Recarga paVos",
    heroDesc:
      "Recarga para cuenta propia o cuenta nueva. Disponible para cualquier plataforma y lista para cotizar por WhatsApp.",
    heroExtra:
      "Compatible con Xbox, PS4 / PS5, Nintendo Switch, PC, Play Store, iOS y GeForce Now.",
    availableOn: "Disponible para",
    oneColumnNote:
      "En celular se muestra en 1 columna para que sea fácil elegir tu paquete.",
    menu: "Menú",
    platformsTitle: "Compatible con",
    accountType: "Cuenta propia o nueva cuenta",
    ownAccount: "Cuenta propia",
    newAccount: "Nueva cuenta",
    accountInfo: "Disponible para cualquier plataforma.",
    menuShop: "Tienda",
    menuVbucks: "paVos",
    menuProfile: "Mi perfil",
    menuCart: "Carrito",
    quoteIntro: "Quiero cotizar/enviar estos paVos por regalo.",
    mainUserError: "Agrega el usuario principal.",
    primarySelectionError: "Selecciona al menos un paquete para el usuario principal.",
    secondUserError: "Agrega el usuario adicional.",
    secondarySelectionError: "Selecciona al menos un paquete para el usuario adicional.",
    splitHelp: "Actívalo solo si una parte del carrito irá a otra cuenta.",
    mobileNote: "Página homologada al estilo de Ganker Games.",
  },
  en: {
    brand: "GKG",
    brandSub: "TIENDA",
    sidebarBrandSub: "FORTNITE SHOP",
    shop: "Shop",
    vbucks: "Top up",
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
    clear: "Remove",
    shareLink: "Copy link",
    copied: "Link copied",
    sendWhatsApp: "Send by WhatsApp",
    giftData: "Gift data",
    giftHelp: "You must add gift data to continue.",
    mainUser: "Main username",
    addSecondUser: "Add 1 extra user",
    secondUser: "Extra user",
    selectItems: "Select which packs this user receives",
    all: "All",
    none: "None",
    confirmWhatsApp: "Confirm and send by WhatsApp",
    heroKicker: "GANKER GAMES PACKS",
    heroTitle: "V-Bucks top up",
    heroDesc:
      "Top up for your own account or a new account. Available for any platform and ready to quote through WhatsApp.",
    heroExtra:
      "Compatible with Xbox, PS4 / PS5, Nintendo Switch, PC, Play Store, iOS and GeForce Now.",
    availableOn: "Available for",
    oneColumnNote: "On mobile this page uses 1 column for easy selection.",
    menu: "Menu",
    platformsTitle: "Compatible with",
    accountType: "Own account or new account",
    ownAccount: "Own account",
    newAccount: "New account",
    accountInfo: "Available for any platform.",
    menuShop: "Shop",
    menuVbucks: "V-Bucks",
    menuProfile: "My profile",
    menuCart: "Cart",
    quoteIntro: "I want to quote/send these V-Bucks by gift.",
    mainUserError: "Add the main username.",
    primarySelectionError: "Select at least one pack for the main user.",
    secondUserError: "Add the extra username.",
    secondarySelectionError: "Select at least one pack for the extra user.",
    splitHelp: "Enable only if part of the cart goes to another account.",
    mobileNote: "Page aligned with Ganker Games style.",
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

function LogoMark({ className = "" }) {
  return (
    <span
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-full border border-[#37ff97]/40 bg-[radial-gradient(circle_at_35%_25%,rgba(24,255,145,.34),rgba(4,18,13,.92)_54%,rgba(0,0,0,1)_100%)] shadow-[0_0_22px_rgba(21,216,99,.22)] ${className}`}
    >
      <span className="absolute inset-[8%] rounded-full border border-[#39e38a]/25" />
      <span className="relative text-[0.42em] font-black tracking-tight text-white">GKG</span>
    </span>
  );
}

function GlobeIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.8 12h16.4" />
      <path d="M12 3.5c2.8 2.4 4.3 5.4 4.3 8.5S14.8 18.1 12 20.5" />
      <path d="M12 3.5C9.2 5.9 7.7 8.9 7.7 12S9.2 18.1 12 20.5" />
    </svg>
  );
}

function CartIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className}>
      <circle cx="9" cy="20" r="1.5" />
      <circle cx="18" cy="20" r="1.5" />
      <path d="M3 4h2l2.2 10.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.76L20 7H7" />
    </svg>
  );
}

function UserIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.8-3.5 5-5 8-5s6.2 1.5 8 5" />
    </svg>
  );
}

function MenuIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function CloseIcon({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M6 6l12 12" />
      <path d="M18 6L6 18" />
    </svg>
  );
}

function ChevronRight({ className = "" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

function VCoin({ className = "" }) {
  return (
    <span
      className={`relative inline-flex items-center justify-center rounded-full border border-[#aaffda]/55 bg-[radial-gradient(circle_at_34%_22%,rgba(241,255,248,.98),rgba(170,255,218,.95)_22%,rgba(66,235,177,.82)_42%,rgba(17,151,104,.95)_62%,rgba(2,40,24,1)_100%)] text-white shadow-[0_0_24px_rgba(44,255,138,.36),inset_0_0_18px_rgba(255,255,255,.18)] ${className}`}
    >
      <span className="absolute inset-[14%] rounded-full border border-[#d3ffe8]/28" />
      <span className="relative text-[0.55em] font-black italic leading-none text-white drop-shadow-[0_2px_4px_rgba(0,0,0,.45)]">
        V
      </span>
    </span>
  );
}

function CoinPile() {
  return (
    <div className="relative mx-auto flex h-40 w-full max-w-[240px] items-center justify-center sm:h-44">
      <img
        src="/vbucks-green.png"
        alt="Moneda de paVos"
        className="h-full w-full object-contain drop-shadow-[0_0_18px_rgba(43,255,136,.35)]"
        loading="lazy"
      />
    </div>
  );
}

function PlatformPill({ label }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#1b6f4b] bg-[linear-gradient(180deg,rgba(10,51,36,.95),rgba(5,25,16,.98))] px-3 py-2 text-xs font-black text-[#dfffee] shadow-[inset_0_1px_0_rgba(93,255,177,.10)]">
      <span className="h-2 w-2 rounded-full bg-[#23f07d] shadow-[0_0_12px_rgba(35,240,125,.8)]" />
      {label}
    </span>
  );
}

function PackageCard({ pack, onAdd, labels }) {
  return (
    <article
      className="group relative overflow-hidden rounded-[28px] border p-1 shadow-[0_0_28px_var(--pack-glow)] transition hover:-translate-y-1 hover:shadow-[0_0_40px_var(--pack-glow)]"
      style={{
        borderColor: `${pack.accent}4d`,
        boxShadow: `0 0 0 1px ${pack.accent}1a, 0 0 28px ${pack.glow}`,
      }}
    >
      <div className="relative flex h-full min-h-[435px] flex-col overflow-hidden rounded-[24px] bg-[radial-gradient(circle_at_top,rgba(20,92,61,.28),transparent_28%),linear-gradient(180deg,#07150f_0%,#031009_56%,#010604_100%)]">
        <div className="absolute inset-0 opacity-80" style={{ background: `radial-gradient(circle at 50% 0%, ${pack.accentSoft}25, transparent 34%)` }} />
        <div className="absolute inset-x-0 top-0 h-[3px]" style={{ background: `linear-gradient(90deg, transparent, ${pack.accent}, transparent)` }} />

        <div className="relative flex flex-1 items-center justify-center px-5 pt-8">
          <CoinPile />
        </div>

        <div className="relative border-t border-white/5 bg-[linear-gradient(180deg,rgba(255,255,255,.02),rgba(0,0,0,.25))] px-5 pb-5 pt-4 text-center">
          <h2 className="text-3xl font-black leading-none text-white drop-shadow-[0_3px_8px_rgba(0,0,0,.38)]">
            {pack.amount.toLocaleString("es-MX")}
          </h2>
          <p className="mt-1 text-xl font-black uppercase tracking-wide" style={{ color: pack.accent }}>
            paVos
          </p>

          <button
            type="button"
            onClick={() => onAdd(pack)}
            className="mt-5 w-full rounded-2xl px-5 py-4 text-2xl font-black text-[#031209] shadow-[0_12px_24px_rgba(0,0,0,.28)] transition hover:scale-[1.02] active:scale-[.98]"
            style={{ background: `linear-gradient(180deg, ${pack.accent}, ${pack.accentSoft})` }}
          >
            {formatMx(pack.price)}
          </button>

          <button
            type="button"
            onClick={() => onAdd(pack)}
            className="mt-3 w-full rounded-2xl border bg-[#020906]/70 px-5 py-3 text-sm font-black text-white backdrop-blur transition hover:bg-[#06130d]"
            style={{ borderColor: `${pack.accent}55` }}
          >
            {labels.add}
          </button>
        </div>
      </div>
    </article>
  );
}

function syncIds(current, validIds) {
  const filtered = (current || []).filter((id) => validIds.includes(id));
  return filtered.length ? filtered : validIds;
}


function MobileMenuDrawer({
  open,
  labels,
  cartCount,
  authHref,
  onClose,
  onCartOpen,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[140]">
      <div
        className="absolute inset-0 bg-black/62 backdrop-blur-[2px]"
        onClick={onClose}
      />

      <aside
        className="absolute right-0 top-0 h-full w-[86%] max-w-sm animate-[slideInRight_240ms_ease-out] border-l border-[#1eff7a]/30 bg-[rgba(3,16,9,0.84)] p-5 shadow-[0_0_45px_rgba(21,216,99,0.16)] backdrop-blur-xl"
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/ganker-logo.png"
              alt="GKG"
              className="h-12 w-12 rounded-full border border-[#19ff72]/45 object-cover shadow-[0_0_18px_rgba(25,255,114,0.25)]"
            />

            <div>
              <p className="text-2xl font-black italic leading-none text-white">
                {labels.brand}
              </p>
              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.3em] text-[#67ff9a]">
                TIENDA FORTNITE
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[#1eff7a]/35 bg-[#07140f]/86 px-4 py-3 text-sm font-black text-white shadow-[0_0_18px_rgba(21,216,99,0.10)] transition hover:border-[#67ff9a] hover:text-[#67ff9a]"
            aria-label={labels.close}
          >
            ✕
          </button>
        </div>

        <div className="grid gap-3">
          <Link
            href="/tienda"
            onClick={onClose}
            className="rounded-2xl border border-cyan-300/45 bg-cyan-300/10 px-4 py-4 text-center text-base font-black text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.12)] transition hover:border-cyan-200 hover:bg-cyan-300/15"
          >
            {labels.menuShop}
          </Link>

          <Link
            href="/vbucks"
            onClick={onClose}
            className="rounded-2xl bg-[#15d863] px-4 py-4 text-center text-base font-black text-[#06110a] shadow-[0_0_22px_rgba(21,216,99,0.22)]"
          >
            {labels.menuVbucks}
          </Link>

          <Link
            href={authHref}
            onClick={onClose}
            className="rounded-2xl border border-cyan-300/45 bg-cyan-300/10 px-4 py-4 text-center text-base font-black text-cyan-100 shadow-[0_0_22px_rgba(34,211,238,0.12)] transition hover:border-cyan-200 hover:bg-cyan-300/15"
          >
            {labels.menuProfile}
          </Link>

          <button
            type="button"
            onClick={() => {
              onClose();
              onCartOpen();
            }}
            className="rounded-2xl border border-[#67ff9a] bg-[#0b120d]/88 px-4 py-4 text-center text-base font-black text-[#67ff9a] shadow-[0_0_22px_rgba(21,216,99,0.12)]"
          >
            {labels.menuCart} ({cartCount})
          </button>
        </div>
      </aside>
    </div>
  );
}

export default function VbucksPage() {
  const [language, setLanguage] = useState("es-419");
  const labels = LABELS[language];
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [giftModalOpen, setGiftModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [recipientUsername, setRecipientUsername] = useState("");
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [secondaryUser, setSecondaryUser] = useState("");
  const [primaryIds, setPrimaryIds] = useState([]);
  const [secondaryIds, setSecondaryIds] = useState([]);
  const [message, setMessage] = useState("");
  const [sessionUser, setSessionUser] = useState(null);
  const [cartPulse, setCartPulse] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [cartDrawerMounted, setCartDrawerMounted] = useState(false);
  const [cartDrawerClosing, setCartDrawerClosing] = useState(false);

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
  }, [detailIds.join("|")]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    function onKeyDown(event) {
      if (event.key === "Escape") setMobileMenuOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    function handleScroll() {
      setShowScrollTop(window.scrollY > 260);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let timeoutId;

    if (cartOpen) {
      setCartDrawerMounted(true);
      setCartDrawerClosing(false);
    } else if (cartDrawerMounted) {
      setCartDrawerClosing(true);
      timeoutId = window.setTimeout(() => {
        setCartDrawerMounted(false);
        setCartDrawerClosing(false);
      }, 220);
    }

    return () => window.clearTimeout(timeoutId);
  }, [cartOpen, cartDrawerMounted]);

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
    setCartPulse(true);

    window.setTimeout(() => setMessage(""), 1600);
    window.setTimeout(() => setCartPulse(false), 620);
  }

  function scrollToTop() {
    if (typeof window === "undefined") return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function scrollToBottom() {
    if (typeof window === "undefined") return;
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
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
    try {
      const ids = cart.map((item) => `${item.id}:${item.qty}`).join(",");
      const url = new URL(window.location.href);
      url.searchParams.set("cart", ids);
      await navigator.clipboard.writeText(url.toString());
      setMessage(labels.copied);
      window.setTimeout(() => setMessage(""), 1600);
    } catch {
      setMessage(labels.copied);
      window.setTimeout(() => setMessage(""), 1600);
    }
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
      setMessage(labels.mainUserError);
      return;
    }

    if (!primaryIds.length) {
      setMessage(labels.primarySelectionError);
      return;
    }

    if (splitEnabled && !extraUser) {
      setMessage(labels.secondUserError);
      return;
    }

    if (splitEnabled && !secondaryIds.length) {
      setMessage(labels.secondarySelectionError);
      return;
    }

    const lines = [
      "🛒 Cotización de paVos GKG",
      "",
      "🎁 Datos de entrega",
      ...buildUserLines(labels.mainUser, mainUser, primaryIds),
      ...(splitEnabled ? buildUserLines(labels.secondUser, extraUser, secondaryIds) : []),
      `${labels.totalVbucks}: ${formatVbucks(totalVbucks)}`,
      `${labels.total}: ${formatMx(totalMx)}`,
      "",
      labels.quoteIntro,
    ];

    window.open(
      `https://wa.me/${GKG_WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join("\n"))}`,
      "_blank",
      "noopener,noreferrer"
    );

    setGiftModalOpen(false);
  }

  function renderCartDrawer() {
    if (!cartDrawerMounted) return null;

    return (
      <div className="fixed inset-0 z-[130]">
        <div
          className="absolute inset-0 bg-black/62 backdrop-blur-[2px]"
          onClick={() => setCartOpen(false)}
        />

        <aside
          className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-hidden border-l border-[#124633] bg-[rgba(4,18,13,0.90)] shadow-[0_0_45px_rgba(21,216,99,0.16)] backdrop-blur-xl sm:max-w-lg ${
            cartDrawerClosing
              ? "animate-[slideOutRight_220ms_ease-in]"
              : "animate-[slideInRight_220ms_ease-out]"
          }`}
        >
          <div className="shrink-0 border-b border-[#124633]/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#63ff9b]">
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
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4 pr-2">
            {!details.length && (
              <div className="rounded-2xl border border-[#124633] bg-[#06110c] p-4 text-slate-300">
                {labels.empty}
              </div>
            )}

            {details.map((item) => (
              <div key={item.id} className="rounded-2xl border border-[#124633] bg-[#06110c] p-3">
                <div className="flex gap-3">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#1eff7a]/25 bg-[radial-gradient(circle_at_top,rgba(42,255,150,.25),transparent_28%),linear-gradient(180deg,#092117,#031109)] p-2">
                    <img
                      src="/vbucks-green.png"
                      alt="Moneda de paVos"
                      className="h-full w-full object-contain drop-shadow-[0_0_10px_rgba(43,255,136,.35)]"
                      loading="lazy"
                    />
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

          <div className="shrink-0 border-t border-[#124633]/70 bg-[rgba(4,18,13,0.96)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="rounded-2xl border border-[#124633] bg-[rgba(6,17,12,0.92)] p-4 backdrop-blur-sm">
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
                  className="rounded-2xl bg-[#15d863] px-4 py-3 text-sm font-black text-[#06110a] shadow-[0_0_18px_rgba(21,216,99,0.18)] transition hover:brightness-110"
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
                  {labels.clear}
                </button>
              </div>
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
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#63ff9b]">{title}</p>
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
                <span className="block text-sm font-black text-white">
                  {item.title} x{item.qty}
                </span>
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
                <p className="text-[11px] font-black uppercase tracking-[0.25em] text-[#63ff9b]">{labels.giftData}</p>
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
                  <span className="block text-xs leading-5 text-slate-400">{labels.splitHelp}</span>
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
          <Link href="/tienda" className="flex items-center gap-2">
            <span className="text-3xl font-black italic leading-none text-white sm:text-4xl">
              {labels.brand}
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
              <span className="flex h-5 w-5 items-center justify-center text-[#63ff9b]">
                <GlobeIcon className="h-4 w-4" />
              </span>
            </button>

            <Link
              href={authHref}
              aria-label={authLabel}
              title={authLabel}
              className="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-[#1eff7a]/35 bg-[#07140f] p-1.5 text-[#67ff9a] shadow-[0_0_18px_rgba(21,216,99,0.10)] transition hover:scale-105 hover:border-[#67ff9a] hover:bg-[#0b1f15]"
            >
              <img
                src="/gankergames-profile-icon.png"
                alt={authLabel}
                className="h-full w-full object-contain"
              />
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#1eff7a]/35 bg-[#07140f] text-[#67ff9a] transition hover:border-[#67ff9a] hover:bg-[#0b1f15]"
              aria-label={labels.menu}
            >
              <MenuIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="rounded-[34px] border border-[#124633] bg-[#04120d]/78 p-5 shadow-[0_0_45px_rgba(21,216,99,.08)] backdrop-blur md:p-8">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.42em] text-[#67ff9a]">{labels.heroKicker}</p>
            <h1 className="mt-3 text-4xl font-black italic leading-none text-white sm:text-6xl">
              {labels.heroTitle}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{labels.heroDesc}</p>
            <p className="mt-2 max-w-2xl text-sm font-semibold leading-7 text-[#8effb5]">{labels.heroExtra}</p>

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

      </section>

      {!showScrollTop && (
        <button
          type="button"
          onClick={scrollToBottom}
          aria-label="Ir al fondo"
          className="fixed bottom-24 right-5 z-[61] flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#8cff9f] bg-[linear-gradient(135deg,#0d2418_0%,#0a1c12_100%)] text-[#67ff9a] shadow-[0_0_0_2px_rgba(21,255,98,0.14),0_0_24px_rgba(21,255,98,0.32),0_10px_22px_rgba(0,0,0,0.40)] transition hover:scale-105 hover:border-[#b4ffc0] hover:text-white md:bottom-[108px] md:right-7 md:h-14 md:w-14"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 5v13" />
            <path d="m6 12 6 6 6-6" />
          </svg>
        </button>
      )}

      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Volver arriba"
          className="fixed bottom-24 right-5 z-[61] flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#8cff9f] bg-[linear-gradient(135deg,#0d2418_0%,#0a1c12_100%)] text-[#67ff9a] shadow-[0_0_0_2px_rgba(21,255,98,0.14),0_0_24px_rgba(21,255,98,0.32),0_10px_22px_rgba(0,0,0,0.40)] transition hover:scale-105 hover:border-[#b4ffc0] hover:text-white md:bottom-[108px] md:right-7 md:h-14 md:w-14"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 19V6" />
            <path d="m6 12 6-6 6 6" />
          </svg>
        </button>
      )}

      <button
        type="button"
        onClick={() => setCartOpen(true)}
        className={`fixed bottom-5 right-5 z-[60] flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-[#8cff9f] bg-[linear-gradient(135deg,#16e83d_0%,#0dbb2e_48%,#07851f_100%)] text-white shadow-[0_0_0_2px_rgba(21,255,98,0.20),0_0_24px_rgba(21,255,98,0.68),0_10px_22px_rgba(0,0,0,0.46)] ring-2 ring-[#18ff63]/35 transition hover:scale-105 hover:shadow-[0_0_0_2px_rgba(21,255,98,0.28),0_0_34px_rgba(21,255,98,0.88),0_10px_22px_rgba(0,0,0,0.46)] active:scale-95 md:bottom-7 md:right-7 md:h-14 md:w-14 ${cartPulse ? "animate-[cartPop_620ms_ease-out]" : ""}`}
        aria-label={labels.cart}
      >
        <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_22%,rgba(255,255,255,0.30),rgba(255,255,255,0.08)_33%,rgba(255,255,255,0)_62%)]" />

        {cartPulse && (
          <span className="absolute right-[calc(100%+0.55rem)] top-1/2 z-20 -translate-y-1/2 whitespace-nowrap rounded-full border border-[#8cff9f] bg-[#07140f] px-3 py-1 text-[10px] font-black uppercase tracking-wide text-[#67ff9a] shadow-[0_0_18px_rgba(21,216,99,0.35)]">
            Agregado
          </span>
        )}

        <svg
          viewBox="0 0 24 24"
          className="relative z-10 h-[58%] w-[58%] drop-shadow-[0_3px_5px_rgba(0,0,0,0.28)] md:h-[60%] md:w-[60%]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="9" cy="20" r="1.25" fill="currentColor" stroke="none" />
          <circle cx="17" cy="20" r="1.25" fill="currentColor" stroke="none" />
          <path d="M3 4h2.2l1.6 8.2a1 1 0 0 0 1 .8h8.9a1 1 0 0 0 1-.76L19 7H6.1" />
          <path d="M8 16h10" />
        </svg>

        {cartCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 z-20 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-white bg-red-600 px-1 text-[11px] font-black leading-none text-white shadow-[0_0_14px_rgba(255,0,0,0.75)] md:h-7 md:min-w-7 md:text-[12px]">
            {cartCount}
          </span>
        )}
      </button>

      <MobileMenuDrawer
        open={mobileMenuOpen}
        labels={labels}
        cartCount={cartCount}
        authHref={authHref}
        onClose={() => setMobileMenuOpen(false)}
        onCartOpen={() => setCartOpen(true)}
      />
      {renderCartDrawer()}
      <GiftModal />

      <style jsx global>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }

          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }

          to {
            transform: translateX(100%);
            opacity: 0.65;
          }
        }

        @keyframes cartPop {
          0% {
            transform: scale(1);
          }

          35% {
            transform: scale(1.18) rotate(-6deg);
          }

          65% {
            transform: scale(0.96) rotate(4deg);
          }

          100% {
            transform: scale(1) rotate(0deg);
          }
        }
      `}</style>
    </main>
  );
}
