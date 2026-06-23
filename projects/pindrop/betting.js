// Betting: stake, balance, number selection, payout calculation
const Betting = (() => {
  let balance        = CONFIG.gameplay.startingBalance;
  let stake          = CONFIG.gameplay.stakeOptions[0];
  let selectedNumber = null;
  let lastWin        = 0;

  return {
    getBalance()        { return balance; },
    getStake()          { return stake; },
    getSelectedNumber() { return selectedNumber; },
    getLastWin()        { return lastWin; },

    selectNumber(n) { selectedNumber = n; },
    setStake(s)     { stake = s; },

    placeBet() {
      if (selectedNumber === null || balance < stake) return false;
      balance = +(balance - stake).toFixed(2);
      return true;
    },

    calculatePayout(ballCount) {
      const table      = CONFIG.rtp.payoutTable;
      const key        = Math.min(ballCount, 5);
      const multiplier = table[key];
      const win        = +(stake * multiplier).toFixed(2);
      lastWin  = win;
      balance  = +(balance + win).toFixed(2);
      return { multiplier, win };
    },
  };
})();
