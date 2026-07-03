"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { requireSuperAdmin } from "@/lib/auth-helpers"
import { getMosqueById } from "@/db/queries"

const COOKIE_NAME = "amana-selected-mosque"
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 jours

// Sélectionne une mosquée active pour le super-admin.
// Stocke l'ID dans un cookie httpOnly — lu par getSessionMosque().
export async function selectMosque(mosqueId: number): Promise<void> {
  await requireSuperAdmin()

  // Vérifie que la mosquée existe
  const mosque = await getMosqueById(mosqueId)
  if (!mosque) redirect("/admin/select-mosque")

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, String(mosqueId), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  })

  redirect("/admin")
}

// Efface la sélection — retour à l'état "aucune mosquée sélectionnée".
export async function clearMosqueSelection(): Promise<void> {
  await requireSuperAdmin()
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
  redirect("/admin/select-mosque")
}

export { COOKIE_NAME }
