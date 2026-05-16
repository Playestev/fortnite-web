import { createHash } from "crypto";
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

function hashValue(value = "") {
  return createHash("sha256").update(String(value)).digest("hex");
}

export async function POST(request) {
  try {
    const supabase = getAdminSupabase();
    const body = await request.json();

    const fortniteName = String(body.fortnite_name || "").trim();
    const contactInfo = String(body.contact_info || "").trim();
    const serviceRating = Number(body.service_rating || 0);
    const comment = String(body.comment || "").trim();
    const inviteToken = String(body.invite_token || "").trim();
    const userId = body.user_id || null;
    const deviceHint = String(body.device_hint || "").trim();

    if (!inviteToken) {
      return NextResponse.json(
        { error: "Necesitas un enlace personalizado para abrir el formulario." },
        { status: 400 }
      );
    }

    if (!fortniteName || !comment || serviceRating < 1 || serviceRating > 5) {
      return NextResponse.json(
        { error: "Completa usuario de Ganker Games, calificación y comentario." },
        { status: 400 }
      );
    }

    const inviteResponse = await supabase
      .from("giveaway_invites")
      .select("id, campaign_id, active, used_at")
      .eq("token", inviteToken)
      .eq("active", true)
      .is("used_at", null)
      .maybeSingle();

    if (inviteResponse.error || !inviteResponse.data) {
      return NextResponse.json(
        { error: "El enlace personalizado no es válido o ya fue utilizado." },
        { status: 400 }
      );
    }

    const campaignId = inviteResponse.data.campaign_id;

    const ipHeader =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const ip = ipHeader.split(",")[0].trim();
    const userAgent = request.headers.get("user-agent") || "unknown";

    const ipHash = hashValue(ip);
    const deviceFingerprint = hashValue(`${userAgent}|${deviceHint}`);

    const today = new Date();
    const entryDate = today.toISOString().slice(0, 10);

    const duplicateByName = await supabase
      .from("giveaway_entries")
      .select("id")
      .eq("campaign_id", campaignId)
      .eq("entry_date", entryDate)
      .ilike("fortnite_name", fortniteName)
      .limit(1);

    const duplicateByDevice = await supabase
      .from("giveaway_entries")
      .select("id")
      .eq("campaign_id", campaignId)
      .eq("entry_date", entryDate)
      .eq("ip_hash", ipHash)
      .eq("device_fingerprint", deviceFingerprint)
      .limit(1);

    if ((duplicateByName.data || []).length > 0 || (duplicateByDevice.data || []).length > 0) {
      return NextResponse.json(
        { error: "Solo se permite 1 participación por día por persona." },
        { status: 400 }
      );
    }

    let isVip = false;

    if (userId) {
      const profileResponse = await supabase
        .from("profiles")
        .select("is_vip")
        .eq("id", userId)
        .maybeSingle();

      isVip = Boolean(profileResponse.data?.is_vip);
    }

    const entriesWeight = isVip ? 2 : 1;

    const insertResponse = await supabase.from("giveaway_entries").insert({
      campaign_id: campaignId,
      invite_id: inviteResponse.data.id,
      user_id: userId,
      fortnite_name: fortniteName,
      contact_info: contactInfo || "Sin contacto solicitado",
      service_rating: serviceRating,
      comment,
      entry_date: entryDate,
      ip_hash: ipHash,
      device_fingerprint: deviceFingerprint,
      is_vip: isVip,
      entries_weight: entriesWeight,
    });

    if (insertResponse.error) {
      return NextResponse.json(
        { error: insertResponse.error.message || "No se pudo guardar la participación." },
        { status: 400 }
      );
    }

    await supabase
      .from("giveaway_invites")
      .update({
        active: false,
        used_at: new Date().toISOString(),
        used_by: userId,
      })
      .eq("id", inviteResponse.data.id)
      .is("used_at", null);

    return NextResponse.json({
      ok: true,
      entries_weight: entriesWeight,
      message:
        entriesWeight === 2
          ? "Participación registrada. Tu cuenta VIP recibió doble participación."
          : "Participación registrada correctamente.",
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Error interno del servidor." },
      { status: 500 }
    );
  }
}
