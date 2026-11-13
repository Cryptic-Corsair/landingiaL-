import type { SandboxPillDef } from '../data/ialData';

export interface HeroTokenBody {
  id: string;
  kind: 'sphere' | 'capsule';
  label: string;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  width: number;
  height: number;
  squashX: number;
  squashY: number;
}

export interface SandboxPillBody {
  id: string;
  label: string;
  color: string;
  textColor: string;
  x: number; // center X
  y: number; // center Y
  vx: number;
  vy: number;
  width: number;
  height: number;
  angle: number;
  vAngle: number;
  targetX: number;
  targetY: number;
  dragging: boolean;
}

/**
 * Computes neat aligned shelf positions for GravitySandbox "Snap to Order".
 */
export function computeSandboxSnapTargets(
  containerWidth: number,
  containerHeight: number,
  pills: ReadonlyArray<{ id: string; width: number; height: number }>,
): Record<string, { x: number; y: number }> {
  const safeW = Math.max(280, containerWidth);
  const safeH = Math.max(240, containerHeight);
  const padX = 24;
  const gapX = 12;
  const gapY = 14;
  const maxRowWidth = safeW - padX * 2;

  const rows: Array<Array<{ id: string; width: number; height: number }>> = [];
  let currentRow: Array<{ id: string; width: number; height: number }> = [];
  let rowWidth = 0;

  for (const pill of pills) {
    const nextWidth = currentRow.length === 0 ? pill.width : rowWidth + gapX + pill.width;
    if (currentRow.length > 0 && nextWidth > maxRowWidth) {
      rows.push(currentRow);
      currentRow = [pill];
      rowWidth = pill.width;
    } else {
      currentRow.push(pill);
      rowWidth = nextWidth;
    }
  }
  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  const rowHeight = pills[0]?.height ?? 42;
  const totalHeight = rows.length * rowHeight + Math.max(0, rows.length - 1) * gapY;
  const startY = Math.max(rowHeight / 2 + 20, (safeH - totalHeight) / 2 + rowHeight / 2);

  const targets: Record<string, { x: number; y: number }> = {};
  rows.forEach((row, rIdx) => {
    const totalRowW =
      row.reduce((acc, item) => acc + item.width, 0) + Math.max(0, row.length - 1) * gapX;
    let cursorX = (safeW - totalRowW) / 2;
    const centerY = startY + rIdx * (rowHeight + gapY);

    for (const item of row) {
      targets[item.id] = {
        x: cursorX + item.width / 2,
        y: centerY,
      };
      cursorX += item.width + gapX;
    }
  });

  return targets;
}

export function createSandboxBodies(
  definitions: readonly SandboxPillDef[],
  containerWidth: number,
  containerHeight: number,
): SandboxPillBody[] {
  const safeW = Math.max(300, containerWidth);
  const sized = definitions.map((def) => ({
    ...def,
    width: Math.max(88, Math.min(168, def.label.length * 9 + 34)),
    height: 42,
  }));
  const targets = computeSandboxSnapTargets(safeW, containerHeight, sized);

  return sized.map((def, idx) => {
    const col = idx % 4;
    const row = Math.floor(idx / 4);
    const spreadX = Math.max(80, Math.min(safeW - 80, 90 + col * ((safeW - 180) / 3) + ((idx % 2) * 18 - 9)));
    return {
      id: def.id,
      label: def.label,
      color: def.color,
      textColor: def.textColor,
      x: spreadX,
      y: -50 - row * 58 - (idx % 3) * 18,
      vx: ((idx % 5) - 2) * 32,
      vy: 40 + (idx % 3) * 20,
      width: def.width,
      height: def.height,
      angle: ((idx % 7) - 3) * 0.08,
      vAngle: ((idx % 3) - 1) * 0.6,
      targetX: targets[def.id]?.x ?? safeW / 2,
      targetY: targets[def.id]?.y ?? containerHeight / 2,
      dragging: false,
    };
  });
}

/**
 * Pure physics integration step for GravitySandbox pills (wall bounds + separation + snap spring).
 */
export function stepSandboxPhysics(
  bodies: SandboxPillBody[],
  containerWidth: number,
  containerHeight: number,
  dt: number,
  mode: 'chaos' | 'snap',
): void {
  const safeDt = Math.min(Math.max(dt, 0.001), 0.035);
  const safeW = Math.max(240, containerWidth);
  const safeH = Math.max(200, containerHeight);

  if (mode === 'snap') {
    const springK = 14;
    const damp = Math.exp(-8.5 * safeDt);
    for (const b of bodies) {
      if (b.dragging) continue;
      const dx = b.targetX - b.x;
      const dy = b.targetY - b.y;
      b.vx = (b.vx + dx * springK * 10 * safeDt) * damp;
      b.vy = (b.vy + dy * springK * 10 * safeDt) * damp;
      b.x += b.vx * safeDt;
      b.y += b.vy * safeDt;
      b.angle *= Math.exp(-10 * safeDt);
      b.vAngle = 0;
    }
    return;
  }

  const gravity = 980;
  const restitution = 0.54;
  const airDamp = Math.exp(-0.45 * safeDt);

  for (const b of bodies) {
    if (b.dragging) continue;
    b.vy += gravity * safeDt;
    b.vx *= airDamp;
    b.vy *= airDamp;
    b.x += b.vx * safeDt;
    b.y += b.vy * safeDt;
    b.angle += b.vAngle * safeDt;
    b.vAngle *= Math.exp(-2.2 * safeDt);

    const halfW = b.width / 2;
    const halfH = b.height / 2;
    const pad = 8;

    if (b.x - halfW < pad) {
      b.x = pad + halfW;
      b.vx = Math.abs(b.vx) * restitution;
      b.vAngle += b.vy * 0.0015;
    } else if (b.x + halfW > safeW - pad) {
      b.x = safeW - pad - halfW;
      b.vx = -Math.abs(b.vx) * restitution;
      b.vAngle -= b.vy * 0.0015;
    }

    if (b.y + halfH > safeH - pad) {
      b.y = safeH - pad - halfH;
      if (Math.abs(b.vy) < 28) {
        b.vy = 0;
      } else {
        b.vy = -Math.abs(b.vy) * restitution;
      }
      b.vx *= 0.94;
      b.angle *= 0.92;
      b.vAngle *= 0.85;
    } else if (b.y - halfH < pad && b.vy < 0) {
      // Soft ceiling containment after pills have dropped into the tray
      b.y = pad + halfH;
      b.vy = Math.abs(b.vy) * restitution;
    }
  }

  // Pairwise capsule separation & soft impulse transfer (2 iterations for stability)
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < bodies.length; i++) {
      const a = bodies[i];
      for (let j = i + 1; j < bodies.length; j++) {
        const b = bodies[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const minX = (a.width + b.width) * 0.46;
        const minY = (a.height + b.height) * 0.5;
        const overlapX = minX - Math.abs(dx);
        const overlapY = minY - Math.abs(dy);

        if (overlapX > 0 && overlapY > 0) {
          if (overlapX < overlapY) {
            const sign = dx >= 0 ? 1 : -1;
            const shift = overlapX * 0.5;
            if (!a.dragging) a.x -= sign * shift;
            if (!b.dragging) b.x += sign * shift;
            const relVx = b.vx - a.vx;
            if (relVx * sign < 0) {
              const imp = relVx * 0.65;
              if (!a.dragging) a.vx += imp;
              if (!b.dragging) b.vx -= imp;
            }
          } else {
            const sign = dy >= 0 ? 1 : -1;
            const shift = overlapY * 0.5;
            if (!a.dragging) a.y -= sign * shift;
            if (!b.dragging) b.y += sign * shift;
            const relVy = b.vy - a.vy;
            if (relVy * sign < 0) {
              const imp = relVy * 0.62;
              if (!a.dragging) a.vy += imp;
              if (!b.dragging) b.vy -= imp;
              if (!a.dragging) a.vAngle += (Math.random() - 0.5) * 0.3;
            }
          }
        }
      }
    }
  }
}

/**
 * Pure physics integration step for HeroPhysicsCanvas tokens.
 */
export function stepHeroBodies(
  bodies: HeroTokenBody[],
  width: number,
  height: number,
  dt: number,
  pointer: { x: number; y: number; active: boolean },
): void {
  const safeDt = Math.min(Math.max(dt, 0.001), 0.045);
  const centerX = width * 0.5;
  const centerY = height * 0.48;
  const exclRx = width < 640 ? width * 0.46 : Math.min(width * 0.28, 300);
  const exclRy = width < 640 ? Math.max(height * 0.27, 210) : Math.min(height * 0.22, 165);

  for (const b of bodies) {
    // Cursor repulsion
    if (pointer.active) {
      const dx = b.x - pointer.x;
      const dy = b.y - pointer.y;
      const distSq = dx * dx + dy * dy;
      const repulseR = 170;
      if (distSq > 0.1 && distSq < repulseR * repulseR) {
        const dist = Math.sqrt(distSq);
        const force = (1 - dist / repulseR) * 520;
        b.vx += (dx / dist) * force * safeDt;
        b.vy += (dy / dist) * force * safeDt;
        b.squashX = Math.max(b.squashX, 1.12);
        b.squashY = Math.min(b.squashY, 0.9);
      }
    }

    // Gentle center safe-zone buoyancy push so tokens orbit wide margins cleanly
    const nx = (b.x - centerX) / Math.max(exclRx, 1);
    const ny = (b.y - centerY) / Math.max(exclRy, 1);
    const ellDist = nx * nx + ny * ny;
    if (ellDist < 1.0 && ellDist > 0.001) {
      const push = (1 - ellDist) * 260;
      const len = Math.hypot(nx, ny);
      b.vx += (nx / len) * push * safeDt;
      b.vy += (ny / len) * push * safeDt;
    }

    // Soft speed limit & gentle orbital drift maintain
    const speed = Math.hypot(b.vx, b.vy);
    if (speed > 190) {
      b.vx = (b.vx / speed) * 190;
      b.vy = (b.vy / speed) * 190;
    } else if (speed < 18) {
      b.vx += Math.cos(b.x * 0.01) * 14 * safeDt;
      b.vy += Math.sin(b.y * 0.01) * 14 * safeDt;
    }

    b.x += b.vx * safeDt;
    b.y += b.vy * safeDt;

    // Recover squash & stretch smoothly
    const recover = 1 - Math.exp(-8 * safeDt);
    b.squashX += (1 - b.squashX) * recover;
    b.squashY += (1 - b.squashY) * recover;

    const halfW = b.kind === 'sphere' ? b.radius : b.width * 0.5;
    const halfH = b.kind === 'sphere' ? b.radius : b.height * 0.5;
    const pad = 16;

    if (b.x - halfW < pad) {
      b.x = pad + halfW;
      b.vx = Math.abs(b.vx) * 0.96;
      b.squashX = 0.86;
      b.squashY = 1.15;
    } else if (b.x + halfW > width - pad) {
      b.x = width - pad - halfW;
      b.vx = -Math.abs(b.vx) * 0.96;
      b.squashX = 0.86;
      b.squashY = 1.15;
    }

    if (b.y - halfH < pad) {
      b.y = pad + halfH;
      b.vy = Math.abs(b.vy) * 0.96;
      b.squashX = 1.15;
      b.squashY = 0.86;
    } else if (b.y + halfH > height - pad) {
      b.y = height - pad - halfH;
      b.vy = -Math.abs(b.vy) * 0.96;
      b.squashX = 1.15;
      b.squashY = 0.86;
    }
  }

  // Pairwise elastic circle collision
  for (let i = 0; i < bodies.length; i++) {
    const a = bodies[i];
    const ra = a.kind === 'sphere' ? a.radius : a.width * 0.44;
    for (let j = i + 1; j < bodies.length; j++) {
      const b = bodies[j];
      const rb = b.kind === 'sphere' ? b.radius : b.width * 0.44;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy);
      const minDist = ra + rb + 4;
      if (dist > 0.01 && dist < minDist) {
        const nx = dx / dist;
        const ny = dy / dist;
        const overlap = (minDist - dist) * 0.5;
        a.x -= nx * overlap;
        a.y -= ny * overlap;
        b.x += nx * overlap;
        b.y += ny * overlap;

        const rvx = b.vx - a.vx;
        const rvy = b.vy - a.vy;
        const velAlongNormal = rvx * nx + rvy * ny;
        if (velAlongNormal < 0) {
          const jImp = -velAlongNormal * 0.92;
          a.vx -= jImp * nx;
          a.vy -= jImp * ny;
          b.vx += jImp * nx;
          b.vy += jImp * ny;
          a.squashX = 0.9;
          a.squashY = 1.1;
          b.squashX = 0.9;
          b.squashY = 1.1;
        }
      }
    }
  }
}
