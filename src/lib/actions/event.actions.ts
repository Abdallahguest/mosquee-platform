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
}).refine(
  (data) => !data.endAt || new Date(data.endAt) >= new Date(data.startAt),
  { message: "La date de fin ne peut pas être antérieure à la date de début.", path: ["endAt"] }
)

export type ActionResult<T = void> =
  | { success: true;  data: T;       error?: never }
  | { success: false; error: string; data?: never  }

const NO_MOSQUE = "Aucune mosquée n'est associée à votre compte."

function revalidateContent(slug: string) {
  revalidatePath("/admin/events")
  revalidatePath("/admin")
  revalidatePath(`/m/${slug}`)
}

export async function createEvent(
  formData: FormData
): Promise<ActionResult<{ id: number }>> {
  const { mosque, mosqueId } = await getSessionMosque()
  if (!mosque || mosqueId == null) return { success: false, error: NO_MOSQUE }

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

    revalidateContent(mosque.slug)

    return { success: true, data: { id: event.id } }
  } catch {
    return { success: false, error: "Erreur lors de la création." }
  }
}

export async function updateEvent(
  id: number,
  formData: FormData
): Promise<ActionResult> {
  const { mosque, mosqueId } = await getSessionMosque()
  if (!mosque || mosqueId == null) return { success: false, error: NO_MOSQUE }

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

    revalidateContent(mosque.slug)

    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Erreur lors de la mise à jour." }
  }
}

export async function deleteEvent(id: number): Promise<ActionResult> {
  const { mosque, mosqueId } = await getSessionMosque()
  if (!mosque || mosqueId == null) return { success: false, error: NO_MOSQUE }

  try {
    await db
      .delete(events)
      .where(and(eq(events.id, id), eq(events.mosqueId, mosqueId)))

    revalidateContent(mosque.slug)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Erreur lors de la suppression." }
  }
}

export async function toggleEventPublished(
  id: number,
  current: boolean
): Promise<ActionResult> {
  const { mosque, mosqueId } = await getSessionMosque()
  if (!mosque || mosqueId == null) return { success: false, error: NO_MOSQUE }

  try {
    await db
      .update(events)
      .set({ isPublished: !current })
      .where(and(eq(events.id, id), eq(events.mosqueId, mosqueId)))

    revalidateContent(mosque.slug)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Erreur lors de la mise à jour." }
  }
}
