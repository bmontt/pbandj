"use client"

import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useRef, useState, useMemo } from "react"
import * as THREE from "three"

// PB&J Color Palette for 3D particles
const LIDAR_COLORS = {
  peanutButter: new THREE.Color('#B58657'),
  strawberryJam: new THREE.Color('#C44D58'),
  grapeJelly: new THREE.Color('#935BAD'),
  apricotJam: new THREE.Color('#EA9A6C'),
  toastedBread: new THREE.Color('#C69A6C'),
}

interface LidarParticle {
  position: THREE.Vector3
  originalPosition: THREE.Vector3
  velocity: THREE.Vector3
  color: THREE.Color
  size: number
  intensity: number
  connectionStrength: number
  ringIndex: number
  ringPosition: number
}

interface VinylBackgroundProps {
  isActive: boolean
}

// Custom orbital camera controls
function OrbitalCamera() {
  const { camera, gl } = useThree()
  const [isOrbiting, setIsOrbiting] = useState(false)
  const [spherical, setSpherical] = useState({
    radius: 8,
    phi: Math.PI / 3, // Vertical angle (0 = top, PI = bottom)
    theta: 0 // Horizontal angle
  })
  const lastMouse = useRef({ x: 0, y: 0 })
  const target = new THREE.Vector3(0, 0, -2) // Look at the vinyl

  // Update camera position based on spherical coordinates
  useFrame(() => {
    const x = spherical.radius * Math.sin(spherical.phi) * Math.cos(spherical.theta)
    const y = spherical.radius * Math.cos(spherical.phi)
    const z = spherical.radius * Math.sin(spherical.phi) * Math.sin(spherical.theta)
    
    camera.position.set(x, y, z + target.z)
    camera.lookAt(target)
  })

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      setIsOrbiting(true)
      lastMouse.current = { x: event.clientX, y: event.clientY }
    }

    const handlePointerUp = () => {
      setIsOrbiting(false)
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (!isOrbiting) return

      const deltaX = event.clientX - lastMouse.current.x
      const deltaY = event.clientY - lastMouse.current.y

      setSpherical(prev => ({
        ...prev,
        theta: prev.theta - deltaX * 0.01, // Horizontal rotation
        phi: Math.max(0.1, Math.min(Math.PI - 0.1, prev.phi + deltaY * 0.01)) // Vertical rotation with limits
      }))

      lastMouse.current = { x: event.clientX, y: event.clientY }
    }

    const handleWheel = (event: WheelEvent) => {
      setSpherical(prev => ({
        ...prev,
        radius: Math.max(3, Math.min(15, prev.radius + event.deltaY * 0.01)) // Zoom in/out
      }))
    }

    const canvas = gl.domElement
    canvas.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointermove', handlePointerMove)
    canvas.addEventListener('wheel', handleWheel)

    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointermove', handlePointerMove)
      canvas.removeEventListener('wheel', handleWheel)
    }
  }, [isOrbiting, gl.domElement])

  return null
}

function LidarVinylRecord({ isActive }: VinylBackgroundProps) {
  const groupRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Points>(null)
  const linesRef = useRef<THREE.LineSegments>(null)
  const [autoRotation, setAutoRotation] = useState(0)
  
  // Generate lidar-style vinyl record particles
  const { particles, particleGeometry, lineGeometry } = useMemo(() => {
    const particles: LidarParticle[] = []
    const particlePositions: number[] = []
    const particleColors: number[] = []
    const particleSizes: number[] = []
    const linePositions: number[] = []
    const lineColors: number[] = []
    
    const colorArray = Object.values(LIDAR_COLORS)
    
    // Create vinyl record shape with dense concentric grooves
    const numRings = 350  // More rings for denser appearance
    const centerRadius = 0.15  // Smaller center hole
    const outerRadius = 3.2
    const baseParticlesPerRing = 12  // Base number of particles per ring
    
    // Generate particles in vinyl groove pattern
    for (let ring = 0; ring < numRings; ring++) {
      const ringProgress = ring / (numRings - 1)
      const ringRadius = centerRadius + ringProgress * (outerRadius - centerRadius)
      
      // More particles on outer rings to maintain density
      const ringParticles = Math.floor(baseParticlesPerRing * (1 + ringProgress * 2))
      
      for (let i = 0; i < ringParticles; i++) {
        const angle = (i / ringParticles) * Math.PI * 2
        
        // Add spiral groove pattern like real vinyl
        const spiralOffset = ring * 0.03
        const adjustedAngle = angle + spiralOffset
        
        // Small random variations to simulate lidar scan noise
        const radiusNoise = (Math.random() - 0.5) * 0.02
        const heightNoise = (Math.random() - 0.5) * 0.03
        
        const x = Math.cos(adjustedAngle) * (ringRadius + radiusNoise)
        const z = Math.sin(adjustedAngle) * (ringRadius + radiusNoise)
        const y = heightNoise
        
        const position = new THREE.Vector3(x, y, z)
        
        // Random color selection from PB&J palette
        const color = colorArray[Math.floor(Math.random() * colorArray.length)].clone()
        
        // Random intensity variation
        const randomIntensity = 0.6 + Math.random() * 5
        color.multiplyScalar(randomIntensity)
        
        const particle: LidarParticle = {
          position: position.clone(),
          originalPosition: position.clone(),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.01,
            (Math.random() - 0.5) * 0.005,
            (Math.random() - 0.5) * 0.01
          ),
          color,
          size: 0.8 + Math.random() * 0.4,
          intensity: randomIntensity,
          connectionStrength: 0.6 + Math.random() * 0.4,
          ringIndex: ring,  // Add ring information for connection prioritization
          ringPosition: i   // Position within the ring
        }
        
        particles.push(particle)
        
        // Add to geometry arrays
        particlePositions.push(position.x, position.y, position.z)
        particleColors.push(color.r, color.g, color.b)
        particleSizes.push(particle.size)
      }
    }
    
    // Generate connections between particles with ring prioritization and connection limits
    const connectionDistance = 2
    const maxConnectionsPerParticle = 3
    const particleConnections: number[] = new Array(particles.length).fill(0) // Track connection count per particle
    
    for (let i = 0; i < particles.length; i++) {
      if (particleConnections[i] >= maxConnectionsPerParticle) continue
      
      // Create array of potential connections with priority scoring
      const potentialConnections: { index: number; distance: number; priority: number }[] = []
      
      for (let j = i + 1; j < particles.length; j++) {
        if (particleConnections[j] >= maxConnectionsPerParticle) continue
        
        const distance = particles[i].position.distanceTo(particles[j].position)
        if (distance < connectionDistance) {
          // Calculate priority: same ring gets higher priority
          let priority = 1 - (distance / connectionDistance) // Base priority on distance
          
          if (particles[i].ringIndex === particles[j].ringIndex) {
            // Same ring connection - much higher priority
            priority += 2.0
            
            // Adjacent particles in same ring get even higher priority
            const positionDiff = Math.abs(particles[i].ringPosition - particles[j].ringPosition)
            const ringSize = Math.floor(baseParticlesPerRing * (1 + particles[i].ringIndex / (numRings - 1) * 2))
            const adjacentDiff = Math.min(positionDiff, ringSize - positionDiff)
            
            if (adjacentDiff <= 2) { // Adjacent or close particles
              priority += 1.0
            }
          } else if (Math.abs(particles[i].ringIndex - particles[j].ringIndex) === 1) {
            // Adjacent rings get medium priority
            priority += 0.5
          }
          
          potentialConnections.push({ index: j, distance, priority })
        }
      }
      
      // Sort by priority (highest first) and take up to remaining connection slots
      potentialConnections.sort((a, b) => b.priority - a.priority)
      const remainingSlots = maxConnectionsPerParticle - particleConnections[i]
      
      for (let k = 0; k < Math.min(remainingSlots, potentialConnections.length); k++) {
        const connection = potentialConnections[k]
        const j = connection.index
        
        if (particleConnections[j] >= maxConnectionsPerParticle) continue
        
        // Create the connection
        const opacity = (connection.priority / 3.0) * 0.4 // Scale opacity based on priority
        const avgColor = particles[i].color.clone().lerp(particles[j].color, 0.5)
        avgColor.multiplyScalar(opacity)
        
        // Add line positions
        linePositions.push(
          particles[i].position.x, particles[i].position.y, particles[i].position.z,
          particles[j].position.x, particles[j].position.y, particles[j].position.z
        )
        
        // Add line colors
        lineColors.push(
          avgColor.r, avgColor.g, avgColor.b,
          avgColor.r, avgColor.g, avgColor.b
        )
        
        // Update connection counts
        particleConnections[i]++
        particleConnections[j]++
        
        if (particleConnections[i] >= maxConnectionsPerParticle) break
      }
    }
    
    // Create geometries
    const particleGeometry = new THREE.BufferGeometry()
    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3))
    particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(particleColors, 3))
    particleGeometry.setAttribute('size', new THREE.Float32BufferAttribute(particleSizes, 1))
    
    const lineGeometry = new THREE.BufferGeometry()
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))
    lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3))
    
    return { particles, particleGeometry, lineGeometry }
  }, [])

  // Particle material
  const particleMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.05, // Smaller particles for denser vinyl appearance
      sizeAttenuation: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending
    })
  }, [])

  // Line material for connections
  const lineMaterial = useMemo(() => {
    return new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending
    })
  }, [])

  // Animation loop - just handle vinyl spinning and particle animation
  useFrame((state, delta) => {
    // Auto-rotation when active
    if (isActive) {
      setAutoRotation((prev) => prev + delta * 1.5) // Moderate spin speed
    } else {
      setAutoRotation((prev) => prev + delta * 0.3) // Slow drift when inactive
    }
    
    // Apply auto-rotation on Y-axis (turntable spinning)
    if (groupRef.current) {
      groupRef.current.rotation.y = autoRotation
    }
    
    // Animate particles with subtle movement
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
      const colors = particlesRef.current.geometry.attributes.color.array as Float32Array
      
      particles.forEach((particle, i) => {
        // Subtle floating motion
        const time = state.clock.elapsedTime
        const floatX = Math.sin(time * 0.5 + i * 0.1) * 0.05
        const floatY = Math.cos(time * 0.3 + i * 0.15) * 0.03
        const floatZ = Math.sin(time * 0.4 + i * 0.2) * 0.05
        
        particle.position.x = particle.originalPosition.x + floatX
        particle.position.y = particle.originalPosition.y + floatY
        particle.position.z = particle.originalPosition.z + floatZ
        
        // Update geometry positions
        positions[i * 3] = particle.position.x
        positions[i * 3 + 1] = particle.position.y
        positions[i * 3 + 2] = particle.position.z
        
        // Pulse intensity based on activity
        const pulse = isActive ? Math.sin(time * 2 + i * 0.1) * 0.3 + 0.7 : 0.5
        colors[i * 3] = particle.color.r * pulse
        colors[i * 3 + 1] = particle.color.g * pulse
        colors[i * 3 + 2] = particle.color.b * pulse
      })
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true
      particlesRef.current.geometry.attributes.color.needsUpdate = true
    }
    
    // Update line connections (just update existing connections, don't recalculate)
    if (linesRef.current) {
      const linePositions = linesRef.current.geometry.attributes.position.array as Float32Array
      const lineColors = linesRef.current.geometry.attributes.color.array as Float32Array
      
      // The connections are already established in the geometry, just update their positions and colors
      // based on the current particle positions and activity state
      const numLines = linePositions.length / 6 // Each line has 6 position values (2 points * 3 coords)
      
      for (let lineIndex = 0; lineIndex < numLines; lineIndex++) {
        // Get the positions from the existing line geometry
        const startX = linePositions[lineIndex * 6]
        const startY = linePositions[lineIndex * 6 + 1]
        const startZ = linePositions[lineIndex * 6 + 2]
        const endX = linePositions[lineIndex * 6 + 3]
        const endY = linePositions[lineIndex * 6 + 4]
        const endZ = linePositions[lineIndex * 6 + 5]
        
        // Find the particles that correspond to this line (this is approximate since we don't store the mapping)
        // For now, just update the opacity based on activity
        const currentOpacity = isActive ? 0.6 : 0.3
        const currentColor = lineColors[lineIndex * 6] * (currentOpacity / 0.4) // Normalize and rescale
        
        // Update line colors with activity-based opacity
        lineColors[lineIndex * 6] = currentColor
        lineColors[lineIndex * 6 + 1] = lineColors[lineIndex * 6 + 1] * (currentOpacity / 0.4)
        lineColors[lineIndex * 6 + 2] = lineColors[lineIndex * 6 + 2] * (currentOpacity / 0.4)
        lineColors[lineIndex * 6 + 3] = currentColor
        lineColors[lineIndex * 6 + 4] = lineColors[lineIndex * 6 + 4] * (currentOpacity / 0.4)
        lineColors[lineIndex * 6 + 5] = lineColors[lineIndex * 6 + 5] * (currentOpacity / 0.4)
      }
      
      linesRef.current.geometry.attributes.color.needsUpdate = true
    }
  })

  return (
    <group 
      ref={groupRef}
      position={[0, 0, -2]}
      rotation={[-Math.PI / 6, 0, 0]} // Tilt slightly to show it's a flat record
    >
      {/* Lidar-style particle points */}
      <points 
        ref={particlesRef}
        geometry={particleGeometry}
        material={particleMaterial}
      />
      
      {/* Connection lines between particles */}
      <lineSegments
        ref={linesRef}
        geometry={lineGeometry}
        material={lineMaterial}
      />
      
      {/* Center point indicator */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial 
          color={LIDAR_COLORS.peanutButter} 
          transparent 
          opacity={isActive ? 0.8 : 0.4}
        />
      </mesh>
      
      {/* Ambient lighting for depth perception */}
      <ambientLight intensity={0.2} />
      <pointLight position={[5, 5, 5]} intensity={0.3} color={LIDAR_COLORS.apricotJam} />
      <pointLight position={[-5, -5, 2]} intensity={0.2} color={LIDAR_COLORS.grapeJelly} />
    </group>
  )
}

const VinylBackground = ({ isActive = false }: { isActive?: boolean }) => {
  return (
    <>
      <OrbitalCamera />
      <LidarVinylRecord isActive={isActive} />
    </>
  )
}

export default VinylBackground