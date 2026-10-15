"use client"

import type React from "react"

import { useEffect, useId, useRef, useState } from "react"
import { motion } from "framer-motion"
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
        message: result.message || "Thank you for applying! We'll review your application and get back to you soon.",
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
    "w-full px-4 py-3 bg-gray-900/20 border rounded-sm text-white placeholder-gray-600 focus:outline-none transition-all disabled:opacity-50"
  const borderClass = (field: Field) => (fieldError(field) ? "border-[#C44D58]/70" : "border-gray-700/30")

  return (
    <form onSubmit={handleSubmit} noValidate aria-describedby={ids.status} className="relative space-y-8 z-20">{/* Ensure form is above particle filter */}
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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: false }}
        >
          <label htmlFor={ids.name} className="block text-xs font-light text-[#A07E54] mb-3 uppercase tracking-widest">
            Your Name <span aria-hidden="true">*</span>
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
            placeholder="Enter your name"
            className={`${inputClass} ${borderClass("name")} focus:border-[#B58657]/50 focus:shadow-[0_0_15px_rgba(181,134,87,0.2)]`}
          />
        </motion.div>

        {/* Email Field */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: false }}
        >
          <label htmlFor={ids.email} className="block text-xs font-light text-[#A07E54] mb-3 uppercase tracking-widest">
            Email Address <span aria-hidden="true">*</span>
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
            placeholder="your@email.com"
            className={`${inputClass} ${borderClass("email")} focus:border-[#C44D58]/50 focus:shadow-[0_0_15px_rgba(196,77,88,0.2)]`}
          />
        </motion.div>
      </div>

      {/* Role Field */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        viewport={{ once: false }}
      >
        <label htmlFor={ids.role} className="block text-xs font-light text-[#A07E54] mb-3 uppercase tracking-widest">
          Role / Position <span aria-hidden="true">*</span>
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
          className={`${inputClass} ${borderClass("role")} ${formData.role ? "" : "text-gray-600"} focus:border-[#935BAD]/50 focus:shadow-[0_0_15px_rgba(147,91,173,0.2)]`}
        >
          <option value="" disabled>
            What role are you interested in?
          </option>
          {ROLE_OPTIONS.map((role) => (
            <option key={role.value} value={role.value} className="text-white bg-gray-900">
              {role.label}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Message Field */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        viewport={{ once: false }}
      >
        <label htmlFor={ids.message} className="block text-xs font-light text-[#A07E54] mb-3 uppercase tracking-widest">
          Message <span aria-hidden="true">*</span>
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
          placeholder="Tell us about yourself and why you'd like to join PB&J..."
          rows={4}
          className={`${inputClass} ${borderClass("message")} focus:border-[#935BAD]/50 focus:shadow-[0_0_15px_rgba(147,91,173,0.2)] resize-none`}
        />
      </motion.div>

      {/* File Upload - OPTIONAL */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        viewport={{ once: false }}
      >
        <label
          id={ids.fileLabel}
          htmlFor={ids.file}
          className="block text-xs font-light text-gray-400 mb-3 uppercase tracking-widest"
        >
          Attachment (optional: demo, portfolio or CV)
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
            className={`w-full px-4 py-4 bg-gray-900/20 border-2 border-dashed ${fieldError("file") ? "border-[#C44D58]/70" : "border-gray-700/30"} rounded-sm text-gray-400 hover:border-yellow-600/50 hover:text-yellow-600/70 hover:shadow-[0_0_15px_rgba(234,179,8,0.2)] transition-all disabled:opacity-50 cursor-pointer`}
          >
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span id={`${ids.file}-button-text`} className="text-white">
                  {file.name}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span id={`${ids.file}-button-text`}>Click to upload or drag and drop</span>
              </div>
            )}
          </button>
        </div>
        <div className="mt-2 flex items-start justify-between gap-4">
          <p id={ids.fileHint} className="text-xs text-gray-500">
            {UPLOAD_HINT}.
          </p>
          {file && !busy && (
            <button
              type="button"
              onClick={clearFile}
              className="text-xs text-gray-400 underline underline-offset-2 hover:text-white shrink-0"
            >
              Remove file
            </button>
          )}
        </div>
      </motion.div>

      {/* Status Message: always mounted so screen readers announce changes */}
      <div id={ids.status} aria-live="polite" aria-atomic="true">
        {submitState.message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            role={submitState.status === "error" ? "alert" : "status"}
            className={`p-4 rounded-sm bg-gray-800/50 border ${
              submitState.status === "error" ? "text-gray-200 border-[#C44D58]/50" : "text-gray-300 border-gray-700/50"
            }`}
          >
            {submitState.message}
          </motion.div>
        )}
        {submitState.status === "uploading" && <p className="sr-only">Uploading attachment, {uploadProgress}%.</p>}
        {submitState.status === "submitting" && <p className="sr-only">Sending your application.</p>}
      </div>

      {/* Upload Progress */}
      {busy && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2" aria-hidden="true">
          <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden">
            {submitState.status === "uploading" ? (
              <div className="bg-yellow-600/60 h-full transition-[width] duration-200" style={{ width: `${uploadProgress}%` }} />
            ) : (
              <motion.div
                className="bg-yellow-600/60 h-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 3, ease: "easeInOut" }}
              />
            )}
          </div>
          <p className="text-sm text-gray-500 text-center">
            {submitState.status === "uploading" ? `Uploading your file... ${uploadProgress}%` : "Sending your application..."}
          </p>
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={busy}
        aria-disabled={busy}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        viewport={{ once: false }}
        whileHover={{ scale: 0.98, boxShadow: "0 0 20px rgba(181,134,87,0.3)" }}
        whileTap={{ scale: 0.95 }}
        className="relative w-full px-6 py-4 bg-[#B58657]/60 hover:bg-[#B58657]/70 text-white font-light rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg z-30"
      >
        {submitState.status === "uploading"
          ? "Uploading..."
          : submitState.status === "submitting"
            ? "Submitting..."
            : "Submit Application"}
      </motion.button>
    </form>
  )
}
