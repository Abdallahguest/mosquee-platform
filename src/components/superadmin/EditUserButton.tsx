"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { updateUserAccount } from "@/lib/actions/superadmin.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface EditUserButtonProps {
  userId: string
  name: string
  email: string
  role: string
}

export default function EditUserButton({ userId, name, email, role }: EditUserButtonProps) {
  const router = useRouter()
  const t = useTranslations("superAdmin.components.editUser")
  const [open, setOpen]       = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    formData.set("userId", userId)
    const result = await updateUserAccount(formData)

    setLoading(false)
    if (!result.success) {
      setError(result.error)
      return
    }
    setOpen(false)
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
    <form onSubmit={handleSubmit} className="w-full space-y-3 rounded-md border border-gray-200 p-3 bg-gray-50">
      {error && <p className="text-xs text-red-600 break-words">{error}</p>}

      <div className="space-y-1">
        <Label htmlFor={`name-${userId}`} className="text-xs">{t("fieldName")}</Label>
        <Input id={`name-${userId}`} name="name" required defaultValue={name} className="h-8 text-sm" />
      </div>

      <div className="space-y-1">
        <Label htmlFor={`email-${userId}`} className="text-xs">{t("fieldEmail")}</Label>
        <Input id={`email-${userId}`} name="email" type="email" required defaultValue={email} className="h-8 text-sm" dir="ltr" />
      </div>

      <div className="space-y-1">
        <Label htmlFor={`role-${userId}`} className="text-xs">{t("fieldRole")}</Label>
        <select
          id={`role-${userId}`}
          name="role"
          defaultValue={role === "admin" ? "admin" : "member"}
          className="w-full border border-gray-300 rounded-md px-3 h-8 text-sm bg-white"
        >
          <option value="admin">admin</option>
          <option value="member">member</option>
        </select>
      </div>

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={loading} className="flex-1 sm:flex-none bg-green-700 hover:bg-green-800">
          {loading ? "..." : t("saveButton")}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => { setOpen(false); setError("") }} className="flex-1 sm:flex-none">
          {t("cancelButton")}
        </Button>
      </div>
    </form>
  )
}
