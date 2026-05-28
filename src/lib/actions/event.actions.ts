"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/db/index"
import { events } from "@/db/schema"
import { eq, and } from "drizzle-orm"

const EventSchema = z.object({
  title:       z.string().min(1, "Titre requis").max(100),
  description: z.string().max(1000).optional(),
  location:    z.string().min(1, "Lieu requis").max(200),
  mosqueId:    z.number().int().positive(),
  startAt:     z.string().min(1, "Date de début requise"),
  endAt:       z.string().optional(),
  isPublished: z.boolean().default(false),
})

export type ActionResult<T = void> =
  | { success: true;  data: T;       error?: never }
  | { success: false; error: string; data?: never  }

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")
  return session
}

export async function createEvent(
  formData: FormData
): Promise<ActionResult<{ id: number }>> {
  await requireSession()

  const raw = {
    title:       formData.get("title"),
    description: formData.get("description") || undefined,
    location:    formData.get("location"),
    mosqueId:    Number(formData.get("mosqueId")),
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
        mosqueId:    parsed.data.mosqueId,
        title:       parsed.data.title,
        description: parsed.data.description ?? null,
        location:    parsed.data.location,
        startAt:     new Date(parsed.data.startAt),
        endAt:       parsed.data.endAt ? new Date(parsed.data.endAt) : null,
        isPublished: parsed.data.isPublished,
      })
      .returning({ id: events.id })

    revalidatePath("/admin/events")
    revalidatePath(`/m/${parsed.data.mosqueId}`)

    return { success: true, data: { id: event.id } }
  } catch {
    return { success: false, error: "Erreur lors de la création." }
  }
}

export async function deleteEvent(
  id: number,
  mosqueId: number
): Promise<ActionResult> {
  await requireSession()

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
  await requireSession()

  try {
    await db
      .update(events)
      .set({ isPublished: !current })
      .where(eq(events.id, id))

    revalidatePath("/admin/events")
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Erreur lors de la mise à jour." }
  }
}
