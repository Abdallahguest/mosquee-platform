"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useErrorMessages } from "@/lib/use-error-messages"
import { deleteMember } from "@/lib/actions/member.actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ConfirmDialog from "@/components/admin/ConfirmDialog"

interface Member {
  id: number
  name: string
  category: string
  role: string | null
  sortOrder: number
}

interface MemberListProps {
  members: Member[]
  onEdit: (member: Member) => void
}

export default function MemberList({ members, onEdit }: MemberListProps) {
  const t = useTranslations("admin.members")
  const { fromResult } = useErrorMessages()
  const [loadingId, setLoadingId] = useState<number | null>(null)
  const [toDelete, setToDelete] = useState<Member | null>(null)

  async function confirmDelete() {
    if (!toDelete) return
    const id = toDelete.id
    setToDelete(null)
    setLoadingId(id)
    const result = await deleteMember(id)
    if (!result.success) alert(fromResult(result))
    setLoadingId(null)
  }

  if (members.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-base mb-1">{t("emptyTitle")}</p>
        <p className="text-sm">{t("emptyBody")}</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-3">
        {members.map((m) => (
          <div
            key={m.id}
            className={`rounded-xl border bg-white p-4 ${loadingId === m.id ? "opacity-50" : ""}`}
          >
            <div className="flex items-start justify-between gap-3 mb-1">
              <p className="font-medium text-sm leading-snug">{m.name}</p>
              <Badge variant="secondary" className="shrink-0">
                {t(`category.${m.category}`)}
              </Badge>
            </div>
            {m.role && <p className="text-xs text-muted-foreground mb-3">{m.role}</p>}

            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => onEdit(m)} disabled={loadingId === m.id}>
                {t("edit")}
              </Button>
            </div>
            <Button
              variant="destructive"
              size="sm"
              className="w-full mt-2"
              onClick={() => setToDelete(m)}
              disabled={loadingId === m.id}
            >
              {t("delete")}
            </Button>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        title={t("deleteTitle")}
        message={t("deleteMessage", { name: toDelete?.name ?? "" })}
        confirmLabel={t("confirmDelete")}
        cancelLabel={t("cancel")}
        destructive
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  )
}
