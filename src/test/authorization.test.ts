import { describe, it, expect } from "vitest"
import {
  isSuperAdmin,
  canManageMosque,
  canManageResource,
  canSuperAdminActOnUser,
  type AuthUser,
} from "@/lib/authorization"

// ── Données de test ──

const superAdmin: AuthUser = { id: "u-super", role: "super_admin" }
const adminA:     AuthUser = { id: "u-adminA", role: "admin" }
const adminB:     AuthUser = { id: "u-adminB", role: "admin" }
const member:     AuthUser = { id: "u-member", role: "member" }

// adminA gère la mosquée 1 ; adminB gère la mosquée 2
const adminA_mosques = [1]
const adminB_mosques = [2]
const noMosques: number[] = []

// ── isSuperAdmin ──

describe("isSuperAdmin", () => {
  it("reconnaît un super-admin", () => {
    expect(isSuperAdmin(superAdmin)).toBe(true)
  })
  it("refuse un admin normal", () => {
    expect(isSuperAdmin(adminA)).toBe(false)
  })
  it("refuse un member", () => {
    expect(isSuperAdmin(member)).toBe(false)
  })
  it("refuse null/undefined", () => {
    expect(isSuperAdmin(null)).toBe(false)
    expect(isSuperAdmin(undefined)).toBe(false)
  })
})

// ── canManageMosque ── (le test de sécurité central)

describe("canManageMosque", () => {

  it("un admin PEUT gérer SA mosquée", () => {
    expect(canManageMosque(adminA, 1, adminA_mosques)).toBe(true)
  })

  it("CRITIQUE : un admin NE PEUT PAS gérer la mosquée d'un AUTRE", () => {
    // adminA (mosquée 1) tente de gérer la mosquée 2 → DOIT être refusé
    expect(canManageMosque(adminA, 2, adminA_mosques)).toBe(false)
  })

  it("CRITIQUE : un admin NE PEUT PAS gérer une mosquée à laquelle il n'est pas lié", () => {
    expect(canManageMosque(adminB, 1, adminB_mosques)).toBe(false)
  })

  it("un super-admin PEUT gérer N'IMPORTE QUELLE mosquée", () => {
    expect(canManageMosque(superAdmin, 1, noMosques)).toBe(true)
    expect(canManageMosque(superAdmin, 2, noMosques)).toBe(true)
    expect(canManageMosque(superAdmin, 999, noMosques)).toBe(true)
  })

  it("un utilisateur sans mosquée NE PEUT rien gérer", () => {
    expect(canManageMosque(member, 1, noMosques)).toBe(false)
  })

  it("un utilisateur non connecté (null) est refusé", () => {
    expect(canManageMosque(null, 1, [1])).toBe(false)
  })

  it("une cible null est refusée", () => {
    expect(canManageMosque(adminA, null, adminA_mosques)).toBe(false)
    expect(canManageMosque(adminA, undefined, adminA_mosques)).toBe(false)
  })

  it("un admin gérant PLUSIEURS mosquées peut gérer chacune", () => {
    const multiAdmin = [1, 3, 5]
    expect(canManageMosque(adminA, 1, multiAdmin)).toBe(true)
    expect(canManageMosque(adminA, 3, multiAdmin)).toBe(true)
    expect(canManageMosque(adminA, 5, multiAdmin)).toBe(true)
    // mais pas une mosquée hors de sa liste
    expect(canManageMosque(adminA, 2, multiAdmin)).toBe(false)
  })
})

// ── canManageResource ── (annonces, événements)

describe("canManageResource", () => {

  it("un admin PEUT gérer une ressource de SA mosquée", () => {
    // une annonce appartenant à la mosquée 1
    expect(canManageResource(adminA, 1, adminA_mosques)).toBe(true)
  })

  it("CRITIQUE : un admin NE PEUT PAS gérer une ressource d'une AUTRE mosquée", () => {
    // adminA tente de toucher une annonce de la mosquée 2
    expect(canManageResource(adminA, 2, adminA_mosques)).toBe(false)
  })

  it("un super-admin peut gérer toute ressource", () => {
    expect(canManageResource(superAdmin, 2, noMosques)).toBe(true)
  })

  it("un member sans mosquée ne peut gérer aucune ressource", () => {
    expect(canManageResource(member, 1, noMosques)).toBe(false)
  })
})

// ── canSuperAdminActOnUser ── (protection entre super-admins)

describe("canSuperAdminActOnUser", () => {

  const superAdminB: AuthUser = { id: "u-superB", role: "super_admin" }

  it("un super-admin PEUT agir sur un compte normal", () => {
    expect(canSuperAdminActOnUser(superAdmin, adminA)).toBe(true)
    expect(canSuperAdminActOnUser(superAdmin, member)).toBe(true)
  })

  it("un super-admin PEUT agir sur lui-même", () => {
    expect(canSuperAdminActOnUser(superAdmin, superAdmin)).toBe(true)
  })

  it("CRITIQUE : un super-admin NE PEUT PAS agir sur un AUTRE super-admin", () => {
    expect(canSuperAdminActOnUser(superAdmin, superAdminB)).toBe(false)
  })

  it("un non-super-admin ne peut agir sur personne", () => {
    expect(canSuperAdminActOnUser(adminA, member)).toBe(false)
  })

  it("cible null refusée", () => {
    expect(canSuperAdminActOnUser(superAdmin, null)).toBe(false)
  })
})
