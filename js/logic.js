/* =========================================================
   logic.js: ALL decision rules for Mess Queue Manager.
   Pure functions only (no DOM), so they can be tested alone.
   ========================================================= */
(function (root) {
  'use strict';

  const DEFAULT_SETTINGS = {
    alertThreshold: 45,        // early alert to staff
    standbyThreshold: 50,      // open standby counter
    crossAccessThreshold: 80,  // national students may use international counters
    closeThreshold: 40,        // hysteresis: close only below this
    avgServeSeconds: 30,       // measured with a stopwatch
    refreshSeconds: 60,        // re-check interval (1–2 min)
    staffPin: '1234'
  };

  const DEFAULT_COUNTERS = {
    c1: { name: 'Counter 1', type: 'national',      capacity: 20, queueCount: 4, open: true },
    c2: { name: 'Counter 2', type: 'national',      capacity: 20, queueCount: 5, open: true },
    c3: { name: 'Counter 3', type: 'national',      capacity: 20, queueCount: 3, open: true },
    c4: { name: 'Counter 4', type: 'international', capacity: 15, queueCount: 1, open: true },
    c5: { name: 'Counter 5', type: 'international', capacity: 15, queueCount: 2, open: true },
    c6: { name: 'Standby 1', type: 'standby',       capacity: 15, queueCount: 0, open: false }
  };

  const clone = o => JSON.parse(JSON.stringify(o));

  function defaultData() {
    const now = new Date().toISOString();
    return {
      settings: clone(DEFAULT_SETTINGS),
      state: {
        crossAccess: false, standbyOpen: false, manualOverride: false,
        alertSent: false, mode: 'manual', lastAction: 'keep', zoneAvg: null,
        lastCountUpdate: now, lastUpdated: now
      },
      counters: clone(DEFAULT_COUNTERS),
      alerts: []
    };
  }

  function listCounters(counters) {
    return Object.keys(counters || {})
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map(id => ({ id, ...counters[id] }));
  }

  /* 4.1 crowd % = people / capacity × 100  (null if capacity is 0 → "N/A") */
  function crowdPct(queue, capacity) {
    const cap = Number(capacity);
    if (!cap || cap <= 0) return null;
    return (Math.max(0, Number(queue) || 0) / cap) * 100;
  }

  /* 4.2 wait (min) = people × avg serving seconds / 60 */
  function waitMinutes(queue, avgServeSeconds) {
    return (Math.max(0, Number(queue) || 0) * (Number(avgServeSeconds) || 0)) / 60;
  }

  /* 4.3 colour tag */
  function colorTag(pct) {
    if (pct === null || pct === undefined || isNaN(pct)) return { key: 'na', label: 'N/A' };
    if (pct < 50)  return { key: 'green', label: 'Free' };
    if (pct <= 80) return { key: 'amber', label: 'Busy' };
    return { key: 'red', label: 'Very crowded' };
  }

  /* Rules use the average crowd of OPEN national counters */
  function zoneAverage(counters) {
    const p = listCounters(counters)
      .filter(c => c.type === 'national' && c.open)
      .map(c => crowdPct(c.queueCount, c.capacity))
      .filter(v => v !== null);
    if (!p.length) return null;
    return p.reduce((a, b) => a + b, 0) / p.length;
  }

  /* 4.4 threshold rules with hysteresis (same order as the pseudocode) */
  function decide(zone, prev, settings) {
    const s = { ...DEFAULT_SETTINGS, ...settings };
    let crossAccess = !!prev.crossAccess;
    let standbyOpen = !!prev.standbyOpen;
    let action = 'keep';

    if (zone === null) return { crossAccess, standbyOpen, action: 'no-data' };

    if (zone > s.crossAccessThreshold) {
      crossAccess = true; standbyOpen = true; action = 'cross';
    } else if (zone >= s.standbyThreshold) {
      standbyOpen = true; action = 'standby';
    } else if (zone >= s.alertThreshold) {
      action = 'alert';
    } else if (zone < s.closeThreshold) {
      crossAccess = false; standbyOpen = false; action = 'close';
    } // 40–45%: keep current state (hysteresis)

    return { crossAccess, standbyOpen, action };
  }

  /* One full cycle: compute zone, apply rules, create staff alerts */
  function evaluate(data, now = new Date()) {
    const s = { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
    const prev = { ...(data.state || {}) };
    const counters = clone(data.counters || {});
    const zone = zoneAverage(counters);
    const d = decide(zone, prev, s);

    const next = { ...prev, crossAccess: d.crossAccess, lastAction: d.action, zoneAvg: zone };
    // Manual override: staff control the standby counter themselves
    next.standbyOpen = prev.manualOverride ? !!prev.standbyOpen : d.standbyOpen;

    const z = zone === null ? 'N/A' : Math.round(zone) + '%';
    const time = timeLabel(now);
    const alerts = [];

    if (d.action === 'alert' && !next.standbyOpen && !prev.alertSent) {
      alerts.push({ level: 'amber', message: `Crowd at ${z}. Prepare standby counter (2 min).`, time });
      next.alertSent = true;
    }
    if (next.standbyOpen && !prev.standbyOpen) {
      alerts.push({ level: 'blue', message: `Crowd at ${z}. Standby counter is now OPEN.`, time });
    }
    if (next.crossAccess && !prev.crossAccess) {
      alerts.push({ level: 'red', message: `Crowd at ${z}. Cross-counter access is ON.`, time });
    }
    if ((prev.standbyOpen && !next.standbyOpen) || (prev.crossAccess && !next.crossAccess)) {
      alerts.push({ level: 'green', message: `Crowd at ${z} (below ${s.closeThreshold}%). Standby closed, normal routing resumed.`, time });
    }
    if (d.action === 'close') next.alertSent = false;

    // Standby counters follow the standby state
    Object.values(counters).forEach(c => { if (c.type === 'standby') c.open = next.standbyOpen; });

    return { state: next, counters, newAlerts: alerts, zoneAvg: zone };
  }

  /* Which counters may a student use? */
  function allowedFor(c, state, who = 'national') {
    if (!c.open) return false;
    if (who === 'international') return c.type === 'international' || c.type === 'standby';
    if (c.type === 'national' || c.type === 'standby') return true;
    if (c.type === 'international') return !!state.crossAccess;
    return false;
  }

  /* 4.5 best counter = open + allowed + lowest wait */
  function bestCounter(counters, state, settings, who = 'national') {
    const s = { ...DEFAULT_SETTINGS, ...settings };
    const options = listCounters(counters)
      .filter(c => allowedFor(c, state, who) && crowdPct(c.queueCount, c.capacity) !== null)
      .map(c => ({ ...c, wait: waitMinutes(c.queueCount, s.avgServeSeconds), pct: crowdPct(c.queueCount, c.capacity) }));
    if (!options.length) return null;
    options.sort((a, b) => a.wait - b.wait || a.pct - b.pct);
    return options[0];
  }

  /* ---------- formatting helpers ---------- */
  function formatWait(min) {
    if (min === null || min === undefined || isNaN(min)) return 'N/A';
    if (min <= 0) return '0 min';
    if (min < 1) return 'under 1 min';
    return Math.round(min) + ' min';
  }
  function bannerWait(min) {
    if (min <= 0) return 'No wait right now';
    if (min < 1) return 'Less than 1 min wait';
    return `About ${Math.round(min)} min wait`;
  }
  function timeLabel(d = new Date()) {
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  }
  function minutesSince(iso) {
    const t = new Date(iso).getTime();
    return isNaN(t) ? Infinity : (Date.now() - t) / 60000;
  }
  function timeAgo(iso) {
    const m = minutesSince(iso);
    if (!isFinite(m)) return 'never';
    if (m < 1) return 'just now';
    return Math.floor(m) + ' min ago';
  }

  const MQM = {
    DEFAULT_SETTINGS, DEFAULT_COUNTERS, defaultData, listCounters,
    crowdPct, waitMinutes, colorTag, zoneAverage, decide, evaluate,
    allowedFor, bestCounter, formatWait, bannerWait, timeLabel, minutesSince, timeAgo
  };
  root.MQM = MQM;
  if (typeof module !== 'undefined' && module.exports) module.exports = MQM;
})(typeof window !== 'undefined' ? window : globalThis);
