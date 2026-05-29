import { getSessionMosque } from "@/lib/auth-helpers"
import { getAllAnnouncements } from "@/db/queries"
import AnnouncementForm from "@/components/admin/AnnouncementForm"
import AnnouncementList from "@/components/admin/AnnouncementList"
import NoMosque from "@/components/admin/NoMosque"

export default async function AnnouncementsPage() {
  const { mosque, mosqueId } = await getSessionMosque()
  if (!mosque || mosqueId == null) return <NoMosque />

  const announcements = await getAllAnnouncements(mosqueId)

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Gestion des annonces
        </h1>
        <p className="text-gray-500">
          Créez et gérez les annonces de votre mosquée
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              Nouvelle annonce
            </h2>
            <AnnouncementForm />
          </div>
        </div>

        <div>
          <div className="mb-4">
            <h2 className="font-semibold text-gray-900">
              Annonces ({announcements.length})
            </h2>
          </div>
          <AnnouncementList announcements={announcements} />
        </div>
      </div>
    </main>
  )
}
