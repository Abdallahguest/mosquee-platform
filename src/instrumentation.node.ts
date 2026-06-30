import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Capture 10 % des transactions en production (ajuster selon le volume).
  // En dev, le tracing est désactivé (DSN absent).
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,

  // Pas de replay session (coût réseau + RGPD — principe anti-gharar).
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  // Désactiver en développement si le DSN n'est pas défini.
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),

  // Ignorer les erreurs attendues (navigation annulée, etc.)
  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed",
    "Non-Error exception captured",
  ],
})
