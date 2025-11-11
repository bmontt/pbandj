"use client"
import { motion } from "framer-motion"
import DemoSubmissionForm from "./demo-submission-form"

export default function DemoSubmissionSection() {
  return (
    <section className="w-full py-32 bg-transparent" id="demo">
      <div className="max-w-4xl mx-auto px-8 md:px-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: false, margin: "-100px" }}
          className="space-y-12 mb-24 glow-yellow-sm"
        >
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-6">Participate</p>
            <h2 className="text-5xl md:text-6xl font-light text-white/95">Submit Your Demo</h2>
          </div>
          <p className="text-lg text-gray-400 font-light max-w-3xl leading-relaxed">
            Share your music and become part of the PB&J Sounds experience
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
