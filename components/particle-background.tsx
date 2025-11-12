"use client"

import { useRef, useEffect } from 'react'

// PB&J Color Palette
const PBJ_COLORS = {
  // Peanut butter shades
  peanutButter: 'rgba(181, 134, 87, 0.8)',     // Rich peanut butter brown
  peanutButterLight: 'rgba(205, 164, 127, 0.6)', // Light peanut butter
  peanutButterDark: 'rgba(139, 102, 66, 0.9)',   // Dark peanut butter
  
  // Jelly/jam shades  
  grapeJelly: 'rgba(147, 91, 173, 0.7)',       // Purple grape jelly
  strawberryJam: 'rgba(196, 77, 88, 0.7)',     // Red strawberry jam
  apricotJam: 'rgba(234, 154, 108, 0.6)',      // Orange apricot jam
  
  // Bread shades
  wholeWheatBread: 'rgba(160, 126, 84, 0.5)',  // Whole wheat bread
  whiteBread: 'rgba(245, 235, 220, 0.4)',      // White bread crust
  toastedBread: 'rgba(198, 154, 108, 0.6)',    // Toasted bread
  
  // Connection lines (neutral bread crust)
  connections: 'rgba(160, 126, 84, 0.3)'       // Subtle bread crust color
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  currentVx: number // Current velocity for smooth movement
  currentVy: number // Current velocity for smooth movement
  scrollSensitivity: number // Individual scroll responsiveness
  baseSpeed: number // Individual movement speed multiplier
  directionBias: number // Tendency to move in certain directions (-1 to 1)
  orbitRadius: number // For circular/orbital movement patterns
  orbitSpeed: number // Speed of orbital movement
  phase: number // Phase offset for varied behavior
  color: string // Individual PB&J color
  // Assembly animation properties
  targetX: number // Final target position
  targetY: number // Final target position
  startX: number // Starting position (off-screen)
  startY: number // Starting position (off-screen)
  assemblyProgress: number // Animation progress (0-1)
  assemblyVelocity: number // How fast this particle assembles
}

interface ParticleCanvasProps {
  scrollY: number
  isAssembling: boolean // Whether particles should be assembling into place
}

function ParticleCanvas({ scrollY, isAssembling }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number | null>(null)
  const lastScrollY = useRef<number>(0)
  const currentScrollY = useRef<number>(0)

  // Update current scroll position without recreating the animation loop
  useEffect(() => {
    currentScrollY.current = scrollY
  }, [scrollY])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // Initialize particles
    const initParticles = () => {
      const particles: Particle[] = []
      const particleCount = 40 // Reduced from 80

      for (let i = 0; i < particleCount; i++) {
        // Randomly assign PB&J colors to particles
        const colorOptions = [
          PBJ_COLORS.peanutButter,
          PBJ_COLORS.peanutButterLight, 
          PBJ_COLORS.peanutButterDark,
          PBJ_COLORS.grapeJelly,
          PBJ_COLORS.strawberryJam,
          PBJ_COLORS.apricotJam,
          PBJ_COLORS.wholeWheatBread,
          PBJ_COLORS.toastedBread
        ]
        
        // Starting position (assembled position where particles begin)
        const startX = Math.random() * canvas.width
        const startY = Math.random() * canvas.height
        
        // Target position (off-screen dispersal location)
        const edge = Math.floor(Math.random() * 4) // 0=top, 1=right, 2=bottom, 3=left
        let targetX, targetY
        
        switch (edge) {
          case 0: // Disperse to top
            targetX = startX + (Math.random() - 0.5) * canvas.width * 0.5
            targetY = -100 - Math.random() * 200
            break
          case 1: // Disperse to right
            targetX = canvas.width + 100 + Math.random() * 200
            targetY = startY + (Math.random() - 0.5) * canvas.height * 0.5
            break
          case 2: // Disperse to bottom
            targetX = startX + (Math.random() - 0.5) * canvas.width * 0.5
            targetY = canvas.height + 100 + Math.random() * 200
            break
          case 3: // Disperse to left
            targetX = -100 - Math.random() * 200
            targetY = startY + (Math.random() - 0.5) * canvas.height * 0.5
            break
          default:
            targetX = startX
            targetY = startY
        }
        
        particles.push({
          x: startX, // Start at assembled position
          y: startY,
          vx: (Math.random() - 0.5) * 0.2, // Reduced base velocity for gentler direction (was 0.4)
          vy: (Math.random() - 0.5) * 0.2, // Reduced base velocity for gentler direction (was 0.4)
          size: Math.random() * 2 + 1,
          currentVx: 0, // Start with no movement
          currentVy: 0, // Start with no movement
          scrollSensitivity: 0.02 + Math.random() * 0.08, // Varied scroll responsiveness (0.02-0.1)
          baseSpeed: 0.3 + Math.random() * 1.0, // Reduced speed multiplier for gentler movement (was 0.5-2.0, now 0.3-1.3)
          directionBias: (Math.random() - 0.5) * 2, // Direction preference (-1 to 1)
          orbitRadius: 20 + Math.random() * 40, // Orbital movement radius
          orbitSpeed: 0.001 + Math.random() * 0.003, // Orbital speed
          phase: Math.random() * Math.PI * 2, // Random phase offset
          color: colorOptions[Math.floor(Math.random() * colorOptions.length)], // Random PB&J color
          // Dispersal animation properties
          targetX: targetX,
          targetY: targetY,
          startX: startX,
          startY: startY,
          assemblyProgress: 0, // Start at 0, will animate to 1 (now for dispersal)
          assemblyVelocity: 0.012 + Math.random() * 0.016 // Gentler dispersal speed (was 0.016-0.04, now 0.012-0.028)
        })
      }

      particlesRef.current = particles
    }

    initParticles()

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const particles = particlesRef.current
      const connectionDistance = 200 // Reduced from 120 for more selective connections
      
      // Calculate scroll delta for movement (disabled during assembly)
      const scrollDelta = isAssembling ? 0 : (currentScrollY.current - lastScrollY.current)
      lastScrollY.current = currentScrollY.current
      
      // Acceleration/deceleration parameters
      const acceleration = 0.15 // Base acceleration
      const friction = 0.97 // Less friction for smoother movement
      const maxSpeed = 10.0 // Reasonable max speed

      // Update particle velocities with varied movement patterns
      particles.forEach((particle, index) => {
        // Dispersal animation logic
        if (isAssembling && particle.assemblyProgress < 1) {
          // Update dispersal progress
          particle.assemblyProgress += particle.assemblyVelocity
          if (particle.assemblyProgress > 1) particle.assemblyProgress = 1
          
          // Easing function for dispersal - ease in (slow start, then accelerate)
          const easeInCubic = (t: number) => {
            return t * t * t
          }
          
          // Use different easing for different particles to create staggered effect
          const shouldAccelerate = index % 3 === 0 // Only some particles accelerate smoothly
          const easedProgress = shouldAccelerate ? 
            easeInCubic(particle.assemblyProgress) : 
            Math.pow(particle.assemblyProgress, 2.0) // Gentle ease in
          
          // Interpolate from start position (assembled) to target position (dispersed)
          particle.x = particle.startX + (particle.targetX - particle.startX) * easedProgress
          particle.y = particle.startY + (particle.targetY - particle.startY) * easedProgress
          
          // Calculate velocity for visual effect (low at start, high at end for dispersal)
          const velocityMultiplier = Math.max(0, particle.assemblyProgress * 1.2)
          particle.currentVx = (particle.targetX - particle.startX) * 0.08 * velocityMultiplier
          particle.currentVy = (particle.targetY - particle.startY) * 0.08 * velocityMultiplier
          
          return // Skip normal movement during dispersal
        }
        
        // Normal movement logic (after dispersal is complete)
        const time = Date.now() * 0.001 // Time for orbital movement
        
        // Parallax effect: particles move at different rates relative to scroll
        // Some particles move slower than scroll (depth), others faster (closer)
        const parallaxFactor = 0.1 + (index % 5) * 0.15 // Values from 0.1 to 0.7
        const parallaxMovement = scrollDelta * parallaxFactor
        
        // Calculate target velocity based on parallax movement
        let targetVx = 0
        let targetVy = 0
        
        // Base orbital/drift movement (always active for some particles)
        const orbitX = Math.cos(time * particle.orbitSpeed + particle.phase) * 0.2
        const orbitY = Math.sin(time * particle.orbitSpeed * 0.7 + particle.phase) * 0.2
        
        // Parallax movement creates the depth effect
        if (Math.abs(scrollDelta) > 0) {
          // Horizontal drift based on direction bias and parallax
          const horizontalDrift = particle.directionBias * parallaxMovement * 0.3
          
          // Vertical parallax movement (negative to move opposite to scroll for depth effect)
          const verticalParallax = -parallaxMovement * particle.baseSpeed * 0.4
          
          targetVx = horizontalDrift + orbitX + particle.vx * 0.1
          targetVy = verticalParallax + orbitY + particle.vy * 0.1
        } else {
          // Gentle drift when not scrolling
          targetVx = particle.vx * 0.05 + orbitX
          targetVy = particle.vy * 0.05 + orbitY
        }
        
        // Individual acceleration rates
        const individualAcceleration = acceleration * (0.8 + Math.sin(particle.phase * 2) * 0.2)
        
        // Smooth acceleration towards target velocity
        particle.currentVx += (targetVx - particle.currentVx) * individualAcceleration
        particle.currentVy += (targetVy - particle.currentVy) * individualAcceleration
        
        // Apply friction to gradually slow down
        particle.currentVx *= friction
        particle.currentVy *= friction
        
        // Update positions
        particle.x += particle.currentVx
        particle.y += particle.currentVy

        // Wrap around screen edges
        if (particle.x < 0) particle.x = canvas.width
        if (particle.x > canvas.width) particle.x = 0
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0
      })

      // Draw connections between nearby particles
      ctx.strokeStyle = PBJ_COLORS.connections // Use bread crust color for connections
      ctx.lineWidth = 0.5

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < connectionDistance) {
            const opacity = 1 - (distance / connectionDistance)
            ctx.strokeStyle = PBJ_COLORS.connections.replace('0.3', `${opacity * 0.4}`)
            
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      // Draw particles with individual PB&J colors and alpha fading
      particles.forEach(particle => {
        // Calculate alpha based on dispersal progress
        // Start fading particles when they begin dispersing
        let alpha = 1.0
        if (isAssembling && particle.assemblyProgress > 0) {
          // Fade particles as they disperse (slower fade for longer overlap)
          alpha = Math.max(0, 1 - (particle.assemblyProgress * 0.6)) // Fade more gently
        }
        
        // Apply alpha to particle color
        const colorWithAlpha = particle.color.includes('rgba') 
          ? particle.color.replace(/[\d\.]+\)$/, `${alpha})`)
          : particle.color.replace('rgb', 'rgba').replace(')', `, ${alpha})`)
        
        ctx.fillStyle = colorWithAlpha
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, []) // Remove scrollY dependency!

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ pointerEvents: 'none' }}
    />
  )
}

interface ParticleBackgroundProps {
  scrollY: number
  forceVisible?: boolean // Force particles to be visible regardless of scroll position
  isAssembling?: boolean // Whether particles should be assembling into place
}

export default function ParticleBackground({ scrollY, forceVisible = false, isAssembling = false }: ParticleBackgroundProps) {
  // Calculate scroll-based opacity - only start appearing when reaching artist cards
  // Artist cards appear after ~320px (py-32 + title section)
  // Background image extends down about 1000px, so delay particle appearance until after that
  const backgroundImageHeight = 1000
  const artistCardsThreshold = Math.max(320, backgroundImageHeight - 200) // Wait until background image is mostly out of view
  const fadeDistance = 800 // Much longer fade distance for smoother, slower appearance
  const scrollProgress = forceVisible ? 1 : Math.max(0, Math.min((scrollY - artistCardsThreshold) / fadeDistance, 1))
  
  return (
    <div className="fixed inset-0 z-0 pointer-events-none">
      {/* Dynamic gradient mask that responds to scroll */}
      <div 
        className="absolute inset-0 z-5 pointer-events-none"
        style={{
          background: (scrollProgress > 0 || forceVisible) ? `linear-gradient(
            to bottom,
            rgba(0,0,0,${0.98 - scrollProgress * 0.05}) 0%,
            rgba(0,0,0,${0.92 - scrollProgress * 0.08}) 10%,
            rgba(0,0,0,${0.85 - scrollProgress * 0.12}) 20%,
            rgba(0,0,0,${0.75 - scrollProgress * 0.15}) 30%,
            transparent 70%,
            rgba(0,0,0,0.05) 80%,
            rgba(0,0,0,0.3) 95%,
            rgba(0,0,0,0.7) 100%
          )` : `rgba(0,0,0,1)` // Complete black mask until well past background image unless forceVisible
        }}
      />
      <ParticleCanvas scrollY={scrollY} isAssembling={isAssembling} />
    </div>
  )
}