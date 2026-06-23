# PinDrop — White-Label Bagatelle Casino Game
## Master Design Document v1.0

> **How to use this file:** Paste the relevant section(s) into Claude Code at the start of each session so it has full context. This document is the single source of truth for the game.

---

## 1. Concept Overview

A two-stage bagatelle-style casino game where a ball drops through a pin grid to determine an outcome. Inspired by FOBT bagatelle mechanics but built as an original web-based game for white-label licensing to online casinos and sweepstakes platforms.

**Core loop:**
1. Player places a bet on a number (0–36, roulette-style layout)
2. One ball drops through a pin grid — lands in a numbered slot
3. If ball matches player's number → Stage 2 begins
4. 30 balls drop rapidly — how many land in the player's number determines the payout multiplier
5. Payout = stake × multiplier

---

## 2. Game Mechanics (Detailed)

### Stage 1 — The Drop
- Roulette betting table shown at bottom of screen (numbers 0–36)
- Player clicks a number to place their bet
- Player clicks "Drop" to launch the ball
- Ball releases from a random point at the top of the pin grid
- Ball bounces through staggered pin rows (physics-based)
- Ball lands in one of 37 numbered slots at the bottom
- **Miss:** Game over, new round begins
- **Hit:** Player's number lights up, Stage 2 begins automatically

### Stage 2 — The Cascade
- 30 balls drop in rapid succession (one every ~200ms)
- Each ball independently bounces through the same pin grid
- Balls accumulate in the numbered slots at the bottom
- Count of balls landing in the player's winning number determines multiplier

### Payout Table
| Balls in slot | Multiplier | Approx. probability |
|---------------|------------|----------------------|
| 0 | 70x | Most likely |
| 1 | 15x | Common |
| 2 | 20x | Common |
| 3 | 30x | Uncommon |
| 4 | 50x | Rare |
| 5+ | 100x | Very rare |

### RTP
- Target: ~94–96% return to player (adjustable per licensee)
- Stage 1 hit probability: 1/37 (standard roulette)
- Stage 2 follows binomial distribution across 30 balls / 37 slots

---

## 3. Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Rendering | HTML5 Canvas | All game visuals drawn on canvas |
| Physics | Matter.js (CDN) | Ball and pin collision physics |
| Logic | Vanilla JavaScript | No frameworks, maximum compatibility |
| Styling | CSS3 | UI outside the canvas (bet table, buttons) |
| Packaging | Single HTML file | Easy to white-label and embed |

**Key constraint:** Must run as a single `index.html` file. No build tools, no npm, no backend. Licensees drop it into their platform.

---

## 4. File Structure

```
/pindrop
  index.html          ← Main game file (canvas + UI)
  game.js             ← Core game logic and state machine
  physics.js          ← Matter.js setup, pin grid, ball management
  betting.js          ← Bet table, stake management, payout calc
  renderer.js         ← Canvas drawing functions
  ui.js               ← HTML UI controls (buttons, displays)
  config.js           ← White-label config (colours, RTP, branding)
  assets/
    sounds/           ← Ball bounce, win, cascade SFX (optional)
  README.md           ← Integration guide for licensees
```

---

## 5. Visual Design

### Aesthetic
- Dark background (#0d0d1a — deep navy/black)
- Gold accent (#f0c040) for winning highlights and active elements
- Green felt texture suggestion for the betting table area
- Pin grid: metallic silver pins on dark background
- Ball: bright white with subtle glow trail during cascade
- Slot highlights: pulse animation on winning slot

### Layout (Desktop 1024×768 target)
```
┌─────────────────────────────────┐
│         [PINDROP LOGO]          │  ← Header / brand zone (white-label swap)
├─────────────────────────────────┤
│                                 │
│        PIN GRID + CANVAS        │  ← Main game area (~500px tall)
│    (ball drops, pins, slots)    │
│                                 │
├─────────────────────────────────┤
│     ROULETTE BET TABLE          │  ← Numbers 0–36, click to bet
├─────────────────────────────────┤
│  Stake: [£1][£2][£5][£10]  [DROP BALL]  │  ← Controls
│  Balance: £100   Last win: £0   │
└─────────────────────────────────┘
```

### Animations
- Ball: smooth physics movement, slight motion blur
- Cascade: balls queue and drop with slight random X offset
- Win: slot glows gold, multiplier number counts up
- Stage transition: brief flash + "STAGE 2" overlay text

---

## 6. Game State Machine

```
IDLE → BETTING → DROPPING (stage 1) → MISS → IDLE
                                     → HIT → CASCADE (stage 2) → PAYOUT → IDLE
```

States:
- `IDLE`: Awaiting bet placement
- `BETTING`: Number selected, awaiting Drop button
- `DROPPING`: Stage 1 ball in motion, no interaction
- `CASCADE`: Stage 2 balls dropping, no interaction
- `PAYOUT`: Show result, update balance, await next round

---

## 7. White-Label Config (`config.js`)

```javascript
const CONFIG = {
  branding: {
    gameName: "PinDrop",          // Swap for licensee
    logoUrl: "./assets/logo.png", // Swap for licensee
    primaryColour: "#f0c040",     // Swap for licensee brand colour
    backgroundColor: "#0d0d1a",
  },
  gameplay: {
    minStake: 0.20,
    maxStake: 100,
    stakeOptions: [1, 2, 5, 10],
    startingBalance: 100,
    stage2BallCount: 30,
    stage2BallInterval: 200,      // ms between cascade balls
  },
  rtp: {
    payoutTable: {
      0: 70, 1: 15, 2: 20,
      3: 30, 4: 50, 5: 100
    }
  }
};
```

---

## 8. Build Phases

### Phase 1 — Proof of Concept (Week 1–2)
- [ ] Canvas setup with Matter.js loaded
- [ ] Pin grid renders (5–8 staggered rows)
- [ ] Single ball drops with realistic physics
- [ ] Ball lands in numbered slot, slot number logged to console
- [ ] Basic number detection working

### Phase 2 — Core Game Loop (Week 3–4)
- [ ] Roulette bet table rendered in HTML below canvas
- [ ] Click to select number, highlight selected
- [ ] Drop button triggers Stage 1
- [ ] Hit/miss detection vs selected number
- [ ] Stage 2 cascade: 30 balls drop sequentially
- [ ] Ball count in winning slot calculated
- [ ] Multiplier and payout calculated, shown on screen

### Phase 3 — Polish (Week 5–6)
- [ ] Win animations (glow, count-up)
- [ ] Stage 2 transition overlay
- [ ] Balance tracking
- [ ] Stake selection buttons
- [ ] Sound effects (optional)
- [ ] Mobile responsive layout

### Phase 4 — White-Label Ready (Week 7–8)
- [ ] config.js fully drives all branding
- [ ] Logo swap works
- [ ] Colour theming works
- [ ] README for licensees written
- [ ] Demo hosted on itch.io or GitHub Pages
- [ ] Demo video recorded for sales outreach

---

## 9. Claude Code Session Prompts (Use In Order)

**Session 1 — Scaffold:**
> "Using the GAME_DESIGN.md in this folder, create the project file structure and a basic index.html that loads Matter.js from CDN and sets up a 800×600 canvas."

**Session 2 — Physics:**
> "Using GAME_DESIGN.md, add a staggered pin grid (7 rows, 10 pins per row) to the canvas using Matter.js static bodies. Add a ball that drops from a random X position at the top when the user presses spacebar. Make physics realistic — pins should deflect the ball naturally. Log which slot (0–36) the ball lands in."

**Session 3 — Game Loop:**
> "Using GAME_DESIGN.md, add the roulette bet table below the canvas as HTML. Allow the player to click a number to select it. Add a Drop button. Wire up hit/miss detection. If hit, trigger the Stage 2 cascade of 30 balls with 200ms intervals."

**Session 4 — Payout & UI:**
> "Using GAME_DESIGN.md, add the payout table logic from config.js. Count cascade balls in the winning slot and calculate the multiplier. Show the result on screen with a win animation. Add balance tracking and stake buttons."

**Session 5 — Polish:**
> "Using GAME_DESIGN.md, add the visual polish: dark background, gold accent colour, slot glow on win, Stage 2 transition overlay text, and make the layout responsive to mobile screens."

---

## 10. Sales Notes (For Your B2B Outreach)

**Target buyers:**
- Sweepstakes casino platforms (no gambling licence needed)
- Online casino game aggregators
- iGaming startups looking for differentiated content

**Pitch angle:**
- "Original bagatelle-style game, no equivalent online — gap in the market"
- "White-label ready — your brand in 10 minutes"
- "Provably fair RNG, configurable RTP"
- "Single HTML file — zero integration headache"

**Pricing model to explore:**
- One-time licence fee: £2,000–£5,000 per platform
- Revenue share: 15–25% of GGR (gross gaming revenue)
- Monthly SaaS: £500/month hosted + supported version
