import { describe, it, expect } from "vitest"
import {
  normalizeOrangeMoneyNumber,
  isValidOrangeMoneyNumber,
  formatOrangeMoneyNumber,
} from "../orange-money"

describe("normalizeOrangeMoneyNumber", () => {
  it("retire tous les espaces", () => {
    expect(normalizeOrangeMoneyNumber("622 12 34 56")).toBe("622123456")
    expect(normalizeOrangeMoneyNumber("6 2 2 1 2 3 4 5 6")).toBe("622123456")
  })
  it("laisse un numéro déjà sans espace inchangé", () => {
    expect(normalizeOrangeMoneyNumber("622123456")).toBe("622123456")
  })
  it("gère une chaîne vide", () => {
    expect(normalizeOrangeMoneyNumber("")).toBe("")
  })
})

describe("isValidOrangeMoneyNumber", () => {
  it("accepte un numéro valide (9 chiffres, commence par 6)", () => {
    expect(isValidOrangeMoneyNumber("622123456")).toBe(true)
  })
  it("accepte un numéro valide avec espaces", () => {
    expect(isValidOrangeMoneyNumber("622 12 34 56")).toBe(true)
  })
  it("accepte une chaîne vide (champ optionnel)", () => {
    expect(isValidOrangeMoneyNumber("")).toBe(true)
  })
  it("rejette un numéro ne commençant pas par 6", () => {
    expect(isValidOrangeMoneyNumber("712345678")).toBe(false)
    expect(isValidOrangeMoneyNumber("512345678")).toBe(false)
  })
  it("rejette un numéro trop court", () => {
    expect(isValidOrangeMoneyNumber("62212345")).toBe(false)
  })
  it("rejette un numéro trop long", () => {
    expect(isValidOrangeMoneyNumber("6221234567")).toBe(false)
  })
  it("rejette des caractères non numériques", () => {
    expect(isValidOrangeMoneyNumber("62212345a")).toBe(false)
    expect(isValidOrangeMoneyNumber("622-123-456")).toBe(false)
  })
})

describe("formatOrangeMoneyNumber", () => {
  it("formate un numéro normalisé en groupes lisibles", () => {
    expect(formatOrangeMoneyNumber("622123456")).toBe("622 12 34 56")
  })
  it("retourne tel quel si la longueur est inattendue (pas de troncature trompeuse)", () => {
    expect(formatOrangeMoneyNumber("12345")).toBe("12345")
    expect(formatOrangeMoneyNumber("")).toBe("")
  })
})
