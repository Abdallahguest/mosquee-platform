/**
 * Module d'alertes pour les actions super-admin sensibles
 * 
 * Envoie des notifications en temps réel pour les actions critiques :
 * - Suppression utilisateur/mosquée
 * - Désactivation MFA
 * - Récupération d'urgence
 * 
 * Supporte : Slack Webhook, SMS (via Twilio), Email
 */

interface AlertPayload {
  action: string
  user: { id: string; name: string; email: string }
  details?: string
  ipAddress?: string
  userAgent?: string
  mosqueId?: number
}

/**
 * Envoie une alerte via Slack Webhook
 */
export async function sendSlackAlert(payload: AlertPayload): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  
  if (!webhookUrl) {
    console.warn("SLACK_WEBHOOK_URL not configured, skipping Slack alert")
    return
  }

  try {
    const message = {
      text: `⚠️ Action Super-Admin Critique : ${payload.action}`,
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: `⚠️ Action Super-Admin Critique : ${payload.action}`,
            emoji: true,
          },
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*Utilisateur:*\n${payload.user.name} (${payload.user.email})`,
            },
            {
              type: "mrkdwn",
              text: `*ID:*\n${payload.user.id}`,
            },
          ],
        },
        ...(payload.ipAddress ? [
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*IP:*\n${payload.ipAddress}`,
              },
            ],
          },
        ] : []),
        ...(payload.mosqueId ? [
          {
            type: "section",
            fields: [
              {
                type: "mrkdwn",
                text: `*Mosquée ID:*\n${payload.mosqueId}`,
              },
            ],
          },
        ] : []),
        ...(payload.details ? [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Détails:*\n${payload.details}`,
            },
          },
        ] : []),
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `_<${process.env.NEXT_PUBLIC_APP_URL}/super-admin/activity|Voir le journal d'activité>_`,
          },
        },
      ],
    }

    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message),
    })

    if (!response.ok) {
      throw new Error(`Slack webhook failed: ${response.statusText}`)
    }
  } catch (error) {
    console.error("Failed to send Slack alert:", error)
    // Ne pas bloquer l'action principale si l'alerte échoue
  }
}

/**
 * Envoie une alerte via SMS (Twilio)
 */
export async function sendSMSAlert(payload: AlertPayload): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_FROM_NUMBER
  const toNumbers = process.env.TWILIO_ALERT_NUMBERS?.split(",") || []

  if (!accountSid || !authToken || !fromNumber || toNumbers.length === 0) {
    console.warn("Twilio not configured, skipping SMS alert")
    return
  }

  try {
    const message = `[AMANA ALERT] ${payload.action} by ${payload.user.name} (${payload.user.email})`
    
    // Envoyer à tous les numéros configurés
    await Promise.all(
      toNumbers.map(async (toNumber) => {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
        const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64")
        
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${credentials}`,
          },
          body: new URLSearchParams({
            From: fromNumber,
            To: toNumber.trim(),
            Body: message,
          }),
        })

        if (!response.ok) {
          throw new Error(`Twilio SMS failed to ${toNumber}: ${response.statusText}`)
        }
      })
    )
  } catch (error) {
    console.error("Failed to send SMS alert:", error)
    // Ne pas bloquer l'action principale si l'alerte échoue
  }
}

/**
 * Envoie une alerte via email (pour les super-admins supplémentaires)
 */
export async function sendEmailAlert(payload: AlertPayload): Promise<void> {
  const alertEmails = process.env.SUPER_ADMIN_ALERT_EMAILS?.split(",") || []

  if (alertEmails.length === 0) {
    console.warn("SUPER_ADMIN_ALERT_EMAILS not configured, skipping email alert")
    return
  }

  try {
    const { sendEmail } = await import("./email")

    const html = `
      <h2>⚠️ Action Super-Admin Critique</h2>
      <p><strong>Action :</strong> ${payload.action}</p>
      <p><strong>Utilisateur :</strong> ${payload.user.name} (${payload.user.email})</p>
      <p><strong>ID :</strong> ${payload.user.id}</p>
      ${payload.ipAddress ? `<p><strong>IP :</strong> ${payload.ipAddress}</p>` : ""}
      ${payload.mosqueId ? `<p><strong>Mosquée ID :</strong> ${payload.mosqueId}</p>` : ""}
      ${payload.details ? `<p><strong>Détails :</strong> ${payload.details}</p>` : ""}
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/super-admin/activity">Voir le journal d'activité</a></p>
    `

    await Promise.all(
      alertEmails.map(email =>
        sendEmail({
          to: email.trim(),
          subject: `[AMANA ALERT] ${payload.action}`,
          html,
        })
      )
    )
  } catch (error) {
    console.error("Failed to send email alert:", error)
    // Ne pas bloquer l'action principale si l'alerte échoue
  }
}

/**
 * Envoie des alertes via tous les canaux configurés
 */
export async function sendCriticalAlert(payload: AlertPayload): Promise<void> {
  // Envoyer en parallèle pour ne pas bloquer
  await Promise.allSettled([
    sendSlackAlert(payload),
    sendSMSAlert(payload),
    sendEmailAlert(payload),
  ])
}
