import * as Sentry from "@sentry/nextjs"

// Initialisation côté navigateur.
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,

  // Pas de session replay (vie privée + réseau).
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),

  ignoreErrors: [
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed",
    "Non-Error exception captured",
  ],
})
