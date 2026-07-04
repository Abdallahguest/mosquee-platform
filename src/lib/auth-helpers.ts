import { headers, cookies } from "next/headers"
import { redirect } from "next/navigation"
import { auth, type Session } from "@/lib/auth"
import { getPrimaryMosqueByUserId, getMosquesByUserId, getMosqueById } from "@/db/queries"
import { SELECTED_MOSQUE_COOKIE } from "@/lib/mosque-cookie"
import { computeSubscriptionStatus } from "@/lib/actions/subscription.actions"

export async function requireSession(): Promise<Session> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")
  return session as Session
}

export async function getSessionMosque() {
  const session = await requireSession()
  const user = session.user as { id: string; role?: string }

  // Super-admin : priorité au cookie de sélection de mosquée.
  if (user.role === "super_admin") {
    const cookieStore = await cookies()
    const selectedId = cookieStore.get(SELECTED_MOSQUE_COOKIE)?.value
    if (selectedId) {
      const mosque = await getMosqueById(Number(selectedId))
      if (mosque) return { session, mosque, mosqueId: mosque.id }
    }
    return { session, mosque: null, mosqueId: null }
  }

  // Admin normal : mosquée principale liée à son compte
  const mosque = await getPrimaryMosqueByUserId(session.user.id)

  // Vérification abonnement : si expiré ou suspendu → rediriger vers page dédiée
  // sauf si la mosquée n'a pas encore de trialEndsAt (création avant cette fonctionnalité)
  if (mosque) {
    const status = computeSubscriptionStatus(mosque)
    if (status === "expired" || status === "suspended") {
      redirect("/admin/subscription-expired")
    }
  }

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
