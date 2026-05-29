import { db } from "./index"
import { mosques, announcements, events } from "./schema"
import { eq, and, gt, desc, isNull, or, asc } from "drizzle-orm"

// ── MOSQUÉES ──

export async function getAllMosques() {
  try {
    return await db
      .select()
      .from(mosques)
      .orderBy(mosques.name)
  } catch (error) {
    console.error("Erreur récupération mosquées:", error)
    return []  // tableau vide au lieu de planter
  }
}

export async function getMosqueBySlug(slug: string) {
  try {
    const result = await db
      .select()
      .from(mosques)
      .where(eq(mosques.slug, slug))
      .limit(1)
    return result[0] ?? null
  } catch (error) {
    console.error("Erreur récupération mosquée:", error)
    return null
  }
}

export async function getMosqueById(id: number) {
  const result = await db
    .select()
    .from(mosques)
    .where(eq(mosques.id, id))
    .limit(1)
  return result[0] ?? null
}

// ── ANNONCES ──

export async function getActiveAnnouncements(mosqueId: number) {
  const now = new Date()
  return db
    .select()
    .from(announcements)
    .where(
      and(
        eq(announcements.mosqueId, mosqueId),
        eq(announcements.isPublished, true),
        or(
          isNull(announcements.expiresAt),
          gt(announcements.expiresAt, now)
        )
      )
    )
    .orderBy(desc(announcements.publishedAt))
    .limit(5)
}

export async function getAllAnnouncements(mosqueId: number) {
  return db
    .select()
    .from(announcements)
    .where(eq(announcements.mosqueId, mosqueId))
    .orderBy(desc(announcements.publishedAt))
}

export async function getAnnouncementById(id: number, mosqueId: number) {
  const result = await db
    .select()
    .from(announcements)
    .where(and(eq(announcements.id, id), eq(announcements.mosqueId, mosqueId)))
    .limit(1)
  return result[0] ?? null
}

// ── ÉVÉNEMENTS ──

export async function getUpcomingEvents(mosqueId: number) {
  const now = new Date()
  return db
    .select()
    .from(events)
    .where(
      and(
        eq(events.mosqueId, mosqueId),
        eq(events.isPublished, true),
        gt(events.startAt, now)
      )
    )
    .orderBy(asc(events.startAt))
    .limit(5)
}

export async function getAllEvents(mosqueId: number) {
  return db
    .select()
    .from(events)
    .where(eq(events.mosqueId, mosqueId))
    .orderBy(desc(events.startAt))
}

export async function getEventById(id: number, mosqueId: number) {
  const result = await db
    .select()
    .from(events)
    .where(and(eq(events.id, id), eq(events.mosqueId, mosqueId)))
    .limit(1)
  return result[0] ?? null
}
