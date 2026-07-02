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


async function expireOverdueVips(supabase) {
  const nowIso = new Date().toISOString();

  const { error } = await supabase
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
    .or(`vip_grace_until.lt.${nowIso},and(vip_grace_until.is.null,vip_until.lt.${nowIso})`);

  if (error) {
    console.warn("No se pudieron vencer VIP automáticamente:", error.message);
  }
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

async function ensureProfile(supabase, user) {
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existingProfile) return;

  const fallbackName =
    user.user_metadata?.display_name ||
    user.email?.split("@")[0] ||
    "Jugador GKG";

  const nowIso = new Date().toISOString();

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name: fallbackName,
      presence_status: "online",
      last_seen: nowIso,
      created_at: nowIso,
      updated_at: nowIso,
      allow_profile_search: true,
    },
    { onConflict: "id" }
  );

  if (error) {
    throw new Error(error.message);
  }
}

async function getSocialPayload(supabase, userId) {
  const [
    communityResult,
    followingResult,
    followersTotalResult,
    followingTotalResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        `
        id,
        first_name,
        middle_name,
        last_name,
        display_name,
        fortnite_user,
        ganker_user,
        avatar_url,
        presence_status,
        country,
        account_role,
        last_seen,
        is_vip,
        vip_until,
        vip_grace_until,
        public_profile_number,
        allow_profile_search,
        deleted_at,
        created_at,
        updated_at
        `
      )
      .is("deleted_at", null)
      .order("updated_at", { ascending: false })
      .range(0, 999),

    supabase
      .from("profile_follows")
      .select("following_id")
      .eq("follower_id", userId),

    supabase
      .from("profile_follows")
      .select("*", { count: "exact", head: true })
      .eq("following_id", userId),

    supabase
      .from("profile_follows")
      .select("*", { count: "exact", head: true })
      .eq("follower_id", userId),
  ]);

  if (communityResult.error) throw new Error(communityResult.error.message);
  if (followingResult.error) throw new Error(followingResult.error.message);
  if (followersTotalResult.error) throw new Error(followersTotalResult.error.message);
  if (followingTotalResult.error) throw new Error(followingTotalResult.error.message);

  return {
    communityProfiles: communityResult.data || [],
    followingIds: (followingResult.data || []).map((row) =>
      String(row.following_id)
    ),
    followersCount: followersTotalResult.count || 0,
    followingCount: followingTotalResult.count || 0,
  };
}

export async function GET(request) {
  try {
    const supabase = getAdminSupabase();
    const user = await getAuthenticatedUser(request, supabase);

    await ensureProfile(supabase, user);
    await expireOverdueVips(supabase);

    const payload = await getSocialPayload(supabase, user.id);

    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "No se pudo cargar la comunidad." },
      { status: 500 }
    );
  }
}
