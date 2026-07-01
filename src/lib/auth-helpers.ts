import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth, type Session } from "@/lib/auth"
import { getPrimaryMosqueByUserId, getMosquesByUserId } from "@/db/queries"

export async function requireSession(): Promise<Session> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")
  return session as Session
}

export async function getSessionMosque() {
  const session = await requireSession()
  const mosque = await getPrimaryMosqueByUserId(session.user.id)
  return { session, mosque, mosqueId: mosque?.id ?? null }
}

export async function requireSuperAdmin(): Promise<Session> {
  const session = await requireSession()
  const user = session.user as { id: string; role?: string }
  if (user.role !== "super_admin") redirect("/admin")
  return session
}

// Retourne l'utilisateur + la liste des IDs de ses mosquées (pour l'autorisation)
export async function getSessionAuth() {
  const session = await requireSession()
  const mosquesList = await getMosquesByUserId(session.user.id)
  const user = session.user as { id: string; role?: string }
  return {
    session,
    user: { id: user.id, role: user.role ?? "admin" },
    userMosqueIds: mosquesList.map((m) => m.id),
  }
}
