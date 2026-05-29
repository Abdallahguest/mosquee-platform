import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getMosqueByAdminEmail } from "@/db/queries"

export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")
  return session
}


export async function getSessionMosque() {
  const session = await requireSession()
  console.log("🔍 Email session:", session.user.email)
  const mosque = await getMosqueByAdminEmail(session.user.email)
  console.log("🔍 Mosquée trouvée:", mosque?.name ?? "AUCUNE")
  return { session, mosque, mosqueId: mosque?.id ?? null }
}
