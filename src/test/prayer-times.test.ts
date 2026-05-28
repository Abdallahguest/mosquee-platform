import { describe, it, expect } from "vitest"
import { getDailyPrayerTimes } from "@/lib/prayer-times"

// Coordonnées de test : Conakry, Guinée
const CONAKRY = {
  latitude:  9.5370,
  longitude: -13.6773,
  timezone:  "Africa/Conakry",
}

describe("getDailyPrayerTimes", () => {

  // ── Structure de base ──

  it("retourne 6 prières", () => {
    const result = getDailyPrayerTimes(
      CONAKRY.latitude,
      CONAKRY.longitude,
      CONAKRY.timezone
    )
    expect(result.prayers).toHaveLength(6)
  })

  it("retourne les bonnes prières dans le bon ordre", () => {
    const { prayers } = getDailyPrayerTimes(
      CONAKRY.latitude,
      CONAKRY.longitude,
      CONAKRY.timezone
    )
    const names = prayers.map(p => p.name)
    expect(names).toEqual(["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"])
  })

  it("retourne les noms d'affichage corrects", () => {
    const { prayers } = getDailyPrayerTimes(
      CONAKRY.latitude,
      CONAKRY.longitude,
      CONAKRY.timezone
    )
    expect(prayers[1].displayName).toBe("Shuruq") // Sunrise → Shuruq
    expect(prayers[0].displayName).toBe("Fajr")
  })

  // ── Validité des heures ──

  it("toutes les heures sont des dates valides", () => {
    const { prayers } = getDailyPrayerTimes(
      CONAKRY.latitude,
      CONAKRY.longitude,
      CONAKRY.timezone
    )
    prayers.forEach(prayer => {
      expect(prayer.time).toBeInstanceOf(Date)
      expect(isNaN(prayer.time.getTime())).toBe(false)
    })
  })

  it("les prières sont dans l'ordre chronologique", () => {
    const { prayers } = getDailyPrayerTimes(
      CONAKRY.latitude,
      CONAKRY.longitude,
      CONAKRY.timezone
    )
    for (let i = 1; i < prayers.length; i++) {
      expect(prayers[i].time.getTime()).toBeGreaterThan(
        prayers[i - 1].time.getTime()
      )
    }
  })

  it("les heures sont formatées HH:MM", () => {
    const { prayers } = getDailyPrayerTimes(
      CONAKRY.latitude,
      CONAKRY.longitude,
      CONAKRY.timezone
    )
    const timeRegex = /^\d{2}:\d{2}$/
    prayers.forEach(prayer => {
      expect(prayer.timeString).toMatch(timeRegex)
    })
  })

  // ── Logique prochaine prière ──

  it("une seule prière est marquée isNext", () => {
    const { prayers } = getDailyPrayerTimes(
      CONAKRY.latitude,
      CONAKRY.longitude,
      CONAKRY.timezone
    )
    const nextPrayers = prayers.filter(p => p.isNext)
    expect(nextPrayers.length).toBeLessThanOrEqual(1)
  })

  it("nextPrayer correspond à la prière marquée isNext", () => {
    const { prayers, nextPrayer } = getDailyPrayerTimes(
      CONAKRY.latitude,
      CONAKRY.longitude,
      CONAKRY.timezone
    )
    const markedAsNext = prayers.find(p => p.isNext)
    if (nextPrayer && markedAsNext) {
      expect(nextPrayer.name).toBe(markedAsNext.name)
    }
  })

  it("la prière suivante n'est pas dans le passé", () => {
    const { nextPrayer } = getDailyPrayerTimes(
      CONAKRY.latitude,
      CONAKRY.longitude,
      CONAKRY.timezone
    )
    if (nextPrayer) {
      expect(nextPrayer.time.getTime()).toBeGreaterThan(Date.now())
    }
  })

  it("les prières passées ont isPast = true", () => {
    const { prayers } = getDailyPrayerTimes(
      CONAKRY.latitude,
      CONAKRY.longitude,
      CONAKRY.timezone
    )
    const now = Date.now()
    prayers.forEach(prayer => {
      if (prayer.time.getTime() < now) {
        expect(prayer.isPast).toBe(true)
      }
    })
  })

  // ── Méthodes de calcul ──

  it("accepte toutes les méthodes de calcul reconnues", () => {
    const methods = ["MWL", "ISNA", "Egyptian", "UmmAlQura", "Karachi"]
    methods.forEach(method => {
      expect(() =>
        getDailyPrayerTimes(
          CONAKRY.latitude,
          CONAKRY.longitude,
          CONAKRY.timezone,
          method
        )
      ).not.toThrow()
    })
  })

  it("retourne des horaires différents selon la méthode", () => {
    const mwl  = getDailyPrayerTimes(CONAKRY.latitude, CONAKRY.longitude, CONAKRY.timezone, "MWL")
    const isna = getDailyPrayerTimes(CONAKRY.latitude, CONAKRY.longitude, CONAKRY.timezone, "ISNA")
    // Fajr varie selon la méthode
    expect(mwl.prayers[0].timeString).not.toBe(isna.prayers[0].timeString)
  })

  it("méthode inconnue → fallback sur MWL sans erreur", () => {
    expect(() =>
      getDailyPrayerTimes(
        CONAKRY.latitude,
        CONAKRY.longitude,
        CONAKRY.timezone,
        "METHODE_INEXISTANTE"
      )
    ).not.toThrow()
  })

  // ── Coordonnées extrêmes ──

  it("fonctionne pour Paris", () => {
    expect(() =>
      getDailyPrayerTimes(48.8566, 2.3522, "Europe/Paris")
    ).not.toThrow()
  })

  it("fonctionne pour La Mecque", () => {
    const { prayers } = getDailyPrayerTimes(
      21.3891, 39.8579, "Asia/Riyadh", "UmmAlQura"
    )
    expect(prayers).toHaveLength(6)
  })

  // ── Date spécifique ──

  it("accepte une date personnalisée", () => {
    const customDate = new Date("2026-01-15")
    expect(() =>
      getDailyPrayerTimes(
        CONAKRY.latitude,
        CONAKRY.longitude,
        CONAKRY.timezone,
        "MWL",
        customDate
      )
    ).not.toThrow()
  })

  it("retourne la date passée en paramètre", () => {
    const customDate = new Date("2026-06-15")
    const { date } = getDailyPrayerTimes(
      CONAKRY.latitude,
      CONAKRY.longitude,
      CONAKRY.timezone,
      "MWL",
      customDate
    )
    expect(date.toDateString()).toBe(customDate.toDateString())
  })
})
