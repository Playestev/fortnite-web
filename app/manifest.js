export default function manifest() {
  return {
    name: "Ganker Games",
    short_name: "Ganker Games",
    description:
      "Comunidad gamer con perfiles, sorteos, premios y beneficios de Ganker Games.",
    start_url: "/login",
    scope: "/",
    display: "standalone",
    background_color: "#00150a",
    theme_color: "#00ff73",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512x512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
