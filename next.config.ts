import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"
import withSerwistInit from "@serwist/next"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

const withSerwist = withSerwistInit({
  // Le service worker source (compilé en public/sw.js au build).
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  // Désactivé en développement : évite les galères de cache en dev,
  // et reste compatible avec `next dev --turbopack`.
  disable: process.env.NODE_ENV === "development",
  // Recharge la page au retour de connexion (remplace reloadOnOnline de next-pwa).
  reloadOnOnline: true,
  // Précache la page de repli hors-ligne pour qu'elle soit toujours disponible.
  additionalPrecacheEntries: [{ url: "/~offline", revision: "1" }],
})

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options",        value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",     value: "camera=(), microphone=(), geolocation=()" },
          // CSP de base. 'unsafe-inline'/'unsafe-eval' restent nécessaires sans
          // configuration de nonce ; à durcir plus tard via un middleware à nonce.
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https:",
              "frame-ancestors 'self'",
              "base-uri 'self'",
              "form-action 'self'",
              "object-src 'none'",
            ].join("; "),
          },
        ],
      },
    ]
  },
}

export default withSerwist(withNextIntl(nextConfig))
