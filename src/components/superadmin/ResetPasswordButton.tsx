"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { resetUserPassword } from "@/lib/actions/superadmin.actions"
import { showToast } from "@/components/ui/toast-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ResetPasswordButton({ userId }: { userId: string }) {
  const router = useRouter()
  const t = useTranslations("superAdmin.components.resetPassword")
  const [open, setOpen]         = useState(false)
  const [password, setPassword] = useState("")
  const [loading, setLoading]   = useState(false)

  async function handleReset() {
    if (password.length < 8) return
    setLoading(true)
    const formData = new FormData()
    formData.set("userId", userId)
    formData.set("newPassword", password)
    const result = await resetUserPassword(formData)
    setLoading(false)
    if (!result.success) {
      showToast(result.error, "error")
      return
    }
    showToast(t("successMessage"), "success")
    setOpen(false)
    setPassword("")
    router.refresh()
  }

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        {t("openButton")}
      </Button>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
      <Input
        type="text"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t("placeholder")}
        className="w-full sm:w-44 h-8 text-sm"
        dir="ltr"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleReset} disabled={loading || password.length < 8} className="flex-1 sm:flex-none bg-green-700 hover:bg-green-800">
          {loading ? "..." : t("confirmButton")}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { setOpen(false); setPassword("") }} className="flex-1 sm:flex-none">
          {t("cancelButton")}
        </Button>
      </div>
    </div>
  )
}
