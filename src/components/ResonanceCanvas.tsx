import { type MutableRefObject, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  scrollProgressToCamera,
  scrollProgressToMorph,
} from '../lib/scrollCurves';
import {
  resonanceFragmentShader,
  resonanceVertexShader,
} from '../shaders/resonanceShaders';
import {
  clampMorph,
  dampValue,
  generateParticleFormations,
  getParticleCount,
} from '../utils/formations';

export interface ResonanceCanvasProps {
  morphTarget?: number;
  scrollProgressRef?: MutableRefObject<number>;
  exciteValueRef?: MutableRefObject<number>;
  staticRenderCallbackRef?: MutableRefObject<(() => void) | null>;
  exciteActive?: boolean;
  shockwaveTrigger?: number;
}

// Reusable scratch math objects allocated once at module scope (zero GC in render loop)
const _ndc = new THREE.Vector2();
const _raycaster = new THREE.Raycaster();
const _interactionPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const _intersectPoint = new THREE.Vector3();

function detectSoftwareWebGL(): boolean {
  try {
    const probe = document.createElement('canvas');
    const gl = probe.getContext('webgl2') || probe.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return false;
  }
}

function createFormationGeometry(count: number): THREE.BufferGeometry {
  const data = generateParticleFormations(count);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(data.posA, 3));
  geometry.setAttribute('aPosA', new THREE.BufferAttribute(data.posA, 3));
  geometry.setAttribute('aPosB', new THREE.BufferAttribute(data.posB, 3));
  geometry.setAttribute('aPosC', new THREE.BufferAttribute(data.posC, 3));
  geometry.setAttribute('aRandom', new THREE.BufferAttribute(data.random, 3));
  return geometry;
}

export function ResonanceCanvas({
  morphTarget,
  scrollProgressRef,
  exciteValueRef,
  staticRenderCallbackRef,
  exciteActive = false,
  shockwaveTrigger = 0,
}: ResonanceCanvasProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const morphTargetRef = useRef<number | undefined>(
    morphTarget !== undefined ? clampMorph(morphTarget) : undefined,
  );
  const exciteActiveRef = useRef<boolean>(exciteActive);
  const lastShockTriggerRef = useRef<number>(shockwaveTrigger);
  const pendingShockwaveRef = useRef<boolean>(false);
  const renderStaticRef = useRef<(() => void) | null>(null);

  const [webglError, setWebglError] = useState<boolean>(false);
  const [particleCount, setParticleCount] = useState<number>(() =>
    typeof window !== 'undefined' ? getParticleCount(window.innerWidth) : 18000,
  );

  // Sync optional React props to refs without tearing down WebGL context
  useEffect(() => {
    morphTargetRef.current =
      morphTarget !== undefined ? clampMorph(morphTarget) : undefined;
    renderStaticRef.current?.();
  }, [morphTarget]);

  useEffect(() => {
    exciteActiveRef.current = exciteActive;
    renderStaticRef.current?.();
  }, [exciteActive]);

  useEffect(() => {
    if (shockwaveTrigger !== lastShockTriggerRef.current) {
      lastShockTriggerRef.current = shockwaveTrigger;
      pendingShockwaveRef.current = true;
      renderStaticRef.current?.();
    }
  }, [shockwaveTrigger]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = motionQuery.matches;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;
    let activeCount = getParticleCount(width);
    setParticleCount(activeCount);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: !isSoftwareGl,
        alpha: false,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglError(true);
      return;
    }

    const computePixelRatio = (viewportW: number) => {
      if (isSoftwareGl) return 1;
      const cap = viewportW < 768 ? 1.5 : 2;
      return Math.min(window.devicePixelRatio || 1, cap);
    };

    let currentPixelRatio = computePixelRatio(width);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(currentPixelRatio);
    renderer.setSize(width, height);
    renderer.setClearColor(0x110e17, 1);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x110e17);

    const fovDeg = 45;
    const camera = new THREE.PerspectiveCamera(fovDeg, width / height, 0.1, 100);
    let baseCameraZ = 7.6;
    let currentLookY = 0;

    const updateCameraFraming = (w: number, h: number) => {
      const aspect = Math.max(w / Math.max(h, 1), 0.35);
      camera.aspect = aspect;
      const halfTan = Math.tan(THREE.MathUtils.degToRad(fovDeg) * 0.5);
      const requiredZ = 3.35 / (halfTan * aspect);
      baseCameraZ = THREE.MathUtils.clamp(requiredZ, 7.6, 14.5);
      camera.position.set(0, 0.28, baseCameraZ);
      camera.lookAt(0, currentLookY, 0);
      camera.updateProjectionMatrix();
    };
    updateCameraFraming(width, height);

    const resolveTargetMorph = () => {
      if (morphTargetRef.current !== undefined) {
        return morphTargetRef.current;
      }
      if (scrollProgressRef) {
        return scrollProgressToMorph(scrollProgressRef.current);
      }
      return 0;
    };

    let geometry = createFormationGeometry(activeCount);
    const uniforms = {
      uTime: { value: 0 },
      uMorph: { value: resolveTargetMorph() },
      uPixelRatio: { value: currentPixelRatio },
      uPointer: { value: new THREE.Vector3(0, 0, 0) },
      uPointerActive: { value: 0 },
      uExcite: { value: exciteActiveRef.current ? 1 : 0 },
      uShockwave: { value: 0 },
      uShockwaveStrength: { value: 0 },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: resonanceVertexShader,
      fragmentShader: resonanceFragmentShader,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });

    const points = new THREE.Points(geometry, material);
    points.frustumCulled = false;
    scene.add(points);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Interaction & animation state
    let pointerActiveTarget = 0;
    const pointerTarget = new THREE.Vector3(0, 0, 0);
    let pointerNdcX = 0;
    let pointerNdcY = 0;

    let currentMorph = resolveTargetMorph();
    let currentExcite = exciteActiveRef.current ? 1 : 0;
    let shockwaveRadius = 0;
    let shockwaveStrength = 0;
    let elapsedTime = 0;
    let lastTimestamp = performance.now();
    let frameId = 0;
    let disposed = false;
    let contextLost = false;

    const projectPointer = (clientX: number, clientY: number) => {
      const rect = renderer.domElement.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((clientY - rect.top) / rect.height) * 2 + 1;
      pointerNdcX = nx;
      pointerNdcY = ny;
      _ndc.set(nx, ny);
      _raycaster.setFromCamera(_ndc, camera);
      if (_raycaster.ray.intersectPlane(_interactionPlane, _intersectPoint)) {
        pointerTarget.copy(_intersectPoint);
        pointerActiveTarget = 1;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      projectPointer(e.clientX, e.clientY);
    };

    const handlePointerDown = (e: PointerEvent) => {
      projectPointer(e.clientX, e.clientY);
    };

    const handlePointerLeave = () => {
      pointerActiveTarget = 0;
      pointerNdcX = 0;
      pointerNdcY = 0;
    };

    const handleResize = () => {
      if (disposed || !container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      currentPixelRatio = computePixelRatio(width);

      renderer.setPixelRatio(currentPixelRatio);
      renderer.setSize(width, height);
      uniforms.uPixelRatio.value = currentPixelRatio;
      updateCameraFraming(width, height);

      const nextCount = getParticleCount(width);
      if (nextCount !== activeCount) {
        activeCount = nextCount;
        setParticleCount(activeCount);
        const nextGeometry = createFormationGeometry(activeCount);
        points.geometry = nextGeometry;
        geometry.dispose();
        geometry = nextGeometry;
      }

      if (prefersReducedMotion && !contextLost) {
        renderStaticFrame();
      }
    };

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      contextLost = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      setWebglError(true);
    };

    const handleContextRestored = () => {
      contextLost = false;
      setWebglError(false);
      lastTimestamp = performance.now();
      if (prefersReducedMotion) {
        renderStaticFrame();
      } else {
        scheduleNextFrame();
      }
    };

    function renderStaticFrame() {
      if (disposed || contextLost) return;
      const targetMorph = resolveTargetMorph();
      uniforms.uMorph.value = targetMorph;
      uniforms.uExcite.value = exciteValueRef
        ? exciteValueRef.current
        : exciteActiveRef.current
          ? 1.0
          : 0.0;
      uniforms.uShockwave.value = 0;
      uniforms.uShockwaveStrength.value = 0;
      pendingShockwaveRef.current = false;

      if (scrollProgressRef) {
        const camScroll = scrollProgressToCamera(scrollProgressRef.current);
        camera.position.set(0, camScroll.posY, baseCameraZ);
        currentLookY = camScroll.lookY;
        camera.lookAt(0, currentLookY, 0);
        points.rotation.set(camScroll.tiltX, camScroll.tiltY, 0);
      } else {
        points.rotation.set(0, 0, 0);
      }

      if (rootRef.current) {
        rootRef.current.dataset.morph = targetMorph.toFixed(2);
      }

      renderer.render(scene, camera);
    }

    const triggerStaticRender = () => {
      if (prefersReducedMotion) {
        renderStaticFrame();
      }
    };
    renderStaticRef.current = triggerStaticRender;
    if (staticRenderCallbackRef) {
      staticRenderCallbackRef.current = triggerStaticRender;
    }

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed || contextLost) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function scheduleNextFrame() {
      if (disposed || contextLost || prefersReducedMotion) return;
      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    function tick() {
      if (disposed || contextLost || prefersReducedMotion) return;

      const now = performance.now();
      const dt = Math.min(Math.max((now - lastTimestamp) / 1000, 0), 0.05);
      lastTimestamp = now;

      elapsedTime += dt;
      uniforms.uTime.value = elapsedTime;

      // Smooth morph interpolation driven by scroll progress or prop
      const morphGoal = resolveTargetMorph();
      currentMorph = dampValue(currentMorph, morphGoal, 6.2, dt);
      uniforms.uMorph.value = currentMorph;

      if (rootRef.current) {
        rootRef.current.dataset.morph = currentMorph.toFixed(2);
      }

      // Smooth pointer displacement
      uniforms.uPointer.value.lerp(pointerTarget, 1 - Math.exp(-10 * dt));
      uniforms.uPointerActive.value = dampValue(
        uniforms.uPointerActive.value,
        pointerActiveTarget,
        7.5,
        dt,
      );

      // Combine scroll camera choreography with subtle ambient drift & pointer parallax
      const camScroll = scrollProgressRef
        ? scrollProgressToCamera(scrollProgressRef.current)
        : { tiltX: 0, tiltY: 0, lookY: 0, posY: 0.28 };

      camera.position.y = dampValue(camera.position.y, camScroll.posY, 5.5, dt);
      camera.position.z = dampValue(camera.position.z, baseCameraZ, 5.5, dt);
      currentLookY = dampValue(currentLookY, camScroll.lookY, 5.5, dt);
      camera.lookAt(0, currentLookY, 0);

      const targetRotY =
        elapsedTime * 0.038 + camScroll.tiltY + pointerNdcX * 0.14;
      const targetRotX =
        Math.sin(elapsedTime * 0.12) * 0.035 +
        camScroll.tiltX -
        pointerNdcY * 0.1;

      points.rotation.y = dampValue(points.rotation.y, targetRotY, 4.5, dt);
      points.rotation.x = dampValue(points.rotation.x, targetRotX, 4.5, dt);

      // Excite hold pull (smooth 1.1s ramp via exciteValueRef or damped boolean) & release shockwave
      const exciteGoal = exciteValueRef
        ? exciteValueRef.current
        : exciteActiveRef.current
          ? 1
          : 0;
      currentExcite = exciteValueRef
        ? dampValue(currentExcite, exciteGoal, 14, dt)
        : dampValue(
            currentExcite,
            exciteGoal,
            exciteGoal > 0.5 ? 6.5 : 8.5,
            dt,
          );
      uniforms.uExcite.value = currentExcite;

      if (pendingShockwaveRef.current) {
        pendingShockwaveRef.current = false;
        shockwaveRadius = 0.08;
        shockwaveStrength = 1.0;
      }

      if (shockwaveStrength > 0.002) {
        shockwaveRadius += dt * 5.6;
        shockwaveStrength = dampValue(shockwaveStrength, 0, 2.35, dt);
      } else {
        shockwaveStrength = 0;
      }
      uniforms.uShockwave.value = shockwaveRadius;
      uniforms.uShockwaveStrength.value = shockwaveStrength;

      renderer.render(scene, camera);
      scheduleNextFrame();
    }

    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      if (prefersReducedMotion) {
        renderStaticFrame();
      } else {
        lastTimestamp = performance.now();
        scheduleNextFrame();
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    document.addEventListener('pointerleave', handlePointerLeave);
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener(
      'webglcontextrestored',
      handleContextRestored,
    );
    motionQuery.addEventListener('change', handleMotionChange);

    if (prefersReducedMotion) {
      renderStaticFrame();
    } else {
      renderer.render(scene, camera);
      scheduleNextFrame();
    }

    return () => {
      disposed = true;
      renderStaticRef.current = null;
      if (staticRenderCallbackRef) {
        staticRenderCallbackRef.current = null;
      }
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);

      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('pointerleave', handlePointerLeave);
      renderer.domElement.removeEventListener(
        'webglcontextlost',
        handleContextLost,
      );
      renderer.domElement.removeEventListener(
        'webglcontextrestored',
        handleContextRestored,
      );
      motionQuery.removeEventListener('change', handleMotionChange);

      scene.remove(points);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [scrollProgressRef, exciteValueRef, staticRenderCallbackRef]);

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 w-full h-full bg-[#110E17] pointer-events-none"
      data-testid="resonance-canvas-root"
      data-particle-count={particleCount}
      data-morph={(morphTarget ?? 0).toFixed(2)}
      data-excite={exciteActive ? 'active' : 'idle'}
    >
      <div
        ref={containerRef}
        className="w-full h-full"
        aria-label="Interactive 3D particle resonance sculpture"
      />
      {webglError && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#110E17] text-[#9D94B8] font-mono text-xs tracking-wide px-6 text-center">
          WebGL rendering context unavailable on this device.
        </div>
      )}
    </div>
  );
}
