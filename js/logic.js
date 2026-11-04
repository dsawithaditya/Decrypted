/* =========================================================
   logic.js: ALL decision rules for Mess Queue Manager.
   Pure functions only (no DOM), so they can be tested alone.
   Team Decrypted · SE-302A · Jain University Canteen Mess
   ========================================================= */
(function (root) {
  'use strict';

  const DEFAULT_SETTINGS = {
    alertThreshold: 45,        // early alert to staff (45%)
    standbyThreshold: 50,      // open standby counter (50%)
    crossAccessThreshold: 80,  // national students may use international counters (80%)
    closeThreshold: 40,        // hysteresis: close only below this (40%)
    crossCapThreshold: 75,     // smart overflow cap: pause routing to int counter at >=75%
    avgServeSeconds: 30,       // measured with a stopwatch
    refreshSeconds: 60,        // re-check interval (1–2 min)
    staffPin: '1234'
  };

  const DEFAULT_COUNTERS = {
    c1: { name: 'Counter 1', type: 'national', capacity: 20, queueCount: 4, open: true, soldOut: false },
    c2: { name: 'Counter 2', type: 'national', capacity: 20, queueCount: 5, open: true, soldOut: false },
    c3: { name: 'Counter 3', type: 'national', capacity: 20, queueCount: 3, open: true, soldOut: false },
    c4: { name: 'Counter 4', type: 'international', capacity: 15, queueCount: 1, open: true, soldOut: false },
    c5: { name: 'Counter 5', type: 'international', capacity: 15, queueCount: 2, open: true, soldOut: false },
    c6: { name: 'Standby 1', type: 'standby', capacity: 15, queueCount: 0, open: false, soldOut: false }
  };

  const clone = o => JSON.parse(JSON.stringify(o));

  function defaultData() {
    const now = new Date().toISOString();
    return {
      settings: clone(DEFAULT_SETTINGS),
      state: {
        crossAccess: false, standbyOpen: false, manualOverride: false,
        alertSent: false, mode: 'manual', lastAction: 'keep', zoneAvg: 30,
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
    if (pct < 50) return { key: 'green', label: 'Free' };
    if (pct <= 80) return { key: 'amber', label: 'Busy' };
    return { key: 'red', label: 'Very crowded' };
  }

  /* Rules use the average crowd of OPEN, non-sold-out national counters */
  function zoneAverage(counters) {
    const p = listCounters(counters)
      .filter(c => c.type === 'national' && c.open && !c.soldOut)
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

    Object.values(counters).forEach(c => { if (c.type === 'standby') c.open = next.standbyOpen; });

    return { state: next, counters, newAlerts: alerts, zoneAvg: zone };
  }

  /* Which counters may a student use? (Skips closed or sold-out counters) */
  function allowedFor(c, state, who = 'national') {
    if (!c.open || c.soldOut) return false;
    if (who === 'international') return c.type === 'international' || c.type === 'standby';
    if (c.type === 'national' || c.type === 'standby') return true;
    if (c.type === 'international') return !!state.crossAccess;
    return false;
  }

  /* 4.5 best counter = open + not sold out + allowed + lowest wait
     ENHANCED: Smart Overflow Cap (75%)
     When crossAccess is ON, National students are NOT routed to International
     counters that are already >= crossCapThreshold (75%), preserving capacity
     for International students unless all alternatives are also saturated. */
  function bestCounter(counters, state, settings, who = 'national') {
    const s = { ...DEFAULT_SETTINGS, ...settings };
    const capLimit = Number(s.crossCapThreshold) || 75;

    let options = listCounters(counters)
      .filter(c => allowedFor(c, state, who) && crowdPct(c.queueCount, c.capacity) !== null)
      .map(c => ({
        ...c,
        wait: waitMinutes(c.queueCount, s.avgServeSeconds),
        pct: crowdPct(c.queueCount, c.capacity)
      }));

    if (!options.length) return null;

    // Smart Overflow Cap for National students under Cross Access
    if (who === 'national' && state && state.crossAccess) {
      const nonCapped = options.filter(c => !(c.type === 'international' && c.pct >= capLimit));
      // If there are non-capped options available, use those to prevent international overload
      if (nonCapped.length > 0) {
        options = nonCapped;
      }
    }

    options.sort((a, b) => a.wait - b.wait || a.pct - b.pct);
    return options[0];
  }

  /* 4.6 Digital Cross-Access Express Pass Generator */
  function issueCrossAccessPass(counters, state, studentInfo = {}, settings = {}) {
    const s = { ...DEFAULT_SETTINGS, ...settings };
    const isAllowed = !!(state && (state.crossAccess || state.manualCrossAccess));
    if (!isAllowed) {
      return { allowed: false, reason: 'Cross-access is currently closed (national crowd <= 80%).' };
    }

    const intCounters = listCounters(counters)
      .filter(c => c.type === 'international' && c.open && !c.soldOut)
      .map(c => ({
        ...c,
        wait: waitMinutes(c.queueCount, s.avgServeSeconds),
        pct: crowdPct(c.queueCount, c.capacity)
      }));

    if (!intCounters.length) {
      return { allowed: false, reason: 'No international counters are currently open.' };
    }

    // Filter by under 75% cap if possible
    const available = intCounters.filter(c => c.pct < (s.crossCapThreshold || 75));
    const target = available.length > 0
      ? available.sort((a, b) => a.wait - b.wait)[0]
      : intCounters.sort((a, b) => a.wait - b.wait)[0];

    const randomCode = Math.floor(100 + Math.random() * 900);
    const now = new Date();
    const expiry = new Date(now.getTime() + 15 * 60000);

    return {
      allowed: true,
      passId: 'pass-' + Date.now(),
      tokenCode: `IC-${randomCode}`,
      counterId: target.id,
      counterName: target.name,
      studentName: studentInfo.name || 'Student',
      rollNumber: studentInfo.rollNumber || 'DEMO-USN',
      waitEstimateMin: Math.round(target.wait),
      issuedAt: now.toISOString(),
      expiresAt: expiry.toISOString(),
      status: 'active'
    };
  }

  /* 4.7 Direct-to-Room Delivery Priority Sorter */
  function sortDeliveries(deliveries = []) {
    const reasonRank = {
      medical: 1,      // Highest urgent priority
      quarantine: 2,
      injury: 3,
      exam: 4
    };
    const statusRank = {
      requested: 1,
      preparing: 2,
      out_for_delivery: 3,
      delivered: 4,
      cancelled: 5
    };

    return [...deliveries].sort((a, b) => {
      // Uncompleted before completed
      const stDiff = (statusRank[a.status] || 99) - (statusRank[b.status] || 99);
      if (stDiff !== 0) return stDiff;

      // Medical & high-priority reasons first
      const rA = reasonRank[a.reason] || 99;
      const rB = reasonRank[b.reason] || 99;
      if (rA !== rB) return rA - rB;

      // FIFO order (oldest requests first)
      const tA = new Date(a.created_at || a.createdAt || 0).getTime();
      const tB = new Date(b.created_at || b.createdAt || 0).getTime();
      return tA - tB;
    });
  }

  /* 4.8 Kitchen Early-Warning Sentiment Checker */
  function checkDishAlerts(menuItems = [], ratings = []) {
    const alerts = [];
    menuItems.forEach(item => {
      const itemRatings = ratings.filter(r => r.menu_item_id === item.id || r.menuItemId === item.id);
      if (!itemRatings.length) {
        if (item.avg_rating && Number(item.avg_rating) < 2.5 && (item.ratings_count || 0) >= 3) {
          alerts.push({
            dishId: item.id,
            dishName: item.name,
            level: 'red',
            reason: `Average rating dropped to ${Number(item.avg_rating).toFixed(1)}★ (< 2.5★ threshold)`
          });
        }
        return;
      }

      const totalStars = itemRatings.reduce((sum, r) => sum + Number(r.stars || 0), 0);
      const avg = totalStars / itemRatings.length;
      const coldCount = itemRatings.filter(r => (r.tags || []).includes('Cold')).length;
      const saltCount = itemRatings.filter(r => (r.tags || []).includes('Salt Issue')).length;
      const oilyCount = itemRatings.filter(r => (r.tags || []).includes('Too Oily')).length;

      if (avg < 2.5 && itemRatings.length >= 2) {
        alerts.push({
          dishId: item.id,
          dishName: item.name,
          level: 'red',
          reason: `Rating critical: ${avg.toFixed(1)}★ average across ${itemRatings.length} reviews`
        });
      } else if (coldCount + saltCount + oilyCount >= 3) {
        alerts.push({
          dishId: item.id,
          dishName: item.name,
          level: 'amber',
          reason: `Quality alert: ${coldCount} Cold, ${saltCount} Salt, ${oilyCount} Oily tags received`
        });
      }
    });
    return alerts;
  }

  /* 4.9 Zero Food Waste Attendance Calculation */
  function calculateAttendance(records = []) {
    let eating = 0;
    let skipping = 0;
    records.forEach(r => {
      if (r.status === 'eating') eating++;
      if (r.status === 'skipping') skipping++;
    });
    const total = eating + skipping;
    const wasteReductionEst = total > 0 ? Math.round((skipping / total) * 100 * 0.75) : 0;
    return {
      eating,
      skipping,
      total,
      wasteReductionEst
    };
  }

  /* Built-in T1-T14 test runner for tests.html, index.html, and automated audits */
  function runTests() {
    const S = DEFAULT_SETTINGS;
    const off = { crossAccess: false, standbyOpen: false };
    const fmt = d => `action=${d.action}, standby=${d.standbyOpen ? 'ON' : 'OFF'}, cross=${d.crossAccess ? 'ON' : 'OFF'}`;

    const suite = [
      // Core T1–T9 (Preserved)
      ['T1', 'Zone 30%', 'Normal, no alert', () => {
        const d = decide(30, off, S);
        return [d.action === 'close' && !d.standbyOpen, fmt(d)];
      }],
      ['T2', 'Zone 46%', 'Early alert', () => {
        const d = decide(46, off, S);
        return [d.action === 'alert' && !d.standbyOpen, fmt(d)];
      }],
      ['T3', 'Zone 55%', 'Standby opens', () => {
        const d = decide(55, off, S);
        return [d.standbyOpen && !d.crossAccess, fmt(d)];
      }],
      ['T4', 'Zone 85%', 'Cross access ON', () => {
        const d = decide(85, off, S);
        return [d.crossAccess && d.standbyOpen, fmt(d)];
      }],
      ['T5', '85% → 45%', 'Stays open (hysteresis)', () => {
        const a = decide(85, off, S);
        const d = decide(45, a, S);
        return [d.standbyOpen && d.crossAccess, fmt(d)];
      }],
      ['T6', 'Drops to 38%', 'Standby + cross close', () => {
        const d = decide(38, { crossAccess: true, standbyOpen: true }, S);
        return [!d.standbyOpen && !d.crossAccess, fmt(d)];
      }],
      ['T7', 'Queue 0', '0%, 0 min', () => {
        const p = crowdPct(0, 20), w = waitMinutes(0, 30);
        return [p === 0 && w === 0, `${p}%, ${formatWait(w)}`];
      }],
      ['T8', 'All counters > 80%', 'Least crowded still shown', () => {
        const c = {
          a: { id: 'a', name: 'A', type: 'national', capacity: 20, queueCount: 19, open: true },
          b: { id: 'b', name: 'B', type: 'national', capacity: 20, queueCount: 17, open: true },
          c: { id: 'c', name: 'C', type: 'international', capacity: 15, queueCount: 14, open: true }
        };
        const b = bestCounter(c, { crossAccess: true }, S);
        return [b && b.name === 'B', b ? b.name : 'none'];
      }],
      ['T9', 'Capacity 0', 'N/A, no error', () => {
        const p = crowdPct(5, 0);
        return [p === null && colorTag(p).label === 'N/A', colorTag(p).label];
      }],

      // Upgrade Extensions T10–T14
      ['T10', 'Smart Cross Overflow Cap', 'Int counter at >=75% capped for National', () => {
        const c = {
          nat1: { id: 'nat1', name: 'Nat 1', type: 'national', capacity: 20, queueCount: 18, open: true }, // 90%
          int1: { id: 'int1', name: 'Int 1', type: 'international', capacity: 15, queueCount: 12, open: true }, // 80% (>=75% cap!)
          int2: { id: 'int2', name: 'Int 2', type: 'international', capacity: 15, queueCount: 4, open: true }   // 26% (<75% available)
        };
        const b = bestCounter(c, { crossAccess: true }, S, 'national');
        return [b && b.id === 'int2', b ? `${b.name} (${Math.round(b.pct)}%)` : 'none'];
      }],
      ['T11', 'Cross-Access Token Pass', 'Generates 15-min token to available Int counter', () => {
        const c = {
          c4: { id: 'c4', name: 'Counter 4', type: 'international', capacity: 15, queueCount: 2, open: true }
        };
        const pass = issueCrossAccessPass(c, { crossAccess: true }, { name: 'Aditya', rollNumber: '21BCE1042' }, S);
        const ok = pass.allowed && pass.counterId === 'c4' && pass.tokenCode.startsWith('IC-');
        return [ok, pass.allowed ? `${pass.tokenCode} at ${pass.counterName}` : pass.reason];
      }],
      ['T12', 'Delivery Priority Sorter', 'Medical request prioritized before Exam', () => {
        const reqs = [
          { id: '1', reason: 'exam', status: 'requested', created_at: '2026-11-04T12:00:00Z' },
          { id: '2', reason: 'medical', status: 'requested', created_at: '2026-11-04T12:05:00Z' }
        ];
        const sorted = sortDeliveries(reqs);
        const ok = sorted[0].id === '2'; // Medical comes first
        return [ok, `First: ${sorted[0].reason} (#${sorted[0].id})`];
      }],
      ['T13', 'Kitchen Early Warning', 'Triggers alert for dish with <2.5★ or >=3 issues', () => {
        const menu = [{ id: 'm1', name: 'Dal Tadka' }];
        const ratings = [
          { menu_item_id: 'm1', stars: 2, tags: ['Cold'] },
          { menu_item_id: 'm1', stars: 2, tags: ['Cold', 'Salt Issue'] }
        ];
        const alerts = checkDishAlerts(menu, ratings);
        const ok = alerts.length > 0 && alerts[0].dishId === 'm1';
        return [ok, alerts.length ? alerts[0].reason : 'No alert'];
      }],
      ['T14', 'Zero-Waste Attendance', 'Calculates accurate headcount and waste reduction', () => {
        const records = [
          { status: 'eating' }, { status: 'eating' }, { status: 'eating' },
          { status: 'skipping' }
        ];
        const att = calculateAttendance(records);
        const ok = att.eating === 3 && att.skipping === 1 && att.wasteReductionEst > 0;
        return [ok, `${att.eating} eating, ${att.skipping} skipping (~${att.wasteReductionEst}% saved)`];
      }]
    ];

    return suite.map(([id, input, exp, fn]) => {
      let ok = false, got = '';
      try { [ok, got] = fn(); } catch (e) { got = 'Error: ' + e.message; }
      return { id, input, exp, got, ok };
    });
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
    return isNaN(t) ? 0 : Math.max(0, (Date.now() - t) / 60000);
  }
  function timeAgo(iso) {
    const m = minutesSince(iso);
    if (!isFinite(m)) return 'just now';
    if (m < 1) return 'just now';
    return Math.floor(m) + ' min ago';
  }

  const MQM = {
    DEFAULT_SETTINGS, DEFAULT_COUNTERS, defaultData, listCounters,
    crowdPct, waitMinutes, colorTag, zoneAverage, decide, evaluate,
    allowedFor, bestCounter, issueCrossAccessPass, sortDeliveries,
    checkDishAlerts, calculateAttendance, runTests,
    formatWait, bannerWait, timeLabel, minutesSince, timeAgo
  };

  root.MQM = MQM;
  if (typeof module !== 'undefined' && module.exports) module.exports = MQM;
})(typeof window !== 'undefined' ? window : globalThis);
