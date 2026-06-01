"use server"

import { z } from "zod"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"
import { db } from "@/db"
import { mosques, users } from "@/db/schema"
import { requireSession } from "@/lib/auth-helpers"
import { canManageMosque } from "@/lib/authorization"
import { getMosquesByUserId } from "@/db/queries"
import { suggestPrayerTimes } from "@/lib/prayer-times"
import type { PrayerTimesActionState, SuggestActionResult } from "./prayer-times-types"

// "HH:MM" ou chaîne vide (= effacer → null). Anti-jahàla : format strict.
const hhmmOrEmpty = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || /^([01]\d|2[0-3]):[0-5]\d$/.test(v),
    { message: "Format attendu HH:MM (24h), ex. 13:35" }
  )

const prayerTimesSchema = z.object({
  mosqueId:     z.coerce.number().int().positive(),
  fajrAdhan:    hhmmOrEmpty,
  fajrIqama:    hhmmOrEmpty,
  dhuhrAdhan:   hhmmOrEmpty,
  dhuhrIqama:   hhmmOrEmpty,
  asrAdhan:     hhmmOrEmpty,
  asrIqama:     hhmmOrEmpty,
  maghribAdhan: hhmmOrEmpty,
  maghribIqama: hhmmOrEmpty,
  ishaAdhan:    hhmmOrEmpty,
  ishaIqama:    hhmmOrEmpty,
  jumuaAdhan:   hhmmOrEmpty,
  jumuaIqama:   hhmmOrEmpty,
})

const orNull = (v: string) => (v === "" ? null : v)

const FIELD_NAMES = [
  "fajrAdhan", "fajrIqama", "dhuhrAdhan", "dhuhrIqama",
  "asrAdhan", "asrIqama", "maghribAdhan", "maghribIqama",
  "ishaAdhan", "ishaIqama", "jumuaAdhan", "jumuaIqama",
] as const

// Lit le rôle depuis la BASE (source de vérité), pas depuis le type de session.
async function getAuthUser(userId: string): Promise<{ id: string; role: string }> {
  const [row] = await db
    .select({ id: users.id, role: users.role })
    .from(users)
    .where(eq(users.id, userId))
  return row ?? { id: userId, role: "member" }
}

export async function updatePrayerTimes(
  _prev: PrayerTimesActionState,
  formData: FormData
): Promise<PrayerTimesActionState> {
  const session = await requireSession()

  const raw: Record<string, unknown> = { mosqueId: formData.get("mosqueId") }
  for (const f of FIELD_NAMES) raw[f] = formData.get(f) ?? ""
  const parsed = prayerTimesSchema.safeParse(raw)

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form")
      if (!fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return { ok: false, message: "Certaines heures sont invalides.", fieldErrors }
  }

  const { mosqueId, ...times } = parsed.data

  const authUser = await getAuthUser(session.user.id)
  const userMosques = await getMosquesByUserId(session.user.id)
  const allowed = canManageMosque(authUser, mosqueId, userMosques.map((m) => m.id))
  if (!allowed) {
    return { ok: false, message: "Action non autorisée pour cette mosquée." }
  }

  await db
    .update(mosques)
    .set({
      fajrAdhan:    orNull(times.fajrAdhan),
      fajrIqama:    orNull(times.fajrIqama),
      dhuhrAdhan:   orNull(times.dhuhrAdhan),
      dhuhrIqama:   orNull(times.dhuhrIqama),
      asrAdhan:     orNull(times.asrAdhan),
      asrIqama:     orNull(times.asrIqama),
      maghribAdhan: orNull(times.maghribAdhan),
      maghribIqama: orNull(times.maghribIqama),
      ishaAdhan:    orNull(times.ishaAdhan),
      ishaIqama:    orNull(times.ishaIqama),
      jumuaAdhan:   orNull(times.jumuaAdhan),
      jumuaIqama:   orNull(times.jumuaIqama),
    })
    .where(eq(mosques.id, mosqueId))

  revalidatePath("/(public)", "layout")
  revalidatePath("/admin")

  return { ok: true, message: "Horaires enregistrés." }
}

// Suggestion d'ADHAN uniquement (ne touche pas la base, jamais l'iqama).
export async function getSuggestedPrayerTimes(mosqueId: number): Promise<SuggestActionResult> {
  const session = await requireSession()
  const authUser = await getAuthUser(session.user.id)
  const userMosques = await getMosquesByUserId(session.user.id)
  const allowed = canManageMosque(authUser, mosqueId, userMosques.map((m) => m.id))
  if (!allowed) return { ok: false, message: "Non autorisé." }

  const [mosque] = await db.select().from(mosques).where(eq(mosques.id, mosqueId))
  if (!mosque) return { ok: false, message: "Mosquée introuvable." }

  const suggested = suggestPrayerTimes(
    mosque.latitude, mosque.longitude, mosque.timezone, mosque.calculationMethod
  )
  return { ok: true, suggested }
}
