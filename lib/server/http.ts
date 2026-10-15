import { NextResponse } from "next/server"
import { rateLimit } from "./rate-limit"

// On Vercel, x-forwarded-for is set by the platform (client-supplied values are
// overwritten), so its first entry is the client IP. Locally it is whatever the
// caller sends, which is fine for a best-effort limiter.
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const first = forwarded?.split(",")[0]?.trim()
  if (first) return first
  return request.headers.get("x-real-ip")?.trim() || "unknown"
}

export function jsonError(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ success: false, error: message, ...extra }, { status })
}

// Returns a 429 response when the caller is over the limit, otherwise null.
export function enforceRateLimit(
  request: Request,
  scope: string,
  options: { limit: number; windowMs: number },
  message = "Too many requests. Please wait a few minutes and try again.",
) {
  const result = rateLimit(scope, getClientIp(request), options)
  if (result.ok) return null
  console.warn(`[${scope}] rate limit hit`)
  const response = jsonError(message, 429)
  response.headers.set("Retry-After", String(result.retryAfterSeconds))
  return response
}

// Either `data` (parsed JSON object) or an error `response` to return as-is.
export type JsonBodyResult = { data: unknown; response?: undefined } | { data?: undefined; response: NextResponse }

// Reads a JSON body with a size cap so oversized payloads are rejected before parsing.
export async function readJsonBody(request: Request, maxBytes: number): Promise<JsonBodyResult> {
  const declared = Number(request.headers.get("content-length") || 0)
  if (declared > maxBytes) {
    return { response: jsonError("Request is too large.", 413) }
  }

  let text: string
  try {
    text = await request.text()
  } catch {
    return { response: jsonError("Invalid request.", 400) }
  }
  if (new TextEncoder().encode(text).length > maxBytes) {
    return { response: jsonError("Request is too large.", 413) }
  }

  try {
    const data: unknown = JSON.parse(text)
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return { response: jsonError("Invalid request.", 400) }
    }
    return { data }
  } catch {
    return { response: jsonError("Invalid request.", 400) }
  }
}

// Resolves to the promise's value, or rejects after `ms` milliseconds.
export function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}
