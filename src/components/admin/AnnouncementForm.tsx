"use client"

import { useState, useRef } from "react"
import { useTranslations } from "next-intl"
import {
  createAnnouncement,
  updateAnnouncement,
} from "@/lib/actions/announcement.actions"
import { useRouter } from "@/i18n/navigation"
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
  }
}

export default function AnnouncementForm({ announcement }: AnnouncementFormProps) {
  const t = useTranslations("admin.announcementForm")
  const tc = useTranslations("admin.common")
  const isEdit = announcement != null
  const router = useRouter()
  const [error, setError]     = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    const result = isEdit
      ? await updateAnnouncement(announcement.id, formData)
      : await createAnnouncement(formData)

    if (!result.success) {
      setError(result.error)
      setLoading(false)
      return
    }

    if (isEdit) {
      router.push("/admin/announcements")
      router.refresh()
      return
    }

    setSuccess(t("createdSuccess"))
    formRef.current?.reset()
    setLoading(false)
    setTimeout(() => setSuccess(""), 3000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {isEdit ? t("editTitle") : t("newTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">

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

          <div className="space-y-1.5">
            <Label htmlFor="title">
              {t("fieldTitle")} <span className="text-destructive" aria-label={tc("required")}>*</span>
            </Label>
            <Input
              id="title"
              name="title"
              required
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
              required
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
