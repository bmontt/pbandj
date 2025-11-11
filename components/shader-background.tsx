"use client"

import { useFrame, useThree } from "@react-three/fiber"
import { useRef, useEffect } from "react"
import type * as THREE from "three"

const vertexShader = `
  varying vec2 vUv;
  
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  uniform float uDissolve;
  uniform float uFFT;
  varying vec2 vUv;
  
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i = floor(v + dot(v, C.uu));
    vec2 x0 = v - i + dot(i, C.zz);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.zwzw;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
  
  void main() {
    vec2 uv = vUv;
    
    float noise1 = snoise(uv * 2.5 + uTime * 0.2);
    float noise2 = snoise(uv * 1.8 - uTime * 0.15 + 10.0);
    float noise3 = snoise(uv * 1.2 + uTime * 0.1);
    
    vec2 distortion = vec2(noise1, noise2) * 0.08 * (0.3 + uFFT * 0.9);
    uv += distortion;
    
    float wave = sin(uv.y * 8.0 + uTime * 1.5) * 0.5 + 0.5;
    wave *= cos(uv.x * 6.0 - uTime * 1.2) * 0.5 + 0.5;
    wave *= noise3;
    
    float intensity = 0.2 + uFFT * 0.6;
    
    // Grayscale base
    float gray = mix(0.15, 0.35, wave * intensity);
    vec3 color = vec3(gray);
    
    float yellowMask = mix(0.0, 0.15, wave * intensity);
    color += vec3(yellowMask * 0.6, yellowMask * 0.5, 0.0);
    
    // Dissolve effect
    float dissolve = snoise(uv * 5.0) + uDissolve * 2.0;
    if (dissolve < 0.5) discard;
    
    gl_FragColor = vec4(color, 1.0);
  }
`

interface ShaderBackgroundProps {
  isActive: boolean
}

export default function ShaderBackground({ isActive }: ShaderBackgroundProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { size } = useThree()

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uFFT.value = isActive ? 0.3 : 0.1
    }
  }, [isActive])

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime
      const fftValue = 0.15 + Math.sin(clock.elapsedTime * 1.5) * 0.2 + Math.sin(clock.elapsedTime * 0.5) * 0.1
      materialRef.current.uniforms.uFFT.value = fftValue
    }
  })

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uDissolve: { value: 0 },
          uFFT: { value: 0.2 },
        }}
      />
    </mesh>
  )
}
