# PinDrop — White-Label Bagatelle Game

A two-stage bagatelle casino game. A ball drops through a pin grid; hit your number to trigger a 30-ball cascade payout.

## Quick Start

Open `index.html` in any modern browser. No build step, no server required.

## How to Play

1. Click a number on the roulette table to place your bet
2. Select your stake (£1 / £2 / £5 / £10)
3. Click **DROP BALL** — the ball bounces through the pin grid
4. **Miss:** ball lands elsewhere — new round
5. **Hit:** Stage 2 begins — 30 balls cascade through the grid
6. Payout = stake × multiplier based on how many balls land in your slot

| Balls in your slot | Multiplier |
|--------------------|------------|
| 0                  | 70×        |
| 1                  | 15×        |
| 2                  | 20×        |
| 3                  | 30×        |
| 4                  | 50×        |
| 5+                 | 100×       |

## White-Label Integration

Edit **`config.js`** to customise branding, stakes, and RTP:

```js
const CONFIG = {
  branding: {
    gameName:      'YourBrand',
    primaryColour: '#ff6600',      // your brand colour
    backgroundColor: '#0a0a14',
  },
  gameplay: {
    stakeOptions:    [0.5, 1, 2, 5],
    startingBalance: 500,
    stage2BallCount: 30,
    stage2BallInterval: 200,       // ms between cascade balls
  },
  rtp: {
    payoutTable: { 0: 70, 1: 15, 2: 20, 3: 30, 4: 50, 5: 100 },
  },
  // ...
};
```

## Embedding

The game runs as static files. Serve the `/pindrop` folder from any web server or embed the canvas in an iframe:

```html
<iframe src="https://yourdomain.com/pindrop/" width="800" height="680"
  frameborder="0" allowfullscreen></iframe>
```

## Tech Stack

- **Physics:** [Matter.js 0.19](https://brm.io/matter-js/) via CDN
- **Rendering:** HTML5 Canvas (custom renderer, no Matter.js render)
- **Logic:** Vanilla JS — no framework, no npm, no build tools
- **Packaging:** Six JS files + one HTML file

## File Structure

```
pindrop/
  index.html    — page shell, CSS, script tags
  config.js     — white-label settings (edit this)
  physics.js    — Matter.js engine, pins, walls, ball lifecycle
  betting.js    — stake, balance, payout calculation
  renderer.js   — canvas draw calls
  ui.js         — bet table HTML, stake buttons, display updates
  game.js       — state machine & game loop
  assets/
    sounds/     — (optional) SFX drops here
```

## Browser Support

Chrome 80+, Firefox 75+, Safari 14+, Edge 80+.
