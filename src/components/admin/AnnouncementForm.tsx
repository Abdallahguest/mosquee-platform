"use client"

import { useState, useRef } from "react"
import type { FormEvent } from "react"
import { useTranslations } from "next-intl"
import { useErrorMessages } from "@/lib/use-error-messages"
import {
  createAnnouncement,
  updateAnnouncement,
} from "@/lib/actions/announcement.actions"
import { useRouter } from "@/i18n/navigation"
import { useDraftPersistence } from "@/lib/use-draft-persistence"
import { showToast } from "@/components/ui/toast-provider"
import AudioRecorder from "@/components/admin/AudioRecorder"
import { Button }   from "@/components/ui/button"
import { Input }    from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label }    from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface AnnouncementFormProps {
  announcement?: {
    id: number
    title: string
    content: string
    isPublished: boolean
    audioUrl: string | null
    expiresAt?: Date | string | null
  }
}

export default function AnnouncementForm({ announcement }: AnnouncementFormProps) {
  const t = useTranslations("admin.announcementForm")
  const tc = useTranslations("admin.common")
  const td = useTranslations("admin.draft")
  const { fromResult } = useErrorMessages()
  const isEdit = announcement != null
  const router = useRouter()
  const [error, setError]     = useState("")
  const [loading, setLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(announcement?.audioUrl ?? null)
  const formRef = useRef<HTMLFormElement>(null)

  // ── Écriture résiliente : sauvegarde locale du brouillon (Niveau A) ──
  // En édition, on distingue par id pour ne pas mélanger les brouillons.
  const { hasDraft, draftSavedAt, restoreDraft, clearDraft, dismissDraft } =
    useDraftPersistence({
      formKey: isEdit ? `announcement:edit:${announcement.id}` : "announcement:new",
      formRef,
    })

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    const result = isEdit
      ? await updateAnnouncement(announcement.id, formData)
      : await createAnnouncement(formData)

    if (!result.success) {
      // Envoi échoué (réseau, validation…) : on GARDE le brouillon pour réessai.
      setError(fromResult(result))
      setLoading(false)
      return
    }

    // Envoi réussi : le brouillon n'est plus nécessaire.
    clearDraft()

    if (isEdit) {
      router.push("/admin/announcements")
      router.refresh()
      return
    }

    showToast(t("createdSuccess"), "success")
    // Reset d'abord, clearDraft ensuite — évite que la sauvegarde périodique
    // re-sauve un brouillon vide juste après le clearDraft.
    setLoading(false)
    setAudioUrl(null)
    formRef.current?.reset()
    // Délai court pour laisser le reset propager avant d'effacer le brouillon
    setTimeout(() => clearDraft(), 100)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {isEdit ? t("editTitle") : t("newTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4">

          {/* Proposition de restauration d'un brouillon non publié */}
          {hasDraft && (
            <Alert className="border-amber-200 bg-amber-50 text-amber-800">
              <AlertDescription className="flex flex-col gap-2">
                <span>
                  {td("found")}
                  {draftSavedAt && (
                    <span className="text-xs opacity-80">
                      {" "}({new Date(draftSavedAt).toLocaleString()})
                    </span>
                  )}
                </span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    onClick={restoreDraft}
                    className="text-sm font-medium underline"
                  >
                    {td("restore")}
                  </button>
                  <button
                    type="button"
                    onClick={dismissDraft}
                    className="text-sm opacity-70"
                  >
                    {td("ignore")}
                  </button>
                </span>
              </AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="title">
              {t("fieldTitle")} <span className="text-destructive" aria-label={tc("required")}>*</span>
            </Label>
            <Input
              id="title"
              name="title"
              aria-required="true"
              maxLength={100}
              placeholder={t("titlePlaceholder")}
              defaultValue={announcement?.title}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="content">
              {t("fieldContent")} <span className="text-destructive" aria-label={tc("required")}>*</span>
            </Label>
            <Textarea
              id="content"
              name="content"
              aria-required="true"
              maxLength={2000}
              rows={4}
              placeholder={t("contentPlaceholder")}
              className="resize-none"
              defaultValue={announcement?.content}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {t("formattingHelp")}
            </p>
          </div>

          {/* Audio — enregistrement direct ou lien externe */}
          <div className="space-y-3">
            <AudioRecorder
              currentAudioUrl={audioUrl}
              onAudioUrlChange={setAudioUrl}
              label={t("fieldAudioUrl")}
            />
            {/* Champ caché qui transmet l'URL au formulaire */}
            <input type="hidden" name="audioUrl" value={audioUrl ?? ""} />
            <p className="text-xs text-muted-foreground">{t("audioUrlHelp")}</p>
          </div>

          {/* Épinglage — aide contextuelle */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isPublished"
                id="isPublished"
                value="true"
                defaultChecked={announcement?.isPublished}
                className="w-4 h-4 accent-green-600"
              />
              <Label htmlFor="isPublished" className="font-normal cursor-pointer">
                {t("publishNow")}
              </Label>
            </div>
          </div>

          {/* Expiration — aide contextuelle */}
          <div className="space-y-1.5">
            <Label htmlFor="expiresAt">{t("fieldExpiresAt")}</Label>
            <Input
              id="expiresAt"
              name="expiresAt"
              type="datetime-local"
              dir="ltr"
              defaultValue={announcement?.expiresAt
                ? new Date(announcement.expiresAt).toISOString().slice(0, 16)
                : ""}
            />
            <p className="text-xs text-muted-foreground">{t("expiresHelp")}</p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="bg-green-700 hover:bg-green-800"
          >
            {loading
              ? t("saving")
              : isEdit
                ? t("saveButton")
                : t("createButton")}
          </Button>

        </form>
      </CardContent>
    </Card>
  )
}
