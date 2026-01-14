"use client"
import { motion } from "framer-motion"
import DemoSubmissionForm from "./demo-submission-form"

export default function DemoSubmissionSection() {
  return (
    <section className="relative w-full py-16 sm:py-24 md:py-32 bg-transparent z-20" id="join">{/* Higher z-index above particle filter */}
      <div className="max-w-4xl mx-auto px-4 sm:px-8 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: false, margin: "-100px" }}
          className="space-y-12 mb-24"
        >
          <div>
            <p className="text-xs text-[#A07E54] uppercase tracking-widest mb-6">Career</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-white/95">Join Our Team</h2>
          </div>
          <p className="text-lg text-gray-400 font-light max-w-4xl leading-relaxed">
          Whether you're an artist, promoter, or passionate about dance music, we'd love to hear from you.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.1 }}
          viewport={{ once: false, margin: "-100px" }}
        >
          <DemoSubmissionForm />
        </motion.div>

        <div className="h-32" />
      </div>
    </section>
  )
}
