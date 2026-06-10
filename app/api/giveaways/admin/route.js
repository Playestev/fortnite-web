import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const GKG_TIME_ZONE = process.env.GKG_TIME_ZONE || "America/Ciudad_Juarez";

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

function capitalize(value = "") {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function getZonedDateParts(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: GKG_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type) => parts.find((part) => part.type === type)?.value;

  return {
    year: Number(getPart("year")),
    month: Number(getPart("month")),
    day: Number(getPart("day")),
  };
}

function buildMonthInfo(year, monthNumber) {
  const monthKey = `${year}-${String(monthNumber).padStart(2, "0")}`;
  const monthLabel = capitalize(
    new Intl.DateTimeFormat("es-MX", {
      month: "long",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(year, monthNumber - 1, 1)))
  );
  const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();

  return {
    monthKey,
    monthLabel,
    startDate: `${monthKey}-01`,
    endDate: `${monthKey}-${String(lastDay).padStart(2, "0")}`,
  };
}

function getCurrentMonthInfo() {
  const { year, month } = getZonedDateParts();
  return buildMonthInfo(year, month);
}

function getPreviousMonthInfo(currentMonthKey) {
  const [year, month] = String(currentMonthKey)
    .split("-")
    .map(Number);

  const previousYear = month === 1 ? year - 1 : year;
  const previousMonth = month === 1 ? 12 : month - 1;

  return buildMonthInfo(previousYear, previousMonth);
}

async function ensureCurrentCampaign(supabase, current) {
  const { data: existing, error: existingError } = await supabase
    .from("giveaway_campaigns")
    .select("*")
    .eq("month_key", current.monthKey)
    .order("is_canonical", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existing) {
    const { error: deactivateDuplicatesError } = await supabase
      .from("giveaway_campaigns")
      .update({ is_active: false, is_canonical: false })
      .eq("month_key", current.monthKey)
      .neq("id", existing.id);

    if (deactivateDuplicatesError) {
      throw new Error(deactivateDuplicatesError.message);
    }

    const { error: deactivateOtherMonthsError } = await supabase
      .from("giveaway_campaigns")
      .update({ is_active: false })
      .neq("id", existing.id)
      .eq("is_active", true);

    if (deactivateOtherMonthsError) {
      throw new Error(deactivateOtherMonthsError.message);
    }

    const { data: activated, error: activateError } = await supabase
      .from("giveaway_campaigns")
      .update({ is_active: true, is_canonical: true })
      .eq("id", existing.id)
      .select("*")
      .single();

    if (activateError) {
      throw new Error(activateError.message);
    }

    return activated;
  }

  const { error: deactivateError } = await supabase
    .from("giveaway_campaigns")
    .update({ is_active: false })
    .eq("is_active", true);

  if (deactivateError) {
    throw new Error(deactivateError.message);
  }

  const { data: created, error: createError } = await supabase
    .from("giveaway_campaigns")
    .insert({
      title: "Sorteo mensual GKG",
      month_label: current.monthLabel,
      month_key: current.monthKey,
      start_date: current.startDate,
      end_date: current.endDate,
      is_active: true,
      is_canonical: true,
    })
    .select("*")
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  return created;
}

async function ensurePreviousMonthClosed(supabase, previousMonthKey) {
  const { data, error } = await supabase.rpc("rollover_giveaway_month", {
    target_month_key: previousMonthKey,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

async function getMonthParticipants(supabase, monthKey) {
  const { data, error } = await supabase.rpc("get_giveaway_month_participants", {
    month_key_input: monthKey,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

async function getMonthSnapshot(supabase, monthKey) {
  const { data, error } = await supabase
    .from("giveaway_month_participant_snapshots")
    .select("fortnite_name, normalized_name, is_vip, registros, participaciones")
    .eq("month_key", monthKey)
    .order("participaciones", { ascending: false })
    .order("registros", { ascending: false })
    .order("fortnite_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

async function getMonthWinners(supabase, monthKey) {
  const { data: winners, error } = await supabase
    .from("giveaway_winners")
    .select("*")
    .eq("month_key", monthKey)
    .order("selected_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (winners || []).map((winner) => ({
    ...winner,
    prize_name: winner.reward_name || "",
  }));
}

async function getInvites(supabase, campaignId) {
  const { data, error } = await supabase
    .from("giveaway_invites")
    .select("id, token, note, active, used_at, used_by, created_at")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
}

async function getParticipantFeedback(supabase, campaignId) {
  const { data, error } = await supabase
    .from("giveaway_entries")
    .select("id, fortnite_name, service_rating, comment, created_at")
    .eq("campaign_id", campaignId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data || []).filter(
    (row) =>
      Number(row.service_rating || 0) > 0 ||
      String(row.comment || "").trim()
  );
}

async function getAdminPayload(supabase) {
  const current = getCurrentMonthInfo();
  const previous = getPreviousMonthInfo(current.monthKey);
  const campaign = await ensureCurrentCampaign(supabase, current);

  await ensurePreviousMonthClosed(supabase, previous.monthKey);

  const [
    invites,
    participants,
    previousParticipants,
    previousWinners,
    participantFeedback,
  ] = await Promise.all([
    getInvites(supabase, campaign.id),
    getMonthParticipants(supabase, current.monthKey),
    getMonthSnapshot(supabase, previous.monthKey),
    getMonthWinners(supabase, previous.monthKey),
    getParticipantFeedback(supabase, campaign.id),
  ]);

  return {
    campaign,
    invites,
    participants,
    winners: previousWinners,
    current_month: campaign,
    current_participants: participants,
    previous_month: {
      month_key: previous.monthKey,
      month_label: previous.monthLabel,
    },
    previous_month_winners: previousWinners,
    previous_month_participants: previousParticipants,
    participant_feedback: participantFeedback,
  };
}

export async function GET(request) {
  try {
    const supabase = getAdminSupabase();
    await requireManager(request, supabase);

    return NextResponse.json(await getAdminPayload(supabase));
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
    const current = getCurrentMonthInfo();
    const previous = getPreviousMonthInfo(current.monthKey);
    const campaign = await ensureCurrentCampaign(supabase, current);

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
        ...(await getAdminPayload(supabase)),
        message: "Enlaces personalizados generados correctamente.",
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
        ...(await getAdminPayload(supabase)),
        message: "Enlace borrado correctamente.",
      });
    }

    if (action === "repair_monthly_close" || action === "draw_winners") {
      const targetMonthKey = String(body.month_key || previous.monthKey).trim();

      if (!/^\d{4}-\d{2}$/.test(targetMonthKey)) {
        return jsonError("El mes debe tener el formato YYYY-MM.", 400);
      }

      const { data: repairResult, error: repairError } = await supabase.rpc(
        "repair_giveaway_month",
        {
          target_month_key: targetMonthKey,
        }
      );

      if (repairError) {
        throw new Error(repairError.message);
      }

      return NextResponse.json({
        ...(await getAdminPayload(supabase)),
        repair_result: repairResult || [],
        message:
          "Cierre mensual revisado. Si ya existía, se conservaron exactamente los mismos ganadores.",
      });
    }

    if (action === "delete_participant") {
      const fortniteName = String(body.fortnite_name || "").trim();

      if (!fortniteName) {
        return jsonError("Falta el nombre del jugador.", 400);
      }

      const { error: deleteEntriesError } = await supabase
        .from("giveaway_entries")
        .delete()
        .eq("campaign_id", campaign.id)
        .ilike("fortnite_name", fortniteName);

      if (deleteEntriesError) {
        throw new Error(deleteEntriesError.message);
      }

      const { error: deleteManualError } = await supabase
        .from("giveaway_manual_participants")
        .delete()
        .eq("month_key", current.monthKey)
        .ilike("fortnite_name", fortniteName);

      if (deleteManualError) {
        throw new Error(deleteManualError.message);
      }

      return NextResponse.json({
        ...(await getAdminPayload(supabase)),
        message: "Registro borrado correctamente.",
      });
    }

    return jsonError("Acción no válida.", 400);
  } catch (error) {
    return jsonError(error.message || "Error interno.", 500);
  }
}
