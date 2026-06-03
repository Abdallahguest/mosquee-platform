"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getSessionMosque } from "@/lib/auth-helpers"
import { db } from "@/db/index"
import { announcements } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import type { ActionResult } from "./action-result"

// Chaque règle porte un CODE (pas une phrase). Traduit côté composant.
const AnnouncementSchema = z.object({
  title:       z.string().min(1, "TITLE_REQUIRED").max(100, "TITLE_TOO_LONG"),
  content:     z.string().min(1, "CONTENT_REQUIRED").max(2000, "CONTENT_TOO_LONG"),
  isPublished: z.boolean().default(false),
  expiresAt:   z.string().optional(),
})

// Collecte tous les codes de validation (affichage groupé).
function collectCodes(error: z.ZodError): string[] {
  return error.issues.map((i) => i.message)
}

function revalidateContent(slug: string) {
  revalidatePath("/admin/announcements")
  revalidatePath("/admin")
  revalidatePath(`/m/${slug}`)
}

export async function createAnnouncement(
  formData: FormData
): Promise<ActionResult<{ id: number }>> {
  try {
    const { session, mosque, mosqueId } = await getSessionMosque()
    if (!mosque || mosqueId == null) return { success: false, error: "NO_MOSQUE" }

    const raw = {
      title:       formData.get("title"),
      content:     formData.get("content"),
      isPublished: formData.get("isPublished") === "true",
      expiresAt:   formData.get("expiresAt") || undefined,
    }

    const parsed = AnnouncementSchema.safeParse(raw)
    if (!parsed.success) {
      return { success: false, error: "INVALID_DATA", codes: collectCodes(parsed.error) }
    }

    const [announcement] = await db
      .insert(announcements)
      .values({
        mosqueId,
        title:       parsed.data.title,
        content:     parsed.data.content,
        authorId:    session.user.id,
        isPublished: parsed.data.isPublished,
        publishedAt: parsed.data.isPublished ? new Date() : undefined,
        expiresAt:   parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
      })
      .returning({ id: announcements.id })

    revalidateContent(mosque.slug)
    return { success: true, data: { id: announcement.id } }
  } catch {
    // On ne divulgue plus error.message brut (fuite technique). Code générique.
    return { success: false, error: "CREATE_FAILED" }
  }
}

export async function updateAnnouncement(
  id: number,
  formData: FormData
): Promise<ActionResult> {
  try {
    const { mosque, mosqueId } = await getSessionMosque()
    if (!mosque || mosqueId == null) return { success: false, error: "NO_MOSQUE" }

    const raw = {
      title:       formData.get("title"),
      content:     formData.get("content"),
      isPublished: formData.get("isPublished") === "true",
      expiresAt:   formData.get("expiresAt") || undefined,
    }

    const parsed = AnnouncementSchema.safeParse(raw)
    if (!parsed.success) {
      return { success: false, error: "INVALID_DATA", codes: collectCodes(parsed.error) }
    }

    const [existing] = await db
      .select({ publishedAt: announcements.publishedAt })
      .from(announcements)
      .where(and(eq(announcements.id, id), eq(announcements.mosqueId, mosqueId)))
      .limit(1)

    if (!existing) return { success: false, error: "ANNOUNCEMENT_NOT_FOUND" }

    await db
      .update(announcements)
      .set({
        title:       parsed.data.title,
        content:     parsed.data.content,
        isPublished: parsed.data.isPublished,
        publishedAt: parsed.data.isPublished
          ? existing.publishedAt ?? new Date()
          : existing.publishedAt,
      })
      .where(and(eq(announcements.id, id), eq(announcements.mosqueId, mosqueId)))

    revalidateContent(mosque.slug)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "UPDATE_FAILED" }
  }
}

export async function deleteAnnouncement(id: number): Promise<ActionResult> {
  const { mosque, mosqueId } = await getSessionMosque()
  if (!mosque || mosqueId == null) return { success: false, error: "NO_MOSQUE" }

  try {
    await db
      .delete(announcements)
      .where(and(eq(announcements.id, id), eq(announcements.mosqueId, mosqueId)))

    revalidateContent(mosque.slug)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "DELETE_FAILED" }
  }
}

export async function toggleAnnouncementPublished(
  id: number,
  current: boolean
): Promise<ActionResult> {
  const { mosque, mosqueId } = await getSessionMosque()
  if (!mosque || mosqueId == null) return { success: false, error: "NO_MOSQUE" }

  try {
    await db
      .update(announcements)
      .set({
        isPublished: !current,
        publishedAt: !current ? new Date() : undefined,
      })
      .where(and(eq(announcements.id, id), eq(announcements.mosqueId, mosqueId)))

    revalidateContent(mosque.slug)
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "UPDATE_FAILED" }
  }
}
