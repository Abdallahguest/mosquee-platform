"use client"

import { useState } from "react"
import { deleteEvent, toggleEventPublished } from "@/lib/actions/event.actions"
import { Button } from "@/components/ui/button"
import { Badge }  from "@/components/ui/badge"
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table"

interface Event {
  id: number
  title: string
  location: string
  startAt: Date
  isPublished: boolean
}

interface EventListProps {
  events: Event[]
  mosqueId: number
}

export default function EventList({ events, mosqueId }: EventListProps) {
  const [loadingId, setLoadingId] = useState<number | null>(null)

  async function handleDelete(id: number) {
    if (!confirm("Supprimer cet événement ?")) return
    setLoadingId(id)
    await deleteEvent(id, mosqueId)
    setLoadingId(null)
  }

  async function handleToggle(id: number, current: boolean) {
    setLoadingId(id)
    await toggleEventPublished(id, current)
    setLoadingId(null)
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Aucun événement — créez-en un ci-dessus.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead className="hidden sm:table-cell">Date</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow
              key={event.id}
              className={loadingId === event.id ? "opacity-50" : ""}
            >
              <TableCell>
                <div>
                  <p className="font-medium text-sm truncate max-w-[180px]">{event.title}</p>
                  <p className="text-xs text-muted-foreground">📍 {event.location}</p>
                </div>
              </TableCell>

              <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                {new Date(event.startAt).toLocaleDateString("fr-FR", {
                  day: "numeric", month: "short", year: "numeric",
                })}
              </TableCell>

              <TableCell>
                <Badge
                  variant={event.isPublished ? "default" : "secondary"}
                  className={event.isPublished
                    ? "bg-green-100 text-green-700 hover:bg-green-100"
                    : ""
                  }
                >
                  {event.isPublished ? "Publié" : "Brouillon"}
                </Badge>
              </TableCell>

              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggle(event.id, event.isPublished)}
                    disabled={loadingId === event.id}
                  >
                    {event.isPublished ? "Dépublier" : "Publier"}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(event.id)}
                    disabled={loadingId === event.id}
                  >
                    Supprimer
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
