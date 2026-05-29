import { requireSession } from "@/lib/auth-helpers"
import { getAllEvents } from "@/db/queries"
import EventForm from "@/components/admin/EventForm"
import EventList from "@/components/admin/EventList"
import NoMosque from "@/components/admin/NoMosque"

export default async function AdminEventsPage() {
  const session = await requireSession()
  const mosqueId = session.user.mosqueId
  if (mosqueId == null) return <NoMosque />

  const allEvents = await getAllEvents(mosqueId)

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Événements</h1>
        <p className="text-gray-500 text-sm mt-1">
          {allEvents.length} événement{allEvents.length > 1 ? "s" : ""}
        </p>
      </div>

      <EventForm />

      <div className="mt-8">
        <EventList events={allEvents} />
      </div>
    </div>
  )
}
