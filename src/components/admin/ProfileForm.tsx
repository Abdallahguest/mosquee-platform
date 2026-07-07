"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { updateProfileName, updateProfilePassword } from "@/lib/actions/profile.actions"
import { showToast } from "@/components/ui/toast-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

interface ProfileFormProps {
  currentName: string
  currentEmail: string
}

export default function ProfileForm({ currentName, currentEmail }: ProfileFormProps) {
  const router = useRouter()
  const t = useTranslations("admin.profile")

  const [nameError, setNameError]         = useState("")
  const [nameLoading, setNameLoading]     = useState(false)
  const [pwdError, setPwdError]           = useState("")
  const [pwdLoading, setPwdLoading]       = useState(false)

  async function handleNameSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setNameError("")
    setNameLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await updateProfileName(formData)
    setNameLoading(false)
    if (!result.success) { setNameError(result.error); return }
    showToast(t("nameSaved"), "success")
    router.refresh()
  }

  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPwdError("")
    setPwdLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await updateProfilePassword(formData)
    setPwdLoading(false)
    if (!result.success) { setPwdError(result.error); return }
    showToast(t("passwordSaved"), "success")
    e.currentTarget.reset()
  }

  return (
    <div className="space-y-6">

      {/* Nom */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("nameTitle")}</CardTitle>
          <CardDescription>{t("nameDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleNameSubmit} className="space-y-4">
            {nameError && <Alert variant="destructive"><AlertDescription>{nameError}</AlertDescription></Alert>}
            <div className="space-y-1.5">
              <Label htmlFor="name">{t("fieldName")}</Label>
              <Input id="name" name="name" defaultValue={currentName} required maxLength={100} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("fieldEmail")}</Label>
              <Input value={currentEmail} disabled dir="ltr" className="bg-gray-50 text-gray-500" />
              <p className="text-xs text-muted-foreground">{t("emailNote")}</p>
            </div>
            <Button type="submit" disabled={nameLoading} className="bg-green-700 hover:bg-green-800">
              {nameLoading ? t("saving") : t("saveName")}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Mot de passe */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("passwordTitle")}</CardTitle>
          <CardDescription>{t("passwordDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            {pwdError && <Alert variant="destructive"><AlertDescription>{pwdError}</AlertDescription></Alert>}
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">{t("fieldCurrentPassword")}</Label>
              <Input id="currentPassword" name="currentPassword" type="password" required dir="ltr" placeholder="••••••••" />
            </div>
            <Separator />
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">{t("fieldNewPassword")}</Label>
              <Input id="newPassword" name="newPassword" type="password" required dir="ltr" placeholder="••••••••" minLength={8} />
              <p className="text-xs text-muted-foreground">{t("passwordHint")}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">{t("fieldConfirmPassword")}</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required dir="ltr" placeholder="••••••••" />
            </div>
            <Button type="submit" disabled={pwdLoading} className="bg-green-700 hover:bg-green-800">
              {pwdLoading ? t("saving") : t("savePassword")}
            </Button>
          </form>
        </CardContent>
      </Card>

    </div>
  )
}
