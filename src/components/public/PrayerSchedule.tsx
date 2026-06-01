"use client"

import { useTranslations } from "next-intl"
import { useState, useEffect } from "react"
import type { PrayerTime } from "@/lib/prayer-times"

interface PrayerScheduleProps {
  prayers: PrayerTime[]
  nextPrayer: PrayerTime | null
}

function useCountdown(targetTime: Date | null): string {
  const [countdown, setCountdown] = useState<string>("")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0)
    return () => {
      clearTimeout(timer)
      setMounted(false)
    }
  }, [])

  useEffect(() => {
    if (!targetTime || !mounted) return

    function update() {
      if (!targetTime) return
      const target = new Date(targetTime)
      const diff = target.getTime() - Date.now()

      if (diff <= 0) {
        setCountdown("00:00:00")
        return
      }

      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)

      if (h > 0) {
        setCountdown(`${h}h ${String(m).padStart(2, "0")}m ${String(s).padStart(2, "0")}s`)
      } else {
        setCountdown(`${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`)
      }
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [targetTime, mounted])

  if (!mounted) return "..."

  return countdown
}

export default function PrayerSchedule({ prayers, nextPrayer }: PrayerScheduleProps) {
  const t = useTranslations("prayer")
  const countdown = useCountdown(nextPrayer?.iqamaTime ?? null)

  // Ligne dont l'adhan est révélé (tap mobile). Une seule à la fois.
  const [openSlot, setOpenSlot] = useState<string | null>(null)

  return (
    <div className="space-y-4">

      {/* Prochaine prière avec compte à rebours (basé sur l'iqama) */}
      {nextPrayer && (
        <div className="bg-green-700 text-white rounded-2xl p-6 text-center">
          <p className="text-green-200 text-sm mb-1">{t("nextPrayer")}</p>
          <p className="text-3xl font-bold mb-1">{nextPrayer.displayName}</p>
          <p className="text-5xl font-mono font-bold mb-3">{nextPrayer.iqamaString}</p>
          {nextPrayer.adhanString && (
            <p className="text-green-200 text-xs mb-3">
              {t("adhan")} {nextPrayer.adhanString}
            </p>
          )}
          {countdown && (
            <div className="inline-block bg-green-600 rounded-full px-4 py-1.5">
              <span className="text-green-100 text-sm">{t("in")} </span>
              <span className="text-white font-mono font-semibold">{countdown}</span>
            </div>
          )}
        </div>
      )}

      {/* Tableau des horaires (heure principale = iqama) */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{t("schedule")}</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {prayers.map((prayer) => {
            const hasAdhan = Boolean(prayer.adhanString)
            const isOpen = openSlot === prayer.name
            return (
              <div
                key={prayer.name}
                onClick={() => hasAdhan && setOpenSlot(isOpen ? null : prayer.name)}
                title={hasAdhan ? `${t("adhan")} ${prayer.adhanString}` : undefined}
                className={`px-6 py-3.5 flex items-center justify-between transition-colors ${
                  hasAdhan ? "cursor-pointer" : ""
                } ${
                  prayer.isNext
                    ? "bg-green-50"
                    : prayer.isPast
                    ? "opacity-40"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`font-medium ${
                    prayer.isNext ? "text-green-700" : "text-gray-900"
                  }`}>
                    {t(prayer.name)}
                  </span>
                  {prayer.isNext && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      {t("next")}
                    </span>
                  )}
                  {prayer.isPast && !prayer.isNext && (
                    <span className="text-xs text-gray-400">✓</span>
                  )}
                </div>

                <div className="text-right">
                  <span className={`font-mono text-lg font-semibold block ${
                    prayer.isNext ? "text-green-700" : "text-gray-700"
                  }`}>
                    {prayer.iqamaString}
                  </span>
                  {/* Adhan : révélé au tap (mobile) ou survol via title (desktop). */}
                  {hasAdhan && isOpen && (
                    <span className="text-xs text-gray-400">
                      {t("adhan")} {prayer.adhanString}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
