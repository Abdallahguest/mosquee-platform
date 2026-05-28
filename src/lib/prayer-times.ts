import { Coordinates, CalculationMethod, PrayerTimes, Madhab, CalculationParameters } from "adhan"

export type PrayerName = "Fajr" | "Sunrise" | "Dhuhr" | "Asr" | "Maghrib" | "Isha"

export interface PrayerAdjustments {
  adjust: Record<"Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha", number>
  iqama:  Record<"Fajr" | "Dhuhr" | "Asr" | "Maghrib" | "Isha", number>
}

export interface PrayerTime {
  name: PrayerName
  displayName: string
  time: Date
  timeString: string
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

const CALCULATION_METHODS: Record<string, () => CalculationParameters> = {
  MWL:        () => CalculationMethod.MuslimWorldLeague(),
  ISNA:       () => CalculationMethod.NorthAmerica(),
  Egyptian:   () => CalculationMethod.Egyptian(),
  UmmAlQura:  () => CalculationMethod.UmmAlQura(),
  Karachi:    () => CalculationMethod.Karachi(),
}

const PRAYER_DISPLAY_NAMES: Record<PrayerName, string> = {
  Fajr:    "Fajr",
  Sunrise: "Shuruq",
  Dhuhr:   "Dhuhr",
  Asr:     "Asr",
  Maghrib: "Maghrib",
  Isha:    "Isha",
}

function formatTime(date: Date, timezone: string): string {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: timezone,
    hour12: false,
  })
}

export function getDailyPrayerTimes(
  latitude: number,
  longitude: number,
  timezone: string,
  calculationMethod: string = "MWL",
  date: Date = new Date(),
  adjustments?: PrayerAdjustments
): DailyPrayerTimes {
  const coordinates = new Coordinates(latitude, longitude)
  const params = (CALCULATION_METHODS[calculationMethod] ?? CALCULATION_METHODS.MWL)()
  params.madhab = Madhab.Shafi

  const prayerTimes = new PrayerTimes(coordinates, date, params)
  const now = new Date()

  const addMinutes = (d: Date, min: number) => new Date(d.getTime() + min * 60000)

  const prayerList: PrayerTime[] = [
    { name: "Fajr" as const,    time: prayerTimes.fajr    },
    { name: "Sunrise" as const, time: prayerTimes.sunrise  },
    { name: "Dhuhr" as const,   time: prayerTimes.dhuhr    },
    { name: "Asr" as const,     time: prayerTimes.asr      },
    { name: "Maghrib" as const, time: prayerTimes.maghrib   },
    { name: "Isha" as const,    time: prayerTimes.isha      },
  ].map(({ name, time }) => {
    const adjustMin = name !== "Sunrise" && adjustments
      ? adjustments.adjust[name as keyof typeof adjustments.adjust] ?? 0
      : 0
    const adjustedTime = addMinutes(time, adjustMin)

    const iqamaMin = name !== "Sunrise" && adjustments
      ? adjustments.iqama[name as keyof typeof adjustments.iqama] ?? 0
      : 0
    const iqamaTime = name !== "Sunrise"
      ? addMinutes(adjustedTime, iqamaMin)
      : undefined

    return {
      name,
      displayName: PRAYER_DISPLAY_NAMES[name],
      time: adjustedTime,
      timeString: formatTime(adjustedTime, timezone),
      iqamaTime,
      iqamaString: iqamaTime ? formatTime(iqamaTime, timezone) : undefined,
      isNext: false,
      isPast: adjustedTime < now,
    }
  })

  const nextIndex = prayerList.findIndex(p => !p.isPast)
  if (nextIndex !== -1) {
    prayerList[nextIndex].isNext = true
  }

  const nextPrayer = prayerList.find(p => p.isNext) ?? null

  return { prayers: prayerList, nextPrayer, date, timezone }
}
