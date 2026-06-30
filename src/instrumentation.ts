// Sentry instrumentation — chargé automatiquement par Next.js App Router.
// Ce fichier initialise le SDK côté serveur (Node.js) et Edge runtime.

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./instrumentation.node")
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./instrumentation.edge")
  }
}
