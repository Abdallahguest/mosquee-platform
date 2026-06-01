// ─────────────────────────────────────────────────────────────
// prayer-times.ts — Mode MANUEL (Approche A)
// Les horaires affichés viennent des colonnes manuelles de la mosquée ("HH:MM").
// Le calcul MWL (adhan) ne sert QUE de suggestion dans le formulaire admin,
// via suggestPrayerTimes() ci-dessous. Il n'est JAMAIS la source affichée.
// ─────────────────────────────────────────────────────────────

import {
  Coordinates,
  CalculationMethod,
  PrayerTimes,
  Madhab,
  CalculationParameters,
} from "adhan"

// Les 5 prières obligatoires. (Sunrise/Shuruq retiré : ce n'est pas une prière,
// il polluait la logique "prochaine prière" dans l'ancienne version.)
export type PrayerName = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha"

// Jumu'ah est traité comme une entrée d'affichage à part (le vendredi),
// pas comme une PrayerName, car il s'ajoute à Dhuhr sans le remplacer.
export type ScheduleSlotName = PrayerName | "Jumua"

export interface PrayerTime {
  name: ScheduleSlotName
  displayName: string
  time: Date | null          // null = heure non renseignée (affiche "—")
  timeString: string         // "05:35" ou "—"
  iqamaTime?: Date
  iqamaString?: string
  isNext: boolean
  isPast: boolean
}

export interface DailyPrayerTimes {
  prayers: PrayerTime[]
  nextPrayer: PrayerTime | null
  date: Date
  timezone: string
}

// Ce que la fonction attend de la mosquée. Compatible avec le type Mosque de Drizzle :
// tous les champs *Time sont des string | null, les iqama* des number.
export interface MosqueScheduleInput {
  fajrTime:    string | null
  dhuhrTime:   string | null
  asrTime:     string | null
  maghribTime: string | null
  ishaTime:    string | null
  jumuaTime:   string | null
  iqamaFajr:    number
  iqamaDhuhr:   number
  iqamaAsr:     number
  iqamaMaghrib: number
  iqamaIsha:    number
  timezone: string
  // Pour la SUGGESTION uniquement :
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

// "HH:MM" valide ? (utilisé aussi côté Zod, mais on revalide ici par sûreté)
export function isValidHHMM(value: string | null | undefined): value is string {
  return typeof value === "string" && HHMM_RE.test(value)
}

// ── Composition "HH:MM" → Date absolue dans le fuseau de la mosquée ──
// Conakry = UTC+0 sans DST, donc le cas courant est trivial. Mais on gère
// le décalage du fuseau cible proprement pour rester correct si une mosquée
// hors-Guinée arrive plus tard (anti-gharar futur).
//
// Principe : on connaît la date "civile" (année/mois/jour) telle qu'observée
// dans le fuseau de la mosquée, et l'heure civile "HH:MM". On cherche l'instant
// UTC tel que, reformaté dans ce fuseau, il redonne exactement cette date+heure.
function offsetMinutesForZone(at: Date, timezone: string): number {
  // Heure "murale" du fuseau exprimée via en-US, comparée à l'UTC du même instant.
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
  const parts = dtf.formatToParts(at)
  const get = (type: string) =>
    Number(parts.find((p) => p.type === type)?.value ?? "0")
  let hour = get("hour")
  if (hour === 24) hour = 0 // certains environnements renvoient 24 pour minuit
  const asUTC = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    hour,
    get("minute"),
    get("second")
  )
  // offset = (heure murale du fuseau) − (heure UTC), en minutes
  return Math.round((asUTC - at.getTime()) / 60000)
}

// Construit la Date absolue pour une heure "HH:MM" un jour civil donné (dans le fuseau).
function composeDate(
  civilYear: number,
  civilMonth: number, // 1-12
  civilDay: number,
  hhmm: string,
  timezone: string
): Date {
  const [h, m] = hhmm.split(":").map(Number)
  // Estimation initiale en supposant que l'heure murale = UTC, puis on corrige
  // par l'offset réel du fuseau à cet instant approximatif.
  const guess = new Date(
    Date.UTC(civilYear, civilMonth - 1, civilDay, h, m, 0)
  )
  const offset = offsetMinutesForZone(guess, timezone)
  // L'instant UTC réel = heure murale − offset.
  return new Date(guess.getTime() - offset * 60000)
}

// Récupère la date civile (année/mois/jour) observée dans le fuseau pour un instant.
function civilDateInZone(at: Date, timezone: string) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  })
  const parts = dtf.formatToParts(at)
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? ""
  return {
    year: Number(get("year")),
    month: Number(get("month")),
    day: Number(get("day")),
    weekday: get("weekday"), // "Mon", "Fri", ...
  }
}

function addMinutes(d: Date, min: number): Date {
  return new Date(d.getTime() + min * 60000)
}

// ─────────────────────────────────────────────────────────────
// Fonction principale : horaires du jour à partir des données MANUELLES.
// ─────────────────────────────────────────────────────────────
export function getDailyPrayerTimes(
  mosque: MosqueScheduleInput,
  now: Date = new Date()
): DailyPrayerTimes {
  const tz = mosque.timezone
  const todayCivil = civilDateInZone(now, tz)
  const isFriday = todayCivil.weekday === "Fri"

  // Table des prières obligatoires (ordre chronologique de la journée).
  const baseSlots: Array<{
    name: PrayerName
    hhmm: string | null
    iqamaMin: number
  }> = [
    { name: "Fajr",    hhmm: mosque.fajrTime,    iqamaMin: mosque.iqamaFajr },
    { name: "Dhuhr",   hhmm: mosque.dhuhrTime,   iqamaMin: mosque.iqamaDhuhr },
    { name: "Asr",     hhmm: mosque.asrTime,     iqamaMin: mosque.iqamaAsr },
    { name: "Maghrib", hhmm: mosque.maghribTime, iqamaMin: mosque.iqamaMaghrib },
    { name: "Isha",    hhmm: mosque.ishaTime,    iqamaMin: mosque.iqamaIsha },
  ]

  const prayers: PrayerTime[] = baseSlots.map((slot) => {
    if (!isValidHHMM(slot.hhmm)) {
      // Heure non renseignée → tiret, jamais "prochaine", jamais "passée".
      return {
        name: slot.name,
        displayName: PRAYER_DISPLAY_NAMES[slot.name],
        time: null,
        timeString: "—",
        isNext: false,
        isPast: false,
      }
    }
    const time = composeDate(
      todayCivil.year,
      todayCivil.month,
      todayCivil.day,
      slot.hhmm,
      tz
    )
    const iqamaTime = slot.iqamaMin > 0 ? addMinutes(time, slot.iqamaMin) : undefined
    return {
      name: slot.name,
      displayName: PRAYER_DISPLAY_NAMES[slot.name],
      time,
      timeString: slot.hhmm,
      iqamaTime,
      iqamaString: iqamaTime ? formatHHMM(iqamaTime, tz) : undefined,
      isNext: false,
      isPast: time.getTime() <= now.getTime(),
    }
  })

  // Jumu'ah : le vendredi uniquement, AFFICHÉE EN PLUS de Dhuhr (anti-jahàla :
  // on reflète le panneau réel des mosquées de Conakry, on ne remplace pas).
  // On l'insère juste après Dhuhr dans l'ordre d'affichage.
  if (isFriday && isValidHHMM(mosque.jumuaTime)) {
    const jumuaDate = composeDate(
      todayCivil.year,
      todayCivil.month,
      todayCivil.day,
      mosque.jumuaTime,
      tz
    )
    const jumuaSlot: PrayerTime = {
      name: "Jumua",
      displayName: PRAYER_DISPLAY_NAMES.Jumua,
      time: jumuaDate,
      timeString: mosque.jumuaTime,
      isNext: false,
      isPast: jumuaDate.getTime() <= now.getTime(),
    }
    const dhuhrIdx = prayers.findIndex((p) => p.name === "Dhuhr")
    if (dhuhrIdx !== -1) prayers.splice(dhuhrIdx + 1, 0, jumuaSlot)
    else prayers.push(jumuaSlot)
  }

  // ── Prochaine prière ──
  // Première prière renseignée encore à venir aujourd'hui.
  // Si toutes sont passées (le soir après Isha) → Fajr de DEMAIN (corrige le bug
  // historique du countdown qui disparaissait la nuit).
  // On ignore les slots non renseignés (time === null).
  let nextPrayer: PrayerTime | null = null
  const upcomingToday = prayers.find((p) => p.time !== null && !p.isPast)
  if (upcomingToday) {
    upcomingToday.isNext = true
    nextPrayer = upcomingToday
  } else if (isValidHHMM(mosque.fajrTime)) {
    // Toutes passées → Fajr de demain (jour civil +1 dans le fuseau).
    const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000)
    const tc = civilDateInZone(tomorrow, tz)
    const fajrTomorrow = composeDate(tc.year, tc.month, tc.day, mosque.fajrTime, tz)
    const iqamaMin = mosque.iqamaFajr
    const iqamaTime = iqamaMin > 0 ? addMinutes(fajrTomorrow, iqamaMin) : undefined
    nextPrayer = {
      name: "Fajr",
      displayName: PRAYER_DISPLAY_NAMES.Fajr,
      time: fajrTomorrow,
      timeString: mosque.fajrTime,
      iqamaTime,
      iqamaString: iqamaTime ? formatHHMM(iqamaTime, tz) : undefined,
      isNext: true,
      isPast: false,
    }
    // Note : ce "Fajr demain" n'est PAS dans la liste `prayers` (qui reste celle
    // d'aujourd'hui, toutes passées). Le composant l'affiche dans le bloc vert
    // via la prop nextPrayer ; le tableau du jour montre la journée écoulée.
  }

  return { prayers, nextPrayer, date: now, timezone: tz }
}

function formatHHMM(date: Date, timezone: string): string {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
    hour12: false,
  })
}

// ─────────────────────────────────────────────────────────────
// SUGGESTION (aide optionnelle dans le formulaire admin).
// Calcule des "HH:MM" MWL pour pré-remplir le formulaire. JAMAIS écrit en base
// automatiquement : l'admin valide. C'est l'unique survivance du calcul.
// ─────────────────────────────────────────────────────────────
const CALCULATION_METHODS: Record<string, () => CalculationParameters> = {
  MWL:       () => CalculationMethod.MuslimWorldLeague(),
  ISNA:      () => CalculationMethod.NorthAmerica(),
  Egyptian:  () => CalculationMethod.Egyptian(),
  UmmAlQura: () => CalculationMethod.UmmAlQura(),
  Karachi:   () => CalculationMethod.Karachi(),
}

export interface SuggestedTimes {
  fajrTime: string
  dhuhrTime: string
  asrTime: string
  maghribTime: string
  ishaTime: string
}

export function suggestPrayerTimes(
  latitude: number,
  longitude: number,
  timezone: string,
  calculationMethod: string = "MWL",
  date: Date = new Date()
): SuggestedTimes {
  const coordinates = new Coordinates(latitude, longitude)
  const params = (CALCULATION_METHODS[calculationMethod] ?? CALCULATION_METHODS.MWL)()
  params.madhab = Madhab.Shafi
  const pt = new PrayerTimes(coordinates, date, params)
  return {
    fajrTime:    formatHHMM(pt.fajr, timezone),
    dhuhrTime:   formatHHMM(pt.dhuhr, timezone),
    asrTime:     formatHHMM(pt.asr, timezone),
    maghribTime: formatHHMM(pt.maghrib, timezone),
    ishaTime:    formatHHMM(pt.isha, timezone),
  }
}
