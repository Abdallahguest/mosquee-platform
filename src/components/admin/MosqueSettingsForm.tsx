"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useErrorMessages } from "@/lib/use-error-messages"
import { updateMosqueSettings } from "@/lib/actions/mosque.actions"
import { Button }   from "@/components/ui/button"
import { Input }    from "@/components/ui/input"
import { Label }    from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Mosque {
  id: number
  slug: string
  name: string
  city: string
  country: string
  latitude: number
  longitude: number
  timezone: string
  calculationMethod: string
  donationUrl: string | null
  contactEmail: string | null
  contactPhone: string | null
}

// Noms propres des méthodes de calcul — non traduits (ce sont des dénominations officielles).
const METHODS = [
  { value: "MWL",       label: "Muslim World League" },
  { value: "ISNA",      label: "Islamic Society of North America" },
  { value: "Egyptian",  label: "Egyptian General Authority" },
  { value: "UmmAlQura", label: "Umm Al-Qura (Mecque)" },
  { value: "Karachi",   label: "University of Islamic Sciences, Karachi" },
]

export default function MosqueSettingsForm({ mosque }: { mosque: Mosque }) {
  const t = useTranslations("admin.settings")
  const tc = useTranslations("admin.common")
  const { fromResult } = useErrorMessages()
  const [error, setError]     = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const [method, setMethod]   = useState(mosque.calculationMethod)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    // Note : on n'envoie plus "slug" (l'action ne le lit pas — champ retiré).
    formData.set("calculationMethod", method)

    const result = await updateMosqueSettings(mosque.id, formData)

    if (!result.success) {
      setError(fromResult(result))
    } else {
      setSuccess(t("saved"))
      setTimeout(() => setSuccess(""), 3000)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Identité */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("identityTitle")}</CardTitle>
          <CardDescription>{t("identityDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">{t("fieldName")} <span className="text-destructive" aria-label={tc("required")}>*</span></Label>
            <Input id="name" name="name" aria-required="true" defaultValue={mosque.name} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="city">{t("fieldCity")} <span className="text-destructive" aria-label={tc("required")}>*</span></Label>
              <Input id="city" name="city" aria-required="true" defaultValue={mosque.city} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="country">{t("fieldCountry")} <span className="text-destructive" aria-label={tc("required")}>*</span></Label>
              <Input id="country" name="country" aria-required="true" defaultValue={mosque.country} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Localisation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("geoTitle")}</CardTitle>
          <CardDescription>
            {t("geoDesc")}{" "}
            <a
              href="https://www.latlong.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-700 hover:underline"
            >
              {t("geoFindCoords")} <span aria-hidden="true">→</span>
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="latitude">{t("fieldLatitude")} <span className="text-destructive" aria-label={tc("required")}>*</span></Label>
              <Input
                id="latitude" name="latitude" type="number" step="0.0001"
                aria-required="true" defaultValue={mosque.latitude} dir="ltr"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="longitude">{t("fieldLongitude")} <span className="text-destructive" aria-label={tc("required")}>*</span></Label>
              <Input
                id="longitude" name="longitude" type="number" step="0.0001"
                aria-required="true" defaultValue={mosque.longitude} dir="ltr"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fuseau + méthode de suggestion */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("tzTitle")}</CardTitle>
          <CardDescription>{t("tzDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="timezone">{t("fieldTimezone")} <span className="text-destructive" aria-label={tc("required")}>*</span></Label>
            <Input
              id="timezone" name="timezone" aria-required="true"
              defaultValue={mosque.timezone} placeholder="Africa/Conakry" dir="ltr"
            />
            <p className="text-xs text-muted-foreground">{t("tzHelp")}</p>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label>{t("methodLabel")}</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Contact et don */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("contactTitle")}</CardTitle>
          <CardDescription>{t("contactDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="contactEmail">{t("fieldContactEmail")}</Label>
            <Input
              id="contactEmail" name="contactEmail" type="email"
              defaultValue={mosque.contactEmail ?? ""} placeholder="contact@mamosquee.com" dir="ltr"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contactPhone">{t("fieldContactPhone")}</Label>
            <Input
              id="contactPhone" name="contactPhone"
              defaultValue={mosque.contactPhone ?? ""} placeholder="+224 6XX XX XX XX" dir="ltr"
            />
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label htmlFor="donationUrl">{t("fieldDonationUrl")}</Label>
            <Input
              id="donationUrl" name="donationUrl" type="url"
              defaultValue={mosque.donationUrl ?? ""} placeholder="https://..." dir="ltr"
            />
            <p className="text-xs text-muted-foreground">{t("donationHelp")}</p>
          </div>
        </CardContent>
      </Card>

      <Button
        type="submit" disabled={loading}
        className="w-full bg-green-700 hover:bg-green-800" size="lg"
      >
        {loading ? t("saving") : t("saveButton")}
      </Button>

    </form>
  )
}
