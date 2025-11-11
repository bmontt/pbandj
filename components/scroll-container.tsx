"use client"

import { forwardRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import ParallaxBackground from "./parallax-background"
import EPKSection from "./epk-section"
import DemoSubmissionSection from "./demo-submission-section"
import HeaderWithCountdown from "./header-with-countdown"

interface ScrollContainerProps {
  audioReactivity: number
}

const ScrollContainer = forwardRef<HTMLDivElement, ScrollContainerProps>(({ audioReactivity }, ref) => {
  const { scrollY } = useScroll()

  const backgroundY = useTransform(scrollY, [0, 1000], [0, -200])
  const secondLayerY = useTransform(scrollY, [0, 1500], [0, -300])
  const thirdLayerY = useTransform(scrollY, [0, 2000], [0, -400])

  return (
    <div ref={ref} className="relative w-full bg-black">
      <ParallaxBackground backgroundY={backgroundY} secondLayerY={secondLayerY} thirdLayerY={thirdLayerY} />

      <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <HeaderWithCountdown audioReactivity={audioReactivity} />
      </div>

      <div className="relative z-10 pt-20">
        {/* EPK Section - seamlessly blended */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, margin: "-100px" }}
          className="w-full"
        >
          <EPKSection />
        </motion.div>

        {/* Demo Section - continuation of experience */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: false, margin: "-100px" }}
          className="w-full"
        >
          <DemoSubmissionSection />
        </motion.div>

        {/* Footer breathing room */}
        <div className="h-32" />
      </div>
    </div>
  )
})

ScrollContainer.displayName = "ScrollContainer"

export default ScrollContainer
