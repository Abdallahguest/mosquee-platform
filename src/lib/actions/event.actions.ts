"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getSessionMosque } from "@/lib/auth-helpers"
import { db } from "@/db/index"
import { events } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import type { ActionResult } from "./action-result"
import { logAction, AUDIT_ACTIONS } from "@/lib/audit"

const EventSchema = z.object({
  title:       z.string().min(1, "TITLE_REQUIRED").max(100, "TITLE_TOO_LONG"),
  description: z.string().max(1000, "DESCRIPTION_TOO_LONG").optional(),
  location:    z.string().min(1, "LOCATION_REQUIRED").max(200, "LOCATION_TOO_LONG"),
  startAt:     z.string().min(1, "START_REQUIRED"),
  endAt:       z.string().optional(),
  isPublished: z.boolean().default(false),
  audioUrl:    z.string().url("AUDIO_URL_INVALID").or(z.literal("")).optional(),
}).refine(
  (data) => !data.endAt || new Date(data.endAt) >= new Date(data.startAt),
  { message: "END_BEFORE_START", path: ["endAt"] }
)

function collectCodes(error: z.ZodError): string[] {
  return error.issues.map((i) => i.message)
}

function revalidateContent(slug: string) {
  revalidatePath("/admin/events")
  revalidatePath("/admin")
  revalidatePath(`/m/${slug}`)
}

export async function createEvent(
  formData: FormData
): Promise<ActionResult<{ id: number }>> {
  const { session, mosque, mosqueId } = await getSessionMosque()
  if (!mosque || mosqueId == null) return { success: false, error: "NO_MOSQUE" }

  const raw = {
    title:       formData.get("title"),
    description: formData.get("description") || undefined,
    location:    formData.get("location"),
    startAt:     formData.get("startAt"),
    endAt:       formData.get("endAt") || undefined,
    isPublished: formData.get("isPublished") === "true",
    audioUrl:    formData.get("audioUrl") || "",
  }

  const parsed = EventSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: "INVALID_DATA", codes: collectCodes(parsed.error) }
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
        audioUrl:    parsed.data.audioUrl || null,
      })
      .returning({ id: events.id })

    revalidateContent(mosque.slug)
    await logAction({
      userId:   session.user.id,
      mosqueId,
      action:   AUDIT_ACTIONS.EVENT_CREATE,
      targetId: `event:${event.id}`,
      details:  parsed.data.title,
    })
    return { success: true, data: { id: event.id } }
  } catch {
    return { success: false, error: "CREATE_FAILED" }
  }
}

export async function updateEvent(
  id: number,
  formData: FormData
): Promise<ActionResult> {
  const { session, mosque, mosqueId } = await getSessionMosque()
  if (!mosque || mosqueId == null) return { success: false, error: "NO_MOSQUE" }

  const raw = {
    title:       formData.get("title"),
    description: formData.get("description") || undefined,
    location:    formData.get("location"),
    startAt:     formData.get("startAt"),
    endAt:       formData.get("endAt") || undefined,
    isPublished: formData.get("isPublished") === "true",
    audioUrl:    formData.get("audioUrl") || "",
  }

  const parsed = EventSchema.safeParse(raw)
  if (!parsed.success) {
    return { success: false, error: "INVALID_DATA", codes: collectCodes(parsed.error) }
  }

  try {
    const [existing] = await db
      .select({ id: events.id })
      .from(events)
      .where(and(eq(events.id, id), eq(events.mosqueId, mosqueId)))
      .limit(1)

    if (!existing) return { success: false, error: "EVENT_NOT_FOUND" }

    await db
      .update(events)
      .set({
        title:       parsed.data.title,
        description: parsed.data.description ?? null,
        location:    parsed.data.location,
        startAt:     new Date(parsed.data.startAt),
        endAt:       parsed.data.endAt ? new Date(parsed.data.endAt) : null,
        isPublished: parsed.data.isPublished,
        audioUrl:    parsed.data.audioUrl || null,
      })
      .where(and(eq(events.id, id), eq(events.mosqueId, mosqueId)))

    revalidateContent(mosque.slug)
    await logAction({
      userId:   session.user.id,
      mosqueId,
      action:   AUDIT_ACTIONS.EVENT_UPDATE,
      targetId: `event:${id}`,
      details:  parsed.data.title,
    })
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "UPDATE_FAILED" }
  }
}

export async function deleteEvent(id: number): Promise<ActionResult> {
  const { session, mosque, mosqueId } = await getSessionMosque()
  if (!mosque || mosqueId == null) return { success: false, error: "NO_MOSQUE" }

  try {
    await db
      .delete(events)
      .where(and(eq(events.id, id), eq(events.mosqueId, mosqueId)))

    revalidateContent(mosque.slug)
    await logAction({
      userId:   session.user.id,
      mosqueId,
      action:   AUDIT_ACTIONS.EVENT_DELETE,
      targetId: `event:${id}`,
    })
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "DELETE_FAILED" }
  }
}

export async function toggleEventPublished(
  id: number,
  current: boolean
): Promise<ActionResult> {
  const { session, mosque, mosqueId } = await getSessionMosque()
  if (!mosque || mosqueId == null) return { success: false, error: "NO_MOSQUE" }

  try {
    await db
      .update(events)
      .set({ isPublished: !current })
      .where(and(eq(events.id, id), eq(events.mosqueId, mosqueId)))

    revalidateContent(mosque.slug)
    await logAction({
      userId:   session.user.id,
      mosqueId,
      action:   current ? AUDIT_ACTIONS.EVENT_DELETE : AUDIT_ACTIONS.EVENT_CREATE,
      targetId: `event:${id}`,
      details:  current ? "unpublish" : "publish",
    })
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "UPDATE_FAILED" }
  }
}
