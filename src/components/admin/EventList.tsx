"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useErrorMessages } from "@/lib/use-error-messages"
import { deleteEvent, toggleEventPublished } from "@/lib/actions/event.actions"
import { showToast } from "@/components/ui/toast-provider"
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
  const { fromResult } = useErrorMessages()
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [toDelete, setToDelete] = useState<Event | null>(null)

  async function confirmDelete() {
    if (!toDelete) return
    const id = toDelete.id
    setToDelete(null)
    setLoadingId(id)
    const result = await deleteEvent(id)
    if (!result.success) showToast(fromResult(result), "error")
    setLoadingId(null)
  }

  async function handleToggle(id: number, current: boolean) {
    setLoadingId(id)
    const result = await toggleEventPublished(id, current)
    if (!result.success) showToast(fromResult(result), "error")
    setLoadingId(null)
  }

  const Spinner = () => (
    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )

  const fmtDate = (d: Date) =>
    new Date(d).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <div className="text-5xl mb-4" aria-hidden="true">📅</div>
        <p className="text-base font-medium text-gray-700 mb-1">{t("emptyEvents")}</p>
      </div>
    )
  }

  return (
    <>
      {/* ───────── Version MOBILE : cartes empilées ───────── */}
      <div className="sm:hidden space-y-3">
        {events.map((event) => (
          <div
            key={event.id}
            className={`rounded-xl border bg-white p-4 ${loadingId === event.id ? "opacity-50" : ""}`}
          >
            <div className="flex items-start justify-between gap-3 mb-1">
              <p className="font-medium text-sm leading-snug">{event.title}</p>
              <Badge
                variant={event.isPublished ? "default" : "secondary"}
                className={event.isPublished ? "bg-green-100 text-green-700 hover:bg-green-100 shrink-0" : "shrink-0"}
              >
                {event.isPublished ? t("statusPublished") : t("statusDraft")}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-1">
              <span aria-hidden="true">📍</span> {event.location}
            </p>
            <p className="text-xs text-muted-foreground mb-3" dir="ltr">{fmtDate(event.startAt)}</p>

            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href={`/admin/events/${event.id}/edit`}>{t("edit")}</Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleToggle(event.id, event.isPublished)}
                disabled={loadingId === event.id}
              >
                {loadingId === event.id ? <Spinner /> : (event.isPublished ? t("unpublish") : t("publish"))}
              </Button>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="w-full mt-2"
              onClick={() => setToDelete(event)}
              disabled={loadingId === event.id}
            >
              {t("delete")}
            </Button>
          </div>
        ))}
      </div>

      {/* ───────── Version DESKTOP : tableau ───────── */}
      <div className="hidden sm:block rounded-xl border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("colTitle")}</TableHead>
              <TableHead>{t("colDate")}</TableHead>
              <TableHead>{t("colStatus")}</TableHead>
              <TableHead className="text-end">{t("colActions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {events.map((event) => (
              <TableRow key={event.id} className={loadingId === event.id ? "opacity-50" : ""}>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm truncate max-w-45">{event.title}</p>
                    <p className="text-xs text-muted-foreground">
                      <span aria-hidden="true">📍</span> {event.location}
                    </p>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground" dir="ltr">
                  {fmtDate(event.startAt)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={event.isPublished ? "default" : "secondary"}
                    className={event.isPublished ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
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
                      {loadingId === event.id ? <Spinner /> : (event.isPublished ? t("unpublish") : t("publish"))}
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
      </div>

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
    </>
  )
}
