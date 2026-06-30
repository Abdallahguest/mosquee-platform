"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useErrorMessages } from "@/lib/use-error-messages"
import {
  deleteAnnouncement,
  toggleAnnouncementPublished,
  toggleAnnouncementPinned,
} from "@/lib/actions/announcement.actions"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Badge }  from "@/components/ui/badge"
import ConfirmDialog from "@/components/admin/ConfirmDialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Announcement {
  id: number
  title: string
  content: string
  isPublished: boolean
  isPinned: boolean
  publishedAt: Date | null
  expiresAt: Date | null
  createdAt: Date
}

interface AnnouncementListProps {
  announcements: Announcement[]
}

export default function AnnouncementList({
  announcements,
}: AnnouncementListProps) {
  const t = useTranslations("admin.list")
  const locale = useLocale()
  const { fromResult } = useErrorMessages()
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [toDelete, setToDelete] = useState<Announcement | null>(null)

  async function confirmDelete() {
    if (!toDelete) return
    const id = toDelete.id
    setToDelete(null)
    setLoadingId(id)
    const result = await deleteAnnouncement(id)
    if (!result.success) alert(fromResult(result))
    setLoadingId(null)
  }

  async function handleToggle(id: number, current: boolean) {
    setLoadingId(id)
    const result = await toggleAnnouncementPublished(id, current)
    if (!result.success) alert(fromResult(result))
    setLoadingId(null)
  }

  async function handlePin(id: number, current: boolean) {
    setLoadingId(id)
    const result = await toggleAnnouncementPinned(id, current)
    if (!result.success) alert(fromResult(result))
    setLoadingId(null)
  }

  // Spinner SVG inline léger — pas de dépendance externe
  const Spinner = () => (
    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )

  const fmtDate = (d: Date | null) =>
    d ? new Date(d).toLocaleDateString(locale, { day: "numeric", month: "short" }) : "—"

  if (announcements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <div className="text-5xl mb-4" aria-hidden="true">📢</div>
        <p className="text-base font-medium text-gray-700 mb-1">{t("emptyAnnouncementsTitle")}</p>
        <p className="text-sm text-muted-foreground max-w-xs">{t("emptyAnnouncementsBody")}</p>
      </div>
    )
  }

  return (
    <>
      {/* ───────── Version MOBILE : cartes empilées ───────── */}
      <div className="sm:hidden space-y-3">
        {announcements.map((a) => (
          <div
            key={a.id}
            className={`rounded-xl border bg-white p-4 ${a.isPinned ? "border-green-300 bg-green-50/40" : ""} ${loadingId === a.id ? "opacity-50" : ""}`}
          >
            <div className="flex items-start justify-between gap-3 mb-1">
              <p className="font-medium text-sm leading-snug">
                {a.isPinned && <span aria-hidden="true" className="me-1">📌</span>}
                {a.title}
              </p>
              <Badge
                variant={a.isPublished ? "default" : "secondary"}
                className={a.isPublished ? "bg-green-100 text-green-700 hover:bg-green-100 shrink-0" : "shrink-0"}
              >
                {a.isPublished ? t("statusPublished") : t("statusDraft")}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{a.content}</p>
            <p className="text-xs text-muted-foreground mb-3" dir="ltr">{fmtDate(a.publishedAt)}</p>

            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" className="flex-1">
                <Link href={`/admin/announcements/${a.id}/edit`}>{t("edit")}</Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleToggle(a.id, a.isPublished)}
                disabled={loadingId === a.id}
              >
                {loadingId === a.id ? <Spinner /> : (a.isPublished ? t("unpublish") : t("publish"))}
              </Button>
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handlePin(a.id, a.isPinned)}
                disabled={loadingId === a.id}
              >
                {loadingId === a.id ? <Spinner /> : (a.isPinned ? t("unpin") : t("pin"))}
              </Button>
            </div>
            {/* Supprimer séparé en dessous (anti-ghich) */}
            <Button
              variant="destructive"
              size="sm"
              className="w-full mt-2"
              onClick={() => setToDelete(a)}
              disabled={loadingId === a.id}
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
            {announcements.map((a) => (
              <TableRow
                key={a.id}
                className={`${a.isPinned ? "bg-green-50/40" : ""} ${loadingId === a.id ? "opacity-50" : ""}`}
              >
                <TableCell>
                  <div>
                    <p className="font-medium text-sm truncate max-w-50">
                      {a.isPinned && <span aria-hidden="true" className="me-1">📌</span>}
                      {a.title}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-1 max-w-50">{a.content}</p>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground" dir="ltr">
                  {fmtDate(a.publishedAt)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={a.isPublished ? "default" : "secondary"}
                    className={a.isPublished ? "bg-green-100 text-green-700 hover:bg-green-100" : ""}
                  >
                    {a.isPublished ? t("statusPublished") : t("statusDraft")}
                  </Badge>
                </TableCell>
                <TableCell className="text-end">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/announcements/${a.id}/edit`}>{t("edit")}</Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePin(a.id, a.isPinned)}
                      disabled={loadingId === a.id}
                    >
                      {a.isPinned ? t("unpin") : t("pin")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggle(a.id, a.isPublished)}
                      disabled={loadingId === a.id}
                    >
                      {a.isPublished ? t("unpublish") : t("publish")}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setToDelete(a)}
                      disabled={loadingId === a.id}
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
        title={t("deleteAnnouncementTitle")}
        message={t("deleteAnnouncementMessage", { title: toDelete?.title ?? "" })}
        confirmLabel={t("confirmDelete")}
        cancelLabel={t("cancel")}
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  )
}
