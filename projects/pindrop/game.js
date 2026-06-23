// Game: state machine, game loop, coordinates physics/renderer/betting/ui
const Game = (() => {
  const S = { IDLE: 0, BETTING: 1, DROPPING: 2, CASCADE: 3, PAYOUT: 4 };

  let state          = S.IDLE;
  let selectedNumber = null;

  // Ball tracking: { body, isCascade, settled, removed, slotIndex, processed }
  let balls      = [];
  let slotCounts = new Array(37).fill(0);

  // Cascade state
  let cascadeDropped  = 0;
  let cascadeTimer    = null;
  let payoutShown     = false;

  // Render state
  let winGlow      = 0;
  let overlayText  = null;
  let payoutPopup  = null; // { multiplier, win }

  // ── State helpers ──────────────────────────────────────────────────────────

  function setState(s) {
    state = s;
    const interactive = s === S.IDLE || s === S.BETTING;
    UI.setInteractive(interactive);
    if (s === S.BETTING) UI.setDropEnabled(selectedNumber !== null);
    if (!interactive)    UI.setDropEnabled(false);
    UI.updateBalance();
  }

  // ── Public event handlers (called by UI) ───────────────────────────────────

  function onSelectNumber(num) {
    if (state !== S.IDLE && state !== S.BETTING) return;
    selectedNumber = num;
    Betting.selectNumber(num);
    if (state === S.IDLE) setState(S.BETTING);
    else UI.setDropEnabled(true);
  }

  function onSetStake(s) {
    Betting.setStake(s);
  }

  function onDrop() {
    if (state !== S.BETTING || selectedNumber === null) return;
    if (!Betting.placeBet()) {
      UI.showStatus('Insufficient balance!');
      return;
    }
    resetRound();
    setState(S.DROPPING);
    UI.showStatus('');
    launchBall(false);
  }

  // ── Round lifecycle ────────────────────────────────────────────────────────

  function resetRound() {
    clearTimeout(cascadeTimer);
    balls.forEach(b => Physics.removeBall(b.body));
    balls          = [];
    slotCounts     = new Array(37).fill(0);
    cascadeDropped = 0;
    payoutShown    = false;
    winGlow        = 0;
    overlayText    = null;
    payoutPopup    = null;
  }

  function launchBall(isCascade) {
    const x    = 60 + Math.random() * (Physics.CW - 120);
    const body = Physics.createBall(x);
    balls.push({ body, isCascade, settled: false, removed: false, slotIndex: -1, processed: false });
  }

  function startCascade() {
    overlayText = 'STAGE 2';
    setTimeout(() => { if (overlayText === 'STAGE 2') overlayText = null; }, 1200);

    setState(S.CASCADE);
    UI.showStatus('30 balls dropping…');
    cascadeDropped = 0;
    payoutShown    = false;

    dropNextCascadeBall();

    // Safety timeout: auto-resolve 12 s after last ball launches
    const safetyDelay =
      CONFIG.gameplay.stage2BallCount * CONFIG.gameplay.stage2BallInterval + 12000;
    setTimeout(() => {
      if (state === S.CASCADE && !payoutShown) {
        payoutShown = true;
        showPayout();
      }
    }, safetyDelay);
  }

  function dropNextCascadeBall() {
    if (cascadeDropped >= CONFIG.gameplay.stage2BallCount) return;
    cascadeDropped++;
    launchBall(true);
    if (cascadeDropped < CONFIG.gameplay.stage2BallCount) {
      cascadeTimer = setTimeout(dropNextCascadeBall, CONFIG.gameplay.stage2BallInterval);
    }
  }

  // ── Ball settlement detection ──────────────────────────────────────────────

  function checkBallSettled(ball) {
    if (ball.settled || ball.removed) return;
    if (ball.body.position.y > Physics.SLOT_TOP + 22) {
      ball.settled   = true;
      ball.slotIndex = Physics.getSlotIndex(ball.body.position.x);
      if (ball.isCascade) slotCounts[ball.slotIndex]++;
      setTimeout(() => {
        ball.removed = true;
        Physics.removeBall(ball.body);
      }, 550);
    }
  }

  function processStage1Ball(ball) {
    if (ball.processed || !ball.settled || ball.isCascade) return;
    ball.processed = true;

    const landed = Physics.SLOT_NUMBERS[ball.slotIndex];
    if (landed === selectedNumber) {
      winGlow = 1;
      setState(S.PAYOUT); // lock input during HIT pause
      setTimeout(startCascade, 900);
    } else {
      overlayText = 'MISS';
      setState(S.PAYOUT);
      setTimeout(() => {
        overlayText    = null;
        selectedNumber = null;
        balls          = [];
        document.querySelectorAll('.bet-num.selected').forEach(b => b.classList.remove('selected'));
        setState(S.IDLE);
        UI.showStatus('Select a number and drop!');
      }, 1600);
    }
  }

  function checkCascadeComplete() {
    if (state !== S.CASCADE || payoutShown) return;
    if (cascadeDropped < CONFIG.gameplay.stage2BallCount) return;
    const settled = balls.filter(b => b.isCascade && b.settled).length;
    if (settled >= CONFIG.gameplay.stage2BallCount) {
      payoutShown = true;
      setTimeout(showPayout, 650);
    }
  }

  function showPayout() {
    const winSlot    = Physics.NUMBER_TO_SLOT[selectedNumber];
    const ballsInWin = slotCounts[winSlot] || 0;
    const { multiplier, win } = Betting.calculatePayout(ballsInWin);

    winGlow     = 1;
    payoutPopup = { multiplier, win };
    setState(S.PAYOUT);
    UI.showStatus(
      `${ballsInWin} ball${ballsInWin !== 1 ? 's' : ''} in slot ${selectedNumber} — ${multiplier}× — £${win.toFixed(2)}`
    );

    setTimeout(() => {
      payoutPopup    = null;
      winGlow        = 0;
      overlayText    = null;
      balls          = [];
      slotCounts     = new Array(37).fill(0);
      selectedNumber = null;
      document.querySelectorAll('.bet-num.selected').forEach(b => b.classList.remove('selected'));
      setState(S.IDLE);
      UI.showStatus('Select a number and drop!');
    }, 4200);
  }

  // ── Game loop ──────────────────────────────────────────────────────────────

  function gameLoop() {
    Physics.step();

    balls.forEach(ball => {
      checkBallSettled(ball);
      processStage1Ball(ball);
    });

    if (state === S.CASCADE) checkCascadeComplete();

    // Pulse win glow during cascade
    if (state === S.CASCADE && winGlow > 0) {
      winGlow = 0.55 + 0.45 * Math.abs(Math.sin(Date.now() * 0.0045));
    }

    // Draw frame
    Renderer.clear();
    Renderer.drawPins();
    if (selectedNumber !== null && winGlow > 0) {
      Renderer.drawWinGlow(selectedNumber, winGlow);
    }
    Renderer.drawSlots(selectedNumber, slotCounts);
    Renderer.drawBalls(balls);
    if (overlayText) Renderer.drawOverlay(overlayText);
    if (payoutPopup) Renderer.drawPayoutPopup(payoutPopup.multiplier, payoutPopup.win);

    requestAnimationFrame(gameLoop);
  }

  // ── Init ──────────────────────────────────────────────────────────────────

  function init() {
    UI.buildBetTable();
    UI.buildStakeButtons();
    document.getElementById('drop-btn').addEventListener('click', onDrop);
    setState(S.IDLE);
    UI.showStatus('Select a number and drop!');
    requestAnimationFrame(gameLoop);
  }

  return { init, onSelectNumber, onSetStake };
})();

window.addEventListener('DOMContentLoaded', Game.init);
