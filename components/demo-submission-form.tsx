"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"

interface SubmitState {
  status: "idle" | "loading" | "success" | "error"
  message?: string
}

export default function DemoSubmissionForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [file, setFile] = useState<File | null>(null)
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" })
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > 50 * 1024 * 1024) {
        setSubmitState({
          status: "error",
          message: "File must be smaller than 50MB",
        })
        return
      }
      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      setSubmitState({
        status: "error",
        message: "Please select an audio file",
      })
      return
    }

    setSubmitState({ status: "loading" })

    try {
      // Step 1: Get upload URL from Vercel Blob
      const uploadUrlResponse = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name }),
      })

      if (!uploadUrlResponse.ok) {
        throw new Error("Failed to get upload URL")
      }

      const { url } = await uploadUrlResponse.json()

      // Step 2: Upload file to Vercel Blob
      const uploadResponse = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      })

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file")
      }

      const uploadedFile = await uploadResponse.json()

      // Step 3: Submit demo with file URL
      const submitResponse = await fetch("/api/submit-demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          audioUrl: uploadedFile.url,
        }),
      })

      if (!submitResponse.ok) {
        throw new Error("Failed to submit demo")
      }

      setSubmitState({
        status: "success",
        message: "Demo submitted successfully! We will review it soon.",
      })

      // Reset form
      setFormData({ name: "", email: "", message: "" })
      setFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubmitState({ status: "idle" })
      }, 5000)
    } catch (error) {
      console.error("[v0] Submission error:", error)
      setSubmitState({
        status: "error",
        message: error instanceof Error ? error.message : "An error occurred. Please try again.",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative space-y-8 z-20">{/* Ensure form is above particle filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Name Field */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          viewport={{ once: false }}
        >
          <label className="block text-xs font-light text-[#A07E54] mb-3 uppercase tracking-widest">Your Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            disabled={submitState.status === "loading"}
            placeholder="Enter your name"
            className="w-full px-4 py-3 bg-gray-900/20 border border-gray-700/30 rounded-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#B58657]/50 focus:shadow-[0_0_15px_rgba(181,134,87,0.2)] transition-all disabled:opacity-50"
          />
        </motion.div>

        {/* Email Field */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: false }}
        >
          <label className="block text-xs font-light text-[#A07E54] mb-3 uppercase tracking-widest">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={submitState.status === "loading"}
            placeholder="your@email.com"
            className="w-full px-4 py-3 bg-gray-900/20 border border-gray-700/30 rounded-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#C44D58]/50 focus:shadow-[0_0_15px_rgba(196,77,88,0.2)] transition-all disabled:opacity-50"
          />
        </motion.div>
      </div>

      {/* Message Field */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        viewport={{ once: false }}
      >
        <label className="block text-xs font-light text-[#A07E54] mb-3 uppercase tracking-widest">
          Message (Optional)
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleInputChange}
          disabled={submitState.status === "loading"}
          placeholder="Tell us about your track..."
          rows={4}
          className="w-full px-4 py-3 bg-gray-900/20 border border-gray-700/30 rounded-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#935BAD]/50 focus:shadow-[0_0_15px_rgba(147,91,173,0.2)] transition-all disabled:opacity-50 resize-none"
        />
      </motion.div>

      {/* File Upload */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        viewport={{ once: false }}
      >
        <label className="block text-xs font-light text-gray-400 mb-3 uppercase tracking-widest">
          Audio File (MP3, WAV, FLAC - Max 50MB)
        </label>
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileChange}
            accept="audio/*"
            disabled={submitState.status === "loading"}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={submitState.status === "loading"}
            className="w-full px-4 py-4 bg-gray-900/20 border-2 border-dashed border-gray-700/30 rounded-sm text-gray-400 hover:border-yellow-600/50 hover:text-yellow-600/70 hover:shadow-[0_0_15px_rgba(234,179,8,0.2)] transition-all disabled:opacity-50 cursor-pointer"
          >
            {file ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-white">{file.name}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Click to upload or drag and drop</span>
              </div>
            )}
          </button>
        </div>
      </motion.div>

      {/* Status Message */}
      {submitState.message && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-sm ${
            submitState.status === "success"
              ? "bg-gray-800/50 text-gray-300 border border-gray-700/50"
              : "bg-gray-800/50 text-gray-300 border border-gray-700/50"
          }`}
        >
          {submitState.message}
        </motion.div>
      )}

      {/* Upload Progress */}
      {submitState.status === "loading" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
          <div className="w-full bg-gray-900 rounded-full h-2 overflow-hidden">
            <motion.div
              className="bg-yellow-600/60 h-full"
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "easeInOut" }}
            />
          </div>
          <p className="text-sm text-gray-500 text-center">Uploading your demo...</p>
        </motion.div>
      )}

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={submitState.status === "loading"}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        viewport={{ once: false }}
        whileHover={{ scale: 0.98, boxShadow: "0 0 20px rgba(181,134,87,0.3)" }}
        whileTap={{ scale: 0.95 }}
        className="relative w-full px-6 py-4 bg-[#B58657]/60 hover:bg-[#B58657]/70 text-white font-light rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg z-30"
      >
        {submitState.status === "loading" ? "Submitting..." : "Submit Demo"}
      </motion.button>
    </form>
  )
}
