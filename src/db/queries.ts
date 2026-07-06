import { db } from "./index"
import { mosques, announcements, events, users, mosqueAdmins, mosqueMembers, auditLog, payments } from "./schema"
import { eq, and, gt, lt, desc, isNull, or, asc, count } from "drizzle-orm"
import type { Mosque, Announcement, Event, MosqueMember, Payment } from "./schema"

// ── LIEN ADMIN ↔ MOSQUÉE (via table de liaison) ──
// Retourne les mosquées administrées par un utilisateur (par son ID)
export async function getMosquesByUserId(userId: string): Promise<Mosque[]> {
  try {
    const rows = await db
      .select({ mosque: mosques })
      .from(mosqueAdmins)
      .innerJoin(mosques, eq(mosqueAdmins.mosqueId, mosques.id))
      .where(eq(mosqueAdmins.userId, userId))
      .orderBy(mosques.name)
    return rows.map((r: { mosque: Mosque }) => r.mosque)
  } catch (error) {
    console.error("Erreur récupération mosquées par user:", error)
    return []
  }
}

// Retourne la mosquée principale (la première) d'un utilisateur, ou null
export async function getPrimaryMosqueByUserId(userId: string) {
  const list = await getMosquesByUserId(userId)
  return list[0] ?? null
}

// Vérifie si un utilisateur est admin d'une mosquée donnée.
// Actuellement orpheline (non appelée depuis l'UI) — conservée en prévision
// d'un contrôle d'accès plus fin si la Phase 3 terrain révèle ce besoin.
export async function isUserAdminOfMosque(userId: string, mosqueId: number) {
  try {
    const result = await db
      .select({ id: mosqueAdmins.id })
      .from(mosqueAdmins)
      .where(and(eq(mosqueAdmins.userId, userId), eq(mosqueAdmins.mosqueId, mosqueId)))
      .limit(1)
    return result.length > 0
  } catch (error) {
    console.error("Erreur vérification admin mosquée:", error)
    return false
  }
}

// ── SUPER-ADMIN ──

export async function getAllMosquesAdmin() {
  try {
    return await db.select().from(mosques).orderBy(mosques.name)
  } catch (error) {
    console.error("Erreur récupération mosquées (super-admin):", error)
    return []
  }
}

export async function getAllUsers() {
  try {
    return await db
      .select({
        id:            users.id,
        name:          users.name,
        email:         users.email,
        emailVerified: users.emailVerified,
        role:          users.role,
        createdAt:     users.createdAt,
      })
      .from(users)
      .orderBy(users.createdAt)
  } catch (error) {
    console.error("Erreur récupération utilisateurs:", error)
    return []
  }
}

export async function getSuperAdminStats() {
  try {
    const [
      mosqueCount,
      verifiedMosques,
      userCount,
      verifiedUsers,
      announcementCount,
      eventCount,
    ] = await Promise.all([
      db.select({ v: count() }).from(mosques),
      db.select({ v: count() }).from(mosques).where(eq(mosques.isVerified, true)),
      db.select({ v: count() }).from(users),
      db.select({ v: count() }).from(users).where(eq(users.emailVerified, true)),
      db.select({ v: count() }).from(announcements),
      db.select({ v: count() }).from(events),
    ])

    return {
      mosques:        mosqueCount[0]?.v ?? 0,
      mosquesVerified: verifiedMosques[0]?.v ?? 0,
      users:          userCount[0]?.v ?? 0,
      usersVerified:  verifiedUsers[0]?.v ?? 0,
      announcements:  announcementCount[0]?.v ?? 0,
      events:         eventCount[0]?.v ?? 0,
    }
  } catch (error) {
    console.error("Erreur stats super-admin:", error)
    return { mosques: 0, mosquesVerified: 0, users: 0, usersVerified: 0, announcements: 0, events: 0 }
  }
}

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

// Compte ce qui sera supprimé en cascade si la mosquée est effacée.
// Utilisé pour afficher le décompte exact dans la confirmation de
// suppression (anti-jahàla : le super-admin doit savoir ce qu'il efface).
export async function getMosqueDeletionStats(mosqueId: number) {
  try {
    const [[a], [e], [m], [ad]] = await Promise.all([
      db.select({ n: count() }).from(announcements).where(eq(announcements.mosqueId, mosqueId)),
      db.select({ n: count() }).from(events).where(eq(events.mosqueId, mosqueId)),
      db.select({ n: count() }).from(mosqueMembers).where(eq(mosqueMembers.mosqueId, mosqueId)),
      db.select({ n: count() }).from(mosqueAdmins).where(eq(mosqueAdmins.mosqueId, mosqueId)),
    ])
    return {
      announcements: a?.n ?? 0,
      events:        e?.n ?? 0,
      members:       m?.n ?? 0,
      admins:        ad?.n ?? 0,
    }
  } catch (error) {
    console.error("Erreur récupération stats de suppression mosquée:", error)
    return { announcements: 0, events: 0, members: 0, admins: 0 }
  }
}

// ── ANNONCES ──

// Épinglées d'abord (desc isPinned : true avant false), puis par date de publication.
export async function getActiveAnnouncements(mosqueId: number): Promise<Announcement[]> {
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
    .orderBy(desc(announcements.isPinned), desc(announcements.publishedAt))
    .limit(5)
}

// Version sans limite pour le dashboard (compte uniquement, pas d'affichage)
export async function getAnnouncementsCount(mosqueId: number): Promise<{ total: number; published: number }> {
  try {
    const [all, pub] = await Promise.all([
      db.select({ v: count() }).from(announcements).where(eq(announcements.mosqueId, mosqueId)),
      db.select({ v: count() }).from(announcements).where(and(eq(announcements.mosqueId, mosqueId), eq(announcements.isPublished, true))),
    ])
    return { total: all[0]?.v ?? 0, published: pub[0]?.v ?? 0 }
  } catch { return { total: 0, published: 0 } }
}

export async function getEventsCount(mosqueId: number): Promise<{ total: number; upcoming: number }> {
  const now = new Date()
  try {
    const [all, upcoming] = await Promise.all([
      db.select({ v: count() }).from(events).where(eq(events.mosqueId, mosqueId)),
      db.select({ v: count() }).from(events).where(and(eq(events.mosqueId, mosqueId), eq(events.isPublished, true), gt(events.startAt, now))),
    ])
    return { total: all[0]?.v ?? 0, upcoming: upcoming[0]?.v ?? 0 }
  } catch { return { total: 0, upcoming: 0 } }
}

export async function getAllAnnouncements(mosqueId: number) {
  return db
    .select()
    .from(announcements)
    .where(eq(announcements.mosqueId, mosqueId))
    .orderBy(desc(announcements.isPinned), desc(announcements.publishedAt))
}

// Version paginée pour les listes admin (toutes annonces, pas seulement publiées)
export async function getAllAnnouncementsPaginated(
  mosqueId: number,
  page: number = 1,
  perPage: number = 20
): Promise<PaginatedResult<Announcement>> {
  const offset = (Math.max(1, page) - 1) * perPage
  const whereClause = eq(announcements.mosqueId, mosqueId)
  try {
    const [items, totalRows] = await Promise.all([
      db
        .select()
        .from(announcements)
        .where(whereClause)
        .orderBy(desc(announcements.isPinned), desc(announcements.publishedAt))
        .limit(perPage)
        .offset(offset),
      db.select({ v: count() }).from(announcements).where(whereClause),
    ])
    return { items, total: totalRows[0]?.v ?? 0 }
  } catch (error) {
    console.error("Erreur annonces admin paginées:", error)
    return { items: [], total: 0 }
  }
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

export async function getUpcomingEvents(mosqueId: number): Promise<Event[]> {
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

// Version paginée pour les listes admin
export async function getAllEventsPaginated(
  mosqueId: number,
  page: number = 1,
  perPage: number = 20
): Promise<PaginatedResult<Event>> {
  const offset = (Math.max(1, page) - 1) * perPage
  const whereClause = eq(events.mosqueId, mosqueId)
  try {
    const [items, totalRows] = await Promise.all([
      db
        .select()
        .from(events)
        .where(whereClause)
        .orderBy(desc(events.startAt))
        .limit(perPage)
        .offset(offset),
      db.select({ v: count() }).from(events).where(whereClause),
    ])
    return { items, total: totalRows[0]?.v ?? 0 }
  } catch (error) {
    console.error("Erreur événements admin paginés:", error)
    return { items: [], total: 0 }
  }
}

export async function getEventById(id: number, mosqueId: number) {
  const result = await db
    .select()
    .from(events)
    .where(and(eq(events.id, id), eq(events.mosqueId, mosqueId)))
    .limit(1)
  return result[0] ?? null
}

// Liste les admins liés à une mosquée (avec leurs infos)
export async function getMosqueAdmins(mosqueId: number) {
  try {
    const rows = await db
      .select({
        linkId: mosqueAdmins.id,
        userId: users.id,
        name:   users.name,
        email:  users.email,
        role:   users.role,
      })
      .from(mosqueAdmins)
      .innerJoin(users, eq(mosqueAdmins.userId, users.id))
      .where(eq(mosqueAdmins.mosqueId, mosqueId))
      .orderBy(users.name)
    return rows
  } catch (error) {
    console.error("Erreur récupération admins de la mosquée:", error)
    return []
  }
}

// Liste les comptes NON encore liés à cette mosquée (candidats à assigner)
export async function getUsersNotAdminOfMosque(mosqueId: number) {
  try {
    const linked = await db
      .select({ userId: mosqueAdmins.userId })
      .from(mosqueAdmins)
      .where(eq(mosqueAdmins.mosqueId, mosqueId))

    const linkedIds = linked.map((l: { userId: string }) => l.userId)

    const allUsers = await db
      .select({ id: users.id, name: users.name, email: users.email, role: users.role })
      .from(users)
      .orderBy(users.name)

    // Exclure ceux déjà liés
    return allUsers.filter((u: { id: string }) => !linkedIds.includes(u.id))
  } catch (error) {
    console.error("Erreur récupération comptes assignables:", error)
    return []
  }
}

// ── REQUÊTES PUBLIQUES (détail) ──
// Distinctes des getXById admin : elles EXIGENT isPublished = true (anti-jahàla :
// jamais exposer un brouillon via une URL devinée). Annonce expirée → null (notFound).

export async function getPublicAnnouncement(id: number, mosqueId: number) {
  const now = new Date()
  const result = await db
    .select()
    .from(announcements)
    .where(
      and(
        eq(announcements.id, id),
        eq(announcements.mosqueId, mosqueId),
        eq(announcements.isPublished, true),
        or(isNull(announcements.expiresAt), gt(announcements.expiresAt, now))
      )
    )
    .limit(1)
  return result[0] ?? null
}

export async function getPublicEvent(id: number, mosqueId: number) {
  const result = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.id, id),
        eq(events.mosqueId, mosqueId),
        eq(events.isPublished, true)
      )
    )
    .limit(1)
  return result[0] ?? null
}


// ── MEMBRES (privé : admin + super-admin uniquement) ──
// Triés par catégorie puis ordre manuel. Pas de requête publique : la liste
// n'est jamais exposée publiquement (consentement des membres requis d'abord).
export async function getMosqueMembers(mosqueId: number): Promise<MosqueMember[]> {
  try {
    return await db
      .select()
      .from(mosqueMembers)
      .where(eq(mosqueMembers.mosqueId, mosqueId))
      .orderBy(asc(mosqueMembers.sortOrder), asc(mosqueMembers.id))
  } catch (error) {
    console.error("Erreur récupération membres:", error)
    return []
  }
}

// Actuellement orpheline (non appelée depuis l'UI) — conservée en prévision
// d'une page de détail membre si la Phase 3 terrain révèle ce besoin.
export async function getMemberById(id: number, mosqueId: number): Promise<MosqueMember | null> {
  const result = await db
    .select()
    .from(mosqueMembers)
    .where(and(eq(mosqueMembers.id, id), eq(mosqueMembers.mosqueId, mosqueId)))
    .limit(1)
  return result[0] ?? null
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
}

// ── ANNONCES actives, paginées (mêmes règles que getActiveAnnouncements) ──
export async function getActiveAnnouncementsPaginated(
  mosqueId: number,
  page: number = 1,
  perPage: number = 5
): Promise<PaginatedResult<Announcement>> {
  const now = new Date()
  const offset = (Math.max(1, page) - 1) * perPage

  const whereClause = and(
    eq(announcements.mosqueId, mosqueId),
    eq(announcements.isPublished, true),
    or(isNull(announcements.expiresAt), gt(announcements.expiresAt, now))
  )

  try {
    const [items, totalRows] = await Promise.all([
      db
        .select()
        .from(announcements)
        .where(whereClause)
        .orderBy(desc(announcements.isPinned), desc(announcements.publishedAt))
        .limit(perPage)
        .offset(offset),
      db.select({ v: count() }).from(announcements).where(whereClause),
    ])
    return { items, total: totalRows[0]?.v ?? 0 }
  } catch (error) {
    console.error("Erreur annonces paginées:", error)
    return { items: [], total: 0 }
  }
}

// ── ÉVÉNEMENTS à venir, paginés ──
export async function getUpcomingEventsPaginated(
  mosqueId: number,
  page: number = 1,
  perPage: number = 5
): Promise<PaginatedResult<Event>> {
  const now = new Date()
  const offset = (Math.max(1, page) - 1) * perPage

  const whereClause = and(
    eq(events.mosqueId, mosqueId),
    eq(events.isPublished, true),
    gt(events.startAt, now)
  )

  try {
    const [items, totalRows] = await Promise.all([
      db
        .select()
        .from(events)
        .where(whereClause)
        .orderBy(asc(events.startAt))   // à venir : le plus proche d'abord
        .limit(perPage)
        .offset(offset),
      db.select({ v: count() }).from(events).where(whereClause),
    ])
    return { items, total: totalRows[0]?.v ?? 0 }
  } catch (error) {
    console.error("Erreur événements à venir paginés:", error)
    return { items: [], total: 0 }
  }
}

// ── ÉVÉNEMENTS passés, paginés (archive) ──
export async function getPastEventsPaginated(
  mosqueId: number,
  page: number = 1,
  perPage: number = 5
): Promise<PaginatedResult<Event>> {
  const now = new Date()
  const offset = (Math.max(1, page) - 1) * perPage

  const whereClause = and(
    eq(events.mosqueId, mosqueId),
    eq(events.isPublished, true),
    lt(events.startAt, now)
  )

  try {
    const [items, totalRows] = await Promise.all([
      db
        .select()
        .from(events)
        .where(whereClause)
        .orderBy(desc(events.startAt))  // passés : le plus récent d'abord
        .limit(perPage)
        .offset(offset),
      db.select({ v: count() }).from(events).where(whereClause),
    ])
    return { items, total: totalRows[0]?.v ?? 0 }
  } catch (error) {
    console.error("Erreur événements passés paginés:", error)
    return { items: [], total: 0 }
  }
}

// ── EXISTE-T-IL DES ÉVÉNEMENTS PASSÉS ? (requête ultra-légère, LIMIT 1) ──
// Sert à l'accueil pour décider d'afficher le lien vers l'archive même quand
// il n'y a aucun événement à venir. On ne compte pas : on s'arrête au premier.
export async function hasPastEvents(mosqueId: number): Promise<boolean> {
  const now = new Date()
  try {
    const rows = await db
      .select({ id: events.id })
      .from(events)
      .where(
        and(
          eq(events.mosqueId, mosqueId),
          eq(events.isPublished, true),
          lt(events.startAt, now)
        )
      )
      .limit(1)
    return rows.length > 0
  } catch (error) {
    console.error("Erreur hasPastEvents:", error)
    return false
  }
}

// ── JOURNAL D'ACTIVITÉ (audit_log) ──
// Retourne les N dernières actions pour une mosquée donnée.
// Utilisé par la page /admin/activity.
export interface AuditLogEntry {
  id: number
  action: string
  details: string | null
  targetId: string | null
  createdAt: Date
  userName: string | null
  userEmail: string | null
}

export async function getRecentAuditLog(
  mosqueId: number,
  limit: number = 50
): Promise<AuditLogEntry[]> {
  try {
    const rows = await db
      .select({
        id:        auditLog.id,
        action:    auditLog.action,
        details:   auditLog.details,
        targetId:  auditLog.targetId,
        createdAt: auditLog.createdAt,
        userName:  users.name,
        userEmail: users.email,
      })
      .from(auditLog)
      .leftJoin(users, eq(auditLog.userId, users.id))
      .where(eq(auditLog.mosqueId, mosqueId))
      .orderBy(desc(auditLog.createdAt))
      .limit(limit)
    return rows
  } catch (error) {
    console.error("Erreur récupération journal d'activité:", error)
    return []
  }
}

// ── PAIEMENTS ──

export async function getPaymentsByMosque(mosqueId: number): Promise<Payment[]> {
  try {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.mosqueId, mosqueId))
      .orderBy(desc(payments.createdAt))
  } catch (error) {
    console.error("Erreur récupération paiements:", error)
    return []
  }
}

export async function getRecentPayments(limit: number = 20): Promise<(Payment & { mosqueName: string })[]> {
  try {
    const rows = await db
      .select({
        id:            payments.id,
        mosqueId:      payments.mosqueId,
        recordedBy:    payments.recordedBy,
        amountGNF:     payments.amountGNF,
        months:        payments.months,
        paymentMethod: payments.paymentMethod,
        periodStart:   payments.periodStart,
        periodEnd:     payments.periodEnd,
        note:          payments.note,
        createdAt:     payments.createdAt,
        mosqueName:    mosques.name,
      })
      .from(payments)
      .innerJoin(mosques, eq(payments.mosqueId, mosques.id))
      .orderBy(desc(payments.createdAt))
      .limit(limit)
    return rows
  } catch (error) {
    console.error("Erreur récupération paiements récents:", error)
    return []
  }
}

// ── DERNIÈRE MISE À JOUR HORAIRES (via audit_log) ──
// Retourne la date de la dernière action prayer_times.update pour une mosquée.
// null = jamais mis à jour ou pas de trace.
export async function getLastPrayerTimesUpdate(mosqueId: number): Promise<Date | null> {
  try {
    const [row] = await db
      .select({ createdAt: auditLog.createdAt })
      .from(auditLog)
      .where(
        and(
          eq(auditLog.mosqueId, mosqueId),
          eq(auditLog.action, "prayer_times.update")
        )
      )
      .orderBy(desc(auditLog.createdAt))
      .limit(1)
    return row?.createdAt ?? null
  } catch {
    return null
  }
}

// ── JOURNAL D'ACTIVITÉ GLOBAL (super-admin) ──
// Toutes les actions de toutes les mosquées, avec nom de la mosquée et de l'auteur.
export interface GlobalAuditEntry {
  id:         number
  action:     string
  details:    string | null
  targetId:   string | null
  createdAt:  Date
  userName:   string | null
  userEmail:  string | null
  mosqueName: string | null
}

export async function getGlobalAuditLog(
  limit: number = 100
): Promise<GlobalAuditEntry[]> {
  try {
    const rows = await db
      .select({
        id:         auditLog.id,
        action:     auditLog.action,
        details:    auditLog.details,
        targetId:   auditLog.targetId,
        createdAt:  auditLog.createdAt,
        userName:   users.name,
        userEmail:  users.email,
        mosqueName: mosques.name,
      })
      .from(auditLog)
      .leftJoin(users,   eq(auditLog.userId,   users.id))
      .leftJoin(mosques, eq(auditLog.mosqueId, mosques.id))
      .orderBy(desc(auditLog.createdAt))
      .limit(limit)
    return rows
  } catch (error) {
    console.error("Erreur journal global:", error)
    return []
  }
}
