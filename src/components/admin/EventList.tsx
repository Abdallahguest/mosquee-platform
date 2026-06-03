"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { deleteEvent, toggleEventPublished } from "@/lib/actions/event.actions"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Badge }  from "@/components/ui/badge"
import ConfirmDialog from "@/components/admin/ConfirmDialog"
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
}

export default function EventList({ events }: EventListProps) {
  const t = useTranslations("admin.list")
  const locale = useLocale()
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [toDelete, setToDelete] = useState<Event | null>(null)

  async function confirmDelete() {
    if (!toDelete) return
    const id = toDelete.id
    setToDelete(null)
    setLoadingId(id)
    await deleteEvent(id)
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
        <p>{t("emptyEvents")}</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("colTitle")}</TableHead>
            <TableHead className="hidden sm:table-cell">{t("colDate")}</TableHead>
            <TableHead>{t("colStatus")}</TableHead>
            <TableHead className="text-end">{t("colActions")}</TableHead>
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
                  <p className="font-medium text-sm truncate max-w-45">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    <span aria-hidden="true">📍</span> {event.location}
                  </p>
                </div>
              </TableCell>

              <TableCell className="hidden sm:table-cell text-sm text-muted-foreground" dir="ltr">
                {new Date(event.startAt).toLocaleDateString(locale, {
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
                  {event.isPublished ? t("statusPublished") : t("statusDraft")}
                </Badge>
              </TableCell>

              <TableCell className="text-end">
                <div className="flex justify-end gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/events/${event.id}/edit`}>{t("edit")}</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggle(event.id, event.isPublished)}
                    disabled={loadingId === event.id}
                  >
                    {event.isPublished ? t("unpublish") : t("publish")}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setToDelete(event)}
                    disabled={loadingId === event.id}
                  >
                    {t("delete")}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ConfirmDialog
        open={toDelete !== null}
        title={t("deleteEventTitle")}
        message={t("deleteEventMessage", { title: toDelete?.title ?? "" })}
        confirmLabel={t("confirmDelete")}
        cancelLabel={t("cancel")}
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
