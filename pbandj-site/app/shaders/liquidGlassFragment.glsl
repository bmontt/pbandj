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
  
  // Chromatic aberration on dissolve
  if (uDissolve > 0.1) {
    float r = texture2D(uv + vec2(0.01 * uDissolve, 0.0)).r;
    float g = texture2D(uv).g;
    float b = texture2D(uv - vec2(0.01 * uDissolve, 0.0)).b;
    color = mix(color, vec3(r, g, b), uDissolve * 0.3);
  }
  
  gl_FragColor = vec4(color, alpha);
}

