"use client"

import { motion } from "framer-motion"
import type React from "react"
import { useState } from "react"

export default function NewsletterSidebar() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/newsletter-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setSubmitted(true)
        setEmail("")
        setTimeout(() => setSubmitted(false), 3000)
      }
    } catch (error) {
      console.error("[v0] Newsletter signup error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: false, margin: "-100px" }}
      className="w-80 flex-shrink-0 sticky top-32 h-fit"
    >
      <div className="bg-gray-900/10 border border-gray-700/20 rounded-sm p-8 backdrop-blur-sm glow-yellow-sm">
        <h4 className="text-sm font-light text-white/90 mb-3 uppercase tracking-widest">Stay Updated</h4>
        <p className="text-sm text-gray-400 font-light mb-8 leading-relaxed">
          Get exclusive updates, event announcements, and behind-the-scenes content
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading || submitted}
            className="w-full px-4 py-3 bg-gray-900/20 border border-gray-700/30 rounded-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-600/50 focus:shadow-[0_0_15px_rgba(234,179,8,0.2)] transition-all disabled:opacity-50"
          />

          <motion.button
            type="submit"
            disabled={loading || submitted}
            whileHover={{ scale: 0.98 }}
            whileTap={{ scale: 0.95 }}
            className="w-full px-4 py-3 bg-yellow-600/60 hover:bg-yellow-600/70 text-black font-light rounded-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm glow-yellow"
          >
            {loading && "Signing up..."}
            {submitted && "Thanks!"}
            {!loading && !submitted && "Subscribe"}
          </motion.button>
        </form>

        {submitted && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-gray-400 mt-4 text-center"
          >
            Check your email for confirmation
          </motion.p>
        )}
      </div>

      <div className="mt-12 flex gap-4 justify-center">
        <motion.a
          href="#"
          className="text-gray-500 hover:text-yellow-600/70 transition-all hover:glow-yellow-sm"
          aria-label="Instagram"
          whileHover={{ scale: 1.1 }}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0m3.7 12c0 2-1.7 3.7-3.7 3.7s-3.7-1.7-3.7-3.7 1.7-3.7 3.7-3.7 3.7 1.7 3.7 3.7z" />
          </svg>
        </motion.a>
        <motion.a
          href="#"
          className="text-gray-500 hover:text-yellow-600/70 transition-all hover:glow-yellow-sm"
          aria-label="Twitter"
          whileHover={{ scale: 1.1 }}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2s9 5 20 5a9.5 9.5 0 00-9-5.5c4.75 2.25 7-7 7-7a10.6 10.6 0 01-10-10.5z" />
          </svg>
        </motion.a>
        <motion.a
          href="#"
          className="text-gray-500 hover:text-yellow-600/70 transition-all hover:glow-yellow-sm"
          aria-label="Spotify"
          whileHover={{ scale: 1.1 }}
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.6 0 12 0zm5.7 17.3c-.4.5-1.1.7-1.7.3-4.7-2.9-10.6-3.5-17.6-1.9-.6.2-1.3-.1-1.5-.7-.2-.6.1-1.3.7-1.5 7.5-1.8 14-1 19.1 2.2.5.3 1 .7 1.3 1.3.3.6 0 1.3-.5 1.7z" />
          </svg>
        </motion.a>
      </div>
    </motion.div>
  )
}
