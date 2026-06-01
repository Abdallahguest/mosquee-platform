import { describe, it, expect } from "vitest"
import {
  getDailyPrayerTimes,
  suggestPrayerTimes,
  isValidHHMM,
  type MosqueScheduleInput,
} from "@/lib/prayer-times"

// ─────────────────────────────────────────────────────────────
// Tests du mode MANUEL (Approche A).
// La fonction lit les colonnes "HH:MM" de la mosquée ; le calcul MWL
// n'est plus qu'une suggestion (testée séparément via suggestPrayerTimes).
// On injecte `now` pour rendre les tests déterministes (pas de dépendance
// à l'heure réelle d'exécution).
// ─────────────────────────────────────────────────────────────

const TZ = "Africa/Conakry" // UTC+0, sans changement d'heure

// Mosquée de référence : horaires réels relevés sur le panneau (Conakry).
function makeMosque(overrides: Partial<MosqueScheduleInput> = {}): MosqueScheduleInput {
  return {
    fajrTime:    "05:35",
    dhuhrTime:   "13:35",
    asrTime:     "16:35",
    maghribTime: "19:20",
    ishaTime:    "20:20",
    jumuaTime:   "13:15",
    iqamaFajr:    20,
    iqamaDhuhr:   10,
    iqamaAsr:     10,
    iqamaMaghrib: 5,
    iqamaIsha:    10,
    timezone:     TZ,
    latitude:     9.537,
    longitude:    -13.6773,
    calculationMethod: "MWL",
    ...overrides,
  }
}

// Conakry = UTC+0, donc un ISO "...Z" correspond à l'heure locale affichée.
const at = (iso: string) => new Date(iso)

describe("getDailyPrayerTimes — structure (mode manuel)", () => {
  it("retourne 5 prières un jour de semaine", () => {
    const { prayers } = getDailyPrayerTimes(makeMosque(), at("2026-06-01T10:00:00Z"))
    expect(prayers).toHaveLength(5)
  })

  it("retourne les 5 prières dans le bon ordre (sans Sunrise)", () => {
    const { prayers } = getDailyPrayerTimes(makeMosque(), at("2026-06-01T10:00:00Z"))
    expect(prayers.map((p) => p.name)).toEqual([
      "Fajr", "Dhuhr", "Asr", "Maghrib", "Isha",
    ])
  })

  it("affiche les heures saisies telles quelles (HH:MM)", () => {
    const { prayers } = getDailyPrayerTimes(makeMosque(), at("2026-06-01T10:00:00Z"))
    const byName = Object.fromEntries(prayers.map((p) => [p.name, p.timeString]))
    expect(byName.Fajr).toBe("05:35")
    expect(byName.Dhuhr).toBe("13:35")
    expect(byName.Isha).toBe("20:20")
  })

  it("calcule l'iqama = heure + minutes d'iqama", () => {
    const { prayers } = getDailyPrayerTimes(makeMosque(), at("2026-06-01T10:00:00Z"))
    const fajr = prayers.find((p) => p.name === "Fajr")
    // Fajr 05:35 + 20 min d'iqama → 05:55
    expect(fajr?.iqamaString).toBe("05:55")
  })
})

describe("getDailyPrayerTimes — heures non renseignées (NULL → tiret)", () => {
  it("affiche '—' pour une heure non saisie", () => {
    const m = makeMosque({ asrTime: null })
    const { prayers } = getDailyPrayerTimes(m, at("2026-06-01T10:00:00Z"))
    const asr = prayers.find((p) => p.name === "Asr")
    expect(asr?.timeString).toBe("—")
    expect(asr?.time).toBeNull()
  })

  it("une heure non saisie n'est jamais 'passée' ni 'prochaine'", () => {
    const m = makeMosque({ asrTime: null })
    const { prayers } = getDailyPrayerTimes(m, at("2026-06-01T23:00:00Z"))
    const asr = prayers.find((p) => p.name === "Asr")
    expect(asr?.isPast).toBe(false)
    expect(asr?.isNext).toBe(false)
  })

  it("la prochaine prière ignore les heures NULL", () => {
    // Seuls Fajr et Maghrib saisis. À 10:00, la prochaine doit être Maghrib.
    const m = makeMosque({ dhuhrTime: null, asrTime: null, ishaTime: null })
    const { nextPrayer } = getDailyPrayerTimes(m, at("2026-06-01T10:00:00Z"))
    expect(nextPrayer?.name).toBe("Maghrib")
  })
})

describe("getDailyPrayerTimes — prochaine prière", () => {
  it("au plus une prière marquée isNext", () => {
    const { prayers } = getDailyPrayerTimes(makeMosque(), at("2026-06-01T10:00:00Z"))
    expect(prayers.filter((p) => p.isNext).length).toBeLessThanOrEqual(1)
  })

  it("nextPrayer correspond à la prière marquée isNext (quand elle est aujourd'hui)", () => {
    const { prayers, nextPrayer } = getDailyPrayerTimes(makeMosque(), at("2026-06-01T10:00:00Z"))
    const marked = prayers.find((p) => p.isNext)
    expect(nextPrayer?.name).toBe(marked?.name)
  })

  it("à 04:00 → prochaine = Fajr", () => {
    const { nextPrayer } = getDailyPrayerTimes(makeMosque(), at("2026-06-01T04:00:00Z"))
    expect(nextPrayer?.name).toBe("Fajr")
  })

  it("à 10:00 → prochaine = Dhuhr", () => {
    const { nextPrayer } = getDailyPrayerTimes(makeMosque(), at("2026-06-01T10:00:00Z"))
    expect(nextPrayer?.name).toBe("Dhuhr")
  })

  it("à 19:25 → prochaine = Isha", () => {
    const { nextPrayer } = getDailyPrayerTimes(makeMosque(), at("2026-06-01T19:25:00Z"))
    expect(nextPrayer?.name).toBe("Isha")
  })

  it("la prochaine prière n'est jamais dans le passé", () => {
    const now = at("2026-06-01T10:00:00Z")
    const { nextPrayer } = getDailyPrayerTimes(makeMosque(), now)
    expect(nextPrayer?.time).not.toBeNull()
    expect(nextPrayer!.time!.getTime()).toBeGreaterThan(now.getTime())
  })
})

describe("getDailyPrayerTimes — bug historique du countdown (la nuit)", () => {
  // Après Isha, toutes les prières du jour sont passées : l'ancienne logique
  // renvoyait null. La nouvelle doit pointer sur le Fajr de DEMAIN.
  it("à 21:00 (après Isha) → prochaine = Fajr de demain", () => {
    const now = at("2026-06-01T21:00:00Z")
    const { nextPrayer } = getDailyPrayerTimes(makeMosque(), now)
    expect(nextPrayer?.name).toBe("Fajr")
    expect(nextPrayer?.time).not.toBeNull()
    // Le Fajr de demain est dans le futur (demain matin).
    expect(nextPrayer!.time!.getTime()).toBeGreaterThan(now.getTime())
    // Et c'est bien le lendemain (plusieurs heures plus tard).
    const hoursAway = (nextPrayer!.time!.getTime() - now.getTime()) / 3600000
    expect(hoursAway).toBeGreaterThan(6)
  })

  it("à 23:59 → prochaine = Fajr de demain (jamais null)", () => {
    const { nextPrayer } = getDailyPrayerTimes(makeMosque(), at("2026-06-01T23:59:00Z"))
    expect(nextPrayer).not.toBeNull()
    expect(nextPrayer?.name).toBe("Fajr")
  })
})

describe("getDailyPrayerTimes — Jumu'ah (vendredi)", () => {
  // 2026-06-05 est un vendredi.
  it("le vendredi, Jumu'ah est affichée EN PLUS de Dhuhr", () => {
    const { prayers } = getDailyPrayerTimes(makeMosque(), at("2026-06-05T10:00:00Z"))
    const names = prayers.map((p) => p.name)
    expect(names).toContain("Dhuhr")
    expect(names).toContain("Jumua")
    // Jumu'ah insérée juste après Dhuhr.
    expect(names.indexOf("Jumua")).toBe(names.indexOf("Dhuhr") + 1)
  })

  it("un jour de semaine, pas de Jumu'ah", () => {
    const { prayers } = getDailyPrayerTimes(makeMosque(), at("2026-06-01T10:00:00Z"))
    expect(prayers.map((p) => p.name)).not.toContain("Jumua")
  })

  it("le vendredi sans jumuaTime saisi, pas de ligne Jumu'ah", () => {
    const m = makeMosque({ jumuaTime: null })
    const { prayers } = getDailyPrayerTimes(m, at("2026-06-05T10:00:00Z"))
    expect(prayers.map((p) => p.name)).not.toContain("Jumua")
  })
})

describe("getDailyPrayerTimes — fuseau horaire", () => {
  it("retourne le fuseau de la mosquée", () => {
    const { timezone } = getDailyPrayerTimes(makeMosque(), at("2026-06-01T10:00:00Z"))
    expect(timezone).toBe(TZ)
  })

  it("compose correctement l'heure dans le fuseau (round-trip)", () => {
    // À Conakry (UTC+0), Fajr "05:35" doit donner un instant à 05:35 UTC.
    const { prayers } = getDailyPrayerTimes(makeMosque(), at("2026-06-01T00:00:00Z"))
    const fajr = prayers.find((p) => p.name === "Fajr")
    expect(fajr?.time?.toISOString()).toBe("2026-06-01T05:35:00.000Z")
  })
})

describe("isValidHHMM", () => {
  it("accepte les heures valides", () => {
    expect(isValidHHMM("05:35")).toBe(true)
    expect(isValidHHMM("00:00")).toBe(true)
    expect(isValidHHMM("23:59")).toBe(true)
  })
  it("rejette les formats invalides", () => {
    expect(isValidHHMM("24:00")).toBe(false)
    expect(isValidHHMM("5:35")).toBe(false)
    expect(isValidHHMM("05:60")).toBe(false)
    expect(isValidHHMM("")).toBe(false)
    expect(isValidHHMM(null)).toBe(false)
    expect(isValidHHMM(undefined)).toBe(false)
  })
})

describe("suggestPrayerTimes — calcul MWL (aide optionnelle)", () => {
  it("retourne 5 heures au format HH:MM", () => {
    const s = suggestPrayerTimes(9.537, -13.6773, TZ, "MWL")
    const re = /^\d{2}:\d{2}$/
    expect(s.fajrTime).toMatch(re)
    expect(s.dhuhrTime).toMatch(re)
    expect(s.asrTime).toMatch(re)
    expect(s.maghribTime).toMatch(re)
    expect(s.ishaTime).toMatch(re)
  })

  it("accepte toutes les méthodes reconnues sans erreur", () => {
    for (const method of ["MWL", "ISNA", "Egyptian", "UmmAlQura", "Karachi"]) {
      expect(() => suggestPrayerTimes(9.537, -13.6773, TZ, method)).not.toThrow()
    }
  })

  it("méthode inconnue → fallback MWL sans erreur", () => {
    expect(() => suggestPrayerTimes(9.537, -13.6773, TZ, "METHODE_INEXISTANTE")).not.toThrow()
  })

  it("fonctionne pour d'autres villes (Paris, La Mecque)", () => {
    expect(() => suggestPrayerTimes(48.8566, 2.3522, "Europe/Paris", "MWL")).not.toThrow()
    expect(() => suggestPrayerTimes(21.3891, 39.8579, "Asia/Riyadh", "UmmAlQura")).not.toThrow()
  })
})
