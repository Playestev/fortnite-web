import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
    throw new Error("No tienes permisos para revisar VIP vencidos.");
  }
}

async function expireOverdueVips(supabase) {
  const nowIso = new Date().toISOString();

  const { data, error } = await supabase
    .from("profiles")
    .update({
      is_vip: false,
      vip_started_at: null,
      vip_until: null,
      vip_grace_until: null,
      vip_streak_months: 0,
      vip_cycle_months: 0,
      vip_total_months: 0,
      updated_at: nowIso,
    })
    .eq("is_vip", true)
    .or(`vip_grace_until.lt.${nowIso},and(vip_grace_until.is.null,vip_until.lt.${nowIso})`)
    .select("id, ganker_user, fortnite_user, display_name");

  if (error) throw new Error(error.message);

  return data || [];
}

export async function POST(request) {
  try {
    const supabase = getAdminSupabase();
    const user = await getAuthenticatedUser(request, supabase);

    await assertCreator(supabase, user.id);

    const expiredProfiles = await expireOverdueVips(supabase);

    return NextResponse.json({
      ok: true,
      expired_count: expiredProfiles.length,
      expired_profiles: expiredProfiles,
      message: expiredProfiles.length
        ? `Se quitaron ${expiredProfiles.length} VIP vencidos.`
        : "No hay VIP vencidos fuera del periodo de gracia.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "No se pudieron revisar VIP vencidos." },
      { status: 500 }
    );
  }
}
