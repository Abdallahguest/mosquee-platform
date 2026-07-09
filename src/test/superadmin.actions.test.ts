import { describe, it, expect, beforeEach, vi } from "vitest"
import { createDrizzleMock, type DrizzleMock } from "./helpers/drizzle-mock"

const h = vi.hoisted(() => ({
  dbInsert: vi.fn(),
  dbSelect: vi.fn(),
  dbUpdate: vi.fn(),
  dbDelete: vi.fn(),
  requireSuperAdmin: vi.fn(),
  hashPassword: vi.fn(),
  updatePassword: vi.fn(),
}))

vi.mock("@/db/index", () => ({
  db: {
    insert: (...a: unknown[]) => h.dbInsert(...a),
    select: (...a: unknown[]) => h.dbSelect(...a),
    update: (...a: unknown[]) => h.dbUpdate(...a),
    delete: (...a: unknown[]) => h.dbDelete(...a),
  },
}))
vi.mock("@/lib/auth-helpers", () => ({
  requireSuperAdmin: () => h.requireSuperAdmin(),
}))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))
vi.mock("@/lib/audit", () => ({
  logAction: vi.fn(),
  AUDIT_ACTIONS: new Proxy({}, { get: (_t, k) => k }),
}))
vi.mock("better-auth/crypto", () => ({
  hashPassword: (...a: unknown[]) => h.hashPassword(...a),
}))
vi.mock("@/lib/auth", () => ({
  auth: {
    $context: Promise.resolve({
      password: { hash: (pwd: string) => h.hashPassword(pwd) },
      internalAdapter: { updatePassword: (...a: unknown[]) => h.updatePassword(...a) },
    }),
  },
}))

import {
  assignAdminToMosque,
  removeAdminFromMosque,
  createUserAccount,
  setUserVerified,
  createMosque,
  deleteMosque,
  resetUserPassword,
  updateUserAccount,
  deleteUserAccount,
} from "@/lib/actions/superadmin.actions"

function makeForm(fields: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(fields)) fd.set(k, v)
  return fd
}

const SUPER_SESSION = { user: { id: "super-1", role: "super_admin" } }

const VALID_MOSQUE_FORM = {
  slug: "masdjid-nour",
  name: "Masdjid Nour",
  city: "Conakry",
  country: "Guinée",
  latitude: "9.5",
  longitude: "-13.7",
  timezone: "Africa/Conakry",
  isVerified: "false",
}

let drizzle: DrizzleMock

beforeEach(() => {
  drizzle = createDrizzleMock(vi)
  h.dbInsert.mockImplementation((...a: unknown[]) => (drizzle.db.insert as (...x: unknown[]) => unknown)(...a))
  h.dbSelect.mockImplementation((...a: unknown[]) => (drizzle.db.select as (...x: unknown[]) => unknown)(...a))
  h.dbUpdate.mockImplementation((...a: unknown[]) => (drizzle.db.update as (...x: unknown[]) => unknown)(...a))
  h.dbDelete.mockImplementation((...a: unknown[]) => (drizzle.db.delete as (...x: unknown[]) => unknown)(...a))
  h.requireSuperAdmin.mockReset()
  h.requireSuperAdmin.mockResolvedValue(SUPER_SESSION)
  h.hashPassword.mockReset()
  h.hashPassword.mockResolvedValue("hashed-secret")
  h.updatePassword.mockReset()
  h.updatePassword.mockResolvedValue(undefined)
})

// ── Garde super-admin ──

describe("garde requireSuperAdmin", () => {
  it("CRITIQUE : bloque si requireSuperAdmin échoue (non super-admin)", async () => {
    h.requireSuperAdmin.mockRejectedValue(new Error("UNAUTHORIZED"))
    await expect(deleteMosque(1)).rejects.toThrow("UNAUTHORIZED")
    expect(drizzle.captured.deleteCount).toBe(0)
  })
})

// ── deleteUserAccount (P0) ──

describe("deleteUserAccount", () => {
  it("CRITIQUE : refuse la suppression de son propre compte", async () => {
    const result = await deleteUserAccount("super-1")
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toContain("propre compte")
    expect(drizzle.captured.selectCount).toBe(0)
    expect(drizzle.captured.deleteCount).toBe(0)
  })

  it("CRITIQUE : refuse de supprimer un autre super-admin", async () => {
    drizzle.setSelectResult([{ id: "super-2", role: "super_admin" }])
    const result = await deleteUserAccount("super-2")
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toBe("Action non autorisée sur ce compte.")
    expect(drizzle.captured.deleteCount).toBe(0)
  })

  it("CRITIQUE : refuse si le compte administre encore une mosquée", async () => {
    drizzle.setSelectResults([
      [{ id: "admin-2", role: "admin" }],
      [{ mosqueId: 3 }],
    ])
    const result = await deleteUserAccount("admin-2")
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toContain("administre encore")
    expect(drizzle.captured.deleteCount).toBe(0)
  })

  it("supprime un compte admin sans mosquée liée (cascade applicative)", async () => {
    drizzle.setSelectResults([
      [{ id: "admin-2", role: "admin" }],
      [],
    ])
    const result = await deleteUserAccount("admin-2")
    expect(result.success).toBe(true)
    expect(drizzle.captured.deleteCount).toBe(5)
  })

  it("refuse si le compte est introuvable", async () => {
    drizzle.setSelectResult([])
    const result = await deleteUserAccount("ghost")
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toBe("Compte introuvable.")
  })
})

// ── deleteMosque (P0) ──

describe("deleteMosque", () => {
  it("refuse si la mosquée est introuvable", async () => {
    drizzle.setSelectResult([])
    const result = await deleteMosque(99)
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toBe("Mosquée introuvable.")
    expect(drizzle.captured.deleteCount).toBe(0)
  })

  it("supprime une mosquée existante", async () => {
    drizzle.setSelectResult([{ id: 2, name: "Masdjid TAQWA" }])
    const result = await deleteMosque(2)
    expect(result.success).toBe(true)
    expect(drizzle.captured.deleteCount).toBe(1)
  })
})

// ── createUserAccount (P1) ──

describe("createUserAccount", () => {
  it("crée un compte vérifié avec mot de passe hashé", async () => {
    const result = await createUserAccount(makeForm({
      name: "Imam Test",
      email: "imam@test.com",
      password: "password123",
    }))
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.email).toBe("imam@test.com")
    expect(h.hashPassword).toHaveBeenCalledWith("password123")
    expect(drizzle.captured.inserts).toHaveLength(2)
    expect(drizzle.captured.inserts[0].values.emailVerified).toBe(true)
    expect(drizzle.captured.inserts[0].values.role).toBe("admin")
    expect(drizzle.captured.inserts[1].values.password).toBe("hashed-secret")
    expect(drizzle.captured.inserts[1].values.providerId).toBe("credential")
  })

  it("rejette un mot de passe trop court", async () => {
    const result = await createUserAccount(makeForm({
      name: "Test",
      email: "a@test.com",
      password: "short",
    }))
    expect(result.success).toBe(false)
    expect(drizzle.captured.inserts).toHaveLength(0)
  })
})

// ── createMosque (P1) ──

describe("createMosque", () => {
  it("crée une mosquée en période d'essai (trial)", async () => {
    drizzle.setInsertReturning([{ id: 10 }])
    const result = await createMosque(makeForm(VALID_MOSQUE_FORM))
    expect(result.success).toBe(true)
    if (result.success) expect(result.data.id).toBe(10)
    const w = drizzle.captured.inserts[0].values
    expect(w.subscriptionStatus).toBe("trial")
    expect(w.trialEndsAt).toBeInstanceOf(Date)
    expect(w.slug).toBe("masdjid-nour")
  })

  it("rejette un slug invalide", async () => {
    const result = await createMosque(makeForm({ ...VALID_MOSQUE_FORM, slug: "Slug Invalide!" }))
    expect(result.success).toBe(false)
    expect(drizzle.captured.inserts).toHaveLength(0)
  })
})

// ── Protection peer-to-peer super-admin (P0/P1) ──

describe("protection super-admin peer-to-peer", () => {
  it("setUserVerified refuse un autre super-admin", async () => {
    drizzle.setSelectResult([{ id: "super-2", role: "super_admin" }])
    const result = await setUserVerified("super-2", true)
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toBe("Action non autorisée sur ce compte.")
    expect(drizzle.captured.updates).toHaveLength(0)
  })

  it("resetUserPassword refuse un autre super-admin", async () => {
    drizzle.setSelectResult([{ id: "super-2", role: "super_admin" }])
    const result = await resetUserPassword(makeForm({
      userId: "super-2",
      newPassword: "newpass123",
    }))
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toBe("Action non autorisée sur ce compte.")
    expect(h.updatePassword).not.toHaveBeenCalled()
  })

  it("updateUserAccount refuse un autre super-admin", async () => {
    drizzle.setSelectResult([{ id: "super-2", role: "super_admin" }])
    const result = await updateUserAccount(makeForm({
      userId: "super-2",
      name: "Pirate",
      email: "pirate@test.com",
      role: "admin",
    }))
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toBe("Action non autorisée sur ce compte.")
    expect(drizzle.captured.updates).toHaveLength(0)
  })
})

// ── CRUD standard (P2) ──

describe("assignAdminToMosque", () => {
  it("assigne un admin à une mosquée", async () => {
    const result = await assignAdminToMosque(1, "admin-1")
    expect(result.success).toBe(true)
    expect(drizzle.captured.inserts[0].values).toEqual({ mosqueId: 1, userId: "admin-1" })
  })
})

describe("removeAdminFromMosque", () => {
  it("retire un admin d'une mosquée", async () => {
    const result = await removeAdminFromMosque(1, "admin-1")
    expect(result.success).toBe(true)
    expect(drizzle.captured.deleteCount).toBe(1)
  })
})

describe("updateUserAccount", () => {
  it("refuse un email déjà utilisé par un autre compte", async () => {
    drizzle.setSelectResults([
      [{ id: "admin-1", role: "admin" }],
      [{ id: "other-user" }],
    ])
    const result = await updateUserAccount(makeForm({
      userId: "admin-1",
      name: "Admin",
      email: "taken@test.com",
      role: "admin",
    }))
    expect(result.success).toBe(false)
    if (!result.success) expect(result.error).toContain("déjà utilisé")
    expect(drizzle.captured.updates).toHaveLength(0)
  })

  it("met à jour un compte admin autorisé", async () => {
    drizzle.setSelectResults([
      [{ id: "admin-1", role: "admin" }],
      [{ id: "admin-1" }],
    ])
    const result = await updateUserAccount(makeForm({
      userId: "admin-1",
      name: "Nouveau nom",
      email: "admin@test.com",
      role: "member",
    }))
    expect(result.success).toBe(true)
    expect(drizzle.captured.updates[0].set.name).toBe("Nouveau nom")
    expect(drizzle.captured.updates[0].set.role).toBe("member")
  })
})

describe("resetUserPassword", () => {
  it("réinitialise le mot de passe d'un admin", async () => {
    drizzle.setSelectResult([{ id: "admin-1", role: "admin" }])
    const result = await resetUserPassword(makeForm({
      userId: "admin-1",
      newPassword: "newpass123",
    }))
    expect(result.success).toBe(true)
    expect(h.updatePassword).toHaveBeenCalledWith("admin-1", "hashed-secret")
  })
})

describe("setUserVerified", () => {
  it("marque un admin comme vérifié", async () => {
    drizzle.setSelectResult([{ id: "admin-1", role: "admin" }])
    const result = await setUserVerified("admin-1", true)
    expect(result.success).toBe(true)
    expect(drizzle.captured.updates[0].set.emailVerified).toBe(true)
  })
})
