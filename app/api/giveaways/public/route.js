import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const GKG_TIME_ZONE = process.env.GKG_TIME_ZONE || "America/Ciudad_Juarez";

function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Faltan variables de entorno de Supabase.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
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
  const { error } = await supabase.rpc("rollover_giveaway_month", {
    target_month_key: previousMonthKey,
  });

  if (error) {
    throw new Error(error.message);
  }
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

async function getPreviousMonthParticipants(supabase, monthKey) {
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

  const winnerRows = winners || [];
  const profileIds = [...new Set(winnerRows.map((row) => row.profile_id).filter(Boolean))];

  if (profileIds.length === 0) {
    return winnerRows.map((row) => ({
      ...row,
      prize_name: row.reward_name || "",
    }));
  }

  const { data: profiles, error: profilesError } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, ganker_user, fortnite_user")
    .in("id", profileIds);

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  const profileById = new Map((profiles || []).map((profile) => [profile.id, profile]));

  return winnerRows.map((row) => {
    const profile = row.profile_id ? profileById.get(row.profile_id) : null;

    return {
      ...row,
      prize_name: row.reward_name || "",
      display_name: profile?.display_name || "",
      avatar_url: profile?.avatar_url || "",
      ganker_user: profile?.ganker_user || "",
      profile_fortnite_user: profile?.fortnite_user || "",
    };
  });
}

export async function GET() {
  try {
    const supabase = getAdminSupabase();
    const current = getCurrentMonthInfo();
    const previous = getPreviousMonthInfo(current.monthKey);

    const campaign = await ensureCurrentCampaign(supabase, current);
    await ensurePreviousMonthClosed(supabase, previous.monthKey);

    const [currentParticipants, previousParticipants, previousWinners] = await Promise.all([
      getMonthParticipants(supabase, current.monthKey),
      getPreviousMonthParticipants(supabase, previous.monthKey),
      getMonthWinners(supabase, previous.monthKey),
    ]);

    return NextResponse.json({
      current_month: campaign,
      current_participants: currentParticipants,
      previous_month: {
        month_key: previous.monthKey,
        month_label: previous.monthLabel,
      },
      previous_month_winners: previousWinners,
      previous_month_participants: previousParticipants,

      // Compatibilidad temporal con el frontend anterior.
      campaign,
      participants: currentParticipants,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "No se pudieron cargar los sorteos." },
      { status: 500 }
    );
  }
}
