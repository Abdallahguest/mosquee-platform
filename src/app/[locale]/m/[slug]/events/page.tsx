import { getLocale, getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import {
  getMosqueBySlug,
  getUpcomingEventsPaginated,
  getPastEventsPaginated,
} from "@/db/queries"
import { getMosqueName } from "@/lib/mosque-name"
import { Link } from "@/i18n/navigation"
import PublicNav from "@/components/public/PublicNav"
import PublicFooter from "@/components/public/PublicFooter"
import EventCard from "@/components/public/EventCard"
import Pagination from "@/components/public/Pagination"
import BackLink from "@/components/BackLink"

const PER_PAGE = 5

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string; filter?: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const mosque = await getMosqueBySlug(slug)
  if (!mosque) return { title: "Introuvable" }
  const locale = await getLocale()
  const displayName = getMosqueName(mosque, locale)
  const te = await getTranslations("events")
  return { title: `${te("allTitle")} — ${displayName}` }
}

export default async function AllEventsPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { page: pageParam, filter: filterParam } = await searchParams

  const mosque = await getMosqueBySlug(slug)
  if (!mosque) notFound()

  const page = Math.max(1, Number(pageParam) || 1)
  const filter = filterParam === "past" ? "past" : "upcoming"
  const locale = await getLocale()
  const displayName = getMosqueName(mosque, locale)
  const te = await getTranslations("events")
  const tc = await getTranslations("common")

  const { items, total } =
    filter === "past"
      ? await getPastEventsPaginated(mosque.id, page, PER_PAGE)
      : await getUpcomingEventsPaginated(mosque.id, page, PER_PAGE)

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE))

  // Style des onglets
  const tabBase = "text-sm px-3 py-1.5 rounded-full font-medium transition-colors"
  const tabActive = "bg-green-700 text-white"
  const tabIdle = "bg-gray-100 text-gray-600 hover:bg-gray-200"

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <PublicNav mosqueName={displayName} />

      <main className="flex-1">
        <div className="max-w-lg mx-auto px-6 py-6 space-y-6">

          <BackLink href={`/m/${slug}`} label={te("backToMosque")} />

          <h1 className="font-semibold text-gray-900 flex items-center gap-2">
            <span>📅</span> {te("allTitle")}
          </h1>

          {/* Onglets à venir / passés. Repart toujours en page 1 au changement. */}
          <div className="flex gap-2">
            <Link
              href={`/m/${slug}/events`}
              className={`${tabBase} ${filter === "upcoming" ? tabActive : tabIdle}`}
            >
              {te("upcoming")}
            </Link>
            <Link
              href={`/m/${slug}/events?filter=past`}
              className={`${tabBase} ${filter === "past" ? tabActive : tabIdle}`}
            >
              {te("past")}
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>{filter === "past" ? te("noPast") : te("noUpcoming")}</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3">
                {items.map((ev) => (
                  <EventCard key={ev.id} event={ev} slug={slug} />
                ))}
              </div>

              <Pagination
                page={page}
                perPage={PER_PAGE}
                total={total}
                basePath={`/m/${slug}/events`}
                extraParams={filter === "past" ? { filter: "past" } : {}}
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
