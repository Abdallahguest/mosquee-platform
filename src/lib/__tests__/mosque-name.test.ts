import { describe, it, expect } from "vitest"
import { getMosqueName } from "../mosque-name"

describe("getMosqueName", () => {
  const m = { name: "Masdjid TAQWA", nameFr: "Mosquée TAQWA", nameEn: "", nameAr: "مسجد التقوى" }

  it("renvoie le nom localisé quand il est rempli", () => {
    expect(getMosqueName(m, "fr")).toBe("Mosquée TAQWA")
    expect(getMosqueName(m, "ar")).toBe("مسجد التقوى")
  })

  it("retombe sur le nom par défaut quand la langue est vide", () => {
    expect(getMosqueName(m, "en")).toBe("Masdjid TAQWA")
  })

  it("retombe sur le nom par défaut pour une langue inconnue", () => {
    expect(getMosqueName(m, "de")).toBe("Masdjid TAQWA")
  })

  it("retombe sur le nom par défaut si aucun nom localisé", () => {
    expect(getMosqueName({ name: "Al-Nour" }, "ar")).toBe("Al-Nour")
  })

  it("ignore un champ rempli uniquement d'espaces", () => {
    expect(getMosqueName({ name: "X", nameFr: "   " }, "fr")).toBe("X")
  })
})
