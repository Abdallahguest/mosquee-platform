"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { selfServiceRegister } from "@/lib/actions/self-service.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function SelfServiceRegisterForm() {
  const t = useTranslations("auth")
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)

    const result = await selfServiceRegister(formData)

    if (result.success) {
      setSuccess(true)
      // Rediriger vers la page de login après un délai
      setTimeout(() => {
        router.push("/login?registered=true")
      }, 3000)
    } else {
      setError(result.error)
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="space-y-4">
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertDescription>
            {t("registerSuccess")}
          </AlertDescription>
        </Alert>
        <p className="text-sm text-gray-600 text-center">
          {t("registerRedirecting")}
        </p>
      </div>
    )
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Informations personnelles */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">{t("personalInfo")}</h3>
        
        <div>
          <Label htmlFor="name">{t("name")} *</Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            disabled={isLoading}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email">{t("email")} *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            disabled={isLoading}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="password">{t("password")} *</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            disabled={isLoading}
            className="mt-1"
          />
          <p className="text-xs text-gray-500 mt-1">{t("passwordHint")}</p>
        </div>
      </div>

      {/* Informations de la mosquée */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{t("mosqueInfo")}</h3>
        
        <div>
          <Label htmlFor="mosqueName">{t("mosqueName")} *</Label>
          <Input
            id="mosqueName"
            name="mosqueName"
            type="text"
            required
            disabled={isLoading}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">{t("city")} *</Label>
            <Input
              id="city"
              name="city"
              type="text"
              required
              disabled={isLoading}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="country">{t("country")} *</Label>
            <Input
              id="country"
              name="country"
              type="text"
              required
              disabled={isLoading}
              className="mt-1"
            />
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            <strong>{t("trialInfoTitle")}</strong> {t("trialInfoBody")}
          </p>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-green-700 hover:bg-green-800"
      >
        {isLoading ? t("registering") : t("createAccount")}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        {t("termsAgreement")}
      </p>
    </form>
  )
}
