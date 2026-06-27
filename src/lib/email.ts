import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

// Adresse expéditeur. Priorité à la variable d'environnement EMAIL_FROM
// (configurable dans Vercel sans toucher au code). Repli sur le domaine
// vérifié si la variable n'est pas définie — ainsi les emails partent
// toujours vers de vrais destinataires, même en cas d'oubli de config.
//
// IMPORTANT : ce repli doit être une adresse sur un domaine VÉRIFIÉ dans
// Resend (mail.amanaconnect.org), pas l'ancienne adresse de test
// onboarding@resend.dev qui n'envoyait qu'au propriétaire du compte.
const FROM = process.env.EMAIL_FROM ?? "noreply@mail.amanaconnect.org"

// Nom affiché de l'expéditeur (ce que voit le destinataire avant l'adresse).
// Configurable aussi, repli sur un nom clair.
const FROM_NAME = process.env.EMAIL_FROM_NAME ?? "Amana Connect"

export async function sendEmail({ to, subject, html }: {
  to: string
  subject: string
  html: string
}) {
  try {
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM}>`,
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
