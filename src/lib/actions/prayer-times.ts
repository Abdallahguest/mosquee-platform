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

// "HH:MM" ou chaîne vide (= effacer → null en base). Anti-jahàla : format strict, clair.
const hhmmOrEmpty = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || /^([01]\d|2[0-3]):[0-5]\d$/.test(v),
    { message: "Format attendu HH:MM (24h), ex. 05:35" }
  )

const prayerTimesSchema = z.object({
  mosqueId:    z.coerce.number().int().positive(),
  fajrTime:    hhmmOrEmpty,
  dhuhrTime:   hhmmOrEmpty,
  asrTime:     hhmmOrEmpty,
  maghribTime: hhmmOrEmpty,
  ishaTime:    hhmmOrEmpty,
  jumuaTime:   hhmmOrEmpty,
})

// "" → null pour stocker proprement l'absence de valeur.
const orNull = (v: string) => (v === "" ? null : v)

// Lit le rôle de l'utilisateur depuis la BASE (source de vérité), pas depuis
// le type de session — Better-Auth n'expose pas role dans le type user, et la
// base est de toute façon plus fiable (anti-gharar : on ne suppose pas le rôle).
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
  const session = await requireSession() // 401 géré en amont si pas connecté

  const parsed = prayerTimesSchema.safeParse({
    mosqueId:    formData.get("mosqueId"),
    fajrTime:    formData.get("fajrTime") ?? "",
    dhuhrTime:   formData.get("dhuhrTime") ?? "",
    asrTime:     formData.get("asrTime") ?? "",
    maghribTime: formData.get("maghribTime") ?? "",
    ishaTime:    formData.get("ishaTime") ?? "",
    jumuaTime:   formData.get("jumuaTime") ?? "",
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form")
      if (!fieldErrors[key]) fieldErrors[key] = issue.message
    }
    return { ok: false, message: "Certaines heures sont invalides.", fieldErrors }
  }

  const { mosqueId, ...times } = parsed.data

  // ── Autorisation : l'utilisateur peut-il gérer CETTE mosquée ? ──
  // canManageMosque(user, targetMosqueId, userMosqueIds) — fonction pure testée.
  const authUser = await getAuthUser(session.user.id)
  const userMosques = await getMosquesByUserId(session.user.id)
  const userMosqueIds = userMosques.map((m) => m.id)
  const allowed = canManageMosque(authUser, mosqueId, userMosqueIds)
  // Un admin ne peut modifier QUE les mosquées dont il est admin ; un super_admin
  // peut tout. (Cas critique couvert par tes 21 tests d'autorisation.)
  if (!allowed) {
    return { ok: false, message: "Action non autorisée pour cette mosquée." }
  }

  await db
    .update(mosques)
    .set({
      fajrTime:    orNull(times.fajrTime),
      dhuhrTime:   orNull(times.dhuhrTime),
      asrTime:     orNull(times.asrTime),
      maghribTime: orNull(times.maghribTime),
      ishaTime:    orNull(times.ishaTime),
      jumuaTime:   orNull(times.jumuaTime),
    })
    .where(eq(mosques.id, mosqueId))

  // Rafraîchir la page publique et l'admin.
  revalidatePath("/(public)", "layout")
  revalidatePath("/admin")

  return { ok: true, message: "Horaires enregistrés." }
}

// ── Action de SUGGESTION (aide optionnelle) ──
// Ne touche PAS la base. Renvoie des "HH:MM" MWL pour pré-remplir le formulaire.
// L'admin valide ensuite manuellement. Unique survivance du calcul.
export async function getSuggestedPrayerTimes(mosqueId: number): Promise<SuggestActionResult> {
  const session = await requireSession()
  const authUser = await getAuthUser(session.user.id)
  const userMosques = await getMosquesByUserId(session.user.id)
  const allowed = canManageMosque(authUser, mosqueId, userMosques.map((m) => m.id))
  if (!allowed) return { ok: false, message: "Non autorisé." }

  const [mosque] = await db.select().from(mosques).where(eq(mosques.id, mosqueId))
  if (!mosque) return { ok: false, message: "Mosquée introuvable." }

  const suggested = suggestPrayerTimes(
    mosque.latitude,
    mosque.longitude,
    mosque.timezone,
    mosque.calculationMethod
  )
  return { ok: true, suggested }
}
