import { describe, it, expect, beforeEach, vi } from "vitest"
import { createDrizzleMock, type DrizzleMock } from "./helpers/drizzle-mock"

// On hoiste UNIQUEMENT des fonctions proxy (légères). Le vrai mock Drizzle
// est créé dans beforeEach et branché derrière ces proxys. Cela évite le
// piège "variable utilisée avant initialisation" du hoisting de vi.mock.
const h = vi.hoisted(() => ({
  dbInsert: vi.fn(),
  dbSelect: vi.fn(),
  dbUpdate: vi.fn(),
  dbDelete: vi.fn(),
  getSessionMosque: vi.fn(),
}))

vi.mock("@/db/index", () => ({
  db: {
    insert: (...a: unknown[]) => h.dbInsert(...a),
    select: (...a: unknown[]) => h.dbSelect(...a),
    update: (...a: unknown[]) => h.dbUpdate(...a),
    delete: (...a: unknown[]) => h.dbDelete(...a),
  },
}))
vi.mock("@/lib/auth-helpers", () => ({ getSessionMosque: () => h.getSessionMosque() }))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))

import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "@/lib/actions/announcement.actions"

function makeForm(fields: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.set(k, v)
  return fd
}

const SESSION_OK = { session: { user: { id: "user-1" } }, mosque: { id: 1, slug: "masdjid-taqwa" }, mosqueId: 1 }
const SESSION_NO_MOSQUE = { session: { user: { id: "user-x" } }, mosque: null, mosqueId: null }

let drizzle: DrizzleMock

beforeEach(() => {
  drizzle = createDrizzleMock(vi)
  // Brancher les proxys hoistés sur le vrai mock
  h.dbInsert.mockImplementation((...a: unknown[]) => (drizzle.db.insert as (...x: unknown[]) => unknown)(...a))
  h.dbSelect.mockImplementation((...a: unknown[]) => (drizzle.db.select as (...x: unknown[]) => unknown)(...a))
  h.dbUpdate.mockImplementation((...a: unknown[]) => (drizzle.db.update as (...x: unknown[]) => unknown)(...a))
  h.dbDelete.mockImplementation((...a: unknown[]) => (drizzle.db.delete as (...x: unknown[]) => unknown)(...a))
  h.getSessionMosque.mockReset()
  h.getSessionMosque.mockResolvedValue(SESSION_OK)
})

describe("createAnnouncement", () => {
  it("crée une annonce valide et écrit les bons champs", async () => {
    drizzle.setInsertReturning([{ id: 42 }])
    const result = await createAnnouncement(makeForm({ title: "Aïd al-Fitr", content: "Prière à 7h.", isPublished: "true" }))
    expect(result.success).toBe(true)
    if (result.success) expect(result.data).toEqual({ id: 42 })
    expect(drizzle.captured.inserts).toHaveLength(1)
    const w = drizzle.captured.inserts[0].values
    expect(w.title).toBe("Aïd al-Fitr")
    expect(w.mosqueId).toBe(1)
    expect(w.authorId).toBe("user-1")
    expect(w.isPublished).toBe(true)
  })

  it("rejette un titre vide (TITLE_REQUIRED), rien n'est écrit", async () => {
    const result = await createAnnouncement(makeForm({ title: "", content: "Texte." }))
    expect(result.success).toBe(false)
    if (!result.success) { expect(result.error).toBe("INVALID_DATA"); expect(result.codes).toContain("TITLE_REQUIRED") }
    expect(drizzle.captured.inserts).toHaveLength(0)
  })

  it("rejette un contenu vide (CONTENT_REQUIRED)", async () => {
    const result = await createAnnouncement(makeForm({ title: "Titre", content: "" }))
    expect(result.success).toBe(false)
    if (!result.success) expect(result.codes).toContain("CONTENT_REQUIRED")
    expect(drizzle.captured.inserts).toHaveLength(0)
  })

  it("refuse si l'admin n'a pas de mosquée (NO_MOSQUE)", async () => {
    h.getSessionMosque.mockResolvedValue(SESSION_NO_MOSQUE)
    const result = await createAnnouncement(makeForm({ title: "T", content: "C" }))
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toBe("NO_MOSQUE")
    expect(drizzle.captured.inserts).toHaveLength(0)
  })

  it("ne marque pas publishedAt pour un brouillon", async () => {
    await createAnnouncement(makeForm({ title: "Brouillon", content: "Texte", isPublished: "false" }))
    const w = drizzle.captured.inserts[0].values
    expect(w.isPublished).toBe(false)
    expect(w.publishedAt).toBeUndefined()
  })
})

describe("updateAnnouncement", () => {
  it("refuse de modifier une annonce d'une autre mosquée (ANNOUNCEMENT_NOT_FOUND)", async () => {
    drizzle.setSelectResult([]) // contrôle d'appartenance → rien trouvé pour cette mosquée
    const result = await updateAnnouncement(999, makeForm({ title: "Pirate", content: "Tentative" }))
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toBe("ANNOUNCEMENT_NOT_FOUND")
    expect(drizzle.captured.updates).toHaveLength(0)
  })

  it("met à jour une annonce de SA mosquée", async () => {
    drizzle.setSelectResult([{ publishedAt: null }])
    const result = await updateAnnouncement(5, makeForm({ title: "Corrigé", content: "Nouveau", isPublished: "true" }))
    expect(result.success).toBe(true)
    expect(drizzle.captured.updates).toHaveLength(1)
    expect(drizzle.captured.updates[0].set.title).toBe("Corrigé")
  })

  it("rejette les données invalides avant toute écriture", async () => {
    const result = await updateAnnouncement(5, makeForm({ title: "", content: "" }))
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toBe("INVALID_DATA")
    expect(drizzle.captured.updates).toHaveLength(0)
  })
})

describe("deleteAnnouncement", () => {
  it("supprime (scopé à la mosquée de session)", async () => {
    const result = await deleteAnnouncement(7)
    expect(result.success).toBe(true)
    expect(drizzle.captured.deleteCount).toBe(1)
  })

  it("refuse si pas de mosquée", async () => {
    h.getSessionMosque.mockResolvedValue(SESSION_NO_MOSQUE)
    const result = await deleteAnnouncement(7)
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toBe("NO_MOSQUE")
    expect(drizzle.captured.deleteCount).toBe(0)
  })
})
