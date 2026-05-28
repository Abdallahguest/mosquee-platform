"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/db/index"
import { announcements, users } from "@/db/schema"
import { eq, and } from "drizzle-orm"

const AnnouncementSchema = z.object({
  title:       z.string().min(1, "Titre requis").max(200),
  content:     z.string().min(1, "Contenu requis").max(2000),
  mosqueId:    z.number().int().positive(),
  isPublished: z.boolean().default(false),
  expiresAt:   z.string().optional(),
})

export type ActionResult<T = void> =
  | { success: true;  data: T;       error?: never }
  | { success: false; error: string; data?: never  }

async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")
  return session
}

export async function createAnnouncement(
  formData: FormData
): Promise<ActionResult<{ id: number }>> {
  try {
    await requireSession()

    const raw = {
      title:       formData.get("title"),
      content:     formData.get("content"),
      mosqueId:    Number(formData.get("mosqueId")),
      isPublished: formData.get("isPublished") === "true",
      expiresAt:   formData.get("expiresAt") || undefined,
    }

    console.log("Raw data:", raw)

    const parsed = AnnouncementSchema.safeParse(raw)
    if (!parsed.success) {
      console.error("Validation error:", parsed.error.issues)
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Données invalides",
      }
    }

    // TODO: Créer un lien entre authUser et users pour récupérer le bon authorId
    // Récupérer le premier utilisateur disponible
    const firstUser = await db.select().from(users).limit(1)
    const authorId = firstUser[0]?.id ?? 1
    
    console.log("Using authorId:", authorId)

    const [announcement] = await db
      .insert(announcements)
      .values({
        mosqueId:    parsed.data.mosqueId,
        title:       parsed.data.title,
        content:     parsed.data.content,
        authorId:    authorId,
        isPublished: parsed.data.isPublished,
        publishedAt: parsed.data.isPublished ? new Date() : undefined,
        expiresAt:   parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
      })
      .returning({ id: announcements.id })

    console.log("Announcement created:", announcement)

    revalidatePath("/admin/announcements")
    revalidatePath(`/m/${parsed.data.mosqueId}`)

    return { success: true, data: { id: announcement.id } }
  } catch (error) {
    console.error("Error creating announcement:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur lors de la création." 
    }
  }
}

export async function deleteAnnouncement(
  id: number,
  mosqueId: number
): Promise<ActionResult> {
  await requireSession()

  try {
    await db
      .delete(announcements)
      .where(and(eq(announcements.id, id), eq(announcements.mosqueId, mosqueId)))

    revalidatePath("/admin/announcements")
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Erreur lors de la suppression." }
  }
}

export async function toggleAnnouncementPublished(
  id: number,
  current: boolean
): Promise<ActionResult> {
  await requireSession()

  try {
    await db
      .update(announcements)
      .set({ 
        isPublished: !current,
        publishedAt: !current ? new Date() : undefined,
      })
      .where(eq(announcements.id, id))

    revalidatePath("/admin/announcements")
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "Erreur lors de la mise à jour." }
  }
}
