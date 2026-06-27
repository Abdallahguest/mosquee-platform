const baseStyle = `
  font-family: system-ui, -apple-system, sans-serif;
  max-width: 480px;
  margin: 0 auto;
  padding: 32px 24px;
  color: #1f2937;
`

const buttonStyle = `
  display: inline-block;
  background: #15803d;
  color: #ffffff;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  margin: 16px 0;
`

export function verificationEmailTemplate(url: string, name: string): string {
  return `
    <div style="${baseStyle}">
      <div style="text-align: center; font-size: 40px; margin-bottom: 16px;">🕌</div>
      <h1 style="font-size: 20px; text-align: center;">Vérifiez votre email</h1>
      <p>Assalamu alaykum ${name},</p>
      <p>Merci de votre inscription sur Amana Connect. Cliquez sur le bouton ci-dessous pour activer votre compte :</p>
      <div style="text-align: center;">
        <a href="${url}" style="${buttonStyle}">Activer mon compte</a>
      </div>
      <p style="font-size: 13px; color: #6b7280;">Si vous n'êtes pas à l'origine de cette inscription, ignorez simplement cet email.</p>
      <p style="font-size: 12px; color: #9ca3af; margin-top: 24px;">Plateforme halal · Sans riba · Sans ghich · Sans jahàla</p>
    </div>
  `
}

export function resetPasswordEmailTemplate(url: string, name: string): string {
  return `
    <div style="${baseStyle}">
      <div style="text-align: center; font-size: 40px; margin-bottom: 16px;">🕌</div>
      <h1 style="font-size: 20px; text-align: center;">Réinitialisation du mot de passe</h1>
      <p>Assalamu alaykum ${name},</p>
      <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez ci-dessous. Ce lien expire dans 1 heure :</p>
      <div style="text-align: center;">
        <a href="${url}" style="${buttonStyle}">Réinitialiser mon mot de passe</a>
      </div>
      <p style="font-size: 13px; color: #6b7280;">Si vous n'avez pas fait cette demande, ignorez cet email. Votre mot de passe reste inchangé.</p>
      <p style="font-size: 12px; color: #9ca3af; margin-top: 24px;">Plateforme halal · Sans riba · Sans ghich · Sans jahàla</p>
    </div>
  `
}
