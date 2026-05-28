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

export default function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const dateString = announcement.publishedAt 
    ? new Date(announcement.publishedAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Non publié"

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-4 mb-2">
        <h3 className="font-semibold text-gray-900 leading-snug">
          {announcement.title}
        </h3>
        <span className="shrink-0 text-xs text-gray-400 mt-0.5">{dateString}</span>
      </div>
      <div className="text-sm text-gray-600">
        <MarkdownContent content={announcement.content} />
      </div>
    </div>
  )
}
