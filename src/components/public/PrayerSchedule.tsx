"use client"

import { useTranslations } from "next-intl"
import { useState, useEffect } from "react"
import { buildDailySchedule, type ScheduleInput, type PrayerTime } from "@/lib/prayer-schedule-core"

interface PrayerScheduleProps {
  // Heures brutes + fuseau : le client recompose et recalcule lui-même,
  // ce qui permet l'auto-actualisation sans rechargement (Bug B).
  schedule: ScheduleInput
}

function pad(n: number) {
  return String(n).padStart(2, "0")
}

export default function PrayerSchedule({ schedule }: PrayerScheduleProps) {
  const t = useTranslations("prayer")

  // `now` avance chaque seconde côté client. À chaque tick on reconstruit le
  // planning : la prochaine prière bascule toute seule quand l'heure est atteinte.
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    const tick = () => setNow(new Date())
    const id = setInterval(tick, 1000)
    const timeoutId = setTimeout(tick, 0) // premier tick différé : évite le setState synchrone dans l'effet
    return () => {
      clearInterval(id)
      clearTimeout(timeoutId)
    }
  }, [])

  // Avant le montage client : rendu neutre stable (pas de flash, pas de mismatch).
  const effectiveNow = now ?? new Date(0)
  const { prayers, nextPrayer, isFriday } = buildDailySchedule(schedule, effectiveNow)

  // Compte à rebours vers l'iqama de la prochaine prière.
  let countdown = ""
  if (now && nextPrayer?.iqamaTime) {
    const diff = nextPrayer.iqamaTime.getTime() - now.getTime()
    if (diff > 0) {
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      countdown = h > 0 ? `${h}h ${pad(m)}m ${pad(s)}s` : `${pad(m)}:${pad(s)}`
    }
  }

  // Avant montage, on n'affiche pas le compteur (il dépend de l'heure réelle).
  const mounted = now !== null

  return (
    <div className="space-y-4">

      {/* Prochaine prière + compte à rebours (basé sur l'iqama) */}
      {nextPrayer && (
        <div className="bg-green-700 text-white rounded-2xl p-6 text-center shadow-sm">
          <p className="text-green-100 text-sm mb-1">{t("nextPrayer")}</p>
          <p className="text-3xl font-bold mb-1">{t(nextPrayer.name)}</p>
          <p className="text-5xl font-mono font-bold mb-2">{nextPrayer.iqamaString}</p>
          {nextPrayer.adhanString && (
            <p className="text-green-100 text-xs mb-3">
              {t("adhanLabel")} · {nextPrayer.adhanString}
            </p>
          )}
          {mounted && countdown && (
            <div className="inline-block bg-green-600 rounded-full px-4 py-1.5">
              <span className="text-green-100 text-sm">{t("in")} </span>
              <span className="text-white font-mono font-semibold">{countdown}</span>
            </div>
          )}
        </div>
      )}

      {/* Tableau des horaires — heure affichée = iqama (prière de groupe) */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{t("schedule")}</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {prayers.map((prayer) => (
            <PrayerRow key={prayer.name} prayer={prayer} />
          ))}
        </div>
        {/* Légende discrète : explique les deux heures sans jargon */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
          <p className="text-[11px] text-gray-500">
            {t("scheduleLegend")}
          </p>
          {mounted && isFriday && (
            <p className="text-[11px] text-green-700 mt-1.5">
              {t("fridayNote")}
            </p>
          )}
        </div>
      </div>

    </div>
  )
}

function PrayerRow({ prayer }: { prayer: PrayerTime }) {
  const t = useTranslations("prayer")
  const [open, setOpen] = useState(false)
  const hasAdhan = Boolean(prayer.adhanString)

  // Jumu'ah en semaine : grisée, non cliquable, pas d'état "prochaine/passée".
  if (prayer.isInactive) {
    return (
      <div className="px-6 py-3.5 flex items-center justify-between opacity-50">
        <span className="font-medium text-gray-900">{t(prayer.name)}</span>
        <div className="text-right">
          <span className="font-mono text-lg font-semibold block text-gray-700">
            {prayer.iqamaString}
          </span>
          <span className="text-[11px] text-gray-500">{t("fridayOnly")}</span>
        </div>
      </div>
    )
  }

  // Ligne révélable : accessible au clavier (role/tabIndex/Enter-Espace) — corrige A1.
  const interactiveProps = hasAdhan
    ? {
        role: "button" as const,
        tabIndex: 0,
        "aria-expanded": open,
        "aria-label": `${t(prayer.name)} — ${t("iqamaLabel")} ${prayer.iqamaString}${
          prayer.adhanString ? `, ${t("adhanLabel")} ${prayer.adhanString}` : ""
        }`,
        onClick: () => setOpen((v) => !v),
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            setOpen((v) => !v)
          }
        },
      }
    : {}

  return (
    <div
      {...interactiveProps}
      title={hasAdhan ? `${t("adhanLabel")} ${prayer.adhanString}` : undefined}
      className={`px-6 py-3.5 flex items-center justify-between transition-colors outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-inset ${
        hasAdhan ? "cursor-pointer" : ""
      } ${prayer.isNext ? "bg-green-50" : prayer.isPast ? "opacity-50" : ""}`}
    >
      <div className="flex items-center gap-3">
        <span className={`font-medium ${prayer.isNext ? "text-green-700" : "text-gray-900"}`}>
          {t(prayer.name)}
        </span>
        {prayer.isNext && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            {t("next")}
          </span>
        )}
        {prayer.isPast && !prayer.isNext && (
          <span className="text-xs text-gray-500 ms-1" aria-label={t("passed")}>✓</span>
        )}
      </div>

      <div className="text-end">
        <span className={`font-mono text-lg font-semibold block ${
          prayer.isNext ? "text-green-700" : "text-gray-700"
        }`}>
          {prayer.iqamaString}
        </span>
        {prayer.dhuhrNote && (
          <span className="text-[11px] text-gray-500 block">
            {t("Dhuhr")} · {prayer.dhuhrNote}
          </span>
        )}
        {hasAdhan && open && (
          <span className="text-[11px] text-gray-500">
            {t("adhanLabel")} · {prayer.adhanString}
          </span>
        )}
      </div>
    </div>
  )
}
