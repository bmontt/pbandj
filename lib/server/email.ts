import type React from "react"
import { isResendConfigured, resend } from "@/lib/resend"
import { withTimeout } from "./http"

// Sender and recipient come only from env vars. There are deliberately no fallback
// addresses: a wrong fallback domain sends mail that fails SPF/DKIM and hurts the
// domain's reputation. Missing config is logged loudly and the email is skipped.

const SEND_TIMEOUT_MS = 10_000

type EmailEnvVar = "EMAIL_FROM" | "DEMO_RECIPIENT_EMAIL"

function readEmailEnv(name: EmailEnvVar, tag: string): string | null {
  const value = process.env[name]?.trim()
  if (!value) {
    console.error(`[email:${tag}] ${name} is not set; not sending. Set it in the Vercel project environment.`)
    return null
  }
  return value
}

export type SendResult = { sent: boolean; reason?: string }

export async function sendEmail(options: {
  // A literal address, or { env } to read the recipient from an env var.
  to: string | { env: "DEMO_RECIPIENT_EMAIL" }
  subject: string
  react: React.ReactElement
  replyTo?: string
  tag: string
}): Promise<SendResult> {
  const from = readEmailEnv("EMAIL_FROM", options.tag)
  const to = typeof options.to === "string" ? options.to : readEmailEnv(options.to.env, options.tag)
  if (!from || !to) return { sent: false, reason: "email env not configured" }

  if (!isResendConfigured()) {
    console.error(`[email:${options.tag}] RESEND_API_KEY is not set; not sending`)
    return { sent: false, reason: "RESEND_API_KEY not configured" }
  }

  try {
    const { error } = await withTimeout(
      resend.emails.send({
        from,
        to,
        subject: options.subject,
        react: options.react,
        ...(options.replyTo ? { replyTo: options.replyTo } : {}),
      }),
      SEND_TIMEOUT_MS,
      "Resend send",
    )
    if (error) {
      console.error(`[email:${options.tag}] Resend rejected the email:`, error.name, error.message)
      return { sent: false, reason: error.name || "resend error" }
    }
    return { sent: true }
  } catch (error) {
    console.error(`[email:${options.tag}] Send failed:`, error instanceof Error ? error.message : "unknown error")
    return { sent: false, reason: "send failed" }
  }
}
