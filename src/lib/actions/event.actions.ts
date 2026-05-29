"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getSessionMosque } from "@/lib/auth-helpers"
import { db } from "@/db/index"
import { events } from "@/db/schema"
import { eq, and } from "drizzle-orm"

const EventSchema = z.object({
  title:       z.string().min(1, "Titre requis").max(100),
  description: z.string().max(1000).optional(),
  location:    z.string().min(1, "Lieu requis").max(200),
  startAt:     z.string().min(1, "Date de début requise"),
  endAt:       z.string().optional(),
  isPublished: z.boolean().default(false),
})

export type ActionResult<T = void> =
  | { success: true;  data: T;       error?: never }
  | { success: false; error: string; data?: never  }

const NO_MOSQUE = "Aucune mosquée n'est associée à votre compte."

export async function createEvent(
  formData: FormData
): Promise<ActionResult<{ id: number }>> {
  const { mosqueId } = await getSessionMosque()
  if (mosqueId == null) return { success: false, error: NO_MOSQUE }

  const raw = {
    title:       formData.get("title"),
    description: formData.get("description") || undefined,
    location:    formData.get("location"),
    startAt:     formData.get("startAt"),
    endAt:       formData.get("endAt") || undefined,
    isPublished: formData.get("isPublished") === "true",
  }

  const parsed = EventSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides",
    }
  }

  try {
    const [event] = await db
      .insert(events)
      .values({
        mosqueId,
        title:       parsed.data.title,
        description: parsed.data.description ?? null,
        location:    parsed.data.location,
        startAt:     new Date(parsed.data.startAt),
        endAt:       parsed.data.endAt ? new Date(parsed.data.endAt) : null,
        isPublished: parsed.data.isPublished,
      })
      .returning({ id: events.id })

    revalidatePath("/admin/events")
    revalidatePath(`/m/${mosqueId}`)

    return { success: true, data: { id: event.id } }
  } catch {
    return { success: false, error: "Erreur lors de la création." }
  }
}

export async function updateEvent(
  id: number,
  formData: FormData
): Promise<ActionResult> {
  const { mosqueId } = await getSessionMosque()
  if (mosqueId == null) return { success: false, error: NO_MOSQUE }

  const raw = {
    title:       formData.get("title"),
    description: formData.get("description") || undefined,
    location:    formData.get("location"),
    startAt:     formData.get("startAt"),
    endAt:       formData.get("endAt") || undefined,
    isPublished: formData.get("isPublished") === "true",
  }

  const parsed = EventSchema.safeParse(raw)
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides",
    }
  }

  try {
    const [existing] = await db
      .select({ id: events.id })
      .from(events)
      .where(and(eq(events.id, id), eq(events.mosqueId, mosqueId)))
      .limit(1)

    if (!existing) return { success: false, error: "Événement introuvable." }

    await db
      .update(events)
      .set({
        title:       parsed.data.title,
        description: parsed.data.description ?? null,
        location:    parsed.data.location,
        startAt:     new Date(parsed.data.startAt),
        endAt:       parsed.data.endAt ? new Date(parsed.data.endAt) : null,
        isPublished: parsed.data.isPublished,
      })
      .where(and(eq(events.id, id), eq(events.mosqueId, mosqueId)))

    revalidatePath("/admin/events")
    revalidatePath(`/m/${mosqueId}`)

    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Erreur lors de la mise à jour." }
  }
}

export async function deleteEvent(id: number): Promise<ActionResult> {
  const { mosqueId } = await getSessionMosque()
  if (mosqueId == null) return { success: false, error: NO_MOSQUE }

  try {
    await db
      .delete(events)
      .where(and(eq(events.id, id), eq(events.mosqueId, mosqueId)))

    revalidatePath("/admin/events")
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Erreur lors de la suppression." }
  }
}

export async function toggleEventPublished(
  id: number,
  current: boolean
): Promise<ActionResult> {
  const { mosqueId } = await getSessionMosque()
  if (mosqueId == null) return { success: false, error: NO_MOSQUE }

  try {
    await db
      .update(events)
      .set({ isPublished: !current })
      .where(and(eq(events.id, id), eq(events.mosqueId, mosqueId)))

    revalidatePath("/admin/events")
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Erreur lors de la mise à jour." }
  }
}
