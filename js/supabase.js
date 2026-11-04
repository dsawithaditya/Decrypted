/* ====================================================================
   supabase.js: Full-Stack Store & Realtime Client with Supabase v2
   + Automatic LocalStorage & BroadcastChannel Offline Resilience
   Team Decrypted · SE-302A · Jain University Canteen Mess
   ==================================================================== */
(function (root) {
  'use strict';

  // Config can be specified here or retrieved from localStorage
  const DEFAULT_CONFIG = {
    url: localStorage.getItem('mqm-supabase-url') || '',
    anonKey: localStorage.getItem('mqm-supabase-key') || ''
  };

  const KEY = 'mqm-data-v2';
  const KEY_DELIVERIES = 'mqm-deliveries-v2';
  const KEY_MENU = 'mqm-menu-v2';
  const KEY_RATINGS = 'mqm-ratings-v2';
  const KEY_FEEDBACK = 'mqm-feedback-v2';
  const KEY_PASSES = 'mqm-passes-v2';
  const KEY_ATTENDANCE = 'mqm-attendance-v2';
  const KEY_USER = 'mqm-user-v2';

  const listeners = [];
  const statusListeners = [];
  const deliveryListeners = [];
  const menuListeners = [];
  const attendanceListeners = [];

  let client = null;
  let realtimeChannel = null;
  let mode = 'local';
  let connectionStatus = { online: navigator.onLine, error: null, source: 'local' };
  let localChannel = null;

  const clone = o => JSON.parse(JSON.stringify(o));

  // Default menu items for local/offline demo
  const DEFAULT_MENU = [
    { id: 'm1', meal_slot: 'lunch', name: 'Paneer Butter Masala', category: 'Curry / Gravy', dietary_tag: 'Veg · High Protein', availability: 'available', avg_rating: 4.80, ratings_count: 42 },
    { id: 'm2', meal_slot: 'lunch', name: 'Dal Tadka', category: 'Lentils', dietary_tag: 'Veg', availability: 'available', avg_rating: 4.30, ratings_count: 36 },
    { id: 'm3', meal_slot: 'lunch', name: 'Jeera Basmati Rice', category: 'Rice', dietary_tag: 'Veg · Jain Option', availability: 'available', avg_rating: 4.60, ratings_count: 29 },
    { id: 'm4', meal_slot: 'lunch', name: 'Tandoori Roti / Chapati', category: 'Breads', dietary_tag: 'Veg', availability: 'refilling', avg_rating: 4.10, ratings_count: 51 },
    { id: 'm5', meal_slot: 'lunch', name: 'Cucumber Mint Raita', category: 'Sides', dietary_tag: 'Veg', availability: 'available', avg_rating: 4.70, ratings_count: 22 },
    { id: 'm6', meal_slot: 'lunch', name: 'Gulab Jamun (Dessert)', category: 'Sweet', dietary_tag: 'Veg', availability: 'low', avg_rating: 4.90, ratings_count: 68 },
    { id: 'm7', meal_slot: 'breakfast', name: 'Masala Dosa with Sambar', category: 'Breakfast Special', dietary_tag: 'Veg', availability: 'available', avg_rating: 4.85, ratings_count: 95 },
    { id: 'm8', meal_slot: 'breakfast', name: 'Poha with Roasted Peanuts', category: 'Breakfast', dietary_tag: 'Veg', availability: 'available', avg_rating: 4.20, ratings_count: 40 },
    { id: 'm9', meal_slot: 'dinner', name: 'Shahi Paneer & Peas Pulao', category: 'Dinner Special', dietary_tag: 'Veg', availability: 'available', avg_rating: 4.75, ratings_count: 54 },
    { id: 'm10', meal_slot: 'dinner', name: 'Light Sick Diet Khichdi', category: 'Special Diet', dietary_tag: 'Mild / Digestive', availability: 'available', avg_rating: 4.90, ratings_count: 15 }
  ];

  const DEFAULT_DELIVERIES = [
    {
      id: 'del-1',
      student_name: 'Aryan Sharma',
      roll_number: '21BCE1042',
      hostel_block: 'Block B',
      room_number: 'B-312',
      phone: '9876543210',
      reason: 'medical',
      meal_type: 'lunch',
      diet_choice: 'Light Sick Diet (Khichdi + Curd Rice)',
      delivery_mode: 'staff',
      runner_name: 'Ramesh (Mess Runner)',
      otp_code: '4821',
      status: 'out_for_delivery',
      notes: 'High fever (102°F), doctor advised light khichdi.',
      created_at: new Date(Date.now() - 25 * 60000).toISOString()
    },
    {
      id: 'del-2',
      student_name: 'Neha Nair',
      roll_number: '22BIT2031',
      hostel_block: 'Girls Hostel 1',
      room_number: 'GH-108',
      phone: '9811223344',
      reason: 'injury',
      meal_type: 'lunch',
      diet_choice: 'Standard Today Thali',
      delivery_mode: 'peer_buddy',
      runner_name: 'Ananya S (Earns +10 Karma)',
      otp_code: '1937',
      status: 'preparing',
      notes: 'Sprained right ankle during badminton, cannot walk to mess.',
      created_at: new Date(Date.now() - 14 * 60000).toISOString()
    },
    {
      id: 'del-3',
      student_name: 'Rohan Varma',
      roll_number: '20BME0812',
      hostel_block: 'Block A',
      room_number: 'A-404',
      phone: '9988776655',
      reason: 'exam',
      meal_type: 'lunch',
      diet_choice: 'Standard Today Thali',
      delivery_mode: 'staff',
      runner_name: null,
      otp_code: '7502',
      status: 'requested',
      notes: 'Overlapping VLSI laboratory viva until 1:45 PM.',
      created_at: new Date(Date.now() - 5 * 60000).toISOString()
    }
  ];

  function normalize(d) {
    const def = root.MQM ? root.MQM.defaultData() : {
      settings: {},
      state: {},
      counters: {},
      alerts: []
    };
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
    error: 'Offline mode: showing last known cached data'
  }));

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  const Store = {
    get mode() { return mode; },
    get status() { return { ...connectionStatus }; },
    get client() { return client; },

    async init() {
      const cfg = {
        url: window.SUPABASE_CONFIG?.url || DEFAULT_CONFIG.url,
        anonKey: window.SUPABASE_CONFIG?.anonKey || DEFAULT_CONFIG.anonKey
      };

      if (cfg.url && cfg.anonKey) {
        try {
          if (!window.supabase) {
            await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
          }
          if (window.supabase) {
            client = window.supabase.createClient(cfg.url, cfg.anonKey);
            mode = 'supabase';
            setStatus({ online: true, source: 'supabase', error: null });

            // Subscribe to realtime changes
            this.setupSupabaseRealtime();
            return;
          }
        } catch (err) {
          console.warn('Supabase initialization failed, falling back to local storage:', err);
          setStatus({ online: navigator.onLine, source: 'local-fallback', error: 'Connected locally (Supabase keys pending)' });
        }
      }

      // Offline / Local fallback mode
      mode = 'local';
      setStatus({
        online: navigator.onLine,
        source: 'local',
        error: navigator.onLine ? null : 'Offline mode: showing local state'
      });

      if ('BroadcastChannel' in window) {
        try {
          localChannel = new BroadcastChannel('mqm-sync-v2');
          localChannel.onmessage = e => {
            if (e.data && e.data.type === 'mqm-data') emit(e.data.payload);
            if (e.data && e.data.type === 'mqm-deliveries') {
              deliveryListeners.forEach(fn => fn(this.getDeliveries()));
            }
            if (e.data && e.data.type === 'mqm-menu') {
              menuListeners.forEach(fn => fn(this.getMenuItems()));
            }
            if (e.data && e.data.type === 'mqm-attendance') {
              attendanceListeners.forEach(fn => fn(this.getAttendance()));
            }
          };
        } catch (e) { }
      }
    },

    setupSupabaseRealtime() {
      if (!client) return;
      try {
        realtimeChannel = client.channel('mqm-live-channel')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'counters' }, async () => {
            const data = await this.load();
            emit(data);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'mess_state' }, async () => {
            const data = await this.load();
            emit(data);
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'room_deliveries' }, async () => {
            const deliveries = await this.getDeliveries();
            deliveryListeners.forEach(fn => fn(deliveries));
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, async () => {
            const menu = await this.getMenuItems();
            menuListeners.forEach(fn => fn(menu));
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'meal_attendance' }, async () => {
            const att = await this.getAttendance();
            attendanceListeners.forEach(fn => fn(att));
          })
          .subscribe();
      } catch (err) {
        console.warn('Realtime channel subscription error:', err);
      }
    },

    // ---------- Core Queue Data ----------
    async load() {
      if (mode === 'supabase' && client) {
        try {
          const [countersRes, stateRes] = await Promise.all([
            client.from('counters').select('*'),
            client.from('mess_state').select('*').eq('id', 1).single()
          ]);

          if (countersRes.data && stateRes.data) {
            const countersMap = {};
            countersRes.data.forEach(c => {
              countersMap[c.id] = {
                name: c.name,
                type: c.type,
                capacity: c.capacity,
                queueCount: c.queue_count,
                open: c.open,
                soldOut: c.sold_out
              };
            });
            const st = stateRes.data;
            return normalize({
              settings: root.MQM ? root.MQM.DEFAULT_SETTINGS : {},
              state: {
                crossAccess: st.cross_access,
                standbyOpen: st.standby_open,
                manualOverride: st.manual_override,
                alertSent: st.alert_sent,
                mode: st.mode,
                lastAction: st.last_action,
                zoneAvg: Number(st.zone_avg) || 30,
                lastCountUpdate: st.last_count_update,
                lastUpdated: st.last_updated
              },
              counters: countersMap
            });
          }
        } catch (e) {
          console.warn('Error loading from Supabase, reading cached storage:', e);
        }
      }

      // Local storage fallback
      const raw = localStorage.getItem(KEY);
      if (raw) {
        try { return normalize(JSON.parse(raw)); } catch (e) { }
      }
      const d = root.MQM ? root.MQM.defaultData() : {};
      try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) { }
      return d;
    },

    async save(d) {
      const data = normalize(d);
      try { localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { }
      if (localChannel) localChannel.postMessage({ type: 'mqm-data', payload: data });

      if (mode === 'supabase' && client) {
        try {
          const statePayload = {
            cross_access: data.state.crossAccess,
            standby_open: data.state.standbyOpen,
            manual_override: data.state.manualOverride,
            alert_sent: data.state.alertSent,
            mode: data.state.mode,
            last_action: data.state.lastAction,
            zone_avg: data.state.zoneAvg,
            last_count_update: data.state.lastCountUpdate,
            last_updated: data.state.lastUpdated
          };
          await client.from('mess_state').upsert({ id: 1, ...statePayload });

          const counterUpdates = Object.entries(data.counters).map(([id, c]) => ({
            id,
            name: c.name,
            type: c.type,
            capacity: c.capacity,
            queue_count: c.queueCount,
            open: c.open,
            sold_out: c.soldOut,
            updated_at: new Date().toISOString()
          }));
          await client.from('counters').upsert(counterUpdates);
        } catch (err) {
          console.warn('Supabase save error, persisted locally:', err);
        }
      }
    },

    subscribe(fn) {
      listeners.push(fn);
    },

    onStatusChange(fn) {
      statusListeners.push(fn);
      fn({ ...connectionStatus });
    },

    // ---------- Authentication & Profile Management ----------
    getUser() {
      try {
        const raw = localStorage.getItem(KEY_USER);
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    },

    saveUser(user) {
      if (!user) localStorage.removeItem(KEY_USER);
      else localStorage.setItem(KEY_USER, JSON.stringify(user));
    },

    async login(email, password, role = 'student') {
      if (mode === 'supabase' && client) {
        try {
          const { data, error } = await client.auth.signInWithPassword({ email, password });
          if (error) throw error;
          const { data: profile } = await client.from('profiles').select('*').eq('id', data.user.id).single();
          const userObj = {
            id: data.user.id,
            email: data.user.email,
            role: profile?.role || role,
            fullName: profile?.full_name || email.split('@')[0],
            rollNumber: profile?.roll_number || '21BCE1042',
            studentType: profile?.student_type || 'national',
            hostelBlock: profile?.hostel_block || 'Block B',
            roomNumber: profile?.room_number || '312',
            karmaPoints: profile?.karma_points || 0
          };
          this.saveUser(userObj);
          return { success: true, user: userObj };
        } catch (err) {
          console.warn('Supabase login error, checking demo credentials:', err.message);
        }
      }

      // Demo login
      const isStaff = role === 'staff' || email.includes('staff') || password === '1234';
      const demoUser = {
        id: 'usr-' + Date.now(),
        email: email || (isStaff ? 'staff@jainuniversity.ac.in' : 'student@jainuniversity.ac.in'),
        role: isStaff ? 'staff' : 'student',
        fullName: isStaff ? 'Mess In-Charge' : (email.split('@')[0] || 'Aditya Kumar'),
        rollNumber: isStaff ? 'STAFF-01' : '21BCE1042',
        studentType: 'national',
        hostelBlock: 'Block B',
        roomNumber: '312',
        karmaPoints: 40
      };
      this.saveUser(demoUser);
      return { success: true, user: demoUser };
    },

    async logout() {
      if (mode === 'supabase' && client) {
        try { await client.auth.signOut(); } catch (e) { }
      }
      this.saveUser(null);
      sessionStorage.removeItem('mqm-staff-ok');
    },

    async authenticateStaff(pin) {
      if (pin === '1234') {
        const u = this.getUser() || {};
        this.saveUser({ ...u, role: 'staff', fullName: u.fullName || 'Staff Console' });
        return true;
      }
      return false;
    },

    // ---------- Room Deliveries ----------
    getDeliveries() {
      try {
        const raw = localStorage.getItem(KEY_DELIVERIES);
        if (raw) return JSON.parse(raw);
      } catch (e) { }
      localStorage.setItem(KEY_DELIVERIES, JSON.stringify(DEFAULT_DELIVERIES));
      return clone(DEFAULT_DELIVERIES);
    },

    async fetchDeliveries() {
      if (mode === 'supabase' && client) {
        try {
          const { data, error } = await client.from('room_deliveries').select('*').order('created_at', { ascending: false });
          if (!error && data) {
            localStorage.setItem(KEY_DELIVERIES, JSON.stringify(data));
            return data;
          }
        } catch (e) { }
      }
      return this.getDeliveries();
    },

    async createDelivery(del) {
      const full = {
        id: 'del-' + Date.now(),
        student_name: del.student_name || 'Student',
        roll_number: del.roll_number || '21BCE1042',
        hostel_block: del.hostel_block || 'Block B',
        room_number: del.room_number || '312',
        phone: del.phone || '9876543210',
        reason: del.reason || 'medical',
        meal_type: del.meal_type || 'lunch',
        diet_choice: del.diet_choice || 'Standard Today Thali',
        delivery_mode: del.delivery_mode || 'staff',
        runner_name: del.delivery_mode === 'peer_buddy' ? 'Volunteer Peer Student' : null,
        otp_code: String(Math.floor(1000 + Math.random() * 9000)),
        status: 'requested',
        notes: del.notes || '',
        created_at: new Date().toISOString()
      };

      const list = [full, ...this.getDeliveries()];
      localStorage.setItem(KEY_DELIVERIES, JSON.stringify(list));
      if (localChannel) localChannel.postMessage({ type: 'mqm-deliveries' });

      if (mode === 'supabase' && client) {
        try {
          await client.from('room_deliveries').insert(full);
        } catch (e) {
          console.warn('Supabase createDelivery fallback to local:', e);
        }
      }

      deliveryListeners.forEach(fn => fn(list));
      return full;
    },

    async updateDeliveryStatus(id, newStatus, runnerName = null) {
      const list = this.getDeliveries();
      const item = list.find(d => d.id === id);
      if (item) {
        item.status = newStatus;
        if (runnerName) item.runner_name = runnerName;
        localStorage.setItem(KEY_DELIVERIES, JSON.stringify(list));
        if (localChannel) localChannel.postMessage({ type: 'mqm-deliveries' });

        if (mode === 'supabase' && client) {
          try {
            await client.from('room_deliveries').update({
              status: newStatus,
              runner_name: runnerName || item.runner_name
            }).eq('id', id);
          } catch (e) { }
        }

        deliveryListeners.forEach(fn => fn(list));
      }
      return item;
    },

    onDeliveriesChange(fn) {
      deliveryListeners.push(fn);
      fn(this.getDeliveries());
    },

    // ---------- Menu Items & Dish Ratings ----------
    getMenuItems() {
      try {
        const raw = localStorage.getItem(KEY_MENU);
        if (raw) return JSON.parse(raw);
      } catch (e) { }
      localStorage.setItem(KEY_MENU, JSON.stringify(DEFAULT_MENU));
      return clone(DEFAULT_MENU);
    },

    async fetchMenuItems() {
      if (mode === 'supabase' && client) {
        try {
          const { data, error } = await client.from('menu_items').select('*');
          if (!error && data) {
            localStorage.setItem(KEY_MENU, JSON.stringify(data));
            return data;
          }
        } catch (e) { }
      }
      return this.getMenuItems();
    },

    getDishRatings(menuItemId = null) {
      try {
        const raw = localStorage.getItem(KEY_RATINGS);
        const all = raw ? JSON.parse(raw) : [];
        return menuItemId ? all.filter(r => r.menu_item_id === menuItemId) : all;
      } catch (e) {
        return [];
      }
    },

    async rateDish(menuItemId, stars, tags = [], comment = '') {
      const rating = {
        id: 'rate-' + Date.now(),
        menu_item_id: menuItemId,
        student_id: this.getUser()?.id || 'demo-usr',
        student_name: this.getUser()?.fullName || 'Student',
        stars: Number(stars),
        tags: Array.isArray(tags) ? tags : [],
        comment: comment || '',
        created_at: new Date().toISOString()
      };

      const all = [rating, ...this.getDishRatings()];
      localStorage.setItem(KEY_RATINGS, JSON.stringify(all));

      // Recalculate average on menu items
      const menu = this.getMenuItems();
      const item = menu.find(m => m.id === menuItemId);
      if (item) {
        const itemRatings = all.filter(r => r.menu_item_id === menuItemId);
        const sum = itemRatings.reduce((acc, r) => acc + r.stars, 0);
        item.avg_rating = Number((sum / itemRatings.length).toFixed(2));
        item.ratings_count = itemRatings.length;
        localStorage.setItem(KEY_MENU, JSON.stringify(menu));
      }

      if (localChannel) localChannel.postMessage({ type: 'mqm-menu' });

      if (mode === 'supabase' && client) {
        try {
          await client.from('food_ratings').insert(rating);
        } catch (e) { }
      }

      menuListeners.forEach(fn => fn(menu));
      return rating;
    },

    async updateDishAvailability(menuItemId, availability) {
      const menu = this.getMenuItems();
      const item = menu.find(m => m.id === menuItemId);
      if (item) {
        item.availability = availability;
        localStorage.setItem(KEY_MENU, JSON.stringify(menu));
        if (localChannel) localChannel.postMessage({ type: 'mqm-menu' });

        if (mode === 'supabase' && client) {
          try {
            await client.from('menu_items').update({ availability }).eq('id', menuItemId);
          } catch (e) { }
        }

        menuListeners.forEach(fn => fn(menu));
      }
    },

    onMenuChange(fn) {
      menuListeners.push(fn);
      fn(this.getMenuItems());
    },

    // ---------- Overall Mess Feedback ----------
    async submitFeedback(data) {
      const entry = {
        id: 'fb-' + Date.now(),
        hygiene_rating: data.hygiene_rating,
        speed_rating: data.speed_rating,
        overall_rating: data.overall_rating,
        comments: data.comments || '',
        student_name: this.getUser()?.fullName || 'Student',
        created_at: new Date().toISOString()
      };

      const list = JSON.parse(localStorage.getItem(KEY_FEEDBACK) || '[]');
      list.unshift(entry);
      localStorage.setItem(KEY_FEEDBACK, JSON.stringify(list));

      if (mode === 'supabase' && client) {
        try {
          await client.from('mess_feedback').insert(entry);
        } catch (e) { }
      }
      return entry;
    },

    // ---------- Digital Cross-Access Passes ----------
    getPasses() {
      try {
        const raw = localStorage.getItem(KEY_PASSES);
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    },

    async claimCrossAccessPass(counters, state, studentInfo) {
      const pass = root.MQM.issueCrossAccessPass(counters, state, studentInfo);
      if (pass.allowed) {
        const passes = [pass, ...this.getPasses()];
        localStorage.setItem(KEY_PASSES, JSON.stringify(passes));

        if (mode === 'supabase' && client) {
          try {
            await client.from('cross_access_passes').insert({
              assigned_counter_id: pass.counterId,
              assigned_counter_name: pass.counterName,
              token_code: pass.tokenCode,
              expires_at: pass.expiresAt,
              student_name: pass.studentName,
              roll_number: pass.rollNumber,
              status: 'active'
            });
          } catch (e) { }
        }
      }
      return pass;
    },

    // ---------- Meal Attendance (Zero Food Waste) ----------
    getAttendance() {
      try {
        const raw = localStorage.getItem(KEY_ATTENDANCE);
        if (raw) return JSON.parse(raw);
      } catch (e) { }
      // Sample pre-seeded attendance
      const sample = [
        { roll_number: '21BCE101', status: 'eating', meal_slot: 'lunch' },
        { roll_number: '21BCE102', status: 'eating', meal_slot: 'lunch' },
        { roll_number: '21BCE103', status: 'skipping', meal_slot: 'lunch' },
        { roll_number: '21BCE104', status: 'eating', meal_slot: 'lunch' },
        { roll_number: '21BCE105', status: 'skipping', meal_slot: 'lunch' }
      ];
      localStorage.setItem(KEY_ATTENDANCE, JSON.stringify(sample));
      return sample;
    },

    async setAttendance(status, mealSlot = 'lunch', rollNumber = null) {
      const roll = rollNumber || this.getUser()?.rollNumber || 'DEMO-USER';
      const all = this.getAttendance();
      const existing = all.find(a => a.roll_number === roll && a.meal_slot === mealSlot);
      if (existing) {
        existing.status = status;
      } else {
        all.push({ roll_number: roll, status, meal_slot: mealSlot, created_at: new Date().toISOString() });
      }
      localStorage.setItem(KEY_ATTENDANCE, JSON.stringify(all));
      if (localChannel) localChannel.postMessage({ type: 'mqm-attendance' });

      if (mode === 'supabase' && client) {
        try {
          await client.from('meal_attendance').upsert({
            roll_number: roll,
            status,
            meal_slot: mealSlot
          });
        } catch (e) { }
      }

      attendanceListeners.forEach(fn => fn(all));
      return all;
    },

    onAttendanceChange(fn) {
      attendanceListeners.push(fn);
      fn(this.getAttendance());
    }
  };

  root.Store = Store;
})(typeof window !== 'undefined' ? window : globalThis);

