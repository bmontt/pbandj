import { after, type NextRequest, NextResponse } from "next/server"
import React from "react"
import { getSupabaseServer } from "@/lib/supabase"
import { NewsletterConfirmationEmail } from "@/components/newsletter-confirmation-email"
import { sendEmail } from "@/lib/server/email"
import { enforceRateLimit, jsonError, readJsonBody, withTimeout } from "@/lib/server/http"
import { checkForBot, emailSchema } from "@/lib/server/validation"

// Same response whether the address is new, already subscribed, or a filtered bot,
// so the endpoint can't be used to check who is on the list.
const NEUTRAL_MESSAGE = "Thanks! If you're not already subscribed, a welcome email is on its way."
const DB_TIMEOUT_MS = 8_000

export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, "newsletter-signup", { limit: 5, windowMs: 10 * 60 * 1000 })
  if (limited) return limited

  const parsed = await readJsonBody(request, 4 * 1024)
  if (parsed.response) return parsed.response
  const body = parsed.data as Record<string, unknown>

  // There's no fill-time requirement here yet (no UI sends it); a form that sends
  // `elapsedMs` still gets the check.
  const bot = checkForBot(body, { requireTiming: false })
  if (bot !== "ok") {
    console.warn(`[newsletter-signup] Ignored signup (${bot})`)
    return NextResponse.json({ success: true, message: NEUTRAL_MESSAGE })
  }

  const result = emailSchema.safeParse(body.email)
  if (!result.success) {
    return jsonError(result.error.issues[0]?.message ?? "Please enter a valid email address.", 400, { field: "email" })
  }
  const email = result.data

  const supabase = getSupabaseServer()
  if (!supabase) {
    // Without the database there's no de-duplication, so no welcome email either.
    return jsonError("Newsletter signup is temporarily unavailable. Please try again later.", 503)
  }

  try {
    const { error } = await withTimeout(
      Promise.resolve(supabase.from("newsletter_subscriptions").insert({ email })),
      DB_TIMEOUT_MS,
      "Supabase insert",
    )

    if (error) {
      // 23505 = unique violation: already subscribed. Respond exactly as for a new address.
      if (error.code === "23505") return NextResponse.json({ success: true, message: NEUTRAL_MESSAGE })
      console.error("[newsletter-signup] Database insert failed:", error.code, error.message)
      return jsonError("We couldn't sign you up right now. Please try again later.", 500)
    }
  } catch (error) {
    console.error("[newsletter-signup] Database insert failed:", error instanceof Error ? error.message : "unknown error")
    return jsonError("We couldn't sign you up right now. Please try again later.", 500)
  }

  // Only newly inserted addresses get mail, and only once (the email column is unique).
  // Sent after the response so new and existing addresses take the same time to answer.
  after(async () => {
    await sendEmail({
      tag: "newsletter-signup",
      to: email,
      subject: "Welcome to the PB&J Sounds newsletter",
      react: React.createElement(NewsletterConfirmationEmail, { email }),
    })
  })

  return NextResponse.json({ success: true, message: NEUTRAL_MESSAGE })
}
