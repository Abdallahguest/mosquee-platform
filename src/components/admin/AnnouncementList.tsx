"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import {
  deleteAnnouncement,
  toggleAnnouncementPublished,
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
  const [loadingId, setLoadingId] = useState<number | null>(null)
  // Élément en attente de confirmation de suppression (anti-ghich : on montre le titre)
  const [toDelete, setToDelete] = useState<Announcement | null>(null)

  async function confirmDelete() {
    if (!toDelete) return
    const id = toDelete.id
    setToDelete(null)
    setLoadingId(id)
    const result = await deleteAnnouncement(id)
    if (!result.success) alert(result.error)
    setLoadingId(null)
  }

  async function handleToggle(id: number, current: boolean) {
    setLoadingId(id)
    const result = await toggleAnnouncementPublished(id, current)
    if (!result.success) alert(result.error)
    setLoadingId(null)
  }

  if (announcements.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-base mb-1">{t("emptyAnnouncementsTitle")}</p>
        <p className="text-sm">{t("emptyAnnouncementsBody")}</p>
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
          {announcements.map((a) => (
            <TableRow
              key={a.id}
              className={loadingId === a.id ? "opacity-50" : ""}
            >
              <TableCell>
                <div>
                  <p className="font-medium text-sm truncate max-w-50">
                    {a.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-1 max-w-50">
                    {a.content}
                  </p>
                </div>
              </TableCell>

              <TableCell className="hidden sm:table-cell text-sm text-muted-foreground" dir="ltr">
                {a.publishedAt
                  ? new Date(a.publishedAt).toLocaleDateString(locale, {
                      day: "numeric",
                      month: "short",
                    })
                  : "—"
                }
              </TableCell>

              <TableCell>
                <Badge
                  variant={a.isPublished ? "default" : "secondary"}
                  className={a.isPublished
                    ? "bg-green-100 text-green-700 hover:bg-green-100"
                    : ""
                  }
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
    </div>
  )
}
