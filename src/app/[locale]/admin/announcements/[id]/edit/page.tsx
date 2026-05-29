import { notFound } from "next/navigation"
import { requireSession } from "@/lib/auth-helpers"
import { getAnnouncementById } from "@/db/queries"
import { Link } from "@/i18n/navigation"
import AnnouncementForm from "@/components/admin/AnnouncementForm"
import NoMosque from "@/components/admin/NoMosque"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditAnnouncementPage({ params }: PageProps) {
  const session = await requireSession()
  const mosqueId = session.user.mosqueId
  if (mosqueId == null) return <NoMosque />

  const { id } = await params
  const announcement = await getAnnouncementById(Number(id), mosqueId)
  if (!announcement) notFound()

  return (
    <main className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-6">
        <Link
          href="/admin/announcements"
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← Retour aux annonces
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Modifier l&apos;annonce</h1>

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
