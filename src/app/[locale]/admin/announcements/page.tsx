import { getTranslations } from "next-intl/server"
import { getSessionMosque } from "@/lib/auth-helpers"
import { getAllAnnouncementsPaginated } from "@/db/queries"
import AnnouncementForm from "@/components/admin/AnnouncementForm"
import AnnouncementList from "@/components/admin/AnnouncementList"
import NoMosque from "@/components/admin/NoMosque"
import { Link } from "@/i18n/navigation"

const PER_PAGE = 20

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function AnnouncementsPage({ searchParams }: PageProps) {
  const { mosque, mosqueId } = await getSessionMosque()
  if (!mosque || mosqueId == null) return <NoMosque />

  const { page: pageParam } = await searchParams
  const page = Math.max(1, Number(pageParam) || 1)

  const t = await getTranslations("admin.announcementsPage")
  const tc = await getTranslations("common")

  const { items: announcements, total } = await getAllAnnouncementsPaginated(mosqueId, page, PER_PAGE)
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  return (
    <main className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("title")}</h1>
        <p className="text-gray-500">{t("subtitle")}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="font-semibold text-gray-900 mb-4">{t("newCardTitle")}</h2>
            <AnnouncementForm />
          </div>
        </div>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">
              {t("listTitle", { count: total })}
            </h2>
          </div>

          <AnnouncementList announcements={announcements} />

          {/* Pagination — affichée seulement si plusieurs pages */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              {page > 1 ? (
                <Link
                  href={{ pathname: "/admin/announcements", query: { page: page - 1 } }}
                  className="text-green-700 hover:underline"
                >
                  ← {tc("previous")}
                </Link>
              ) : <span />}
              <span className="text-gray-500">
                {tc("pageInfo", { page, total: totalPages })}
              </span>
              {page < totalPages ? (
                <Link
                  href={{ pathname: "/admin/announcements", query: { page: page + 1 } }}
                  className="text-green-700 hover:underline"
                >
                  {tc("next")} →
                </Link>
              ) : <span />}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
