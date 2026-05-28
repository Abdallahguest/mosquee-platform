"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { db } from "@/db/index"
import { mosques, announcements, events } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function exportMosqueData(mosqueId: number): Promise <
  | { success: true; data: string }
  | { success: false; error: string }
> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

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
