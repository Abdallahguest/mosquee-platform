import { getLocale, getTranslations } from "next-intl/server"
import { contentLanguageName, shouldShowContentLangNote } from "@/lib/content-language"

interface Event {
  id: number
  title: string
  description: string | null
  location: string
  startAt: Date
  endAt: Date | null
}

interface EventCardProps {
  event: Event
}

export default async function EventCard({ event }: EventCardProps) {
  const locale = await getLocale()
  const t = await getTranslations("common")
  const showLangNote = shouldShowContentLangNote(locale)
  const start = new Date(event.startAt)
  const end = event.endAt ? new Date(event.endAt) : null

  const dayNumber = start.toLocaleDateString(locale, { day: "numeric" })
  const monthName = start.toLocaleDateString(locale, { month: "short" })
  const fmtTime = (d: Date) =>
    d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12: false })

  // Si l'événement finit un autre jour, on montre la date de fin (corrige B4 :
  // évite de laisser croire que tout se passe le même jour).
  const sameDay =
    end &&
    start.toLocaleDateString(locale) === end.toLocaleDateString(locale)
  const endLabel = end
    ? sameDay
      ? fmtTime(end)
      : `${end.toLocaleDateString(locale, { day: "numeric", month: "short" })} ${fmtTime(end)}`
    : null

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex gap-4 hover:shadow-sm transition-shadow">

      {/* Calendrier mini — flex se retourne automatiquement en RTL */}
      <div className="shrink-0 w-14 text-center">
        <div className="bg-green-700 text-white text-xs font-semibold py-1 rounded-t-lg uppercase">
          {monthName}
        </div>
        <div className="border border-t-0 border-gray-200 rounded-b-lg py-2">
          <span className="text-2xl font-bold text-gray-900">{dayNumber}</span>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 mb-1 leading-snug">
          {event.title}
        </h3>
        {showLangNote && (
          <p className="text-[11px] text-gray-400 mb-1">
            {t("contentInLang", { lang: contentLanguageName(locale) })}
          </p>
        )}
        {event.description && (
          <p className="text-sm text-gray-600 mb-2 leading-relaxed line-clamp-2">
            {event.description}
          </p>
        )}
        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          {/* Heures = données LTR : on force dir=ltr pour éviter l'inversion
              visuelle "21:00 → 19:00" en page arabe (corrige R3). */}
          <span className="inline-flex items-center gap-1">
            <span aria-hidden="true">🕐</span>
            <span dir="ltr">{fmtTime(start)}{endLabel ? ` → ${endLabel}` : ""}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span aria-hidden="true">📍</span>
            <span>{event.location}</span>
          </span>
        </div>
      </div>

    </div>
  )
}
