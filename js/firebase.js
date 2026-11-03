/* =========================================================
   firebase.js: data store
   LOCAL mode (default): localStorage + BroadcastChannel.
      Syncs tabs on the SAME device. Good for the demo.
   FIREBASE mode: paste your config below and every phone
      updates live.
   ========================================================= */
(function () {
  'use strict';

  const FIREBASE_CONFIG = null;
  /* Example:
  const FIREBASE_CONFIG = {
    apiKey: "YOUR_KEY",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "your-project",
    appId: "YOUR_APP_ID"
  };
  */

  const KEY = 'mqm-data-v1';
  const DB_PATH = 'mqm';
  const listeners = [];
  let mode = 'local', dbRef = null, channel = null;

  const clone = o => JSON.parse(JSON.stringify(o));

  function normalize(d) {
    const def = MQM.defaultData();
    if (!d) return def;
    return {
      settings: { ...def.settings, ...(d.settings || {}) },
      state: { ...def.state, ...(d.state || {}) },
      counters: d.counters || def.counters,
      alerts: Array.isArray(d.alerts) ? d.alerts : (d.alerts ? Object.values(d.alerts) : [])
    };
  }
  function emit(d) { listeners.forEach(fn => fn(clone(d))); }
  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  const Store = {
    get mode() { return mode; },

    async init() {
      if (FIREBASE_CONFIG) {
        try {
          await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
          await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js');
          firebase.initializeApp(FIREBASE_CONFIG);
          dbRef = firebase.database().ref(DB_PATH);
          const snap = await dbRef.get();
          if (!snap.exists()) await dbRef.set(MQM.defaultData());
          dbRef.on('value', s => emit(normalize(s.val())));
          mode = 'firebase';
          return;
        } catch (e) {
          console.warn('Firebase failed, falling back to local mode.', e);
        }
      }
      mode = 'local';
      if ('BroadcastChannel' in window) {
        channel = new BroadcastChannel('mqm');
        channel.onmessage = e => emit(normalize(e.data));
      } else {
        window.addEventListener('storage', e => {
          if (e.key === KEY && e.newValue) emit(normalize(JSON.parse(e.newValue)));
        });
      }
    },

    async load() {
      if (mode === 'firebase') return normalize((await dbRef.get()).val());
      const raw = localStorage.getItem(KEY);
      if (raw) { try { return normalize(JSON.parse(raw)); } catch (e) { /* corrupted, reset */ } }
      const d = MQM.defaultData();
      localStorage.setItem(KEY, JSON.stringify(d));
      return d;
    },

    async save(d) {
      const data = normalize(d);
      if (mode === 'firebase') { await dbRef.set(data); return; }
      localStorage.setItem(KEY, JSON.stringify(data));
      if (channel) channel.postMessage(data);
    },

    subscribe(fn) { listeners.push(fn); }
  };

  window.Store = Store;
})();
