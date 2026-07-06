import { getLocale, getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { getMosqueBySlug } from "@/db/queries"
import { getMosqueName } from "@/lib/mosque-name"
import { getActiveAnnouncements } from "@/db/queries"
import { getUpcomingEvents } from "@/db/queries"
import { hasPastEvents } from "@/db/queries"
import { Link } from "@/i18n/navigation"
import PublicNav from "@/components/public/PublicNav"
import PrayerSchedule from "@/components/public/PrayerSchedule"
import AnnouncementCard from "@/components/public/AnnouncementCard"
import EventCard from "@/components/public/EventCard"
import PublicFooter from "@/components/public/PublicFooter"
import OfflineCacheRecorder from "@/components/public/OfflineCacheRecorder"
import { computeSubscriptionStatus } from "@/lib/subscription-status"

interface PageProps {
  params: Promise<{ locale: string; slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params
  const mosque = await getMosqueBySlug(slug)
  if (!mosque) return { title: "Mosquée introuvable" }
  const displayName = getMosqueName(mosque, locale)
  return {
    title: `${displayName} — Horaires de prière`,
    description: `Horaires de prière, annonces et événements de ${displayName} à ${mosque.city}.`,
  }
}

export default async function MosquePublicPage({ params }: PageProps) {
  const { slug } = await params

  const mosque = await getMosqueBySlug(slug)
  if (!mosque) notFound()

  const ta = await getTranslations("announcements")
  const te = await getTranslations("events")
  const tc = await getTranslations("common")
  const locale = await getLocale()
  const displayName = getMosqueName(mosque, locale)

  const [activeAnnouncements, upcomingEvents, pastEventsExist] = await Promise.all([
    getActiveAnnouncements(mosque.id),
    getUpcomingEvents(mosque.id),
    hasPastEvents(mosque.id),
  ])

  const schedule = {
    fajrAdhan:    mosque.fajrAdhan,    fajrIqama:    mosque.fajrIqama,
    dhuhrAdhan:   mosque.dhuhrAdhan,   dhuhrIqama:   mosque.dhuhrIqama,
    asrAdhan:     mosque.asrAdhan,     asrIqama:     mosque.asrIqama,
    maghribAdhan: mosque.maghribAdhan, maghribIqama: mosque.maghribIqama,
    ishaAdhan:    mosque.ishaAdhan,    ishaIqama:    mosque.ishaIqama,
    jumuaAdhan:   mosque.jumuaAdhan,   jumuaIqama:   mosque.jumuaIqama,
    timezone:     mosque.timezone,
  }

  // Instantané des horaires pour le cache hors-ligne (sans le fuseau).
  const offlineSchedule = {
    fajrAdhan:    mosque.fajrAdhan,    fajrIqama:    mosque.fajrIqama,
    dhuhrAdhan:   mosque.dhuhrAdhan,   dhuhrIqama:   mosque.dhuhrIqama,
    asrAdhan:     mosque.asrAdhan,     asrIqama:     mosque.asrIqama,
    maghribAdhan: mosque.maghribAdhan, maghribIqama: mosque.maghribIqama,
    ishaAdhan:    mosque.ishaAdhan,    ishaIqama:    mosque.ishaIqama,
    jumuaAdhan:   mosque.jumuaAdhan,   jumuaIqama:   mosque.jumuaIqama,
  }

  const today = new Date().toLocaleDateString(locale, {
    weekday: "long", day: "numeric", month: "long", timeZone: mosque.timezone,
  })

  // Les listes d'accueil sont plafonnées (LIMIT 5 côté requête). On propose
  // toujours un lien "voir tout" dès qu'une section a du contenu : il mène à la
  // page dédiée (annonces complètes / événements à venir ET archive des passés).
  // C'est notamment le seul accès du public aux événements passés.

  const subscriptionStatus = computeSubscriptionStatus(mosque)
  const isDataStale = subscriptionStatus === "expired" || subscriptionStatus === "suspended"

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* Bandeau discret données périmées — anti-gharar */}
      {isDataStale && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center">
          <p className="text-xs text-amber-700">
            ⚠️ Les informations de cette mosquée sont susceptibles de ne plus être à jour.
          </p>
        </div>
      )}
      {/* Enregistre les données pour la consultation hors connexion (invisible). */}
      <OfflineCacheRecorder
        slug={slug}
        name={displayName}
        city={mosque.city}
        schedule={offlineSchedule}
        announcements={activeAnnouncements.map((a) => ({
          id: a.id,
          title: a.title,
          publishedAt: a.publishedAt ? new Date(a.publishedAt).toISOString() : null,
        }))}
        events={upcomingEvents.map((ev) => ({
          id: ev.id,
          title: ev.title,
          startAt: new Date(ev.startAt).toISOString(),
          location: ev.location ?? null,
        }))}
      />

      <PublicNav mosqueName={displayName} />

      <main className="flex-1">
        <div className="max-w-lg mx-auto px-6 py-6 space-y-8">

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              {[mosque.city, mosque.commune, mosque.quartier, mosque.secteur].filter(Boolean).join(", ")}
              {[mosque.city, mosque.commune, mosque.quartier, mosque.secteur].filter(Boolean).length > 0 ? ", " : ""}
              {mosque.country}
            </p>
            {mosque.isVerified && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                ✓ {tc("verified")}
              </span>
            )}
          </div>

          <p className="text-sm text-gray-500 capitalize text-center">{today}</p>

          {mosque.welcomeMessage && (
            <p className="text-sm text-gray-700 text-center bg-green-50 border border-green-100 rounded-xl px-4 py-3 whitespace-pre-line">
              {mosque.welcomeMessage}
            </p>
          )}

          <section>
            <PrayerSchedule schedule={schedule} />
          </section>

          {activeAnnouncements.length > 0 && (
            <section>
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>📢</span> {ta("title")}
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-normal">
                  {activeAnnouncements.length}
                </span>
              </h2>
              <div className="flex flex-col gap-3">
                {activeAnnouncements.map((a) => (
                  <AnnouncementCard key={a.id} announcement={a} slug={slug} />
                ))}
              </div>
              {activeAnnouncements.length > 0 && (
                <Link
                  href={`/m/${slug}/announcements`}
                  className="inline-flex items-center mt-3 text-sm font-medium text-green-700 hover:text-green-800"
                >
                  {ta("seeAll")}
                  <span aria-hidden="true" className="rtl:hidden">&nbsp;→</span>
                  <span aria-hidden="true" className="hidden rtl:inline">&nbsp;←</span>
                </Link>
              )}
            </section>
          )}

          {(upcomingEvents.length > 0 || pastEventsExist) && (
            <section>
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>📅</span> {te("title")}
                {upcomingEvents.length > 0 && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-normal">
                    {upcomingEvents.length}
                  </span>
                )}
              </h2>

              {upcomingEvents.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {upcomingEvents.map((ev) => (
                    <EventCard key={ev.id} event={ev} slug={slug} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">{te("noUpcoming")}</p>
              )}

              <Link
                href={`/m/${slug}/events`}
                className="inline-flex items-center mt-3 text-sm font-medium text-green-700 hover:text-green-800"
              >
                {te("seeAll")}
                <span aria-hidden="true" className="rtl:hidden">&nbsp;→</span>
                <span aria-hidden="true" className="hidden rtl:inline">&nbsp;←</span>
              </Link>
            </section>
          )}

          {activeAnnouncements.length === 0 && upcomingEvents.length === 0 && !pastEventsExist && (
            <div className="text-center py-8 text-gray-400">
              <p>{tc("noContent")}</p>
            </div>
          )}

        </div>
      </main>

      <PublicFooter mosque={mosque} displayName={displayName} />
    </div>
  )
}
