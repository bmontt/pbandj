import { type NextRequest, NextResponse } from "next/server"
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { checkUploadRequest, isBlobConfigured } from "@/lib/server/blob"
import { enforceRateLimit, jsonError, readJsonBody } from "@/lib/server/http"

// Issues short-lived, single-file client upload tokens for the demo form
// (Vercel Blob client uploads). The read-write token never leaves the server:
// handleUpload signs a scoped client token that only allows one pathname under
// demos/, the allowed content types for that file, and the size limit for its type.

const TOKEN_TTL_MS = 30 * 60 * 1000

class UploadRejectedError extends Error {}

export async function POST(request: NextRequest) {
  const limited = enforceRateLimit(request, "upload-url", { limit: 10, windowMs: 10 * 60 * 1000 })
  if (limited) return limited

  const parsed = await readJsonBody(request, 4 * 1024)
  if (parsed.response) return parsed.response
  const body = parsed.data as HandleUploadBody

  // Only token requests are accepted. No onUploadCompleted callback is registered,
  // so Vercel Blob never posts "blob.upload-completed" events here.
  if (body.type !== "blob.generate-client-token" || !body.payload || typeof body.payload !== "object") {
    return jsonError("Invalid upload request.", 400)
  }

  // Validate before handleUpload: it needs the read-write token before it runs
  // onBeforeGenerateToken, and bad requests should be refused either way.
  const check = checkUploadRequest(body.payload.pathname, body.payload.clientPayload)
  if (!check.ok) return jsonError(check.message, 400)

  if (!isBlobConfigured()) {
    console.error("[upload-url] BLOB_READ_WRITE_TOKEN is not set; file uploads are disabled")
    return jsonError("File uploads are temporarily unavailable. You can submit without an attachment.", 503)
  }

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const recheck = checkUploadRequest(pathname, clientPayload)
        if (!recheck.ok) throw new UploadRejectedError(recheck.message)
        return {
          allowedContentTypes: [...recheck.upload.allowedContentTypes],
          maximumSizeInBytes: recheck.upload.maxBytes,
          addRandomSuffix: true,
          allowOverwrite: false,
          validUntil: Date.now() + TOKEN_TTL_MS,
        }
      },
    })
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    if (error instanceof UploadRejectedError) return jsonError(error.message, 400)
    // Log only the message: BlobError messages don't include the token.
    console.error("[upload-url] Failed to issue upload token:", error instanceof Error ? error.message : "unknown error")
    return jsonError("Couldn't start the upload. Please try again.", 500)
  }
}
