interface Event {
  id: number
  title: string
  description: string | null
  location: string
  startAt: Date
  endAt: Date | null
}

interface EventCardProps {
  event: Event
}

export default function EventCard({ event }: EventCardProps) {
  const start = new Date(event.startAt)

  const dayNumber = start.toLocaleDateString("fr-FR", { day: "numeric" })
  const monthName = start.toLocaleDateString("fr-FR", { month: "short" })
  const timeString = start.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
  const endString = event.endAt
    ? new Date(event.endAt).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : null

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex gap-4 hover:shadow-sm transition-shadow">

      {/* Calendrier mini */}
      <div className="shrink-0 w-14 text-center">
        <div className="bg-green-700 text-white text-xs font-semibold py-1 rounded-t-lg uppercase">
          {monthName}
        </div>
        <div className="border border-t-0 border-gray-200 rounded-b-lg py-2">
          <span className="text-2xl font-bold text-gray-900">{dayNumber}</span>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 mb-1 leading-snug">
          {event.title}
        </h3>
        {event.description && (
          <p className="text-sm text-gray-600 mb-2 leading-relaxed line-clamp-2">
            {event.description}
          </p>
        )}
        <div className="flex flex-wrap gap-3 text-xs text-gray-500">
          <span>🕐 {timeString}{endString ? ` → ${endString}` : ""}</span>
          <span>📍 {event.location}</span>
        </div>
      </div>

    </div>
  )
}
