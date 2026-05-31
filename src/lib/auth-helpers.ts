import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getPrimaryMosqueByUserId } from "@/db/queries"

export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")
  return session
}

export async function getSessionMosque() {
  const session = await requireSession()
  const mosque = await getPrimaryMosqueByUserId(session.user.id)
  return { session, mosque, mosqueId: mosque?.id ?? null }
}

export async function requireSuperAdmin() {
  const session = await requireSession()
  if (session.user.role !== "super_admin") redirect("/admin")
  return session
}
