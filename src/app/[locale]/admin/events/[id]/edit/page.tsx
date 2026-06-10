import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { getSessionMosque } from "@/lib/auth-helpers"
import { getEventById } from "@/db/queries"
import EventForm from "@/components/admin/EventForm"
import NoMosque from "@/components/admin/NoMosque"
import BackLink from "@/components/BackLink"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditEventPage({ params }: PageProps) {
  const { mosque, mosqueId } = await getSessionMosque()
  if (!mosque || mosqueId == null) return <NoMosque />

  const t = await getTranslations("admin.edit")
  const { id } = await params
  const event = await getEventById(Number(id), mosqueId)
  if (!event) notFound()

  return (
    <main className="max-w-2xl mx-auto px-6 py-8">
      <div className="mb-6">
        <BackLink href="/admin/events" label={t("backToEvents")} />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t("editEventTitle")}</h1>

      <EventForm
        event={{
          id: event.id,
          title: event.title,
          description: event.description,
          location: event.location,
          startAt: event.startAt,
          endAt: event.endAt,
          isPublished: event.isPublished,
          audioUrl: event.audioUrl,
        }}
      />
    </main>
  )
}
