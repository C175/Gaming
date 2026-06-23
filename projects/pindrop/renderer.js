// Renderer: all canvas drawing — pins, slots, balls, overlays
const Renderer = (() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx    = canvas.getContext('2d');

  const {
    CW, CH, SLOT_TOP, SLOT_W, SLOT_N, SLOT_NUMBERS, NUMBER_TO_SLOT, pins,
  } = Physics;
  const { pinRadius, ballRadius } = CONFIG.physics;
  const PRIMARY = CONFIG.branding.primaryColour;
  const BG      = CONFIG.branding.backgroundColor;

  // Precompute red numbers for slot colouring reference
  const RED = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

  function clear() {
    ctx.fillStyle = BG;
    ctx.fillRect(0, 0, CW, CH);
  }

  function drawPins() {
    pins.forEach(({ x, y }) => {
      const g = ctx.createRadialGradient(x - 1.5, y - 1.5, 0, x, y, pinRadius + 2);
      g.addColorStop(0, '#d8e8f0');
      g.addColorStop(1, '#3a5060');
      ctx.beginPath();
      ctx.arc(x, y, pinRadius + 1, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    });
  }

  function drawSlots(winningNumber, slotCounts) {
    const slotH = CH - SLOT_TOP;

    for (let i = 0; i < SLOT_N; i++) {
      const sx  = i * SLOT_W;
      const num = SLOT_NUMBERS[i];
      const isW = num === winningNumber;
      const cnt = slotCounts ? (slotCounts[i] || 0) : 0;

      // Slot background
      ctx.fillStyle = isW ? 'rgba(240,192,64,0.10)' : 'rgba(255,255,255,0.02)';
      ctx.fillRect(sx + 1, SLOT_TOP + 2, SLOT_W - 2, slotH - 3);

      // Number label
      ctx.font        = '8px monospace';
      ctx.textAlign   = 'center';
      ctx.fillStyle   = isW ? PRIMARY : (RED.has(num) ? '#884444' : '#446688');
      ctx.fillText(num, sx + SLOT_W / 2, SLOT_TOP + 13);

      // Ball-count indicator
      if (cnt > 0) {
        ctx.font      = `bold ${cnt > 9 ? 9 : 11}px monospace`;
        ctx.fillStyle = isW ? PRIMARY : '#7799bb';
        ctx.fillText(cnt, sx + SLOT_W / 2, CH - 6);
      }
    }

    // Divider lines
    ctx.fillStyle = '#253545';
    for (let i = 0; i <= SLOT_N; i++) {
      ctx.fillRect(i * SLOT_W, SLOT_TOP, 1, slotH);
    }
    // Top border
    ctx.fillStyle = '#3a5264';
    ctx.fillRect(0, SLOT_TOP, CW, 2);
  }

  function drawWinGlow(winningNumber, intensity) {
    if (!winningNumber === null || intensity <= 0) return;
    const idx = NUMBER_TO_SLOT[winningNumber];
    if (idx === undefined) return;
    const sx    = idx * SLOT_W;
    const slotH = CH - SLOT_TOP;
    const g     = ctx.createLinearGradient(sx, SLOT_TOP, sx, CH);
    g.addColorStop(0, `rgba(240,192,64,${(intensity * 0.55).toFixed(2)})`);
    g.addColorStop(1, `rgba(240,192,64,${(intensity * 0.05).toFixed(2)})`);
    ctx.fillStyle = g;
    ctx.fillRect(sx + 1, SLOT_TOP + 2, SLOT_W - 2, slotH - 3);
  }

  function drawBalls(balls) {
    balls.forEach(({ body, isCascade, removed }) => {
      if (removed) return;
      const { x, y } = body.position;
      const r        = ballRadius;

      // Soft glow halo
      const halo = ctx.createRadialGradient(x, y, 0, x, y, r * 3.2);
      halo.addColorStop(0, isCascade ? 'rgba(150,210,255,0.3)' : 'rgba(255,255,255,0.3)');
      halo.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.beginPath();
      ctx.arc(x, y, r * 3.2, 0, Math.PI * 2);
      ctx.fillStyle = halo;
      ctx.fill();

      // Ball surface
      const surf = ctx.createRadialGradient(x - r * 0.35, y - r * 0.35, 0, x, y, r);
      surf.addColorStop(0, '#ffffff');
      surf.addColorStop(0.55, isCascade ? '#b0d8f8' : '#d8e8f4');
      surf.addColorStop(1, '#6080a0');
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = surf;
      ctx.fill();
    });
  }

  function drawOverlay(text) {
    if (!text) return;
    ctx.fillStyle = 'rgba(0,0,0,0.52)';
    ctx.fillRect(0, 0, CW, CH);
    ctx.save();
    ctx.shadowColor = PRIMARY;
    ctx.shadowBlur  = 35;
    ctx.font        = 'bold 58px "Segoe UI", Arial, sans-serif';
    ctx.textAlign   = 'center';
    ctx.fillStyle   = PRIMARY;
    ctx.fillText(text, CW / 2, CH / 2 + 20);
    ctx.restore();
  }

  function drawPayoutPopup(multiplier, win) {
    if (!multiplier && multiplier !== 0) return;
    ctx.save();
    ctx.textAlign   = 'center';
    ctx.shadowColor = PRIMARY;
    ctx.shadowBlur  = 28;

    ctx.font      = 'bold 50px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle = PRIMARY;
    ctx.fillText(`${multiplier}×`, CW / 2, CH / 2 - 8);

    ctx.shadowBlur  = 12;
    ctx.font        = 'bold 30px "Segoe UI", Arial, sans-serif';
    ctx.fillStyle   = '#ffffff';
    ctx.fillText(`£${win.toFixed(2)}`, CW / 2, CH / 2 + 34);
    ctx.restore();
  }

  return {
    clear, drawPins, drawSlots,
    drawWinGlow, drawBalls,
    drawOverlay, drawPayoutPopup,
  };
})();
