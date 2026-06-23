const CONFIG = {
  branding: {
    gameName:        'PinDrop',
    primaryColour:   '#f0c040',
    backgroundColor: '#0d0d1a',
  },
  gameplay: {
    stakeOptions:       [1, 2, 5, 10],
    startingBalance:    100,
    stage2BallCount:    50,
    stage2BallInterval: 200, // ms between cascade balls
  },
  rtp: {
    payoutTable: { 0: 70, 1: 15, 2: 20, 3: 30, 4: 50, 5: 100 },
  },
  physics: {
    pinRows:      8,
    pinSpacingX:  70,
    pinSpacingY:  46,
    pinRadius:    5,
    ballRadius:   7,
  },
  canvas: {
    width:      800,
    height:     460,
    slotTop:    370,
  },
};
