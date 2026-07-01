"use server"

import { logAction } from "@/lib/audit"

// Journalise une tentative de connexion.
// Appelée depuis la page login (Client Component) après le résultat de authClient.signIn.
// Silencieux sur erreur — ne doit jamais bloquer l'expérience utilisateur.
export async function logSignIn(email: string, success: boolean): Promise<void> {
  await logAction({
    userId:  null,
    action:  success ? "auth.sign_in_success" : "auth.sign_in_failed",
    details: email,
  })
}
