import { describe, it, expect } from "vitest"
import {
  filterActiveAnnouncements,
  sortByDate,
  paginateAnnouncements,
  truncateContent,
  isExpired,
  type Announcement,
} from "@/lib/utils/announcement.utils"

// ── Données de test ──

const now = new Date("2026-06-01T12:00:00Z")

const makeAnnouncement = (overrides: Partial<Announcement> = {}): Announcement => ({
  id:          1,
  title:       "Test",
  content:     "Contenu de test",
  isPublished: true,
  publishedAt: new Date("2026-05-01"),
  expiresAt:   null,
  ...overrides,
})

const announcements: Announcement[] = [
  makeAnnouncement({ id: 1, title: "Publiée active",    isPublished: true,  publishedAt: new Date("2026-05-20") }),
  makeAnnouncement({ id: 2, title: "Brouillon",         isPublished: false, publishedAt: new Date("2026-05-15") }),
  makeAnnouncement({ id: 3, title: "Expirée",           isPublished: true,  publishedAt: new Date("2026-04-01"), expiresAt: new Date("2026-04-30") }),
  makeAnnouncement({ id: 4, title: "Expire dans futur", isPublished: true,  publishedAt: new Date("2026-05-25"), expiresAt: new Date("2026-12-31") }),
]

// ── filterActiveAnnouncements ──

describe("filterActiveAnnouncements", () => {

  it("exclut les brouillons", () => {
    const result = filterActiveAnnouncements(announcements, now)
    const ids = result.map(a => a.id)
    expect(ids).not.toContain(2)
  })

  it("exclut les annonces expirées", () => {
    const result = filterActiveAnnouncements(announcements, now)
    const ids = result.map(a => a.id)
    expect(ids).not.toContain(3)
  })

  it("inclut les annonces publiées sans expiration", () => {
    const result = filterActiveAnnouncements(announcements, now)
    const ids = result.map(a => a.id)
    expect(ids).toContain(1)
  })

  it("inclut les annonces qui expirent dans le futur", () => {
    const result = filterActiveAnnouncements(announcements, now)
    const ids = result.map(a => a.id)
    expect(ids).toContain(4)
  })

  it("retourne 2 annonces actives sur 4", () => {
    const result = filterActiveAnnouncements(announcements, now)
    expect(result).toHaveLength(2)
  })

  it("retourne un tableau vide si aucune active", () => {
    const allDraft = [makeAnnouncement({ isPublished: false })]
    expect(filterActiveAnnouncements(allDraft, now)).toHaveLength(0)
  })
})

// ── sortByDate ──

describe("sortByDate", () => {

  it("tri décroissant par défaut — plus récent en premier", () => {
    const result = sortByDate(announcements)
    expect(result[0].publishedAt.getTime()).toBeGreaterThan(
      result[result.length - 1].publishedAt.getTime()
    )
  })

  it("tri croissant — plus ancien en premier", () => {
    const result = sortByDate(announcements, "asc")
    expect(result[0].publishedAt.getTime()).toBeLessThan(
      result[result.length - 1].publishedAt.getTime()
    )
  })

  it("ne mute pas le tableau original", () => {
    const original = [...announcements]
    sortByDate(announcements, "asc")
    expect(announcements[0].id).toBe(original[0].id)
  })
})

// ── paginateAnnouncements ──

describe("paginateAnnouncements", () => {

  const items = Array.from({ length: 10 }, (_, i) =>
    makeAnnouncement({ id: i + 1, title: `Annonce ${i + 1}` })
  )

  it("retourne le bon nombre d'éléments par page", () => {
    const { data } = paginateAnnouncements(items, 1, 3)
    expect(data).toHaveLength(3)
  })

  it("calcule correctement le nombre total de pages", () => {
    const { totalPages } = paginateAnnouncements(items, 1, 3)
    expect(totalPages).toBe(4) // 10 items / 3 par page = 4 pages
  })

  it("retourne les bons éléments pour la page 2", () => {
    const { data } = paginateAnnouncements(items, 2, 3)
    expect(data[0].id).toBe(4) // items 4, 5, 6
    expect(data).toHaveLength(3)
  })

  it("dernière page peut avoir moins d'éléments", () => {
    const { data } = paginateAnnouncements(items, 4, 3)
    expect(data).toHaveLength(1) // 10 % 3 = 1
  })

  it("hasNext est false sur la dernière page", () => {
    const { hasNext } = paginateAnnouncements(items, 4, 3)
    expect(hasNext).toBe(false)
  })

  it("hasPrev est false sur la première page", () => {
    const { hasPrev } = paginateAnnouncements(items, 1, 3)
    expect(hasPrev).toBe(false)
  })

  it("total est correct", () => {
    const { total } = paginateAnnouncements(items, 1, 3)
    expect(total).toBe(10)
  })

  it("page invalide → retourne page 1", () => {
    const { page } = paginateAnnouncements(items, 0, 3)
    expect(page).toBe(1)
  })

  it("page > totalPages → retourne dernière page", () => {
    const { page } = paginateAnnouncements(items, 999, 3)
    expect(page).toBe(4)
  })
})

// ── truncateContent ──

describe("truncateContent", () => {

  it("ne tronque pas si le contenu est court", () => {
    const content = "Court texte"
    expect(truncateContent(content)).toBe(content)
  })

  it("tronque avec '...' si trop long", () => {
    const content = "a".repeat(200)
    const result = truncateContent(content, 150)
    expect(result.endsWith("...")).toBe(true)
    expect(result.length).toBeLessThanOrEqual(153)
  })

  it("respecte la longueur max personnalisée", () => {
    const content = "a".repeat(50)
    const result = truncateContent(content, 20)
    expect(result.length).toBeLessThanOrEqual(23)
  })

  it("contenu exactement à la limite → pas de troncature", () => {
    const content = "a".repeat(150)
    expect(truncateContent(content, 150)).toBe(content)
  })
})

// ── isExpired ──

describe("isExpired", () => {

  it("retourne false si pas de date d'expiration", () => {
    const a = makeAnnouncement({ expiresAt: null })
    expect(isExpired(a, now)).toBe(false)
  })

  it("retourne true si expirée", () => {
    const a = makeAnnouncement({ expiresAt: new Date("2026-04-01") })
    expect(isExpired(a, now)).toBe(true)
  })

  it("retourne false si expire dans le futur", () => {
    const a = makeAnnouncement({ expiresAt: new Date("2026-12-31") })
    expect(isExpired(a, now)).toBe(false)
  })

  it("retourne true si expiration = maintenant (limite)", () => {
    const a = makeAnnouncement({ expiresAt: now })
    expect(isExpired(a, now)).toBe(true)
  })
})
