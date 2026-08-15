import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const VALID_SPIRIT_STATUSES = ["owned", "wanted", "gift", "trade", "help", "completed"];
const VALID_REPUTATION_ACTIONS = ["completed", "trusted", "no_response", "asked_account", "report"];

function cleanText(value = "") {
  return String(value || "").trim();
}

function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL.");
  }

  if (!serviceRoleKey) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function getMaybeAuthenticatedUser(request, supabase) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) return null;

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return null;

  return data.user;
}

async function getAuthenticatedUser(request, supabase) {
  const user = await getMaybeAuthenticatedUser(request, supabase);

  if (!user?.id) {
    throw new Error("No autorizado. Inicia sesión nuevamente.");
  }

  return user;
}

function getProfileDisplayName(profile = {}) {
  const fullName = `${profile.first_name || ""} ${profile.middle_name || ""} ${profile.last_name || ""}`
    .replace(/\s+/g, " ")
    .trim();

  return fullName || profile.display_name || profile.ganker_user || profile.fortnite_user || "Jugador GKG";
}

function cleanProfile(profile = {}) {
  return {
    id: profile.id,
    display_name: getProfileDisplayName(profile),
    ganker_user: profile.ganker_user || profile.fortnite_user || "Usuario GKG",
    avatar_url: profile.avatar_url || "",
    presence_status: profile.presence_status || "offline",
    public_profile_number: profile.public_profile_number || null,
    is_vip: Boolean(profile.is_vip),
    account_role: profile.account_role || "user",
  };
}

function getReputationScore(action) {
  if (["completed", "trusted"].includes(action)) return 5;
  if (action === "no_response") return 2;
  if (["asked_account", "report"].includes(action)) return 1;
  return 0;
}

function buildStats(catalog = [], ownCollection = [], reputation = []) {
  const ownedStatuses = new Set(["owned", "gift", "trade", "help", "completed"]);
  const ownedCount = ownCollection.filter((item) => ownedStatuses.has(item.status)).length;
  const wantedCount = ownCollection.filter((item) => item.status === "wanted").length;
  const tradeCount = ownCollection.filter((item) => item.status === "trade").length;
  const scores = reputation.map((item) => getReputationScore(item.action)).filter((score) => score > 0);
  const rating = scores.length
    ? Math.round((scores.reduce((total, score) => total + score, 0) / scores.length) * 10) / 10
    : 0;

  return {
    total_spirits: catalog.length,
    owned_spirits: ownedCount,
    wanted_spirits: wantedCount,
    trade_spirits: tradeCount,
    rating,
    reputation_count: scores.length,
    completed_exchanges: reputation.filter((item) => item.action === "completed").length,
  };
}

async function loadProfilesByIds(supabase, profileIds = []) {
  const cleanIds = [...new Set(profileIds.map((id) => cleanText(id)).filter(Boolean))];

  if (!cleanIds.length) return new Map();

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      first_name,
      middle_name,
      last_name,
      display_name,
      ganker_user,
      fortnite_user,
      avatar_url,
      presence_status,
      public_profile_number,
      is_vip,
      account_role,
      allow_profile_search,
      deleted_at
      `
    )
    .in("id", cleanIds);

  if (error) throw new Error(error.message);

  return new Map((data || []).map((profile) => [String(profile.id), profile]));
}

export async function GET(request) {
  try {
    const supabase = getAdminSupabase();
    const user = await getMaybeAuthenticatedUser(request, supabase);
    const url = new URL(request.url);
    const targetProfileId = cleanText(url.searchParams.get("profile_id") || user?.id || "");

    if (!targetProfileId) {
      return NextResponse.json(
        { error: "Inicia sesión para ver Espíritus GKG." },
        { status: 401 }
      );
    }

    const [catalogResult, targetCollectionResult, communityResult, reputationResult] = await Promise.all([
      supabase
        .from("gkg_spirit_catalog")
        .select("id, slug, name, element, image_url, sort_order, is_active")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("name", { ascending: true }),

      supabase
        .from("gkg_spirit_collections")
        .select("id, profile_id, spirit_id, status, notes, created_at, updated_at")
        .eq("profile_id", targetProfileId)
        .order("updated_at", { ascending: false }),

      supabase
        .from("gkg_spirit_collections")
        .select("id, profile_id, spirit_id, status, notes, created_at, updated_at")
        .in("status", ["wanted", "gift", "trade", "help"])
        .order("updated_at", { ascending: false })
        .limit(800),

      supabase
        .from("gkg_spirit_reputation")
        .select("id, spirit_id, from_profile_id, to_profile_id, action, notes, created_at")
        .eq("to_profile_id", targetProfileId)
        .order("created_at", { ascending: false })
        .limit(300),
    ]);

    if (catalogResult.error) throw new Error(catalogResult.error.message);
    if (targetCollectionResult.error) throw new Error(targetCollectionResult.error.message);
    if (communityResult.error) throw new Error(communityResult.error.message);
    if (reputationResult.error) throw new Error(reputationResult.error.message);

    const catalog = catalogResult.data || [];
    const ownCollection = targetCollectionResult.data || [];
    const communityRows = communityResult.data || [];
    const reputation = reputationResult.data || [];
    const profileIds = [
      targetProfileId,
      ...communityRows.map((row) => row.profile_id),
      ...reputation.map((row) => row.from_profile_id),
    ];
    const profilesById = await loadProfilesByIds(supabase, profileIds);
    const targetProfile = profilesById.get(String(targetProfileId)) || null;

    const community = communityRows
      .map((entry) => {
        const entryProfile = profilesById.get(String(entry.profile_id));
        if (!entryProfile || entryProfile.deleted_at || entryProfile.allow_profile_search === false) return null;

        return {
          ...entry,
          profile: cleanProfile(entryProfile),
        };
      })
      .filter(Boolean);

    let messages = [];

    if (user?.id) {
      const { data: messageRows, error: messagesError } = await supabase
        .from("gkg_spirit_messages")
        .select("id, spirit_id, sender_id, receiver_id, message, status, delivered_at, accepted_at, created_at, read_at")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(50);

      if (messagesError) throw new Error(messagesError.message);

      const messageProfileIds = [
        ...(messageRows || []).map((message) => message.sender_id),
        ...(messageRows || []).map((message) => message.receiver_id),
      ];
      const messageProfilesById = await loadProfilesByIds(supabase, messageProfileIds);

      messages = (messageRows || []).map((message) => ({
        ...message,
        sender: cleanProfile(messageProfilesById.get(String(message.sender_id)) || {}),
        receiver: cleanProfile(messageProfilesById.get(String(message.receiver_id)) || {}),
      }));
    }

    return NextResponse.json({
      ok: true,
      viewer_id: user?.id || null,
      target_profile: targetProfile ? cleanProfile(targetProfile) : null,
      catalog,
      own_collection: ownCollection,
      community,
      reputation,
      messages,
      stats: buildStats(catalog, ownCollection, reputation),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error.message ||
          "No se pudo cargar Espíritus GKG. Revisa que las tablas SQL ya estén creadas en Supabase.",
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const supabase = getAdminSupabase();
    const user = await getAuthenticatedUser(request, supabase);
    const body = await request.json();
    const action = cleanText(body.action);
    const nowIso = new Date().toISOString();

    if (action === "save_status") {
      const spiritId = cleanText(body.spirit_id);
      const status = cleanText(body.status);
      const notes = cleanText(body.notes).slice(0, 180);

      if (!spiritId) {
        return NextResponse.json({ error: "Falta el Espíritu." }, { status: 400 });
      }

      if (status === "remove") {
        const { error } = await supabase
          .from("gkg_spirit_collections")
          .delete()
          .eq("profile_id", user.id)
          .eq("spirit_id", spiritId);

        if (error) throw new Error(error.message);

        return NextResponse.json({ ok: true, message: "Espíritu quitado de tu colección." });
      }

      if (!VALID_SPIRIT_STATUSES.includes(status)) {
        return NextResponse.json({ error: "Estado de Espíritu inválido." }, { status: 400 });
      }

      const { error } = await supabase.from("gkg_spirit_collections").upsert(
        {
          profile_id: user.id,
          spirit_id: spiritId,
          status,
          notes,
          updated_at: nowIso,
        },
        { onConflict: "profile_id,spirit_id" }
      );

      if (error) throw new Error(error.message);

      return NextResponse.json({ ok: true, message: "Colección actualizada." });
    }

    if (action === "send_message") {
      const spiritId = cleanText(body.spirit_id);
      const receiverProfileId = cleanText(body.receiver_profile_id);
      const customMessage = cleanText(body.message).slice(0, 500);
      const message =
        customMessage ||
        "Hola, vi que tienes este Espíritu disponible en Ganker Games. ¿Todavía lo tienes para intercambio o regalo?";

      if (!spiritId || !receiverProfileId) {
        return NextResponse.json(
          { error: "Falta el Espíritu o el usuario destino." },
          { status: 400 }
        );
      }

      if (receiverProfileId === user.id) {
        return NextResponse.json(
          { error: "No puedes enviarte mensaje a ti mismo." },
          { status: 400 }
        );
      }

      const { error } = await supabase.from("gkg_spirit_messages").insert({
        spirit_id: spiritId,
        sender_id: user.id,
        receiver_id: receiverProfileId,
        message,
        status: "pending",
        delivered_at: nowIso,
        created_at: nowIso,
      });

      if (error) throw new Error(error.message);

      return NextResponse.json({ ok: true, message: "Solicitud de mensaje enviada. La otra persona debe aceptarla para abrir el chat privado." });
    }

    if (action === "reputation") {
      const targetProfileId = cleanText(body.target_profile_id);
      const spiritId = cleanText(body.spirit_id) || null;
      const reputationAction = cleanText(body.reputation_action);
      const notes = cleanText(body.notes).slice(0, 220);

      if (!targetProfileId || !VALID_REPUTATION_ACTIONS.includes(reputationAction)) {
        return NextResponse.json(
          { error: "Falta usuario o acción de reputación válida." },
          { status: 400 }
        );
      }

      if (targetProfileId === user.id) {
        return NextResponse.json(
          { error: "No puedes calificar tu propio perfil." },
          { status: 400 }
        );
      }

      const { error } = await supabase.from("gkg_spirit_reputation").insert({
        spirit_id: spiritId,
        from_profile_id: user.id,
        to_profile_id: targetProfileId,
        action: reputationAction,
        notes,
        created_at: nowIso,
      });

      if (error) throw new Error(error.message);

      return NextResponse.json({ ok: true, message: "Reputación registrada." });
    }

    return NextResponse.json({ error: "Acción no reconocida." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error.message || "No se pudo guardar la acción de Espíritus GKG." },
      { status: 500 }
    );
  }
}
