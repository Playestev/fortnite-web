"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ProfileNotificationCenter from "@/components/ProfileNotificationCenter";
import {
  BadgeCheck,
  ShieldCheck,
  Ban,
  CalendarDays,
  ArrowDown,
  ArrowUp,
  MapPin,
  Clock,
  Gamepad2,
  Gift,
  Globe2,
  LogOut,
  Menu,
  X,
  Crown,
  Settings,
  ChevronRight,
  Star,
  Ticket,
  Trophy,
  User,
  UsersRound,
  Tag,
  Zap,
} from "lucide-react";

const games = [
  {
    default_key: "fortnite",
    title: "Fortnite",
    url: "https://www.fortnite.com/",
    image_url: "/interests/fortnite.png",
    gradient: "from-[#1eff7a] via-emerald-600 to-zinc-950",
  },
  {
    default_key: "comunidad-fortnite",
    title: "Comunidad Fortnite",
    url: "https://communities.epicgames.com/",
    image_url: "/interests/comunidad-fortnite.png",
    gradient: "from-cyan-500 via-blue-700 to-zinc-950",
  },
  {
    default_key: "tienda-fortnite",
    title: "Tienda Fortnite",
    url: "https://fortnite-web-eosin.vercel.app/",
    image_url: "/interests/tienda-fortnite.png",
    gradient: "from-purple-600 via-fuchsia-600 to-zinc-950",
  },
  {
    default_key: "noticias-fortnite",
    title: "Noticias Fortnite",
    url: "https://www.fortnite.com/news",
    image_url: "/interests/noticias-fortnite.png",
    gradient: "from-orange-500 via-red-600 to-zinc-950",
  },
  {
    default_key: "ganker-games-facebook",
    title: "Ganker Games Facebook",
    url: "https://www.facebook.com/gankergames",
    image_url: "/interests/ganker-games-facebook.png",
    gradient: "from-slate-400 via-zinc-700 to-black",
  },
];

function getVipLevelFromMonths(months) {
  const cleanMonths = Math.max(0, Number(months || 0));
  if (cleanMonths <= 12) return 1;
  return Math.ceil(cleanMonths / 12);
}

function getVipBadgeLabelFromMonths(months) {
  const level = getVipLevelFromMonths(months);
  return level > 1 ? `GKG VIP ${level}` : "GKG VIP";
}

const TAG_COLOR_CLASSES = [
  "border-[#1eff7a]/45 bg-[#1eff7a]/12 text-[#63ff9b] shadow-[0_0_12px_rgba(30,255,122,.14)]",
  "border-cyan-300/45 bg-cyan-300/12 text-cyan-100 shadow-[0_0_12px_rgba(103,232,249,.14)]",
  "border-fuchsia-300/45 bg-fuchsia-400/12 text-fuchsia-100 shadow-[0_0_12px_rgba(217,70,239,.14)]",
  "border-yellow-300/45 bg-yellow-300/12 text-yellow-100 shadow-[0_0_12px_rgba(253,224,71,.14)]",
  "border-orange-300/45 bg-orange-400/12 text-orange-100 shadow-[0_0_12px_rgba(251,146,60,.14)]",
  "border-sky-300/45 bg-sky-400/12 text-sky-100 shadow-[0_0_12px_rgba(56,189,248,.14)]",
  "border-rose-300/45 bg-rose-400/12 text-rose-100 shadow-[0_0_12px_rgba(251,113,133,.14)]",
  "border-violet-300/45 bg-violet-400/12 text-violet-100 shadow-[0_0_12px_rgba(167,139,250,.14)]",
];

function getStableTagColorIndex(tag, index = 0) {
  const value = String(tag?.tag_text || tag || "");
  let hash = index;

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 9973;
  }

  return Math.abs(hash) % TAG_COLOR_CLASSES.length;
}

function getTagColorClasses(tag, index = 0) {
  return TAG_COLOR_CLASSES[getStableTagColorIndex(tag, index)];
}

function isCreatorAccount(role) {
  return ["admin", "creator", "creador"].includes(String(role || "").toLowerCase());
}

function CreatorBadge({ className = "", size = "sm" }) {
  const textSize = size === "xs" ? "text-[10px]" : "text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border border-zinc-300/45 bg-zinc-300/10 px-3 py-1 font-black uppercase tracking-wide text-zinc-100 shadow-[0_0_16px_rgba(212,212,216,.18)] ${textSize} ${className}`}
      title="GKG Creador"
    >
      <ShieldCheck size={size === "xs" ? 13 : 15} />
      GKG Creador
    </span>
  );
}

function getProfileName(profile) {
  if (!profile) return "Jugador GKG";

  const fullName = `${profile.first_name || ""} ${profile.middle_name || ""} ${profile.last_name || ""}`
    .replace(/\s+/g, " ")
    .trim();

  return fullName || profile.display_name || profile.ganker_user || "Jugador GKG";
}

function formatDateMX(dateString) {
  if (!dateString) return "No visible";

  const date = new Date(`${dateString}T12:00:00`);

  if (Number.isNaN(date.getTime())) return "No visible";

  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}


function formatAgeFromBirthday(dateString) {
  if (!dateString) return "No visible";

  const birthDate = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(birthDate.getTime())) return "No visible";

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age -= 1;
  }

  if (age < 0 || age > 120) return "No visible";

  return `${age} años`;
}

function getPresenceConfig(status) {
  if (status === "away") {
    return {
      label: "Ausente",
      dot: "bg-yellow-300",
      border: "border-yellow-300",
      text: "text-yellow-200",
      shadow: "shadow-[0_0_26px_rgba(253,224,71,0.32)]",
    };
  }

  if (status === "offline") {
    return {
      label: "No en línea",
      dot: "bg-red-400",
      border: "border-red-400",
      text: "text-red-300",
      shadow: "shadow-[0_0_26px_rgba(248,113,113,0.22)]",
    };
  }

  return {
    label: "En línea",
    dot: "bg-[#1eff7a]",
    border: "border-[#1eff7a]",
    text: "text-[#63ff9b]",
    shadow: "shadow-[0_0_30px_rgba(30,255,122,0.35)]",
  };
}

function AvatarDisplay({ src, alt, status = "offline", size = "lg" }) {
  const config = getPresenceConfig(status);
  const sizes = {
    sm: "h-12 w-12",
    md: "h-20 w-20",
    lg: "h-36 w-36",
  };

  return (
    <div
      className={`relative shrink-0 rounded-full border-4 bg-black ${sizes[size] || sizes.lg} ${config.border} ${config.shadow}`}
      title={alt}
    >
      {src ? (
        <img src={src} alt={alt} className="h-full w-full rounded-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-[radial-gradient(circle_at_50%_35%,#f2f2f2_0_26%,#4b4d52_27%_100%)]">
          <User className="text-zinc-700" size={size === "lg" ? 72 : 40} />
        </div>
      )}
    </div>
  );
}

function Card({ children, className = "" }) {
  return (
    <div className={`rounded-3xl border border-[#1eff7a]/20 bg-[#020804]/80 p-5 shadow-[0_0_30px_rgba(30,255,122,.08)] ${className}`}>
      {children}
    </div>
  );
}

function ProfileTagPills({ tags = [], className = "" }) {
  if (!tags.length) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {tags.map((tag, index) => (
        <span
          key={tag.id || tag.tag_text}
          className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-[11px] font-black transition hover:scale-[1.02] ${getTagColorClasses(tag, index)}`}
        >
          <Tag size={12} />
          {tag.tag_text}
        </span>
      ))}
    </div>
  );
}

function StatItem({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 border-b border-[#1eff7a]/12 p-4 last:border-b-0 md:border-b-0 md:border-r md:last:border-r-0">
      <Icon className="text-[#1eff7a]" size={28} />
      <div>
        <p className="text-xl font-black">{value}</p>
        <p className="text-xs text-zinc-400">{label}</p>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm text-zinc-300">
      <span className="flex items-center gap-2 text-zinc-400">
        <Icon size={16} />
        {label}
      </span>
      <span className="text-right font-bold text-white">{value}</span>
    </div>
  );
}

function PublicProfileTabsDrawer({ open, items, activeTab = "Perfil", onSelect, onClose }) {
  const [shouldRender, setShouldRender] = useState(open);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    let timeoutId;

    if (open) {
      setShouldRender(true);
      setIsClosing(false);
    } else if (shouldRender) {
      setIsClosing(true);
      timeoutId = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 220);
    }

    return () => clearTimeout(timeoutId);
  }, [open, shouldRender]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-[140] md:hidden">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" onClick={onClose} />

      <div
        className={`absolute right-0 top-0 h-full w-[86%] max-w-sm border-l border-[#1eff7a]/30 bg-[rgba(3,16,9,0.92)] p-5 shadow-[0_0_45px_rgba(21,216,99,0.16)] backdrop-blur-xl ${
          isClosing ? "animate-[slideOutRight_220ms_ease-in]" : "animate-[slideInRight_220ms_ease-out]"
        }`}
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src="/gankergames-header-logo.png"
              alt="Logo de Ganker Games"
              className="h-12 w-auto max-w-[180px] object-contain drop-shadow-[0_0_12px_rgba(30,255,122,.40)]"
            />

            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#67ff9a]">
              Perfil
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[#1eff7a]/35 bg-[#07140f]/86 px-4 py-3 text-sm font-black text-white shadow-[0_0_18px_rgba(21,216,99,0.10)] transition hover:border-[#67ff9a] hover:text-[#67ff9a]"
            aria-label="Cerrar menú"
          >
            ✕
          </button>
        </div>

        <div className="grid gap-3">
          {items.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  onSelect(item.key);
                  onClose();
                  if (typeof window !== "undefined") {
                    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 60);
                  }
                }}
                className={`flex items-center justify-between rounded-2xl px-4 py-4 text-left text-base font-black transition ${
                  active
                    ? "border border-[#1eff7a] bg-[#1eff7a] text-black shadow-[0_0_22px_rgba(21,216,99,0.22)]"
                    : "border border-[#1eff7a]/20 bg-[#07140f]/88 text-white hover:border-[#67ff9a] hover:text-[#67ff9a]"
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon size={20} />
                  {item.name}
                </span>

                <ChevronRight size={18} />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function PublicProfilePage() {
  const params = useParams();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [profile, setProfile] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [blockMessage, setBlockMessage] = useState("");
  const [blockLoading, setBlockLoading] = useState(false);
  const [customInterests, setCustomInterests] = useState([]);
  const [profileTags, setProfileTags] = useState([]);
  const [publicStats, setPublicStats] = useState({
    premios: 0,
    sorteos: 0,
    participaciones: 0,
    followers: 0,
    following: 0,
  });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [publicMenuOpen, setPublicMenuOpen] = useState(false);


  useEffect(() => {
    if (typeof document === "undefined") return undefined;

    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    function handleScroll() {
      setShowScrollTop(window.scrollY > 420);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleFloatingScroll() {
    if (typeof window === "undefined") return;

    if (showScrollTop) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    window.scrollTo({
      top: document.documentElement.scrollHeight || document.body.scrollHeight,
      behavior: "smooth",
    });
  }

  async function handleHeaderSessionAction() {
    if (currentUser?.id) {
      await supabase.auth.signOut();
      router.push("/login");
      return;
    }

    router.push("/login");
  }

  useEffect(() => {
    let active = true;

    const loadingSafetyTimeout = window.setTimeout(() => {
      if (!active) return;

      setLoading(false);
      setErrorMessage((current) =>
        current || "La carga del perfil tardó demasiado. Actualiza la página para intentarlo nuevamente."
      );
    }, 12000);

    async function loadPublicProfile() {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const sessionUser = sessionData.session?.user || null;
        setCurrentUser(sessionUser);

        if (sessionUser?.id) {
          try {
            const { data: myProfile } = await supabase
              .from("profiles")
              .select("id, account_role")
              .eq("id", sessionUser.id)
              .maybeSingle();

            if (active) setCurrentUserProfile(myProfile || null);
          } catch (myProfileError) {
            if (active) setCurrentUserProfile(null);
          }
        } else if (active) {
          setCurrentUserProfile(null);
        }

      const slug = decodeURIComponent(String(params?.slug || "")).trim();

      if (!slug) {
        setErrorMessage("No encontramos este perfil público.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc("get_public_profile_by_slug", {
        slug_input: slug,
      });

      if (error) {
        setErrorMessage(error.message || "No se pudo cargar el perfil público.");
        setLoading(false);
        return;
      }

      const publicProfile = Array.isArray(data) ? data[0] : data;

      if (!publicProfile) {
        setErrorMessage("Este perfil no está disponible, fue bloqueado o no permite búsqueda pública.");
        setLoading(false);
        return;
      }

        setProfile(publicProfile);
        setLoading(false);

        // Los datos secundarios se completan sin bloquear la vista principal.
        void Promise.allSettled([
          (async () => {
            try {
              const { data: interests } = await supabase
                .from("profile_interests")
                .select("*")
                .eq("profile_id", publicProfile.id)
                .order("created_at", { ascending: true });

              setCustomInterests(interests || []);
            } catch (interestError) {
              setCustomInterests([]);
            }
          })(),
          (async () => {
            try {
              const { data: tags } = await supabase
                .from("profile_tags")
                .select("*")
                .eq("profile_id", publicProfile.id)
                .order("created_at", { ascending: true });

              setProfileTags(tags || []);
            } catch (tagsError) {
              setProfileTags([]);
            }
          })(),
          (async () => {
            try {
              const { data: statsData, error: statsError } = await supabase.rpc(
                "get_profile_stats_by_id",
                { target_profile_id: publicProfile.id }
              );

              if (statsError) throw statsError;

              const stats = Array.isArray(statsData) ? statsData[0] : statsData;

              setPublicStats({
                premios: Number(stats?.premios || publicProfile.premios_count || 0),
                sorteos: Number(stats?.sorteos || publicProfile.sorteos_ganados_count || 0),
                participaciones: Number(stats?.participaciones || publicProfile.participaciones_count || 0),
                followers: Number(stats?.followers || 0),
                following: Number(stats?.following || 0),
              });
            } catch (statsError) {
              setPublicStats({
                premios: Number(publicProfile.premios_count || 0),
                sorteos: Number(publicProfile.sorteos_ganados_count || 0),
                participaciones: Number(publicProfile.participaciones_count || 0),
                followers: 0,
                following: 0,
              });
            }
          })(),
        ]);
      } catch (error) {
        console.error("Public profile initialization error:", error);
        setErrorMessage(
          error?.message || "No se pudo cargar el perfil público. Intenta nuevamente."
        );
      } finally {
        window.clearTimeout(loadingSafetyTimeout);

        if (active) {
          setLoading(false);
        }
      }
    }

    loadPublicProfile();

    return () => {
      active = false;
      window.clearTimeout(loadingSafetyTimeout);
    };
  }, [params, supabase]);

  async function handleGoBackToPrivateProfile() {
    router.push("/perfil");
  }

  async function handleBlockProfile() {
    if (!profile?.id) return;

    if (!currentUser?.id) {
      router.push("/login");
      return;
    }

    if (currentUser.id === profile.id) {
      router.push("/perfil");
      return;
    }

    setBlockLoading(true);
    setBlockMessage("");

    try {
      const { error } = await supabase.rpc("block_profile", {
        target_profile_id: profile.id,
      });

      if (error) throw error;

      setBlockMessage("Usuario bloqueado correctamente. Ya no aparecerá en tu comunidad.");
      setTimeout(() => {
        router.replace("/perfil");
      }, 900);
    } catch (error) {
      setBlockMessage(error.message || "No se pudo bloquear este perfil.");
    } finally {
      setBlockLoading(false);
    }
  }

  if (loading) {
    return (
      <main translate="no" className="relative flex min-h-screen items-center justify-center bg-[#001207] text-white">
        <GkgTwinkleBackground />
        <div className="rounded-3xl border border-[#1eff7a]/30 bg-[#020804] p-6 font-black text-[#1eff7a] shadow-[0_0_30px_rgba(30,255,122,.18)]">
          Cargando perfil público...
        </div>
    </main>
    );
  }

  if (errorMessage) {
    return (
      <main translate="no" className="relative flex min-h-screen items-center justify-center bg-[#001207] px-4 text-white">
        <GkgTwinkleBackground />
        <Card className="max-w-md text-center">
          <h1 className="text-2xl font-black text-red-300">Perfil no disponible</h1>
          <p className="mt-3 text-sm text-zinc-400">{errorMessage}</p>
          <button
            type="button"
            onClick={handleGoBackToPrivateProfile}
            className="mt-5 rounded-2xl border border-[#1eff7a]/35 bg-[#021509] px-5 py-3 text-sm font-black text-[#63ff9b] hover:border-[#63ff9b]"
          >
            Volver a mi perfil
          </button>
        </Card>
      </main>
    );
  }

  const displayName = getProfileName(profile);
  const statusConfig = getPresenceConfig(profile.presence_status || "offline");
  const showCountry = profile.show_country !== false && profile.country;
  const showBirthday = profile.show_birthday !== false && profile.birthday;
  const vipUntilDate = profile.vip_until ? new Date(profile.vip_until) : null;
  const vipGraceDate = profile.vip_grace_until ? new Date(profile.vip_grace_until) : null;
  const vipUntilMs = vipUntilDate && !Number.isNaN(vipUntilDate.getTime()) ? vipUntilDate.getTime() : null;
  const vipGraceMs = vipGraceDate && !Number.isNaN(vipGraceDate.getTime()) ? vipGraceDate.getTime() : null;
  const publicIsVip = Boolean(
    profile.is_vip &&
    (vipUntilMs === null || vipUntilMs >= Date.now() || (vipGraceMs !== null && vipGraceMs >= Date.now()))
  );
  const vipMonths = publicIsVip
    ? Math.max(1, Number(profile.vip_streak_months || profile.vip_cycle_months || 1))
    : 0;
  const vipBadgeLabel = getVipBadgeLabelFromMonths(vipMonths);
  const publicIsCreator = isCreatorAccount(profile.account_role);
  const currentUserCanAccessCreator = isCreatorAccount(currentUserProfile?.account_role);
  const publicMenuItems = [
    { name: "Perfil", key: "Perfil", icon: User },
    { name: "Comunidad", key: "Comunidad", icon: UsersRound },
    { name: "VIP", key: "VIP", icon: Crown },
    { name: "Premios", key: "Premios", icon: Trophy },
    { name: "Sorteos", key: "Sorteos", icon: Gift },
    { name: "Configuración", key: "Configuración", icon: Settings },
    ...(currentUserCanAccessCreator ? [{ name: "Creador", key: "Creador", icon: ShieldCheck }] : []),
  ];
  const overrideByKey = new Map(
    (customInterests || [])
      .filter((item) => item.default_key)
      .map((item) => [item.default_key, item])
  );

  const publicInterests = [
    ...games
      .map((game) => {
        const override = overrideByKey.get(game.default_key);

        if (override?.is_hidden) return null;

        return {
          ...game,
          title: override?.title || game.title,
          url: override?.url || game.url || "#",
          image_url: override?.image_url || game.image_url || "",
        };
      })
      .filter(Boolean),
    ...(customInterests || [])
      .filter((item) => !item.default_key && !item.is_hidden)
      .map((item) => ({
        title: item.title,
        url: item.url || "#",
        image_url: item.image_url || "",
        gradient: "from-cyan-400 via-blue-700 to-zinc-950",
      })),
  ];

  return (
    <main translate="no" className="relative isolate min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top,_rgba(0,255,102,0.14),_transparent_24%),linear-gradient(180deg,#001f0b_0%,#001708_45%,#001207_100%)] text-white">
      <style jsx global>{`
        @keyframes gkgTwinkle {
          0%, 100% { opacity: 0.22; transform: scale(0.82); }
          50% { opacity: 1; transform: scale(1.14); }
        }
        @keyframes gkgFloatGlow {
          0%, 100% { opacity: 0.16; transform: translate3d(0, 0, 0); }
          50% { opacity: 0.36; transform: translate3d(0, -12px, 0); }
        }
        @keyframes mobileMenuDrop {
          from { transform: translateY(-14px) scale(0.94); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0.65; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0.65; }
        }
      `}</style>
      <GkgTwinkleBackground />
      <header className="sticky top-0 z-[100] w-full max-w-[100vw] overflow-hidden border-b border-[#0f3d22] bg-[#020804]/95 supports-[backdrop-filter]:bg-[#020804]/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-2 px-3 py-2 sm:px-4 sm:py-3">
          <div
            aria-label="Logo de GankerGames"
            className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3"
          >
            <img
              src="/gankergames-header-logo.png"
              alt="Logo de Ganker Games"
              className="h-9 w-auto max-w-[112px] shrink-0 object-contain drop-shadow-[0_0_12px_rgba(30,255,122,.40)] sm:h-11 sm:max-w-[155px]"
            />

            <span className="inline shrink-0 text-[8px] font-black uppercase tracking-[0.14em] text-[#63ff9b] sm:text-xs sm:tracking-[0.28em]">
              Perfil público
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="flex h-11 items-center gap-1 rounded-2xl border border-[#1eff7a]/35 bg-[#021509] px-2 text-xs font-black uppercase tracking-wide text-[#63ff9b] shadow-[0_0_20px_rgba(30,255,122,.12)] transition hover:border-[#63ff9b] sm:h-12 sm:gap-2 sm:px-4 sm:text-sm"
              title="Idioma"
              aria-label="Idioma: español"
            >
              <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black text-white sm:text-[11px]">ESP</span>
              <Globe2 size={16} />
            </button>

            <button
              type="button"
              onClick={handleGoBackToPrivateProfile}
              aria-label={currentUser?.id ? "Regresar a mi perfil" : "Ir al inicio de sesión"}
              title={currentUser?.id ? "Regresar a mi perfil" : "Ir al inicio de sesión"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#1eff7a]/40 bg-[#021509] text-[#63ff9b] shadow-[0_0_20px_rgba(30,255,122,.14)] transition hover:border-[#63ff9b] hover:bg-[#063115] sm:h-12 sm:w-12"
            >
              <img
                src="/gankergames-profile-icon.png"
                alt=""
                aria-hidden="true"
                className="h-8 w-8 object-contain"
              />
            </button>

            {currentUser?.id && (
              <ProfileNotificationCenter
                supabase={supabase}
                userId={currentUser.id}
                onNavigateTab={(tabKey) => {
                  router.push(`/perfil?tab=${encodeURIComponent(tabKey || "Perfil")}`);
                }}
              />
            )}

            <button
              type="button"
              onClick={handleHeaderSessionAction}
              aria-label={currentUser?.id ? "Cerrar sesión" : "Iniciar sesión"}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-red-500/40 bg-red-500/10 text-sm font-black text-red-300 shadow-[0_0_18px_rgba(239,68,68,.10)] transition hover:bg-red-500/20 sm:h-12 sm:w-auto sm:gap-2 sm:px-4"
              title={currentUser?.id ? "Cerrar sesión" : "Iniciar sesión"}
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">
                {currentUser?.id ? "Cerrar sesión" : "Iniciar sesión"}
              </span>
            </button>
          </div>
        </div>
      </header>

      <button
        type="button"
        onClick={() => setPublicMenuOpen(true)}
        aria-label="Abrir menú del perfil"
        title="Abrir menú del perfil"
        className="fixed right-3 top-[64px] z-[120] flex h-12 w-12 translate-y-1 items-center justify-center rounded-2xl border border-[#1eff7a]/35 bg-[#07140f]/95 text-[#67ff9a] shadow-[0_0_18px_rgba(21,216,99,0.16)] transition-all duration-300 hover:border-[#67ff9a] hover:bg-[#0b1f15] md:hidden"
        style={{ animation: "mobileMenuDrop 260ms ease-out" }}
      >
        <span className="flex flex-col gap-1.5">
          <span className="block h-0.5 w-5 rounded-full bg-current" />
          <span className="block h-0.5 w-5 rounded-full bg-current" />
          <span className="block h-0.5 w-5 rounded-full bg-current" />
        </span>
      </button>

      <PublicProfileTabsDrawer
        open={publicMenuOpen}
        items={publicMenuItems}
        activeTab="Perfil"
        onSelect={(key) => {
          setPublicMenuOpen(false);
          router.push(`/perfil?tab=${encodeURIComponent(key)}`);
        }}
        onClose={() => setPublicMenuOpen(false)}
      />

      <section className="relative overflow-hidden border-b border-[#0f3d22]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_25%,rgba(30,255,122,0.22),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(0,255,102,0.12),transparent_25%),linear-gradient(180deg,#06240f_0%,#001808_100%)]" />
        <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(30,255,122,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(30,255,122,.08)_1px,transparent_1px)] [background-size:42px_42px]" />

        <div className="relative mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end">
            <div className="flex items-center gap-4 lg:hidden">
              <AvatarDisplay
                src={profile.avatar_url || ""}
                alt={displayName}
                status={profile.presence_status || "offline"}
                size="lg"
              />

              <div className="min-w-0 flex-1 space-y-2">
                <span className="inline-flex rounded-lg border border-[#1eff7a]/40 bg-[#1eff7a]/10 px-3 py-1 text-xs font-bold text-[#63ff9b]">
                  #{profile.public_profile_number || profile.ganker_user || "GKG"}
                </span>

                {(publicIsCreator || publicIsVip) && (
                  <div className="ml-7 flex flex-col items-start gap-2.5">
                    {publicIsCreator && (
                      <div className="flex items-center gap-2">
                        <ShieldCheck
                          className="text-zinc-300 drop-shadow-[0_0_12px_rgba(212,212,216,.45)]"
                          size={24}
                        />
                        <span className="rounded-lg border border-zinc-300/45 bg-zinc-300/10 px-3 py-1 text-xs font-bold text-zinc-200 shadow-[0_0_16px_rgba(212,212,216,.16)]">
                          GKG Creador
                        </span>
                      </div>
                    )}

                    {publicIsVip && (
                      <div className="flex flex-wrap items-center gap-2">
                        <BadgeCheck className="text-cyan-300 drop-shadow-[0_0_12px_rgba(103,232,249,.55)]" size={24} />
                        <span className="rounded-lg border border-cyan-300/45 bg-cyan-300/10 px-3 py-1 text-xs font-bold text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,.18)]">
                          {vipBadgeLabel}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="hidden lg:block">
              <AvatarDisplay
                src={profile.avatar_url || ""}
                alt={displayName}
                status={profile.presence_status || "offline"}
                size="lg"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="max-w-full break-words text-3xl font-black italic leading-tight tracking-tight text-white drop-shadow-[4px_4px_0_rgba(0,0,0,.95)] sm:text-4xl md:text-5xl">
                  {displayName}
                </h1>

                <span className="hidden rounded-lg border border-[#1eff7a]/40 bg-[#1eff7a]/10 px-3 py-1 text-sm font-bold text-[#63ff9b] lg:inline-flex">
                  #{profile.public_profile_number || profile.ganker_user || "GKG"}
                </span>

                {(publicIsCreator || publicIsVip) && (
                  <div className="ml-6 hidden shrink-0 flex-col items-start gap-2.5 lg:flex">
                    {publicIsCreator && (
                      <div className="flex items-center gap-2">
                        <ShieldCheck
                          className="text-zinc-300 drop-shadow-[0_0_12px_rgba(212,212,216,.45)]"
                          size={28}
                        />
                        <span className="rounded-lg border border-zinc-300/45 bg-zinc-300/10 px-3 py-1 text-sm font-bold text-zinc-200 shadow-[0_0_16px_rgba(212,212,216,.16)]">
                          GKG Creador
                        </span>
                      </div>
                    )}

                    {publicIsVip && (
                      <div className="flex items-center gap-2">
                        <BadgeCheck className="text-cyan-300 drop-shadow-[0_0_12px_rgba(103,232,249,.55)]" size={28} />
                        <span className="rounded-lg border border-cyan-300/45 bg-cyan-300/10 px-3 py-1 text-sm font-bold text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,.18)]">
                          {vipBadgeLabel}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-zinc-300">
                <span className={`h-2.5 w-2.5 rounded-full ${statusConfig.dot}`} />
                <span className={statusConfig.text}>{statusConfig.label}</span>
                <span className="text-zinc-500">|</span>
                <span>{profile.ganker_user || "Usuario GKG"}</span>
              </div>

              {currentUser?.id !== profile.id && (
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleBlockProfile}
                    disabled={blockLoading}
                    className="inline-flex items-center gap-2 rounded-2xl border border-red-500/45 bg-red-500/10 px-5 py-3 text-sm font-black text-red-200 transition hover:bg-red-500/20 disabled:opacity-60"
                  >
                    <Ban size={18} />
                    {blockLoading ? "Bloqueando..." : "Bloquear perfil"}
                  </button>

                  {blockMessage && (
                    <span className="rounded-2xl border border-[#1eff7a]/20 bg-[#021509] px-4 py-3 text-xs font-bold text-[#63ff9b]">
                      {blockMessage}
                    </span>
                  )}
                </div>
              )}

              <div className="mt-6 grid grid-cols-[1fr_0.72fr] gap-3 md:block">
                <div className="grid overflow-hidden rounded-2xl border border-[#1eff7a]/20 bg-[#020804]/55 backdrop-blur md:grid-cols-3">
                  <StatItem icon={Trophy} value={publicStats.premios || 0} label="Premios" />
                  <StatItem icon={Gift} value={publicStats.sorteos || 0} label="Sorteos ganados" />
                  <StatItem icon={Ticket} value={publicStats.participaciones || 0} label="Participaciones" />
                </div>

                <div className="grid overflow-hidden rounded-2xl border border-[#1eff7a]/20 bg-[#020804]/55 backdrop-blur md:hidden">
                  <div className="flex flex-col items-center justify-center border-b border-[#1eff7a]/15 p-3 text-center">
                    <UsersRound className="mb-1 text-zinc-400" size={22} />
                    <p className="text-[11px] text-zinc-400">Seguidores</p>
                    <p className="text-lg font-black">{publicStats.followers}</p>
                  </div>
                  <div className="flex flex-col items-center justify-center p-3 text-center">
                    <UsersRound className="mb-1 text-zinc-400" size={22} />
                    <p className="text-[11px] text-zinc-400">Siguiendo</p>
                    <p className="text-lg font-black">{publicStats.following}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-6 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-5">
          <Card>
            <h2 className="mb-5 text-lg font-black">Información usuario</h2>
            <div className="rounded-2xl border border-[#1eff7a]/15 bg-[#021509]/70 p-4">
              <h3 className="text-xl font-black">{displayName}</h3>
              <p className="mt-1 text-sm text-zinc-400">{profile.ganker_user || "Usuario GKG"}</p>
              <ProfileTagPills tags={profileTags} className="mt-3" />
            </div>

            <div className="mt-6 space-y-4 border-t border-[#1eff7a]/15 pt-5">
              {showCountry && <InfoRow icon={MapPin} label="País" value={profile.country} />}
              <InfoRow icon={Clock} label="Estado" value={statusConfig.label} />
              {showBirthday && <InfoRow icon={CalendarDays} label="Edad" value={formatAgeFromBirthday(profile.birthday)} />}
            </div>
          </Card>

          <Card className="hidden md:block">
            <h2 className="mb-5 text-lg font-black">Seguidores</h2>
            <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-[#1eff7a]/15">
              <div className="border-r border-[#1eff7a]/15 p-4 text-center">
                <UsersRound className="mx-auto mb-2 text-zinc-400" />
                <p className="text-xs text-zinc-400">Seguidores</p>
                <p className="text-xl font-black">{publicStats.followers}</p>
              </div>
              <div className="p-4 text-center">
                <UsersRound className="mx-auto mb-2 text-zinc-400" />
                <p className="text-xs text-zinc-400">Siguiendo</p>
                <p className="text-xl font-black">{publicStats.following}</p>
              </div>
            </div>
          </Card>
        </aside>

        <section className="space-y-5">
          <Card>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-black">Intereses del jugador</h2>
              <span className="text-sm font-bold text-[#63ff9b]">Ver todos</span>
            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {publicInterests.map((game) => (
                <a
                  key={game.title}
                  href={game.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group overflow-hidden rounded-2xl border border-[#1eff7a]/15 bg-[#020804]/70 transition hover:-translate-y-1 hover:border-[#1eff7a]/60 hover:shadow-[0_0_24px_rgba(30,255,122,.18)]"
                >
                  <div className={`relative h-36 overflow-hidden bg-gradient-to-br ${game.gradient}`}>
                    {game.image_url && (
                      <img src={game.image_url} alt={game.title} className="absolute inset-0 h-full w-full object-cover" />
                    )}
                    <Star className="absolute left-3 top-3 text-white drop-shadow" size={18} />
                    <div className="absolute inset-0 bg-black/20" />
                  </div>
                  <div className="p-3">
                    <h3 className="min-h-12 text-sm font-black leading-tight transition group-hover:text-[#63ff9b]">
                      {game.title}
                    </h3>
                  </div>
                </a>
              ))}
            </div>
          </Card>

          <Card>
            <h2 className="mb-5 text-lg font-black">Actividad reciente</h2>
            <div className="space-y-4">
              {[
                [Gift, publicStats.participaciones > 0 ? `tiene ${publicStats.participaciones} participación(es) en sorteos` : "aún no tiene participaciones registradas", "Sorteos"],
                [BadgeCheck, publicIsVip ? `tiene insignia ${vipBadgeLabel} activa` : "es Miembro GKG sin VIP activo", "Membresía"],
                [Zap, `aparece con estado ${statusConfig.label}`, "Estado actual"],
              ].map(([Icon, title, time]) => (
                <div key={title} className="flex items-center justify-between rounded-2xl border border-[#1eff7a]/15 bg-[#020804]/65 p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1eff7a]/10 text-[#1eff7a]">
                      <Icon size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-zinc-200">{displayName} {title}</p>
                      <p className="text-xs text-zinc-500">{time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>
      </section>
      <button
        type="button"
        onClick={handleFloatingScroll}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#63ff9b] bg-[#042812]/95 text-[#63ff9b] shadow-[0_0_24px_rgba(30,255,122,.35)] transition duration-300 hover:scale-110 hover:bg-[#063b1b] md:bottom-7 md:right-7"
        title={showScrollTop ? "Subir" : "Bajar"}
      >
        {showScrollTop ? <ArrowUp size={26} /> : <ArrowDown size={26} />}
      </button>

    </main>
  );
}



const GKG_TWINKLE_STARS = [
  { left: "8%", top: "10%", size: 3, delay: "0s", duration: "2.6s", opacity: 0.95 },
  { left: "19%", top: "30%", size: 2, delay: ".5s", duration: "2.1s", opacity: 0.82 },
  { left: "33%", top: "14%", size: 4, delay: ".8s", duration: "3s", opacity: 0.88 },
  { left: "47%", top: "8%", size: 2, delay: "1.3s", duration: "2.4s", opacity: 0.78 },
  { left: "63%", top: "18%", size: 3, delay: ".2s", duration: "2.8s", opacity: 0.92 },
  { left: "79%", top: "9%", size: 2, delay: "1.1s", duration: "2.2s", opacity: 0.72 },
  { left: "89%", top: "28%", size: 4, delay: ".9s", duration: "3.2s", opacity: 0.94 },
  { left: "12%", top: "45%", size: 2, delay: "1.8s", duration: "2.5s", opacity: 0.76 },
  { left: "26%", top: "57%", size: 3, delay: ".4s", duration: "2.9s", opacity: 0.9 },
  { left: "40%", top: "39%", size: 2, delay: "1.2s", duration: "2s", opacity: 0.7 },
  { left: "55%", top: "50%", size: 4, delay: "0s", duration: "3.1s", opacity: 0.96 },
  { left: "68%", top: "42%", size: 2, delay: "1.6s", duration: "2.4s", opacity: 0.8 },
  { left: "82%", top: "54%", size: 3, delay: ".7s", duration: "2.7s", opacity: 0.88 },
  { left: "92%", top: "63%", size: 2, delay: "1.5s", duration: "2.2s", opacity: 0.68 },
  { left: "10%", top: "73%", size: 4, delay: "1.1s", duration: "3s", opacity: 0.92 },
  { left: "23%", top: "86%", size: 2, delay: ".6s", duration: "2.4s", opacity: 0.76 },
  { left: "37%", top: "78%", size: 3, delay: "1.7s", duration: "2.8s", opacity: 0.84 },
  { left: "58%", top: "89%", size: 2, delay: ".3s", duration: "2.1s", opacity: 0.7 },
  { left: "76%", top: "81%", size: 4, delay: "1.4s", duration: "3.3s", opacity: 0.95 },
  { left: "90%", top: "92%", size: 2, delay: ".9s", duration: "2.3s", opacity: 0.74 },
];

function GkgTwinkleBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(30,255,122,0.16),transparent_0,transparent_22%),radial-gradient(circle_at_78%_16%,rgba(30,255,122,0.14),transparent_0,transparent_18%),radial-gradient(circle_at_68%_58%,rgba(99,255,155,0.12),transparent_0,transparent_20%),radial-gradient(circle_at_12%_88%,rgba(30,255,122,0.12),transparent_0,transparent_18%)]" />
      <div
        className="absolute left-[8%] top-[16%] h-40 w-40 rounded-full bg-[#1eff7a]/8 blur-3xl"
        style={{ animation: "gkgFloatGlow 7s ease-in-out infinite" }}
      />
      <div
        className="absolute right-[12%] top-[34%] h-48 w-48 rounded-full bg-[#63ff9b]/8 blur-3xl"
        style={{ animation: "gkgFloatGlow 8.5s ease-in-out infinite", animationDelay: "1.4s" }}
      />
      <div
        className="absolute bottom-[8%] left-[24%] h-52 w-52 rounded-full bg-[#1eff7a]/6 blur-3xl"
        style={{ animation: "gkgFloatGlow 9.2s ease-in-out infinite", animationDelay: ".7s" }}
      />
      {GKG_TWINKLE_STARS.map((star, index) => (
        <span
          key={`${star.left}-${star.top}-${index}`}
          className="absolute rounded-full bg-[#95ffd0] shadow-[0_0_10px_rgba(149,255,208,0.9)]"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animation: `gkgTwinkle ${star.duration} ease-in-out infinite`,
            animationDelay: star.delay,
          }}
        />
      ))}
    </div>
  );
}
