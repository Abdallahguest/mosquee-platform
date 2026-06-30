import { describe, it, expect } from "vitest"
import { isValidOrangeMoneyNumber, formatOrangeMoneyNumber } from "@/lib/orange-money"

// ── isValidOrangeMoneyNumber ──

describe("isValidOrangeMoneyNumber", () => {

  it("accepte une chaîne vide (champ non rempli)", () => {
    expect(isValidOrangeMoneyNumber("")).toBe(true)
  })

  it("accepte null et undefined (champ optionnel)", () => {
    expect(isValidOrangeMoneyNumber(null)).toBe(true)
    expect(isValidOrangeMoneyNumber(undefined)).toBe(true)
  })

  it("accepte un numéro valide sans espaces", () => {
    expect(isValidOrangeMoneyNumber("620000000")).toBe(true)
    expect(isValidOrangeMoneyNumber("661234567")).toBe(true)
    expect(isValidOrangeMoneyNumber("699999999")).toBe(true)
  })

  it("accepte un numéro valide avec espaces (normalisé)", () => {
    expect(isValidOrangeMoneyNumber("62 00 00 000")).toBe(true)
    expect(isValidOrangeMoneyNumber("6 2 0 0 0 0 0 0 0")).toBe(true)
  })

  it("refuse un numéro commençant par 7 (pas Orange Money)", () => {
    expect(isValidOrangeMoneyNumber("720000000")).toBe(false)
  })

  it("refuse un numéro commençant par 5 (Moov Money)", () => {
    expect(isValidOrangeMoneyNumber("500000000")).toBe(false)
  })

  it("refuse un numéro trop court", () => {
    expect(isValidOrangeMoneyNumber("62000000")).toBe(false)  // 8 chiffres
    expect(isValidOrangeMoneyNumber("6")).toBe(false)
  })

  it("refuse un numéro trop long", () => {
    expect(isValidOrangeMoneyNumber("6200000000")).toBe(false)  // 10 chiffres
  })

  it("refuse des caractères non numériques après normalisation", () => {
    expect(isValidOrangeMoneyNumber("62000X000")).toBe(false)
    expect(isValidOrangeMoneyNumber("abcdefghi")).toBe(false)
  })
})

// ── formatOrangeMoneyNumber ──

describe("formaOrangeMoneyNumber", () => {

  it("formate un numéro valide en groupes lisibles", () => {
    expect(formatOrangeMoneyNumber("620000000")).toBe("62 00 00 000")
    expect(formatOrangeMoneyNumber("661234567")).toBe("66 12 34 567")
  })

  it("formate un numéro saisi avec espaces", () => {
    expect(formatOrangeMoneyNumber("62 00 00 000")).toBe("62 00 00 000")
  })

  it("retourne la valeur brute si le format n'est pas reconnu", () => {
    expect(formatOrangeMoneyNumber("invalid")).toBe("invalid")
    expect(formatOrangeMoneyNumber("720000000")).toBe("720000000")
  })
})
