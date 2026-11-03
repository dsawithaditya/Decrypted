/* Student view: read-only, updates live */
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const TYPE_LABEL = { national: 'National', international: 'International', standby: 'Standby' };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let data = null;
  let who = localStorage.getItem('mqm-who') || 'national';

  function card(c, s, st, best) {
    const pct = MQM.crowdPct(c.queueCount, c.capacity);
    const tag = MQM.colorTag(pct);
    const allowed = MQM.allowedFor(c, st, who);
    const isBest = best && best.id === c.id;
    const wait = MQM.waitMinutes(c.queueCount, s.avgServeSeconds);
    const status = !c.open ? 'Closed'
      : (c.type === 'international' && st.crossAccess) ? 'Open to all students' : 'Open';
    let note = '';
    if (c.open && !allowed) note = who === 'national' ? 'International students only right now' : 'For national students';

    return `
      <article class="ccard ${isBest ? 'is-best' : ''} ${!c.open || !allowed ? 'is-dim' : ''}">
        ${isBest ? '<span class="best-flag">★ BEST</span>' : ''}
        <header class="ccard-head">
          <h3>${esc(c.name)}</h3>
          <span class="type-chip type-${esc(c.type)}">${TYPE_LABEL[c.type] || esc(c.type)}</span>
        </header>
        <div class="ccard-pct c-${tag.key}">${pct === null ? 'N/A' : Math.round(pct) + '%'}</div>
        <div class="bar"><i class="fill bg-${tag.key}" style="width:${Math.min(100, pct || 0)}%"></i></div>
        <div class="ccard-row">
          <span class="pill pill-${tag.key}">${tag.label}</span>
          <span class="ccard-wait">Wait: ${pct === null ? 'N/A' : MQM.formatWait(wait)}</span>
        </div>
        <div class="ccard-status"><span class="dot ${c.open ? 'dot-on' : 'dot-off'}"></span>${status}</div>
        ${note ? `<p class="ccard-note">${note}</p>` : ''}
      </article>`;
  }

  function render() {
    if (!data) return;
    const s = { ...MQM.DEFAULT_SETTINGS, ...data.settings };
    const st = data.state;
    const best = MQM.bestCounter(data.counters, st, s, who);

    const banner = $('#rec-banner');
    if (best) {
      $('#rec-name').textContent = 'Go to ' + best.name;
      $('#rec-wait').textContent = MQM.bannerWait(best.wait);
      banner.className = 'rec-banner rec-' + MQM.colorTag(best.pct).key;
    } else {
      $('#rec-name').textContent = 'No counter open';
      $('#rec-wait').textContent = 'Please wait for staff to open a counter.';
      banner.className = 'rec-banner rec-na';
    }

    $('#cross-banner').hidden = !(st.crossAccess && who === 'national');
    $('#standby-banner').hidden = !st.standbyOpen;
    $('#counter-grid').innerHTML = MQM.listCounters(data.counters).map(c => card(c, s, st, best)).join('');
    document.querySelectorAll('[data-who]').forEach(b => b.classList.toggle('active', b.dataset.who === who));
    tick();
  }

  function tick() {
    $('#clock').textContent = MQM.timeLabel();
    if (!data) return;
    const st = data.state;
    $('#updated').textContent = 'Counts updated ' + MQM.timeAgo(st.lastCountUpdate);
    const mins = MQM.minutesSince(st.lastCountUpdate);
    const stale = mins > 5 && st.mode !== 'simulation';
    $('#stale-banner').hidden = !stale;
    if (stale) $('#stale-banner').textContent = `Heads up: counts were last updated ${Math.floor(mins)} min ago and may be out of date.`;
  }

  document.querySelectorAll('[data-who]').forEach(b => b.addEventListener('click', () => {
    who = b.dataset.who;
    localStorage.setItem('mqm-who', who);
    render();
  }));

  (async () => {
    await Store.init();
    data = await Store.load();
    render();
    Store.subscribe(d => { data = d; render(); });
    setInterval(tick, 1000);
  })();
})();
