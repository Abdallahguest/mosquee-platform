import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM = process.env.EMAIL_FROM ?? "onboarding@resend.dev"

export async function sendEmail({ to, subject, html }: {
  to: string
  subject: string
  html: string
}) {
  try {
    const result = await resend.emails.send({
      from: `Plateforme Mosquée <${FROM}>`,
      to,
      subject,
      html,
    })
    return { success: true, result }
  } catch (error) {
    console.error("❌ Erreur envoi email:", error)
    return { success: false, error }
  }
}
