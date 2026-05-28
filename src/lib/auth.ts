import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "@/db/index"
import * as schema from "@/db/schema"
import { sendEmail } from "@/lib/email"
import { verificationEmailTemplate, resetPasswordEmailTemplate } from "@/lib/email-templates"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user:         schema.authUser,
      session:      schema.session,
      account:      schema.account,
      verification: schema.verification,
    },
  }),

  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Réinitialisation de votre mot de passe",
        html: resetPasswordEmailTemplate(url, user.name),
      })
    },
    resetPasswordTokenExpiresIn: 60 * 60, // 1 heure
  },

  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Vérifiez votre compte Plateforme Mosquée",
        html: verificationEmailTemplate(url, user.name),
      })
    },
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge:  60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  trustedOrigins: [
    "http://localhost:3000",
    process.env.BETTER_AUTH_URL ?? "",
  ],
})

export type Session = typeof auth.$Infer.Session
export type User    = typeof auth.$Infer.Session.user
