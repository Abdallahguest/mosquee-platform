import type { Mock } from "vitest"

// ─────────────────────────────────────────────────────────────────────────────
// Mock Drizzle réutilisable pour tester les Server Actions sans vraie base.
//
// IMPORTANT : ce helper reçoit `vi` en paramètre. Raison : les tests créent le
// mock dans un bloc vi.hoisted() (exécuté avant les imports), où l'on doit
// passer la référence locale de `vi`. Cela garde le helper sans import de
// "vitest" au niveau module, ce qui éviterait des soucis de hoisting.
//
// On capture CE QUI EST DEMANDÉ (valeurs insérées, set d'update, nb de delete)
// et on retourne CE QU'ON LUI DIT (setSelectResult / setInsertReturning), pour
// tester la LOGIQUE des actions : validation, sécurité multi-mosquée, données
// écrites. On ne teste pas le SQL réel (limite assumée de l'approche "mock").
// ─────────────────────────────────────────────────────────────────────────────

// `vi` est typé librement pour ne pas dépendre de l'API interne de vitest.
// On accepte n'importe quelle implémentation (signature large) pour que
// vi.fn() puisse recevoir des callbacks aux signatures précises sans erreur.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ViLike = { fn: (impl?: (...args: any[]) => any) => Mock }

export interface DrizzleMock {
  db: Record<string, unknown>
  captured: {
    inserts: { values: Record<string, unknown> }[]
    updates: { set: Record<string, unknown> }[]
    deleteCount: number
    selectCount: number
  }
  setSelectResult: (rows: unknown[]) => void
  /** Résultats successifs pour les requêtes SELECT multiples dans une même action. */
  setSelectResults: (results: unknown[][]) => void
  setInsertReturning: (rows: unknown[]) => void
  reset: () => void
}

export function createDrizzleMock(vi: ViLike): DrizzleMock {
  let selectResult: unknown[] = []
  let selectQueue: unknown[][] = []
  let insertReturning: unknown[] = [{ id: 1 }]
  const captured = {
    inserts: [] as { values: Record<string, unknown> }[],
    updates: [] as { set: Record<string, unknown> }[],
    deleteCount: 0,
    selectCount: 0,
  }

  const insert = vi.fn(() => ({
    values: vi.fn((v: Record<string, unknown>) => {
      captured.inserts.push({ values: v })
      const chain = {
        returning: vi.fn(() => Promise.resolve(insertReturning)),
        onConflictDoNothing: vi.fn(() => Promise.resolve(undefined)),
        then: (r: (x: unknown) => void) => r(insertReturning),
      }
      return chain
    }),
  }))

  const resolveSelect = () =>
    selectQueue.length > 0 ? selectQueue.shift()! : selectResult

  const makeSelectChain = () => {
    const chain: Record<string, unknown> = {}
    const step = vi.fn(() => chain)
    chain.from = step
    chain.where = step
    chain.orderBy = step
    chain.innerJoin = step
    chain.limit = vi.fn(() => Promise.resolve(resolveSelect()))
    chain.then = (r: (x: unknown) => void) => r(resolveSelect())
    return chain
  }
  const select = vi.fn(() => { captured.selectCount++; return makeSelectChain() })

  const update = vi.fn(() => ({
    set: vi.fn((st: Record<string, unknown>) => {
      captured.updates.push({ set: st })
      return {
        where: vi.fn(() => Promise.resolve(undefined)),
        then: (r: (x: unknown) => void) => r(undefined),
      }
    }),
  }))

  const del = vi.fn(() => ({
    where: vi.fn(() => { captured.deleteCount++; return Promise.resolve(undefined) }),
  }))

  return {
    db: { insert, select, update, delete: del },
    captured,
    setSelectResult: (rows) => { selectResult = rows; selectQueue = [] },
    setSelectResults: (results) => { selectQueue = [...results]; selectResult = [] },
    setInsertReturning: (rows) => { insertReturning = rows },
    reset: () => {
      selectResult = []
      selectQueue = []
      insertReturning = [{ id: 1 }]
      captured.inserts.length = 0
      captured.updates.length = 0
      captured.deleteCount = 0
      captured.selectCount = 0
    },
  }
}
