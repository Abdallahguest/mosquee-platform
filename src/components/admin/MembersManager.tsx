"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import MemberForm from "@/components/admin/MemberForm"
import MemberList from "@/components/admin/MemberList"

interface Member {
  id: number
  name: string
  category: string
  role: string | null
  sortOrder: number
}

export default function MembersManager({ members }: { members: Member[] }) {
  const t = useTranslations("admin.members")
  const router = useRouter()
  const [editing, setEditing] = useState<Member | null>(null)

  // Après création/édition réussie : rafraîchir les données serveur et sortir du mode édition.
  function handleSaved() {
    setEditing(null)
    router.refresh()
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div>
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="font-semibold text-gray-900 mb-4">
            {editing ? t("editCardTitle") : t("newCardTitle")}
          </h2>
          <MemberForm
            editing={editing}
            onSaved={handleSaved}
            onCancelEdit={() => setEditing(null)}
          />
        </div>
      </div>

      <div>
        <div className="mb-4">
          <h2 className="font-semibold text-gray-900">
            {t("listTitle", { count: members.length })}
          </h2>
        </div>
        <MemberList members={members} onEdit={setEditing} />
      </div>
    </div>
  )
}
