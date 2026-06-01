// ─────────────────────────────────────────────────────────────
// prayer-times.ts — Mode MANUEL, modèle ADHAN + IQAMA (Approche A finale)
//
// Pour chaque prière, la mosquée saisit deux heures "HH:MM" :
//   - iqama  : heure de PRÉSENCE OBLIGATOIRE (début du rang ; pour Jumu'ah,
//              début de la khutba). C'est l'heure PRINCIPALE, affichée en grand,
//              qui pilote le compte à rebours et la "prochaine prière".
//   - adhan  : heure d'annonce, OPTIONNELLE, affichée en secondaire (révélée
//              au tap/survol). null = non renseignée.
//
// Le calcul MWL (adhan) ne sert QUE de suggestion d'ADHAN dans le formulaire
// admin, via suggestPrayerTimes(). Il n'est JAMAIS la source affichée, et ne
// touche jamais l'iqama (décision humaine de la mosquée).
// ─────────────────────────────────────────────────────────────

import {
  Coordinates,
  CalculationMethod,
  PrayerTimes,
  Madhab,
  CalculationParameters,
} from "adhan"

// Les 5 prières obligatoires.
export type PrayerName = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha"

// Jumu'ah s'ajoute le vendredi, après Dhuhr (sans le remplacer).
export type ScheduleSlotName = PrayerName | "Jumua"

export interface PrayerTime {
  name: ScheduleSlotName
  displayName: string
  // Heure principale = IQAMA (présence obligatoire).
  iqamaTime: Date | null       // null = non renseignée (affiche "—")
  iqamaString: string          // "13:35" ou "—" — affiché en grand
  // Adhan, optionnel, affiché en secondaire (révélé au tap/survol).
  adhanString?: string         // "13:20" si renseigné, sinon absent
  isNext: boolean
  isPast: boolean
}

export interface DailyPrayerTimes {
  prayers: PrayerTime[]
  nextPrayer: PrayerTime | null
  date: Date
  timezone: string
}

// Données attendues de la mosquée. Compatible avec le type Mosque de Drizzle :
// tous les champs *Adhan / *Iqama sont des string | null.
export interface MosqueScheduleInput {
  fajrAdhan:    string | null
  fajrIqama:    string | null
  dhuhrAdhan:   string | null
  dhuhrIqama:   string | null
  asrAdhan:     string | null
  asrIqama:     string | null
  maghribAdhan: string | null
  maghribIqama: string | null
  ishaAdhan:    string | null
  ishaIqama:    string | null
  jumuaAdhan:   string | null
  jumuaIqama:   string | null
  timezone: string
  // Pour la SUGGESTION d'adhan uniquement :
  latitude:  number
  longitude: number
  calculationMethod: string
}

const PRAYER_DISPLAY_NAMES: Record<ScheduleSlotName, string> = {
  Fajr:    "Fajr",
  Dhuhr:   "Dhuhr",
  Asr:     "Asr",
  Maghrib: "Maghrib",
  Isha:    "Isha",
  Jumua:   "Jumu'ah",
}

const HHMM_RE = /^([01]\d|2[0-3]):([0-5]\d)$/

export function isValidHHMM(value: string | null | undefined): value is string {
  return typeof value === "string" && HHMM_RE.test(value)
}

// ── Composition "HH:MM" → Date absolue dans le fuseau de la mosquée ──
// Conakry = UTC+0 sans DST (cas trivial), mais on gère le fuseau cible
// proprement pour rester correct si une mosquée hors-Guinée arrive (anti-gharar).
function offsetMinutesForZone(at: Date, timezone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone, hour12: false,
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  })
  const parts = dtf.formatToParts(at)
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? "0")
  let hour = get("hour")
  if (hour === 24) hour = 0
  const asUTC = Date.UTC(get("year"), get("month") - 1, get("day"), hour, get("minute"), get("second"))
  return Math.round((asUTC - at.getTime()) / 60000)
}

function composeDate(
  civilYear: number, civilMonth: number, civilDay: number,
  hhmm: string, timezone: string
): Date {
  const [h, m] = hhmm.split(":").map(Number)
  const guess = new Date(Date.UTC(civilYear, civilMonth - 1, civilDay, h, m, 0))
  const offset = offsetMinutesForZone(guess, timezone)
  return new Date(guess.getTime() - offset * 60000)
}

function civilDateInZone(at: Date, timezone: string) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric", month: "2-digit", day: "2-digit", weekday: "short",
  })
  const parts = dtf.formatToParts(at)
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ""
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: get("weekday"),
  }
}

// ─────────────────────────────────────────────────────────────
// Fonction principale : horaires du jour à partir des données MANUELLES.
// L'IQAMA est l'heure pivot (présence obligatoire).
// ─────────────────────────────────────────────────────────────
export function getDailyPrayerTimes(
  mosque: MosqueScheduleInput,
  now: Date = new Date()
): DailyPrayerTimes {
  const tz = mosque.timezone
  const todayCivil = civilDateInZone(now, tz)
  const isFriday = todayCivil.weekday === "Fri"

  const baseSlots: Array<{ name: PrayerName; adhan: string | null; iqama: string | null }> = [
    { name: "Fajr",    adhan: mosque.fajrAdhan,    iqama: mosque.fajrIqama },
    { name: "Dhuhr",   adhan: mosque.dhuhrAdhan,   iqama: mosque.dhuhrIqama },
    { name: "Asr",     adhan: mosque.asrAdhan,     iqama: mosque.asrIqama },
    { name: "Maghrib", adhan: mosque.maghribAdhan, iqama: mosque.maghribIqama },
    { name: "Isha",    adhan: mosque.ishaAdhan,    iqama: mosque.ishaIqama },
  ]

  function buildSlot(name: ScheduleSlotName, adhan: string | null, iqama: string | null): PrayerTime {
    if (!isValidHHMM(iqama)) {
      // Iqama non renseignée → tiret, jamais "prochaine", jamais "passée".
      return {
        name,
        displayName: PRAYER_DISPLAY_NAMES[name],
        iqamaTime: null,
        iqamaString: "—",
        adhanString: isValidHHMM(adhan) ? adhan : undefined,
        isNext: false,
        isPast: false,
      }
    }
    const iqamaTime = composeDate(todayCivil.year, todayCivil.month, todayCivil.day, iqama, tz)
    return {
      name,
      displayName: PRAYER_DISPLAY_NAMES[name],
      iqamaTime,
      iqamaString: iqama,
      adhanString: isValidHHMM(adhan) ? adhan : undefined,
      isNext: false,
      isPast: iqamaTime.getTime() <= now.getTime(),
    }
  }

  const prayers: PrayerTime[] = baseSlots.map((s) => buildSlot(s.name, s.adhan, s.iqama))

  // Jumu'ah : le vendredi, affichée EN PLUS de Dhuhr, juste après lui.
  // iqama = 2e adhan (début khutba = présence obligatoire) ; adhan = 1er adhan.
  if (isFriday && isValidHHMM(mosque.jumuaIqama)) {
    const jumua = buildSlot("Jumua", mosque.jumuaAdhan, mosque.jumuaIqama)
    const dhuhrIdx = prayers.findIndex((p) => p.name === "Dhuhr")
    if (dhuhrIdx !== -1) prayers.splice(dhuhrIdx + 1, 0, jumua)
    else prayers.push(jumua)
  }

  // ── Prochaine prière (basée sur l'IQAMA) ──
  // Première iqama renseignée encore à venir aujourd'hui. Si toutes passées
  // (le soir après Isha) → Fajr de DEMAIN (corrige le bug du countdown la nuit).
  // Les iqamas non renseignées (iqamaTime === null) sont ignorées.
  let nextPrayer: PrayerTime | null = null
  const upcomingToday = prayers.find((p) => p.iqamaTime !== null && !p.isPast)
  if (upcomingToday) {
    upcomingToday.isNext = true
    nextPrayer = upcomingToday
  } else if (isValidHHMM(mosque.fajrIqama)) {
    const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000)
    const tc = civilDateInZone(tomorrow, tz)
    const fajrTomorrow = composeDate(tc.year, tc.month, tc.day, mosque.fajrIqama, tz)
    nextPrayer = {
      name: "Fajr",
      displayName: PRAYER_DISPLAY_NAMES.Fajr,
      iqamaTime: fajrTomorrow,
      iqamaString: mosque.fajrIqama,
      adhanString: isValidHHMM(mosque.fajrAdhan) ? mosque.fajrAdhan : undefined,
      isNext: true,
      isPast: false,
    }
  }

  return { prayers, nextPrayer, date: now, timezone: tz }
}

function formatHHMM(date: Date, timezone: string): string {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit", minute: "2-digit", timeZone: timezone, hour12: false,
  })
}

// ─────────────────────────────────────────────────────────────
// SUGGESTION d'ADHAN (aide optionnelle dans le formulaire admin).
// Calcule des "HH:MM" MWL pour pré-remplir les champs ADHAN. JAMAIS écrit en
// base automatiquement, JAMAIS l'iqama : l'admin valide et fixe l'iqama lui-même.
// ─────────────────────────────────────────────────────────────
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
