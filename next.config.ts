import type { NextConfig } from "next"
import createNextIntlPlugin from "next-intl/plugin"
import withSerwistInit from "@serwist/next"
import { withSentryConfig } from "@sentry/nextjs"

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts")

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  reloadOnOnline: true,
  additionalPrecacheEntries: [{ url: "/offline", revision: "3" }],
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

// Ordre : withSentryConfig > withSerwist > withNextIntl > nextConfig
// withSentryConfig doit être le wrapper le plus externe.
export default withSentryConfig(
  withSerwist(withNextIntl(nextConfig)),
  {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    // Ne pas bloquer le build si Sentry est absent (ex: env local sans DSN).
    silent: true,
    // Désactiver l'upload des source maps si pas de token (env local).
    authToken: process.env.SENTRY_AUTH_TOKEN,
    // Tunnel optionnel pour contourner les adblockers (activer si besoin).
    // tunnelRoute: "/monitoring-tunnel",
    // Ne pas envoyer de telemetry à Sentry.
    telemetry: false,
  }
)
