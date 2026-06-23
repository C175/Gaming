// UI: bet table, stake buttons, display updates
const UI = (() => {
  const RED = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

  function buildBetTable() {
    const container = document.getElementById('bet-table');

    // Zero — green, spans full height on left
    const zero = document.createElement('button');
    zero.className   = 'bet-num green';
    zero.textContent = '0';
    zero.dataset.num = '0';
    container.appendChild(zero);

    // Numbers 1–36 in standard roulette column layout
    // Top row: 3,6,9…36  |  Mid: 2,5,8…35  |  Bot: 1,4,7…34
    const grid = document.createElement('div');
    grid.id = 'bet-grid';
    for (let row = 3; row >= 1; row--) {
      for (let col = 0; col < 12; col++) {
        const num  = col * 3 + row;
        const btn  = document.createElement('button');
        btn.className   = `bet-num ${RED.has(num) ? 'red' : 'black'}`;
        btn.textContent = num;
        btn.dataset.num = String(num);
        grid.appendChild(btn);
      }
    }
    container.appendChild(grid);

    container.addEventListener('click', e => {
      const btn = e.target.closest('[data-num]');
      if (!btn || btn.disabled) return;
      document.querySelectorAll('.bet-num.selected').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      Game.onSelectNumber(parseInt(btn.dataset.num, 10));
    });
  }

  function buildStakeButtons() {
    const wrap = document.getElementById('stake-btns');
    CONFIG.gameplay.stakeOptions.forEach((s, i) => {
      const btn = document.createElement('button');
      btn.className   = 'stake-btn' + (i === 0 ? ' active' : '');
      btn.textContent = `£${s}`;
      btn.dataset.stake = String(s);
      wrap.appendChild(btn);
    });
    wrap.addEventListener('click', e => {
      const btn = e.target.closest('.stake-btn');
      if (!btn || btn.disabled) return;
      wrap.querySelectorAll('.stake-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      Game.onSetStake(parseFloat(btn.dataset.stake));
    });
  }

  function setInteractive(on) {
    document.querySelectorAll('.bet-num, .stake-btn').forEach(b => { b.disabled = !on; });
  }

  function setDropEnabled(on) {
    document.getElementById('drop-btn').disabled = !on;
  }

  function updateBalance() {
    document.getElementById('balance-val').textContent = Betting.getBalance().toFixed(2);
    document.getElementById('lastwin-val').textContent = Betting.getLastWin().toFixed(2);
  }

  function showStatus(msg) {
    document.getElementById('status-msg').textContent = msg;
  }

  return { buildBetTable, buildStakeButtons, setInteractive, setDropEnabled, updateBalance, showStatus };
})();
