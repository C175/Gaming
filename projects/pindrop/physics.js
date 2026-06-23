// Physics: Matter.js engine, pin grid, walls, slot dividers, ball lifecycle
const Physics = (() => {
  const { Engine, Bodies, Body, World } = Matter;

  const CW       = CONFIG.canvas.width;
  const CH       = CONFIG.canvas.height;
  const SLOT_TOP = CONFIG.canvas.slotTop;
  const SLOT_N   = 37;
  const SLOT_W   = CW / SLOT_N;

  const { pinSpacingX, pinSpacingY, pinRadius, ballRadius, pinRows } = CONFIG.physics;
  const GRID_TOP = 50;

  // European roulette wheel order mapped across physical slots left→right
  const SLOT_NUMBERS = [
    0, 32, 15, 19,  4, 21,  2, 25, 17, 34,
    6, 27, 13, 36, 11, 30,  8, 23, 10,  5,
   24, 16, 33,  1, 20, 14, 31,  9, 22, 18,
   29,  7, 28, 12, 35,  3, 26,
  ];

  const NUMBER_TO_SLOT = {};
  SLOT_NUMBERS.forEach((n, i) => { NUMBER_TO_SLOT[n] = i; });

  // Build Matter engine
  const engine = Engine.create({ gravity: { x: 0, y: 1, scale: 0.001 } });
  const world  = engine.world;

  // --- Pins ---
  const pins = [];
  const pinBodies = [];
  for (let row = 0; row < pinRows; row++) {
    const even   = row % 2 === 0;
    const count  = even ? 11 : 10;
    const startX = even ? 35 : 35 + pinSpacingX / 2;
    const y      = GRID_TOP + 28 + row * pinSpacingY;
    for (let col = 0; col < count; col++) {
      const x = startX + col * pinSpacingX;
      pins.push({ x, y });
      pinBodies.push(Bodies.circle(x, y, pinRadius, {
        isStatic: true, restitution: 0.5, friction: 0.05, label: 'pin',
      }));
    }
  }
  World.add(world, pinBodies);

  // --- Boundary walls ---
  const W = { isStatic: true, restitution: 0.35, friction: 0.08, label: 'wall' };
  World.add(world, [
    Bodies.rectangle(CW / 2, CH + 25,  CW + 100, 50,   W), // floor
    Bodies.rectangle(-25,    CH / 2,   50,        CH * 2, W), // left
    Bodies.rectangle(CW + 25, CH / 2,  50,        CH * 2, W), // right
  ]);

  // --- Slot dividers ---
  const divH   = CH - SLOT_TOP + 50;
  const divMid = SLOT_TOP + divH / 2;
  const DIV    = { isStatic: true, friction: 0.05, restitution: 0.1, label: 'divider' };
  for (let i = 1; i < SLOT_N; i++) {
    World.add(world, Bodies.rectangle(i * SLOT_W, divMid, 2, divH, DIV));
  }

  // --- Public API ---
  function getSlotIndex(x) {
    return Math.max(0, Math.min(SLOT_N - 1, Math.floor(x / SLOT_W)));
  }

  function createBall(startX) {
    const x = Math.max(ballRadius + 2, Math.min(CW - ballRadius - 2, startX));
    const b = Bodies.circle(x, GRID_TOP - 12, ballRadius, {
      restitution: 0.42,
      friction:    0.01,
      frictionAir: 0.008,
      density:     0.002,
      label:       'ball',
    });
    Body.setVelocity(b, { x: (Math.random() - 0.5) * 0.8, y: 0 });
    World.add(world, b);
    return b;
  }

  function removeBall(body) {
    try { World.remove(world, body); } catch (_) {}
  }

  function step(dt) {
    Engine.update(engine, dt || 1000 / 60);
  }

  return {
    engine, world, pins,
    CW, CH, GRID_TOP, SLOT_TOP, SLOT_W, SLOT_N,
    SLOT_NUMBERS, NUMBER_TO_SLOT,
    getSlotIndex, createBall, removeBall, step,
  };
})();
