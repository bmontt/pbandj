"use client"

import type React from "react"

import { useEffect, useId, useRef, useState } from "react"
import { upload } from "@vercel/blob/client"
import {
  FIELD_LIMITS,
  HONEYPOT_FIELD,
  ROLE_OPTIONS,
  UPLOAD_ACCEPT,
  UPLOAD_HINT,
  buildUploadPathname,
  checkUploadFile,
  resolveUpload,
} from "@/lib/server/submission-rules"

type Field = "name" | "email" | "role" | "message" | "file"

interface SubmitState {
  status: "idle" | "uploading" | "submitting" | "success" | "error"
  message?: string
  field?: Field
}

const MULTIPART_THRESHOLD = 8 * 1024 * 1024
const EMPTY_FORM = { name: "", email: "", role: "", message: "" }

export default function DemoSubmissionForm() {
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [honeypot, setHoneypot] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" })
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mountedAtRef = useRef(0)
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const id = useId()
  const ids = {
    name: `${id}-name`,
    email: `${id}-email`,
    role: `${id}-role`,
    message: `${id}-message`,
    file: `${id}-file`,
    fileButton: `${id}-file-button`,
    fileLabel: `${id}-file-label`,
    fileHint: `${id}-file-hint`,
    honeypot: `${id}-website`,
    status: `${id}-status`,
  }

  useEffect(() => {
    mountedAtRef.current = performance.now()
    return () => clearTimeout(resetTimerRef.current)
  }, [])

  const busy = submitState.status === "uploading" || submitState.status === "submitting"
  const fieldError = (field: Field) => submitState.status === "error" && submitState.field === field

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (submitState.status === "error" && submitState.field === name) setSubmitState({ status: "idle" })
  }

  const selectFile = (selectedFile: File | undefined) => {
    if (!selectedFile) return
    const problem = checkUploadFile(selectedFile)
    if (problem) {
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""
      setSubmitState({ status: "error", message: problem, field: "file" })
      return
    }
    setFile(selectedFile)
    if (submitState.status === "error" && submitState.field === "file") setSubmitState({ status: "idle" })
  }

  const clearFile = () => {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (busy) return
    selectFile(e.dataTransfer.files?.[0])
  }

  const validate = (): SubmitState | null => {
    if (!formData.name.trim()) return { status: "error", field: "name", message: "Please enter your name." }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return { status: "error", field: "email", message: "Please enter a valid email address." }
    }
    if (!formData.role) return { status: "error", field: "role", message: "Please choose a role from the list." }
    if (!formData.message.trim()) return { status: "error", field: "message", message: "Please add a message." }
    if (file) {
      const problem = checkUploadFile(file)
      if (problem) return { status: "error", field: "file", message: problem }
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    clearTimeout(resetTimerRef.current)

    const invalid = validate()
    if (invalid) {
      setSubmitState(invalid)
      if (invalid.field) document.getElementById(invalid.field === "file" ? ids.fileButton : ids[invalid.field])?.focus()
      return
    }

    let fileUrl: string | null = null

    // Step 1: upload the optional attachment straight to Vercel Blob. The server only
    // issues a scoped, short-lived token for this one file.
    if (file) {
      setUploadProgress(0)
      setSubmitState({ status: "uploading" })
      try {
        const contentType = resolveUpload(file.name)?.contentType
        const blob = await upload(buildUploadPathname(file.name), file, {
          access: "public",
          handleUploadUrl: "/api/upload-url",
          clientPayload: JSON.stringify({ size: file.size, contentType }),
          contentType,
          multipart: file.size > MULTIPART_THRESHOLD,
          onUploadProgress: ({ percentage }) => setUploadProgress(Math.round(percentage)),
        })
        fileUrl = blob.url
      } catch (error) {
        console.error("Attachment upload failed:", error)
        setSubmitState({
          status: "error",
          field: "file",
          message:
            "We couldn't upload your file. Check your connection and try again, or remove the attachment and submit without it.",
        })
        return
      }
    }

    // Step 2: submit the application with the optional file URL.
    setSubmitState({ status: "submitting" })
    try {
      const submitResponse = await fetch("/api/submit-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          audioUrl: fileUrl,
          [HONEYPOT_FIELD]: honeypot,
          elapsedMs: Math.round(performance.now() - mountedAtRef.current),
        }),
      })

      const result = (await submitResponse.json().catch(() => null)) as
        | { success?: boolean; message?: string; error?: string; field?: string }
        | null

      if (!submitResponse.ok || !result?.success) {
        const field = result?.field === "audioUrl" ? "file" : (result?.field as Field | undefined)
        setSubmitState({
          status: "error",
          field,
          message:
            result?.error ||
            (submitResponse.status === 429
              ? "Too many submissions. Please wait a few minutes and try again."
              : "Something went wrong sending your application. Please try again."),
        })
        return
      }

      setSubmitState({
        status: "success",
        message: result.message || "Application sent. We'll review it and get back to you.",
      })
      setFormData(EMPTY_FORM)
      clearFile()
      resetTimerRef.current = setTimeout(() => setSubmitState({ status: "idle" }), 8000)
    } catch (error) {
      console.error("Submission error:", error)
      setSubmitState({
        status: "error",
        message: "We couldn't reach the server. Check your connection and try again.",
      })
    }
  }

  const inputClass =
    "w-full border bg-transparent px-4 py-3 font-sans text-body-sm text-foreground placeholder:text-foreground/35 transition-colors focus:border-foreground/45 focus:outline-none disabled:opacity-50"
  const borderClass = (field: Field) => (fieldError(field) ? "border-[var(--b-hi)]" : "border-border")
  const labelClass = "mb-2 block font-mono text-xs text-foreground/60"

  return (
    <form onSubmit={handleSubmit} noValidate aria-describedby={ids.status} className="relative space-y-7">
      {/* Honeypot: hidden from people and assistive tech; bots that fill every field trip it. */}
      <div aria-hidden="true" className="absolute -left-[10000px] top-auto w-px h-px overflow-hidden">
        <label htmlFor={ids.honeypot}>Website (leave this empty)</label>
        <input
          id={ids.honeypot}
          type="text"
          name={HONEYPOT_FIELD}
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Name Field */}
        <div>
          <label htmlFor={ids.name} className={labelClass}>
            name <span aria-hidden="true">*</span>
          </label>
          <input
            id={ids.name}
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            aria-required="true"
            aria-invalid={fieldError("name") || undefined}
            maxLength={FIELD_LIMITS.name}
            autoComplete="name"
            disabled={busy}
            placeholder="Your name"
            className={`${inputClass} ${borderClass("name")}`}
          />
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor={ids.email} className={labelClass}>
            email <span aria-hidden="true">*</span>
          </label>
          <input
            id={ids.email}
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            aria-required="true"
            aria-invalid={fieldError("email") || undefined}
            maxLength={FIELD_LIMITS.email}
            autoComplete="email"
            disabled={busy}
            placeholder="you@example.com"
            className={`${inputClass} ${borderClass("email")}`}
          />
        </div>
      </div>

      {/* Role Field */}
      <div>
        <label htmlFor={ids.role} className={labelClass}>
          role <span aria-hidden="true">*</span>
        </label>
        <select
          id={ids.role}
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          required
          aria-required="true"
          aria-invalid={fieldError("role") || undefined}
          disabled={busy}
          className={`${inputClass} ${borderClass("role")} ${formData.role ? "" : "text-foreground/35"}`}
        >
          <option value="" disabled>
            Choose a role
          </option>
          {ROLE_OPTIONS.map((role) => (
            <option key={role.value} value={role.value} className="bg-background text-foreground">
              {role.label}
            </option>
          ))}
        </select>
      </div>

      {/* Message Field */}
      <div>
        <label htmlFor={ids.message} className={labelClass}>
          message <span aria-hidden="true">*</span>
        </label>
        <textarea
          id={ids.message}
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          required
          aria-required="true"
          aria-invalid={fieldError("message") || undefined}
          maxLength={FIELD_LIMITS.message}
          disabled={busy}
          placeholder="A short introduction, and links to your work"
          rows={4}
          className={`${inputClass} ${borderClass("message")} resize-none`}
        />
      </div>

      {/* File Upload - OPTIONAL */}
      <div>
        <label
          id={ids.fileLabel}
          htmlFor={ids.file}
          className={labelClass}
        >
          attachment (optional): demo, portfolio or CV
        </label>
        <div className="relative">
          <input
            id={ids.file}
            ref={fileInputRef}
            type="file"
            accept={UPLOAD_ACCEPT}
            onChange={(e) => selectFile(e.target.files?.[0])}
            disabled={busy}
            tabIndex={-1}
            className="sr-only"
          />
          <button
            id={ids.fileButton}
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            disabled={busy}
            aria-labelledby={`${ids.fileLabel} ${ids.file}-button-text`}
            aria-describedby={ids.fileHint}
            aria-invalid={fieldError("file") || undefined}
            className={`min-h-11 w-full cursor-pointer border border-dashed px-4 py-4 font-mono text-xs text-foreground/60 transition-colors hover:border-foreground/40 hover:text-foreground disabled:opacity-50 ${fieldError("file") ? "border-[var(--b-hi)]" : "border-border"}`}
          >
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span id={`${ids.file}-button-text`} className="text-foreground">
                  {file.name}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span id={`${ids.file}-button-text`}>choose a file or drop it here</span>
              </div>
            )}
          </button>
        </div>
        <div className="mt-2 flex items-start justify-between gap-4">
          <p id={ids.fileHint} className="font-mono text-xs text-foreground/45">
            {UPLOAD_HINT}.
          </p>
          {file && !busy && (
            <button
              type="button"
              onClick={clearFile}
              className="min-h-11 shrink-0 font-mono text-xs text-foreground/60 underline underline-offset-4 hover:text-foreground"
            >
              Remove file
            </button>
          )}
        </div>
      </div>

      {/* Status Message: always mounted so screen readers announce changes */}
      <div id={ids.status} aria-live="polite" aria-atomic="true">
        {submitState.message && (
          <div
            role={submitState.status === "error" ? "alert" : "status"}
            className={`border px-4 py-3 font-sans text-body-sm ${
              submitState.status === "error" ? "border-[var(--b-hi)] text-foreground" : "border-border text-foreground/85"
            }`}
          >
            {submitState.message}
          </div>
        )}
        {submitState.status === "uploading" && <p className="sr-only">Uploading attachment, {uploadProgress}%.</p>}
        {submitState.status === "submitting" && <p className="sr-only">Sending your application.</p>}
      </div>

      {/* Upload Progress */}
      {busy && (
        <div className="space-y-2" aria-hidden="true">
          <div className="h-px w-full overflow-hidden bg-border">
            {submitState.status === "uploading" ? (
              <div className="h-full bg-foreground/70 transition-[width] duration-200" style={{ width: `${uploadProgress}%` }} />
            ) : (
              <div className="h-full w-full origin-left animate-pulse bg-foreground/50" />
            )}
          </div>
          <p className="font-mono text-xs text-foreground/55">
            {submitState.status === "uploading" ? `uploading · ${uploadProgress}%` : "sending"}
          </p>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={busy}
        aria-disabled={busy}
        className="group flex min-h-12 w-full items-center justify-between border border-foreground/70 px-5 py-4 font-mono text-sm text-foreground transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitState.status === "uploading"
          ? "uploading"
          : submitState.status === "submitting"
            ? "sending"
            : "send application"}
        <span aria-hidden="true" className="nudge">→</span>
      </button>
    </form>
  )
}
