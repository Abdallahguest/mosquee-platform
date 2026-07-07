"use server"

import { logAction } from "@/lib/audit"

export async function logSignIn(email: string, success: boolean, ip?: string): Promise<void> {
  await logAction({
    userId:  null,
    action:  success ? "auth.sign_in_success" : "auth.sign_in_failed",
    details: ip ? `${email} · IP: ${ip}` : email,
  })
}
