import dns from "node:dns/promises";
import net from "node:net";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_REDIRECTS = 4;

function isBlockedIpv4(ip) {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) {
    return true;
  }

  const [a, b] = parts;

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    a >= 224
  );
}

function isBlockedIpv6(ip) {
  const normalized = ip.toLowerCase();

  if (normalized === "::" || normalized === "::1") return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  if (normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb")) return true;

  if (normalized.startsWith("::ffff:")) {
    const mapped = normalized.slice("::ffff:".length);
    if (net.isIP(mapped) === 4) return isBlockedIpv4(mapped);
  }

  return false;
}

function isBlockedIp(ip) {
  const version = net.isIP(ip);
  if (version === 4) return isBlockedIpv4(ip);
  if (version === 6) return isBlockedIpv6(ip);
  return true;
}

async function assertPublicHttpsUrl(url) {
  if (!(url instanceof URL) || url.protocol !== "https:") {
    throw new Error("Solo se permiten imágenes HTTPS.");
  }

  const hostname = url.hostname.toLowerCase();
  if (!hostname || hostname === "localhost" || hostname.endsWith(".localhost")) {
    throw new Error("Host no permitido.");
  }

  if (net.isIP(hostname)) {
    if (isBlockedIp(hostname)) throw new Error("Dirección privada no permitida.");
    return;
  }

  const addresses = await dns.lookup(hostname, { all: true, verbatim: true });
  if (!addresses.length || addresses.some(({ address }) => isBlockedIp(address))) {
    throw new Error("El host no apunta a una dirección pública permitida.");
  }
}

async function fetchImageSafely(initialUrl) {
  let currentUrl = initialUrl;

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    await assertPublicHttpsUrl(currentUrl);

    const response = await fetch(currentUrl, {
      redirect: "manual",
      cache: "no-store",
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "User-Agent": "GKG-Image-Proxy/1.0",
      },
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) throw new Error("Redirección sin destino.");
      currentUrl = new URL(location, currentUrl);
      continue;
    }

    if (!response.ok) {
      throw new Error(`La imagen respondió con HTTP ${response.status}.`);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("image/")) {
      throw new Error("El recurso solicitado no es una imagen.");
    }

    const declaredLength = Number(response.headers.get("content-length") || 0);
    if (declaredLength && declaredLength > MAX_IMAGE_BYTES) {
      throw new Error("La imagen supera el tamaño permitido.");
    }

    const bytes = await response.arrayBuffer();
    if (bytes.byteLength > MAX_IMAGE_BYTES) {
      throw new Error("La imagen supera el tamaño permitido.");
    }

    return new Response(bytes, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
        "X-Content-Type-Options": "nosniff",
      },
    });
  }

  throw new Error("Demasiadas redirecciones.");
}

export async function GET(request) {
  try {
    const requestUrl = new URL(request.url);
    const rawUrl = requestUrl.searchParams.get("url");

    if (!rawUrl) {
      return Response.json({ error: "Falta el parámetro url." }, { status: 400 });
    }

    let remoteUrl;
    try {
      remoteUrl = new URL(rawUrl);
    } catch {
      return Response.json({ error: "URL de imagen inválida." }, { status: 400 });
    }

    return await fetchImageSafely(remoteUrl);
  } catch (error) {
    console.error("GKG image proxy error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "No se pudo cargar la imagen." },
      { status: 502 }
    );
  }
}
