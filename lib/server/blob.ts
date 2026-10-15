import {
  UPLOAD_PATH_PREFIX,
  UPLOAD_PATHNAME_PATTERN,
  checkUploadFile,
  resolveUpload,
  type ResolvedUpload,
} from "./submission-rules"

const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com"

export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

// Public host of this project's Blob store, derived from the store ID embedded in
// the read-write token (vercel_blob_rw_<storeId>_<secret>). Only the store ID is
// used; the secret part never leaves this function.
function projectBlobHost(): string | null {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) return null
  const storeId = token.split("_")[3]
  if (!storeId || !/^[a-zA-Z0-9]+$/.test(storeId)) return null
  return `${storeId.toLowerCase()}${BLOB_HOST_SUFFIX}`
}

// Accepts only https URLs under demos/ on this project's Blob store. If the token
// isn't configured the store is unknown, so any Vercel Blob public host is accepted
// (uploads can't happen in that state anyway).
export function isProjectBlobUrl(value: string): boolean {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return false
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port) return false
  if (!url.pathname.startsWith(`/${UPLOAD_PATH_PREFIX}`)) return false
  if (!resolveUpload(url.pathname)) return false

  const host = url.hostname.toLowerCase()
  const expected = projectBlobHost()
  if (expected) return host === expected
  return host.endsWith(BLOB_HOST_SUFFIX) && /^[a-z0-9]+$/.test(host.slice(0, -BLOB_HOST_SUFFIX.length))
}

export type UploadCheck =
  | { ok: true; upload: ResolvedUpload; message?: undefined }
  | { ok: false; message: string; upload?: undefined }

// Validates a client-upload token request. clientPayload is JSON sent by the form:
// { size: number, contentType?: string }. The returned limits are baked into the
// client token, so Vercel Blob itself rejects a different type or a larger file.
export function checkUploadRequest(pathname: unknown, clientPayload: unknown): UploadCheck {
  if (typeof pathname !== "string" || !UPLOAD_PATHNAME_PATTERN.test(pathname)) {
    return { ok: false, message: "Invalid file name." }
  }

  let payload: { size?: unknown; contentType?: unknown } = {}
  if (typeof clientPayload === "string" && clientPayload.length <= 500) {
    try {
      const parsed: unknown = JSON.parse(clientPayload)
      if (parsed && typeof parsed === "object") payload = parsed as typeof payload
    } catch {
      return { ok: false, message: "Invalid upload request." }
    }
  } else {
    return { ok: false, message: "Invalid upload request." }
  }

  const size = payload.size
  if (typeof size !== "number" || !Number.isFinite(size)) {
    return { ok: false, message: "Invalid upload request." }
  }
  const contentType = typeof payload.contentType === "string" ? payload.contentType : null

  const upload = resolveUpload(pathname, contentType)
  const problem = checkUploadFile({ name: pathname, size })
  if (!upload || problem) {
    return { ok: false, message: problem ?? "That file type isn't supported." }
  }
  return { ok: true, upload }
}
