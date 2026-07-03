"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { requireSuperAdmin } from "@/lib/auth-helpers"
import { getMosqueById } from "@/db/queries"
import { SELECTED_MOSQUE_COOKIE, SELECTED_MOSQUE_COOKIE_MAX_AGE } from "@/lib/mosque-cookie"

export async function selectMosque(mosqueId: number): Promise<void> {
  await requireSuperAdmin()

  const mosque = await getMosqueById(mosqueId)
  if (!mosque) redirect("/admin/select-mosque")

  const cookieStore = await cookies()
  cookieStore.set(SELECTED_MOSQUE_COOKIE, String(mosqueId), {
    httpOnly: true,
    sameSite: "lax",
    maxAge: SELECTED_MOSQUE_COOKIE_MAX_AGE,
    path: "/",
  })

  redirect("/admin")
}

export async function clearMosqueSelection(): Promise<void> {
  await requireSuperAdmin()
  const cookieStore = await cookies()
  cookieStore.delete(SELECTED_MOSQUE_COOKIE)
  redirect("/admin/select-mosque")
}
