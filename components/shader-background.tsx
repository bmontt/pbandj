"use client"

import { animated, useSpring } from "@react-spring/three"
import { useFrame, useThree } from "@react-three/fiber"
import { useEffect, useRef, useState } from "react"
import * as THREE from "three"

interface VinylBackgroundProps {
  isActive: boolean
}

export default function VinylBackground({ isActive }: VinylBackgroundProps) {
  const groupRef = useRef<THREE.Group>(null)
  const vinylRef = useRef<THREE.Mesh>(null)
  const labelRef = useRef<THREE.Mesh>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [autoRotation, setAutoRotation] = useState(0)
  
  const { size, camera } = useThree()

  // Spring animation for vinyl spinning
  const { rotationZ } = useSpring({
    rotationZ: isActive ? autoRotation : autoRotation * 0.3,
    config: { tension: 120, friction: 14 }
  })

  // Mouse interaction handlers
  const handlePointerDown = (event: any) => {
    setIsDragging(true)
    event.stopPropagation()
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  const handlePointerMove = (event: any) => {
    if (!isDragging) return
    
    const { movementX, movementY } = event
    setRotation(prev => ({
      x: Math.max(-Math.PI / 3, Math.min(Math.PI / 3, prev.x + movementY * 0.01)),
      y: prev.y + movementX * 0.01
    }))
  }

  // Auto-rotation when active
  useFrame((state, delta) => {
    if (isActive && !isDragging) {
      setAutoRotation(prev => prev + delta * 2) // 2 radians per second
    } else if (!isActive && !isDragging) {
      setAutoRotation(prev => prev + delta * 0.5) // Slower when inactive
    }
    
    // Apply manual rotation
    if (groupRef.current && !isDragging) {
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, rotation.x, 0.1)
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, rotation.y, 0.1)
    } else if (groupRef.current && isDragging) {
      groupRef.current.rotation.x = rotation.x
      groupRef.current.rotation.y = rotation.y
    }
  })

  useEffect(() => {
    const handleGlobalPointerUp = () => setIsDragging(false)
    const handleGlobalPointerMove = (event: MouseEvent) => {
      if (!isDragging) return
      setRotation(prev => ({
        x: Math.max(-Math.PI / 3, Math.min(Math.PI / 3, prev.x + event.movementY * 0.01)),
        y: prev.y + event.movementX * 0.01
      }))
    }

    window.addEventListener('pointerup', handleGlobalPointerUp)
    window.addEventListener('pointermove', handleGlobalPointerMove)

    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp)
      window.removeEventListener('pointermove', handleGlobalPointerMove)
    }
  }, [isDragging])

  return (
    <group 
      ref={groupRef}
      position={[0, 0, -2]}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
    >
      {/* Vinyl Record */}
      <animated.mesh 
        ref={vinylRef}
        rotation-z={rotationZ}
        position={[0, 0, 0]}
      >
        <cylinderGeometry args={[3, 3, 0.1, 64]} />
        <meshStandardMaterial 
          color="#1a1a1a"
          roughness={0.8}
          metalness={0.2}
        />
      </animated.mesh>

      {/* Vinyl Grooves (multiple rings) */}
      {[...Array(12)].map((_, i) => (
        <animated.mesh 
          key={i}
          rotation-z={rotationZ}
          position={[0, 0, 0.051]}
        >
          <ringGeometry args={[0.5 + i * 0.2, 0.52 + i * 0.2, 64]} />
          <meshBasicMaterial 
            color="#0a0a0a" 
            transparent
            opacity={0.3}
          />
        </animated.mesh>
      ))}

      {/* Center Label */}
      <animated.mesh 
        ref={labelRef}
        rotation-z={rotationZ}
        position={[0, 0, 0.06]}
      >
        <cylinderGeometry args={[0.8, 0.8, 0.02, 32]} />
        <meshStandardMaterial 
          color="#8B4513"
          roughness={0.3}
          metalness={0.1}
        />
      </animated.mesh>

      {/* Center Hole */}
      <animated.mesh 
        rotation-z={rotationZ}
        position={[0, 0, 0.07]}
      >
        <cylinderGeometry args={[0.1, 0.1, 0.03, 16]} />
        <meshBasicMaterial color="#000000" />
      </animated.mesh>

      {/* Ambient lighting for the vinyl */}
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, -5, 2]} intensity={0.3} color="#ff6b35" />
    </group>
  )
}
