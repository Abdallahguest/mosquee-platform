import { getLocale, getTranslations } from "next-intl/server"
import { contentLanguageName, shouldShowContentLangNote } from "@/lib/content-language"
import { Link } from "@/i18n/navigation"

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
  slug: string
}

export default async function EventCard({ event, slug }: EventCardProps) {
  const locale = await getLocale()
  const t = await getTranslations("common")
  const te = await getTranslations("events")
  const showLangNote = shouldShowContentLangNote(locale)
  const start = new Date(event.startAt)
  const end = event.endAt ? new Date(event.endAt) : null

  const href = `/m/${slug}/events/${event.id}`

  const dayNumber = start.toLocaleDateString(locale, { day: "numeric" })
  const monthName = start.toLocaleDateString(locale, { month: "short" })
  const fmtTime = (d: Date) =>
    d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12: false })

  const sameDay = end && start.toLocaleDateString(locale) === end.toLocaleDateString(locale)
  const endLabel = end
    ? sameDay ? fmtTime(end) : `${end.toLocaleDateString(locale, { day: "numeric", month: "short" })} ${fmtTime(end)}`
    : null

  return (
    <div className="relative bg-white border border-gray-200 rounded-xl p-5 flex gap-4 hover:shadow-sm transition-shadow">

      {/* Calendrier mini */}
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
          <Link href={href} className="after:absolute after:inset-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded">
            {event.title}
          </Link>
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
          <span className="inline-flex items-center gap-1">
            <span aria-hidden="true">🕐</span>
            <span dir="ltr">{fmtTime(start)}{endLabel ? ` → ${endLabel}` : ""}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span aria-hidden="true">📍</span>
            <span>{event.location}</span>
          </span>
        </div>
        <Link
          href={href}
          className="relative z-10 inline-flex items-center mt-2 text-sm font-medium text-green-700 hover:text-green-800"
        >
          {te("readMore")}
          <span aria-hidden="true" className="rtl:hidden">&nbsp;→</span>
          <span aria-hidden="true" className="hidden rtl:inline">&nbsp;←</span>
        </Link>
      </div>

    </div>
  )
}
