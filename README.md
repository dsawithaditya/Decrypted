# Mess Queue Manager (MQM) · Team Decrypted (SE-302A)

> **Jain (Deemed-to-be University) Canteen Mess System**  
> Computational Thinking as an Engineering Mindset  
> Theme: Deep Navy & Gold Pixel-Modern Arcade

A smart, full-stack, rule-based canteen queue manager, direct-to-room delivery portal, and food quality sentiment system built for Jain University canteen mess.

---

## 🌟 Key Features

### 1. 🎛️ Real-Time Queue & Smart Routing
- **Zone Crowd Calculation**: Computes live average crowd across open National counters.
- **Automated Threshold Rules**:
  - `≥ 45%`: 2-minute early warning alert with audio & vibration chime for kitchen staff.
  - `≥ 50%`: Automatically opens Standby counter.
  - `> 80%`: Cross-access triggers, allowing National students to use International counters.
  - `< 40%`: Hysteresis close: closes standby and resets cross-access only when crowd stabilizes.
- **Smart Overflow Cap (75%)**: Prevents overcrowding at smaller International counters (`c4`, `c5`) during rush hour.
- **Digital Cross-Access Express Pass**: Time-stamped 15-minute token (with QR/code) routing students to the least-crowded International counter.

### 2. 🛏️ Direct-to-Room Mess Food Delivery
- **For Sick, Injured, Quarantined & Exam Students**:
  - Categories: High-priority Medical/Fever, Mobility/Injury, Exam Clash, Quarantine.
  - Diets: Standard Today's Thali, Light Sick Diet (Khichdi, Curd Rice, Boiled Veggies, Soup).
  - Delivery Modes: Mess Staff Runner or Peer Student Volunteer (earns **+10 Mess Karma Points**).
  - **Live 4-Stage Tracker**: `Requested` ➔ `Packed at Counter` ➔ `Out for Delivery` ➔ `Delivered` (with 4-digit OTP security).
- **Staff Dispatch Queue**: Real-time incoming delivery board on `staff.html` with medical priority badge and one-click status progression.

### 3. ⭐ Dish-Level Rating & Kitchen Early-Warning
- **Item-by-Item Rating**: 1–5 stars + instant quick tags (🔥 *Fresh & Hot*, ❄️ *Cold*, 🧂 *Salt Issue*, 🛢️ *Too Oily*, 😋 *Best Dish*).
- **Live Dish Refill Status**: Badges for *Available*, *Refilling in 3m*, and *Running Low*.
- **Automatic Kitchen Alert**: If any dish drops below 2.5★ or receives 3+ cold/salt complaints, kitchen staff receive an immediate warning.
- **Overall Mess Feedback**: Ratings for Hygiene & Cleanliness, Queue Speed, and Staff Courtesy.

### 4. 🍽️ Zero Food Waste Pre-Check-In & Push Alerts
- **Headcount Forecast**: Students tap *"Eating in Mess"* or *"Skipping Next Meal"* up to 1 hour before mealtime so kitchen cooks prepare accurate portions.
- **"Notify Me When Free (<50%)"**: Web Notifications API + audio alert when queue clears.
- **Peak-Hour Rush Forecast**: Interactive rush curve (11:30 AM to 2:30 PM) highlighting the optimal dining window.

### 5. 🔐 Dual-Role Authentication & Full-Stack Supabase Sync
- **Supabase Auth + PostgreSQL + Realtime**: Sub-200ms websocket sync across devices with Row-Level Security (RLS).
- **Offline / Local Demo Fallback**: Uses `localStorage` + `BroadcastChannel` so demos and test suites always run without internet or backend keys.

### 6. 🌐 Tri-Lingual Localization (English / Hindi / Kannada)
- Native regional localization for Jain University (Bangalore, Karnataka):
  - **English (EN)**: Default international campus language.
  - **Hindi (हिन्दी / हिं)**: National student community language.
  - **Kannada (ಕನ್ನಡ / ಕನ್)**: Karnataka state & local canteen staff language.
- Instant 1-click cycle toggle across `index.html`, `student.html`, `staff.html`, and `login.html`, translating live counter recommendations, subtabs, delivery statuses, and meal attendance.

---

## 📁 Project Structure

```text
mess-queue-manager/
├── index.html          # Public landing page with live HUD, rules, flowchart & architecture
├── login.html          # Dual-role Auth portal (Student Profile + Staff Login)
├── student.html        # Student app: Live Queue, Room Delivery, Dish Ratings & Waste Pre-Check-In
├── staff.html          # Staff Console: Queue Control, Simulation, Delivery Dispatch, Kitchen Alerts
├── tests.html          # Automated test runner (T1–T14 logic test suite)
├── css/
│   └── style.css       # Deep Navy + Gold Pixel-Modern Arcade theme & animations
├── js/
│   ├── auth.js         # User session, role gate & profile storage
│   ├── logic.js        # Pure decision rules, overflow caps, pass generator & test suite
│   ├── simulation.js   # 11:30 AM–1:30 PM lunch-rush curve generator
│   ├── staff.js        # Staff console controllers & dispatch queue
│   ├── student.js      # Student view, delivery requester & dish feedback
│   ├── supabase.js     # Unified Store & Realtime sync with local fallback
│   └── ui.js           # UI animations & sound helpers
└── supabase/
    └── schema.sql      # Complete PostgreSQL tables, RLS policies, realtime & seed data
```

---

## 🚀 Getting Started

### Option 1: Run Locally (Offline Demo Mode)
No backend setup is required to test offline! Simply serve the directory with any static file server:

```bash
# Python 3
python -m http.server 8000
```
Then visit:
- **Landing Page**: [http://localhost:8000/index.html](http://localhost:8000/index.html)
- **Student View**: [http://localhost:8000/student.html](http://localhost:8000/student.html)
- **Staff Console**: [http://localhost:8000/staff.html](http://localhost:8000/staff.html) (Default PIN: `1234`)
- **Login Portal**: [http://localhost:8000/login.html](http://localhost:8000/login.html)
- **Logic Tests**: [http://localhost:8000/tests.html](http://localhost:8000/tests.html)

---

### Option 2: Full-Stack Realtime with Supabase

1. Create a free project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard and run the entire script in `supabase/schema.sql`.
3. In `js/supabase.js`, enter your project credentials:
   ```javascript
   const SUPABASE_CONFIG = {
     url: "https://YOUR_PROJECT_ID.supabase.co",
     anonKey: "YOUR_ANON_PUBLIC_KEY"
   };
   ```
4. Deploy the frontend to **GitHub Pages**, **Vercel**, or **Netlify**.
5. Print the QR code generated in `staff.html` and place it at the canteen entrance.

---

## 🧪 Automated Logic Test Suite (T1–T14)

Run `tests.html` or inspect `MQM.runTests()` in the browser console:
- **T1**: Normal crowd (30%) → Normal routing, standby closed.
- **T2**: Early alert (46%) → Early alert to staff, standby closed.
- **T3**: Standby threshold (55%) → Standby counter opens.
- **T4**: Cross-access threshold (85%) → Cross-access ON + Standby opens.
- **T5**: Hysteresis hold (85% → 45%) → Standby & Cross-access remain open.
- **T6**: Hysteresis recovery (38%) → Standby & Cross-access close.
- **T7**: Zero queue (0 people) → 0% crowd, 0 min wait.
- **T8**: All counters > 80% → Least crowded counter chosen.
- **T9**: Capacity 0 → Returns N/A safely without division by zero.
- **T10**: Smart Overflow Cap (75%) → International counter at ≥75% crowd is capped from cross-routing.
- **T11**: Digital Cross-Access Pass → Generates 15-min express token for least-busy international counter.
- **T12**: Delivery Priority Sorting → Medical & Quarantine requests sorted ahead of standard requests.
- **T13**: Kitchen Sentiment Alert → Triggers warning when dish rating < 2.5★ or has ≥3 negative tags.
- **T14**: Zero-Waste Attendance → Calculates headcount forecast from pre-check-in signals.

---

## 👥 Team Decrypted (SE-302A)
- **Aditya Kumar** — Lead & Full-Stack Architecture
- **Ojash Kumar Gupta** — Algorithm, Decision Rules & Logic Tests
- **Charvi Krithika** — Student View & Mobile Experience
- **Kirtee Jain** — Staff Console & Presentation
- **Aman Singh** — Empirical Stopwatch Measurements & Validation
- **Senthil Kumar S** — Student Feedback & Surveys
- **Thulasi Prasadr** — Documentation & Technical Reports
