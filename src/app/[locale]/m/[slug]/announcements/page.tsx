import { getLocale, getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { getMosqueBySlug, getActiveAnnouncementsPaginated } from "@/db/queries"
import { getMosqueName } from "@/lib/mosque-name"
import PublicNav from "@/components/public/PublicNav"
import PublicFooter from "@/components/public/PublicFooter"
import AnnouncementCard from "@/components/public/AnnouncementCard"
import Pagination from "@/components/public/Pagination"
import BackLink from "@/components/BackLink"

const PER_PAGE = 5

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const mosque = await getMosqueBySlug(slug)
  if (!mosque) return { title: "Introuvable" }
  const locale = await getLocale()
  const displayName = getMosqueName(mosque, locale)
  const ta = await getTranslations("announcements")
  return { title: `${ta("allTitle")} — ${displayName}` }
}

export default async function AllAnnouncementsPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { page: pageParam } = await searchParams

  const mosque = await getMosqueBySlug(slug)
  if (!mosque) notFound()

  const page = Math.max(1, Number(pageParam) || 1)
  const locale = await getLocale()
  const displayName = getMosqueName(mosque, locale)
  const ta = await getTranslations("announcements")
  const tc = await getTranslations("common")

  const { items, total } = await getActiveAnnouncementsPaginated(mosque.id, page, PER_PAGE)

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicNav mosqueName={displayName} />

      <main className="flex-1">
        <div className="max-w-lg mx-auto px-6 py-6 space-y-6">

          <BackLink href={`/m/${slug}`} label={ta("backToMosque")} />

          <h1 className="font-semibold text-gray-900 flex items-center gap-2">
            <span>📢</span> {ta("allTitle")}
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-normal">
              {total}
            </span>
          </h1>

          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>{tc("noContent")}</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                {items.map((a) => (
                  <AnnouncementCard key={a.id} announcement={a} slug={slug} />
                ))}
              </div>

              <Pagination
                page={page}
                perPage={PER_PAGE}
                total={total}
                basePath={`/m/${slug}/announcements`}
                labels={{
                  previous: tc("previous"),
                  next: tc("next"),
                  pageInfo: tc("pageInfo", { page, total: totalPages }),
                }}
              />
            </>
          )}

        </div>
      </main>

      <PublicFooter mosque={mosque} displayName={displayName} />
    </div>
  )
}
