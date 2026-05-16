import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function jsonError(message, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL en .env.local o Vercel.");
  }

  if (!serviceRoleKey) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en .env.local o Vercel.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function requireManager(request, supabase) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) {
    throw new Error("No autorizado. Inicia sesión nuevamente.");
  }

  const { data: userData, error: userError } = await supabase.auth.getUser(token);

  if (userError || !userData?.user) {
    throw new Error("Sesión inválida.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, account_role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError || !profile) {
    throw new Error("No se encontró el perfil.");
  }

  if (!["admin", "creator"].includes(profile.account_role)) {
    throw new Error("No tienes permisos para administrar sorteos.");
  }

  return {
    user: userData.user,
    profile,
  };
}

function getMonthInfo() {
  const now = new Date();
  const year = now.getFullYear();
  const monthIndex = now.getMonth();
  const monthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;
  const monthLabel = new Intl.DateTimeFormat("es-MX", { month: "long" }).format(now);
  const cleanLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
  const startDate = `${monthKey}-01`;
  const endDate = new Date(year, monthIndex + 1, 0).toISOString().slice(0, 10);

  return { monthKey, monthLabel: cleanLabel, startDate, endDate };
}

async function ensureCurrentCampaign(supabase) {
  const current = getMonthInfo();

  const { data: existing, error: existingError } = await supabase
    .from("giveaway_campaigns")
    .select("*")
    .eq("month_key", current.monthKey)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing) {
    await supabase.from("giveaway_campaigns").update({ is_active: false }).neq("id", existing.id);
    await supabase.from("giveaway_campaigns").update({ is_active: true }).eq("id", existing.id);
    return { ...existing, is_active: true };
  }

  await supabase.from("giveaway_campaigns").update({ is_active: false }).eq("is_active", true);

  const { data: created, error: createError } = await supabase
    .from("giveaway_campaigns")
    .insert({
      title: "Sorteo mensual GKG",
      month_label: current.monthLabel,
      month_key: current.monthKey,
      start_date: current.startDate,
      end_date: current.endDate,
      is_active: true,
    })
    .select("*")
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  return created;
}

async function getParticipants(supabase, campaignId) {
  const { data, error } = await supabase
    .from("giveaway_entries")
    .select("fortnite_name, is_vip, entries_weight, created_at")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const grouped = (data || []).reduce((acc, row) => {
    const key = row.fortnite_name || "Jugador";

    if (!acc[key]) {
      acc[key] = {
        fortnite_name: key,
        is_vip: Boolean(row.is_vip),
        registros: 0,
        participaciones: 0,
      };
    }

    acc[key].is_vip = acc[key].is_vip || Boolean(row.is_vip);
    acc[key].registros += 1;
    acc[key].participaciones += Number(row.entries_weight || 1);

    return acc;
  }, {});

  return Object.values(grouped).sort((a, b) => {
    if (b.participaciones !== a.participaciones) {
      return b.participaciones - a.participaciones;
    }

    return a.fortnite_name.localeCompare(b.fortnite_name);
  });
}

function buildWeightedPool(participants) {
  const pool = [];

  for (const participant of participants) {
    const weight = Math.max(1, Number(participant.participaciones || 1));

    for (let i = 0; i < weight; i += 1) {
      pool.push(participant);
    }
  }

  return pool;
}

function pickWinner(participants, excludedNames = new Set()) {
  const available =
    participants.filter((item) => !excludedNames.has(item.fortnite_name)).length > 0
      ? participants.filter((item) => !excludedNames.has(item.fortnite_name))
      : participants;

  const pool = buildWeightedPool(available);

  if (pool.length === 0) {
    return null;
  }

  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

function mapWinner(campaignId, prizeType, placeLabel, winner) {
  if (!winner) return null;

  return {
    campaign_id: campaignId,
    prize_type: prizeType,
    place_label: placeLabel,
    fortnite_name: winner.fortnite_name,
    is_vip: Boolean(winner.is_vip),
    entries_count: Number(winner.participaciones || 1),
    records_count: Number(winner.registros || 1),
    selected_at: new Date().toISOString(),
  };
}

async function getInvites(supabase, campaignId) {
  const { data } = await supabase
    .from("giveaway_invites")
    .select("id, token, note, active, used_at, used_by, created_at")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false })
    .limit(50);

  return data || [];
}

export async function GET(request) {
  try {
    const supabase = getAdminSupabase();

    await requireManager(request, supabase);

    const campaign = await ensureCurrentCampaign(supabase);

    if (!campaign) {
      return NextResponse.json({
        campaign: null,
        invites: [],
        winners: [],
        participants: [],
      });
    }

    const [{ data: winners }, participants, invites] =
      await Promise.all([
        supabase
          .from("giveaway_winners")
          .select("*")
          .eq("campaign_id", campaign.id)
          .order("selected_at", { ascending: false }),
        getParticipants(supabase, campaign.id),
        getInvites(supabase, campaign.id),
      ]);

    return NextResponse.json({
      campaign,
      invites,
      winners: winners || [],
      participants,
    });
  } catch (error) {
    return jsonError(error.message || "No autorizado.", 403);
  }
}

export async function POST(request) {
  try {
    const supabase = getAdminSupabase();

    await requireManager(request, supabase);

    const body = await request.json();
    const action = body.action;

    const campaign = await ensureCurrentCampaign(supabase);

    if (!campaign) {
      return jsonError("No hay campaña activa.", 400);
    }

    if (action === "generate_invites") {
      const count = Math.min(200, Math.max(1, Number(body.count || 1)));
      const prefix = `GKG-${String(campaign.month_label || "MES")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^A-Z0-9]/gi, "")
        .toUpperCase()}`;

      const rows = Array.from({ length: count }).map((_, index) => ({
        campaign_id: campaign.id,
        token: `${prefix}-${randomBytes(3).toString("hex").toUpperCase()}-${String(
          index + 1
        ).padStart(3, "0")}`,
        note: "Enlace generado desde panel de creador",
        active: true,
        used_at: null,
        used_by: null,
      }));

      const { error } = await supabase.from("giveaway_invites").insert(rows);

      if (error) {
        throw new Error(error.message);
      }

      return NextResponse.json({
        campaign,
        invites: await getInvites(supabase, campaign.id),
      });
    }

    if (action === "delete_invite") {
      const token = String(body.token || "").trim();

      if (!token) {
        return jsonError("Falta el token del enlace.", 400);
      }

      const { error } = await supabase
        .from("giveaway_invites")
        .delete()
        .eq("campaign_id", campaign.id)
        .eq("token", token);

      if (error) {
        throw new Error(error.message);
      }

      return NextResponse.json({
        campaign,
        invites: await getInvites(supabase, campaign.id),
        message: "Enlace borrado correctamente.",
      });
    }

    if (action === "draw_winners") {
      const participants = await getParticipants(supabase, campaign.id);
      const excluded = new Set();

      const winner1 = pickWinner(participants, excluded);

      if (winner1) {
        excluded.add(winner1.fortnite_name);
      }

      const frequentPool = participants.filter(
        (item) => Number(item.participaciones || 0) >= 2 || Number(item.registros || 0) >= 2
      );

      const winner2 = pickWinner(frequentPool, excluded);

      if (winner2) {
        excluded.add(winner2.fortnite_name);
      }

      const vipPool = participants.filter((item) => Boolean(item.is_vip));
      const winner3 = pickWinner(vipPool, excluded);

      const winnersToInsert = [
        mapWinner(campaign.id, "monthly", "GKG del Mes", winner1),
        mapWinner(campaign.id, "frequent", "GKG Frecuente del Mes", winner2),
        mapWinner(campaign.id, "vip", "GKG VIP del Mes", winner3),
      ].filter(Boolean);

      if (winnersToInsert.length === 0) {
        return jsonError("No hay participantes suficientes para sortear.", 400);
      }

      await supabase
        .from("giveaway_winners")
        .delete()
        .eq("campaign_id", campaign.id);

      const { data: winners, error } = await supabase
        .from("giveaway_winners")
        .insert(winnersToInsert)
        .select("*");

      if (error) {
        throw new Error(error.message);
      }

      return NextResponse.json({
        campaign,
        winners: winners || [],
        participants,
      });
    }

    if (action === "delete_participant") {
      const fortniteName = String(body.fortnite_name || "").trim();

      if (!fortniteName) {
        return jsonError("Falta el nombre de Fortnite.", 400);
      }

      const { error: deleteError } = await supabase
        .from("giveaway_entries")
        .delete()
        .eq("campaign_id", campaign.id)
        .ilike("fortnite_name", fortniteName);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      const [participants, { data: winners }] = await Promise.all([
        getParticipants(supabase, campaign.id),
        supabase
          .from("giveaway_winners")
          .select("*")
          .eq("campaign_id", campaign.id)
          .order("selected_at", { ascending: false }),
      ]);

      return NextResponse.json({
        campaign,
        participants,
        winners: winners || [],
        message: "Registro borrado correctamente.",
      });
    }

    return jsonError("Acción no válida.", 400);
  } catch (error) {
    return jsonError(error.message || "Error interno.", 500);
  }
}
