"use client"

import { useActionState, useState, useTransition } from "react"
import { updatePrayerTimes, getSuggestedPrayerTimes } from "@/lib/actions/prayer-times"
import type { PrayerTimesActionState } from "@/lib/actions/prayer-times-types"

interface Props {
  mosqueId: number
  initial: {
    fajrTime: string | null
    dhuhrTime: string | null
    asrTime: string | null
    maghribTime: string | null
    ishaTime: string | null
    jumuaTime: string | null
  }
}

const FIELDS = [
  { key: "fajrTime",    label: "Fajr" },
  { key: "dhuhrTime",   label: "Dhuhr" },
  { key: "asrTime",     label: "Asr" },
  { key: "maghribTime", label: "Maghrib" },
  { key: "ishaTime",    label: "Isha" },
] as const

const initialState: PrayerTimesActionState = { ok: false, message: "" }

export default function PrayerTimesForm({ mosqueId, initial }: Props) {
  const [state, formAction, isPending] = useActionState(updatePrayerTimes, initialState)
  const [suggesting, startSuggest] = useTransition()
  const [suggestMsg, setSuggestMsg] = useState("")

  // Valeurs contrôlées : permettent au bouton "Pré-remplir" de remplir les champs.
  const [values, setValues] = useState({
    fajrTime:    initial.fajrTime ?? "",
    dhuhrTime:   initial.dhuhrTime ?? "",
    asrTime:     initial.asrTime ?? "",
    maghribTime: initial.maghribTime ?? "",
    ishaTime:    initial.ishaTime ?? "",
    jumuaTime:   initial.jumuaTime ?? "",
  })

  function set(key: string, v: string) {
    setValues((prev) => ({ ...prev, [key]: v }))
  }

  function handleSuggest() {
    setSuggestMsg("")
    startSuggest(async () => {
      const res = await getSuggestedPrayerTimes(mosqueId)
      if (!res.ok) {
        setSuggestMsg(res.message)
        return
      }
      // Pré-remplit SANS écraser Jumu'ah (pas concerné par le calcul).
      setValues((prev) => ({
        ...prev,
        fajrTime:    res.suggested.fajrTime,
        dhuhrTime:   res.suggested.dhuhrTime,
        asrTime:     res.suggested.asrTime,
        maghribTime: res.suggested.maghribTime,
        ishaTime:    res.suggested.ishaTime,
      }))
      setSuggestMsg("Calcul inséré. Corrige selon le panneau de la mosquée, puis Enregistrer.")
    })
  }

  const err = state.fieldErrors ?? {}

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="mosqueId" value={mosqueId} />

      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-900">Horaires de prière</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Saisis les heures réelles affichées par la mosquée (format 24h, ex. 05:35).
            Laisse vide pour ne pas afficher une prière.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSuggest}
          disabled={suggesting}
          className="shrink-0 text-sm border border-green-600 text-green-700 rounded-lg px-3 py-2 hover:bg-green-50 disabled:opacity-50"
        >
          {suggesting ? "Calcul…" : "Pré-remplir (calcul MWL)"}
        </button>
      </div>

      {suggestMsg && (
        <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{suggestMsg}</p>
      )}

      <div className="grid grid-cols-2 gap-4">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label htmlFor={f.key} className="block text-sm font-medium text-gray-700 mb-1">
              {f.label}
            </label>
            <input
              id={f.key}
              name={f.key}
              type="time"
              value={values[f.key]}
              onChange={(e) => set(f.key, e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono"
            />
            {err[f.key] && <p className="text-xs text-red-600 mt-1">{err[f.key]}</p>}
          </div>
        ))}

        {/* Jumu'ah : séparé, affiché le vendredi EN PLUS de Dhuhr. */}
        <div>
          <label htmlFor="jumuaTime" className="block text-sm font-medium text-gray-700 mb-1">
            Jumu&apos;ah (vendredi)
          </label>
          <input
            id="jumuaTime"
            name="jumuaTime"
            type="time"
            value={values.jumuaTime}
            onChange={(e) => set("jumuaTime", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono"
          />
          {err.jumuaTime && <p className="text-xs text-red-600 mt-1">{err.jumuaTime}</p>}
          <p className="text-xs text-gray-400 mt-1">Affichée uniquement le vendredi.</p>
        </div>
      </div>

      {state.message && (
        <p className={`text-sm ${state.ok ? "text-green-700" : "text-red-600"}`}>
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="bg-green-700 text-white rounded-lg px-5 py-2.5 font-medium hover:bg-green-800 disabled:opacity-50"
      >
        {isPending ? "Enregistrement…" : "Enregistrer les horaires"}
      </button>
    </form>
  )
}
