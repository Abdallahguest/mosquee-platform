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

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"))
// Toutes les minutes (00 à 59) : aucune contrainte sur l'horaire saisi.
// On évite ainsi toute incertitude sur ce qu'une mosquée peut renseigner.
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"))

// Découpe "HH:MM". Renvoie des parties vides si la valeur est vide/invalide.
function splitTime(v: string): { h: string; m: string } {
  const match = /^([0-2]\d):([0-5]\d)$/.exec(v)
  if (!match) return { h: "", m: "" }
  return { h: match[1], m: match[2] }
}

interface TimeSelectProps {
  name: string
  value: string
  onChange: (v: string) => void
  priority?: boolean
  label: string
}

// Sélecteur d'heure maison : deux menus déroulants (heures / minutes).
// Remplace <input type="time"> dont le popup natif s'affiche mal sur certains
// téléphones. La valeur reste "HH:MM" (champ caché) : aucun changement côté
// base / validation / page publique.
function TimeSelect({ name, value, onChange, priority, label }: TimeSelectProps) {
  const { h, m } = splitTime(value)

  function update(nextH: string, nextM: string) {
    // Champ facultatif : tant que les deux parties ne sont pas choisies,
    // la valeur reste vide (vide = "ne pas afficher").
    if (nextH === "" || nextM === "") return onChange("")
    onChange(`${nextH}:${nextM}`)
  }

  const selectClass = priority
    ? "rounded-lg border border-green-300 bg-green-50/60 px-2 py-2 text-sm font-medium text-gray-900 focus:border-green-500 focus:ring-1 focus:ring-green-500"
    : "rounded-lg border border-gray-300 bg-white px-2 py-2 text-sm text-gray-700 focus:border-gray-400 focus:ring-1 focus:ring-gray-300"

  return (
    <div className="flex items-center gap-1.5" dir="ltr">
      {/* Champ caché : c'est lui qui part au serveur, au format HH:MM. */}
      <input type="hidden" name={name} value={value} />
      <select
        aria-label={`${label} \u2014 heures`}
        value={h}
        onChange={(e) => update(e.target.value, m)}
        className={selectClass}
      >
        <option value="">--</option>
        {HOURS.map((hh) => (
          <option key={hh} value={hh}>{hh}</option>
        ))}
      </select>
      <span className="text-gray-400" aria-hidden="true">:</span>
      <select
        aria-label={`${label} \u2014 minutes`}
        value={m}
        onChange={(e) => update(h, e.target.value)}
        className={selectClass}
      >
        <option value="">--</option>
        {MINUTES.map((mm) => (
          <option key={mm} value={mm}>{mm}</option>
        ))}
      </select>
    </div>
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
          on ne le répète plus ici (était dupliqué). */}
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
          <span className="text-gray-500">{t("colAdhan")}</span>
          <span className="text-green-700 font-semibold">{t("colIqama")}</span>
        </div>

        {ROWS.map((row) => (
          <div key={row.nameKey} className="grid grid-cols-[4.5rem_1fr_1fr] gap-2 sm:gap-3 items-start">
            <label className="text-sm font-medium text-gray-700 pt-2">{tp(row.nameKey)}</label>
            <div>
              <TimeSelect
                name={row.adhan}
                value={values[row.adhan]}
                onChange={(v) => set(row.adhan, v)}
                label={`${tp(row.nameKey)} ${t("colAdhan")}`}
              />
              {err[row.adhan] && <p className="text-xs text-red-600 mt-1">{translate(err[row.adhan]!)}</p>}
            </div>
            <div>
              <TimeSelect
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
            <TimeSelect
              name="jumuaAdhan"
              value={values.jumuaAdhan}
              onChange={(v) => set("jumuaAdhan", v)}
              label={`${tp("Jumua")} ${t("colAdhan")}`}
            />
            {err.jumuaAdhan && <p className="text-xs text-red-600 mt-1">{translate(err.jumuaAdhan)}</p>}
          </div>
          <div>
            <TimeSelect
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
