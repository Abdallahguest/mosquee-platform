import { getLocale, getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { getMosqueBySlug, getPublicEvent } from "@/db/queries"
import { contentLanguageName, shouldShowContentLangNote } from "@/lib/content-language"
import PublicNav from "@/components/public/PublicNav"
import PublicFooter from "@/components/public/PublicFooter"
import BackLink from "@/components/BackLink"
import { getMosqueName } from "@/lib/mosque-name"

interface PageProps {
  params: Promise<{ slug: string; id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug, id } = await params
  const mosque = await getMosqueBySlug(slug)
  if (!mosque) return { title: "Introuvable" }
  const event = await getPublicEvent(Number(id), mosque.id)
  if (!event) return { title: "Introuvable" }
  return {
    title: `${event.title} — ${mosque.name}`,
    description: event.description?.slice(0, 150) ?? event.title,
  }
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug, id } = await params

  const mosque = await getMosqueBySlug(slug)
  if (!mosque) notFound()

  // Sécurité : exige un événement PUBLIÉ de CETTE mosquée, sinon notFound().
  const event = await getPublicEvent(Number(id), mosque.id)
  if (!event) notFound()

  const locale = await getLocale()
  const displayName = getMosqueName(mosque, locale)
  const te = await getTranslations("events")
  const tc = await getTranslations("common")
  const showLangNote = shouldShowContentLangNote(locale)

  const start = new Date(event.startAt)
  const end = event.endAt ? new Date(event.endAt) : null

  const fullDate = (d: Date) =>
    d.toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" })
  const fmtTime = (d: Date) =>
    d.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit", hour12: false })

  const sameDay = end && start.toLocaleDateString(locale) === end.toLocaleDateString(locale)

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicNav mosqueName={displayName} />

      <main className="flex-1">
        <div className="max-w-lg mx-auto px-6 py-6 space-y-6">

          <BackLink href={`/m/${slug}`} label={te("backToMosque")} />

          <article className="bg-white border border-gray-200 rounded-xl p-6">
            <h1 className="text-xl font-bold text-gray-900 leading-snug mb-3">
              {event.title}
            </h1>

            {showLangNote && (
              <p className="text-[11px] text-gray-400 mb-3">
                {tc("contentInLang", { lang: contentLanguageName(locale) })}
              </p>
            )}

            {/* Date + heures */}
            <div className="space-y-1.5 text-sm text-gray-700 mb-4">
              <p className="flex items-start gap-2">
                <span aria-hidden="true">📅</span>
                <span className="capitalize">{fullDate(start)}</span>
              </p>
              <p className="flex items-center gap-2">
                <span aria-hidden="true">🕐</span>
                <span dir="ltr">
                  {fmtTime(start)}
                  {end ? (sameDay ? ` → ${fmtTime(end)}` : ` → ${fullDate(end)} ${fmtTime(end)}`) : ""}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <span aria-hidden="true">📍</span>
                <span>{event.location}</span>
              </p>
            </div>

            {event.description && (
              <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line border-t border-gray-100 pt-4">
                {event.description}
              </div>
            )}
          </article>

        </div>
      </main>

      <PublicFooter mosque={mosque} displayName={displayName} />
    </div>
  )
}
