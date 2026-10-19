// Rules shared by the demo submission form (client) and the API routes (server).
// Keep this file free of server-only imports: components/demo-submission-form.tsx imports it.

export const ROLE_OPTIONS = [
  { value: "artist", label: "Artist" },
  { value: "producer", label: "Producer" },
  { value: "dj", label: "DJ" },
  { value: "vocalist", label: "Vocalist / Songwriter" },
  { value: "engineer", label: "Mix / Mastering Engineer" },
  { value: "visual", label: "Visual Artist / Designer" },
  { value: "photo-video", label: "Photo / Video" },
  { value: "events", label: "Events / Promotion" },
  { value: "management", label: "Management / A&R" },
  { value: "other", label: "Other" },
] as const

export type RoleValue = (typeof ROLE_OPTIONS)[number]["value"]

export function roleLabel(value: string): string | null {
  return ROLE_OPTIONS.find((role) => role.value === value)?.label ?? null
}

export const FIELD_LIMITS = {
  name: 100,
  email: 254,
  message: 5000,
} as const

// Submissions sent faster than this after the form mounted are treated as bots.
export const MIN_FILL_MS = 3000

// Name of the honeypot field. Humans never see it; bots that fill every input do.
export const HONEYPOT_FIELD = "website"

const MB = 1024 * 1024

type UploadKind = {
  label: string
  maxBytes: number
  // extension -> accepted content types; the first entry is the canonical one
  extensions: Record<string, readonly string[]>
}

export const UPLOAD_KINDS = {
  audio: {
    label: "Audio",
    maxBytes: 50 * MB,
    extensions: {
      mp3: ["audio/mpeg", "audio/mp3", "audio/mpeg3", "audio/x-mpeg-3"],
      wav: ["audio/wav", "audio/x-wav", "audio/wave", "audio/vnd.wave"],
      aif: ["audio/aiff", "audio/x-aiff"],
      aiff: ["audio/aiff", "audio/x-aiff"],
      flac: ["audio/flac", "audio/x-flac"],
      m4a: ["audio/mp4", "audio/x-m4a", "audio/m4a"],
      aac: ["audio/aac", "audio/x-aac"],
      ogg: ["audio/ogg"],
    },
  },
  document: {
    label: "PDF",
    maxBytes: 10 * MB,
    extensions: {
      pdf: ["application/pdf"],
    },
  },
} as const satisfies Record<string, UploadKind>

export type UploadKindName = keyof typeof UPLOAD_KINDS

export const UPLOAD_PATH_PREFIX = "demos/"

// Value for the file input's `accept` attribute.
export const UPLOAD_ACCEPT = Object.values(UPLOAD_KINDS)
  .flatMap((kind) => Object.keys(kind.extensions).map((ext) => `.${ext}`))
  .join(",")

export const UPLOAD_HINT = "MP3, WAV, AIFF, FLAC, M4A, AAC or OGG up to 50 MB, or a PDF up to 10 MB"

export function fileExtension(name: string): string {
  const match = /\.([a-z0-9]+)$/i.exec(name)
  return match ? match[1].toLowerCase() : ""
}

export type ResolvedUpload = {
  kind: UploadKindName
  extension: string
  contentType: string
  allowedContentTypes: readonly string[]
  maxBytes: number
}

// Resolve a file name (and optional declared content type) against the allowlist.
// The extension decides the kind; a declared content type must match that extension.
export function resolveUpload(fileName: string, declaredType?: string | null): ResolvedUpload | null {
  const extension = fileExtension(fileName)
  for (const [kind, rules] of Object.entries(UPLOAD_KINDS) as [UploadKindName, UploadKind][]) {
    const types = rules.extensions[extension]
    if (!types) continue
    const declared = declaredType?.toLowerCase().split(";")[0].trim()
    if (declared && !types.includes(declared)) return null
    return {
      kind,
      extension,
      contentType: declared || types[0],
      allowedContentTypes: types,
      maxBytes: rules.maxBytes,
    }
  }
  return null
}

// Client-side check, mirrored by the server when it issues an upload token.
export function checkUploadFile(file: { name: string; size: number; type?: string }): string | null {
  // Browsers report an empty or inconsistent type for some audio formats, so only
  // the extension is trusted here; the canonical type is sent with the upload.
  const resolved = resolveUpload(file.name)
  if (!resolved) return `That file type isn't supported. Please upload ${UPLOAD_HINT}.`
  if (file.size <= 0) return "That file is empty."
  if (file.size > resolved.maxBytes) {
    const limit = Math.round(resolved.maxBytes / MB)
    return `${UPLOAD_KINDS[resolved.kind].label} files must be ${limit} MB or smaller.`
  }
  return null
}

// demos/<safe-base-name>.<ext>; the server adds a random suffix.
export function buildUploadPathname(fileName: string): string {
  const extension = fileExtension(fileName)
  const base = fileName
    .slice(0, extension ? -(extension.length + 1) : undefined)
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 60)
  return `${UPLOAD_PATH_PREFIX}${base || "file"}.${extension}`
}

export const UPLOAD_PATHNAME_PATTERN = /^demos\/[a-z0-9][a-z0-9-]{0,59}\.[a-z0-9]{2,5}$/
