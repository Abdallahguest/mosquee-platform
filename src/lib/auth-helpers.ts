import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")
  return session
}

// Renvoie la session + le mosqueId de l'utilisateur connecté, ou null si aucun
// n'est associé. Les Server Actions doivent toujours s'appuyer sur ce mosqueId
// plutôt que sur une valeur fournie par le client (autorisation multi-tenant).
export async function getSessionMosque() {
  const session = await requireSession()
  return { session, mosqueId: session.user.mosqueId ?? null }
}
