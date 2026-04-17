export async function GET() {
  try {
    const pageId = process.env.FACEBOOK_PAGE_ID?.trim();
    const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN?.trim();
    const pageUrl = process.env.FACEBOOK_PAGE_URL?.trim() || "";

    if (!pageId || !accessToken) {
      return Response.json(
        { error: "Faltan FACEBOOK_PAGE_ID o FACEBOOK_PAGE_ACCESS_TOKEN" },
        { status: 500 }
      );
    }

    const fields = [
      "id",
      "message",
      "created_time",
      "permalink_url",
      "full_picture",
      "attachments{media_type,media,url,subattachments{media,url}}",
    ].join(",");

    const url = `https://graph.facebook.com/v25.0/${pageId}/posts?fields=${encodeURIComponent(
      fields
    )}&limit=12&access_token=${encodeURIComponent(accessToken)}`;

    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();

    if (!res.ok) {
      return Response.json(
        { error: data.error?.message || "No se pudieron cargar los posts" },
        { status: 500 }
      );
    }

    const posts = (data.data || []).map((post) => {
      const attachment = post.attachments?.data?.[0];
      const subattachments = attachment?.subattachments?.data || [];

      const images = [];

      if (post.full_picture) {
        images.push(post.full_picture);
      }

      if (attachment?.media?.image?.src) {
        images.push(attachment.media.image.src);
      }

      subattachments.forEach((item) => {
        const img = item?.media?.image?.src;
        if (img) images.push(img);
      });

      const uniqueImages = [...new Set(images)];

      return {
        id: post.id,
        message: post.message || "",
        created_time: post.created_time || null,
        permalink_url: post.permalink_url || pageUrl,
        images: uniqueImages,
      };
    });

    return Response.json({ posts });
  } catch (error) {
    return Response.json(
      { error: "Error interno al cargar publicaciones" },
      { status: 500 }
    );
  }
}
