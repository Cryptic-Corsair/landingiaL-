export interface ParticleFormationData {
  count: number;
  posA: Float32Array;
  posB: Float32Array;
  posC: Float32Array;
  random: Float32Array;
}

export const DESKTOP_PARTICLE_COUNT = 18000;
export const MOBILE_PARTICLE_COUNT = 9000;
export const MOBILE_BREAKPOINT_PX = 768;

/**
 * Returns calibrated particle count based on viewport width.
 */
export function getParticleCount(viewportWidth: number): number {
  return viewportWidth < MOBILE_BREAKPOINT_PX
    ? MOBILE_PARTICLE_COUNT
    : DESKTOP_PARTICLE_COUNT;
}

/**
 * Clamps morph uniform cleanly to [0.0, 2.0].
 */
export function clampMorph(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(2, Math.max(0, value));
}

/**
 * Frame-rate independent exponential damping helper.
 */
export function dampValue(
  current: number,
  target: number,
  lambda: number,
  deltaTime: number,
): number {
  const safeDt = Math.min(Math.max(deltaTime, 0), 0.05);
  return current + (target - current) * (1 - Math.exp(-lambda * safeDt));
}

/**
 * Deterministic Mulberry32 PRNG for reproducible particle geometry.
 */
export function createSeededRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rotateXZ(
  x: number,
  y: number,
  z: number,
  tiltX: number,
  tiltZ: number,
): [number, number, number] {
  // Rotate around X
  const cosX = Math.cos(tiltX);
  const sinX = Math.sin(tiltX);
  const y1 = y * cosX - z * sinX;
  const z1 = y * sinX + z * cosX;

  // Rotate around Z
  const cosZ = Math.cos(tiltZ);
  const sinZ = Math.sin(tiltZ);
  const x2 = x * cosZ - y1 * sinZ;
  const y2 = x * sinZ + y1 * cosZ;

  return [x2, y2, z1];
}

/**
 * Evaluates layered Chladni standing-wave interference field:
 * cos(n*x)*cos(m*y) - cos(m*x)*cos(n*y) blended with a harmonic overtone.
 */
export function evaluateChladniField(nx: number, ny: number): number {
  const scale = Math.PI;
  const x = nx * scale;
  const y = ny * scale;

  const n1 = 3.0;
  const m1 = 5.0;
  const primary =
    Math.cos(n1 * x) * Math.cos(m1 * y) - Math.cos(m1 * x) * Math.cos(n1 * y);

  const n2 = 2.0;
  const m2 = 7.0;
  const secondary =
    Math.cos(n2 * x) * Math.cos(m2 * y) - Math.cos(m2 * x) * Math.cos(n2 * y);

  return 0.72 * primary + 0.28 * secondary;
}

/**
 * Generates precomputed BufferAttribute arrays for all 3 mathematical formations
 * plus per-particle vec3 random seeds.
 */
export function generateParticleFormations(
  count: number,
  seed = 133742,
): ParticleFormationData {
  const safeCount = Math.max(1, Math.floor(count));
  const posA = new Float32Array(safeCount * 3);
  const posB = new Float32Array(safeCount * 3);
  const posC = new Float32Array(safeCount * 3);
  const random = new Float32Array(safeCount * 3);

  const rng = createSeededRng(seed);

  // Formation A parameters: Tilted Orbital Torus
  const majorRadius = 2.25;
  const minorRadius = 0.54;
  const torusTiltX = 0.58;
  const torusTiltZ = -0.32;

  // Formation B parameters: Chladni Interference Resonance
  const chladniRadius = 3.25;
  const chladniTiltX = -0.54;
  const chladniTiltZ = 0.16;
  const gradEps = 0.004;

  // Formation C parameters: Cosmic Horizon Wave
  const ribbonCount = 22;

  for (let i = 0; i < safeCount; i++) {
    const i3 = i * 3;

    // ---------------------------------------------------------
    // 0. Per-particle random vec3 (phase, size variance, seed)
    // ---------------------------------------------------------
    const rPhase = rng();
    const rSize = rng();
    const rTint = rng();
    random[i3] = rPhase;
    random[i3 + 1] = rSize;
    random[i3 + 2] = rTint;

    // ---------------------------------------------------------
    // 1. aPosA — Orbital Torus with organic radial thickness
    // ---------------------------------------------------------
    const u = rng() * Math.PI * 2;
    const roleA = rng();
    let v: number;
    let tubeFactor: number;

    if (roleA < 0.36) {
      // Luminous braided orbital filaments
      const strand = Math.floor(rng() * 4);
      v = u * 3.0 + (strand * Math.PI * 2) / 4 + (rng() - 0.5) * 0.18;
      tubeFactor = 0.72 + (rng() - 0.5) * 0.16;
    } else if (roleA < 0.9) {
      // Organic Gaussian-like radial thickness inside torus cross-section
      v = rng() * Math.PI * 2;
      const radialBias = Math.pow(rng(), 0.75);
      tubeFactor = 0.28 + radialBias * 0.74;
    } else {
      // Diffuse spectral corona around torus
      v = rng() * Math.PI * 2;
      tubeFactor = 0.92 + rng() * 0.48;
    }

    const rTube = minorRadius * tubeFactor;
    const rMajor = majorRadius + 0.12 * Math.sin(3 * u + v);
    const tx = (rMajor + rTube * Math.cos(v)) * Math.cos(u);
    const ty = (rMajor + rTube * Math.cos(v)) * Math.sin(u);
    const tz = rTube * Math.sin(v) * 1.12;

    const [ax, ay, az] = rotateXZ(tx, ty, tz, torusTiltX, torusTiltZ);
    posA[i3] = ax;
    posA[i3 + 1] = ay;
    posA[i3 + 2] = az;

    // ---------------------------------------------------------
    // 2. aPosB — Chladni Interference Resonance
    // ---------------------------------------------------------
    // Sample uniformly inside unit disk first
    const diskAngle = rng() * Math.PI * 2;
    const diskR = Math.sqrt(rng()) * 0.96;
    let nx = Math.cos(diskAngle) * diskR;
    let ny = Math.sin(diskAngle) * diskR;

    const isNodalGrain = rng() < 0.84;
    if (isNodalGrain) {
      // Relax coordinates onto Chladni nodal contours (f(x, y) = 0)
      for (let step = 0; step < 5; step++) {
        const val = evaluateChladniField(nx, ny);
        const dfdx =
          (evaluateChladniField(nx + gradEps, ny) -
            evaluateChladniField(nx - gradEps, ny)) /
          (2 * gradEps);
        const dfdy =
          (evaluateChladniField(nx, ny + gradEps) -
            evaluateChladniField(nx, ny - gradEps)) /
          (2 * gradEps);
        const gradSq = dfdx * dfdx + dfdy * dfdy + 1e-4;
        const stepSize = Math.max(-0.08, Math.min(0.08, val / gradSq));
        nx -= stepSize * dfdx * 0.75;
        ny -= stepSize * dfdy * 0.75;
      }
      // Micro organic grain dispersion along nodal line
      nx += (rng() - 0.5) * 0.024;
      ny += (rng() - 0.5) * 0.024;
    }

    // Clamp softly within circular resonant plate
    const radNow = Math.hypot(nx, ny);
    if (radNow > 1.0) {
      nx /= radNow;
      ny /= radNow;
    }

    const plateX = nx * chladniRadius;
    const plateY = ny * chladniRadius;
    const harmonicRelief =
      0.26 * Math.sin(radNow * Math.PI * 2.5) +
      0.16 *
        (Math.cos(3 * nx * Math.PI) * Math.cos(5 * ny * Math.PI) +
          Math.cos(5 * nx * Math.PI) * Math.cos(3 * ny * Math.PI));
    const plateZ = harmonicRelief + (rng() - 0.5) * 0.08;

    const [bx, by, bz] = rotateXZ(
      plateX,
      plateY,
      plateZ,
      chladniTiltX,
      chladniTiltZ,
    );
    posB[i3] = bx;
    posB[i3 + 1] = by;
    posB[i3 + 2] = bz;

    // ---------------------------------------------------------
    // 3. aPosC — Cosmic Horizon Wave
    // ---------------------------------------------------------
    let zNorm: number;
    if (rng() < 0.74) {
      // Structured horizon contour ribbons
      const ribbonIdx = Math.floor(rng() * ribbonCount);
      zNorm = (ribbonIdx + 0.5 + (rng() - 0.5) * 0.42) / ribbonCount;
    } else {
      // Atmospheric field between ribbons
      zNorm = rng();
    }
    zNorm = Math.min(1, Math.max(0, zNorm));

    // Map zNorm from foreground (+2.7) to deep horizon (-6.3)
    const hz = 2.7 - zNorm * 9.0;
    // Perspective spread widens smoothly toward horizon
    const halfWidth = 4.4 + zNorm * 3.6;
    const hx = (rng() * 2 - 1) * halfWidth;

    const edgeAtten = Math.cos(Math.min(1, Math.abs(hx) / halfWidth) * Math.PI * 0.42);
    const waveHeight =
      0.56 * Math.sin(hx * 0.62 + hz * 0.44) * Math.cos(hz * 0.34) +
      0.24 * Math.cos(hx * 1.28 - hz * 0.76) +
      0.11 * Math.sin(hx * 2.15 + hz * 1.35);

    // Gentle upward horizon pitch in perspective
    const horizonLift = zNorm * 0.85 - 0.55;
    const hy = horizonLift + waveHeight * (0.45 + 0.55 * edgeAtten) + (rng() - 0.5) * 0.06;

    posC[i3] = hx;
    posC[i3 + 1] = hy;
    posC[i3 + 2] = hz;
  }

  return {
    count: safeCount,
    posA,
    posB,
    posC,
    random,
  };
}
