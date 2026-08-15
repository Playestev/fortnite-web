import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const MESSAGE_STATUSES = ["pending", "accepted"];

function cleanText(value = "") {
  return String(value || "").trim();
}

function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL.");
  if (!serviceRoleKey) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY.");

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function getAuthenticatedUser(request, supabase) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) throw new Error("No autorizado. Inicia sesión nuevamente.");

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user?.id) throw new Error("No autorizado. Inicia sesión nuevamente.");

  return data.user;
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

async function loadSpiritsByIds(supabase, spiritIds = []) {
  const cleanIds = [...new Set(spiritIds.map((id) => cleanText(id)).filter(Boolean))];
  if (!cleanIds.length) return new Map();

  const { data, error } = await supabase
    .from("gkg_spirit_catalog")
    .select("id, slug, name, element, image_url, sort_order, is_active")
    .in("id", cleanIds);

  if (error) throw new Error(error.message);

  return new Map((data || []).map((spirit) => [String(spirit.id), spirit]));
}

function groupConversations(messages = [], viewerId = "") {
  const conversations = new Map();

  for (const message of messages) {
    const peerId = message.sender_id === viewerId ? message.receiver_id : message.sender_id;
    if (!peerId) continue;

    const existing = conversations.get(peerId) || {
      peer_id: peerId,
      peer: message.sender_id === viewerId ? message.receiver : message.sender,
      last_message: null,
      messages: [],
      pending_received: 0,
      pending_sent: 0,
      unread: 0,
      accepted: false,
    };

    existing.messages.push(message);

    if (!existing.last_message || new Date(message.created_at) > new Date(existing.last_message.created_at)) {
      existing.last_message = message;
    }

    if (message.status === "accepted") existing.accepted = true;
    if (message.status === "pending" && message.receiver_id === viewerId) existing.pending_received += 1;
    if (message.status === "pending" && message.sender_id === viewerId) existing.pending_sent += 1;
    if (message.status === "accepted" && message.receiver_id === viewerId && !message.read_at) existing.unread += 1;

    conversations.set(peerId, existing);
  }

  return [...conversations.values()].sort((a, b) => {
    const dateA = a.last_message?.created_at ? new Date(a.last_message.created_at).getTime() : 0;
    const dateB = b.last_message?.created_at ? new Date(b.last_message.created_at).getTime() : 0;
    return dateB - dateA;
  });
}

async function loadMessagesForUser(supabase, userId) {
  const { data: messageRows, error } = await supabase
    .from("gkg_spirit_messages")
    .select("id, spirit_id, sender_id, receiver_id, message, status, delivered_at, accepted_at, read_at, created_at")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .in("status", MESSAGE_STATUSES)
    .order("created_at", { ascending: true })
    .limit(400);

  if (error) throw new Error(error.message);

  const messages = messageRows || [];
  const profilesById = await loadProfilesByIds(supabase, [
    ...messages.map((message) => message.sender_id),
    ...messages.map((message) => message.receiver_id),
  ]);
  const spiritsById = await loadSpiritsByIds(supabase, messages.map((message) => message.spirit_id));

  const hydratedMessages = messages.map((message) => ({
    ...message,
    sender: cleanProfile(profilesById.get(String(message.sender_id)) || {}),
    receiver: cleanProfile(profilesById.get(String(message.receiver_id)) || {}),
    spirit: message.spirit_id ? spiritsById.get(String(message.spirit_id)) || null : null,
  }));

  const unreadCount = hydratedMessages.filter(
    (message) =>
      (message.receiver_id === userId && message.status === "pending") ||
      (message.receiver_id === userId && message.status === "accepted" && !message.read_at)
  ).length;

  return {
    messages: hydratedMessages,
    conversations: groupConversations(hydratedMessages, userId),
    unread_count: unreadCount,
  };
}

export async function GET(request) {
  try {
    const supabase = getAdminSupabase();
    const user = await getAuthenticatedUser(request, supabase);
    const payload = await loadMessagesForUser(supabase, user.id);

    return NextResponse.json({
      ok: true,
      viewer_id: user.id,
      ...payload,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error.message || "No se pudieron cargar los mensajes privados." },
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

    if (action === "send_request") {
      const receiverProfileId = cleanText(body.receiver_profile_id);
      const spiritId = cleanText(body.spirit_id);
      const message = cleanText(body.message).slice(0, 500);

      if (!receiverProfileId || !spiritId || message.length < 2) {
        return NextResponse.json({ error: "Falta usuario destino, Espíritu o mensaje." }, { status: 400 });
      }

      if (receiverProfileId === user.id) {
        return NextResponse.json({ error: "No puedes enviarte mensaje a ti mismo." }, { status: 400 });
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

      const payload = await loadMessagesForUser(supabase, user.id);
      return NextResponse.json({ ok: true, message: "Solicitud enviada. Esperando aceptación.", ...payload });
    }

    if (action === "accept_message") {
      const messageId = cleanText(body.message_id);

      if (!messageId) {
        return NextResponse.json({ error: "Falta el mensaje." }, { status: 400 });
      }

      const { error } = await supabase
        .from("gkg_spirit_messages")
        .update({ status: "accepted", accepted_at: nowIso, delivered_at: nowIso })
        .eq("id", messageId)
        .eq("receiver_id", user.id)
        .eq("status", "pending");

      if (error) throw new Error(error.message);

      const payload = await loadMessagesForUser(supabase, user.id);
      return NextResponse.json({ ok: true, message: "Mensaje aceptado. Ya pueden chatear en privado.", ...payload });
    }

    if (action === "reject_message") {
      const messageId = cleanText(body.message_id);

      if (!messageId) {
        return NextResponse.json({ error: "Falta el mensaje." }, { status: 400 });
      }

      const { error } = await supabase
        .from("gkg_spirit_messages")
        .delete()
        .eq("id", messageId)
        .eq("receiver_id", user.id)
        .eq("status", "pending");

      if (error) throw new Error(error.message);

      const payload = await loadMessagesForUser(supabase, user.id);
      return NextResponse.json({ ok: true, message: "Mensaje rechazado y eliminado.", ...payload });
    }

    if (action === "send_message") {
      const receiverProfileId = cleanText(body.receiver_profile_id);
      const spiritId = cleanText(body.spirit_id) || null;
      const message = cleanText(body.message).slice(0, 800);

      if (!receiverProfileId || message.length < 1) {
        return NextResponse.json({ error: "Falta usuario destino o mensaje." }, { status: 400 });
      }

      if (receiverProfileId === user.id) {
        return NextResponse.json({ error: "No puedes enviarte mensaje a ti mismo." }, { status: 400 });
      }

      const { data: acceptedRows, error: acceptedError } = await supabase
        .from("gkg_spirit_messages")
        .select("id")
        .eq("status", "accepted")
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${receiverProfileId}),and(sender_id.eq.${receiverProfileId},receiver_id.eq.${user.id})`)
        .limit(1);

      if (acceptedError) throw new Error(acceptedError.message);

      if (!acceptedRows?.length) {
        return NextResponse.json(
          { error: "Primero la otra persona debe aceptar la solicitud de mensaje." },
          { status: 403 }
        );
      }

      const { error } = await supabase.from("gkg_spirit_messages").insert({
        spirit_id: spiritId,
        sender_id: user.id,
        receiver_id: receiverProfileId,
        message,
        status: "accepted",
        delivered_at: nowIso,
        accepted_at: nowIso,
        created_at: nowIso,
      });

      if (error) throw new Error(error.message);

      const payload = await loadMessagesForUser(supabase, user.id);
      return NextResponse.json({ ok: true, message: "Mensaje enviado.", ...payload });
    }

    if (action === "mark_read") {
      const peerId = cleanText(body.peer_id);

      if (!peerId) {
        return NextResponse.json({ error: "Falta el usuario del chat." }, { status: 400 });
      }

      const { error } = await supabase
        .from("gkg_spirit_messages")
        .update({ read_at: nowIso })
        .eq("sender_id", peerId)
        .eq("receiver_id", user.id)
        .eq("status", "accepted")
        .is("read_at", null);

      if (error) throw new Error(error.message);

      const payload = await loadMessagesForUser(supabase, user.id);
      return NextResponse.json({ ok: true, message: "Mensajes marcados como leídos.", ...payload });
    }

    return NextResponse.json({ error: "Acción de mensajes no reconocida." }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error.message || "No se pudo procesar el mensaje privado." },
      { status: 500 }
    );
  }
}
