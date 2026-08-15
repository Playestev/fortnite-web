"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Gift,
  MessageCircle,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Star,
  Trash2,
  UsersRound,
  X,
} from "lucide-react";

const ACTIONS = [
  { key: "busco", label: "Lo busco", badge: "bg-sky-500/15 text-sky-200 border-sky-400/30" },
  { key: "intercambio", label: "Lo intercambio", badge: "bg-purple-500/15 text-purple-200 border-purple-400/30" },
  { key: "regalo", label: "Lo regalo", badge: "bg-emerald-500/15 text-emerald-200 border-emerald-400/30" },
  { key: "presto", label: "Lo presto / ayudo", badge: "bg-amber-500/15 text-amber-200 border-amber-400/30" },
  { key: "tengo", label: "Lo tengo", badge: "bg-zinc-500/15 text-zinc-200 border-zinc-400/30" },
];

const ACTION_BY_KEY = Object.fromEntries(ACTIONS.map((item) => [item.key, item]));

const SPRITES_FALLBACK = [
  { slug: "agua", name: "Espíritu Agua", image_path: "/sprites/espiritu-agua.webp", sort_order: 10 },
  { slug: "aura", name: "Espíritu Aura", image_path: "/sprites/espiritu-aura.webp", sort_order: 20 },
  { slug: "cero-punto", name: "Espíritu Cero Punto", image_path: "/sprites/espiritu-cero-punto.webp", sort_order: 30 },
  { slug: "de-sueno", name: "Espíritu de Sueño", image_path: "/sprites/espiritu-de-sueño.webp", sort_order: 40 },
  { slug: "demonio", name: "Espíritu Demonio", image_path: "/sprites/espiritu-demonio.webp", sort_order: 50 },
  { slug: "fantasma", name: "Espíritu Fantasma", image_path: "/sprites/espiritu-fantasma.webp", sort_order: 60 },
  { slug: "fuego", name: "Espíritu Fuego", image_path: "/sprites/espiritu-fuego.webp", sort_order: 70 },
  { slug: "goleador", name: "Espíritu Goleador", image_path: "/sprites/espiritu-goleador.webp", sort_order: 80 },
  { slug: "jefe", name: "Espíritu Jefe", image_path: "/sprites/espiritu-jefe.webp", sort_order: 90 },
  { slug: "parca", name: "Espíritu Parca", image_path: "/sprites/espiritu-parca.webp", sort_order: 100 },
  { slug: "pato", name: "Espíritu Pato", image_path: "/sprites/espiritu-pato.webp", sort_order: 110 },
  { slug: "pececito", name: "Espíritu Pececito", image_path: "/sprites/espiritu-pececito.webp", sort_order: 120 },
  { slug: "punk", name: "Espíritu Punk", image_path: "/sprites/espiritu-punk.webp", sort_order: 130 },
  { slug: "tierra", name: "Espíritu Tierra", image_path: "/sprites/espiritu-tierra.webp", sort_order: 140 },
  { slug: "rey", name: "Rey Espíritu", image_path: "/sprites/rey-espiritu.webp", sort_order: 150 },
];

function getProfileName(profile) {
  return (
    profile?.ganker_user ||
    profile?.fortnite_user ||
    profile?.display_name ||
    "Usuario GKG"
  );
}

function getInitials(name = "GKG") {
  return String(name)
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(value) {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

export default function EspiritusPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [catalog, setCatalog] = useState(SPRITES_FALLBACK);
  const [posts, setPosts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [profilesById, setProfilesById] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [spriteSlug, setSpriteSlug] = useState("agua");
  const [actionStatus, setActionStatus] = useState("busco");
  const [note, setNote] = useState("");

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("todos");
  const [messagePost, setMessagePost] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [notice, setNotice] = useState("");

  const catalogBySlug = useMemo(() => {
    return Object.fromEntries(catalog.map((item) => [item.slug, item]));
  }, [catalog]);

  const myPosts = useMemo(() => {
    if (!user?.id) return [];
    return posts.filter((post) => post.profile_id === user.id);
  }, [posts, user?.id]);

  const filteredPosts = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase();

    return posts.filter((post) => {
      const sprite = catalogBySlug[post.sprite_slug];
      const postProfile = profilesById[post.profile_id];
      const text = [
        sprite?.name,
        post.action_status,
        post.note,
        getProfileName(postProfile),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !cleanSearch || text.includes(cleanSearch);
      const matchesAction = actionFilter === "todos" || post.action_status === actionFilter;

      return matchesSearch && matchesAction;
    });
  }, [posts, catalogBySlug, profilesById, search, actionFilter]);

  const inboxRequests = useMemo(() => {
    if (!user?.id) return [];
    return requests.filter((item) => item.to_profile_id === user.id);
  }, [requests, user?.id]);

  const sentRequests = useMemo(() => {
    if (!user?.id) return [];
    return requests.filter((item) => item.from_profile_id === user.id);
  }, [requests, user?.id]);

  async function loadProfiles(profileIds = []) {
    const uniqueIds = [...new Set(profileIds.filter(Boolean))];
    if (!uniqueIds.length) {
      setProfilesById({});
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, display_name, ganker_user, fortnite_user, avatar_url, is_vip, account_role")
      .in("id", uniqueIds);

    if (error) {
      console.warn("No se pudieron cargar perfiles:", error.message);
      return;
    }

    setProfilesById(Object.fromEntries((data || []).map((item) => [item.id, item])));
  }

  async function loadAll() {
    setLoading(true);
    setNotice("");

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData?.user) {
        router.push("/login");
        return;
      }

      const currentUser = authData.user;
      setUser(currentUser);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, display_name, ganker_user, fortnite_user, avatar_url")
        .eq("id", currentUser.id)
        .maybeSingle();

      setProfile(profileData || null);

      const { data: catalogData, error: catalogError } = await supabase
        .from("gkg_sprites_catalog")
        .select("slug, name, image_path, sort_order")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (!catalogError && Array.isArray(catalogData) && catalogData.length) {
        setCatalog(catalogData);
        if (!catalogData.find((item) => item.slug === spriteSlug)) {
          setSpriteSlug(catalogData[0].slug);
        }
      }

      const { data: postData, error: postsError } = await supabase
        .from("gkg_sprite_posts")
        .select("id, profile_id, sprite_slug, action_status, note, is_active, created_at, updated_at")
        .eq("is_active", true)
        .order("updated_at", { ascending: false });

      if (postsError) throw postsError;

      const { data: requestData, error: requestsError } = await supabase
        .from("gkg_sprite_requests")
        .select("id, post_id, from_profile_id, to_profile_id, message, status, created_at, updated_at")
        .or(`from_profile_id.eq.${currentUser.id},to_profile_id.eq.${currentUser.id}`)
        .order("created_at", { ascending: false })
        .limit(80);

      if (requestsError) throw requestsError;

      setPosts(postData || []);
      setRequests(requestData || []);

      await loadProfiles([
        ...(postData || []).map((item) => item.profile_id),
        ...(requestData || []).map((item) => item.from_profile_id),
        ...(requestData || []).map((item) => item.to_profile_id),
      ]);
    } catch (error) {
      setNotice(error.message || "No se pudieron cargar los espíritus.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function savePost(event) {
    event.preventDefault();

    if (!user?.id) return;

    setSaving(true);
    setNotice("");

    try {
      const payload = {
        profile_id: user.id,
        sprite_slug: spriteSlug,
        action_status: actionStatus,
        note: note.trim() || null,
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("gkg_sprite_posts")
        .upsert(payload, {
          onConflict: "profile_id,sprite_slug,action_status",
        });

      if (error) throw error;

      setNote("");
      setNotice("Publicación guardada correctamente.");
      await loadAll();
    } catch (error) {
      setNotice(error.message || "No se pudo guardar la publicación.");
    } finally {
      setSaving(false);
    }
  }

  async function deletePost(postId) {
    if (!postId || !window.confirm("¿Quitar esta publicación de Espíritus GKG?")) return;

    setSaving(true);
    setNotice("");

    try {
      const { error } = await supabase
        .from("gkg_sprite_posts")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", postId)
        .eq("profile_id", user.id);

      if (error) throw error;

      setNotice("Publicación eliminada.");
      await loadAll();
    } catch (error) {
      setNotice(error.message || "No se pudo eliminar la publicación.");
    } finally {
      setSaving(false);
    }
  }

  function openMessageModal(post) {
    const sprite = catalogBySlug[post.sprite_slug];
    const owner = profilesById[post.profile_id];

    setMessagePost(post);
    setMessageText(
      `Hola ${getProfileName(owner)}, vi en Ganker Games que tienes "${sprite?.name || "un espíritu"}" como "${ACTION_BY_KEY[post.action_status]?.label || post.action_status}". ¿Todavía está disponible?`
    );
  }

  async function sendRequest() {
    if (!messagePost || !user?.id) return;

    const cleanMessage = messageText.trim();

    if (cleanMessage.length < 5) {
      setNotice("Escribe un mensaje más claro para el usuario.");
      return;
    }

    setSaving(true);
    setNotice("");

    try {
      const { error } = await supabase.from("gkg_sprite_requests").insert({
        post_id: messagePost.id,
        from_profile_id: user.id,
        to_profile_id: messagePost.profile_id,
        message: cleanMessage,
        status: "pendiente",
      });

      if (error) throw error;

      setMessagePost(null);
      setMessageText("");
      setNotice("Mensaje enviado al usuario.");
      await loadAll();
    } catch (error) {
      setNotice(error.message || "No se pudo enviar el mensaje.");
    } finally {
      setSaving(false);
    }
  }

  async function updateRequestStatus(requestId, status) {
    setSaving(true);
    setNotice("");

    try {
      const { error } = await supabase
        .from("gkg_sprite_requests")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", requestId)
        .eq("to_profile_id", user.id);

      if (error) throw error;

      setNotice("Solicitud actualizada.");
      await loadAll();
    } catch (error) {
      setNotice(error.message || "No se pudo actualizar la solicitud.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#020604] text-white">
      <div className="absolute inset-0 -z-0 bg-[radial-gradient(circle_at_top,#16a34a33,transparent_35%),radial-gradient(circle_at_bottom_right,#22c55e22,transparent_32%)]" />

      <section className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <header className="overflow-hidden rounded-[2rem] border border-emerald-400/20 bg-black/70 p-5 shadow-2xl shadow-emerald-950/40 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.25em] text-emerald-200">
                <Star size={14} />
                Espíritus GKG
              </div>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
                Intercambio de Espíritus
              </h1>
              <p className="mt-2 max-w-3xl text-sm text-zinc-300 sm:text-base">
                Publica cuáles tienes, cuáles buscas, cuáles regalas o con cuáles ayudas para que otros usuarios de Ganker Games puedan contactarte.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/perfil")}
              className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15"
            >
              Volver al perfil
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm text-amber-100">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 shrink-0" size={18} />
              <p>
                Regla de seguridad: no compartas correos, contraseñas, códigos de acceso ni cuentas. Ganker Games solo conecta jugadores para completar su colección.
              </p>
            </div>
          </div>
        </header>

        {notice ? (
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm font-semibold text-emerald-100">
            {notice}
          </div>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-6">
            <form
              onSubmit={savePost}
              className="rounded-[2rem] border border-emerald-400/20 bg-black/70 p-5 shadow-xl shadow-emerald-950/30"
            >
              <h2 className="mb-1 text-xl font-black">Nueva publicación</h2>
              <p className="mb-4 text-sm text-zinc-400">
                Selecciona un espíritu y cómo quieres publicarlo.
              </p>

              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                Espíritu
              </label>
              <select
                value={spriteSlug}
                onChange={(event) => setSpriteSlug(event.target.value)}
                className="mb-4 w-full rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm font-semibold text-white outline-none focus:border-emerald-400"
              >
                {catalog.map((sprite) => (
                  <option key={sprite.slug} value={sprite.slug}>
                    {sprite.name}
                  </option>
                ))}
              </select>

              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                Estado
              </label>
              <div className="mb-4 grid grid-cols-2 gap-2">
                {ACTIONS.map((action) => (
                  <button
                    type="button"
                    key={action.key}
                    onClick={() => setActionStatus(action.key)}
                    className={`rounded-2xl border px-3 py-2 text-xs font-black transition ${
                      actionStatus === action.key
                        ? "border-emerald-300 bg-emerald-400/20 text-emerald-100"
                        : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>

              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                Nota opcional
              </label>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={180}
                placeholder="Ej. Me falta para completar colección / ayudo en partida después de las 7 pm..."
                className="mb-4 min-h-[110px] w-full resize-none rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-emerald-400"
              />

              <button
                type="submit"
                disabled={saving}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-black text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Gift size={18} />
                {saving ? "Guardando..." : "Publicar espíritu"}
              </button>
            </form>

            <section className="rounded-[2rem] border border-white/10 bg-black/60 p-5">
              <h2 className="mb-3 text-lg font-black">Mis publicaciones</h2>

              {myPosts.length === 0 ? (
                <p className="text-sm text-zinc-400">
                  Aún no publicas espíritus.
                </p>
              ) : (
                <div className="space-y-3">
                  {myPosts.map((post) => {
                    const sprite = catalogBySlug[post.sprite_slug];
                    const action = ACTION_BY_KEY[post.action_status];

                    return (
                      <div
                        key={post.id}
                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3"
                      >
                        <img
                          src={sprite?.image_path}
                          alt={sprite?.name}
                          className="h-12 w-12 rounded-xl object-contain"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-black">{sprite?.name}</p>
                          <p className="text-xs text-zinc-400">{action?.label}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => deletePost(post.id)}
                          className="rounded-xl border border-red-400/20 bg-red-400/10 p-2 text-red-200 transition hover:bg-red-400/20"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-black/60 p-5">
              <h2 className="mb-3 text-lg font-black">Solicitudes recibidas</h2>

              {inboxRequests.length === 0 ? (
                <p className="text-sm text-zinc-400">
                  Aún no tienes mensajes por espíritus.
                </p>
              ) : (
                <div className="space-y-3">
                  {inboxRequests.map((request) => {
                    const sender = profilesById[request.from_profile_id];

                    return (
                      <div key={request.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                        <p className="text-sm font-black text-emerald-100">
                          {getProfileName(sender)}
                        </p>
                        <p className="mt-1 text-sm text-zinc-300">{request.message}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-500">
                          {request.status} · {formatDate(request.created_at)}
                        </p>

                        {request.status === "pendiente" ? (
                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => updateRequestStatus(request.id, "aceptada")}
                              className="rounded-xl bg-emerald-400 px-3 py-2 text-xs font-black text-black"
                            >
                              Aceptar
                            </button>
                            <button
                              type="button"
                              onClick={() => updateRequestStatus(request.id, "rechazada")}
                              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-black text-white"
                            >
                              Rechazar
                            </button>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-black/60 p-5">
              <h2 className="mb-3 text-lg font-black">Mensajes enviados</h2>

              {sentRequests.length === 0 ? (
                <p className="text-sm text-zinc-400">
                  Aún no envías solicitudes.
                </p>
              ) : (
                <div className="space-y-3">
                  {sentRequests.slice(0, 8).map((request) => {
                    const receiver = profilesById[request.to_profile_id];

                    return (
                      <div key={request.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                        <p className="text-sm font-black text-zinc-200">
                          Para: {getProfileName(receiver)}
                        </p>
                        <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{request.message}</p>
                        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-500">
                          {request.status}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </aside>

          <section className="space-y-5">
            <div className="rounded-[2rem] border border-white/10 bg-black/60 p-4">
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar espíritu, usuario o nota..."
                    className="w-full rounded-2xl border border-white/10 bg-zinc-950 py-3 pl-11 pr-4 text-sm font-semibold text-white outline-none placeholder:text-zinc-600 focus:border-emerald-400"
                  />
                </div>

                <select
                  value={actionFilter}
                  onChange={(event) => setActionFilter(event.target.value)}
                  className="rounded-2xl border border-white/10 bg-zinc-950 px-4 py-3 text-sm font-bold text-white outline-none focus:border-emerald-400"
                >
                  <option value="todos">Todos los estados</option>
                  {ACTIONS.map((action) => (
                    <option key={action.key} value={action.key}>
                      {action.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={loadAll}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-black text-white transition hover:bg-white/10"
                >
                  <RotateCcw size={16} />
                  Actualizar
                </button>
              </div>
            </div>

            {loading ? (
              <div className="rounded-[2rem] border border-white/10 bg-black/50 p-8 text-center text-zinc-300">
                Cargando Espíritus GKG...
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="rounded-[2rem] border border-white/10 bg-black/50 p-8 text-center">
                <UsersRound className="mx-auto mb-3 text-zinc-500" size={36} />
                <p className="font-black">Aún no hay publicaciones con ese filtro.</p>
                <p className="mt-1 text-sm text-zinc-400">
                  Publica el primer espíritu para que la comunidad empiece a completar su colección.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredPosts.map((post) => {
                  const sprite = catalogBySlug[post.sprite_slug];
                  const owner = profilesById[post.profile_id];
                  const action = ACTION_BY_KEY[post.action_status] || ACTIONS[0];
                  const ownerName = getProfileName(owner);
                  const isOwn = post.profile_id === user?.id;

                  return (
                    <article
                      key={post.id}
                      className="group overflow-hidden rounded-[2rem] border border-white/10 bg-black/65 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:border-emerald-300/30"
                    >
                      <div className="relative flex min-h-[185px] items-center justify-center bg-gradient-to-br from-emerald-500/15 via-zinc-950 to-black p-6">
                        <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-black/50 px-3 py-1 text-xs font-black text-zinc-300">
                          {formatDate(post.updated_at)}
                        </div>
                        <img
                          src={sprite?.image_path}
                          alt={sprite?.name || "Espíritu"}
                          className="h-28 w-28 object-contain drop-shadow-[0_0_25px_rgba(34,197,94,0.25)] transition group-hover:scale-110"
                          loading="lazy"
                        />
                      </div>

                      <div className="space-y-4 p-4">
                        <div>
                          <h3 className="text-lg font-black text-white">
                            {sprite?.name || post.sprite_slug}
                          </h3>
                          <span className={`mt-2 inline-flex rounded-full border px-3 py-1 text-xs font-black ${action.badge}`}>
                            {action.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                          {owner?.avatar_url ? (
                            <img
                              src={owner.avatar_url}
                              alt={ownerName}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 text-sm font-black text-black">
                              {getInitials(ownerName)}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-black text-white">{ownerName}</p>
                            <p className="text-xs text-zinc-500">Usuario Ganker Games</p>
                          </div>
                        </div>

                        {post.note ? (
                          <p className="line-clamp-3 rounded-2xl border border-white/10 bg-zinc-950/80 p-3 text-sm text-zinc-300">
                            {post.note}
                          </p>
                        ) : null}

                        <button
                          type="button"
                          onClick={() => (isOwn ? router.push("/perfil") : openMessageModal(post))}
                          className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition ${
                            isOwn
                              ? "border border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                              : "bg-emerald-400 text-black hover:bg-emerald-300"
                          }`}
                        >
                          <MessageCircle size={18} />
                          {isOwn ? "Es tu publicación" : "Enviar mensaje"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </section>
      </section>

      {messagePost ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur">
          <div className="w-full max-w-lg rounded-[2rem] border border-emerald-400/20 bg-zinc-950 p-5 shadow-2xl shadow-emerald-950/50">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-black">Enviar mensaje</h2>
                <p className="text-sm text-zinc-400">
                  El usuario lo verá en su sección de solicitudes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMessagePost(null)}
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-zinc-300"
              >
                <X size={18} />
              </button>
            </div>

            <textarea
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              maxLength={350}
              className="min-h-[150px] w-full resize-none rounded-2xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none focus:border-emerald-400"
            />

            <button
              type="button"
              onClick={sendRequest}
              disabled={saving}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-black text-black transition hover:bg-emerald-300 disabled:opacity-60"
            >
              <Send size={18} />
              {saving ? "Enviando..." : "Enviar mensaje"}
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
