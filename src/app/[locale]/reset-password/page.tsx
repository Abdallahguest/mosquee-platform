"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const t = useTranslations("auth")

  const [password, setPassword] = useState("")
  const [confirm, setConfirm]   = useState("")
  const [error, setError]       = useState("")
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirm) {
      setError(t("passwordMismatch"))
      return
    }
    if (password.length < 8) {
      setError(t("passwordTooShort"))
      return
    }
    if (!token) {
      setError(t("resetInvalidToken"))
      return
    }

    setLoading(true)

    const { error } = await authClient.resetPassword({ newPassword: password, token })

    if (error) {
      setError(t("resetExpiredToken"))
      setLoading(false)
      return
    }

    router.push("/login")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3" aria-hidden="true">🕌</div>
          <h1 className="text-2xl font-bold text-gray-900">{t("resetTitle")}</h1>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="password">{t("resetNewPassword")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder={t("passwordPlaceholder")}
                dir="ltr"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm">{t("resetConfirm")}</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                placeholder={t("resetConfirmPlaceholder")}
                dir="ltr"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-green-700 hover:bg-green-800"
            >
              {loading ? t("resetLoading") : t("resetButton")}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/login" className="text-green-700 hover:underline font-medium">
            {t("backToLogin")}
          </Link>
        </p>
      </div>
    </div>
  )
}
