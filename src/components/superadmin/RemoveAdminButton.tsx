"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { removeAdminFromMosque } from "@/lib/actions/superadmin.actions"
import { showToast } from "@/components/ui/toast-provider"
import { Button } from "@/components/ui/button"

export default function RemoveAdminButton({ mosqueId, userId, userName }: { mosqueId: number; userId: string; userName: string }) {
  const router = useRouter()
  const t = useTranslations("superAdmin.components.removeAdmin")
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)

  async function handleRemove() {
    setLoading(true)
    const result = await removeAdminFromMosque(mosqueId, userId)
    setLoading(false)
    if (!result.success) {
      showToast(result.error, "error")
      setConfirm(false)
      return
    }
    router.refresh()
  }

  if (!confirm) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setConfirm(true)} className="text-red-600 hover:text-red-700">
        {t("openButton")}
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-gray-500">{t("confirmText", { name: userName })}</span>
      <Button variant="ghost" size="sm" onClick={handleRemove} disabled={loading} className="text-red-600">
        {loading ? "..." : t("confirmYes")}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setConfirm(false)}>
        {t("confirmNo")}
      </Button>
    </div>
  )
}
