export interface Announcement {
  id: number
  title: string
  content: string
  isPublished: boolean
  publishedAt: Date
  expiresAt?: Date | null
}

export function filterActiveAnnouncements(
  announcements: Announcement[],
  now: Date = new Date()
): Announcement[] {
  return announcements.filter(a =>
    a.isPublished &&
    (!a.expiresAt || a.expiresAt > now)
  )
}

export function sortByDate(
  announcements: Announcement[],
  order: "asc" | "desc" = "desc"
): Announcement[] {
  return [...announcements].sort((a, b) => {
    const diff = a.publishedAt.getTime() - b.publishedAt.getTime()
    return order === "desc" ? -diff : diff
  })
}

export function paginateAnnouncements(
  announcements: Announcement[],
  page: number,
  perPage: number
): {
  data: Announcement[]
  total: number
  page: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
} {
  const total      = announcements.length
  const totalPages = Math.ceil(total / perPage)
  const safePage   = Math.max(1, Math.min(page, totalPages || 1))
  const start      = (safePage - 1) * perPage
  const data       = announcements.slice(start, start + perPage)

  return {
    data,
    total,
    page:       safePage,
    totalPages,
    hasNext:    safePage < totalPages,
    hasPrev:    safePage > 1,
  }
}

export function truncateContent(content: string, maxLength: number = 150): string {
  if (content.length <= maxLength) return content
  return content.slice(0, maxLength).trimEnd() + "..."
}

export function isExpired(announcement: Announcement, now: Date = new Date()): boolean {
  return !!announcement.expiresAt && announcement.expiresAt <= now
}
