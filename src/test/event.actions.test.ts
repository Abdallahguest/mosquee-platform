import { describe, it, expect, beforeEach, vi } from "vitest"
import { createDrizzleMock, type DrizzleMock } from "./helpers/drizzle-mock"

const h = vi.hoisted(() => ({
  dbInsert: vi.fn(), dbSelect: vi.fn(), dbUpdate: vi.fn(), dbDelete: vi.fn(),
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
vi.mock("@/lib/audit", () => ({ logAction: vi.fn(), AUDIT_ACTIONS: new Proxy({}, { get: (_t, k) => k }) }))

import { createEvent, updateEvent, deleteEvent } from "@/lib/actions/event.actions"

function makeForm(fields: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.set(k, v)
  return fd
}

const SESSION_OK = { session: { user: { id: "user-1" } }, mosque: { id: 1, slug: "masdjid-taqwa" }, mosqueId: 1 }
const SESSION_NO_MOSQUE = { session: { user: { id: "user-x" } }, mosque: null, mosqueId: null }

// Dates valides pour les tests
const START = "2026-07-01T18:00"
const END   = "2026-07-01T20:00"
const END_BEFORE = "2026-07-01T17:00"  // avant START → doit être rejeté

let drizzle: DrizzleMock
beforeEach(() => {
  drizzle = createDrizzleMock(vi)
  h.dbInsert.mockImplementation((...a: unknown[]) => (drizzle.db.insert as (...x: unknown[]) => unknown)(...a))
  h.dbSelect.mockImplementation((...a: unknown[]) => (drizzle.db.select as (...x: unknown[]) => unknown)(...a))
  h.dbUpdate.mockImplementation((...a: unknown[]) => (drizzle.db.update as (...x: unknown[]) => unknown)(...a))
  h.dbDelete.mockImplementation((...a: unknown[]) => (drizzle.db.delete as (...x: unknown[]) => unknown)(...a))
  h.getSessionMosque.mockReset()
  h.getSessionMosque.mockResolvedValue(SESSION_OK)
})

describe("createEvent", () => {
  it("crée un événement valide et écrit les bons champs", async () => {
    drizzle.setInsertReturning([{ id: 7 }])
    const result = await createEvent(makeForm({ title: "Conférence", location: "Grande salle", startAt: START, endAt: END, isPublished: "true" }))
    expect(result.success).toBe(true)
    const w = drizzle.captured.inserts[0].values
    expect(w.title).toBe("Conférence")
    expect(w.location).toBe("Grande salle")
    expect(w.mosqueId).toBe(1)
    expect(w.isPublished).toBe(true)
  })

  it("rejette un titre vide (TITLE_REQUIRED)", async () => {
    const result = await createEvent(makeForm({ title: "", location: "Salle", startAt: START }))
    expect(result.success).toBe(false)
    if (!result.success) expect(result.codes).toContain("TITLE_REQUIRED")
    expect(drizzle.captured.inserts).toHaveLength(0)
  })

  it("rejette une date de début manquante (START_REQUIRED)", async () => {
    const result = await createEvent(makeForm({ title: "T", location: "Salle", startAt: "" }))
    expect(result.success).toBe(false)
    if (!result.success) expect(result.codes).toContain("START_REQUIRED")
    expect(drizzle.captured.inserts).toHaveLength(0)
  })

  it("rejette une fin antérieure au début (END_BEFORE_START)", async () => {
    const result = await createEvent(makeForm({ title: "T", location: "Salle", startAt: START, endAt: END_BEFORE }))
    expect(result.success).toBe(false)
    if (!result.success) expect(result.codes).toContain("END_BEFORE_START")
    expect(drizzle.captured.inserts).toHaveLength(0)
  })

  it("refuse si pas de mosquée (NO_MOSQUE)", async () => {
    h.getSessionMosque.mockResolvedValue(SESSION_NO_MOSQUE)
    const result = await createEvent(makeForm({ title: "T", location: "Salle", startAt: START }))
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toBe("NO_MOSQUE")
  })
})

describe("updateEvent", () => {
  it("refuse de modifier un événement d'une autre mosquée", async () => {
    drizzle.setSelectResult([]) // pas trouvé pour cette mosquée
    const result = await updateEvent(999, makeForm({ title: "Pirate", location: "X", startAt: START }))
    expect(result.success).toBe(false)
    expect(drizzle.captured.updates).toHaveLength(0)
  })

  it("met à jour un événement de SA mosquée", async () => {
    drizzle.setSelectResult([{ id: 5 }])
    const result = await updateEvent(5, makeForm({ title: "Modifié", location: "Salle B", startAt: START, endAt: END }))
    expect(result.success).toBe(true)
    expect(drizzle.captured.updates).toHaveLength(1)
    expect(drizzle.captured.updates[0].set.title).toBe("Modifié")
  })
})

describe("deleteEvent", () => {
  it("supprime (scopé à la mosquée)", async () => {
    const result = await deleteEvent(3)
    expect(result.success).toBe(true)
    expect(drizzle.captured.deleteCount).toBe(1)
  })

  it("refuse si pas de mosquée", async () => {
    h.getSessionMosque.mockResolvedValue(SESSION_NO_MOSQUE)
    const result = await deleteEvent(3)
    expect(result.success).toBe(false)
    expect(drizzle.captured.deleteCount).toBe(0)
  })
})
