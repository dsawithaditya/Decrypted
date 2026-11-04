/* ====================================================================
   student.js: Student View Controller for Mess Queue Manager
   Tabs: Live Queue, Room Delivery, Menu & Ratings, Zero Food Waste
   Team Decrypted · SE-302A · Jain University Canteen Mess
   ==================================================================== */
(function () {
  'use strict';

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const TYPE_LABEL = { national: 'National', international: 'International', standby: 'Standby' };
  const esc = s => String(s || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let data = null;
  let who = localStorage.getItem('mqm-who') || 'national';
  let activeTab = 'queue';
  let activeMealSlot = 'lunch';
  let notifyWhenFree = false;
  let passCountdownInterval = null;
  let activePass = null;

  // ---------- Toast Notification Helper ----------
  function showToast(message, type = 'info') {
    const container = $('#toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${esc(message)}</span><button style="background:transparent;border:0;color:inherit;cursor:pointer;font-weight:700">✕</button>`;
    toast.querySelector('button').onclick = () => toast.remove();
    container.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 4000);
  }

  // ---------- Tab Switching ----------
  function initTabs() {
    $$('.subtab').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        activeTab = target;
        $$('.subtab').forEach(b => b.classList.toggle('active', b === btn));
        $$('.tab-pane').forEach(p => (p.hidden = p.id !== `tab-view-${target}`));
        if (target === 'menu') renderMenu();
        if (target === 'delivery') renderDeliveries();
        if (target === 'waste') renderAttendance();
      });
    });
  }

  // ---------- Profile Setup ----------
  function initProfile() {
    const user = Auth.getUser();
    const pill = $('#profile-pill');
    if (user && user.role === 'student') {
      who = user.studentType || 'national';
      localStorage.setItem('mqm-who', who);
      if (pill) {
        pill.innerHTML = `Hostel: <b>${esc(user.hostelBlock || 'Block B')}, ${esc(user.roomNumber || '312')}</b> · <span class="c-gold">★ ${user.karmaPoints || 25} Karma</span>`;
      }
      // Pre-fill delivery form
      const n = $('#del-name'), r = $('#del-roll'), b = $('#del-block'), rm = $('#del-room');
      if (n) n.value = user.fullName || '';
      if (r) r.value = user.rollNumber || '';
      if (b && user.hostelBlock) b.value = user.hostelBlock;
      if (rm) rm.value = user.roomNumber || 'B-312';
    }
  }

  // ---------- Counter Card Generator ----------
  function card(c, s, st, best) {
    const pct = MQM.crowdPct(c.queueCount, c.capacity);
    const tag = MQM.colorTag(pct);
    const allowed = MQM.allowedFor(c, st, who);
    const isBest = best && best.id === c.id;
    const wait = MQM.waitMinutes(c.queueCount, s.avgServeSeconds);
    const status = c.soldOut ? 'SOLD OUT (Empty food container)'
      : (!c.open ? 'Closed'
      : (c.type === 'international' && st.crossAccess) ? 'Open to all students' : 'Open');
    let note = '';
    if (c.open && !allowed && !c.soldOut) {
      note = who === 'national' ? 'International students only right now' : 'For national students';
    }

    return `
      <article class="ccard ${isBest ? 'is-best' : ''} ${!c.open || !allowed || c.soldOut ? 'is-dim' : ''}">
        ${isBest ? '<span class="best-flag">★ BEST COUNTER</span>' : ''}
        <header class="ccard-head">
          <h3>${esc(c.name)}</h3>
          <span class="type-chip type-${esc(c.type)}">${TYPE_LABEL[c.type] || esc(c.type)}</span>
        </header>
        <div class="ccard-pct c-${tag.key}">${pct === null ? 'N/A' : Math.round(pct) + '%'}</div>
        <div class="bar"><i class="fill bg-${tag.key}" style="width:${Math.min(100, pct || 0)}%"></i></div>
        <div class="ccard-row">
          <span class="pill pill-${tag.key}">${c.soldOut ? 'Sold Out' : tag.label}</span>
          <span class="ccard-wait">Wait: ${pct === null ? 'N/A' : MQM.formatWait(wait)}</span>
        </div>
        <div class="ccard-status"><span class="dot ${c.open && !c.soldOut ? 'dot-on' : 'dot-off'}"></span>${status}</div>
        ${note ? `<p class="ccard-note">${note}</p>` : ''}
      </article>`;
  }

  // ---------- Peak-Hour Forecast Chart ----------
  function renderForecast(zoneAvg) {
    const chart = $('#forecast-chart');
    if (!chart) return;
    const forecastData = [
      { time: '11:30', pct: 25 },
      { time: '11:45', pct: 38 },
      { time: '12:00', pct: 62 },
      { time: '12:15', pct: 88 },
      { time: '12:30', pct: 94 },
      { time: '12:45', pct: 82 },
      { time: '1:00',  pct: 54 },
      { time: '1:15',  pct: 38 },
      { time: '1:30',  pct: 22 },
      { time: '2:00',  pct: 15 }
    ];

    chart.innerHTML = forecastData.map(d => {
      const isBest = d.pct < 45;
      const tag = MQM.colorTag(d.pct);
      return `
        <div class="forecast-col ${isBest ? 'is-best-window' : ''}" title="${d.time} Estimated Crowd: ${d.pct}%">
          <div class="forecast-pct">${d.pct}%</div>
          <div class="forecast-bar bg-${tag.key}" style="height:${d.pct}%"></div>
          <div class="forecast-time">${d.time}</div>
        </div>`;
    }).join('');
  }

  // ---------- Render Live Queue (Tab 1) ----------
  function renderQueue() {
    if (!data) return;
    const s = { ...MQM.DEFAULT_SETTINGS, ...data.settings };
    const st = data.state;
    const best = MQM.bestCounter(data.counters, st, s, who);
    const z = MQM.zoneAverage(data.counters);

    const banner = $('#rec-banner');
    const curLang = localStorage.getItem('mqm-lang') || 'en';
    if (best) {
      if (curLang === 'kn') {
        $('#rec-name').textContent = best.name + ' ಗೆ ಹೋಗಿ';
        $('#rec-wait').textContent = best.wait <= 0 ? 'ಈಗಲೇ ಯಾವುದೇ ಕಾಯುವಿಕೆ ಇಲ್ಲ' : 'ಸುಮಾರು ' + Math.round(best.wait) + ' ನಿಮಿಷ ಕಾಯುವ ಸಮಯ';
      } else if (curLang === 'hi') {
        $('#rec-name').textContent = best.name + ' पर जाएं';
        $('#rec-wait').textContent = best.wait <= 0 ? 'अभी कोई प्रतीक्षा नहीं' : 'लगभग ' + Math.round(best.wait) + ' मिनट प्रतीक्षा';
      } else {
        $('#rec-name').textContent = 'Go to ' + best.name;
        $('#rec-wait').textContent = MQM.bannerWait(best.wait);
      }
      banner.className = 'rec-banner rec-' + MQM.colorTag(best.pct).key;
    } else {
      $('#rec-name').textContent = curLang === 'kn' ? 'ಯಾವುದೇ ಕೌಂಟರ್ ತೆರೆದಿಲ್ಲ' : (curLang === 'hi' ? 'कोई काउंटर नहीं खुला' : 'No counter open');
      $('#rec-wait').textContent = curLang === 'kn' ? 'ಸಿಬ್ಬಂದಿ ಕೌಂಟರ್ ತೆರೆಯುವವರೆಗೆ ದಯವಿಟ್ಟು ಕಾಯಿರಿ.' : (curLang === 'hi' ? 'कृपया प्रतीक्षा करें।' : 'Please wait for staff to open a counter.');
      banner.className = 'rec-banner rec-na';
    }

    const crossPassBanner = $('#cross-pass-banner');
    if (crossPassBanner) {
      crossPassBanner.hidden = !(st.crossAccess && who === 'national');
    }
    $('#standby-banner').hidden = !st.standbyOpen;
    $('#counter-grid').innerHTML = MQM.listCounters(data.counters).map(c => card(c, s, st, best)).join('');
    $$('[data-who]').forEach(b => b.classList.toggle('active', b.dataset.who === who));

    renderForecast(z);
    checkPushAlert(z);
    tick();
  }

  // ---------- Push Notification Chime ----------
  function checkPushAlert(z) {
    if (notifyWhenFree && z !== null && z < 50) {
      notifyWhenFree = false;
      const btn = $('#btn-push-alert');
      if (btn) btn.textContent = '🔔 Alert Me When Free (<50%)';
      showToast('🎉 Good news! National mess crowd has dropped below 50%. Best time to head down!', 'success');
      try {
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('MQM: Mess Crowd is Free!', {
            body: `National mess crowd dropped to ${Math.round(z)}%. Counters are open with minimal wait.`,
            icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"%3E%3Ccircle cx="32" cy="32" r="30" fill="%233ddc84"/%3E%3C/svg%3E'
          });
        }
      } catch (e) { }
    }
  }

  // ---------- Digital Cross-Access Pass Handling ----------
  function setupPassSystem() {
    const btnClaim = $('#btn-claim-pass');
    const modal = $('#express-pass-modal');
    const btnClose = $('#btn-close-pass-modal');

    if (btnClose) btnClose.onclick = () => (modal.hidden = true);

    if (btnClaim) {
      btnClaim.onclick = async () => {
        const user = Auth.getUser() || { fullName: 'National Student', rollNumber: '21BCE1042' };
        const pass = await Store.claimCrossAccessPass(data.counters, data.state, user);

        if (!pass.allowed) {
          showToast(pass.reason || 'Cross-access pass currently unavailable.', 'warn');
          return;
        }

        activePass = pass;
        renderPassModal(pass);
        modal.hidden = false;
        showToast(`Pass #${pass.tokenCode} issued for ${pass.counterName}!`, 'success');
      };
    }
  }

  function renderPassModal(pass) {
    const container = $('#pass-card-content');
    if (!container) return;

    clearInterval(passCountdownInterval);

    const updateTimer = () => {
      const remainingMs = new Date(pass.expiresAt).getTime() - Date.now();
      if (remainingMs <= 0) {
        clearInterval(passCountdownInterval);
        container.innerHTML = `
          <div class="notice notice-red">PASS EXPIRED (15 min limit reached)</div>
          <p class="muted" style="margin-top:12px">Please claim a new pass if the rush hour is still active.</p>
        `;
        return;
      }
      const mins = Math.floor(remainingMs / 60000);
      const secs = Math.floor((remainingMs % 60000) / 1000);
      const countdownEl = document.getElementById('pass-timer');
      if (countdownEl) countdownEl.textContent = `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
    };

    const qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' + encodeURIComponent(`MQM-PASS:${pass.tokenCode}:${pass.counterId}`);

    container.innerHTML = `
      <span class="tag" style="background:var(--gold);color:var(--ink)">DIGITAL EXPRESS TOKEN</span>
      <div class="pass-token">${esc(pass.tokenCode)}</div>
      <h3 style="font-family:var(--font-hud);color:var(--cyan);font-size:18px">Assigned: ${esc(pass.counterName)}</h3>
      <div class="pass-qr-preview">
        <img src="${qrUrl}" width="160" height="160" alt="Pass QR Code">
      </div>
      <div class="pass-meta">
        <div>Student: <b>${esc(pass.studentName)} (${esc(pass.rollNumber)})</b></div>
        <div>Estimated Counter Wait: <b>~${pass.waitEstimateMin || 2} min</b></div>
        <div style="font-size:14px;color:var(--gold);margin-top:6px">
          Expires in: <b id="pass-timer" style="font-family:var(--font-mono)">15m 00s</b>
        </div>
      </div>
      <p class="muted" style="font-size:11px;margin-top:14px">
        Show this token or QR to the canteen staff at ${esc(pass.counterName)} to receive food immediately.
      </p>
    `;

    updateTimer();
    passCountdownInterval = setInterval(updateTimer, 1000);
  }

  // ---------- Direct-to-Room Delivery (Tab 2) ----------
  function setupDeliverySystem() {
    const form = $('#form-delivery-request');
    if (!form) return;

    form.onsubmit = async e => {
      e.preventDefault();
      const user = Auth.getUser();
      const payload = {
        student_name: $('#del-name').value.trim() || user?.fullName || 'Student',
        roll_number: $('#del-roll').value.trim() || user?.rollNumber || '21BCE1042',
        hostel_block: $('#del-block').value,
        room_number: $('#del-room').value.trim() || 'B-312',
        phone: $('#del-phone').value.trim() || '9876543210',
        reason: $('#del-reason').value,
        meal_type: $('#del-meal-type').value,
        diet_choice: $('#del-diet').value,
        delivery_mode: $('#del-mode').value,
        notes: $('#del-notes').value.trim()
      };

      const res = await Store.createDelivery(payload);
      showToast(`Room delivery requested! Security OTP: ${res.otp_code}`, 'success');
      form.reset();
      initProfile(); // Re-fill
      renderDeliveries();
    };

    Store.onDeliveriesChange(() => {
      renderDeliveries();
    });
  }

  function renderDeliveries() {
    const box = $('#tracker-content');
    const badge = $('#delivery-badge');
    if (!box) return;

    const user = Auth.getUser();
    const all = Store.getDeliveries();
    const myDeliveries = user && user.rollNumber
      ? all.filter(d => d.roll_number === user.rollNumber)
      : all;

    if (badge) {
      const activeCount = myDeliveries.filter(d => d.status !== 'delivered' && d.status !== 'cancelled').length;
      badge.textContent = activeCount;
      badge.hidden = activeCount === 0;
    }

    if (!myDeliveries.length) {
      box.innerHTML = `<p class="muted">No room deliveries found. Submit the form on the left if you are unwell or unable to visit the mess.</p>`;
      return;
    }

    box.innerHTML = myDeliveries.slice(0, 3).map(del => {
      const stages = [
        { key: 'requested', label: '1. Requested' },
        { key: 'preparing', label: '2. Packed' },
        { key: 'out_for_delivery', label: '3. On The Way' },
        { key: 'delivered', label: '4. Delivered' }
      ];

      const currentStageIdx = stages.findIndex(s => s.key === del.status);
      const isUrgent = del.reason === 'medical';

      return `
        <div style="background:var(--ink);padding:18px;margin-bottom:14px;box-shadow:0 0 0 2px var(--line)">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
            <div>
              <span class="pill ${isUrgent ? 'pill-red' : 'pill-amber'}">${del.reason.toUpperCase()}</span>
              <strong style="margin-left:6px;font-family:var(--font-hud)">${esc(del.diet_choice)}</strong>
            </div>
            <div style="text-align:right">
              <span class="hud-chip" style="color:var(--gold);font-size:12px">OTP: <b>${esc(del.otp_code)}</b></span>
            </div>
          </div>

          <!-- 4-Stage Stepper -->
          <div class="tracker-stepper">
            ${stages.map((stage, idx) => {
              const isDone = currentStageIdx >= idx;
              const isActive = currentStageIdx === idx;
              return `
                <div class="step-item ${isDone ? 'is-done' : ''} ${isActive ? 'is-active' : ''}">
                  <div class="step-dot">${isDone ? '✓' : idx + 1}</div>
                  <div class="step-label">${stage.label}</div>
                </div>`;
            }).join('')}
          </div>

          <div style="font-size:13px;color:var(--muted);display:grid;gap:4px">
            <div>Destination: <b>${esc(del.hostel_block)}, Room ${esc(del.room_number)}</b></div>
            <div>Runner: <b>${esc(del.runner_name || 'Staff Runner / Assigning…')}</b></div>
            <div>Requested: <b>${MQM.timeAgo(del.created_at)}</b></div>
          </div>
        </div>`;
    }).join('');
  }

  // ---------- Today's Menu & Dish Ratings (Tab 3) ----------
  function setupMenuSystem() {
    $$('#menu-slot-selector .seg').forEach(btn => {
      btn.onclick = () => {
        $$('#menu-slot-selector .seg').forEach(b => b.classList.toggle('active', b === btn));
        activeMealSlot = btn.dataset.slot;
        renderMenu();
      };
    });

    const fbForm = $('#form-overall-feedback');
    if (fbForm) {
      fbForm.onsubmit = async e => {
        e.preventDefault();
        const payload = {
          hygiene_rating: Number($('#fb-hygiene').value),
          speed_rating: Number($('#fb-speed').value),
          overall_rating: Number($('#fb-courtesy').value),
          comments: $('#fb-comments').value.trim()
        };
        await Store.submitFeedback(payload);
        showToast('Thank you! Mess feedback recorded successfully.', 'success');
        fbForm.reset();
      };
    }

    Store.onMenuChange(() => {
      if (activeTab === 'menu') renderMenu();
    });
  }

  function renderMenu() {
    const grid = $('#dishes-grid');
    if (!grid) return;

    const all = Store.getMenuItems();
    const items = all.filter(m => m.meal_slot === activeMealSlot);
    const ratings = Store.getDishRatings();

    if (!items.length) {
      grid.innerHTML = `<p class="muted">No dishes listed for ${activeMealSlot} yet.</p>`;
      return;
    }

    grid.innerHTML = items.map(item => {
      const itemRatings = ratings.filter(r => r.menu_item_id === item.id);
      const myRating = itemRatings.find(r => r.student_name === (Auth.getUser()?.fullName || ''));
      const myStars = myRating ? myRating.stars : 0;

      const availTag = item.availability === 'available' ? '<span class="pill pill-green">Available</span>'
        : item.availability === 'refilling' ? '<span class="pill pill-amber">Refilling in 3m</span>'
        : '<span class="pill pill-red">Running Low</span>';

      return `
        <article class="menu-card" data-dish-id="${esc(item.id)}">
          <div>
            <div class="menu-card-head">
              <h4 class="menu-card-title">${esc(item.name)}</h4>
              ${availTag}
            </div>
            <div style="margin-top:6px">
              <span class="menu-tag-chip">${esc(item.dietary_tag || 'Veg')}</span>
              <span class="muted" style="font-size:12px;margin-left:6px">${esc(item.category)}</span>
            </div>
          </div>

          <div style="margin:10px 0">
            <div style="display:flex;align-items:center;justify-content:space-between">
              <span class="menu-rating-score">★ ${Number(item.avg_rating).toFixed(1)}</span>
              <span class="muted" style="font-size:12px">${item.ratings_count || itemRatings.length} ratings</span>
            </div>

            <!-- Rate 1-5 Stars -->
            <div style="margin-top:8px">
              <span class="muted" style="font-size:11px;font-family:var(--font-hud)">TAP TO RATE:</span>
              <div class="star-btn-group" data-dish="${esc(item.id)}">
                ${[1, 2, 3, 4, 5].map(star => `
                  <button class="star-btn ${star <= myStars ? 'rated' : ''}" data-star="${star}" type="button">★</button>
                `).join('')}
              </div>
            </div>

            <!-- Quick Reaction Tags -->
            <div class="quick-tag-row" data-tags-for="${esc(item.id)}">
              <button class="tag-btn" data-tag="Fresh & Hot" type="button">🔥 Fresh &amp; Hot</button>
              <button class="tag-btn" data-tag="Salt Issue" type="button">🧂 Salt Issue</button>
              <button class="tag-btn" data-tag="Too Oily" type="button">🛢️ Too Oily</button>
              <button class="tag-btn" data-tag="Cold" type="button">❄️ Cold</button>
              <button class="tag-btn" data-tag="Best Dish" type="button">😋 Best Dish</button>
            </div>
          </div>
        </article>`;
    }).join('');

    // Bind star click & quick tags
    grid.querySelectorAll('.star-btn').forEach(btn => {
      btn.onclick = async () => {
        const dishId = btn.closest('.menu-card').dataset.dishId;
        const star = Number(btn.dataset.star);
        const card = btn.closest('.menu-card');
        const activeTags = [...card.querySelectorAll('.tag-btn.active')].map(t => t.dataset.tag);
        await Store.rateDish(dishId, star, activeTags);
        showToast(`Rated ${star}★ for dish!`, 'success');
        renderMenu();
      };
    });

    grid.querySelectorAll('.tag-btn').forEach(btn => {
      btn.onclick = () => {
        btn.classList.toggle('active');
      };
    });
  }

  // ---------- Zero Food Waste Pre-Check-In (Tab 4) ----------
  function setupWasteSystem() {
    const btnYes = $('#btn-eat-yes');
    const btnNo = $('#btn-eat-no');

    if (btnYes) {
      btnYes.onclick = async () => {
        await Store.setAttendance('eating', activeMealSlot);
        showToast('✓ Marked: You are eating in the mess today!', 'success');
        renderAttendance();
      };
    }

    if (btnNo) {
      btnNo.onclick = async () => {
        await Store.setAttendance('skipping', activeMealSlot);
        showToast('🌱 Marked: Skipping meal recorded. Kitchen portion saved!', 'warn');
        renderAttendance();
      };
    }

    Store.onAttendanceChange(() => {
      if (activeTab === 'waste') renderAttendance();
    });
  }

  function renderAttendance() {
    const list = Store.getAttendance();
    const stats = MQM.calculateAttendance(list);
    const eatEl = $('#att-eat-count');
    const skipEl = $('#att-skip-count');
    const saveEl = $('#att-waste-saved');

    if (eatEl) eatEl.textContent = stats.eating;
    if (skipEl) skipEl.textContent = stats.skipping;
    if (saveEl) saveEl.textContent = `~${stats.wasteReductionEst}%`;
  }

  // ---------- Push Alert Button Setup ----------
  function setupPushAlert() {
    const btn = $('#btn-push-alert');
    if (!btn) return;

    btn.onclick = async () => {
      if ('Notification' in window && Notification.permission !== 'granted') {
        await Notification.requestPermission();
      }
      notifyWhenFree = !notifyWhenFree;
      btn.textContent = notifyWhenFree ? '🔔 Alert ACTIVE: We will chime when free' : '🔔 Alert Me When Free (<50%)';
      btn.classList.toggle('btn-gold', notifyWhenFree);
      showToast(notifyWhenFree ? 'Alert armed! We will notify you when crowd drops below 50%.' : 'Alert disabled.', 'info');
    };
  }

  function tick() {
    const clk = $('#clock');
    if (clk) clk.textContent = MQM.timeLabel();
    if (!data) return;
    const st = data.state;
    const upd = $('#updated');
    if (upd) upd.textContent = 'Counts updated ' + MQM.timeAgo(st.lastCountUpdate);
    const mins = MQM.minutesSince(st.lastCountUpdate);
    const stale = mins > 5 && st.mode !== 'simulation';
    const staleEl = $('#stale-banner');
    if (staleEl) {
      staleEl.hidden = !stale;
      if (stale) staleEl.textContent = `Heads up: counts were last updated ${Math.floor(mins)} min ago and may be out of date.`;
    }
  }

  // ---------- Tri-Lingual (English, Hindi, Kannada) Toggle ----------
  function setupLang() {
    const langOrder = ['en', 'hi', 'kn'];
    let lang = localStorage.getItem('mqm-lang') || 'en';

    const syncLang = () => {
      const btn = $('#student-lang-btn');
      if (btn) {
        if (lang === 'en') btn.textContent = 'EN / हिं / ಕನ್';
        else if (lang === 'hi') btn.textContent = 'हिं / ಕನ್ / EN';
        else btn.textContent = 'ಕನ್ / EN / हिं';
      }

      const rl = $('#rec-label');
      const bn = $('#btn-who-nat');
      const bi = $('#btn-who-int');
      const h1 = $('#st-heading');
      const tabQ = $('#tab-btn-queue');
      const tabD = $('#tab-btn-delivery');
      const tabM = $('#tab-btn-menu');
      const tabW = $('#tab-btn-waste');
      const passBtn = $('#btn-claim-pass');
      const pushBtn = $('#btn-push-alert');
      const eatYes = $('#btn-eat-yes');
      const eatNo = $('#btn-eat-no');

      if (lang === 'kn') {
        if (rl) rl.textContent = 'ನಿಮಗಾಗಿ ಅತ್ಯುತ್ತಮ ಕೌಂಟರ್';
        if (bn) bn.textContent = 'ರಾಷ್ಟ್ರೀಯ ವಿದ್ಯಾರ್ಥಿ';
        if (bi) bi.textContent = 'ಅಂತರರಾಷ್ಟ್ರೀಯ ವಿದ್ಯಾರ್ಥಿ';
        if (h1) h1.innerHTML = 'ಸ್ಮಾರ್ಟ್ ಮೆಸ್ <span>ಸಹಾಯಕ</span>';
        if (tabQ) tabQ.innerHTML = '⚡ ಲೈವ್ ಕ್ಯೂ & ಕೌಂಟರ್';
        if (tabD) tabD.innerHTML = '🛏️ ಕೋಣೆ ಡೆಲಿವರಿ <span class="badge" id="delivery-badge" hidden>1</span>';
        if (tabM) tabM.innerHTML = '⭐ ಇಂದಿನ ಮೆನು & ರೇಟಿಂಗ್';
        if (tabW) tabW.innerHTML = '🌱 ಶೂನ್ಯ ಆಹಾರ ವ್ಯರ್ಥ';
        if (passBtn) passBtn.textContent = '🎫 ಎಕ್ಸ್‌ಪ್ರೆಸ್ ಪಾಸ್ ಪಡೆಯಿರಿ ▶';
        if (pushBtn) pushBtn.textContent = '🔔 ಜನಸಂದಣಿ < 50% ಆದಾಗ ತಿಳಿಸಿ';
        if (eatYes) eatYes.textContent = '🍽️ ನಾನು ಇಂದು ಮೆಸ್‌ನಲ್ಲಿ ಊಟ ಮಾಡುತ್ತೇನೆ';
        if (eatNo) eatNo.textContent = '🚫 ಈ ಊಟವನ್ನು ಬಿಡುತ್ತಿದ್ದೇನೆ';
      } else if (lang === 'hi') {
        if (rl) rl.textContent = 'आपके लिए सबसे तेज़ काउंटर';
        if (bn) bn.textContent = 'नेशनल छात्र';
        if (bi) bi.textContent = 'इंटरनेशनल छात्र';
        if (h1) h1.innerHTML = 'स्मार्ट मेस <span>साथी</span>';
        if (tabQ) tabQ.innerHTML = '⚡ लाइव कतार और काउंटर';
        if (tabD) tabD.innerHTML = '🛏️ रूम डिलीवरी <span class="badge" id="delivery-badge" hidden>1</span>';
        if (tabM) tabM.innerHTML = '⭐ आज का मेनू और रेटिंग';
        if (tabW) tabW.innerHTML = '🌱 ज़ीरो फ़ूड वेस्ट';
        if (passBtn) passBtn.textContent = '🎫 एक्सप्रेस पास प्राप्त करें ▶';
        if (pushBtn) pushBtn.textContent = '🔔 भीड़ < 50% होने पर सूचित करें';
        if (eatYes) eatYes.textContent = '🍽️ मैं आज मेस में खा रहा हूँ';
        if (eatNo) eatNo.textContent = '🚫 भोजन छोड़ रहा हूँ';
      } else {
        if (rl) rl.textContent = 'BEST COUNTER FOR YOU';
        if (bn) bn.textContent = 'National student';
        if (bi) bi.textContent = 'International student';
        if (h1) h1.innerHTML = 'Smart Mess <span>Companion</span>';
        if (tabQ) tabQ.innerHTML = '⚡ LIVE QUEUE &amp; COUNTERS';
        if (tabD) tabD.innerHTML = '🛏️ ROOM DELIVERY <span class="badge" id="delivery-badge" hidden>1</span>';
        if (tabM) tabM.innerHTML = '⭐ TODAY\'S MENU &amp; RATINGS';
        if (tabW) tabW.innerHTML = '🌱 ZERO FOOD WASTE';
        if (passBtn) passBtn.textContent = '🎫 Claim Express Pass ▶';
        if (pushBtn) pushBtn.textContent = '🔔 Alert Me When Free (<50%)';
        if (eatYes) eatYes.textContent = '🍽️ I AM EATING IN MESS';
        if (eatNo) eatNo.textContent = '🚫 SKIPPING THIS MEAL';
      }
    };

    syncLang();
    $('#student-lang-btn')?.addEventListener('click', () => {
      if (window.MQM_I18N) {
        lang = MQM_I18N.cycleLang();
      } else {
        const curIdx = langOrder.indexOf(lang);
        lang = langOrder[(curIdx + 1) % langOrder.length];
        localStorage.setItem('mqm-lang', lang);
      }
      syncLang();
      renderQueue();
    });

    window.addEventListener('mqm-language-changed', (e) => {
      lang = e.detail.lang;
      syncLang();
      renderQueue();
    });
  }

  // ---------- Student Who Toggle (National / International) ----------
  $$('[data-who]').forEach(b => b.addEventListener('click', () => {
    who = b.dataset.who;
    localStorage.setItem('mqm-who', who);
    renderQueue();
  }));

  // ---------- Initialize App ----------
  (async () => {
    initTabs();
    initProfile();
    setupPassSystem();
    setupDeliverySystem();
    setupMenuSystem();
    setupWasteSystem();
    setupPushAlert();
    setupLang();

    await Store.init();
    data = await Store.load();
    renderQueue();

    Store.subscribe(d => {
      data = d;
      renderQueue();
    });

    if (Store.onStatusChange) {
      Store.onStatusChange(st => {
        const off = $('#offline-banner');
        if (off) {
          off.hidden = !st.error;
          if (st.error) off.textContent = st.error;
        }
      });
    }

    setInterval(tick, 1000);
  })();
})();
