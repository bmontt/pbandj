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
