import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { getSessionMosque } from "@/lib/auth-helpers"
import { getAnnouncementById } from "@/db/queries"
import { Link } from "@/i18n/navigation"
import AnnouncementForm from "@/components/admin/AnnouncementForm"
import NoMosque from "@/components/admin/NoMosque"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditAnnouncementPage({ params }: PageProps) {
  const { mosque, mosqueId } = await getSessionMosque()
  if (!mosque || mosqueId == null) return <NoMosque />

  const t = await getTranslations("admin.edit")
  const { id } = await params
  const announcement = await getAnnouncementById(Number(id), mosqueId)
  if (!announcement) notFound()

  return (
    <main className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-6">
        <Link
          href="/admin/announcements"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <span aria-hidden="true" className="rtl:hidden">← </span>{t("backToAnnouncements")}<span aria-hidden="true" className="hidden rtl:inline"> →</span>
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("editAnnouncementTitle")}</h1>

      <AnnouncementForm
        announcement={{
          id: announcement.id,
          title: announcement.title,
          content: announcement.content,
          isPublished: announcement.isPublished,
        }}
      />
    </main>
  )
}
