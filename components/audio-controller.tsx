"use client"

import { useEffect, useRef, useState } from "react"
import * as Tone from "tone"

interface AudioControllerProps {
  onReady: () => void
  isEntered: boolean
  onFFTUpdate?: (fftValue: number) => void
}

export default function AudioController({ onReady, isEntered, onFFTUpdate }: AudioControllerProps) {
  const synthRef = useRef<Tone.PolySynth<Tone.Synth> | null>(null)
  const filterRef = useRef<Tone.Filter | null>(null)
  const analyserRef = useRef<Tone.Analyser | null>(null)
  const isInitializedRef = useRef(false)
  const [fftValue, setFftValue] = useState(0)

  useEffect(() => {
    const initAudio = async () => {
      if (isInitializedRef.current) return

      try {
        await Tone.start()

        // Create analyser for FFT data
        const analyser = new Tone.Analyser("waveform", 256)

        // Create filter for low-pass effect
        const filter = new Tone.Filter({
          frequency: 800,
          type: "lowpass",
        })
          .connect(analyser)
          .toDestination()

        // Create synth
        const synth = new Tone.PolySynth(Tone.Synth, {
          oscillator: { type: "sine" },
          envelope: {
            attack: 0.005,
            decay: 0.1,
            sustain: 0.3,
            release: 1,
          },
        }).connect(filter)

        synthRef.current = synth
        filterRef.current = filter
        analyserRef.current = analyser
        isInitializedRef.current = true

        // Play ambient mix
        playAmbientMix(synth)

        const updateFFT = () => {
          if (analyserRef.current) {
            const waveform = analyserRef.current.getValue() as Float32Array
            const rms = Math.sqrt(waveform.reduce((sum, val) => sum + val * val, 0) / waveform.length)
            const normalizedRms = Math.min(rms * 2, 1)
            setFftValue(normalizedRms)
            onFFTUpdate?.(normalizedRms)
          }
          requestAnimationFrame(updateFFT)
        }
        updateFFT()

        onReady()
      } catch (error) {
        console.error("[v0] Audio initialization error:", error)
      }
    }

    initAudio()

    return () => {
      if (synthRef.current) {
        synthRef.current.triggerRelease()
      }
    }
  }, [onReady, onFFTUpdate])

  useEffect(() => {
    if (!filterRef.current) return

    if (isEntered) {
      // Unfilter when entering
      filterRef.current.frequency.rampTo(20000, 1)
    } else {
      // Apply low-pass filter on landing
      filterRef.current.frequency.rampTo(800, 0.5)
    }
  }, [isEntered])

  return null
}

function playAmbientMix(synth: Tone.PolySynth<Tone.Synth>) {
  const now = Tone.now()
  const baseSynth = synth as any

  // Play ambient drone-like notes
  baseSynth.triggerAttack(["C3", "G3"], now)
  baseSynth.triggerRelease(["C3", "G3"], now + 8)
}
