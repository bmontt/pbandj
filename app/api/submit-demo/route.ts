import { type NextRequest, NextResponse } from "next/server"
import React from "react"
import { getSupabaseServer } from "@/lib/supabase"
import { DemoSubmissionEmail } from "@/components/demo-submission-email"
import { isProjectBlobUrl } from "@/lib/server/blob"
import { sendEmail } from "@/lib/server/email"
import { enforceRateLimit, jsonError, readJsonBody, withTimeout } from "@/lib/server/http"
import { roleLabel } from "@/lib/server/submission-rules"
import { checkForBot, demoSubmissionSchema, firstIssue, type DemoSubmission } from "@/lib/server/validation"

const SUCCESS_MESSAGE = "Thank you for applying! We'll review your application and get back to you soon."
const DB_TIMEOUT_MS = 8_000

export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(
    request,
    "submit-demo",
    { limit: 5, windowMs: 10 * 60 * 1000 },
    "Too many submissions from your connection. Please wait a few minutes and try again.",
  )
  if (limited) return limited

  const parsed = await readJsonBody(request, 32 * 1024)
  if (parsed.response) return parsed.response
  const body = parsed.data as Record<string, unknown>

  // Bots get the same response as a real submission, so they can't tell they were filtered.
  const bot = checkForBot(body, { requireTiming: true })
  if (bot === "missing-timing") {
    return jsonError("Please reload the page and try again.", 400)
  }
  if (bot !== "ok") {
    console.warn(`[submit-demo] Ignored submission (${bot})`)
    return NextResponse.json({ success: true, message: SUCCESS_MESSAGE })
  }

  const result = demoSubmissionSchema.safeParse(body)
  if (!result.success) {
    const { field, message } = firstIssue(result.error)
    return jsonError(message, 400, { field })
  }
  const submission = result.data

  if (submission.audioUrl && !isProjectBlobUrl(submission.audioUrl)) {
    return jsonError("The attachment link is invalid. Please upload the file again.", 400, { field: "audioUrl" })
  }

  const [dbSaved, emailResult] = await Promise.all([saveSubmission(submission), notifyTeam(submission)])

  if (!dbSaved && !emailResult.sent) {
    console.error("[submit-demo] Submission lost: database insert and notification email both failed")
    return jsonError("We couldn't send your submission right now. Please try again later.", 500)
  }
  if (!dbSaved) console.error("[submit-demo] Database insert failed; submission delivered by email only")
  if (!emailResult.sent) console.error(`[submit-demo] Notification email not sent (${emailResult.reason}); saved to database only`)

  return NextResponse.json({ success: true, message: SUCCESS_MESSAGE })
}

// Inserts the submission, adapting to older schemas instead of failing:
// - no `role` column yet (scripts/03-submissions-role-optional-audio.sql adds it): retry without it
// - `audio_url` still NOT NULL (same migration relaxes it): retry with an empty string
async function saveSubmission(submission: DemoSubmission): Promise<boolean> {
  const supabase = getSupabaseServer()
  if (!supabase) return false

  const row: Record<string, string | null> = {
    name: submission.name,
    email: submission.email,
    role: submission.role,
    message: submission.message,
    audio_url: submission.audioUrl,
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const { error } = await withTimeout(
        Promise.resolve(supabase.from("submissions").insert(row)),
        DB_TIMEOUT_MS,
        "Supabase insert",
      )
      if (!error) return true

      const detail = `${error.message ?? ""} ${error.details ?? ""}`
      const missingColumn = error.code === "PGRST204" || error.code === "42703"
      if (missingColumn && "role" in row && /\brole\b/.test(detail)) {
        console.warn("[submit-demo] submissions.role column missing; saving without it (run scripts/03-submissions-role-optional-audio.sql)")
        delete row.role
        continue
      }
      if (error.code === "23502" && row.audio_url === null && /audio_url/.test(detail)) {
        console.warn("[submit-demo] submissions.audio_url is NOT NULL; saving empty string (run scripts/03-submissions-role-optional-audio.sql)")
        row.audio_url = ""
        continue
      }
      console.error("[submit-demo] Database insert failed:", error.code, error.message)
      return false
    } catch (error) {
      console.error("[submit-demo] Database insert failed:", error instanceof Error ? error.message : "unknown error")
      return false
    }
  }
  return false
}

function notifyTeam(submission: DemoSubmission) {
  const role = roleLabel(submission.role) ?? submission.role
  return sendEmail({
    tag: "submit-demo",
    to: { env: "DEMO_RECIPIENT_EMAIL" },
    replyTo: submission.email,
    subject: `New ${role} submission from ${submission.name}`,
    react: React.createElement(DemoSubmissionEmail, {
      name: submission.name,
      email: submission.email,
      role,
      message: submission.message,
      audioUrl: submission.audioUrl,
    }),
  })
}
