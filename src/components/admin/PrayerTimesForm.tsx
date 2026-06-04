"use client"

import { useActionState, useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { useErrorMessages } from "@/lib/use-error-messages"
import { updatePrayerTimes, getSuggestedPrayerTimes } from "@/lib/actions/prayer-times"
import type { PrayerTimesActionState } from "@/lib/actions/prayer-times-types"

interface Props {
  mosqueId: number
  initial: {
    fajrAdhan: string | null;    fajrIqama: string | null
    dhuhrAdhan: string | null;   dhuhrIqama: string | null
    asrAdhan: string | null;     asrIqama: string | null
    maghribAdhan: string | null; maghribIqama: string | null
    ishaAdhan: string | null;    ishaIqama: string | null
    jumuaAdhan: string | null;   jumuaIqama: string | null
  }
}

type FieldKey = keyof Props["initial"]

// Lignes quotidiennes : chaque prière a un champ adhan + un champ iqama.
// `nameKey` pointe vers les noms de prières partagés (namespace "prayer"),
// pour rester cohérent avec la page publique.
const ROWS: { nameKey: string; adhan: FieldKey; iqama: FieldKey }[] = [
  { nameKey: "Fajr",    adhan: "fajrAdhan",    iqama: "fajrIqama" },
  { nameKey: "Dhuhr",   adhan: "dhuhrAdhan",   iqama: "dhuhrIqama" },
  { nameKey: "Asr",     adhan: "asrAdhan",     iqama: "asrIqama" },
  { nameKey: "Maghrib", adhan: "maghribAdhan", iqama: "maghribIqama" },
  { nameKey: "Isha",    adhan: "ishaAdhan",    iqama: "ishaIqama" },
]

const initialState: PrayerTimesActionState = { ok: false, message: "" }

export default function PrayerTimesForm({ mosqueId, initial }: Props) {
  const t = useTranslations("admin.prayerTimes")
  const tp = useTranslations("prayer")
  const { translate } = useErrorMessages()
  const [state, formAction, isPending] = useActionState(updatePrayerTimes, initialState)
  const [suggesting, startSuggest] = useTransition()
  const [suggestMsg, setSuggestMsg] = useState("")

  const [values, setValues] = useState<Record<FieldKey, string>>({
    fajrAdhan:    initial.fajrAdhan ?? "",    fajrIqama:    initial.fajrIqama ?? "",
    dhuhrAdhan:   initial.dhuhrAdhan ?? "",   dhuhrIqama:   initial.dhuhrIqama ?? "",
    asrAdhan:     initial.asrAdhan ?? "",     asrIqama:     initial.asrIqama ?? "",
    maghribAdhan: initial.maghribAdhan ?? "", maghribIqama: initial.maghribIqama ?? "",
    ishaAdhan:    initial.ishaAdhan ?? "",    ishaIqama:    initial.ishaIqama ?? "",
    jumuaAdhan:   initial.jumuaAdhan ?? "",   jumuaIqama:   initial.jumuaIqama ?? "",
  })

  function set(key: FieldKey, v: string) {
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
      setValues((prev) => ({
        ...prev,
        fajrAdhan:    res.suggested.fajrAdhan,
        dhuhrAdhan:   res.suggested.dhuhrAdhan,
        asrAdhan:     res.suggested.asrAdhan,
        maghribAdhan: res.suggested.maghribAdhan,
        ishaAdhan:    res.suggested.ishaAdhan,
      }))
      setSuggestMsg(t("suggestDone"))
    })
  }

  const err = state.fieldErrors ?? {}

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="mosqueId" value={mosqueId} />

      <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3">
        <div>
          <h2 className="font-semibold text-gray-900">{t("title")}</h2>
          <p className="text-sm text-gray-500 mt-0.5">{t("intro")}</p>
        </div>
        <button
          type="button"
          onClick={handleSuggest}
          disabled={suggesting}
          className="shrink-0 w-full sm:w-auto text-sm border border-green-600 text-green-700 rounded-lg px-3 py-2 hover:bg-green-50 disabled:opacity-50"
        >
          {suggesting ? t("suggesting") : t("suggestButton")}
        </button>
      </div>

      {suggestMsg && (
        <p className="text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{suggestMsg}</p>
      )}

      {/* En-têtes de colonnes */}
      <div className="grid grid-cols-[5rem_1fr_1fr] gap-3 items-center text-xs font-medium text-gray-500 px-1">
        <span></span>
        <span>{t("colAdhan")}</span>
        <span>{t("colIqama")}</span>
      </div>

      <div className="space-y-3">
        {ROWS.map((row) => (
          <div key={row.nameKey} className="grid grid-cols-[5rem_1fr_1fr] gap-3 items-center">
            <label className="text-sm font-medium text-gray-700">{tp(row.nameKey)}</label>
            <div>
              <input
                name={row.adhan}
                type="time"
                value={values[row.adhan]}
                onChange={(e) => set(row.adhan, e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono"
                dir="ltr"
              />
              {err[row.adhan] && <p className="text-xs text-red-600 mt-1">{translate(err[row.adhan]!)}</p>}
            </div>
            <div>
              <input
                name={row.iqama}
                type="time"
                value={values[row.iqama]}
                onChange={(e) => set(row.iqama, e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono"
                dir="ltr"
              />
              {err[row.iqama] && <p className="text-xs text-red-600 mt-1">{translate(err[row.iqama]!)}</p>}
            </div>
          </div>
        ))}

        {/* Jumu'ah : même structure. */}
        <div className="grid grid-cols-[5rem_1fr_1fr] gap-3 items-center pt-2 border-t border-gray-100">
          <label className="text-sm font-medium text-gray-700">{tp("Jumua")}</label>
          <div>
            <input
              name="jumuaAdhan"
              type="time"
              value={values.jumuaAdhan}
              onChange={(e) => set("jumuaAdhan", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono"
              dir="ltr"
            />
            {err.jumuaAdhan && <p className="text-xs text-red-600 mt-1">{translate(err.jumuaAdhan)}</p>}
          </div>
          <div>
            <input
              name="jumuaIqama"
              type="time"
              value={values.jumuaIqama}
              onChange={(e) => set("jumuaIqama", e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono"
              dir="ltr"
            />
            {err.jumuaIqama && <p className="text-xs text-red-600 mt-1">{translate(err.jumuaIqama)}</p>}
          </div>
        </div>
        <p className="text-xs text-gray-500">{t("jumuaNote")}</p>
      </div>

      {state.message && (
        <p className={`text-sm ${state.ok ? "text-green-700" : "text-red-600"}`}>
          {translate(state.message)}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="bg-green-700 text-white rounded-lg px-5 py-2.5 font-medium hover:bg-green-800 disabled:opacity-50"
      >
        {isPending ? t("saving") : t("saveButton")}
      </button>
    </form>
  )
}
