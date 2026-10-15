import { z } from "zod"
import { FIELD_LIMITS, HONEYPOT_FIELD, MIN_FILL_MS, ROLE_OPTIONS } from "./submission-rules"

// Strip control characters (keeping newlines/tabs in multi-line text) and trim.
function clean(value: string, { multiline = false } = {}) {
  const pattern = multiline ? /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g : /[\u0000-\u001F\u007F]/g
  return value.replace(pattern, "").trim()
}

export const emailSchema = z
  .string({ required_error: "Please enter your email address.", invalid_type_error: "Please enter a valid email address." })
  .transform((value) => clean(value).toLowerCase())
  .pipe(
    z
      .string()
      .min(1, "Please enter your email address.")
      .max(FIELD_LIMITS.email, "That email address is too long.")
      .email("Please enter a valid email address."),
  )

const roleValues = ROLE_OPTIONS.map((role) => role.value) as [string, ...string[]]

export const demoSubmissionSchema = z.object({
  name: z
    .string({ required_error: "Please enter your name.", invalid_type_error: "Please enter your name." })
    .transform((value) => clean(value))
    .pipe(
      z
        .string()
        .min(1, "Please enter your name.")
        .max(FIELD_LIMITS.name, `Name must be ${FIELD_LIMITS.name} characters or fewer.`),
    ),
  email: emailSchema,
  role: z.preprocess(
    (value) => (typeof value === "string" ? value.trim().toLowerCase() : value),
    z.enum(roleValues, { errorMap: () => ({ message: "Please choose a role from the list." }) }),
  ),
  message: z
    .string({ required_error: "Please add a message.", invalid_type_error: "Please add a message." })
    .transform((value) => clean(value, { multiline: true }))
    .pipe(
      z
        .string()
        .min(1, "Please add a message.")
        .max(FIELD_LIMITS.message, `Message must be ${FIELD_LIMITS.message} characters or fewer.`),
    ),
  // Optional attachment; host and path are checked separately against the Blob store.
  audioUrl: z
    .union([z.string().max(2048, "Invalid attachment."), z.null(), z.undefined()])
    .transform((value) => (value ? value.trim() : null)),
})

export type DemoSubmission = z.infer<typeof demoSubmissionSchema>

// First issue as { field, message } for a 400 response.
export function firstIssue(error: z.ZodError): { field: string | null; message: string } {
  const issue = error.issues[0]
  return {
    field: typeof issue?.path[0] === "string" ? issue.path[0] : null,
    message: issue?.message ?? "Invalid request.",
  }
}

export type BotCheck = "ok" | "honeypot" | "too-fast" | "missing-timing"

// Honeypot plus minimum fill time. `elapsedMs` is measured by the form from mount to
// submit. A client can forge it, so this only filters naive bots.
export function checkForBot(body: Record<string, unknown>, { requireTiming }: { requireTiming: boolean }): BotCheck {
  const honeypot = body[HONEYPOT_FIELD]
  if (typeof honeypot === "string" ? honeypot.trim() !== "" : honeypot != null) return "honeypot"

  const elapsed = body.elapsedMs
  if (elapsed === undefined || elapsed === null) return requireTiming ? "missing-timing" : "ok"
  if (typeof elapsed !== "number" || !Number.isFinite(elapsed) || elapsed < MIN_FILL_MS) return "too-fast"
  return "ok"
}
