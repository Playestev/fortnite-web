import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const GRACE_DAYS = 5;

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

async function getAuthenticatedUser(request, supabase) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) {
    throw new Error("No autorizado. Inicia sesión nuevamente.");
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data?.user) {
    throw new Error("Sesión inválida.");
  }

  return data.user;
}

async function assertCreator(supabase, userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("account_role")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  const role = String(data?.account_role || "user").toLowerCase();
  if (!["admin", "creator", "creador"].includes(role)) {
    throw new Error("No tienes permisos para aplicar VIP de sorteos.");
  }
}

function normalizeValue(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function parseDate(value) {
  if (!value) return null;

  const text = String(value).slice(0, 10);
  const [year, month, day] = text.split("-").map(Number);

  if (!year || !month || !day) {
    const fallback = new Date(value);
    return Number.isNaN(fallback.getTime()) ? null : fallback;
  }

  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function toDateOnlyIso(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + Number(days || 0));
  return next;
}

function addCalendarMonths(date, months) {
  const next = new Date(date);
  const day = next.getDate();

  next.setDate(1);
  next.setMonth(next.getMonth() + Number(months || 0));

  const lastDay = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
  next.setDate(Math.min(day, lastDay));

  return next;
}

function getGiveawayVipStartDate(winner, monthKey) {
  const explicitDate =
    winner?.vip_start_date ||
    winner?.vipStartedAt ||
    winner?.prize_start_date ||
    winner?.prizeStartDate ||
    winner?.starts_at ||
    winner?.start_date ||
    null;

  const parsedExplicit = parseDate(explicitDate);
  if (parsedExplicit) return parsedExplicit;

  const cleanMonthKey = String(monthKey || "").trim();
  const match = cleanMonthKey.match(/^(\d{4})-(\d{2})$/);

  if (match) {
    const year = Number(match[1]);
    const month = Number(match[2]);

    if (year && month) {
      // Los sorteos del mes se activan el día 1 del siguiente mes.
      return new Date(year, month, 1, 12, 0, 0, 0);
    }
  }

  const createdDate = parseDate(winner?.created_at || winner?.awarded_at || winner?.selected_at);
  if (createdDate) return createdDate;

  const today = new Date();
  today.setHours(12, 0, 0, 0);
  return today;
}

function sameDateOnly(a, b) {
  if (!a || !b) return false;
  return toDateOnlyIso(a) === toDateOnlyIso(b);
}

function getWinnerName(winner) {
  return (
    winner?.fortnite_name ||
    winner?.ganker_user ||
    winner?.display_name ||
    winner?.winner_name ||
    winner?.name ||
    ""
  );
}

function getVipPrizeConfig(winner) {
  const prizeType = String(winner?.prize_type || winner?.type || "").toLowerCase();
  const prizeText = String(winner?.reward_name || winner?.prize_name || winner?.prize || "").toLowerCase();

  if (prizeType === "monthly" || prizeText.includes("1 mes") || prizeText.includes("un mes")) {
    return {
      grantType: "monthly",
      label: "1 mes de GKG VIP por sorteo",
      addMonths: 1,
      addDays: 0,
    };
  }

  if (prizeType === "frequent" || prizeText.includes("15 días") || prizeText.includes("15 dias")) {
    return {
      grantType: "frequent",
      label: "15 días de GKG VIP por sorteo",
      addMonths: 0,
      addDays: 15,
    };
  }

  return null;
}

async function findProfileForWinner(supabase, winner) {
  if (winner?.profile_id || winner?.user_id) {
    const profileId = winner.profile_id || winner.user_id;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", profileId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (data) return data;
  }

  const target = normalizeValue(getWinnerName(winner));
  if (!target) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .is("deleted_at", null)
    .limit(2000);

  if (error) throw new Error(error.message);

  return (data || []).find((profile) => {
    const possibleNames = [
      profile.ganker_user,
      profile.fortnite_user,
      profile.display_name,
      `${profile.first_name || ""} ${profile.middle_name || ""} ${profile.last_name || ""}`,
      profile.email,
    ];

    return possibleNames.some((value) => normalizeValue(value) === target);
  }) || null;
}

async function grantGiveawayVip(supabase, profile, winner, monthKey, config) {
  const winnerKey = normalizeValue(
    winner?.id || winner?.winner_id || winner?.profile_id || winner?.user_id || getWinnerName(winner)
  ).replace(/[^a-z0-9_-]+/g, "-");
  const marker = `vip_giveaway_grant:${monthKey}:${config.grantType}:${winnerKey}`;

  const prizeStart = getGiveawayVipStartDate(winner, monthKey);
  const intendedUntil = config.addMonths
    ? addCalendarMonths(prizeStart, config.addMonths)
    : addDays(prizeStart, config.addDays);
  const intendedGrace = addDays(intendedUntil, GRACE_DAYS);

  const intendedStartIso = toDateOnlyIso(prizeStart);
  const intendedUntilIso = toDateOnlyIso(intendedUntil);
  const intendedGraceIso = toDateOnlyIso(intendedGrace);

  const { data: existingHistory, error: historyError } = await supabase
    .from("profile_change_history")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("change_type", "vip_giveaway_grant")
    .eq("description", marker)
    .maybeSingle();

  if (historyError && historyError.code !== "PGRST116") {
    throw new Error(historyError.message);
  }

  if (existingHistory?.id) {
    const startedAt = parseDate(profile.vip_started_at);
    const shouldReconcileExistingPrize = sameDateOnly(startedAt, prizeStart);

    if (
      shouldReconcileExistingPrize &&
      (String(profile.vip_until || "").slice(0, 10) !== intendedUntilIso ||
        String(profile.vip_grace_until || "").slice(0, 10) !== intendedGraceIso)
    ) {
      const { error: reconcileError } = await supabase
        .from("profiles")
        .update({
          is_vip: true,
          vip_until: intendedUntilIso,
          vip_grace_until: intendedGraceIso,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (reconcileError) throw new Error(reconcileError.message);
    }

    return {
      profile_id: profile.id,
      winner_name: getWinnerName(winner),
      grant_type: config.grantType,
      vip_started_at: intendedStartIso,
      vip_until: intendedUntilIso,
      vip_grace_until: intendedGraceIso,
      skipped: true,
      reason: "Ya estaba aplicado. Fechas revisadas sin volver a sumar meses.",
    };
  }

  const updatePayload = {
    is_vip: true,
    vip_started_at: profile.vip_started_at || intendedStartIso,
    vip_until: intendedUntilIso,
    vip_grace_until: intendedGraceIso,
    updated_at: new Date().toISOString(),
  };

  // Si viene de sorteo, NO se aumentan meses de antigüedad ni se genera emote automático.
  if (!profile.vip_started_at) {
    updatePayload.vip_streak_months = Number(profile.vip_streak_months || 0);
    updatePayload.vip_cycle_months = Number(profile.vip_cycle_months || 0);
    updatePayload.vip_total_months = Number(profile.vip_total_months || 0);
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update(updatePayload)
    .eq("id", profile.id);

  if (updateError) throw new Error(updateError.message);

  await supabase.from("profile_change_history").insert({
    profile_id: profile.id,
    change_type: "vip_giveaway_grant",
    description: marker,
  });

  return {
    profile_id: profile.id,
    winner_name: getWinnerName(winner),
    grant_type: config.grantType,
    vip_started_at: intendedStartIso,
    vip_until: updatePayload.vip_until,
    vip_grace_until: updatePayload.vip_grace_until,
    skipped: false,
  };
}

export async function POST(request) {
  try {
    const supabase = getAdminSupabase();
    const user = await getAuthenticatedUser(request, supabase);
    await assertCreator(supabase, user.id);

    const body = await request.json();
    const winners = Array.isArray(body?.winners) ? body.winners : [];
    const monthKey = String(body?.month_key || body?.monthKey || "sin-mes").trim() || "sin-mes";

    const applied = [];
    const notFound = [];

    for (const winner of winners) {
      const config = getVipPrizeConfig(winner);
      if (!config) continue;

      const profile = await findProfileForWinner(supabase, winner);
      if (!profile) {
        notFound.push({ winner_name: getWinnerName(winner), prize_type: winner?.prize_type || null });
        continue;
      }

      applied.push(await grantGiveawayVip(supabase, profile, winner, monthKey, config));
    }

    return NextResponse.json({
      ok: true,
      applied_count: applied.filter((item) => !item.skipped).length,
      skipped_count: applied.filter((item) => item.skipped).length,
      not_found: notFound,
      applied,
      message: "VIP de sorteos revisado correctamente.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "No se pudo aplicar el VIP de sorteos." },
      { status: 500 }
    );
  }
}
