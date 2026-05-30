import { getTranslations } from "next-intl/server"
import { notFound } from "next/navigation"
import { getMosqueBySlug } from "@/db/queries"
import { getActiveAnnouncements } from "@/db/queries"
import { getUpcomingEvents } from "@/db/queries"
import { getDailyPrayerTimes } from "@/lib/prayer-times"
import PublicNav from "@/components/public/PublicNav"
import PrayerSchedule from "@/components/public/PrayerSchedule"
import AnnouncementCard from "@/components/public/AnnouncementCard"
import EventCard from "@/components/public/EventCard"
import PublicFooter from "@/components/public/PublicFooter"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const mosque = await getMosqueBySlug(slug)
  if (!mosque) return { title: "Mosquée introuvable" }
  return {
    title: `${mosque.name} — Horaires de prière`,
    description: `Horaires de prière, annonces et événements de ${mosque.name} à ${mosque.city}.`,
  }
}

export default async function MosquePublicPage({ params }: PageProps) {
  const { slug } = await params

  const mosque = await getMosqueBySlug(slug)
  if (!mosque) notFound()

  const t  = await getTranslations("prayer")
  const ta = await getTranslations("announcements")
  const te = await getTranslations("events")
  const tc = await getTranslations("common")

  const [activeAnnouncements, upcomingEvents] = await Promise.all([
    getActiveAnnouncements(mosque.id),
    getUpcomingEvents(mosque.id),
  ])

  const adjustments = {
    adjust: {
      Fajr:    mosque.adjustFajr,
      Dhuhr:   mosque.adjustDhuhr,
      Asr:     mosque.adjustAsr,
      Maghrib: mosque.adjustMaghrib,
      Isha:    mosque.adjustIsha,
    },
    iqama: {
      Fajr:    mosque.iqamaFajr,
      Dhuhr:   mosque.iqamaDhuhr,
      Asr:     mosque.iqamaAsr,
      Maghrib: mosque.iqamaMaghrib,
      Isha:    mosque.iqamaIsha,
    },
  }

  const { prayers, nextPrayer } = getDailyPrayerTimes(
    mosque.latitude,
    mosque.longitude,
    mosque.timezone,
    mosque.calculationMethod,
    new Date(),
    adjustments
  )

  const today = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* Navbar verte */}
      <PublicNav mosqueName={mosque.name} />

      <main className="flex-1">
        <div className="max-w-lg mx-auto px-6 py-6 space-y-8">

          {/* Ville + badge vérifiée */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">{mosque.city}, {mosque.country}</p>
            {mosque.isVerified && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                ✓ {tc("verified")}
              </span>
            )}
          </div>

          {/* Date du jour */}
          <p className="text-sm text-gray-500 capitalize text-center">{today}</p>

          {/* Horaires */}
          <section>
            <PrayerSchedule prayers={prayers} nextPrayer={nextPrayer} />
            <p className="text-center text-xs text-gray-400 mt-3">
              {t("method", { method: mosque.calculationMethod })} · {mosque.timezone}
            </p>
          </section>

          {/* Annonces */}
          {activeAnnouncements.length > 0 && (
            <section>
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>📢</span> {ta("title")}
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-normal">
                  {activeAnnouncements.length}
                </span>
              </h2>
              <div className="flex flex-col gap-3">
                {activeAnnouncements.map((announcement) => (
                  <AnnouncementCard key={announcement.id} announcement={announcement} />
                ))}
              </div>
            </section>
          )}

          {/* Événements */}
          {upcomingEvents.length > 0 && (
            <section>
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>📅</span> {te("title")}
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-normal">
                  {upcomingEvents.length}
                </span>
              </h2>
              <div className="flex flex-col gap-3">
                {upcomingEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            </section>
          )}

          {/* Aucun contenu */}
          {activeAnnouncements.length === 0 && upcomingEvents.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              <p>{tc("noContent")}</p>
            </div>
          )}

        </div>
      </main>

      {/* Footer pleine largeur, collé en bas */}
      <PublicFooter mosque={mosque} />
    </div>
  )
}
