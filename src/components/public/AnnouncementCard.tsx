import { getLocale, getTranslations } from "next-intl/server"
import { contentLanguageName, shouldShowContentLangNote } from "@/lib/content-language"
import { Link } from "@/i18n/navigation"
import MarkdownContent from "./MarkdownContent"

interface Announcement {
  id: number
  title: string
  content: string
  publishedAt: Date | null
}

interface AnnouncementCardProps {
  announcement: Announcement
  slug: string
}

export default async function AnnouncementCard({ announcement, slug }: AnnouncementCardProps) {
  const locale = await getLocale()
  const t = await getTranslations("common")
  const ta = await getTranslations("announcements")
  const showLangNote = shouldShowContentLangNote(locale)

  const href = `/m/${slug}/announcements/${announcement.id}`

  const dateString = announcement.publishedAt
    ? new Date(announcement.publishedAt).toLocaleDateString(locale, {
        day: "numeric", month: "long", year: "numeric",
      })
    : null

  return (
    // relative : permet au lien "étiré" de couvrir toute la carte sans
    // envelopper le contenu Markdown (éviterait un lien-dans-lien invalide).
    <div className="relative bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className="font-semibold text-gray-900 leading-snug">
          {/* Lien étiré : couvre la carte (focus:relative pour rester visible au clavier) */}
          <Link href={href} className="after:absolute after:inset-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded">
            {announcement.title}
          </Link>
        </h3>
        {dateString && (
          <span className="shrink-0 text-xs text-gray-500 mt-0.5" dir="ltr">{dateString}</span>
        )}
      </div>
      {showLangNote && (
        <p className="text-[11px] text-gray-400 mb-2">
          {t("contentInLang", { lang: contentLanguageName(locale) })}
        </p>
      )}
      {/* line-clamp-3 : aperçu tronqué. Le détail complet est sur la page dédiée. */}
      <div className="text-sm text-gray-600 line-clamp-3">
        <MarkdownContent content={announcement.content} />
      </div>
      {/* Lien explicite "Lire la suite" — relative z-10 pour passer AU-DESSUS
          du lien étiré (sinon le clic serait capté par la zone de fond). */}
      <Link
        href={href}
        className="relative z-10 inline-flex items-center mt-3 text-sm font-medium text-green-700 hover:text-green-800"
      >
        {ta("readMore")}
        <span aria-hidden="true" className="rtl:hidden">&nbsp;→</span>
        <span aria-hidden="true" className="hidden rtl:inline">&nbsp;←</span>
      </Link>
    </div>
  )
}
