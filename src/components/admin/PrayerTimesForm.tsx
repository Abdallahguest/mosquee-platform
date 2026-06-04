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

const ROWS: { nameKey: string; adhan: FieldKey; iqama: FieldKey }[] = [
  { nameKey: "Fajr",    adhan: "fajrAdhan",    iqama: "fajrIqama" },
  { nameKey: "Dhuhr",   adhan: "dhuhrAdhan",   iqama: "dhuhrIqama" },
  { nameKey: "Asr",     adhan: "asrAdhan",     iqama: "asrIqama" },
  { nameKey: "Maghrib", adhan: "maghribAdhan", iqama: "maghribIqama" },
  { nameKey: "Isha",    adhan: "ishaAdhan",    iqama: "ishaIqama" },
]

const initialState: PrayerTimesActionState = { ok: false, message: "" }

// Transforme une saisie brute en "HH:MM" au fil de la frappe.
// On ne garde que les chiffres (max 4) et on insère le ":" après 2 chiffres.
// Ex : "0" -> "0", "05" -> "05", "053" -> "05:3", "0535" -> "05:35".
function formatTimeInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}:${digits.slice(2)}`
}

interface TimeInputProps {
  name: string
  value: string
  onChange: (v: string) => void
  priority?: boolean
  label: string
}

// Champ texte unique : on tape les chiffres, le ":" s'insère tout seul.
// La valeur stockée reste "HH:MM" : aucun changement côté base / validation /
// page publique. Clavier numérique sur mobile (inputMode).
function TimeInput({ name, value, onChange, priority, label }: TimeInputProps) {
  const inputClass = priority
    ? "w-full rounded-lg border border-green-300 bg-green-50/60 px-3 py-2 text-center font-mono text-sm font-medium text-gray-900 focus:border-green-500 focus:ring-1 focus:ring-green-500"
    : "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-center font-mono text-sm text-gray-700 focus:border-gray-400 focus:ring-1 focus:ring-gray-300"

  return (
    <input
      name={name}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={value}
      onChange={(e) => onChange(formatTimeInput(e.target.value))}
      placeholder="--:--"
      maxLength={5}
      aria-label={label}
      className={inputClass}
      dir="ltr"
    />
  )
}

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

      {/* Le titre de section vient de la carte parente (prayerCardTitle) :
          on ne le répète plus ici. */}
      <div className="flex flex-col sm:flex-row items-start sm:justify-between gap-3">
        <p className="text-sm text-gray-500">{t("intro")}</p>
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

      {/* Conteneur avec padding : les horaires ne collent plus au bord. */}
      <div className="rounded-xl border border-gray-100 p-3 sm:p-4 space-y-3">
        {/* En-têtes : Adhan neutre, Iqama signalée prioritaire. */}
        <div className="grid grid-cols-[4.5rem_1fr_1fr] gap-2 sm:gap-3 items-end text-xs font-medium px-1">
          <span></span>
          <span className="text-gray-500 text-center">{t("colAdhan")}</span>
          <span className="text-green-700 font-semibold text-center">{t("colIqama")}</span>
        </div>

        {ROWS.map((row) => (
          <div key={row.nameKey} className="grid grid-cols-[4.5rem_1fr_1fr] gap-2 sm:gap-3 items-start">
            <label className="text-sm font-medium text-gray-700 pt-2">{tp(row.nameKey)}</label>
            <div>
              <TimeInput
                name={row.adhan}
                value={values[row.adhan]}
                onChange={(v) => set(row.adhan, v)}
                label={`${tp(row.nameKey)} ${t("colAdhan")}`}
              />
              {err[row.adhan] && <p className="text-xs text-red-600 mt-1">{translate(err[row.adhan]!)}</p>}
            </div>
            <div>
              <TimeInput
                name={row.iqama}
                value={values[row.iqama]}
                onChange={(v) => set(row.iqama, v)}
                priority
                label={`${tp(row.nameKey)} ${t("colIqama")}`}
              />
              {err[row.iqama] && <p className="text-xs text-red-600 mt-1">{translate(err[row.iqama]!)}</p>}
            </div>
          </div>
        ))}

        {/* Jumu'ah : même structure. */}
        <div className="grid grid-cols-[4.5rem_1fr_1fr] gap-2 sm:gap-3 items-start pt-3 border-t border-gray-100">
          <label className="text-sm font-medium text-gray-700 pt-2">{tp("Jumua")}</label>
          <div>
            <TimeInput
              name="jumuaAdhan"
              value={values.jumuaAdhan}
              onChange={(v) => set("jumuaAdhan", v)}
              label={`${tp("Jumua")} ${t("colAdhan")}`}
            />
            {err.jumuaAdhan && <p className="text-xs text-red-600 mt-1">{translate(err.jumuaAdhan)}</p>}
          </div>
          <div>
            <TimeInput
              name="jumuaIqama"
              value={values.jumuaIqama}
              onChange={(v) => set("jumuaIqama", v)}
              priority
              label={`${tp("Jumua")} ${t("colIqama")}`}
            />
            {err.jumuaIqama && <p className="text-xs text-red-600 mt-1">{translate(err.jumuaIqama)}</p>}
          </div>
        </div>
        <p className="text-xs text-gray-500 px-1">{t("jumuaNote")}</p>
      </div>

      {state.message && (
        <p className={`text-sm ${state.ok ? "text-green-700" : "text-red-600"}`}>
          {translate(state.message)}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full sm:w-auto bg-green-700 text-white rounded-lg px-5 py-2.5 font-medium hover:bg-green-800 disabled:opacity-50"
      >
        {isPending ? t("saving") : t("saveButton")}
      </button>
    </form>
  )
}
