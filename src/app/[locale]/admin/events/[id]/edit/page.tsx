import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { getSessionMosque } from "@/lib/auth-helpers"
import { getEventById } from "@/db/queries"
import { Link } from "@/i18n/navigation"
import EventForm from "@/components/admin/EventForm"
import NoMosque from "@/components/admin/NoMosque"

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
        <Link
          href="/admin/events"
          className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
        >
          <span aria-hidden="true" className="rtl:hidden">← </span>{t("backToEvents")}<span aria-hidden="true" className="hidden rtl:inline"> →</span>
        </Link>
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
        }}
      />
    </main>
  )
}
