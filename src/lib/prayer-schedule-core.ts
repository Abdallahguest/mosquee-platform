// ─────────────────────────────────────────────────────────────
// prayer-schedule-core.ts — Logique PURE des horaires (client-safe).
//
// Aucune dépendance à "adhan" → ce module est importable côté CLIENT.
// Il compose les heures "HH:MM" en Date dans le fuseau de la mosquée et
// détermine la prochaine prière (basée sur l'iqama). C'est ce qui permet au
// composant client de RECALCULER tout seul quand le compteur atteint zéro,
// sans rechargement (Bug B).
// ─────────────────────────────────────────────────────────────

export type PrayerName = "Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha"
export type ScheduleSlotName = PrayerName | "Jumua"

export interface PrayerTime {
  name: ScheduleSlotName
  displayName: string
  iqamaTime: Date | null       // null = non renseignée (affiche "—")
  iqamaString: string          // "13:35" ou "—"
  adhanString?: string         // "13:20" si renseigné
  isNext: boolean
  isPast: boolean
  isInactive?: boolean         // Jumu'ah en semaine : affichée mais grisée
}

export interface ScheduleInput {
  fajrAdhan:    string | null; fajrIqama:    string | null
  dhuhrAdhan:   string | null; dhuhrIqama:   string | null
  asrAdhan:     string | null; asrIqama:     string | null
  maghribAdhan: string | null; maghribIqama: string | null
  ishaAdhan:    string | null; ishaIqama:    string | null
  jumuaAdhan:   string | null; jumuaIqama:   string | null
  timezone: string
}

export interface DailySchedule {
  prayers: PrayerTime[]
  nextPrayer: PrayerTime | null
  timezone: string
}

const PRAYER_DISPLAY_NAMES: Record<ScheduleSlotName, string> = {
  Fajr:    "Fajr",
  Dhuhr:   "Dhuhr",
  Asr:     "Asr",
  Maghrib: "Maghrib",
  Isha:    "Isha'",
  Jumua:   "Jumu'ah",
}

const HHMM_RE = /^([01]\d|2[0-3]):([0-5]\d)$/

export function isValidHHMM(value: string | null | undefined): value is string {
  return typeof value === "string" && HHMM_RE.test(value)
}

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

export function composeDate(
  civilYear: number, civilMonth: number, civilDay: number,
  hhmm: string, timezone: string
): Date {
  const [h, m] = hhmm.split(":").map(Number)
  const guess = new Date(Date.UTC(civilYear, civilMonth - 1, civilDay, h, m, 0))
  const offset = offsetMinutesForZone(guess, timezone)
  return new Date(guess.getTime() - offset * 60000)
}

export function civilDateInZone(at: Date, timezone: string) {
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

// ── Construit le planning du jour à un instant `now` donné ──
// L'iqama est l'heure pivot. Jumu'ah est TOUJOURS présente :
//   - en semaine : en dernière ligne, inactive (grisée), jamais "prochaine"
//   - le vendredi : active, déplacée juste après Dhuhr
export function buildDailySchedule(input: ScheduleInput, now: Date): DailySchedule {
  const tz = input.timezone
  const today = civilDateInZone(now, tz)
  const isFriday = today.weekday === "Fri"

  function slot(
    name: ScheduleSlotName,
    adhan: string | null,
    iqama: string | null,
    opts: { inactive?: boolean } = {}
  ): PrayerTime {
    if (!isValidHHMM(iqama)) {
      return {
        name,
        displayName: PRAYER_DISPLAY_NAMES[name],
        iqamaTime: null,
        iqamaString: "—",
        adhanString: isValidHHMM(adhan) ? adhan : undefined,
        isNext: false,
        isPast: false,
        isInactive: opts.inactive,
      }
    }
    const iqamaTime = composeDate(today.year, today.month, today.day, iqama, tz)
    return {
      name,
      displayName: PRAYER_DISPLAY_NAMES[name],
      iqamaTime,
      iqamaString: iqama,
      adhanString: isValidHHMM(adhan) ? adhan : undefined,
      isNext: false,
      // Une prière inactive (Jumu'ah hors vendredi) n'est jamais "passée".
      isPast: opts.inactive ? false : iqamaTime.getTime() <= now.getTime(),
      isInactive: opts.inactive,
    }
  }

  const prayers: PrayerTime[] = [
    slot("Fajr",    input.fajrAdhan,    input.fajrIqama),
    slot("Dhuhr",   input.dhuhrAdhan,   input.dhuhrIqama),
    slot("Asr",     input.asrAdhan,     input.asrIqama),
    slot("Maghrib", input.maghribAdhan, input.maghribIqama),
    slot("Isha",    input.ishaAdhan,    input.ishaIqama),
  ]

  // Jumu'ah : toujours affichée.
  if (isFriday) {
    // Active, insérée juste après Dhuhr.
    const jumua = slot("Jumua", input.jumuaAdhan, input.jumuaIqama)
    const dhuhrIdx = prayers.findIndex((p) => p.name === "Dhuhr")
    if (dhuhrIdx !== -1) prayers.splice(dhuhrIdx + 1, 0, jumua)
    else prayers.push(jumua)
  } else {
    // En semaine : en dernier, inactive (grisée).
    prayers.push(slot("Jumua", input.jumuaAdhan, input.jumuaIqama, { inactive: true }))
  }

  // ── Prochaine prière (iqama, hors prières inactives) ──
  let nextPrayer: PrayerTime | null = null
  const upcoming = prayers.find((p) => !p.isInactive && p.iqamaTime !== null && !p.isPast)
  if (upcoming) {
    upcoming.isNext = true
    nextPrayer = upcoming
  } else if (isValidHHMM(input.fajrIqama)) {
    // Tout passé → Fajr de demain.
    const tomorrow = new Date(now.getTime() + 24 * 3600 * 1000)
    const tc = civilDateInZone(tomorrow, tz)
    nextPrayer = {
      name: "Fajr",
      displayName: PRAYER_DISPLAY_NAMES.Fajr,
      iqamaTime: composeDate(tc.year, tc.month, tc.day, input.fajrIqama, tz),
      iqamaString: input.fajrIqama,
      adhanString: isValidHHMM(input.fajrAdhan) ? input.fajrAdhan : undefined,
      isNext: true,
      isPast: false,
    }
  }

  return { prayers, nextPrayer, timezone: tz }
}
