"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { createUserAccount } from "@/lib/actions/superadmin.actions"
import { showToast } from "@/components/ui/toast-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CreateUserForm() {
  const router = useRouter()
  const t = useTranslations("superAdmin.components.createUser")
  const [error, setError]     = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await createUserAccount(formData)

    setLoading(false)
    if (!result.success) {
      setError(result.error)
      return
    }

    showToast(t("successMessage", { email: result.data.email }), "success")
    e.currentTarget.reset()
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="name">{t("fieldName")}</Label>
        <Input id="name" name="name" required placeholder={t("namePlaceholder")} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">{t("fieldEmail")}</Label>
        <Input id="email" name="email" type="email" required placeholder={t("emailPlaceholder")} dir="ltr" />
        <p className="text-xs text-gray-400">{t("emailHelp")}</p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">{t("fieldPassword")}</Label>
        <Input id="password" name="password" type="text" required placeholder={t("passwordPlaceholder")} dir="ltr" />
        <p className="text-xs text-gray-400">{t("passwordHelp")}</p>
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-green-700 hover:bg-green-800">
        {loading ? t("submitLoading") : t("submitButton")}
      </Button>
    </form>
  )
}
