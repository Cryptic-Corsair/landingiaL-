import { useEffect, useRef } from 'react';
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
  uniform float uThemeMix;

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
    vec2 warped = p - dir * ptrInfluence * 0.095;

    float t = uTime * 0.16;
    vec2 q = vec2(
      fbm(warped * 2.1 + vec2(t, -t * 0.6)),
      fbm(warped * 2.1 + vec2(-t * 0.7, t * 0.8) + vec2(4.2, 1.9))
    );
    float causticField = fbm(warped * 2.8 + q * 1.45 + vec2(t * 0.4, 0.0));
    float causticBand = smoothstep(0.46, 0.88, causticField);
    float rimFlare = pow(max(0.0, 1.0 - abs(causticField - 0.62) * 3.8), 2.2);

    vec3 darkBg = vec3(0.043, 0.039, 0.055);
    vec3 darkViolet = vec3(0.769, 0.710, 0.992);
    vec3 darkWarm = vec3(0.949, 0.776, 0.553);

    vec3 creamBg = vec3(0.980, 0.969, 0.949);
    vec3 creamCobalt = vec3(0.310, 0.275, 0.898);
    vec3 creamWarm = vec3(0.706, 0.325, 0.035);

    vec3 baseBg = mix(darkBg, creamBg, uThemeMix);
    vec3 primaryGlow = mix(darkViolet, creamCobalt, uThemeMix);
    vec3 secondaryGlow = mix(darkWarm, creamWarm, uThemeMix);

    float radialFocus = exp(-dot(p - vec2(0.0, 0.08), p - vec2(0.0, 0.08)) * 1.15);
    vec3 lightTint = mix(primaryGlow, secondaryGlow, smoothstep(-0.4, 0.6, p.x + q.x * 0.35));

    vec3 col = baseBg;
    col = mix(col, lightTint, causticBand * 0.24 * (0.45 + 0.55 * radialFocus));
    col += lightTint * rimFlare * 0.16;
    col += primaryGlow * ptrInfluence * 0.09;

    float bottomFade = smoothstep(0.02, 0.42, uv.y);
    float topFade = smoothstep(1.0, 0.84, uv.y) * 0.35 + 0.65;
    col = mix(baseBg, col, bottomFade * topFade);

    gl_FragColor = vec4(col, 1.0);
  }
`;

export function HeroShaderCanvas({ theme, reducedMotion }: HeroShaderCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const themeRef = useRef<SiteTheme>(theme);
  const reducedMotionRef = useRef<boolean>(reducedMotion);

  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    reducedMotionRef.current = reducedMotion;
  }, [reducedMotion]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const initialDpr = getCappedPixelRatio(window.innerWidth, window.devicePixelRatio || 1);
    renderer.setPixelRatio(initialDpr);

    const width = Math.max(container.clientWidth, 1);
    const height = Math.max(container.clientHeight, 1);
    renderer.setSize(width, height, false);
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

    let isVisible = true;
    let rafId = 0;
    let lastTs = performance.now();

    const renderFrame = (advanceTime: boolean) => {
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
      if (!isVisible) return;
      renderFrame(true);
      if (reducedMotionRef.current) return;
      rafId = window.requestAnimationFrame(tick);
    };

    const startLoop = () => {
      window.cancelAnimationFrame(rafId);
      lastTs = performance.now();
      renderFrame(false);
      if (!reducedMotionRef.current && isVisible) {
        rafId = window.requestAnimationFrame(tick);
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
      const dpr = getCappedPixelRatio(window.innerWidth, window.devicePixelRatio || 1);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      uniforms.uResolution.value.set(w * dpr, h * dpr);
      renderFrame(false);
    });
    resizeObserver.observe(container);

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        isVisible = entry.isIntersecting;
        if (isVisible) startLoop();
        else window.cancelAnimationFrame(rafId);
      },
      { threshold: 0.02 },
    );
    intersectionObserver.observe(container);

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave, { passive: true });

    startLoop();

    return () => {
      window.cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
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

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    />
  );
}
