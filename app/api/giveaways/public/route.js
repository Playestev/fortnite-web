import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
    if (!existing.is_active) {
      await supabase.from("giveaway_campaigns").update({ is_active: false }).neq("id", existing.id);
      await supabase.from("giveaway_campaigns").update({ is_active: true }).eq("id", existing.id);
    }

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

export async function GET() {
  try {
    const supabase = getAdminSupabase();
    const campaign = await ensureCurrentCampaign(supabase);
    const participants = campaign ? await getParticipants(supabase, campaign.id) : [];

    return NextResponse.json({
      campaign,
      participants,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "No se pudieron cargar los participantes." },
      { status: 500 }
    );
  }
}
