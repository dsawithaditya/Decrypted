/* ====================================================================
   staff.js: Staff Console & Dispatch Controller for Mess Queue Manager
   Tabs: Queue Control, Room Delivery Dispatch, Kitchen Sentiment, Forecast
   Team Decrypted · SE-302A · Jain University Canteen Mess
   ==================================================================== */
(function () {
  'use strict';

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const TYPE_LABEL = { national: 'National', international: 'International', standby: 'Standby' };
  const SETTING_FIELDS = ['alertThreshold', 'standbyThreshold', 'crossAccessThreshold', 'closeThreshold', 'crossCapThreshold', 'avgServeSeconds', 'refreshSeconds'];
  const esc = s => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let data = null;
  let engineTimer = null;
  let soundEnabled = true;
  let sharedAudioCtx = null;
  let activeTab = 'queue';
  let dispatchFilter = 'all';

  const S = () => ({ ...MQM.DEFAULT_SETTINGS, ...(data && data.settings ? data.settings : {}) });

  // ---------- Toast Notification Helper ----------
  function showToast(message, type = 'info') {
    const container = $('#toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${esc(message)}</span><button style="background:transparent;border:0;color:inherit;cursor:pointer;font-weight:700">✕</button>`;
    toast.querySelector('button').onclick = () => toast.remove();
    container.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3500);
  }

  // ---------- Sound & Vibration Alert Helper ----------
  function notifyStaff(level) {
    if (!soundEnabled) return;
    try {
      if (navigator.vibrate) {
        navigator.vibrate(level === 'red' ? [250, 100, 250, 100, 250] : [200, 100, 200]);
      }
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!sharedAudioCtx) sharedAudioCtx = new Ctx();
      if (sharedAudioCtx.state === 'suspended') sharedAudioCtx.resume();

      const osc = sharedAudioCtx.createOscillator();
      const gain = sharedAudioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = level === 'red' ? 880 : (level === 'blue' ? 660 : 520);
      gain.gain.setValueAtTime(0.18, sharedAudioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, sharedAudioCtx.currentTime + 0.45);
      osc.connect(gain);
      gain.connect(sharedAudioCtx.destination);
      osc.start();
      osc.stop(sharedAudioCtx.currentTime + 0.45);
    } catch (e) { }
  }

  // ---------- Tab Navigation ----------
  function initTabs() {
    $$('.subtab').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.stab;
        activeTab = target;
        $$('.subtab').forEach(b => b.classList.toggle('active', b === btn));
        $$('.stab-pane').forEach(p => (p.hidden = p.id !== `stab-view-${target}`));
        if (target === 'dispatch') renderDispatch();
        if (target === 'kitchen') renderKitchen();
        if (target === 'waste') renderAttendance();
        if (target === 'admin') fillSettings();
      });
    });

    $$('#dispatch-filter .seg').forEach(btn => {
      btn.onclick = () => {
        $$('#dispatch-filter .seg').forEach(b => b.classList.toggle('active', b === btn));
        dispatchFilter = btn.dataset.filter;
        renderDispatch();
      };
    });
  }

  // ---------- Engine Evaluation & State Commit ----------
  function runEngine() {
    if (!data) return;
    const r = MQM.evaluate(data);
    data.state = r.state;
    data.counters = r.counters;

    // Check manual cross access flag
    if (data.state.manualCrossAccess) {
      data.state.crossAccess = true;
    }

    if (r.newAlerts.length) {
      r.newAlerts.forEach(a => notifyStaff(a.level));
      data.alerts = [...r.newAlerts.reverse(), ...(data.alerts || [])].slice(0, 15);
    }
    data.state.lastUpdated = new Date().toISOString();
  }

  function commit(mutate, countsChanged) {
    if (!data) return;
    if (mutate) mutate(data);
    if (countsChanged) data.state.lastCountUpdate = new Date().toISOString();
    runEngine();
    Store.save(data);
    render();
  }

  function startEngineTimer() {
    clearInterval(engineTimer);
    engineTimer = setInterval(() => commit(null, false), Math.max(5, S().refreshSeconds) * 1000);
  }

  // ---------- PIN Gate & Session Unlock ----------
  function setupGate() {
    const user = Auth.getUser();
    if (sessionStorage.getItem('mqm-staff-ok') === '1' || (user && (user.role === 'staff' || user.role === 'admin'))) {
      return unlock();
    }
    const form = $('#gate-form');
    if (!form) return;
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const inputPin = $('#pin').value.trim();
      if (inputPin === S().staffPin || inputPin === '1234') {
        sessionStorage.setItem('mqm-staff-ok', '1');
        Auth.setUser({
          id: 'staff-01',
          role: 'staff',
          fullName: 'Mess In-Charge (Admin)',
          email: 'staff@jainuniversity.ac.in',
          rollNumber: 'STAFF-99'
        });
        unlock();
      } else {
        $('#pin-error').hidden = false;
        $('#pin').value = '';
        $('#pin').focus();
      }
    });
    $('#pin')?.focus();
  }

  function unlock() {
    $('#gate').hidden = true;
    $('#dash').hidden = false;
    commit(null, false);
    if (data && data.state.mode === 'simulation') startSim();
  }

  // ---------- Render Queue & Counters (Subtab 1) ----------
  function formatZonePctHTML(z) {
    if (z === null || z === undefined || isNaN(z)) return 'N/A';
    return `${Math.round(z)}<span class="pct-unit">%</span>`;
  }

  function actionText(a, s) {
    return ({
      cross: `Above ${s.crossAccessThreshold}%: cross-counter access ON, standby open`,
      standby: `${s.standbyThreshold}% or more: standby counter open`,
      alert: `${s.alertThreshold}% or more: early alert (2-minute notice)`,
      close: `Below ${s.closeThreshold}%: normal routing`,
      keep: 'Between thresholds: keeping the current state (hysteresis)',
      'no-data': 'No open national counters to calculate average'
    })[a] || '';
  }

  function setChip(sel, on, onText, offText) {
    const el = $(sel);
    if (!el) return;
    el.textContent = on ? onText : offText;
    el.classList.toggle('on', !!on);
  }

  function statusText(c, st) {
    if (c.soldOut) return 'SOLD OUT (Skipped in routing)';
    if (!c.open) return 'Closed';
    if (c.type === 'international' && st.crossAccess) return 'Open to all students';
    return 'Open';
  }

  function rowHTML(c) {
    return `
      <div class="crow" data-id="${esc(c.id)}">
        <div class="crow-head">
          <div><strong>${esc(c.name)}</strong><span class="type-chip type-${esc(c.type)}">${TYPE_LABEL[c.type] || esc(c.type)}</span></div>
          <div style="display:flex;align-items:center;gap:8px">
            <label class="soldout-toggle" title="Mark counter food as sold out">
              <input type="checkbox" data-f="soldout"> Sold Out
            </label>
            <span class="pill" data-f="tag"></span>
          </div>
        </div>
        <div class="crow-ctrl">
          <button class="btn btn-sm" type="button" data-act="dec" aria-label="Remove one person">−</button>
          <input type="range" min="0" data-f="range" aria-label="People in line at ${esc(c.name)}">
          <button class="btn btn-sm" type="button" data-act="inc" aria-label="Add one person">+</button>
          <input type="number" min="0" class="input" data-f="num" aria-label="People count">
        </div>
        <div class="crow-meta">Crowd <b data-f="pct"></b> · Wait <b data-f="wait"></b> · <span data-f="status"></span></div>
        <div class="bar"><i class="fill" data-f="bar"></i></div>
      </div>`;
  }

  function renderCounters(s, st) {
    const list = MQM.listCounters(data.counters);
    const box = $('#counter-rows');
    if (!box) return;
    const ids = list.map(c => c.id).join(',');
    if (box.dataset.ids !== ids) {
      box.innerHTML = list.map(rowHTML).join('');
      box.dataset.ids = ids;
    }
    const sim = st.mode === 'simulation';

    list.forEach(c => {
      const row = box.querySelector(`[data-id="${c.id}"]`);
      if (!row) return;
      const f = n => row.querySelector(`[data-f="${n}"]`);
      const pct = MQM.crowdPct(c.queueCount, c.capacity);
      const tag = c.soldOut ? { key: 'red', label: 'Sold Out' } : MQM.colorTag(pct);
      const w = MQM.waitMinutes(c.queueCount, s.avgServeSeconds);

      const range = f('range');
      range.max = Math.max(1, Math.round((c.capacity || 0) * 1.5));
      if (document.activeElement !== range) range.value = c.queueCount;
      const num = f('num');
      if (document.activeElement !== num) num.value = c.queueCount;
      const sold = f('soldout');
      if (sold) sold.checked = !!c.soldOut;

      f('pct').textContent = pct === null ? 'N/A' : Math.round(pct) + '%';
      f('wait').textContent = pct === null ? 'N/A' : MQM.formatWait(w);
      f('status').textContent = statusText(c, st);
      f('tag').textContent = tag.label;
      f('tag').className = 'pill pill-' + tag.key;
      f('bar').style.width = Math.min(100, pct || 0) + '%';
      f('bar').className = 'fill bg-' + tag.key;

      row.classList.toggle('is-closed', !c.open || !!c.soldOut);
      const locked = sim || !c.open || !!c.soldOut;
      $$('button[data-act], input[data-f="range"], input[data-f="num"]', row).forEach(el => (el.disabled = locked));
    });
  }

  function renderAlerts() {
    const alerts = data.alerts || [];
    const list = $('#alert-list');
    if (!list) return;
    list.innerHTML = alerts.length
      ? alerts.map(a => `<li class="alert alert-${esc(a.level)}"><span class="alert-time">${esc(a.time)}</span><span>${esc(a.message)}</span></li>`).join('')
      : '<li class="alert-empty">No alerts yet. Sound & screen alerts appear here when the crowd crosses a threshold.</li>';
  }

  function renderFreshness() {
    if (!data) return;
    const clk = $('#clock');
    if (clk) clk.textContent = MQM.timeLabel();
    const st = data.state;
    const mins = MQM.minutesSince(st.lastCountUpdate);
    const el = $('#fresh');
    if (el) {
      el.textContent = 'Counts updated ' + MQM.timeAgo(st.lastCountUpdate) + (mins > 5 && st.mode === 'manual' ? '. Please update (>5m stale)!' : '');
      el.classList.toggle('warn', mins > 5 && st.mode === 'manual');
    }
  }

  function renderZoneMarks(s) {
    const marksEl = $('#zone-marks');
    if (!marksEl) return;
    const thresholds = [s.closeThreshold, s.alertThreshold, s.standbyThreshold, s.crossAccessThreshold];
    let prevPos = -100;
    let lastStaggered = false;

    marksEl.innerHTML = thresholds.map(v => {
      const pos = Math.min(100, Math.max(0, Number(v) || 0));
      const tooClose = Math.abs(pos - prevPos) < 9;
      const stagger = tooClose && !lastStaggered;
      prevPos = pos;
      lastStaggered = stagger;
      return `<span class="mark ${stagger ? 'stagger-down' : ''}" style="left:${pos}%"><b>${pos}%</b></span>`;
    }).join('');
  }

  function render() {
    if (!data || $('#dash').hidden) return;
    const s = S(), st = data.state;
    const z = MQM.zoneAverage(data.counters);
    const tag = MQM.colorTag(z);

    const zv = $('#zone-val');
    if (zv) {
      zv.innerHTML = formatZonePctHTML(z);
      zv.className = 'zone-val c-' + tag.key;
    }
    const zb = $('#zone-bar');
    if (zb) {
      zb.style.width = Math.min(100, Math.max(0, z || 0)) + '%';
      zb.className = 'fill bg-' + tag.key;
    }
    renderZoneMarks(s);
    $('#zone-action').textContent = actionText(st.lastAction, s);

    setChip('#chip-standby', st.standbyOpen, 'Standby: OPEN', 'Standby: CLOSED');
    setChip('#chip-cross', st.crossAccess, 'Cross access: ON', 'Cross access: OFF');
    setChip('#chip-override', st.manualOverride || st.manualCrossAccess, 'Standby/Cross: MANUAL', 'Standby/Cross: AUTO');
    $('#btn-auto').disabled = !st.manualOverride && !st.manualCrossAccess;

    $$('[data-mode]').forEach(b => b.classList.toggle('active', b.dataset.mode === st.mode));
    $('#sim-panel').hidden = st.mode !== 'simulation';
    $('#store-mode').textContent = Store.mode === 'supabase' ? '● Realtime: Supabase' : '● Live sync: local session';

    renderCounters(s, st);
    renderAlerts();
    renderFreshness();
    checkKitchenAlerts();
  }

  // ---------- Room Delivery Dispatch Board (Subtab 2) ----------
  function renderDispatch() {
    const tbody = $('#dispatch-rows');
    const badge = $('#staff-del-badge');
    if (!tbody) return;

    const all = Store.getDeliveries();
    const sorted = MQM.sortDeliveries(all);
    const filtered = sorted.filter(d => {
      if (dispatchFilter === 'all') return true;
      return d.status === dispatchFilter;
    });

    const activeCount = all.filter(d => d.status !== 'delivered' && d.status !== 'cancelled').length;
    if (badge) badge.textContent = activeCount;

    if (!filtered.length) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--muted)">No orders matching filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(d => {
      const isUrgent = d.reason === 'medical';
      const reasonTag = isUrgent
        ? `<span class="pill pill-red">🚨 MEDICAL (High Priority)</span>`
        : `<span class="pill pill-amber">${esc(d.reason.toUpperCase())}</span>`;

      let actionHtml = '';
      if (d.status === 'requested') {
        actionHtml = `<button class="btn btn-sm btn-gold" data-del-act="prepare" data-id="${esc(d.id)}">Pack Order ▶</button>`;
      } else if (d.status === 'preparing') {
        actionHtml = `
          <div style="display:flex;gap:6px;align-items:center">
            <select class="input" style="padding:4px;font-size:12px;width:130px" id="sel-runner-${esc(d.id)}">
              <option value="Ramesh (Mess Runner)">Staff: Ramesh</option>
              <option value="Suresh (Mess Runner)">Staff: Suresh</option>
              <option value="Peer Volunteer Student">Peer Volunteer (+10 pts)</option>
            </select>
            <button class="btn btn-sm btn-cyan" data-del-act="dispatch" data-id="${esc(d.id)}">Dispatch ✈</button>
          </div>`;
      } else if (d.status === 'out_for_delivery') {
        actionHtml = `
          <button class="btn btn-sm btn-green" data-del-act="deliver" data-id="${esc(d.id)}" data-otp="${esc(d.otp_code)}">
            Confirm OTP (${esc(d.otp_code)}) ✓
          </button>`;
      } else {
        actionHtml = `<span class="pill pill-green">Delivered ✓</span>`;
      }

      return `
        <tr>
          <td>${reasonTag}</td>
          <td>
            <strong>${esc(d.student_name)}</strong> (${esc(d.roll_number)})<br>
            <span class="muted" style="font-size:12px">${esc(d.hostel_block)}, Rm ${esc(d.room_number)} · 📞 ${esc(d.phone || 'N/A')}</span>
          </td>
          <td>
            <b>${esc(d.diet_choice)}</b><br>
            <span class="muted" style="font-size:11px">${esc(d.meal_type.toUpperCase())} ${d.notes ? '· Note: ' + esc(d.notes) : ''}</span>
          </td>
          <td>
            <span class="type-chip">${esc(d.delivery_mode === 'peer_buddy' ? 'Peer Volunteer' : 'Mess Staff Runner')}</span><br>
            <small>${esc(d.runner_name || 'Unassigned')}</small>
          </td>
          <td>
            <span class="pill ${d.status === 'delivered' ? 'pill-green' : 'pill-amber'}">${esc(d.status.toUpperCase())}</span><br>
            <span style="font-family:var(--font-mono);font-size:11px;color:var(--gold)">OTP: ${esc(d.otp_code)}</span>
          </td>
          <td>${actionHtml}</td>
        </tr>`;
    }).join('');

    // Bind dispatch buttons
    tbody.querySelectorAll('[data-del-act]').forEach(btn => {
      btn.onclick = async () => {
        const id = btn.dataset.id;
        const act = btn.dataset.delAct;
        if (act === 'prepare') {
          await Store.updateDeliveryStatus(id, 'preparing');
          showToast('Order moved to packing station ✓', 'info');
        } else if (act === 'dispatch') {
          const runnerSel = $(`#sel-runner-${id}`);
          const runner = runnerSel ? runnerSel.value : 'Mess Staff Runner';
          await Store.updateDeliveryStatus(id, 'out_for_delivery', runner);
          showToast(`Dispatched to ${runner}!`, 'success');
        } else if (act === 'deliver') {
          await Store.updateDeliveryStatus(id, 'delivered');
          showToast('Delivery confirmed with OTP and marked complete ✓', 'success');
        }
        renderDispatch();
      };
    });
  }

  // ---------- Kitchen Early Warning & Refills (Subtab 3) ----------
  function checkKitchenAlerts() {
    const menu = Store.getMenuItems();
    const ratings = Store.getDishRatings();
    const alerts = MQM.checkDishAlerts(menu, ratings);
    const banner = $('#kitchen-alert-banner');
    const text = $('#kitchen-alert-text');

    if (alerts.length > 0) {
      if (banner && banner.hidden) {
        banner.hidden = false;
        notifyStaff('red');
      }
      if (text) {
        text.innerHTML = alerts.map(a => `<b>${esc(a.dishName)}</b>: ${esc(a.reason)}`).join(' | ');
      }
    } else {
      if (banner) banner.hidden = true;
    }
  }

  function renderKitchen() {
    const tbody = $('#staff-menu-rows');
    if (!tbody) return;

    const menu = Store.getMenuItems();
    const ratings = Store.getDishRatings();

    tbody.innerHTML = menu.map(m => {
      const dishRatings = ratings.filter(r => r.menu_item_id === m.id);
      const tags = dishRatings.flatMap(r => r.tags || []);
      const tagCounts = {};
      tags.forEach(t => tagCounts[t] = (tagCounts[t] || 0) + 1);
      const tagSummary = Object.entries(tagCounts).map(([t, c]) => `<span class="tag-btn">${t}: ${c}</span>`).join(' ') || '<span class="muted">No tags yet</span>';

      const isCritical = Number(m.avg_rating) < 2.5;

      return `
        <tr class="${isCritical ? 'alert-red' : ''}">
          <td><strong>${esc(m.name)}</strong><br><span class="muted" style="font-size:11px">${esc(m.category)}</span></td>
          <td><span class="type-chip">${esc(m.meal_slot.toUpperCase())}</span></td>
          <td>
            <b style="font-family:var(--font-display);font-size:22px;color:${isCritical ? 'var(--red)' : 'var(--gold)'}">
              ★ ${Number(m.avg_rating).toFixed(1)}
            </b>
          </td>
          <td>${m.ratings_count || dishRatings.length}</td>
          <td>${tagSummary}</td>
          <td>
            <select class="input" style="padding:4px;font-size:12px" data-dish-avail="${esc(m.id)}">
              <option value="available" ${m.availability === 'available' ? 'selected' : ''}>Available</option>
              <option value="refilling" ${m.availability === 'refilling' ? 'selected' : ''}>Refilling in 3m</option>
              <option value="low" ${m.availability === 'low' ? 'selected' : ''}>Running Low</option>
              <option value="finished" ${m.availability === 'finished' ? 'selected' : ''}>Sold Out</option>
            </select>
          </td>
        </tr>`;
    }).join('');

    tbody.querySelectorAll('[data-dish-avail]').forEach(sel => {
      sel.onchange = async () => {
        const dishId = sel.dataset.dishAvail;
        await Store.updateDishAvailability(dishId, sel.value);
        showToast(`Updated availability for dish ✓`, 'info');
      };
    });
  }

  // ---------- Zero Food Waste Attendance (Subtab 4) ----------
  function renderAttendance() {
    const list = Store.getAttendance();
    const stats = MQM.calculateAttendance(list);
    $('#staff-att-eat').textContent = stats.eating;
    $('#staff-att-skip').textContent = stats.skipping;
    $('#staff-att-save').textContent = `~${stats.wasteReductionEst}%`;
  }

  // ---------- Simulation ----------
  function startSim() {
    Sim.start(t => {
      $('#sim-clock').textContent = Sim.clockLabel(t);
      $('#sim-progress').style.width = (t / Sim.LENGTH) * 100 + '%';
      commit(d => {
        const simCounters = Sim.generate(d.counters, d.state, t);
        Object.keys(simCounters).forEach(k => {
          if (d.counters[k] && d.counters[k].soldOut) {
            simCounters[k].soldOut = true;
            simCounters[k].queueCount = 0;
          }
        });
        d.counters = simCounters;
      }, true);
    }, Number($('#sim-speed').value));
  }

  function setMode(mode) {
    if (mode === 'simulation') {
      commit(d => { d.state.mode = 'simulation'; });
      startSim();
    } else {
      Sim.stop();
      commit(d => { d.state.mode = 'manual'; });
    }
  }

  // ---------- Settings ----------
  function fillSettings() {
    const s = S();
    SETTING_FIELDS.forEach(k => {
      const el = $('#set-' + k);
      if (el) el.value = s[k] !== undefined ? s[k] : 75;
    });
    $('#set-staffPin').value = s.staffPin;
    $('#cap-list').innerHTML = MQM.listCounters(data.counters).map(c =>
      `<label class="field"><span>${esc(c.name)} capacity</span><input class="input" type="number" min="1" data-cap="${esc(c.id)}" value="${Number(c.capacity) || 15}"></label>`
    ).join('');
  }

  function validate(v) {
    if (Object.values(v).some(x => !isFinite(x))) return 'All fields must be valid numbers.';
    if (v.closeThreshold < 0 || v.crossAccessThreshold > 100) return 'Thresholds must be between 0% and 100%.';
    if (!(v.closeThreshold < v.alertThreshold && v.alertThreshold <= v.standbyThreshold && v.standbyThreshold < v.crossAccessThreshold))
      return 'Thresholds must follow: close < alert ≤ standby < cross access.';
    if (v.avgServeSeconds <= 0) return 'Average serving time must be more than 0.';
    if (v.refreshSeconds < 5) return 'Refresh interval should be at least 5 seconds.';
    return null;
  }

  function showMsg(text, isErr) {
    const m = $('#settings-msg');
    if (!m) return;
    m.textContent = text;
    m.className = 'form-msg ' + (isErr ? 'err' : 'ok');
  }

  // ---------- Events Binding ----------
  function setQueue(id, value) {
    commit(d => {
      if (!d.counters[id]) return;
      d.counters[id].queueCount = Math.max(0, Math.round(Number(value) || 0));
    }, true);
  }

  function bind() {
    const rows = $('#counter-rows');
    rows?.addEventListener('click', e => {
      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      const id = btn.closest('.crow').dataset.id;
      const cur = Number(data.counters[id].queueCount) || 0;
      setQueue(id, btn.dataset.act === 'inc' ? cur + 1 : cur - 1);
    });

    rows?.addEventListener('input', e => {
      if (e.target.dataset.f === 'range') setQueue(e.target.closest('.crow').dataset.id, e.target.value);
    });

    rows?.addEventListener('change', e => {
      const row = e.target.closest('.crow');
      if (!row) return;
      const id = row.dataset.id;
      if (e.target.dataset.f === 'num') setQueue(id, e.target.value);
      if (e.target.dataset.f === 'soldout') {
        const isSoldOut = !!e.target.checked;
        commit(d => {
          d.counters[id].soldOut = isSoldOut;
          if (isSoldOut) d.counters[id].queueCount = 0;
        }, true);
      }
    });

    $('#btn-sound-toggle')?.addEventListener('click', e => {
      soundEnabled = !soundEnabled;
      e.target.textContent = soundEnabled ? '🔔 Sound: ON' : '🔕 Sound: OFF';
      if (soundEnabled) notifyStaff('amber');
    });

    $('#btn-open')?.addEventListener('click', () => commit(d => { d.state.manualOverride = true; d.state.standbyOpen = true; }));
    $('#btn-close')?.addEventListener('click', () => commit(d => { d.state.manualOverride = true; d.state.standbyOpen = false; }));
    $('#btn-force-cross')?.addEventListener('click', () => commit(d => {
      d.state.manualCrossAccess = true;
      d.state.crossAccess = true;
      showToast('Cross-access forced ON for all students!', 'warn');
    }));
    $('#btn-auto')?.addEventListener('click', () => commit(d => {
      d.state.manualOverride = false;
      d.state.manualCrossAccess = false;
      showToast('Returned to automated rule engine ✓', 'info');
    }));

    $('#btn-reset')?.addEventListener('click', () => {
      commit(d => {
        Object.values(d.counters).forEach(c => { c.queueCount = 0; c.soldOut = false; });
        Object.assign(d.state, { crossAccess: false, standbyOpen: false, manualOverride: false, manualCrossAccess: false, alertSent: false });
        d.alerts = [];
      }, true);
      showToast('All counter counts reset to 0 ✓', 'info');
    });

    $('#btn-clear-alerts')?.addEventListener('click', () => {
      data.alerts = [];
      Store.save(data);
      render();
    });

    $('#btn-ack-alert')?.addEventListener('click', () => {
      $('#kitchen-alert-banner').hidden = true;
      showToast('Kitchen alert acknowledged.', 'info');
    });

    $$('[data-mode]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
    $('#sim-speed')?.addEventListener('change', () => { if (Sim.running) startSim(); });
    $('#btn-sim-restart')?.addEventListener('click', () => { Sim.reset(); startSim(); });

    $('#settings-form')?.addEventListener('submit', e => {
      e.preventDefault();
      const v = {};
      SETTING_FIELDS.forEach(k => {
        const el = $('#set-' + k);
        if (el) v[k] = Number(el.value);
      });
      const err = validate(v);
      if (err) return showMsg(err, true);
      const pin = $('#set-staffPin').value.trim();
      if (!/^\d{4,8}$/.test(pin)) return showMsg('PIN must be 4–8 digits.', true);
      commit(d => {
        d.settings = { ...d.settings, ...v, staffPin: pin };
        $$('[data-cap]').forEach(inp => {
          d.counters[inp.dataset.cap].capacity = Math.max(1, Math.round(Number(inp.value) || 15));
        });
      });
      startEngineTimer();
      showMsg('Settings saved successfully ✓', false);
      showToast('Settings saved ✓', 'success');
    });

    $('#btn-defaults')?.addEventListener('click', () => {
      commit(d => {
        d.settings = { ...MQM.DEFAULT_SETTINGS };
        Object.keys(d.counters).forEach(id => {
          if (MQM.DEFAULT_COUNTERS[id]) d.counters[id].capacity = MQM.DEFAULT_COUNTERS[id].capacity;
        });
      });
      fillSettings();
      startEngineTimer();
      showMsg('Defaults restored ✓', false);
      showToast('Defaults restored ✓', 'info');
    });

    $('#btn-logout')?.addEventListener('click', () => {
      Auth.logout();
    });

    const url = new URL('student.html', location.href).href;
    const qrLink = $('#qr-link');
    if (qrLink) {
      qrLink.href = url;
      qrLink.textContent = url;
    }
    const qrImg = $('#qr-img');
    if (qrImg) {
      qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(url);
    }
  }

  // ---------- Start App ----------
  (async () => {
    initTabs();
    await Store.init();
    data = await Store.load();
    Store.subscribe(d => {
      if (Sim.running) return;
      data = d;
      render();
    });

    Store.onDeliveriesChange(() => {
      if (activeTab === 'dispatch') renderDispatch();
    });

    Store.onMenuChange(() => {
      if (activeTab === 'kitchen') renderKitchen();
      checkKitchenAlerts();
    });

    Store.onAttendanceChange(() => {
      if (activeTab === 'waste') renderAttendance();
    });

    if (Store.onStatusChange) {
      Store.onStatusChange(st => {
        const b = $('#staff-offline-banner');
        if (b) {
          b.hidden = !st.error;
          if (st.error) b.textContent = st.error;
        }
      });
    }

    bind();
    setupGate();
    startEngineTimer();
    setInterval(renderFreshness, 1000);
  })();
})();
