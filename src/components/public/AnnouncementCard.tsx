import { getLocale, getTranslations } from "next-intl/server"
import { routing } from "@/i18n/routing"
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

export default async function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const locale = await getLocale()
  const t = await getTranslations("common")
  const contentInOtherLang = locale !== routing.defaultLocale

  const dateString = announcement.publishedAt
    ? new Date(announcement.publishedAt).toLocaleDateString(locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className="font-semibold text-gray-900 leading-snug">
          {announcement.title}
        </h3>
        {dateString && (
          <span className="shrink-0 text-xs text-gray-500 mt-0.5" dir="ltr">{dateString}</span>
        )}
      </div>
      {contentInOtherLang && (
        <p className="text-[11px] text-gray-400 mb-2">{t("contentOriginal")}</p>
      )}
      <div className="text-sm text-gray-600">
        <MarkdownContent content={announcement.content} />
      </div>
    </div>
  )
}
