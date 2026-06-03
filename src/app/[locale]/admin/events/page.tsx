import { getTranslations } from "next-intl/server"
import { getSessionMosque } from "@/lib/auth-helpers"
import { getAllEvents } from "@/db/queries"
import EventForm from "@/components/admin/EventForm"
import EventList from "@/components/admin/EventList"
import NoMosque from "@/components/admin/NoMosque"

export default async function AdminEventsPage() {
  const { mosque, mosqueId } = await getSessionMosque()
  if (!mosque || mosqueId == null) return <NoMosque />

  const t = await getTranslations("admin.eventsPage")
  const allEvents = await getAllEvents(mosqueId)

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
            <EventForm />
          </div>
        </div>

        <div>
          <div className="mb-4">
            <h2 className="font-semibold text-gray-900">
              {t("listTitle", { count: allEvents.length })}
            </h2>
          </div>
          <EventList events={allEvents} />
        </div>
      </div>
    </main>
  )
}
