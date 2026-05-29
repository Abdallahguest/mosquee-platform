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
  console.log("🔍 EMAIL SESSION:", JSON.stringify(session.user.email))
  console.log("🔍 USER COMPLET:", JSON.stringify(session.user))
  const mosque = await getMosqueByAdminEmail(session.user.email)
  console.log("🔍 MOSQUÉE:", mosque?.name ?? "AUCUNE")
  return { session, mosque, mosqueId: mosque?.id ?? null }
}
