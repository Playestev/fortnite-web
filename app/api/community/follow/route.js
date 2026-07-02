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
  const fallbackName =
    user.user_metadata?.display_name ||
    user.email?.split("@")[0] ||
    "Jugador GKG";

  const nowIso = new Date().toISOString();

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name: fallbackName,
      updated_at: nowIso,
      allow_profile_search: true,
    },
    { onConflict: "id", ignoreDuplicates: false }
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

export async function POST(request) {
  try {
    const supabase = getAdminSupabase();
    const user = await getAuthenticatedUser(request, supabase);
    const body = await request.json();

    const targetProfileId = String(body.target_profile_id || "").trim();
    const action = String(body.action || "follow").trim();

    if (!targetProfileId) {
      return NextResponse.json(
        { error: "Falta el perfil que quieres seguir." },
        { status: 400 }
      );
    }

    if (targetProfileId === user.id) {
      return NextResponse.json(
        { error: "No puedes seguir tu propio perfil." },
        { status: 400 }
      );
    }

    await ensureProfile(supabase, user);

    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", targetProfileId)
      .maybeSingle();

    if (!targetProfile) {
      return NextResponse.json(
        { error: "El perfil que quieres seguir no existe." },
        { status: 404 }
      );
    }

    if (action === "unfollow") {
      const { error } = await supabase
        .from("profile_follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", targetProfileId);

      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase.from("profile_follows").upsert(
        {
          follower_id: user.id,
          following_id: targetProfileId,
        },
        { onConflict: "follower_id,following_id" }
      );

      if (error) throw new Error(error.message);
    }

    await expireOverdueVips(supabase);

    const payload = await getSocialPayload(supabase, user.id);

    const safeFollowingIds = (payload.followingIds || []).map((id) =>
      String(id)
    );

    payload.followingIds =
      action === "unfollow"
        ? safeFollowingIds.filter((id) => id !== targetProfileId)
        : safeFollowingIds.includes(targetProfileId)
          ? safeFollowingIds
          : [...safeFollowingIds, targetProfileId];

    return NextResponse.json({
      ...payload,
      action,
      target_profile_id: targetProfileId,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "No se pudo actualizar el seguimiento." },
      { status: 500 }
    );
  }
}
