import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getAllEvents, getAllMosques } from "@/db/queries"
import EventForm from "@/components/admin/EventForm"
import EventList from "@/components/admin/EventList"

export default async function AdminEventsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login")

  const allMosques = await getAllMosques()
  const mosqueId = allMosques.length > 0 ? allMosques[0].id : 1
  const allEvents = await getAllEvents(mosqueId)

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Événements</h1>
        <p className="text-gray-500 text-sm mt-1">
          {allEvents.length} événement{allEvents.length > 1 ? "s" : ""}
        </p>
      </div>

      <EventForm mosqueId={mosqueId} />

      <div className="mt-8">
        <EventList events={allEvents} mosqueId={mosqueId} />
      </div>
    </div>
  )
}
