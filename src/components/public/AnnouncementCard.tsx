import { getLocale } from "next-intl/server"
import MarkdownContent from "./MarkdownContent"

interface Announcement {
  id: number
  title: string
  content: string
  publishedAt: Date | null
}

interface AnnouncementCardProps {
  announcement: Announcement
}

// Server Component async : on lit la locale courante pour formater la date
// dans la bonne langue (corrige B2), au lieu de "fr-FR" en dur.
export default async function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const locale = await getLocale()

  const dateString = announcement.publishedAt
    ? new Date(announcement.publishedAt).toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null // page publique : annonces toujours publiées → pas de "Non publié" (corrige B3)

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className="font-semibold text-gray-900 leading-snug">
          {announcement.title}
        </h3>
        {dateString && (
          <span className="shrink-0 text-xs text-gray-500 mt-0.5">{dateString}</span>
        )}
      </div>
      <div className="text-sm text-gray-600">
        <MarkdownContent content={announcement.content} />
      </div>
    </div>
  )
}
