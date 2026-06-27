import { describe, it, expect } from "vitest"
import {
  getDailyPrayerTimes,
  suggestPrayerTimes,
  isValidHHMM,
  type MosqueScheduleInput,
} from "@/lib/prayer-times"

const TZ = "Africa/Conakry"

function makeMosque(overrides: Partial<MosqueScheduleInput> = {}): MosqueScheduleInput {
  return {
    fajrAdhan:    "05:20", fajrIqama:    "05:35",
    dhuhrAdhan:   "13:20", dhuhrIqama:   "13:35",
    asrAdhan:     "16:20", asrIqama:     "16:35",
    maghribAdhan: "19:10", maghribIqama: "19:20",
    ishaAdhan:    "20:10", ishaIqama:    "20:20",
    jumuaAdhan:   "13:00", jumuaIqama:   "13:15",
    timezone:     TZ,
    latitude:     9.537,
    longitude:    -13.6773,
    ...overrides,
  }
}

const at = (iso: string) => new Date(iso)

describe("structure (modèle adhan/iqama)", () => {
  it("retourne 6 lignes en semaine (5 prières + Jumu'ah grisée en dernier)", () => {
    const { prayers } = getDailyPrayerTimes(makeMosque(), at("2026-06-01T10:00:00Z"))
    expect(prayers).toHaveLength(6)
    const jumua = prayers.find((p) => p.name === "Jumua")
    expect(jumua?.isInactive).toBe(true)
    expect(prayers[prayers.length - 1].name).toBe("Jumua")
  })

  it("ordre correct en semaine (Jumu'ah en dernier, inactive)", () => {
    const { prayers } = getDailyPrayerTimes(makeMosque(), at("2026-06-01T10:00:00Z"))
    expect(prayers.map((p) => p.name)).toEqual(["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha", "Jumua"])
  })

  it("iqamaString = l'heure d'iqama saisie (heure principale)", () => {
    const { prayers } = getDailyPrayerTimes(makeMosque(), at("2026-06-01T10:00:00Z"))
    const byName = Object.fromEntries(prayers.map((p) => [p.name, p.iqamaString]))
    expect(byName.Fajr).toBe("05:35")
    expect(byName.Dhuhr).toBe("13:35")
    expect(byName.Isha).toBe("20:20")
  })

  it("adhanString présent quand l'adhan est saisi", () => {
    const { prayers } = getDailyPrayerTimes(makeMosque(), at("2026-06-01T10:00:00Z"))
    const dhuhr = prayers.find((p) => p.name === "Dhuhr")
    expect(dhuhr?.adhanString).toBe("13:20")
  })

  it("adhanString absent quand l'adhan n'est pas saisi", () => {
    const m = makeMosque({ dhuhrAdhan: null })
    const { prayers } = getDailyPrayerTimes(m, at("2026-06-01T10:00:00Z"))
    const dhuhr = prayers.find((p) => p.name === "Dhuhr")
    expect(dhuhr?.adhanString).toBeUndefined()
  })
})

describe("iqama non renseignée (NULL → tiret)", () => {
  it("affiche '—' et iqamaTime null", () => {
    const m = makeMosque({ asrIqama: null })
    const { prayers } = getDailyPrayerTimes(m, at("2026-06-01T10:00:00Z"))
    const asr = prayers.find((p) => p.name === "Asr")
    expect(asr?.iqamaString).toBe("—")
    expect(asr?.iqamaTime).toBeNull()
  })

  it("une iqama non saisie n'est jamais passée ni prochaine", () => {
    const m = makeMosque({ asrIqama: null })
    const { prayers } = getDailyPrayerTimes(m, at("2026-06-01T23:00:00Z"))
    const asr = prayers.find((p) => p.name === "Asr")
    expect(asr?.isPast).toBe(false)
    expect(asr?.isNext).toBe(false)
  })

  it("l'adhan peut rester visible même si l'iqama est NULL", () => {
    const m = makeMosque({ asrIqama: null, asrAdhan: "16:20" })
    const { prayers } = getDailyPrayerTimes(m, at("2026-06-01T10:00:00Z"))
    const asr = prayers.find((p) => p.name === "Asr")
    expect(asr?.adhanString).toBe("16:20")
  })

  it("la prochaine prière ignore les iqamas NULL", () => {
    const m = makeMosque({ dhuhrIqama: null, asrIqama: null, ishaIqama: null })
    const { nextPrayer } = getDailyPrayerTimes(m, at("2026-06-01T10:00:00Z"))
    expect(nextPrayer?.name).toBe("Maghrib")
  })
})

describe("prochaine prière (basée sur l'iqama)", () => {
  it("au plus une isNext", () => {
    const { prayers } = getDailyPrayerTimes(makeMosque(), at("2026-06-01T10:00:00Z"))
    expect(prayers.filter((p) => p.isNext).length).toBeLessThanOrEqual(1)
  })

  it("à 04:00 → Fajr", () => {
    const { nextPrayer } = getDailyPrayerTimes(makeMosque(), at("2026-06-01T04:00:00Z"))
    expect(nextPrayer?.name).toBe("Fajr")
  })

  it("à 10:00 → Dhuhr", () => {
    const { nextPrayer } = getDailyPrayerTimes(makeMosque(), at("2026-06-01T10:00:00Z"))
    expect(nextPrayer?.name).toBe("Dhuhr")
  })

  it("à 13:36 (juste après iqama Dhuhr) → Asr", () => {
    const { nextPrayer } = getDailyPrayerTimes(makeMosque(), at("2026-06-01T13:36:00Z"))
    expect(nextPrayer?.name).toBe("Asr")
  })

  it("nextPrayer n'est jamais dans le passé", () => {
    const now = at("2026-06-01T10:00:00Z")
    const { nextPrayer } = getDailyPrayerTimes(makeMosque(), now)
    expect(nextPrayer?.iqamaTime).not.toBeNull()
    expect(nextPrayer!.iqamaTime!.getTime()).toBeGreaterThan(now.getTime())
  })

  it("nextPrayer porte l'adhan en complément", () => {
    const { nextPrayer } = getDailyPrayerTimes(makeMosque(), at("2026-06-01T10:00:00Z"))
    expect(nextPrayer?.name).toBe("Dhuhr")
    expect(nextPrayer?.adhanString).toBe("13:20")
  })
})

describe("bug historique du countdown (la nuit)", () => {
  it("à 21:00 (après Isha) → Fajr de demain", () => {
    const now = at("2026-06-01T21:00:00Z")
    const { nextPrayer } = getDailyPrayerTimes(makeMosque(), now)
    expect(nextPrayer?.name).toBe("Fajr")
    expect(nextPrayer?.iqamaTime).not.toBeNull()
    const hoursAway = (nextPrayer!.iqamaTime!.getTime() - now.getTime()) / 3600000
    expect(hoursAway).toBeGreaterThan(6)
  })

  it("à 23:59 → Fajr de demain (jamais null)", () => {
    const { nextPrayer } = getDailyPrayerTimes(makeMosque(), at("2026-06-01T23:59:00Z"))
    expect(nextPrayer).not.toBeNull()
    expect(nextPrayer?.name).toBe("Fajr")
  })
})

describe("Jumu'ah (vendredi)", () => {
  it("le vendredi, Jumu'ah REMPLACE Dhuhr (Dhuhr disparaît du tableau)", () => {
    const { prayers } = getDailyPrayerTimes(makeMosque(), at("2026-06-05T08:00:00Z"))
    const names = prayers.map((p) => p.name)
    expect(names).not.toContain("Dhuhr")
    expect(names).toContain("Jumua")
    // Jumu'ah occupe la position de Dhuhr (juste après Fajr).
    expect(names).toEqual(["Fajr", "Jumua", "Asr", "Maghrib", "Isha"])
  })

  it("le vendredi, l'heure de Dhuhr est conservée en note discrète sur Jumu'ah", () => {
    const { prayers } = getDailyPrayerTimes(makeMosque(), at("2026-06-05T08:00:00Z"))
    const jumua = prayers.find((p) => p.name === "Jumua")
    expect(jumua?.dhuhrNote).toBe("13:35")
  })

  it("en semaine, Jumu'ah n'a PAS de note Dhuhr", () => {
    const { prayers } = getDailyPrayerTimes(makeMosque(), at("2026-06-01T08:00:00Z"))
    const jumua = prayers.find((p) => p.name === "Jumua")
    expect(jumua?.dhuhrNote).toBeUndefined()
  })

  it("iqama Jumu'ah = 13:15 (début khutba), adhan = 13:00", () => {
    const { prayers } = getDailyPrayerTimes(makeMosque(), at("2026-06-05T08:00:00Z"))
    const jumua = prayers.find((p) => p.name === "Jumua")
    expect(jumua?.iqamaString).toBe("13:15")
    expect(jumua?.adhanString).toBe("13:00")
  })

  it("en semaine, Jumu'ah est présente mais inactive et jamais prochaine", () => {
    const { prayers, nextPrayer } = getDailyPrayerTimes(makeMosque(), at("2026-06-01T08:00:00Z"))
    const jumua = prayers.find((p) => p.name === "Jumua")
    expect(jumua).toBeDefined()
    expect(jumua?.isInactive).toBe(true)
    expect(jumua?.isNext).toBe(false)
    expect(jumua?.isPast).toBe(false)
    expect(nextPrayer?.name).not.toBe("Jumua")
  })

  it("le vendredi sans jumuaIqama → ligne Jumu'ah présente, heure '—'", () => {
    const m = makeMosque({ jumuaIqama: null })
    const { prayers } = getDailyPrayerTimes(m, at("2026-06-05T08:00:00Z"))
    const jumua = prayers.find((p) => p.name === "Jumua")
    expect(jumua).toBeDefined()
    expect(jumua?.iqamaString).toBe("—")
  })

  it("en semaine, Jumu'ah affiche bien son heure d'iqama (grisée mais lisible)", () => {
    const { prayers } = getDailyPrayerTimes(makeMosque(), at("2026-06-01T08:00:00Z"))
    const jumua = prayers.find((p) => p.name === "Jumua")
    expect(jumua?.iqamaString).toBe("13:15")
  })
})

describe("fuseau horaire", () => {
  it("compose l'iqama correctement (round-trip Conakry)", () => {
    const { prayers } = getDailyPrayerTimes(makeMosque(), at("2026-06-01T00:00:00Z"))
    const dhuhr = prayers.find((p) => p.name === "Dhuhr")
    expect(dhuhr?.iqamaTime?.toISOString()).toBe("2026-06-01T13:35:00.000Z")
  })
})

describe("isValidHHMM", () => {
  it("accepte les heures valides", () => {
    expect(isValidHHMM("05:35")).toBe(true)
    expect(isValidHHMM("23:59")).toBe(true)
  })
  it("rejette les invalides", () => {
    expect(isValidHHMM("24:00")).toBe(false)
    expect(isValidHHMM("5:35")).toBe(false)
    expect(isValidHHMM("")).toBe(false)
    expect(isValidHHMM(null)).toBe(false)
  })
})

describe("suggestPrayerTimes (adhan uniquement)", () => {
  it("retourne 5 adhans au format HH:MM", () => {
    const s = suggestPrayerTimes(9.537, -13.6773, TZ, "MWL")
    const re = /^\d{2}:\d{2}$/
    expect(s.fajrAdhan).toMatch(re)
    expect(s.dhuhrAdhan).toMatch(re)
    expect(s.ishaAdhan).toMatch(re)
  })
  it("toutes méthodes sans erreur + fallback", () => {
    for (const m of ["MWL", "ISNA", "Egyptian", "UmmAlQura", "Karachi", "INCONNUE"]) {
      expect(() => suggestPrayerTimes(9.537, -13.6773, TZ, m)).not.toThrow()
    }
  })
})
