"use server"

import { getSessionMosque } from "@/lib/auth-helpers"
import { db } from "@/db/index"
import { mosques, announcements, events } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function exportMosqueData(mosqueId: number): Promise <
  | { success: true; data: string }
  | { success: false; error: string }
> {
  const { mosqueId: sessionMosqueId } = await getSessionMosque()
  if (sessionMosqueId == null || sessionMosqueId !== mosqueId) {
    return { success: false, error: "Action non autorisée pour cette mosquée." }
  }

  try {
    const [mosque, allAnnouncements, allEvents] = await Promise.all([
      db.select().from(mosques).where(eq(mosques.id, mosqueId)).limit(1),
      db.select().from(announcements).where(eq(announcements.mosqueId, mosqueId)),
      db.select().from(events).where(eq(events.mosqueId, mosqueId)),
    ])

    const exportData = {
      exportedAt: new Date().toISOString(),
      version: "1.0",
      mosque: mosque[0] ?? null,
      announcements: allAnnouncements,
      events: allEvents,
    }

    return {
      success: true,
      data: JSON.stringify(exportData, null, 2),
    }
  } catch {
    return { success: false, error: "Erreur lors de l'export." }
  }
}
