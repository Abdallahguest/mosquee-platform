"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useErrorMessages } from "@/lib/use-error-messages"
import { updateMosqueSettings } from "@/lib/actions/mosque.actions"
import { showToast } from "@/components/ui/toast-provider"
import { Button }   from "@/components/ui/button"
import { Input }    from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label }    from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface Mosque {
  id: number
  slug: string
  name: string
  nameFr: string | null
  nameEn: string | null
  nameAr: string | null
  city: string
  country: string
  commune: string | null
  quartier: string | null
  secteur: string | null
  latitude: number
  longitude: number
  timezone: string
  donationUrl: string | null
  orangeMoneyNumber: string | null
  contactEmail: string | null
  contactPhone: string | null
  welcomeMessage: string | null
  footerText: string | null
}

export default function MosqueSettingsForm({ mosque }: { mosque: Mosque }) {
  const t = useTranslations("admin.settings")
  const tc = useTranslations("admin.common")
  const { fromResult } = useErrorMessages()
  const [error, setError]     = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    const result = await updateMosqueSettings(mosque.id, formData)

    if (!result.success) {
      setError(fromResult(result))
    } else {
      showToast(t("saved"), "success")
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

          {/* Noms officiels multilingues (optionnels). Vide = nom par défaut ci-dessus. */}
          <p className="text-sm font-medium text-gray-700">{t("multilingualNamesTitle")}</p>
          <p className="text-xs text-muted-foreground -mt-2">{t("multilingualNamesDesc")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="nameFr">{t("fieldNameFr")}</Label>
              <Input id="nameFr" name="nameFr" defaultValue={mosque.nameFr ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nameEn">{t("fieldNameEn")}</Label>
              <Input id="nameEn" name="nameEn" defaultValue={mosque.nameEn ?? ""} dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nameAr">{t("fieldNameAr")}</Label>
              <Input id="nameAr" name="nameAr" defaultValue={mosque.nameAr ?? ""} dir="rtl" />
            </div>
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

          {/* Coordonnées précises (optionnelles) */}
          <Separator />
          <p className="text-sm font-medium text-gray-700">{t("preciseLocationTitle")}</p>
          <p className="text-xs text-muted-foreground -mt-2">{t("preciseLocationDesc")}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="commune">{t("fieldCommune")}</Label>
              <Input id="commune" name="commune" defaultValue={mosque.commune ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quartier">{t("fieldQuartier")}</Label>
              <Input id="quartier" name="quartier" defaultValue={mosque.quartier ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="secteur">{t("fieldSecteur")}</Label>
              <Input id="secteur" name="secteur" defaultValue={mosque.secteur ?? ""} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Localisation GPS */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("geoTitle")}</CardTitle>
          <CardDescription>
            {t("geoDesc")}{" "}
            <a href="https://www.latlong.net" target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline">
              {t("geoFindCoords")} <span aria-hidden="true">→</span>
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="latitude">{t("fieldLatitude")} <span className="text-destructive" aria-label={tc("required")}>*</span></Label>
              <Input id="latitude" name="latitude" type="number" step="0.0001" aria-required="true" defaultValue={mosque.latitude} dir="ltr" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="longitude">{t("fieldLongitude")} <span className="text-destructive" aria-label={tc("required")}>*</span></Label>
              <Input id="longitude" name="longitude" type="number" step="0.0001" aria-required="true" defaultValue={mosque.longitude} dir="ltr" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fuseau + méthode */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("tzTitle")}</CardTitle>
          <CardDescription>{t("tzDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="timezone">{t("fieldTimezone")} <span className="text-destructive" aria-label={tc("required")}>*</span></Label>
            <Input id="timezone" name="timezone" aria-required="true" defaultValue={mosque.timezone} placeholder="Africa/Conakry" dir="ltr" />
            <p className="text-xs text-muted-foreground">{t("tzHelp")}</p>
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
            <Input id="contactEmail" name="contactEmail" type="email" defaultValue={mosque.contactEmail ?? ""} placeholder="contact@mamosquee.com" dir="ltr" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="contactPhone">{t("fieldContactPhone")}</Label>
            <Input id="contactPhone" name="contactPhone" defaultValue={mosque.contactPhone ?? ""} placeholder="+224 6XX XX XX XX" dir="ltr" />
          </div>
          <Separator />
          <div className="space-y-1.5">
            <Label htmlFor="orangeMoneyNumber">{t("fieldOrangeMoney")}</Label>
            <Input
              id="orangeMoneyNumber" name="orangeMoneyNumber" type="tel"
              defaultValue={mosque.orangeMoneyNumber ?? ""}
              placeholder="6XX XX XX XX" dir="ltr"
            />
            <p className="text-xs text-muted-foreground">{t("orangeMoneyHelp")}</p>
          </div>
          <Separator />
          <div className="space-y-1.5">
            <Label htmlFor="donationUrl">{t("fieldDonationUrl")}</Label>
            <Input id="donationUrl" name="donationUrl" type="url" defaultValue={mosque.donationUrl ?? ""} placeholder="https://..." dir="ltr" />
            <p className="text-xs text-muted-foreground">{t("donationHelp")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Personnalisation (textes libres) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("customTitle")}</CardTitle>
          <CardDescription>{t("customDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="welcomeMessage">{t("fieldWelcome")}</Label>
            <Textarea
              id="welcomeMessage" name="welcomeMessage" rows={2} maxLength={500}
              className="resize-none" defaultValue={mosque.welcomeMessage ?? ""}
              placeholder={t("welcomePlaceholder")}
            />
            <p className="text-xs text-muted-foreground">{t("welcomeHelp")}</p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="footerText">{t("fieldFooter")}</Label>
            <Textarea
              id="footerText" name="footerText" rows={2} maxLength={500}
              className="resize-none" defaultValue={mosque.footerText ?? ""}
              placeholder={t("footerPlaceholder")}
            />
            <p className="text-xs text-muted-foreground">{t("footerHelp")}</p>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={loading} className="w-full bg-green-700 hover:bg-green-800" size="lg">
        {loading ? t("saving") : t("saveButton")}
      </Button>

    </form>
  )
}
