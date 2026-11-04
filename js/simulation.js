/* =========================================================
   simulation.js: fake lunch rush for the demo
   11:30 slow → 12:30 peak → 2:00 slow (150 simulated minutes)
   ========================================================= */
(function () {
  'use strict';

  const START_MIN = 11 * 60 + 30;
  const LENGTH = 150;

  // Rush curve: about 19% at 11:30, about 95% at 12:30, about 15% at 2:00
  function load(t) { return 0.15 + 0.8 * Math.exp(-Math.pow((t - 60) / 35, 2)); }

  function clockLabel(t) {
    const m = START_MIN + Math.floor(t);
    const h = Math.floor(m / 60), mm = m % 60;
    const h12 = ((h + 11) % 12) + 1;
    return `${h12}:${String(mm).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
  }

  function generate(counters, state, t) {
    const L = load(t);
    const out = JSON.parse(JSON.stringify(counters));
    Object.values(out).forEach(c => {
      let base = 0;
      if (c.type === 'national') {
        // opening standby / cross access takes some load off national counters
        base = L * (state.standbyOpen ? 0.96 : 1) * (state.crossAccess ? 0.95 : 1);
      } else if (c.type === 'international') {
        base = 0.12 + L * 0.2 + (state.crossAccess ? 0.35 : 0);
      } else if (c.type === 'standby') {
        base = state.standbyOpen ? L * 0.6 : 0;
      }
      const noise = 1 + (Math.random() - 0.5) * 0.1;
      const max = Math.round((c.capacity || 0) * 1.5);
      c.queueCount = Math.max(0, Math.min(max, Math.round(base * (c.capacity || 0) * noise)));
    });
    return out;
  }

  let timer = null, t = 0;

  const Sim = {
    LENGTH, load, clockLabel, generate,
    get running() { return !!timer; },
    get time() { return t; },
    /* rushSeconds = how many real seconds one full lunch rush takes */
    start(onTick, rushSeconds = 120) {
      this.stop();
      const stepSec = 0.5;
      const perTick = LENGTH / (rushSeconds / stepSec);
      onTick(t);
      timer = setInterval(() => {
        t += perTick;
        if (t > LENGTH) t = 0;
        onTick(t);
      }, stepSec * 1000);
    },
    stop() { clearInterval(timer); timer = null; },
    reset() { t = 0; }
  };

  window.Sim = Sim;
})();
