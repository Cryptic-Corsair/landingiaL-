import test from 'node:test';
import assert from 'node:assert/strict';
import { SANDBOX_PILLS } from '../data/ialData';
import {
  computeSandboxSnapTargets,
  createSandboxBodies,
  stepHeroBodies,
  stepSandboxPhysics,
  type HeroTokenBody,
} from './physics';

test('createSandboxBodies creates all 14 pill bodies with finite snap targets inside bounds', () => {
  const width = 920;
  const height = 440;
  const bodies = createSandboxBodies(SANDBOX_PILLS, width, height);
  assert.equal(bodies.length, 14);
  for (const body of bodies) {
    assert.ok(body.targetX > 0 && body.targetX < width);
    assert.ok(body.targetY > 0 && body.targetY < height);
  }
});

test('computeSandboxSnapTargets wraps rows neatly on narrow viewports without overflow', () => {
  const items = SANDBOX_PILLS.map((p) => ({ id: p.id, width: 112, height: 42 }));
  const targets = computeSandboxSnapTargets(340, 440, items);
  for (const item of items) {
    const t = targets[item.id];
    assert.ok(t !== undefined);
    assert.ok(t.x - item.width / 2 >= 0);
    assert.ok(t.x + item.width / 2 <= 340);
  }
});

test('stepSandboxPhysics drops pills onto floor in chaos mode and converges toward snap targets', () => {
  const width = 800;
  const height = 440;
  const bodies = createSandboxBodies(SANDBOX_PILLS, width, height);

  // Drop under gravity
  for (let i = 0; i < 120; i++) {
    stepSandboxPhysics(bodies, width, height, 0.016, 'chaos');
  }
  for (const body of bodies) {
    assert.ok(body.y + body.height / 2 <= height + 1, 'pill stays above floor');
    assert.ok(body.x - body.width / 2 >= 0 && body.x + body.width / 2 <= width, 'pill stays inside walls');
  }

  // Snap to order
  for (let i = 0; i < 120; i++) {
    stepSandboxPhysics(bodies, width, height, 0.016, 'snap');
  }
  for (const body of bodies) {
    assert.ok(Math.abs(body.x - body.targetX) < 1.5, 'snapped X matches target');
    assert.ok(Math.abs(body.y - body.targetY) < 1.5, 'snapped Y matches target');
  }
});

test('stepHeroBodies bounces tokens off container walls cleanly', () => {
  const bodies: HeroTokenBody[] = [
    {
      id: 't1',
      kind: 'sphere',
      label: 'WCH11',
      color: '#FF5C35',
      x: 10,
      y: 250,
      vx: -120,
      vy: 0,
      radius: 26,
      width: 52,
      height: 52,
      squashX: 1,
      squashY: 1,
    },
  ];
  stepHeroBodies(bodies, 1000, 600, 0.016, { x: 0, y: 0, active: false });
  assert.ok(bodies[0].x >= 16 + 26, 'token clamped inside left bound');
  assert.ok(bodies[0].vx > 0, 'token velocity reversed elastically');
});
