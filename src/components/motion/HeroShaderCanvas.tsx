import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { SiteTheme } from '../../data/ialData';
import { clampDeltaTime, getCappedPixelRatio } from '../../lib/motion';

interface HeroShaderCanvasProps {
  theme: SiteTheme;
  reducedMotion: boolean;
}

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform float uPointerActive;
  uniform float uThemeMix; // 0.0 = obsidian dark, 1.0 = daylight cream

  // Smooth procedural value noise for liquid optical caustics
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    mat2 rot = mat2(0.80, -0.60, 0.60, 0.80);
    for (int i = 0; i < 4; i++) {
      v += amp * noise(p);
      p = rot * p * 2.03 + vec2(1.7, 9.2);
      amp *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);
    vec2 ptr = vec2((uPointer.x - 0.5) * aspect, uPointer.y - 0.5);

    float ptrDist = length(p - ptr);
    float ptrInfluence = exp(-ptrDist * 2.6) * uPointerActive;
    vec2 dir = normalize(p - ptr + vec2(0.0001));

    // Gently bend coordinate field toward pointer inertia
    vec2 warped = p - dir * ptrInfluence * 0.095;

    // Slow velvety liquid caustics
    float t = uTime * 0.16;
    vec2 q = vec2(
      fbm(warped * 2.1 + vec2(t, -t * 0.6)),
      fbm(warped * 2.1 + vec2(-t * 0.7, t * 0.8) + vec2(4.2, 1.9))
    );
    float causticField = fbm(warped * 2.8 + q * 1.45 + vec2(t * 0.4, 0.0));
    float causticBand = smoothstep(0.46, 0.88, causticField);
    float rimFlare = pow(max(0.0, 1.0 - abs(causticField - 0.62) * 3.8), 2.2);

    // Subtle refracted architectural grid underneath
    vec2 gridUv = warped * 11.5 + q * 0.24;
    vec2 gridCell = abs(fract(gridUv - 0.5) - 0.5) / max(fwidth(gridUv), vec2(0.001));
    float gridLine = 1.0 - min(min(gridCell.x, gridCell.y), 1.0);
    float majorStep = 1.0 - min(
      min(
        abs(fract(gridUv.x * 0.25 - 0.5) - 0.5) / max(fwidth(gridUv.x * 0.25), 0.001),
        abs(fract(gridUv.y * 0.25 - 0.5) - 0.5) / max(fwidth(gridUv.y * 0.25), 0.001)
      ),
      1.0
    );

    // Palette tokens: Obsidian Dark vs Daylight Cream
    vec3 darkBg = vec3(0.043, 0.039, 0.055);          // #0B0A0E
    vec3 darkViolet = vec3(0.769, 0.710, 0.992);      // #C4B5FD
    vec3 darkWarm = vec3(0.949, 0.776, 0.553);        // #F2C68D

    vec3 creamBg = vec3(0.980, 0.969, 0.949);         // #FAF7F2
    vec3 creamCobalt = vec3(0.310, 0.275, 0.898);     // #4F46E5
    vec3 creamWarm = vec3(0.706, 0.325, 0.035);       // #B45309

    vec3 baseBg = mix(darkBg, creamBg, uThemeMix);
    vec3 primaryGlow = mix(darkViolet, creamCobalt, uThemeMix);
    vec3 secondaryGlow = mix(darkWarm, creamWarm, uThemeMix);

    // Light envelope centered near the upper-middle hero rim
    float horizonEnvelope = exp(-pow((uv.y - 0.58) * 2.15, 2.0));
    float radialFocus = exp(-dot(p - vec2(0.0, 0.08), p - vec2(0.0, 0.08)) * 1.15);

    vec3 lightTint = mix(primaryGlow, secondaryGlow, smoothstep(-0.4, 0.6, p.x + q.x * 0.35));
    float causticStrength = mix(0.24, 0.095, uThemeMix);
    float flareStrength = mix(0.16, 0.065, uThemeMix);
    float gridStrength = mix(0.075, 0.048, uThemeMix);

    vec3 col = baseBg;
    col = mix(col, lightTint, causticBand * causticStrength * (0.45 + 0.55 * radialFocus));
    col += lightTint * rimFlare * flareStrength * (0.5 + 0.5 * horizonEnvelope);
    col += primaryGlow * ptrInfluence * mix(0.09, 0.045, uThemeMix);

    // Crisp hairline grid modulated by caustic intensity
    float gridAlpha = (gridLine * 0.55 + majorStep * 0.85) * gridStrength * (0.35 + 0.75 * causticBand + ptrInfluence * 0.8);
    vec3 gridColor = mix(vec3(1.0, 0.965, 0.918), vec3(0.118, 0.102, 0.149), uThemeMix);
    col = mix(col, gridColor, clamp(gridAlpha, 0.0, 0.16));

    // Seamless bottom & edge fade directly into --bg so there is never a harsh seam
    float bottomFade = smoothstep(0.02, 0.42, uv.y);
    float topFade = smoothstep(1.0, 0.84, uv.y) * 0.35 + 0.65;
    col = mix(baseBg, col, bottomFade * topFade);

    gl_FragColor = vec4(col, 1.0);
  }
`;

function detectSoftwareWebGL(): boolean {
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererInfo = ext
      ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL))
      : String(gl.getParameter(gl.RENDERER));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererInfo);
  } catch {
    return true;
  }
}

export function HeroShaderCanvas({ theme, reducedMotion }: HeroShaderCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const themeRef = useRef<SiteTheme>(theme);
  const reducedMotionRef = useRef<boolean>(reducedMotion);
  const [webglUnavailable, setWebglUnavailable] = useState(false);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglUnavailable(true);
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const initialDpr = isSoftwareGl
      ? 1
      : getCappedPixelRatio(window.innerWidth, window.devicePixelRatio || 1);
    renderer.setPixelRatio(initialDpr);

    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    renderer.setSize(width, height, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const pointerTarget = new THREE.Vector2(0.5, 0.56);
    const pointerCurrent = new THREE.Vector2(0.5, 0.56);
    let pointerActiveTarget = 0.0;
    let pointerActiveCurrent = 0.0;
    let themeMixCurrent = themeRef.current === 'cream' ? 1.0 : 0.0;

    const uniforms = {
      uTime: { value: 1.6 },
      uResolution: { value: new THREE.Vector2(width * initialDpr, height * initialDpr) },
      uPointer: { value: pointerCurrent },
      uPointerActive: { value: 0.0 },
      uThemeMix: { value: themeMixCurrent },
    };

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      depthWrite: false,
      depthTest: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    let isVisible = true;
    let contextLost = false;
    let rafId = 0;
    let timeoutId = 0;
    let lastTs = performance.now();

    const scheduleAfterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        timeoutId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (!sync) {
          timeoutId = window.setTimeout(cb, 80);
          return;
        }
        const status = gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (status === gl.UNSIGNALED) {
          timeoutId = window.setTimeout(poll, 5);
        } else {
          gl.deleteSync(sync);
          timeoutId = window.setTimeout(cb, 80);
        }
      };
      timeoutId = window.setTimeout(poll, 5);
    };

    const renderFrame = (advanceTime: boolean) => {
      if (contextLost) return;
      const now = performance.now();
      const dt = clampDeltaTime((now - lastTs) / 1000);
      lastTs = now;

      if (advanceTime && !reducedMotionRef.current) {
        uniforms.uTime.value += dt;
      }

      const damp = 1 - Math.exp(-5.5 * dt);
      pointerCurrent.lerp(pointerTarget, damp);
      pointerActiveCurrent += (pointerActiveTarget - pointerActiveCurrent) * damp;
      uniforms.uPointerActive.value = pointerActiveCurrent;

      const themeTarget = themeRef.current === 'cream' ? 1.0 : 0.0;
      themeMixCurrent += (themeTarget - themeMixCurrent) * (1 - Math.exp(-9 * dt));
      uniforms.uThemeMix.value = themeMixCurrent;

      renderer.render(scene, camera);
    };

    const tick = () => {
      if (!isVisible || contextLost) return;
      renderFrame(true);
      if (reducedMotionRef.current) return;
      if (isSoftwareGl) {
        scheduleAfterDraw(tick);
      } else {
        rafId = window.requestAnimationFrame(tick);
      }
    };

    const startLoop = () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
      lastTs = performance.now();
      renderFrame(false);
      if (!reducedMotionRef.current && isVisible && !contextLost) {
        if (isSoftwareGl) {
          scheduleAfterDraw(tick);
        } else {
          rafId = window.requestAnimationFrame(tick);
        }
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const nx = THREE.MathUtils.clamp((e.clientX - rect.left) / rect.width, 0, 1);
      const ny = THREE.MathUtils.clamp(1 - (e.clientY - rect.top) / rect.height, 0, 1);
      pointerTarget.set(nx, ny);
      pointerActiveTarget = 1.0;
    };

    const onPointerLeave = () => {
      pointerActiveTarget = 0.0;
    };

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const w = Math.max(entry.contentRect.width, 1);
      const h = Math.max(entry.contentRect.height, 1);
      const dpr = isSoftwareGl
        ? 1
        : getCappedPixelRatio(window.innerWidth, window.devicePixelRatio || 1);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      uniforms.uResolution.value.set(w * dpr, h * dpr);
      if (reducedMotionRef.current || !isVisible) {
        renderFrame(false);
      }
    });
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        const nowVisible = entry.isIntersecting;
        if (nowVisible && !isVisible) {
          isVisible = true;
          startLoop();
        } else if (!nowVisible) {
          isVisible = false;
          window.cancelAnimationFrame(rafId);
          window.clearTimeout(timeoutId);
        }
      },
      { threshold: 0.02 },
    );
    intersectionObserver.observe(container);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      contextLost = true;
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
    };

    const onContextRestored = () => {
      contextLost = false;
      startLoop();
    };

    renderer.domElement.addEventListener('webglcontextlost', onContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });

    startLoop();

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  if (webglUnavailable) {
    return (
      <div
        aria-hidden="true"
        data-testid="hero-shader-fallback"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 72% 52% at 50% 34%, var(--spotlight) 0%, transparent 72%)',
        }}
      />
    );
  }

  return (
    <div
      ref={containerRef}
      data-testid="hero-shader-canvas"
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    />
  );
}
