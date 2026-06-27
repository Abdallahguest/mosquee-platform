import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Amana Connect",
    short_name: "Amana",
    description: "Horaires de prière, annonces et événements de votre mosquée",
    start_url: "/",
    display: "standalone",
    background_color: "#f9fafb",
    theme_color: "#15803d",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["lifestyle", "education"],
    lang: "fr",
    dir: "ltr",
  }
}
