/* Staff console: runs the rule engine and writes to the store */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const TYPE_LABEL = { national: 'National', international: 'International', standby: 'Standby' };
  const SETTING_FIELDS = ['alertThreshold', 'standbyThreshold', 'crossAccessThreshold', 'closeThreshold', 'avgServeSeconds', 'refreshSeconds'];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let data = null;
  let engineTimer = null;
  const S = () => ({ ...MQM.DEFAULT_SETTINGS, ...data.settings });

  /* ---------- engine ---------- */
  function runEngine() {
    const r = MQM.evaluate(data);
    data.state = r.state;
    data.counters = r.counters;
    if (r.newAlerts.length) data.alerts = [...r.newAlerts.reverse(), ...(data.alerts || [])].slice(0, 12);
    data.state.lastUpdated = new Date().toISOString();
  }
  function commit(mutate, countsChanged) {
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

  /* ---------- PIN gate ---------- */
  function setupGate() {
    if (sessionStorage.getItem('mqm-staff-ok') === '1') return unlock();
    $('#gate-form').addEventListener('submit', e => {
      e.preventDefault();
      if ($('#pin').value === String(S().staffPin)) {
        sessionStorage.setItem('mqm-staff-ok', '1');
        unlock();
      } else {
        $('#pin-error').hidden = false;
        $('#pin').value = '';
        $('#pin').focus();
      }
    });
    $('#pin').focus();
  }
  function unlock() {
    $('#gate').hidden = true;
    $('#dash').hidden = false;
    commit(null, false);
    if (data.state.mode === 'simulation') startSim();
  }

  /* ---------- render ---------- */
  function actionText(a, s) {
    return ({
      cross: `Above ${s.crossAccessThreshold}%: cross-counter access ON, standby open`,
      standby: `${s.standbyThreshold}% or more: standby counter open`,
      alert: `${s.alertThreshold}% or more: early alert (2-minute notice)`,
      close: `Below ${s.closeThreshold}%: normal routing`,
      keep: 'Between thresholds: keeping the current state (hysteresis)',
      'no-data': 'No data from the national counters'
    })[a] || '';
  }
  function setChip(sel, on, onText, offText) {
    const el = $(sel);
    el.textContent = on ? onText : offText;
    el.classList.toggle('on', !!on);
  }
  function statusText(c, st) {
    if (!c.open) return 'Closed';
    if (c.type === 'international' && st.crossAccess) return 'Open to all students';
    return 'Open';
  }

  function rowHTML(c) {
    return `
      <div class="crow" data-id="${esc(c.id)}">
        <div class="crow-head">
          <div><strong>${esc(c.name)}</strong><span class="type-chip type-${esc(c.type)}">${TYPE_LABEL[c.type] || esc(c.type)}</span></div>
          <span class="pill" data-f="tag"></span>
        </div>
        <div class="crow-ctrl">
          <button class="btn btn-sm" data-act="dec" aria-label="Remove one person">−</button>
          <input type="range" min="0" data-f="range" aria-label="People in line at ${esc(c.name)}">
          <button class="btn btn-sm" data-act="inc" aria-label="Add one person">+</button>
          <input type="number" min="0" class="input" data-f="num" aria-label="People count">
        </div>
        <div class="crow-meta">Crowd <b data-f="pct"></b> · Wait <b data-f="wait"></b> · <span data-f="status"></span></div>
        <div class="bar"><i class="fill" data-f="bar"></i></div>
      </div>`;
  }

  function renderCounters(s, st) {
    const list = MQM.listCounters(data.counters);
    const box = $('#counter-rows');
    const ids = list.map(c => c.id).join(',');
    if (box.dataset.ids !== ids) { box.innerHTML = list.map(rowHTML).join(''); box.dataset.ids = ids; }
    const sim = st.mode === 'simulation';

    list.forEach(c => {
      const row = box.querySelector(`[data-id="${c.id}"]`);
      const f = n => row.querySelector(`[data-f="${n}"]`);
      const pct = MQM.crowdPct(c.queueCount, c.capacity);
      const tag = MQM.colorTag(pct);
      const w = MQM.waitMinutes(c.queueCount, s.avgServeSeconds);

      const range = f('range');
      range.max = Math.max(1, Math.round((c.capacity || 0) * 1.5));
      if (document.activeElement !== range) range.value = c.queueCount;
      const num = f('num');
      if (document.activeElement !== num) num.value = c.queueCount;

      f('pct').textContent = pct === null ? 'N/A' : Math.round(pct) + '%';
      f('wait').textContent = pct === null ? 'N/A' : MQM.formatWait(w);
      f('status').textContent = statusText(c, st);
      f('tag').textContent = tag.label;
      f('tag').className = 'pill pill-' + tag.key;
      f('bar').style.width = Math.min(100, pct || 0) + '%';
      f('bar').className = 'fill bg-' + tag.key;

      row.classList.toggle('is-closed', !c.open);
      const locked = sim || !c.open;
      $$('button, input', row).forEach(el => (el.disabled = locked));
    });
  }

  function renderAlerts() {
    const alerts = data.alerts || [];
    $('#alert-list').innerHTML = alerts.length
      ? alerts.map(a => `<li class="alert alert-${esc(a.level)}"><span class="alert-time">${esc(a.time)}</span><span>${esc(a.message)}</span></li>`).join('')
      : '<li class="alert-empty">No alerts yet. Alerts appear here when the crowd crosses a threshold.</li>';
  }

  function renderFreshness() {
    if (!data) return;
    $('#clock').textContent = MQM.timeLabel();
    const st = data.state;
    const mins = MQM.minutesSince(st.lastCountUpdate);
    const el = $('#fresh');
    el.textContent = 'Counts updated ' + MQM.timeAgo(st.lastCountUpdate) + (mins > 5 && st.mode === 'manual' ? '. Please update!' : '');
    el.classList.toggle('warn', mins > 5 && st.mode === 'manual');
  }

  function render() {
    if (!data || $('#dash').hidden) return;
    const s = S(), st = data.state;
    const z = MQM.zoneAverage(data.counters);
    const tag = MQM.colorTag(z);

    $('#zone-val').textContent = z === null ? 'N/A' : Math.round(z) + '%';
    $('#zone-val').className = 'zone-val c-' + tag.key;
    $('#zone-bar').style.width = Math.min(100, z || 0) + '%';
    $('#zone-bar').className = 'fill bg-' + tag.key;
    $('#zone-marks').innerHTML = [s.closeThreshold, s.alertThreshold, s.standbyThreshold, s.crossAccessThreshold]
      .map(v => `<span class="mark" style="left:${Math.min(100, v)}%"><b>${v}</b></span>`).join('');
    $('#zone-action').textContent = actionText(st.lastAction, s);

    setChip('#chip-standby', st.standbyOpen, 'Standby: OPEN', 'Standby: CLOSED');
    setChip('#chip-cross', st.crossAccess, 'Cross access: ON', 'Cross access: OFF');
    setChip('#chip-override', st.manualOverride, 'Standby: MANUAL', 'Standby: AUTO');
    $('#btn-auto').disabled = !st.manualOverride;

    $$('[data-mode]').forEach(b => b.classList.toggle('active', b.dataset.mode === st.mode));
    $('#sim-panel').hidden = st.mode !== 'simulation';
    $('#store-mode').textContent = Store.mode === 'firebase' ? '● Live sync: Firebase' : '● Live sync: this device only';

    renderCounters(s, st);
    renderAlerts();
    renderFreshness();
  }

  /* ---------- simulation ---------- */
  function startSim() {
    Sim.start(t => {
      $('#sim-clock').textContent = Sim.clockLabel(t);
      $('#sim-progress').style.width = (t / Sim.LENGTH) * 100 + '%';
      commit(d => { d.counters = Sim.generate(d.counters, d.state, t); }, true);
    }, Number($('#sim-speed').value));
  }
  function setMode(mode) {
    if (mode === 'simulation') { commit(d => { d.state.mode = 'simulation'; }); startSim(); }
    else { Sim.stop(); commit(d => { d.state.mode = 'manual'; }); }
  }

  /* ---------- settings ---------- */
  function fillSettings() {
    const s = S();
    SETTING_FIELDS.forEach(k => ($('#set-' + k).value = s[k]));
    $('#set-staffPin').value = s.staffPin;
    $('#cap-list').innerHTML = MQM.listCounters(data.counters).map(c =>
      `<label class="field"><span>${esc(c.name)} capacity</span><input class="input" type="number" min="0" data-cap="${esc(c.id)}" value="${Number(c.capacity) || 0}"></label>`
    ).join('');
  }
  function validate(v) {
    if (Object.values(v).some(x => !isFinite(x))) return 'All fields must be numbers.';
    if (!(v.closeThreshold < v.alertThreshold && v.alertThreshold <= v.standbyThreshold && v.standbyThreshold < v.crossAccessThreshold))
      return 'Thresholds must follow: close < alert ≤ standby < cross access.';
    if (v.avgServeSeconds <= 0) return 'Average serving time must be more than 0.';
    if (v.refreshSeconds < 5) return 'Refresh interval should be at least 5 seconds.';
    return null;
  }
  function showMsg(text, isErr) {
    const m = $('#settings-msg');
    m.textContent = text;
    m.className = 'form-msg ' + (isErr ? 'err' : 'ok');
  }

  /* ---------- events ---------- */
  function setQueue(id, value) {
    commit(d => { d.counters[id].queueCount = Math.max(0, Math.round(Number(value) || 0)); }, true);
  }

  function bind() {
    const rows = $('#counter-rows');
    rows.addEventListener('click', e => {
      const btn = e.target.closest('[data-act]');
      if (!btn) return;
      const id = btn.closest('.crow').dataset.id;
      const cur = Number(data.counters[id].queueCount) || 0;
      setQueue(id, btn.dataset.act === 'inc' ? cur + 1 : cur - 1);
    });
    rows.addEventListener('input', e => {
      if (e.target.dataset.f === 'range') setQueue(e.target.closest('.crow').dataset.id, e.target.value);
    });
    rows.addEventListener('change', e => {
      if (e.target.dataset.f === 'num') setQueue(e.target.closest('.crow').dataset.id, e.target.value);
    });

    $('#btn-open').addEventListener('click', () => commit(d => { d.state.manualOverride = true; d.state.standbyOpen = true; }));
    $('#btn-close').addEventListener('click', () => commit(d => { d.state.manualOverride = true; d.state.standbyOpen = false; }));
    $('#btn-auto').addEventListener('click', () => commit(d => { d.state.manualOverride = false; }));

    $('#btn-reset').addEventListener('click', () => {
      if (!confirm('Reset all counter counts to 0?')) return;
      commit(d => {
        Object.values(d.counters).forEach(c => (c.queueCount = 0));
        Object.assign(d.state, { crossAccess: false, standbyOpen: false, manualOverride: false, alertSent: false });
        d.alerts = [];
              }, true);
    });
    $('#btn-clear-alerts').addEventListener('click', () => { data.alerts = []; Store.save(data); render(); });

    $$('[data-mode]').forEach(b => b.addEventListener('click', () => setMode(b.dataset.mode)));
    $('#sim-speed').addEventListener('change', () => { if (Sim.running) startSim(); });
    $('#btn-sim-restart').addEventListener('click', () => { Sim.reset(); startSim(); });

    $('#settings-form').addEventListener('submit', e => {
      e.preventDefault();
      const v = {};
      SETTING_FIELDS.forEach(k => (v[k] = Number($('#set-' + k).value)));
      const err = validate(v);
      if (err) return showMsg(err, true);
      const pin = $('#set-staffPin').value.trim();
      if (!/^\d{4,8}$/.test(pin)) return showMsg('PIN must be 4–8 digits.', true);
      commit(d => {
        d.settings = { ...d.settings, ...v, staffPin: pin };
        $$('[data-cap]').forEach(inp => {
          d.counters[inp.dataset.cap].capacity = Math.max(0, Math.round(Number(inp.value) || 0));
        });
      });
      startEngineTimer();
      showMsg('Settings saved ✓', false);
    });
    $('#btn-defaults').addEventListener('click', () => {
      if (!confirm('Restore default thresholds, PIN and capacities?')) return;
      commit(d => {
        d.settings = { ...MQM.DEFAULT_SETTINGS };
        Object.keys(d.counters).forEach(id => {
          if (MQM.DEFAULT_COUNTERS[id]) d.counters[id].capacity = MQM.DEFAULT_COUNTERS[id].capacity;
        });
      });
      fillSettings();
      startEngineTimer();
      showMsg('Defaults restored ✓', false);
    });
    $('details.admin').addEventListener('toggle', e => { if (e.target.open) fillSettings(); });

    $('#btn-logout').addEventListener('click', () => {
      sessionStorage.removeItem('mqm-staff-ok');
      Sim.stop();
      location.reload();
    });

    // QR code pointing at the student page
    const url = new URL('student.html', location.href).href;
    $('#qr-link').href = url;
    $('#qr-link').textContent = url;
    $('#qr-img').src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(url);
  }

  /* ---------- start ---------- */
  (async () => {
    await Store.init();
    data = await Store.load();
    // Keep this screen in sync with edits from other staff devices
    Store.subscribe(d => {
      if (Sim.running) return; // the simulation owns the data while it runs
      data = d;
      render();
    });
    bind();
    setupGate();
    startEngineTimer();
    setInterval(renderFreshness, 1000);
  })();
})();
