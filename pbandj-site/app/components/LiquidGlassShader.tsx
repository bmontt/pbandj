'use client';

import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAudio } from './AudioContextProvider';
import * as THREE from 'three';

interface LiquidGlassShaderProps {
  dissolve?: number;
}

// Shader code as strings (will be loaded from files in real usage)
const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

uniform float uTime;
uniform float uDissolve;
uniform float uFFT;

void main() {
  vUv = uv;
  vPosition = position;
  vNormal = normalize(normalMatrix * normal);

  vec3 newPosition = position;

  // Dissolve/expand effect
  newPosition += normal * uDissolve * 0.3;

  // Subtle wave animation
  newPosition.z += sin(newPosition.x * 2.0 + uTime) * 0.01 * (1.0 - uDissolve);
  newPosition.y += cos(newPosition.y * 2.0 + uTime * 0.5) * 0.01 * (1.0 - uDissolve);

  // FFT-driven distortion
  newPosition += normal * uFFT * 0.05 * (1.0 - uDissolve);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

uniform float uTime;
uniform float uDissolve;
uniform float uFFT;
uniform float uMix;

// Simplex-like noise
float noise(vec3 p) {
  return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
}

// Smooth distortion pattern
float distortionPattern(vec2 uv, float time) {
  float pattern = 0.0;
  pattern += sin(uv.x * 3.0 + time) * 0.5;
  pattern += sin(uv.y * 3.0 - time * 0.7) * 0.5;
  pattern += sin((uv.x + uv.y) * 2.0 + time * 0.5) * 0.3;
  return pattern * 0.5 + 0.5;
}

// Refraction offset
vec2 refractUv(vec2 uv, float time, float distortion) {
  vec2 offset = vec2(0.0);
  offset.x += sin(uv.y * 10.0 + time) * distortion;
  offset.y += cos(uv.x * 10.0 + time * 0.7) * distortion;
  return uv + offset;
}

void main() {
  vec2 uv = vUv;
  
  // Apply refraction distortion
  float distortionAmount = uFFT * 0.1 * (1.0 - uDissolve);
  uv = refractUv(uv, uTime, distortionAmount);
  
  // Calculate distortion pattern
  float pattern = distortionPattern(uv, uTime);
  
  // Color based on frequency and distortion
  vec3 color = mix(
    vec3(0.1, 0.2, 0.4),  // Cool blue base
    vec3(1.0, 0.0, 0.3),  // Hot pink accent
    uFFT
  );
  
  // Add dynamic tint
  color = mix(color, vec3(0.5, 1.0, 0.8), pattern * 0.3);
  
  // Dissolve animation - fade to white/transparent
  float alpha = 0.85 - uDissolve * 0.85;
  alpha *= (1.0 - pattern * 0.2 * uDissolve);
  
  // Edge glow effect during dissolve
  float edgeGlow = uDissolve * (1.0 - abs(vUv.x - 0.5) * 2.0) * (1.0 - abs(vUv.y - 0.5) * 2.0);
  color += edgeGlow * vec3(1.0, 0.2, 0.5) * 0.5;
  
  gl_FragColor = vec4(color, alpha);
}
`;

export default function LiquidGlassShader({ dissolve = 0 }: LiquidGlassShaderProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const audio = useAudio();
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useRef({
    uTime: { value: 0 },
    uDissolve: { value: dissolve },
    uFFT: { value: 0 },
    uMix: { value: 1 },
  });

  useEffect(() => {
    // Update dissolve value when prop changes
    if (materialRef.current) {
      materialRef.current.uniforms.uDissolve.value = dissolve;
    }
  }, [dissolve]);

  useFrame((state, delta) => {
    if (!materialRef.current || !audio) return;

    // Update time
    materialRef.current.uniforms.uTime.value += delta;

    // Get frequency data from audio
    if (audio.analyserData && audio.analyserData.current) {
      const data = audio.analyserData.current;
      const avg = data.reduce((a: number, b: number) => a + b, 0) / data.length;
      materialRef.current.uniforms.uFFT.value = avg / 255;
    }
  });

  return (
    <mesh ref={mesh} scale={[2, 2, 1]} position={[0, 0, 0]}>
      <planeGeometry args={[1, 1, 128, 128]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms.current}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        side={THREE.DoubleSide}
        wireframe={false}
      />
    </mesh>
  );
}
