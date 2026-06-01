// ─────────────────────────────────────────────────────────────
// prayer-times.ts — Façade SERVEUR des horaires.
//
// La logique pure (composition, prochaine prière) vit dans
// prayer-schedule-core.ts (client-safe, réutilisé par PrayerSchedule pour
// l'auto-actualisation). Ce fichier-ci ajoute la SUGGESTION d'adhan (calcul
// MWL via "adhan"), qui ne doit tourner que côté serveur.
// ─────────────────────────────────────────────────────────────

import {
  Coordinates,
  CalculationMethod,
  PrayerTimes,
  Madhab,
  CalculationParameters,
} from "adhan"

import {
  buildDailySchedule,
  type ScheduleInput,
  type DailySchedule,
  type PrayerTime,
  type PrayerName,
  type ScheduleSlotName,
} from "./prayer-schedule-core"

// Réexports pour ne pas casser les imports existants.
export {
  isValidHHMM,
  composeDate,
  civilDateInZone,
  buildDailySchedule,
} from "./prayer-schedule-core"
export type { PrayerTime, PrayerName, ScheduleSlotName, ScheduleInput, DailySchedule }

// Entrée enrichie (coordonnées + méthode) pour le rendu serveur + la suggestion.
export interface MosqueScheduleInput extends ScheduleInput {
  latitude: number
  longitude: number
  calculationMethod: string
}

export interface DailyPrayerTimes {
  prayers: PrayerTime[]
  nextPrayer: PrayerTime | null
  date: Date
  timezone: string
}

// Rendu serveur initial. Le client prendra ensuite le relais (auto-refresh).
export function getDailyPrayerTimes(
  mosque: MosqueScheduleInput,
  now: Date = new Date()
): DailyPrayerTimes {
  const { prayers, nextPrayer, timezone } = buildDailySchedule(mosque, now)
  return { prayers, nextPrayer, date: now, timezone }
}

function formatHHMM(date: Date, timezone: string): string {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit", minute: "2-digit", timeZone: timezone, hour12: false,
  })
}

// ── SUGGESTION d'ADHAN (aide optionnelle admin, serveur uniquement) ──
const CALCULATION_METHODS: Record<string, () => CalculationParameters> = {
  MWL:       () => CalculationMethod.MuslimWorldLeague(),
  ISNA:      () => CalculationMethod.NorthAmerica(),
  Egyptian:  () => CalculationMethod.Egyptian(),
  UmmAlQura: () => CalculationMethod.UmmAlQura(),
  Karachi:   () => CalculationMethod.Karachi(),
}

export interface SuggestedAdhan {
  fajrAdhan: string
  dhuhrAdhan: string
  asrAdhan: string
  maghribAdhan: string
  ishaAdhan: string
}

export function suggestPrayerTimes(
  latitude: number, longitude: number, timezone: string,
  calculationMethod: string = "MWL", date: Date = new Date()
): SuggestedAdhan {
  const coordinates = new Coordinates(latitude, longitude)
  const params = (CALCULATION_METHODS[calculationMethod] ?? CALCULATION_METHODS.MWL)()
  params.madhab = Madhab.Shafi
  const pt = new PrayerTimes(coordinates, date, params)
  return {
    fajrAdhan:    formatHHMM(pt.fajr, timezone),
    dhuhrAdhan:   formatHHMM(pt.dhuhr, timezone),
    asrAdhan:     formatHHMM(pt.asr, timezone),
    maghribAdhan: formatHHMM(pt.maghrib, timezone),
    ishaAdhan:    formatHHMM(pt.isha, timezone),
  }
}
