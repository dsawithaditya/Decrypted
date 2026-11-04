/* =========================================================
   firebase.js: data store with Offline / Error Resilience
   & Firebase Auth support for Staff Writes.
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

  RECOMMENDED FIREBASE DATABASE RULES (Secure Staff Writes):
  {
    "rules": {
      "mqm": {
        ".read": true,
        ".write": "auth != null"
      }
    }
  }
  */

  const KEY = 'mqm-data-v1';
  const DB_PATH = 'mqm';
  const listeners = [];
  const statusListeners = [];
  let mode = 'local', dbRef = null, channel = null;
  let connectionStatus = { online: navigator.onLine, error: null, source: 'local' };

  const clone = o => JSON.parse(JSON.stringify(o));

  function normalize(d) {
    const def = MQM.defaultData();
    if (!d) return def;
    const counters = d.counters || def.counters;
    Object.keys(counters).forEach(k => {
      if (typeof counters[k].soldOut !== 'boolean') counters[k].soldOut = false;
    });
    return {
      settings: { ...def.settings, ...(d.settings || {}) },
      state: { ...def.state, ...(d.state || {}) },
      counters,
      alerts: Array.isArray(d.alerts) ? d.alerts : (d.alerts ? Object.values(d.alerts) : [])
    };
  }

  function emit(d) {
    const clean = normalize(d);
    try { localStorage.setItem(KEY, JSON.stringify(clean)); } catch (e) { }
    listeners.forEach(fn => fn(clone(clean)));
  }

  function setStatus(patch) {
    connectionStatus = { ...connectionStatus, ...patch };
    statusListeners.forEach(fn => fn({ ...connectionStatus }));
  }

  window.addEventListener('online', () => setStatus({ online: true, error: null }));
  window.addEventListener('offline', () => setStatus({
    online: false,
    error: 'Could not connect, showing last known data'
  }));

  function loadScript(src) {
    return new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }

  const Store = {
    get mode() { return mode; },
    get status() { return { ...connectionStatus }; },

    async init() {
      if (FIREBASE_CONFIG) {
        try {
          await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
          await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js');
          await loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-database-compat.js');
          firebase.initializeApp(FIREBASE_CONFIG);
          dbRef = firebase.database().ref(DB_PATH);

          firebase.database().ref('.info/connected').on('value', snap => {
            const connected = snap.val() === true;
            setStatus({
              online: connected && navigator.onLine,
              source: 'firebase',
              error: connected ? null : 'Could not connect, showing last known data'
            });
          });

          const snap = await dbRef.get();
          if (!snap.exists()) await dbRef.set(MQM.defaultData());
          dbRef.on('value', s => emit(normalize(s.val())));
          mode = 'firebase';
          setStatus({ online: true, source: 'firebase', error: null });
          return;
        } catch (e) {
          console.warn('Firebase unreachable, falling back to cached local data.', e);
          setStatus({ online: false, source: 'local-fallback', error: 'Could not connect, showing last known data' });
        }
      }

      mode = 'local';
      setStatus({ online: navigator.onLine, source: 'local', error: navigator.onLine ? null : 'Offline mode: showing last known data' });
      if ('BroadcastChannel' in window) {
        channel = new BroadcastChannel('mqm');
        channel.onmessage = e => emit(normalize(e.data));
      } else {
        window.addEventListener('storage', e => {
          if (e.key === KEY && e.newValue) emit(normalize(JSON.parse(e.newValue)));
        });
      }
    },

    async authenticateStaff(pin) {
      if (mode === 'firebase' && window.firebase && firebase.auth) {
        try {
          await firebase.auth().signInAnonymously();
        } catch (e) {
          console.warn('Firebase anonymous auth failed or not enabled:', e);
        }
      }
      return true;
    },

    async load() {
      if (mode === 'firebase') {
        try {
          const val = (await dbRef.get()).val();
          if (val) return normalize(val);
        } catch (e) {
          setStatus({ online: false, error: 'Could not connect, showing last known data' });
        }
      }
      const raw = localStorage.getItem(KEY);
      if (raw) {
        try { return normalize(JSON.parse(raw)); } catch (e) { /* corrupted, reset */ }
      }
      const d = MQM.defaultData();
      try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { }
      return d;
    },

    async save(d) {
      const data = normalize(d);
      try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { }
      if (channel) channel.postMessage(data);
      if (mode === 'firebase') {
        try {
          await dbRef.set(data);
          setStatus({ online: true, error: null });
        } catch (e) {
          setStatus({ online: false, error: 'Could not save to server, saved locally' });
        }
      }
    },

    subscribe(fn) { listeners.push(fn); },
    onStatusChange(fn) { statusListeners.push(fn); fn({ ...connectionStatus }); }
  };

  window.Store = Store;
})();