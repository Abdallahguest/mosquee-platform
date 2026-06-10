"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getSessionMosque } from "@/lib/auth-helpers"
import { db } from "@/db/index"
import { mosqueMembers } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import type { ActionResult } from "./action-result"

// Catégories FIXES (anti sur-ingénierie : pas de catégories libres).
const CATEGORIES = ["imam", "sage", "conseiller", "equipe"] as const

const MemberSchema = z.object({
  name:     z.string().min(1, "MEMBER_NAME_REQUIRED").max(200, "MEMBER_NAME_TOO_LONG"),
  category: z.enum(CATEGORIES, { message: "MEMBER_CATEGORY_INVALID" }),
  role:     z.string().max(200, "MEMBER_ROLE_TOO_LONG").optional(),
  sortOrder: z.number().int().min(0).max(9999).default(0),
})

function collectCodes(error: z.ZodError): string[] {
  return error.issues.map((i) => i.message)
}

function revalidateMembers() {
  revalidatePath("/admin/members")
  revalidatePath("/admin")
}

export async function createMember(formData: FormData): Promise<ActionResult<{ id: number }>> {
  try {
    const { mosque, mosqueId } = await getSessionMosque()
    if (!mosque || mosqueId == null) return { success: false, error: "NO_MOSQUE" }

    const raw = {
      name:      formData.get("name"),
      category:  formData.get("category"),
      role:      formData.get("role") || undefined,
      sortOrder: Number(formData.get("sortOrder") || 0),
    }

    const parsed = MemberSchema.safeParse(raw)
    if (!parsed.success) {
      return { success: false, error: "INVALID_DATA", codes: collectCodes(parsed.error) }
    }

    const [member] = await db
      .insert(mosqueMembers)
      .values({
        mosqueId,
        name:      parsed.data.name,
        category:  parsed.data.category,
        role:      parsed.data.role || null,
        sortOrder: parsed.data.sortOrder,
      })
      .returning({ id: mosqueMembers.id })

    revalidateMembers()
    return { success: true, data: { id: member.id } }
  } catch {
    return { success: false, error: "CREATE_FAILED" }
  }
}

export async function updateMember(id: number, formData: FormData): Promise<ActionResult> {
  try {
    const { mosque, mosqueId } = await getSessionMosque()
    if (!mosque || mosqueId == null) return { success: false, error: "NO_MOSQUE" }

    const raw = {
      name:      formData.get("name"),
      category:  formData.get("category"),
      role:      formData.get("role") || undefined,
      sortOrder: Number(formData.get("sortOrder") || 0),
    }

    const parsed = MemberSchema.safeParse(raw)
    if (!parsed.success) {
      return { success: false, error: "INVALID_DATA", codes: collectCodes(parsed.error) }
    }

    // Sécurité : ne met à jour que si le membre appartient à la mosquée de session.
    const [existing] = await db
      .select({ id: mosqueMembers.id })
      .from(mosqueMembers)
      .where(and(eq(mosqueMembers.id, id), eq(mosqueMembers.mosqueId, mosqueId)))
      .limit(1)

    if (!existing) return { success: false, error: "MEMBER_NOT_FOUND" }

    await db
      .update(mosqueMembers)
      .set({
        name:      parsed.data.name,
        category:  parsed.data.category,
        role:      parsed.data.role || null,
        sortOrder: parsed.data.sortOrder,
      })
      .where(and(eq(mosqueMembers.id, id), eq(mosqueMembers.mosqueId, mosqueId)))

    revalidateMembers()
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "UPDATE_FAILED" }
  }
}

export async function deleteMember(id: number): Promise<ActionResult> {
  const { mosque, mosqueId } = await getSessionMosque()
  if (!mosque || mosqueId == null) return { success: false, error: "NO_MOSQUE" }

  try {
    await db
      .delete(mosqueMembers)
      .where(and(eq(mosqueMembers.id, id), eq(mosqueMembers.mosqueId, mosqueId)))

    revalidateMembers()
    return { success: true, data: undefined }
  } catch {
    return { success: false, error: "DELETE_FAILED" }
  }
}
