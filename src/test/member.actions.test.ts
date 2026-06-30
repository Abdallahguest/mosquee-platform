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

import { createMember, updateMember, deleteMember } from "@/lib/actions/member.actions"

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
  h.dbInsert.mockImplementation((...a: unknown[]) => (drizzle.db.insert as (...x: unknown[]) => unknown)(...a))
  h.dbSelect.mockImplementation((...a: unknown[]) => (drizzle.db.select as (...x: unknown[]) => unknown)(...a))
  h.dbUpdate.mockImplementation((...a: unknown[]) => (drizzle.db.update as (...x: unknown[]) => unknown)(...a))
  h.dbDelete.mockImplementation((...a: unknown[]) => (drizzle.db.delete as (...x: unknown[]) => unknown)(...a))
  h.getSessionMosque.mockReset()
  h.getSessionMosque.mockResolvedValue(SESSION_OK)
})

describe("createMember", () => {
  it("crée un membre valide avec rôle libre", async () => {
    drizzle.setInsertReturning([{ id: 11 }])
    const result = await createMember(makeForm({ name: "Cheikh Diallo", category: "imam", role: "Imam principal" }))
    expect(result.success).toBe(true)
    const w = drizzle.captured.inserts[0].values
    expect(w.name).toBe("Cheikh Diallo")
    expect(w.category).toBe("imam")
    expect(w.role).toBe("Imam principal")
    expect(w.mosqueId).toBe(1)
  })

  it("crée un membre sans rôle (rôle optionnel → null)", async () => {
    await createMember(makeForm({ name: "Membre", category: "equipe" }))
    const w = drizzle.captured.inserts[0].values
    expect(w.role).toBeNull()
  })

  it("rejette un nom vide (MEMBER_NAME_REQUIRED)", async () => {
    const result = await createMember(makeForm({ name: "", category: "imam" }))
    expect(result.success).toBe(false)
    if (!result.success) expect(result.codes).toContain("MEMBER_NAME_REQUIRED")
    expect(drizzle.captured.inserts).toHaveLength(0)
  })

  it("rejette une catégorie invalide (MEMBER_CATEGORY_INVALID)", async () => {
    const result = await createMember(makeForm({ name: "X", category: "president" }))
    expect(result.success).toBe(false)
    if (!result.success) expect(result.codes).toContain("MEMBER_CATEGORY_INVALID")
    expect(drizzle.captured.inserts).toHaveLength(0)
  })

  it("accepte les 4 catégories fixes", async () => {
    for (const cat of ["imam", "sage", "conseiller", "equipe"]) {
      drizzle.reset()
      const result = await createMember(makeForm({ name: "Membre", category: cat }))
      expect(result.success).toBe(true)
      expect(drizzle.captured.inserts[0].values.category).toBe(cat)
    }
  })

  it("refuse si pas de mosquée (NO_MOSQUE)", async () => {
    h.getSessionMosque.mockResolvedValue(SESSION_NO_MOSQUE)
    const result = await createMember(makeForm({ name: "X", category: "imam" }))
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toBe("NO_MOSQUE")
  })
})

describe("updateMember", () => {
  it("refuse de modifier un membre d'une autre mosquée (MEMBER_NOT_FOUND)", async () => {
    drizzle.setSelectResult([])
    const result = await updateMember(999, makeForm({ name: "Pirate", category: "imam" }))
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toBe("MEMBER_NOT_FOUND")
    expect(drizzle.captured.updates).toHaveLength(0)
  })

  it("met à jour un membre de SA mosquée", async () => {
    drizzle.setSelectResult([{ id: 3 }])
    const result = await updateMember(3, makeForm({ name: "Corrigé", category: "sage", role: "Doyen" }))
    expect(result.success).toBe(true)
    expect(drizzle.captured.updates[0].set.name).toBe("Corrigé")
    expect(drizzle.captured.updates[0].set.category).toBe("sage")
  })
})

describe("deleteMember", () => {
  it("supprime (scopé à la mosquée)", async () => {
    const result = await deleteMember(4)
    expect(result.success).toBe(true)
    expect(drizzle.captured.deleteCount).toBe(1)
  })
  it("refuse si pas de mosquée", async () => {
    h.getSessionMosque.mockResolvedValue(SESSION_NO_MOSQUE)
    const result = await deleteMember(4)
    expect(result.success).toBe(false)
    expect(drizzle.captured.deleteCount).toBe(0)
  })
})
