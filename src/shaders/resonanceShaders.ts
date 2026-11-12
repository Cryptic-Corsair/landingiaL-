export const resonanceVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;
  uniform float uPixelRatio;
  uniform vec3 uPointer;
  uniform float uPointerActive;
  uniform float uExcite;
  uniform float uShockwave;
  uniform float uShockwaveStrength;

  attribute vec3 aPosA;
  attribute vec3 aPosB;
  attribute vec3 aPosC;
  attribute vec3 aRandom;

  varying float vSeed;
  varying float vDepth;
  varying float vEnergy;
  varying float vSizeVar;

  // Smooth trigonometric pseudo-curl displacement field for organic transitions
  vec3 computeCurlSwirl(vec3 p, float t, float phase) {
    float freq = 0.95;
    float s1 = sin(p.y * freq + t * 0.7 + phase * 6.28318);
    float c1 = cos(p.z * freq - t * 0.6 + phase * 3.14159);
    float s2 = sin(p.z * freq + t * 0.8 - phase * 4.12);
    float c2 = cos(p.x * freq + t * 0.5 + phase * 2.71);
    float s3 = sin(p.x * freq - t * 0.65 + phase * 5.05);
    float c3 = cos(p.y * freq + t * 0.75 - phase * 1.93);
    return vec3(s1 - c1, s2 - c2, s3 - c3);
  }

  void main() {
    vSeed = aRandom.z;
    vSizeVar = aRandom.y;

    // 1. Smooth morphing between aPosA -> aPosB -> aPosC
    float wAB = smoothstep(0.0, 1.0, clamp(uMorph, 0.0, 1.0));
    float wBC = smoothstep(0.0, 1.0, clamp(uMorph - 1.0, 0.0, 1.0));

    vec3 posAB = mix(aPosA, aPosB, wAB);
    vec3 basePos = mix(posAB, aPosC, wBC);

    // 2. Organic curl/swirl turbulence peaking mid-transition
    float transAB = sin(clamp(uMorph, 0.0, 1.0) * 3.14159265);
    float transBC = sin(clamp(uMorph - 1.0, 0.0, 1.0) * 3.14159265);
    float morphEnergy = max(transAB, transBC);

    vec3 curl = computeCurlSwirl(basePos, uTime, aRandom.x);
    basePos += curl * (0.48 * morphEnergy);

    // 3. Subtle idle breathing motion driven by uTime
    float phase = aRandom.x * 6.2831853;
    float breathe = sin(uTime * 0.75 + phase * 0.4 + length(basePos) * 0.65);
    vec3 radialDir = normalize(basePos + vec3(0.0001, 0.0002, 0.0001));
    basePos += radialDir * (breathe * 0.042);
    basePos.y += cos(uTime * 0.55 + phase) * 0.028;

    // 4. Excite compression + harmonic vibration toward center
    if (uExcite > 0.001) {
      float pull = uExcite * (0.42 + 0.16 * aRandom.y);
      basePos = mix(basePos, basePos * 0.54, pull);
      vec3 jitter = vec3(
        sin(uTime * 28.0 + phase * 3.1),
        cos(uTime * 31.0 + phase * 2.7),
        sin(uTime * 25.0 + phase * 4.3)
      );
      basePos += jitter * (0.055 * uExcite);
    }

    // 5. Concentric spherical shockwave ripple on release
    float shockEnergy = 0.0;
    if (uShockwaveStrength > 0.001) {
      float distFromOrigin = length(basePos);
      float waveDelta = distFromOrigin - uShockwave;
      float ringBand = exp(-(waveDelta * waveDelta) / 0.38);
      shockEnergy = ringBand * uShockwaveStrength;
      basePos += radialDir * (shockEnergy * 0.78);
      basePos.y += sin(waveDelta * 4.5) * shockEnergy * 0.2;
    }

    // 6. Pointer interaction displacement & outward ripple
    float pointerEnergy = 0.0;
    if (uPointerActive > 0.001) {
      vec3 toParticle = basePos - uPointer;
      float pDist = length(toParticle);
      float falloff = exp(-(pDist * pDist) * 0.68) * uPointerActive;
      vec3 pushDir = pDist > 0.0001 ? toParticle / pDist : vec3(0.0, 0.0, 1.0);
      float ripple = 1.0 + 0.38 * sin(pDist * 6.0 - uTime * 5.0);
      basePos += pushDir * (falloff * 0.65 * ripple);
      basePos.z += falloff * 0.28;
      pointerEnergy = falloff;
    }

    vec4 mvPosition = modelViewMatrix * vec4(basePos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Depth factor for subtle atmospheric tinting
    float camDist = max(-mvPosition.z, 1.2);
    vDepth = clamp((camDist - 4.0) / 8.5, 0.0, 1.0);
    vEnergy = clamp(morphEnergy * 0.55 + uExcite * 0.95 + shockEnergy * 1.25 + pointerEnergy * 0.9, 0.0, 1.6);

    // Perspective-attenuated crisp micro-particle size
    float sizeFactor = mix(1.45, 3.05, aRandom.y);
    float energyScale = 1.0 + vEnergy * 0.34;
    float projectedSize = sizeFactor * energyScale * uPixelRatio * (18.5 / camDist);
    gl_PointSize = clamp(projectedSize, 1.5 * uPixelRatio, 18.0);
  }
`;

export const resonanceFragmentShader = /* glsl */ `
  varying float vSeed;
  varying float vDepth;
  varying float vEnergy;
  varying float vSizeVar;

  void main() {
    vec2 centered = gl_PointCoord - vec2(0.5);
    float dist = length(centered) * 2.0;
    if (dist > 1.0) discard;

    // Crisp luminous core + soft sub-pixel falloff
    float core = 1.0 - smoothstep(0.0, 0.46, dist);
    float halo = (1.0 - smoothstep(0.0, 1.0, dist)) * 0.44;
    float radialAlpha = core * 0.92 + halo;

    // Palette strictly calibrated to IAL CHEM design language
    vec3 warmBone = vec3(1.0, 0.9647, 0.9176);         // #FFF6EA
    vec3 spectral = vec3(0.7686, 0.7451, 0.9961);       // #C4BEFF
    vec3 slateLavender = vec3(0.6157, 0.5804, 0.7216);  // #9D94B8

    // Near particles lean warm bone; deeper grains shift to spectral/slate lavender
    vec3 depthTint = mix(spectral, slateLavender, vDepth);
    vec3 grainColor = mix(warmBone, depthTint, 0.18 + vSeed * 0.42 + vDepth * 0.24);

    // Core center burns warmly, outer edge catches spectral lavender
    grainColor = mix(grainColor, warmBone, core * 0.72);
    grainColor = mix(grainColor, spectral, clamp(vEnergy * 0.42, 0.0, 0.65) * (1.0 - core));

    // Calibrated additive opacity so overlapping grains glow richly without blowing out
    float baseAlpha = mix(0.32, 0.58, vSizeVar);
    float finalAlpha = radialAlpha * baseAlpha * (1.0 + vEnergy * 0.48);

    gl_FragColor = vec4(grainColor, clamp(finalAlpha, 0.0, 0.82));
  }
`;
