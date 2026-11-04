/**
 * Mess Queue Manager (MQM) - Full Trilingual Localization (English / Hindi / Kannada)
 * High-fidelity, comprehensive localization covering all pages, components, modals, and guides.
 */
(function (global) {
  'use strict';

  const LANG_ORDER = ['en', 'hi', 'kn'];
  const STORAGE_KEY = 'mqm-lang';

  const DICT = {
    en: {
      // Common Navigation
      nav_home: 'Home',
      nav_student_link: 'Student',
      nav_staff_link: 'Staff',
      nav_about: 'About',
      nav_help: 'Help',
      nav_tests: 'Tests',
      nav_student_view: 'Student View',
      nav_staff_view: 'Staff Console',
      nav_signin: 'Sign In ▶',
      nav_profile: 'Profile',
      nav_exit: 'Exit / Lock',

      // Home Page (index.html)
      hero_eyebrow: 'CAMPUS CANTEEN · SMART QUEUE SYSTEM',
      hero_title: 'Smart Mess Queue Manager',
      hero_sub: 'Real-time line sizes, fastest counter routing, direct-to-room delivery, dish-by-dish quality ratings, and zero food waste.',
      btn_find_fastest: '⚡ Find Fastest Counter ▶',
      btn_room_delivery: '🛏️ Room Delivery',
      btn_rate_menu: '⭐ Rate Today\'s Food',
      btn_staff_console: 'Staff Console ↗',

      hud_active_counters: 'ACTIVE COUNTERS',
      hud_active_count: '4 / 4 Operating',
      hud_peak_wait: 'PEAK WAIT TIME',
      hud_peak_mins: '4.2 mins',
      hud_peak_sub: '-63% vs Manual Queue',
      hud_standby: 'STANDBY COUNTER',
      hud_standby_status: 'Auto Ready (50% Trigger)',
      hud_zone_crowd: 'ZONE CROWD',
      hud_zone_routing: 'Below 40%: Normal Routing',

      sec_core_title: 'Built for Jain University Mess',
      sec_core_sub: 'Four algorithmic pillars solving campus dining congestion and food wastage in hostel dining halls.',
      
      feat_cross_title: 'SMART CROSS-ACCESS (80% / 75%)',
      feat_cross_desc: 'Dynamic overflow balancing automatically routes domestic diners to International counters when crowd exceeds 80%, protected by a strict 75% overflow ceiling.',
      feat_cross_tag: 'ZERO BOTTLENECKS',

      feat_deliv_title: 'DIRECT-TO-ROOM SICK MEALS',
      feat_deliv_desc: 'High fever or mobility injury? Order convalescent light diets (Khichdi/Soup) directly to hostel rooms, secured by unique 4-digit OTPs and peer volunteers.',
      feat_deliv_tag: 'HOSTEL HEALTHCARE',

      feat_rating_title: 'DISH RATINGS & SENTIMENT',
      feat_rating_desc: 'Rate individual dishes 1-5★ with instant complaint tags (Too Salty, Cold, Undercooked). Automatic kitchen alerts trigger when a dish falls below 2.5★.',
      feat_rating_tag: 'QUALITY ASSURANCE',

      feat_waste_title: 'ZERO FOOD WASTE ATTENDANCE',
      feat_waste_desc: 'Pre-check in "Eating Here" or "Skipping Meal" before kitchen prep cutoffs. Real-time headcount forecasting prevents massive over-cooking.',
      feat_waste_tag: 'SUSTAINABLE CAMPUS',

      sim_card_title: 'DYNAMIC HYSTERESIS RULE DEMO',
      sim_card_sub: 'Test how the 40% / 45% / 50% / 80% decision engine responds in real time:',
      sim_btn_normal: '30% Normal (<40%)',
      sim_btn_alert: '46% Staff Alert (≥45%)',
      sim_btn_standby: '55% Standby (≥50%)',
      sim_btn_cross: '85% Cross Access (>80%)',

      qr_sec_title: 'CANTEEN ENTRANCE QR',
      qr_sec_desc: 'Stick this code at the dining hall entrance. Students scan with any smartphone camera to see live wait times, claim express passes, or order room delivery.',
      qr_url_label: 'Online Link:',
      qr_scan_action: 'Scan to launch mobile portal',

      test_pass_title: '14/14 UNIT TESTS VERIFIED',
      test_pass_desc: 'All queue routing, 75% overflow ceilings, priority room sorting, and early kitchen alert rules passed.',
      test_run_link: 'Run Interactive Test Suite ↗',

      footer_tagline: 'Smart Mess Queue Manager · Jain (Deemed-to-be University)',
      footer_academic: 'Computational Thinking as an Engineering Mindset (IPS SE-302A)',
      footer_rights: 'Mess Queue Manager. All rights reserved.',

      // Help Page Headers & Eyebrows
      help_tag: 'SUPPORT & DOCUMENTATION',
      help_h1: 'Help & <span>User Guide</span>',
      help_hero_sub: 'Everything you need to know about checking queue times, claiming express passes, ordering room food delivery, and managing mess operations.',
      h_eyebrow1: '01 · Student Guide',
      h_sec1_title: 'Using the <span>Student Portal</span>',
      h_eyebrow2: '02 · Staff Operations',
      h_sec2_title: 'Operating the <span>Staff Console</span>',
      
      // Help Page Student Cards
      h_card1_title: 'FINDING THE BEST COUNTER',
      h_card1_desc: 'Open the Student View on your phone. The gold banner at the top automatically points you to the open counter with the lowest wait time.',
      h_card2_title: 'CROSS-ACCESS EXPRESS PASS',
      h_card2_desc: 'When national lines exceed 80%, a glowing banner appears. Tap Claim Express Pass to get a 15-minute token routing you to the least crowded International counter.',
      h_card3_title: '"NOTIFY ME WHEN FREE"',
      h_card3_desc: 'Studying in your hostel room? Tap the alert button to receive an audio chime and notification when mess crowd drops below 50%.',
      h_card4_title: 'DIRECT-TO-ROOM DELIVERY',
      h_card4_desc: 'If you have a high fever, mobility injury, or quarantine, fill out the Room Delivery form. Select Light Sick Diet (Khichdi/Soup) or Standard Thali.',
      h_card5_title: '4-DIGIT SECURITY OTP',
      h_card5_desc: 'Each delivery generates a unique 4-digit OTP. Keep it on your screen and share it with the runner when your food arrives to verify delivery.',
      h_card6_title: 'EARNING KARMA POINTS',
      h_card6_desc: 'Volunteer as a Hostel Peer Buddy to carry a meal box to an unwell student in your hostel block and earn +10 Mess Karma Points.',

      // Help Page Staff Cards
      h_card7_title: 'STAFF ACCESS',
      h_card7_desc: 'Open the Staff Console from the navbar. Enter default staff PIN 1234 or sign in with your staff email address.',
      h_card8_title: 'QUEUE CONTROLS',
      h_card8_desc: 'Adjust line sizes using sliders or + / − buttons. Check the Sold Out box to immediately divert students from counters that have run out of food.',
      h_card9_title: 'KITCHEN EARLY WARNING',
      h_card9_desc: 'If any dish rating falls below 2.5★ or receives 3+ complaint tags (Cold, Salt Issue), an automatic red alert sounds so chefs can correct the recipe.',

      // About Page Detailed Texts
      abt_tag: 'RESEARCH & ENGINEERING AUDIT',
      abt_page_title: 'About <span>Mess Queue Manager</span>',
      abt_prob_eyebrow: '01 · Problem Statement',
      abt_prob_title: 'Long lines. <span>Empty counters.</span>',
      abt_prob_lead: 'During peak lunch rush (12:15 PM – 1:15 PM), the Jain University mess counters suffered from heavy queuing bottlenecks. National food counters had queues stretching 15–20 students deep, while adjacent international counters sat largely underutilized.',
      abt_c1_title: 'THE CROWD IMBALANCE',
      abt_c1_desc: 'National counters (Counters 1–3) were consistently above 90% capacity, while International counters (Counters 4–5) stayed below 20% capacity.',
      abt_c2_title: 'LACK OF ADVANCE WARNING',
      abt_c2_desc: 'Canteen kitchen staff were caught off guard when lines suddenly spiked, delaying the opening of backup standby counters by 6–10 minutes.',
      abt_c3_title: 'STUDENT VISIBILITY DEFICIT',
      abt_c3_desc: 'Students walking in had no way of knowing which counter was fastest before committing to a 10+ minute queue.',
      abt_p_eyebrow: '02 · Engineering Mindset',
      abt_p_title: 'The Four <span>Pillars</span>',
      abt_p_lead: 'How we applied core computational thinking principles to engineer an automated, robust queue balancing system.',
      abt_h_eyebrow: '03 · Threshold Logic',
      abt_h_title: 'Rules with <span>Hysteresis</span>',
      abt_h_lead: 'Rules execute on the average crowd of open, available National counters to decide automated actions:',
      abt_t45_title: 'EARLY ALERT',
      abt_t45_desc: 'Triggers audio beep and vibration alert to staff. Kitchen prepares the standby counter with a 2-minute head start.',
      abt_t45_who: 'STAFF ALERT',
      abt_t50_title: 'STANDBY COUNTER',
      abt_t50_desc: 'Standby opens automatically when National zone crowd hits 50%, providing an instant relief valve before queues compound.',
      abt_t50_who: 'STANDBY OPEN',
      abt_t80_title: 'CROSS-ACCESS ON',
      abt_t80_desc: 'Crowd > 80% unlocks International counters for National students with digital 15-minute express passes, capped strictly at 75%.',
      abt_t80_who: 'CROSS-ACCESS ON',
      abt_t40_title: 'STABLE RESET',
      abt_t40_desc: 'Standby closes and cross-access resets ONLY when crowd drops below 40%. The 40-45% deadband prevents state flapping.',
      abt_t40_who: 'STABLE RESET',
      abt_r_eyebrow: '04 · Measured Results',
      abt_team_eyebrow: '05 · Project Team',


      // About Page (about.html)
      abt_eyebrow: 'ACADEMIC RESEARCH & REPORT',
      abt_title: 'The Science Behind <span>MQM</span>',
      abt_sub: 'Transforming campus dining through Computational Thinking: Decomposition, Pattern Recognition, Abstraction, and Algorithmic Thinking.',
      
      abt_ctx_title: 'ACADEMIC CONTEXT',
      abt_ctx_course: 'Course: Computational Thinking as an Engineering Mindset (IPS SE-302A)',
      abt_ctx_fac: 'Faculty Mentor: Dr. Sujithra',
      abt_ctx_inst: 'Institution: Jain (Deemed-to-be University)',
      abt_ctx_prob: 'The Problem: 600+ students rush dining halls within a 45-minute window. Single-point bottlenecks create 15-minute wait times while secondary counters sit half-idle.',

      abt_p1_title: 'DECOMPOSITION',
      abt_p1_desc: 'Breaking down dining hall chaos into independent variables: physical arrival rates, serving speed, distinct dietary zones, and runner availability.',
      abt_p1_who: 'BREAKING PROBLEMS DOWN',

      abt_p2_title: 'PATTERN RECOGNITION',
      abt_p2_desc: 'Identifying that National counters choke at 1:15 PM while International counters remain at 35% capacity, creating an ideal cross-access opportunity.',
      abt_p2_who: 'SPOTTING TRENDS',

      abt_p3_title: 'ABSTRACTION',
      abt_p3_desc: 'Filtering out noise (individual names, plate sizes) to isolate essential control levers: queue length, service rate, and zone percentage.',
      abt_p3_who: 'FOCUSING ON WHAT MATTERS',

      abt_p4_title: 'ALGORITHMIC THINKING',
      abt_p4_desc: 'Designing a hysteresis-driven state machine with 40/45/50/80 thresholds and a 75% cap to prevent line flapping and guarantee safety.',
      abt_p4_who: 'STEP-BY-STEP SOLUTION',

      abt_steps_title: 'STEP-BY-STEP ALGORITHM',
      abt_s1: '1. Read queue counts from all active counters.',
      abt_s2: '2. Compute crowd %: queue / capacity × 100.',
      abt_s3: '3. Compute wait time: queue × 30s / 60.',
      abt_s4: '4. Compute average crowd across National counters.',
      abt_s5: '5. If zone > 80%: Turn ON Cross-Access (cap int counters at 75%).',
      abt_s6: '6. Else if zone ≥ 50%: Open Standby counter.',
      abt_s7: '7. Else if zone ≥ 45%: Trigger 2-minute staff alert.',
      abt_s8: '8. Else if zone < 40%: Close standby and reset cross-access.',
      abt_s9: '9. Pick best counter with lowest wait and update student views.',

      abt_flowchart_title: 'DECISION FLOWCHART',
      abt_res_title: 'MEASURED RESULTS',
      abt_res_sub: 'Empirical stopwatch verification conducted during lunch hours at Jain University Canteen.',
      abt_r1_lbl: 'PEAK WAIT TIME',
      abt_r1_val: '4.2 min',
      abt_r1_sub: '-63% reduction (down from 11.5 min)',
      abt_r2_lbl: 'MAX QUEUE GAP',
      abt_r2_val: '3 students',
      abt_r2_sub: 'Down from 14 (load balanced)',
      abt_r3_lbl: 'STANDBY SPEED',
      abt_r3_val: '1.4 min',
      abt_r3_sub: 'Prompt response to early 45% notice',

      abt_team_title: 'TEAM DECRYPTED',
      abt_team_sub: 'The engineering team behind the Smart Mess Queue Manager project.',

      // Help Page (help.html)
      help_eyebrow: 'USER GUIDE & SUPPORT',
      help_title: 'How to Use <span>MQM</span>',
      help_sub: 'Complete instructions for students, hostel residents, peer volunteers, and canteen staff.',
      
      h_sec1_title: 'Student & Hostel Guide',
      h_card1_title: 'FINDING THE FASTEST LINE',
      h_card1_desc: 'Check the real-time queue status before walking to the dining hall. The system automatically recommends the counter with the shortest estimated wait time.',
      
      h_card2_title: 'DIGITAL EXPRESS PASSES',
      h_card2_desc: 'When domestic counters exceed 80% capacity, tap "Claim Express Pass". You receive a valid 15-minute digital pass to use International Counter 1 or 2.',
      
      h_card3_title: '"NOTIFY ME WHEN FREE"',
      h_card3_desc: 'Studying in your hostel room? Tap the alert button to receive an audio chime and notification when mess crowd drops below 50%.',
      
      h_card4_title: 'DIRECT-TO-ROOM DELIVERY',
      h_card4_desc: 'If you have a high fever, mobility injury, or quarantine, fill out the Room Delivery form. Select Light Sick Diet (Khichdi/Soup) or Standard Thali.',
      
      h_card5_title: '4-DIGIT SECURITY OTP',
      h_card5_desc: 'Each delivery generates a unique 4-digit OTP. Keep it on your screen and share it with the runner when your food arrives to verify delivery.',
      
      h_card6_title: 'EARNING KARMA POINTS',
      h_card6_desc: 'Volunteer as a Hostel Peer Buddy to carry a meal box to an unwell student in your hostel block and earn +10 Mess Karma Points.',

      h_sec2_title: 'Staff Operations',
      h_card7_title: 'STAFF ACCESS',
      h_card7_desc: 'Open the Staff Console from the navbar. Enter default staff PIN 1234 or sign in with your staff email address.',
      
      h_card8_title: 'QUEUE CONTROLS',
      h_card8_desc: 'Adjust line sizes using sliders or + / − buttons. Check the Sold Out box to immediately divert students from counters that have run out of food.',
      
      h_card9_title: 'KITCHEN EARLY WARNING',
      h_card9_desc: 'If any dish rating falls below 2.5★ or receives 3+ complaint tags (Cold, Salt Issue), an automatic red alert sounds so chefs can correct the recipe.',

      // Directory in Help Page
      h_dir_eyebrow: '03 · CONTACT DIRECTORY',
      h_dir_title: 'Mess Staff & Emergency Contacts',
      h_dir_sub: 'Direct phone lines for canteen supervisors, head warden, health centre, and dispatch.',
      
      // FAQ in Help Page
      h_faq_eyebrow: '04 · COMMON QUESTIONS',
      h_faq_title: 'Frequently Asked Questions',
      faq_q1: 'Why does the Standby counter open at 50% instead of 80%?',
      faq_a1: 'Opening standby at 50% crowd provides an early buffer before lines back up into the dining hall. By preparing at 45% and opening at 50%, queues never reach dangerous congestion levels.',
      faq_q2: 'What is the 75% cap on Cross-Access?',
      faq_a2: 'When National diners are permitted to use International counters, the system strictly caps International queue capacity at 75%. This guarantees that International residents always have guaranteed access without being crowded out.',
      faq_q3: 'Can I order Room Delivery if I am not sick?',
      faq_a3: 'Room delivery is reserved for students with fever, injuries, or medical quarantine. Unverified requests may be deprioritized by the mess warden during peak hours.',
      faq_q4: 'How does offline fallback work if Wi-Fi drops?',
      faq_a4: 'MQM saves all counter state, delivery requests, and attendance in your browser\'s local database and syncs across tabs via BroadcastChannel. When internet restores, updates sync smoothly.',
      faq_q5: 'How do I switch the language to Kannada or Hindi?',
      faq_a5: 'Click the EN / हिं / ಕನ್ button located in the top navigation bar. It cycles smoothly between English, Hindi, and Kannada on all screens.',

      // Student View (student.html)
      st_title: 'Smart Mess Companion',
      st_rec_label: 'BEST COUNTER FOR YOU',
      st_btn_nat: 'National Student',
      st_btn_int: 'International Student',
      st_tab_queue: '⚡ Live Queue & Counters',
      st_tab_delivery: '🛏️ Room Delivery',
      st_tab_menu: '⭐ Today\'s Menu & Ratings',
      st_tab_waste: '🌱 Zero Food Waste',
      st_claim_pass: '🎫 Claim Express Pass ▶',
      st_push_alert: '🔔 Notify Me When Crowd < 50%',
      st_order_title: 'Order Sick / Convalescent Meal to Room',
      st_order_sub: 'Meal boxes delivered to hostel doors for students with fever or mobility injuries.',
      st_lbl_room: 'Hostel Block & Room No.',
      st_lbl_reason: 'Reason for Delivery',
      st_lbl_diet: 'Diet Preference',
      st_opt_khichdi: 'Light Convalescent Diet (Khichdi + Curd + Warm Soup)',
      st_opt_thali: 'Standard Canteen Thali',
      st_opt_fever: 'High Fever / Flu / Viral Illness',
      st_opt_injury: 'Physical Mobility Injury (Sprain / Fracture)',
      st_opt_isolated: 'Medical Quarantine / Contagious',
      st_btn_request: '🚀 Request Room Delivery',
      st_active_deliveries: 'YOUR RECENT DELIVERY REQUESTS',
      st_volunteer_card: 'VOLUNTEER AS A PEER BUDDY',
      st_volunteer_sub: 'Carry a meal box to an unwell student in your hostel block and earn +10 Mess Karma points.',
      st_rate_heading: 'Today\'s Menu & Food Quality Sentiment',
      st_rate_sub: 'Real-time student ratings trigger early kitchen warnings to ensure delicious, fresh meals.',
      st_waste_heading: 'Zero Food Waste Pre-Check-In',
      st_waste_sub: 'Let the kitchen know before cooking starts. Your headcount forecast prevents campus food wastage.',
      st_eat_yes: '🍽️ I am eating at mess today',
      st_eat_no: '🚫 Skipping this meal',

      // Staff View (staff.html)
      staff_title: 'Canteen Staff Console',
      staff_tab_queue: '🎛️ QUEUE & COUNTERS',
      staff_tab_dispatch: '🛏️ ROOM DELIVERIES',
      staff_tab_kitchen: '🍳 KITCHEN & DISH SENTIMENT',
      staff_tab_waste: '🌱 ATTENDANCE FORECAST',
      staff_tab_admin: '⚙️ SETTINGS & QR',
      staff_zone_crowd: 'ZONE CROWD (NATIONAL AVG)',
      staff_counter_state: 'COUNTER STATE & OVERRIDES',
      staff_btn_open: 'Open standby',
      staff_btn_close: 'Close standby',
      staff_btn_force: 'Force Cross-Access',
      staff_btn_auto: 'Reset to Auto',
      staff_canteen_qr: 'CANTEEN ENTRANCE QR CODE',
      staff_qr_desc: 'Print this code and stick it at the canteen entrance. Students scan to open:'
    },

    hi: {
      // Common Navigation
      nav_home: 'होम',
      nav_student_link: 'छात्र',
      nav_staff_link: 'स्टाफ',
      nav_about: 'के बारे में',
      nav_help: 'मदद',
      nav_tests: 'टेस्ट',
      nav_student_view: 'छात्र दृश्य',
      nav_staff_view: 'स्टाफ कंसोल',
      nav_signin: 'साइन इन ▶',
      nav_profile: 'प्रोफ़ाइल',
      nav_exit: 'लॉगआउट',

      // Home Page (index.html)
      hero_eyebrow: 'कैंपस कैंटीन · स्मार्ट कतार प्रणाली',
      hero_title: 'स्मार्ट मेस कतार प्रबंधक',
      hero_sub: 'वास्तविक समय में कतार, सबसे तेज़ काउंटर सुझाव, सीधे कमरे में भोजन वितरण, भोजन रेटिंग और शून्य खाद्य बर्बादी।',
      btn_find_fastest: '⚡ सबसे तेज़ काउंटर खोजें ▶',
      btn_room_delivery: '🛏️ रूम डिलीवरी',
      btn_rate_menu: '⭐ आज का खाना रेट करें',
      btn_staff_console: 'स्टाफ कंसोल ↗',

      hud_active_counters: 'सक्रिय काउंटर',
      hud_active_count: '4 / 4 चालू',
      hud_peak_wait: 'अधिकतम प्रतीक्षा',
      hud_peak_mins: '4.2 मिनट',
      hud_peak_sub: 'सामान्य कतार से -63% कम',
      hud_standby: 'स्टैंडबाय काउंटर',
      hud_standby_status: 'ऑटो रेडी (50% ट्रिगर)',
      hud_zone_crowd: 'ज़ोन भीड़',
      hud_zone_routing: '40% से नीचे: सामान्य रूटिंग',

      sec_core_title: 'जैन यूनिवर्सिटी मेस के लिए निर्मित',
      sec_core_sub: 'परिसर में भोजन की भीड़ और बर्बादी को पूरी तरह खत्म करने वाले चार मुख्य तकनीकी स्तंभ।',
      
      feat_cross_title: 'स्मार्ट क्रॉस-एक्सेस (80% / 75%)',
      feat_cross_desc: 'जब नेशनल काउंटर पर भीड़ 80% से अधिक हो जाती है, तो छात्रों को इंटरनेशनल काउंटर पर भेजा जाता है, जो 75% सीमा से सुरक्षित है।',
      feat_cross_tag: 'भीड़ मुक्त कतारें',

      feat_deliv_title: 'कमरे में अस्वस्थ भोजन डिलीवरी',
      feat_deliv_desc: 'तेज़ बुखार या चोट है? हॉस्टल के कमरे में खिचड़ी/सूप मंगवाएं, 4-अंकीय सुरक्षित ओटीपी और छात्र स्वयंसेवकों की सहायता से।',
      feat_deliv_tag: 'हॉस्टल स्वास्थ्य सेवा',

      feat_rating_title: 'व्यंजन रेटिंग और फीडबैक',
      feat_rating_desc: 'व्यंजनों को 1-5★ रेटिंग दें। 2.5★ से कम रेटिंग मिलने पर रसोई को तुरंत सुधार अलर्ट जाता है ताकि स्वाद और गुणवत्ता बनी रहे।',
      feat_rating_tag: 'गुणवत्ता आश्वासन',

      feat_waste_title: 'शून्य खाद्य बर्बादी उपस्थिति',
      feat_waste_desc: 'खाना बनने से पहले "खा रहे हैं" या "छोड़ रहे हैं" बताएं। वास्तविक उपस्थिति पूर्वानुमान भोजन की बर्बादी को पूरी तरह रोकता है।',
      feat_waste_tag: 'सतत कैंपस',

      sim_card_title: 'डायनामिक हिस्टेरेसिस नियम डेमो',
      sim_card_sub: 'परीक्षण करें कि 40% / 45% / 50% / 80% निर्णय प्रणाली वास्तविक समय में कैसे काम करती है:',
      sim_btn_normal: '30% सामान्य (<40%)',
      sim_btn_alert: '46% स्टाफ अलर्ट (≥45%)',
      sim_btn_standby: '55% स्टैंडबाय खोलें (≥50%)',
      sim_btn_cross: '85% क्रॉस-एक्सेस (>80%)',

      qr_sec_title: 'कैंटीन प्रवेश द्वार QR',
      qr_sec_desc: 'इस कोड को मेस के प्रवेश द्वार पर लगाएं। छात्र लाइव कतार देखने, पास प्राप्त करने या डिलीवरी के लिए अपने स्मार्टफोन से स्कैन कर सकते हैं।',
      qr_url_label: 'ऑनलाइन लिंक:',
      qr_scan_action: 'मोबाइल पोर्टल खोलने के लिए स्कैन करें',

      test_pass_title: '14/14 यूनिट टेस्ट सत्यापित',
      test_pass_desc: 'कतार रूटिंग, 75% सीमा, प्राथमिकता रूम डिलीवरी और किचन अलर्ट के सभी 14 नियम 100% सफल।',
      test_run_link: 'इंटरैक्टिव टेस्ट सुइट चलाएं ↗',

      footer_tagline: 'स्मार्ट मेस कतार प्रबंधक · जैन (मानित विश्वविद्यालय)',
      footer_academic: 'कम्प्यूटेशनल सोच इंजीनियरिंग मानसिकता (IPS SE-302A)',
      footer_rights: 'मेस कतार प्रबंधक। सर्वाधिकार सुरक्षित।',

      // Help Page Headers & Eyebrows
      help_tag: 'सहायता एवं दस्तावेज़',
      help_h1: 'मदद एवं <span>उपयोगकर्ता गाइड</span>',
      help_hero_sub: 'कतार समय की जांच, एक्सप्रेस पास, सीधे कमरे में भोजन डिलीवरी और मेस संचालन के बारे में संपूर्ण जानकारी।',
      h_eyebrow1: '01 · छात्र गाइड',
      h_sec1_title: '<span>छात्र पोर्टल</span> का उपयोग',
      h_eyebrow2: '02 · स्टाफ संचालन',
      h_sec2_title: '<span>स्टाफ कंसोल</span> का संचालन',
      
      // Help Page Student Cards
      h_card1_title: 'सबसे तेज़ काउंटर खोजना',
      h_card1_desc: 'अपने फोन पर छात्र पोर्टल खोलें। शीर्ष पर लगा स्वर्ण बैनर अपने आप सबसे कम प्रतीक्षा समय वाले काउंटर का सुझाव देता है।',
      h_card2_title: 'क्रॉस-एक्सेस एक्सप्रेस पास',
      h_card2_desc: 'जब नेशनल लाइन में 80% से अधिक भीड़ हो, तो "एक्सप्रेस पास प्राप्त करें" पर टैप करें और 15 मिनट का इंटरनेशनल पास प्राप्त करें।',
      h_card3_title: '"भीड़ कम होने पर बताएं"',
      h_card3_desc: 'हॉस्टल कमरे में पढ़ाई कर रहे हैं? अलर्ट बटन दबाएं और भीड़ 50% से कम होने पर ऑडियो सूचना प्राप्त करें।',
      h_card4_title: 'सीधे कमरे में डिलीवरी',
      h_card4_desc: 'यदि बुखार या चोट है, तो रूम डिलीवरी फॉर्म भरें। हल्का सुपाच्य भोजन (खिचड़ी/सूप) या थाली चुनें।',
      h_card5_title: '4-अंकीय सुरक्षा ओटीपी',
      h_card5_desc: 'प्रत्येक डिलीवरी पर 4-अंकीय ओटीपी मिलता है। भोजन पहुंचने पर रनर को यह कोड दिखाकर भोजन प्राप्त करें।',
      h_card6_title: 'मेस कर्मा पॉइंट्स अर्जित करें',
      h_card6_desc: 'हॉस्टल पियर बडी बनें और किसी बीमार सहपाठी को भोजन पहुंचाकर +10 मेस कर्मा अंक प्राप्त करें।',

      // Help Page Staff Cards
      h_card7_title: 'स्टाफ एक्सेस',
      h_card7_desc: 'नेवबार से स्टाफ कंसोल खोलें। डिफ़ॉल्ट पिन 1234 दर्ज करें या स्टाफ ईमेल आईडी से लॉगिन करें।',
      h_card8_title: 'कतार नियंत्रण',
      h_card8_desc: 'स्लाइडर या + / − बटनों से कतार नियंत्रित करें। भोजन समाप्त होने पर सोल्ड आउट मार्क करें।',
      h_card9_title: 'रसोई पूर्व चेतावनी',
      h_card9_desc: 'व्यंजन रेटिंग 2.5★ से कम होने पर रसोई में लाल चेतावनी बजती है ताकि रसोइये तुरंत सुधार कर सकें।',

      // About Page Detailed Texts
      abt_tag: 'शोध एवं इंजीनियरिंग ऑडिट',
      abt_page_title: '<span>मेस कतार प्रबंधक</span> के बारे में',
      abt_prob_eyebrow: '01 · समस्या विवरण',
      abt_prob_title: 'लंबी कतारें। <span>खाली काउंटर।</span>',
      abt_prob_lead: 'दोपहर के समय (12:15 - 1:15), जैन यूनिवर्सिटी मेस में भीषण भीड़ होती थी। नेशनल काउंटर पर 15-20 छात्रों की कतारें थीं, जबकि इंटरनेशनल काउंटर खाली रहते थे।',
      abt_c1_title: 'भीड़ का असंतुलन',
      abt_c1_desc: 'नेशनल काउंटर 90% से अधिक भरे रहते थे, जबकि इंटरनेशनल काउंटर 20% से कम उपयोग होते थे।',
      abt_c2_title: 'पूर्व चेतावनी का अभाव',
      abt_c2_desc: 'अचानक भीड़ बढ़ने पर कैंटीन स्टाफ तैयार नहीं होता था, जिससे स्टैंडबाय काउंटर 6-10 मिनट देरी से खुलता था।',
      abt_c3_title: 'छात्रों को जानकारी की कमी',
      abt_c3_desc: 'छात्रों को लाइन में लगने से पहले यह पता नहीं चलता था कि कौन सा काउंटर सबसे तेज़ है।',
      abt_p_eyebrow: '02 · इंजीनियरिंग मानसिकता',
      abt_p_title: 'चार <span>स्तंभ</span>',
      abt_p_lead: 'कतार प्रबंधन को स्वचालित और मजबूत बनाने के लिए हमने कम्प्यूटेशनल सोच के सिद्धांतों को कैसे लागू किया।',
      abt_h_eyebrow: '03 · थ्रेशोल्ड तर्क',
      abt_h_title: '<span>हिस्टेरेसिस</span> के साथ नियम',
      abt_h_lead: 'स्वचालित निर्णय लेने के लिए नेशनल काउंटरों की औसत भीड़ पर नियम लागू होते हैं:',
      abt_t45_title: 'पूर्व चेतावनी अलर्ट',
      abt_t45_desc: 'स्टाफ को ऑडियो और कंपन अलर्ट भेजता है। रसोई को स्टैंडबाय काउंटर तैयार करने के लिए 2 मिनट की अग्रिम सूचना मिलती है।',
      abt_t45_who: 'स्टाफ अलर्ट',
      abt_t50_title: 'स्टैंडबाय काउंटर',
      abt_t50_desc: 'भीड़ 50% पहुंचते ही स्टैंडबाय काउंटर अपने आप खुल जाता है, जिससे कतारें लंबी नहीं होतीं।',
      abt_t50_who: 'स्टैंडबाय खुला',
      abt_t80_title: 'क्रॉस-एक्सेस चालू',
      abt_t80_desc: 'भीड़ > 80% होने पर डिजिटल पास के ज़रिये छात्रों को इंटरनेशनल काउंटर पर भेजा जाता है (75% सीमा सुरक्षित)।',
      abt_t80_who: 'क्रॉस-एक्सेस ऑन',
      abt_t40_title: 'स्थिर रीसेट',
      abt_t40_desc: 'भीड़ 40% से नीचे आने पर ही स्टैंडबाय बंद होता है। 40-45% का दायरा प्रणाली को स्थिर रखता है।',
      abt_t40_who: 'स्थिर रीसेट',
      abt_r_eyebrow: '04 · मापे गए परिणाम',
      abt_team_eyebrow: '05 · परियोजना टीम',


      // About Page (about.html)
      abt_eyebrow: 'शैक्षणिक शोध एवं रिपोर्ट',
      abt_title: '<span>MQM</span> के पीछे का विज्ञान',
      abt_sub: 'कम्प्यूटेशनल सोच के माध्यम से मेस प्रबंधन का आधुनिकीकरण: अपघटन, पैटर्न पहचान, अमूर्तता और एल्गोरिदमिक सोच।',
      
      abt_ctx_title: 'शैक्षणिक संदर्भ',
      abt_ctx_course: 'पाठ्यक्रम: कम्प्यूटेशनल सोच इंजीनियरिंग मानसिकता (IPS SE-302A)',
      abt_ctx_fac: 'संकाय मेंटर: डॉ. सुजिथ्रा',
      abt_ctx_inst: 'संस्थान: जैन (मानित विश्वविद्यालय)',
      abt_ctx_prob: 'समस्या: 600+ छात्र 45 मिनट के भीतर मेस पहुंचते हैं। असंतुलित कतारों से 15 मिनट की देरी होती है जबकि अन्य काउंटर खाली रहते हैं।',

      abt_p1_title: 'अपघटन (DECOMPOSITION)',
      abt_p1_desc: 'समस्या को छोटे भागों में बांटना: छात्रों के आने की दर, भोजन परोसने की गति, भोजन के क्षेत्र और डिलीवरी रनर।',
      abt_p1_who: 'समस्या का विश्लेषण',

      abt_p2_title: 'पैटर्न पहचान (PATTERN RECOGNITION)',
      abt_p2_desc: 'यह समझना कि दोपहर 1:15 बजे नेशनल काउंटर पर भारी भीड़ होती है जबकि इंटरनेशनल काउंटर पर 35% जगह खाली रहती है।',
      abt_p2_who: 'रुझानों की पहचान',

      abt_p3_title: 'अमूर्तता (ABSTRACTION)',
      abt_p3_desc: 'अनावश्यक बातों को छोड़कर केवल आवश्यक नियंत्रण मापदंडों पर ध्यान केंद्रित करना: कतार की लंबाई और सेवा दर।',
      abt_p3_who: 'मुख्य बिंदुओं पर ध्यान',

      abt_p4_title: 'एल्गोरिदम सोच (ALGORITHMIC THINKING)',
      abt_p4_desc: '40/45/50/80 थ्रेशोल्ड और 75% सुरक्षित सीमा के साथ एक स्थिर स्टेट मशीन तैयार करना ताकि सिस्टम स्थिर रहे।',
      abt_p4_who: 'चरणबद्ध समाधान',

      abt_steps_title: 'चरणबद्ध एल्गोरिदम',
      abt_s1: '1. सभी सक्रिय काउंटरों से कतार की गिनती पढ़ें।',
      abt_s2: '2. भीड़ % निकालें: कतार / क्षमता × 100.',
      abt_s3: '3. प्रतीक्षा समय निकालें: कतार × 30 सेकंड / 60.',
      abt_s4: '4. नेशनल काउंटरों का औसत निकालें।',
      abt_s5: '5. यदि भीड़ > 80%: क्रॉस-एक्सेस चालू करें (इंटरनेशनल काउंटर 75% पर सीमित)।',
      abt_s6: '6. यदि भीड़ ≥ 50%: स्टैंडबाय काउंटर खोलें।',
      abt_s7: '7. यदि भीड़ ≥ 45%: स्टाफ को 2 मिनट पहले अलर्ट भेजें।',
      abt_s8: '8. यदि भीड़ < 40%: स्टैंडबाय बंद करें और क्रॉस-एक्सेस रीसेट करें।',
      abt_s9: '9. सबसे कम प्रतीक्षा वाला काउंटर चुनें और छात्र स्क्रीन अपडेट करें।',

      abt_flowchart_title: 'निर्णय फ्लोचार्ट',
      abt_res_title: 'मापे गए परिणाम',
      abt_res_sub: 'जैन यूनिवर्सिटी कैंटीन में दोपहर के भोजन के समय स्टॉपवॉच से किया गया सत्यापन।',
      abt_r1_lbl: 'अधिकतम प्रतीक्षा',
      abt_r1_val: '4.2 मिनट',
      abt_r1_sub: '-63% की भारी कमी (पहले 11.5 मिनट)',
      abt_r2_lbl: 'अधिकतम कतार अंतर',
      abt_r2_val: '3 छात्र',
      abt_r2_sub: 'पहले 14 था (संतुलित भार)',
      abt_r3_lbl: 'स्टैंडबाय प्रतिक्रिया',
      abt_r3_val: '1.4 मिनट',
      abt_r3_sub: '45% पूर्व सूचना पर तुरंत कार्रवाई',

      abt_team_title: 'टीम Decrypted',
      abt_team_sub: 'स्मार्ट मेस कतार प्रबंधक परियोजना की इंजीनियरिंग टीम।',

      // Help Page (help.html)
      help_eyebrow: 'उपयोगकर्ता गाइड और सहायता',
      help_title: '<span>MQM</span> का उपयोग कैसे करें',
      help_sub: 'छात्रों, हॉस्टल निवासियों, स्वयंसेवकों और कैंटीन कर्मचारियों के लिए संपूर्ण निर्देश।',
      
      h_sec1_title: 'छात्र एवं हॉस्टल गाइड',
      h_card1_title: 'सबसे तेज़ कतार खोजना',
      h_card1_desc: 'मेस जाने से पहले वास्तविक समय में कतार देखें। सिस्टम स्वचालित रूप से सबसे कम प्रतीक्षा समय वाले काउंटर का सुझाव देता है।',
      
      h_card2_title: 'डिजिटल एक्सप्रेस पास',
      h_card2_desc: 'जब नेशनल काउंटर पर 80% से अधिक भीड़ हो, तो "एक्सप्रेस पास प्राप्त करें" पर टैप करें। आपको इंटरनेशनल काउंटर 1 या 2 का 15 मिनट का पास मिलता है।',
      
      h_card3_title: '"भीड़ कम होने पर बताएं"',
      h_card3_desc: 'हॉस्टल कमरे में पढ़ाई कर रहे हैं? अलर्ट बटन दबाएं और जब भीड़ 50% से कम होगी तो ऑडियो घंटी बज जाएगी।',
      
      h_card4_title: 'सीधे कमरे में डिलीवरी',
      h_card4_desc: 'यदि आपको बुखार या चोट है, तो रूम डिलीवरी फॉर्म भरें। सुपाच्य खिचड़ी/सूप या सामान्य थाली में से चुनें।',
      
      h_card5_title: '4-अंकीय सुरक्षा ओटीपी',
      h_card5_desc: 'प्रत्येक डिलीवरी पर 4-अंकीय ओटीपी मिलता है। भोजन पहुंचने पर डिलीवरी रनर को यह कोड दिखाकर भोजन प्राप्त करें।',
      
      h_card6_title: 'मेस कर्मा पॉइंट्स अर्जित करें',
      h_card6_desc: 'हॉस्टल पियर बडी बनें और बीमार सहपाठी को भोजन पहुंचाकर +10 मेस कर्मा अंक प्राप्त करें।',

      h_sec2_title: 'स्टाफ संचालन',
      h_card7_title: 'स्टाफ एक्सेस',
      h_card7_desc: 'नेवबार से स्टाफ कंसोल खोलें। डिफ़ॉल्ट पिन 1234 दर्ज करें या अपनी स्टाफ ईमेल आईडी से लॉगिन करें।',
      
      h_card8_title: 'कतार नियंत्रण',
      h_card8_desc: 'स्लाइडर या + / − बटनों से कतार समायोजित करें। खाना समाप्त होने पर सोल्ड आउट चेक करें ताकि छात्र दूसरे काउंटर पर जाएं।',
      
      h_card9_title: 'रसोई पूर्व चेतावनी',
      h_card9_desc: 'यदि किसी व्यंजन की रेटिंग 2.5★ से कम होती है या 3 से अधिक शिकायतें मिलती हैं, तो रसोई में तुरंत लाल अलर्ट बजता है।',

      // Directory in Help Page
      h_dir_eyebrow: '03 · संपर्क निर्देशिका',
      h_dir_title: 'मेस स्टाफ एवं आपातकालीन संपर्क',
      h_dir_sub: 'कैंटीन सुपरवाइजर, मुख्य वार्डन, स्वास्थ्य केंद्र और कंट्रोल रूम के आधिकारिक फोन नंबर।',
      
      // FAQ in Help Page
      h_faq_eyebrow: '04 · सामान्य प्रश्न',
      h_faq_title: 'अक्सर पूछे जाने वाले प्रश्न',
      faq_q1: 'स्टैंडबाय काउंटर 80% के बजाय 50% पर क्यों खुलता है?',
      faq_a1: '50% भीड़ पर स्टैंडबाय खोलने से कतारें हॉल में पीछे तक नहीं फैलतीं। 45% पर तैयारी और 50% पर खुलने से भीड़ कभी खतरनाक स्तर तक नहीं पहुंचती।',
      faq_q2: 'क्रॉस-एक्सेस पर 75% की सीमा क्या है?',
      faq_a2: 'जब नेशनल छात्रों को इंटरनेशनल काउंटर पर भेजा जाता है, तो वहां की क्षमता अधिकतम 75% तक रखी जाती है ताकि इंटरनेशनल छात्रों को कोई असुविधा न हो।',
      faq_q3: 'क्या मैं बिना बीमारी के रूम डिलीवरी मंगवा सकता हूँ?',
      faq_a3: 'रूम डिलीवरी केवल बीमार या घायल छात्रों के लिए है। बिना सत्यापन के अनुरोधों को पीक आवर्स में अस्वीकार किया जा सकता है।',
      faq_q4: 'इंटरनेट बंद होने पर सिस्टम कैसे काम करता है?',
      faq_a4: 'MQM सारा डेटा ब्राउज़र के स्थानीय डेटाबेस में सुरक्षित रखता है। इंटरनेट वापस आते ही सभी बदलाव अपने आप सिंक हो जाते हैं।',
      faq_q5: 'भाषा को कन्नड़ या हिंदी में कैसे बदलें?',
      faq_a5: 'शीर्ष नेविगेशन बार में दिए गए बटन पर क्लिक करें। यह सभी स्क्रीन पर अंग्रेजी, हिंदी और कन्नड़ में बदल जाता है।',

      // Student View (student.html)
      st_title: 'स्मार्ट मेस साथी',
      st_rec_label: 'आपके लिए सबसे तेज़ काउंटर',
      st_btn_nat: 'नेशनल छात्र',
      st_btn_int: 'इंटरनेशनल छात्र',
      st_tab_queue: '⚡ लाइव कतार और काउंटर',
      st_tab_delivery: '🛏️ रूम डिलीवरी',
      st_tab_menu: '⭐ आज का मेनू और रेटिंग',
      st_tab_waste: '🌱 ज़ीरो फ़ूड वेस्ट',
      st_claim_pass: '🎫 एक्सप्रेस पास प्राप्त करें ▶',
      st_push_alert: '🔔 भीड़ < 50% होने पर सूचित करें',
      st_order_title: 'कमरे में अस्वस्थ भोजन का अनुरोध करें',
      st_order_sub: 'बुखार या चोट से पीड़ित छात्रों के कमरे तक भोजन पहुंचाने की सेवा।',
      st_lbl_room: 'हॉस्टल ब्लॉक और कमरा संख्या',
      st_lbl_reason: 'डिलीवरी का कारण',
      st_lbl_diet: 'आहार का चयन',
      st_opt_khichdi: 'हल्का सुपाच्य भोजन (खिचड़ी + दही + गर्म सूप)',
      st_opt_thali: 'मानक कैंटीन थाली',
      st_opt_fever: 'तेज़ बुखार / वायरल बीमारी',
      st_opt_injury: 'शारीरिक चोट (मोच / फ्रैक्चर)',
      st_opt_isolated: 'मेडिकल क्वारंटीन / संक्रामक',
      st_btn_request: '🚀 रूम डिलीवरी का अनुरोध करें',
      st_active_deliveries: 'आपके हालिया डिलीवरी अनुरोध',
      st_volunteer_card: 'हॉस्टल पियर बडी बनें',
      st_volunteer_sub: 'अपने ब्लॉक में किसी बीमार सहपाठी को भोजन पहुंचाएं और +10 मेस कर्मा अंक अर्जित करें।',
      st_rate_heading: 'आज का मेनू और भोजन गुणवत्ता रेटिंग',
      st_rate_sub: 'छात्रों की रेटिंग सीधे रसोई में अलर्ट भेजती है ताकि हमेशा ताज़ा और स्वादिष्ट खाना मिले।',
      st_waste_heading: 'शून्य खाद्य बर्बादी उपस्थिति पूर्व-जांच',
      st_waste_sub: 'खाना बनने से पहले रसोई को बताएं। आपकी उपस्थिति से भोजन की बर्बादी शून्य होती है।',
      st_eat_yes: '🍽️ मैं आज मेस में खा रहा हूँ',
      st_eat_no: '🚫 यह भोजन छोड़ रहा हूँ',

      // Staff View (staff.html)
      staff_title: 'कैंटीन स्टाफ कंसोल',
      staff_tab_queue: '🎛️ कतार और काउंटर',
      staff_tab_dispatch: '🛏️ रूम डिलीवरी',
      staff_tab_kitchen: '🍳 रसोई और गुणवत्ता',
      staff_tab_waste: '🌱 उपस्थिति पूर्वानुमान',
      staff_tab_admin: '⚙️ सेटिंग्स और QR',
      staff_zone_crowd: 'ज़ोन भीड़ (नेशनल औसत)',
      staff_counter_state: 'काउंटर स्थिति एवं मैन्युअल नियंत्रण',
      staff_btn_open: 'स्टैंडबाय खोलें',
      staff_btn_close: 'स्टैंडबाय बंद करें',
      staff_btn_force: 'क्रॉस-एक्सेस चालू करें',
      staff_btn_auto: 'ऑटो मोड',
      staff_canteen_qr: 'कैंटीन प्रवेश द्वार QR कोड',
      staff_qr_desc: 'इस कोड को प्रिंट करके कैंटीन प्रवेश द्वार पर लगाएं। छात्र स्कैन करके खोलेंगे:'
    },

    kn: {
      // Common Navigation
      nav_home: 'ಮುಖಪುಟ',
      nav_student_link: 'ವಿದ್ಯಾರ್ಥಿ',
      nav_staff_link: 'ಸಿಬ್ಬಂದಿ',
      nav_about: 'ಬಗ್ಗೆ',
      nav_help: 'ಸಹಾಯ',
      nav_tests: 'ಪರೀಕ್ಷೆಗಳು',
      nav_student_view: 'ವಿದ್ಯಾರ್ಥಿ ವೀಕ್ಷಣೆ',
      nav_staff_view: 'ಸಿಬ್ಬಂದಿ ಕನ್ಸೋಲ್',
      nav_signin: 'ಸೈನ್ ಇನ್ ▶',
      nav_profile: 'ಪ್ರೊಫೈಲ್',
      nav_exit: 'ನಿರ್ಗಮಿಸಿ',

      // Home Page (index.html)
      hero_eyebrow: 'ಕ್ಯಾಂಪಸ್ ಕ್ಯಾಂಟೀನ್ · ಸ್ಮಾರ್ಟ್ ಕ್ಯೂ ವ್ಯವಸ್ಥೆ',
      hero_title: 'ಸ್ಮಾರ್ಟ್ ಮೆಸ್ ಕ್ಯೂ ಮ್ಯಾನೇಜರ್',
      hero_sub: 'ನೈಜ ಸಮಯದ ಕ್ಯೂ, ವೇಗದ ಕೌಂಟರ್ ಮಾರ್ಗ, ಕೊಠಡಿಗೆ ಆಹಾರ ವಿತರಣೆ, ಆಹಾರ ರೇಟಿಂಗ್ ಮತ್ತು ಶೂನ್ಯ ಆಹಾರ ವ್ಯರ್ಥ.',
      btn_find_fastest: '⚡ ವೇಗದ ಕೌಂಟರ್ ಹುಡುಕಿ ▶',
      btn_room_delivery: '🛏️ ರೂಮ್ ಡೆಲಿವರಿ',
      btn_rate_menu: '⭐ ಆಹಾರ ರೇಟ್ ಮಾಡಿ',
      btn_staff_console: 'ಸಿಬ್ಬಂದಿ ಕನ್ಸೋಲ್ ↗',

      hud_active_counters: 'ಸಕ್ರಿಯ ಕೌಂಟರ್‌ಗಳು',
      hud_active_count: '4 / 4 ಕಾರ್ಯಾಚರಣೆ',
      hud_peak_wait: 'ಗರಿಷ್ಠ ಕಾಯುವ ಸಮಯ',
      hud_peak_mins: '4.2 ನಿಮಿಷ',
      hud_peak_sub: 'ಸಾಮಾನ್ಯಕ್ಕಿಂತ -63% ಕಡಿಮೆ',
      hud_standby: 'ಸ್ಟ್ಯಾಂಡ್‌ಬೈ ಕೌಂಟರ್',
      hud_standby_status: 'ಆಟೋ ಸಿದ್ಧ (50% ಟ್ರಿಗರ್)',
      hud_zone_crowd: 'ವಲಯ ಜನಸಂದಣಿ',
      hud_zone_routing: '40% ಕ್ಕಿಂತ ಕಡಿಮೆ: ಸಾಮಾನ್ಯ ಸಂಚಾರ',

      sec_core_title: 'ಜೈನ್ ಯೂನಿವರ್ಸಿಟಿ ಮೆಸ್‌ಗಾಗಿ ನಿರ್ಮಿಸಲಾಗಿದೆ',
      sec_core_sub: 'ಊಟದ ಸಭಾಂಗಣದ ದಟ್ಟಣೆ ಮತ್ತು ಆಹಾರ ವ್ಯರ್ಥವನ್ನು ಸಂಪೂರ್ಣವಾಗಿ ನಿವಾರಿಸುವ ನಾಲ್ಕು ತಾಂತ್ರಿಕ ಸ್ತಂಭಗಳು.',
      
      feat_cross_title: 'ಸ್ಮಾರ್ಟ್ ಕ್ರಾಸ್-ಆಕ್ಸೆಸ್ (80% / 75%)',
      feat_cross_desc: 'ರಾಷ್ಟ್ರೀಯ ಕೌಂಟರ್ ಜನದಟ್ಟಣೆ 80% ಮೀರಿದಾಗ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಅಂತರರಾಷ್ಟ್ರೀಯ ಕೌಂಟರ್‌ಗೆ ನಿರ್ದೇಶಿಸುತ್ತದೆ (75% ಮಿತಿಗೆ ಒಳಪಟ್ಟು).',
      feat_cross_tag: 'ದಟ್ಟಣೆ ಮುಕ್ತ ಕ್ಯೂ',

      feat_deliv_title: 'ಅನಾರೋಗ್ಯ ಕೊಠಡಿ ಆಹಾರ ವಿತರಣೆ',
      feat_deliv_desc: 'ಜ್ವರ ಅಥವಾ ಗಾಯವಾಗಿದೆಯೇ? ಹಾಸ್ಟೆಲ್ ಕೊಠಡಿಗೆ ನೇರವಾಗಿ ಲಘು ಆಹಾರ (ಖಿಚಡಿ/ಸೂಪ್) ತರಿಸಿಕೊಳ್ಳಿ, 4-ಅಂಕಿಯ OTP ಭದ್ರತೆ.',
      feat_deliv_tag: 'ಹಾಸ್ಟೆಲ್ ಆರೋಗ್ಯ ಸೇವೆ',

      feat_rating_title: 'ಆಹಾರ ರೇಟಿಂಗ್ & ಪ್ರತಿಕ್ರಿಯೆ',
      feat_rating_desc: 'ಪ್ರತಿ ಅಡುಗೆಗೆ 1-5★ ರೇಟಿಂಗ್ ನೀಡಿ. ರೇಟಿಂಗ್ 2.5★ ಕ್ಕಿಂತ ಕಡಿಮೆಯಾದರೆ ಅಡುಗೆ ಮನೆಗೆ ತಕ್ಷಣ ತಿದ್ದುಪಡಿ ಅಲರ್ಟ್ ಹೋಗುತ್ತದೆ.',
      feat_rating_tag: 'ಗುಣಮಟ್ಟ ಭರವಸೆ',

      feat_waste_title: 'ಶೂನ್ಯ ಆಹಾರ ವ್ಯರ್ಥ ಹಾಜರಾತಿ',
      feat_waste_desc: 'ಅಡುಗೆ ತಯಾರಿಗೆ ಮುನ್ನ ನೀವು ಊಟ ಮಾಡುತ್ತೀರಾ ಇಲ್ಲವೇ ತಿಳಿಸಿ. ನೈಜ ಹಾಜರಾತಿ ಮುನ್ಸೂಚನೆ ಆಹಾರ ವ್ಯರ್ಥವನ್ನು ಸಂಪೂರ್ಣ ತಡೆಯುತ್ತದೆ.',
      feat_waste_tag: 'ಶಾಶ್ವತ ಕ್ಯಾಂಪಸ್',

      sim_card_title: 'ಡೈನಾಮಿಕ್ ಹಿಸ್ಟರೆಸಿಸ್ ನಿಯಮ ಪ್ರಾತ್ಯಕ್ಷಿಕೆ',
      sim_card_sub: '40% / 45% / 50% / 80% ಎಂಜಿನ್ ನೈಜ ಸಮಯದಲ್ಲಿ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ ಎಂಬುದನ್ನು ಪರೀಕ್ಷಿಸಿ:',
      sim_btn_normal: '30% ಸಾಮಾನ್ಯ (<40%)',
      sim_btn_alert: '46% ಸಿಬ್ಬಂದಿ ಎಚ್ಚರಿಕೆ (≥45%)',
      sim_btn_standby: '55% ಸ್ಟ್ಯಾಂಡ್‌ಬೈ ತೆರೆಯಿರಿ (≥50%)',
      sim_btn_cross: '85% ಕ್ರಾಸ್ ಆಕ್ಸೆಸ್ (>80%)',

      qr_sec_title: 'ಕ್ಯಾಂಪಸ್ ಪ್ರವೇಶ QR ಕೋಡ್',
      qr_sec_desc: 'ಈ ಕೋಡ್ ಅನ್ನು ಊಟದ ಸಭಾಂಗಣದ ಪ್ರವೇಶದ್ವಾರದಲ್ಲಿ ಅಂಟಿಸಿ. ಲೈವ್ ಕ್ಯೂ, ಪಾಸ್ ಅಥವಾ ಡೆಲಿವರಿಗಾಗಿ ವಿದ್ಯಾರ್ಥಿಗಳು ಸ್ಕ್ಯಾನ್ ಮಾಡಬಹುದು.',
      qr_url_label: 'ಲೈವ್ ಲಿಂಕ್:',
      qr_scan_action: 'ಮೊಬೈಲ್ ಪೋರ್ಟಲ್‌ಗೆ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ',

      test_pass_title: '14/14 ಯುನಿಟ್ ಪರೀಕ್ಷೆಗಳು ಯಶಸ್ವಿ',
      test_pass_desc: 'ಕ್ಯೂ ನಿಯಮಗಳು, 75% ಓವರ್‌ಫ್ಲೋ ಮಿತಿ, ತುರ್ತು ಡೆಲಿವರಿ ಮತ್ತು ಕಿಚನ್ ಅಲರ್ಟ್ ನಿಯಮಗಳು 100% ಪಾಸಾಗಿವೆ.',
      test_run_link: 'ಪರೀಕ್ಷೆಗಳನ್ನು ಚಲಾಯಿಸಿ ↗',

      footer_tagline: 'ಸ್ಮಾರ್ಟ್ ಮೆಸ್ ಕ್ಯೂ ಮ್ಯಾನೇಜರ್ · ಜೈನ್ ವಿಶ್ವವಿದ್ಯಾಲಯ',
      footer_academic: 'ಕಂಪ್ಯೂಟೇಶನಲ್ ಥಿಂಕಿಂಗ್ ಎಂಜಿನಿಯರಿಂಗ್ ಮೈಂಡ್‌ಸೆಟ್ (IPS SE-302A)',
      footer_rights: 'ಮೆಸ್ ಕ್ಯೂ ಮ್ಯಾನೇಜರ್. ಎಲ್ಲ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.',

      // Help Page Headers & Eyebrows
      help_tag: 'ಬೆಂಬಲ ಮತ್ತು ದಾಖಲೆಗಳು',
      help_h1: 'ಸಹಾಯ ಮತ್ತು <span>ಬಳಕೆದಾರ ಮಾರ್ಗದರ್ಶಿ</span>',
      help_hero_sub: 'ಕ್ಯೂ ಸಮಯ ಪರಿಶೀಲನೆ, ಎಕ್ಸ್‌ಪ್ರೆಸ್ ಪಾಸ್, ಕೊಠಡಿಗೆ ಆಹಾರ ವಿತರಣೆ ಮತ್ತು ಮೆಸ್ ಕಾರ್ಯಾಚರಣೆಗಳ ಸಂಪೂರ್ಣ ಮಾಹಿತಿ.',
      h_eyebrow1: '01 · ವಿದ್ಯಾರ್ಥಿ ಮಾರ್ಗದರ್ಶಿ',
      h_sec1_title: '<span>ವಿದ್ಯಾರ್ಥಿ ಪೋರ್ಟಲ್</span> ಬಳಕೆ',
      h_eyebrow2: '02 · ಸಿಬ್ಬಂದಿ ಕಾರ್ಯಾಚರಣೆಗಳು',
      h_sec2_title: '<span>ಸಿಬ್ಬಂದಿ ಕನ್ಸೋಲ್</span> ಕಾರ್ಯಾಚರಣೆ',
      
      // Help Page Student Cards
      h_card1_title: 'ಅತ್ಯುತ್ತಮ ಕೌಂಟರ್ ಹುಡುಕುವುದು',
      h_card1_desc: 'ನಿಮ್ಮ ಫೋನ್‌ನಲ್ಲಿ ವಿದ್ಯಾರ್ಥಿ ಪೋರ್ಟಲ್ ತೆರೆಯಿರಿ. ಗೋಲ್ಡನ್ ಬ್ಯಾನರ್ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಕಡಿಮೆ ಕಾಯುವ ಸಮಯದ ಕೌಂಟರ್ ಅನ್ನು ತೋರಿಸುತ್ತದೆ.',
      h_card2_title: 'ಕ್ರಾಸ್-ಆಕ್ಸೆಸ್ ಎಕ್ಸ್‌ಪ್ರೆಸ್ ಪಾಸ್',
      h_card2_desc: 'ರಾಷ್ಟ್ರೀಯ ಕ್ಯೂ 80% ಮೀರಿದಾಗ, "ಎಕ್ಸ್‌ಪ್ರೆಸ್ ಪಾಸ್ ಪಡೆಯಿರಿ" ಒತ್ತಿ ಮತ್ತು 15 ನಿಮಿಷದ ಅಂತರರಾಷ್ಟ್ರೀಯ ಕೌಂಟರ್ ಪಾಸ್ ಪಡೆಯಿರಿ.',
      h_card3_title: '"ಖಾಲಿಯಾದಾಗ ತಿಳಿಸಿ"',
      h_card3_desc: 'ಹಾಸ್ಟೆಲ್ ಕೋಣೆಯಲ್ಲಿ ಓದುತ್ತಿದ್ದೀರಾ? ಜನಸಂದಣಿ 50% ಕ್ಕಿಂತ ಕಡಿಮೆಯಾದಾಗ ಆಡಿಯೋ ಅಲರ್ಟ್ ಪಡೆಯಲು ಬಟನ್ ಒತ್ತಿರಿ.',
      h_card4_title: 'ಕೊಠಡಿಗೆ ನೇರ ವಿತರಣೆ',
      h_card4_desc: 'ಜ್ವರ ಅಥವಾ ಗಾಯವಾಗಿದ್ದರೆ ರೂಮ್ ಡೆಲಿವರಿ ಫಾರ್ಮ್ ಭರ್ತಿ ಮಾಡಿ. ಲಘು ಆಹಾರ (ಖಿಚಡಿ/ಸೂಪ್) ಅಥವಾ ಥಾಲಿ ಆಯ್ಕೆಮಾಡಿ.',
      h_card5_title: '4-ಅಂಕಿಯ ಭದ್ರತಾ OTP',
      h_card5_desc: 'ಪ್ರತಿ ಆರ್ಡರ್‌ಗೂ 4-ಅಂಕಿಯ OTP ಸಿಗುತ್ತದೆ. ಊಟ ತಂದಾಗ ರನ್ನರ್‌ಗೆ ಈ ಕೋಡ್ ತೋರಿಸಿ ಊಟವನ್ನು ಪಡೆದುಕೊಳ್ಳಿ.',
      h_card6_title: 'ಕರ್ಮ ಪಾಯಿಂಟ್‌ಗಳನ್ನು ಗಳಿಸಿ',
      h_card6_desc: 'ಅನಾರೋಗ್ಯದಲ್ಲಿರುವ ವಿದ್ಯಾರ್ಥಿಗೆ ಊಟ ತಲುಪಿಸುವ ಮೂಲಕ +10 ಮೆಸ್ ಕರ್ಮ ಪಾಯಿಂಟ್‌ಗಳನ್ನು ಗಳಿಸಿ.',

      // Help Page Staff Cards
      h_card7_title: 'ಸಿಬ್ಬಂದಿ ಪ್ರವೇಶ',
      h_card7_desc: 'ನ್ಯಾವ್‌ಬಾರ್‌ನಿಂದ ಸಿಬ್ಬಂದಿ ಕನ್ಸೋಲ್ ತೆರೆಯಿರಿ. ಡೀಫಾಲ್ಟ್ ಪಿನ್ 1234 ನಮೂದಿಸಿ ಅಥವಾ ಇಮೇಲ್ ಮೂಲಕ ಲಾಗಿನ್ ಆಗಿ.',
      h_card8_title: 'ಕ್ಯೂ ನಿಯಂತ್ರಣಗಳು',
      h_card8_desc: 'ಸ್ಲೈಡರ್‌ಗಳು ಅಥವಾ + / − ಬಟನ್‌ಗಳನ್ನು ಬಳಸಿ ಕ್ಯೂ ನಿಯಂತ್ರಿಸಿ. ಆಹಾರ ಮುಗಿದಿದ್ದರೆ "ಸೋಲ್ಡ್ ಔಟ್" ಮಾರ್ಕ್ ಮಾಡಿ.',
      h_card9_title: 'ಅಡುಗೆ ಮನೆ ಎಚ್ಚರಿಕೆ',
      h_card9_desc: 'ಆಹಾರ ರೇಟಿಂಗ್ 2.5★ ಕ್ಕಿಂತ ಕಡಿಮೆಯಾದರೆ ಅಡುಗೆ ಮನೆಗೆ ತಕ್ಷಣ ಅಲರ್ಟ್ ಹೋಗುತ್ತದೆ, ಇದರಿಂದ ಸರಿಪಡಿಸಬಹುದು.',

      // About Page Detailed Texts
      abt_tag: 'ಸಂಶೋಧನೆ ಮತ್ತು ಎಂಜಿನಿಯರಿಂಗ್ ಲೆಕ್ಕಪರಿಶೋಧನೆ',
      abt_page_title: '<span>ಮೆಸ್ ಕ್ಯೂ ಮ್ಯಾನೇಜರ್</span> ಬಗ್ಗೆ',
      abt_prob_eyebrow: '01 · ಸಮಸ್ಯೆ ವಿವರಣೆ',
      abt_prob_title: 'ಉದ್ದದ ಕ್ಯೂಗಳು. <span>ಖಾಲಿ ಕೌಂಟರ್‌ಗಳು.</span>',
      abt_prob_lead: 'ಮಧ್ಯಾಹ್ನದ ಊಟದ ಸಮಯದಲ್ಲಿ (12:15 - 1:15), ಜೈನ್ ಯೂನಿವರ್ಸಿಟಿ ಮೆಸ್‌ನಲ್ಲಿ ಭಾರಿ ಜನದಟ್ಟಣೆ ಇರುತ್ತಿತ್ತು. ರಾಷ್ಟ್ರೀಯ ಕೌಂಟರ್‌ನಲ್ಲಿ 15-20 ವಿದ್ಯಾರ್ಥಿಗಳ ಕ್ಯೂ ಇರುತ್ತಿತ್ತು, ಅಂತರರಾಷ್ಟ್ರೀಯ ಕೌಂಟರ್ ಖಾಲಿ ಇರುತ್ತಿತ್ತು.',
      abt_c1_title: 'ಜನಸಂದಣಿ ಅಸಮತೋಲನ',
      abt_c1_desc: 'ರಾಷ್ಟ್ರೀಯ ಕೌಂಟರ್‌ಗಳು 90% ಕ್ಕಿಂತ ಹೆಚ್ಚು ತುಂಬಿರುತ್ತಿದ್ದವು, ಆದರೆ ಅಂತರರಾಷ್ಟ್ರೀಯ ಕೌಂಟರ್‌ಗಳು 20% ಕ್ಕಿಂತ ಕಡಿಮೆ ಬಳಕೆಯಾಗುತ್ತಿದ್ದವು.',
      abt_c2_title: 'ಮುನ್ಸೂಚನೆಯ ಕೊರತೆ',
      abt_c2_desc: 'ಧಿಡೀರ್ ಜನದಟ್ಟಣೆ ಉಂಟಾದಾಗ ಅಡುಗೆ ಸಿಬ್ಬಂದಿ ಗಲಿಬಿಲಿಗೊಳ್ಳುತ್ತಿದ್ದರು, ಇದರಿಂದ ಸ್ಟ್ಯಾಂಡ್‌ಬೈ ಕೌಂಟರ್ 6-10 ನಿಮಿಷ ತಡವಾಗಿ ತೆರೆಯುತ್ತಿತ್ತು.',
      abt_c3_title: 'ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಮಾಹಿತಿಯ ಕೊರತೆ',
      abt_c3_desc: 'ಕ್ಯೂಗೆ ಸೇರುವ ಮೊದಲು ಯಾವ ಕೌಂಟರ್ ವೇಗವಾಗಿದೆ ಎಂದು ತಿಳಿಯಲು ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಯಾವುದೇ ಮಾರ್ಗವಿರಲಿಲ್ಲ.',
      abt_p_eyebrow: '02 · ಎಂಜಿನಿಯರಿಂಗ್ ಮನಸ್ಥಿತಿ',
      abt_p_title: 'ನಾಲ್ಕು <span>ಸ್ತಂಭಗಳು</span>',
      abt_p_lead: 'ಸ್ವಯಂಚಾಲಿತ, ದೃಢವಾದ ಕ್ಯೂ ನಿರ್ವಹಣೆಗಾಗಿ ನಾವು ಕಂಪ್ಯೂಟೇಶನಲ್ ಥಿಂಕಿಂಗ್ ತತ್ವಗಳನ್ನು ಹೇಗೆ ಅನ್ವಯಿಸಿದೆವು.',
      abt_h_eyebrow: '03 · ಮಿತಿ ತರ್ಕ',
      abt_h_title: '<span>ಹಿಸ್ಟರೆಸಿಸ್</span> ನಿಯಮಗಳು',
      abt_h_lead: 'ಸ್ವಯಂಚಾಲಿತ ಕ್ರಮಗಳನ್ನು ನಿರ್ಧರಿಸಲು ರಾಷ್ಟ್ರೀಯ ಕೌಂಟರ್‌ಗಳ ಸರಾಸರಿ ಜನಸಂದಣಿಯ ಮೇಲೆ ನಿಯಮಗಳು ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತವೆ:',
      abt_t45_title: 'ಮುನ್ಸೂಚನೆ ಎಚ್ಚರಿಕೆ',
      abt_t45_desc: 'ಸಿಬ್ಬಂದಿಗೆ ಆಡಿಯೋ ಮತ್ತು ಕಂಪನ ಎಚ್ಚರಿಕೆ ರವಾನೆಯಾಗುತ್ತದೆ. ಅಡುಗೆ ಮನೆಗೆ ಸ್ಟ್ಯಾಂಡ್‌ಬೈ ಸಿದ್ಧಪಡಿಸಲು 2 ನಿಮಿಷ ಮುಂಚಿತವಾಗಿ ಮಾಹಿತಿ ಸಿಗುತ್ತದೆ.',
      abt_t45_who: 'ಸಿಬ್ಬಂದಿ ಅಲರ್ಟ್',
      abt_t50_title: 'ಸ್ಟ್ಯಾಂಡ್‌ಬೈ ಕೌಂಟರ್',
      abt_t50_desc: 'ಜನಸಂದಣಿ 50% ತಲುಪಿದಾಗ ಸ್ಟ್ಯಾಂಡ್‌ಬೈ ಕೌಂಟರ್ ತಕ್ಷಣ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ತೆರೆಯುತ್ತದೆ.',
      abt_t50_who: 'ಸ್ಟ್ಯಾಂಡ್‌ಬೈ ತೆರೆದಿದೆ',
      abt_t80_title: 'ಕ್ರಾಸ್-ಆಕ್ಸೆಸ್ ಆನ್',
      abt_t80_desc: 'ಜನಸಂದಣಿ > 80% ಆದಾಗ ಡಿಜಿಟಲ್ ಪಾಸ್ ಮೂಲಕ ಅಂತರರಾಷ್ಟ್ರೀಯ ಕೌಂಟರ್‌ಗೆ ಪ್ರವೇಶ ನೀಡಲಾಗುತ್ತದೆ (75% ಮಿತಿಗೆ ಒಳಪಟ್ಟು).',
      abt_t80_who: 'ಕ್ರಾಸ್-ಆಕ್ಸೆಸ್ ಆನ್',
      abt_t40_title: 'ಸ್ಥಿರ ಮರುಹೊಂದಿಕೆ',
      abt_t40_desc: 'ಜನಸಂದಣಿ 40% ಕ್ಕಿಂತ ಕಡಿಮೆಯಾದಾಗ ಮಾತ್ರ ಸ್ಟ್ಯಾಂಡ್‌ಬೈ ಮುಚ್ಚಲಾಗುತ್ತದೆ. 40-45% ಮಿತಿ ವ್ಯವಸ್ಥೆಯನ್ನು ಸ್ಥಿರವಾಗಿರಿಸುತ್ತದೆ.',
      abt_t40_who: 'ಸ್ಥಿರ ರಿಸೆಟ್',
      abt_r_eyebrow: '04 · ಅಳತೆ ಮಾಡಿದ ಫಲಿತಾಂಶಗಳು',
      abt_team_eyebrow: '05 · ಪ್ರಾಜೆಕ್ಟ್ ತಂಡ',


      // About Page (about.html)
      abt_eyebrow: 'ಶೈಕ್ಷಣಿಕ ಸಂಶೋಧನೆ ಮತ್ತು ವರದಿ',
      abt_title: '<span>MQM</span> ಹಿಂದಿರುವ ವಿಜ್ಞಾನ',
      abt_sub: 'ಕಂಪ್ಯೂಟೇಶನಲ್ ಥಿಂಕಿಂಗ್ ಮೂಲಕ ಕ್ಯಾಂಪಸ್ ಊಟದ ಪರಿವರ್ತನೆ: ವಿಭಜನೆ, ಪ್ಯಾಟರ್ನ್ ಗುರುತಿಸುವಿಕೆ, ಅಮೂರ್ತತೆ ಮತ್ತು ಅಲ್ಗಾರಿದಮಿಕ್ ಚಿಂತನೆ.',
      
      abt_ctx_title: 'ಶೈಕ್ಷಣಿಕ ವಿವರ',
      abt_ctx_course: 'ಕೋರ್ಸ್: ಕಂಪ್ಯೂಟೇಶನಲ್ ಥಿಂಕಿಂಗ್ ಎಂಜಿನಿಯರಿಂಗ್ ಮೈಂಡ್‌ಸೆಟ್ (IPS SE-302A)',
      abt_ctx_fac: 'ಮಾರ್ಗದರ್ಶಕರು: ಡಾ. ಸುಜಿತ್ರಾ',
      abt_ctx_inst: 'ಸಂಸ್ಥೆ: ಜೈನ್ ವಿಶ್ವವಿದ್ಯಾಲಯ',
      abt_ctx_prob: 'ಸಮಸ್ಯೆ: 45 ನಿಮಿಷಗಳಲ್ಲಿ 600+ ವಿದ್ಯಾರ್ಥಿಗಳು ಬರುತ್ತಾರೆ. ಅಸಮರ್ಪಕ ಕ್ಯೂ ನಿರ್ವಹಣೆಯಿಂದ 15 ನಿಮಿಷ ಕಾಯಬೇಕಾಗುತ್ತದೆ.',

      abt_p1_title: 'ವಿಭಜನೆ (DECOMPOSITION)',
      abt_p1_desc: 'ಸಮಸ್ಯೆಯನ್ನು ಸಣ್ಣ ಭಾಗಗಳಾಗಿ ವಿಂಗಡಿಸುವುದು: ವಿದ್ಯಾರ್ಥಿಗಳ ಆಗಮನ ದರ, ಪೂರೈಕೆ ವೇಗ, ಆಹಾರ ವಲಯಗಳು ಮತ್ತು ರನ್ನರ್‌ಗಳು.',
      abt_p1_who: 'ಸಮಸ್ಯೆಯ ವಿಭಜನೆ',

      abt_p2_title: 'ಪ್ಯಾಟರ್ನ್ ಗುರುತಿಸುವಿಕೆ (PATTERN RECOGNITION)',
      abt_p2_desc: 'ಮಧ್ಯಾಹ್ನ 1:15 ಕ್ಕೆ ರಾಷ್ಟ್ರೀಯ ಕೌಂಟರ್‌ನಲ್ಲಿ ದಟ್ಟಣೆ ಮತ್ತು ಅಂತರರಾಷ್ಟ್ರೀಯ ಕೌಂಟರ್‌ನಲ್ಲಿ 35% ಖಾಲಿ ಇರುವ ಪ್ಯಾಟರ್ನ್ ಗುರುತಿಸುವುದು.',
      abt_p2_who: 'ಪ್ರವೃತ್ತಿಗಳನ್ನು ಗುರುತಿಸುವುದು',

      abt_p3_title: 'ಅಮೂರ್ತತೆ (ABSTRACTION)',
      abt_p3_desc: 'ಅನಗತ್ಯ ವಿವರಗಳನ್ನು ಬಿಟ್ಟು ಮುಖ್ಯ ನಿಯಂತ್ರಣಗಳ ಮೇಲೆ ಗಮನ ಕೇಂದ್ರೀಕರಿಸುವುದು: ಕ್ಯೂ ಉದ್ದ ಮತ್ತು ಸೇವಾ ದರ.',
      abt_p3_who: 'ಮುಖ್ಯ ವಿಷಯದ ಮೇಲೆ ಗಮನ',

      abt_p4_title: 'ಅಲ್ಗಾರಿದಮಿಕ್ ಚಿಂತನೆ (ALGORITHMIC THINKING)',
      abt_p4_desc: '40/45/50/80 ಮಿತಿಗಳು ಮತ್ತು 75% ಸುರಕ್ಷಿತ ಮಿತಿಯೊಂದಿಗೆ ಸ್ಥಿರ ಸ್ಟೇಟ್ ಮೆಷಿನ್ ವಿನ್ಯಾಸಗೊಳಿಸುವುದು.',
      abt_p4_who: 'ಹಂತ-ಹಂತದ ಪರಿಹಾರ',

      abt_steps_title: 'ಹಂತ-ಹಂತದ ಅಲ್ಗಾರಿದಮ್',
      abt_s1: '1. ಎಲ್ಲಾ ಸಕ್ರಿಯ ಕೌಂಟರ್‌ಗಳಿಂದ ಕ್ಯೂ ಸಂಖ್ಯೆಯನ್ನು ಓದಿ.',
      abt_s2: '2. ಜನಸಂದಣಿ % ಲೆಕ್ಕಾಚಾರ: ಕ್ಯೂ / ಸಾಮರ್ಥ್ಯ × 100.',
      abt_s3: '3. ಕಾಯುವ ಸಮಯ ಲೆಕ್ಕಾಚಾರ: ಕ್ಯೂ × 30 ಸೆಕೆಂಡು / 60.',
      abt_s4: '4. ರಾಷ್ಟ್ರೀಯ ಕೌಂಟರ್‌ಗಳ ಸರಾಸರಿಯನ್ನು ಲೆಕ್ಕ ಹಾಕಿ.',
      abt_s5: '5. ಜನಸಂದಣಿ > 80%: ಕ್ರಾಸ್-ಆಕ್ಸೆಸ್ ಆನ್ ಮಾಡಿ (ಅಂತರರಾಷ್ಟ್ರೀಯ ಕೌಂಟರ್ 75% ಕ್ಕೆ ಸೀಮಿತ).',
      abt_s6: '6. ಜನಸಂದಣಿ ≥ 50%: ಸ್ಟ್ಯಾಂಡ್‌ಬೈ ಕೌಂಟರ್ ತೆರೆಯಿರಿ.',
      abt_s7: '7. ಜನಸಂದಣಿ ≥ 45%: ಸಿಬ್ಬಂದಿಗೆ 2 ನಿಮಿಷ ಮುಂಚಿತವಾಗಿ ಎಚ್ಚರಿಕೆ ಕಳುಹಿಸಿ.',
      abt_s8: '8. ಜನಸಂದಣಿ < 40%: ಸ್ಟ್ಯಾಂಡ್‌ಬೈ ಮುಚ್ಚಿ ಮತ್ತು ಕ್ರಾಸ್-ಆಕ್ಸೆಸ್ ಮರುಹೊಂದಿಸಿ.',
      abt_s9: '9. ಕಡಿಮೆ ಕಾಯುವ ಸಮಯದ ಕೌಂಟರ್ ಆಯ್ಕೆಮಾಡಿ ವಿದ್ಯಾರ್ಥಿ ಪರದೆ ಅಪ್‌ಡೇಟ್ ಮಾಡಿ.',

      abt_flowchart_title: 'ನಿರ್ಧಾರ ಫ್ಲೋಚಾರ್ಟ್',
      abt_res_title: 'ಅಳತೆ ಮಾಡಿದ ಫಲಿತಾಂಶಗಳು',
      abt_res_sub: 'ಜೈನ್ ವಿಶ್ವವಿದ್ಯಾಲಯದ ಕ್ಯಾಂಟೀನ್‌ನಲ್ಲಿ ಊಟದ ಸಮಯದಲ್ಲಿ ಸ್ಟಾಪ್‌ವಾಚ್ ಮೂಲಕ ನಡೆಸಲಾದ ಪರಿಶೀಲನೆ.',
      abt_r1_lbl: 'ಗರಿಷ್ಠ ಕಾಯುವ ಸಮಯ',
      abt_r1_val: '4.2 ನಿಮಿಷ',
      abt_r1_sub: '-63% ಇಳಿಕೆ (ಹಿಂದೆ 11.5 ನಿಮಿಷ)',
      abt_r2_lbl: 'ಗರಿಷ್ಠ ಕ್ಯೂ ಅಂತರ',
      abt_r2_val: '3 ವಿದ್ಯಾರ್ಥಿಗಳು',
      abt_r2_sub: 'ಹಿಂದೆ 14 ಇತ್ತು (ಸಮತೋಲಿತ)',
      abt_r3_lbl: 'ಸ್ಟ್ಯಾಂಡ್‌ಬೈ ವೇಗ',
      abt_r3_val: '1.4 ನಿಮಿಷ',
      abt_r3_sub: '45% ಮುನ್ಸೂಚನೆಗೆ ತಕ್ಷಣದ ಸ್ಪಂದನೆ',

      abt_team_title: 'ತಂಡ Decrypted',
      abt_team_sub: 'ಸ್ಮಾರ್ಟ್ ಮೆಸ್ ಕ್ಯೂ ಮ್ಯಾನೇಜರ್ ಯೋಜನೆಯ ಎಂಜಿನಿಯರಿಂಗ್ ತಂಡ.',

      // Help Page (help.html)
      help_eyebrow: 'ಬಳಕೆದಾರ ಮಾರ್ಗದರ್ಶಿ & ಬೆಂಬಲ',
      help_title: '<span>MQM</span> ಅನ್ನು ಹೇಗೆ ಬಳಸುವುದು',
      help_sub: 'ವಿದ್ಯಾರ್ಥಿಗಳು, ಹಾಸ್ಟೆಲ್ ನಿವಾಸಿಗಳು, ಸ್ವಯಂಸೇವಕರು ಮತ್ತು ಸಿಬ್ಬಂದಿಗಾಗಿ ಸಂಪೂರ್ಣ ಸೂಚನೆಗಳು.',
      
      h_sec1_title: 'ವಿದ್ಯಾರ್ಥಿ ಮತ್ತು ಹಾಸ್ಟೆಲ್ ಮಾರ್ಗದರ್ಶಿ',
      h_card1_title: 'ವೇಗದ ಕ್ಯೂ ಹುಡುಕುವುದು',
      h_card1_desc: 'ಊಟದ ಹಾಲ್‌ಗೆ ಹೋಗುವ ಮೊದಲು ನೈಜ ಸಮಯದ ಕ್ಯೂ ಪರಿಶೀಲಿಸಿ. ವ್ಯವಸ್ಥೆಯು ಕಡಿಮೆ ಕಾಯುವ ಸಮಯದ ಕೌಂಟರ್ ಅನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸೂಚಿಸುತ್ತದೆ.',
      
      h_card2_title: 'ಡಿಜಿಟಲ್ ಎಕ್ಸ್‌ಪ್ರೆಸ್ ಪಾಸ್',
      h_card2_desc: 'ರಾಷ್ಟ್ರೀಯ ಕೌಂಟರ್‌ನಲ್ಲಿ 80% ಕ್ಕಿಂತ ಹೆಚ್ಚು ಜನಸಂದಣಿ ಇದ್ದಾಗ "ಎಕ್ಸ್‌ಪ್ರೆಸ್ ಪಾಸ್ ಪಡೆಯಿರಿ" ಟ್ಯಾಪ್ ಮಾಡಿ. ಅಂತರರಾಷ್ಟ್ರೀಯ ಕೌಂಟರ್‌ಗೆ 15 ನಿಮಿಷದ ಪಾಸ್ ಸಿಗುತ್ತದೆ.',
      
      h_card3_title: '"ಖಾಲಿಯಾದಾಗ ತಿಳಿಸಿ"',
      h_card3_desc: 'ಕೊಠಡಿಯಲ್ಲಿ ಓದುತ್ತಿದ್ದೀರಾ? ಅಲರ್ಟ್ ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ, ಜನಸಂದಣಿ 50% ಕ್ಕಿಂತ ಕಡಿಮೆಯಾದಾಗ ಶಬ್ದದೊಂದಿಗೆ ನೋಟಿಫಿಕೇಶನ್ ಬರುತ್ತದೆ.',
      
      h_card4_title: 'ಕೊಠಡಿಗೆ ನೇರ ವಿತರಣೆ',
      h_card4_desc: 'ಜ್ವರ ಅಥವಾ ಗಾಯವಾಗಿದ್ದರೆ ರೂಮ್ ಡೆಲಿವರಿ ಫಾರ್ಮ್ ಭರ್ತಿ ಮಾಡಿ. ಲಘು ಆಹಾರ (ಖಿಚಡಿ/ಸೂಪ್) ಅಥವಾ ಸಾಮಾನ್ಯ ಥಾಲಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.',
      
      h_card5_title: '4-ಅಂಕಿಯ ಭದ್ರತಾ OTP',
      h_card5_desc: 'ಪ್ರತಿ ಆರ್ಡರ್‌ಗೂ 4-ಅಂಕಿಯ OTP ಸಿಗುತ್ತದೆ. ಊಟ ತಂದಾಗ ರನ್ನರ್‌ಗೆ ಈ ಕೋಡ್ ತೋರಿಸಿ ಊಟವನ್ನು ಪಡೆದುಕೊಳ್ಳಿ.',
      
      h_card6_title: 'ಕರ್ಮ ಪಾಯಿಂಟ್‌ಗಳನ್ನು ಗಳಿಸಿ',
      h_card6_desc: 'ಅನಾರೋಗ್ಯದಲ್ಲಿರುವ ವಿದ್ಯಾರ್ಥಿಗೆ ಊಟ ತಲುಪಿಸುವ ಸ್ವಯಂಸೇವಕರಾಗಿ +10 ಮೆಸ್ ಕರ್ಮ ಪಾಯಿಂಟ್‌ಗಳನ್ನು ಗಳಿಸಿ.',

      h_sec2_title: 'ಸಿಬ್ಬಂದಿ ಕಾರ್ಯಾಚರಣೆಗಳು',
      h_card7_title: 'ಸಿಬ್ಬಂದಿ ಪ್ರವೇಶ',
      h_card7_desc: 'ನ್ಯಾವ್‌ಬಾರ್‌ನಿಂದ ಸ್ಟಾಫ್ ಕನ್ಸೋಲ್ ತೆರೆಯಿರಿ. ಡೀಫಾಲ್ಟ್ ಪಿನ್ 1234 ನಮೂದಿಸಿ ಅಥವಾ ಇಮೇಲ್ ಮೂಲಕ ಲಾಗಿನ್ ಆಗಿ.',
      
      h_card8_title: 'ಕ್ಯೂ ನಿಯಂತ್ರಣಗಳು',
      h_card8_desc: 'ಸ್ಲೈಡರ್‌ಗಳು ಅಥವಾ + / − ಬಟನ್‌ಗಳನ್ನು ಬಳಸಿ ಕ್ಯೂ ನಿಯಂತ್ರಿಸಿ. ಆಹಾರ ಮುಗಿದಿದ್ದರೆ "ಸೋಲ್ಡ್ ಔಟ್" ಮಾರ್ಕ್ ಮಾಡಿ.',
      
      h_card9_title: 'ಅಡುಗೆ ಮನೆ ಮುನ್ಸೂಚನೆ ಎಚ್ಚರಿಕೆ',
      h_card9_desc: 'ಆಹಾರದ ರೇಟಿಂಗ್ 2.5★ ಕ್ಕಿಂತ ಕಡಿಮೆಯಾದರೆ ಅಡುಗೆ ಮನೆಗೆ ತಕ್ಷಣ ಅಲರ್ಟ್ ಹೋಗುತ್ತದೆ, ಇದರಿಂದ ಅಡುಗೆಯವರು ಸರಿಪಡಿಸಬಹುದು.',

      // Directory in Help Page
      h_dir_eyebrow: '03 · ಸಂಪರ್ಕ ಡೈರೆಕ್ಟರಿ',
      h_dir_title: 'ಮೆಸ್ ಸಿಬ್ಬಂದಿ ಮತ್ತು ತುರ್ತು ಸಂಪರ್ಕಗಳು',
      h_dir_sub: 'ಕ್ಯಾಂಟೀನ್ ಮೇಲ್ವಿಚಾರಕರು, ಮುಖ್ಯ ವಾರ್ಡನ್, ಆರೋಗ್ಯ ಕೇಂದ್ರ ಮತ್ತು ಡೆಲಿವರಿ ಡೆಸ್ಕ್‌ನ ನೇರ ಫೋನ್ ಸಂಖ್ಯೆಗಳು.',
      
      // FAQ in Help Page
      h_faq_eyebrow: '04 · ಸಾಮಾನ್ಯ ಪ್ರಶ್ನೆಗಳು',
      h_faq_title: 'ಪದೇ ಪದೇ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು',
      faq_q1: 'ಸ್ಟ್ಯಾಂಡ್‌ಬೈ ಕೌಂಟರ್ 80% ಬದಲಿಗೆ 50% ಕ್ಕೆ ಏಕೆ ತೆರೆಯುತ್ತದೆ?',
      faq_a1: '50% ಜನಸಂದಣಿಯಲ್ಲಿ ಸ್ಟ್ಯಾಂಡ್‌ಬೈ ತೆರೆಯುವುದರಿಂದ ಕ್ಯೂ ಹಾಲ್‌ನಲ್ಲಿ ಹಿಗ್ಗುವುದಿಲ್ಲ. 45% ನಲ್ಲಿ ಸಿದ್ಧತೆ ಮತ್ತು 50% ನಲ್ಲಿ ತೆರೆಯುವುದರಿಂದ ದಟ್ಟಣೆ ಉಂಟಾಗುವುದಿಲ್ಲ.',
      faq_q2: 'ಕ್ರಾಸ್-ಆಕ್ಸೆಸ್‌ನಲ್ಲಿ 75% ಮಿತಿ ಏನು?',
      faq_a2: 'ರಾಷ್ಟ್ರೀಯ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಅಂತರರಾಷ್ಟ್ರೀಯ ಕೌಂಟರ್ ಬಳಸಲು ಅವಕಾಶ ನೀಡಿದಾಗ, ಅಲ್ಲಿನ ಸಾಮರ್ಥ್ಯವನ್ನು 75% ಕ್ಕೆ ಸೀಮಿತಗೊಳಿಸಲಾಗುತ್ತದೆ.',
      faq_q3: 'ಅನಾರೋಗ್ಯವಿಲ್ಲದಿದ್ದರೂ ರೂಮ್ ಡೆಲಿವರಿ ಪಡೆಯಬಹುದೇ?',
      faq_a3: 'ರೂಮ್ ಡೆಲಿವರಿ ಕೇವಲ ಅನಾರೋಗ್ಯ ಅಥವಾ ಗಾಯಗೊಂಡ ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ಮಾತ್ರ ಸೀಮಿತವಾಗಿದೆ.',
      faq_q4: 'ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದಿದ್ದಾಗ ಸಿಸ್ಟಮ್ ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ?',
      faq_a4: 'MQM ಎಲ್ಲಾ ಮಾಹಿತಿಯನ್ನು ಬ್ರೌಸರ್‌ನ ಸ್ಥಳೀಯ ಸಂಗ್ರಹಣೆಯಲ್ಲಿ ಉಳಿಸುತ್ತದೆ. ಇಂಟರ್ನೆಟ್ ಬಂದಾಗ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಸಿಂಕ್ ಆಗುತ್ತದೆ.',
      faq_q5: 'ಕನ್ನಡ ಅಥವಾ ಹಿಂದಿಗೆ ಭಾಷೆಯನ್ನು ಬದಲಾಯಿಸುವುದು ಹೇಗೆ?',
      faq_a5: 'ಟಾಪ್ ನ್ಯಾವಿಗೇಶನ್ ಬಾರ್‌ನಲ್ಲಿರುವ EN / ಹಿಂ / ಕನ್ ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ. ಇದು ಎಲ್ಲಾ ಪರದೆಗಳಲ್ಲಿ ಸುಲಭವಾಗಿ ಭಾಷೆಯನ್ನು ಬದಲಾಯಿಸುತ್ತದೆ.',

      // Student View (student.html)
      st_title: 'ಸ್ಮಾರ್ಟ್ ಮೆಸ್ ಸಹಾಯಕ',
      st_rec_label: 'ನಿಮಗಾಗಿ ಅತ್ಯುತ್ತಮ ಕೌಂಟರ್',
      st_btn_nat: 'ರಾಷ್ಟ್ರೀಯ ವಿದ್ಯಾರ್ಥಿ',
      st_btn_int: 'ಅಂತರರಾಷ್ಟ್ರೀಯ ವಿದ್ಯಾರ್ಥಿ',
      st_tab_queue: '⚡ ಲೈವ್ ಕ್ಯೂ & ಕೌಂಟರ್',
      st_tab_delivery: '🛏️ ಕೋಣೆ ಡೆಲಿವರಿ',
      st_tab_menu: '⭐ ಇಂದಿನ ಮೆನು & ರೇಟಿಂಗ್',
      st_tab_waste: '🌱 ಶೂನ್ಯ ಆಹಾರ ವ್ಯರ್ಥ',
      st_claim_pass: '🎫 ಎಕ್ಸ್‌ಪ್ರೆಸ್ ಪಾಸ್ ಪಡೆಯಿರಿ ▶',
      st_push_alert: '🔔 ಜನಸಂದಣಿ < 50% ಆದಾಗ ತಿಳಿಸಿ',
      st_order_title: 'ಕೊಠಡಿಗೆ ಲಘು / ರೋಗಿ ಊಟ ಆರ್ಡರ್ ಮಾಡಿ',
      st_order_sub: 'ಜ್ವರ ಅಥವಾ ಗಾಯಗೊಂಡ ವಿದ್ಯಾರ್ಥಿಗಳ ಹಾಸ್ಟೆಲ್ ಕೊಠಡಿಗೆ ಆಹಾರ ವಿತರಣೆ ಸೇವೆ.',
      st_lbl_room: 'ಹಾಸ್ಟೆಲ್ ಬ್ಲಾಕ್ & ಕೊಠಡಿ ಸಂಖ್ಯೆ',
      st_lbl_reason: 'ಡೆಲಿವರಿ ಕಾರಣ',
      st_lbl_diet: 'ಆಹಾರದ ಆಯ್ಕೆ',
      st_opt_khichdi: 'ಲಘು ಆಹಾರ (ಖಿಚಡಿ + ಮೊಸರು + ಬಿಸಿ ಸೂಪ್)',
      st_opt_thali: 'ಪ್ರಮಾಣಿತ ಕ್ಯಾಂಟೀನ್ ಥಾಲಿ',
      st_opt_fever: 'ಹೆಚ್ಚಿನ ಜ್ವರ / ಶೀತ / ವೈರಲ್ ಕಾಯಿಲೆ',
      st_opt_injury: 'ದೈಹಿಕ ಗಾಯ (ಬೆನ್ನುನೋವು / ಮುರಿತ)',
      st_opt_isolated: 'ವೈದ್ಯಕೀಯ ಕ್ವಾರಂಟೈನ್ / ಪ್ರತ್ಯೇಕತೆ',
      st_btn_request: '🚀 ರೂಮ್ ಡೆಲಿವರಿ ವಿನಂತಿಸಿ',
      st_active_deliveries: 'ನಿಮ್ಮ ಇತ್ತೀಚಿನ ಡೆಲಿವರಿ ವಿನಂತಿಗಳು',
      st_volunteer_card: 'ಹಾಸ್ಟೆಲ್ ಪಿಯರ್ ಬಡಿ ಆಗಿ',
      st_volunteer_sub: 'ಅನಾರೋಗ್ಯದಲ್ಲಿರುವ ವಿದ್ಯಾರ್ಥಿಗೆ ಊಟ ತಲುಪಿಸಿ +10 ಮೆಸ್ ಕರ್ಮ ಅಂಕಗಳನ್ನು ಗಳಿಸಿ.',
      st_rate_heading: 'ಇಂದಿನ ಮೆನು & ಆಹಾರ ಗುಣಮಟ್ಟ ರೇಟಿಂಗ್',
      st_rate_sub: 'ವಿದ್ಯಾರ್ಥಿಗಳ ರೇಟಿಂಗ್ ಅಡುಗೆ ಮನೆಗೆ ತಲುಪುತ್ತದೆ, ಇದರಿಂದ ಗುಣಮಟ್ಟದ ಆಹಾರ ಖಚಿತವಾಗುತ್ತದೆ.',
      st_waste_heading: 'ಶೂನ್ಯ ಆಹಾರ ವ್ಯರ್ಥ ಹಾಜರಾತಿ ನೋಂದಣಿ',
      st_waste_sub: 'ಅಡುಗೆ ಆರಂಭಕ್ಕೂ ಮುನ್ನ ಅಡುಗೆ ಮನೆಗೆ ತಿಳಿಸಿ. ನಿಮ್ಮ ಹಾಜರಾತಿ ಆಹಾರ ವ್ಯರ್ಥವನ್ನು ತಡೆಯುತ್ತದೆ.',
      st_eat_yes: '🍽️ ನಾನು ಇಂದು ಮೆಸ್‌ನಲ್ಲಿ ಊಟ ಮಾಡುತ್ತೇನೆ',
      st_eat_no: '🚫 ಈ ಊಟವನ್ನು ಬಿಡುತ್ತಿದ್ದೇನೆ',

      // Staff View (staff.html)
      staff_title: 'ಕ್ಯಾಂಟೀನ್ ಸಿಬ್ಬಂದಿ ಕನ್ಸೋಲ್',
      staff_tab_queue: '🎛️ ಕ್ಯೂ & ಕೌಂಟರ್',
      staff_tab_dispatch: '🛏️ ರೂಮ್ ಡೆಲಿವರಿ',
      staff_tab_kitchen: '🍳 ಅಡುಗೆ ಮನೆ & ಆಹಾರ ಗುಣಮಟ್ಟ',
      staff_tab_waste: '🌱 ಹಾಜರಾತಿ ಮುನ್ಸೂಚನೆ',
      staff_tab_admin: '⚙️ ಸೆಟ್ಟಿಂಗ್ಸ್ & QR',
      staff_zone_crowd: 'ವಲಯ ಜನಸಂದಣಿ (ರಾಷ್ಟ್ರೀಯ ಸರಾಸರಿ)',
      staff_counter_state: 'ಕೌಂಟರ್ ಸ್ಥಿತಿ ಮತ್ತು ಹಸ್ತಚಾಲಿತ ನಿಯಂತ್ರಣಗಳು',
      staff_btn_open: 'ಸ್ಟ್ಯಾಂಡ್‌ಬೈ ತೆರೆಯಿರಿ',
      staff_btn_close: 'ಸ್ಟ್ಯಾಂಡ್‌ಬೈ ಮುಚ್ಚಿ',
      staff_btn_force: 'ಕ್ರಾಸ್-ಆಕ್ಸೆಸ್ ಆನ್ ಮಾಡಿ',
      staff_btn_auto: 'ಆಟೋ ಮೋಡ್',
      staff_canteen_qr: 'ಕ್ಯಾಂಟೀನ್ ಪ್ರವೇಶ QR ಕೋಡ್',
      staff_qr_desc: 'ಈ ಕೋಡ್ ಅನ್ನು ಮುದ್ರಿಸಿ ಕ್ಯಾಂಟೀನ್ ಪ್ರವೇಶದ್ವಾರದಲ್ಲಿ ಅಂಟಿಸಿ. ವಿದ್ಯಾರ್ಥಿಗಳು ಸ್ಕ್ಯಾನ್ ಮಾಡುತ್ತಾರೆ:'
    }
  };

  const I18N = {
    current: localStorage.getItem(STORAGE_KEY) || 'en',

    get(key, fallback) {
      const d = DICT[this.current] || DICT.en;
      return d[key] || (DICT.en && DICT.en[key]) || fallback || key;
    },

    setLang(lang) {
      if (!LANG_ORDER.includes(lang)) lang = 'en';
      this.current = lang;
      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch (e) {}
      this.apply();
      window.dispatchEvent(new CustomEvent('mqm-language-changed', { detail: { lang } }));
    },

    cycleLang() {
      const idx = LANG_ORDER.indexOf(this.current);
      const next = LANG_ORDER[(idx + 1) % LANG_ORDER.length];
      this.setLang(next);
      return next;
    },

    getCycleLabel() {
      if (this.current === 'en') return 'EN / हिं / ಕನ್';
      if (this.current === 'hi') return 'हिं / ಕನ್ / EN';
      return 'ಕನ್ / EN / हिं';
    },

    apply() {
      const lang = this.current;
      const cycleLabel = this.getCycleLabel();

      // Update all language toggle buttons
      const btnSelectors = [
        '#lang-toggle',
        '#about-lang-btn',
        '#help-lang-btn',
        '#student-lang-btn',
        '#staff-lang-btn',
        '#login-lang-btn',
        '.lang-btn-fixed'
      ];
      btnSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(b => {
          b.textContent = cycleLabel;
          b.setAttribute('title', 'Switch language (EN / Hindi / Kannada)');
        });
      });

      // Update data-i18n elements
      document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const val = this.get(key);
        if (val) el.textContent = val;
      });

      // Update data-i18n-html elements (for formatting like <span>, <b>, <code>)
      document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        const val = this.get(key);
        if (val) el.innerHTML = val;
      });

      // Update data-i18n-placeholder elements
      document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const val = this.get(key);
        if (val) el.setAttribute('placeholder', val);
      });

      // Update data-i18n-title elements
      document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        const val = this.get(key);
        if (val) el.setAttribute('title', val);
      });

      // Update HTML lang attribute
      document.documentElement.lang = lang;
    },

    init() {
      this.current = localStorage.getItem(STORAGE_KEY) || 'en';
      this.apply();

      // Attach click listeners to language toggle buttons
      const btnSelectors = [
        '#lang-toggle',
        '#about-lang-btn',
        '#help-lang-btn',
        '#student-lang-btn',
        '#staff-lang-btn',
        '#login-lang-btn',
        '.lang-btn-fixed'
      ];
      btnSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(b => {
          if (!b.dataset.i18nBound) {
            b.dataset.i18nBound = 'true';
            b.addEventListener('click', (e) => {
              e.preventDefault();
              I18N.cycleLang();
            });
          }
        });
      });

      // Listen for language changes in other tabs
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY && e.newValue && e.newValue !== I18N.current) {
          I18N.current = e.newValue;
          I18N.apply();
        }
      });
    }
  };

  global.MQM_I18N = I18N;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => I18N.init());
  } else {
    I18N.init();
  }
})(typeof window !== 'undefined' ? window : this);
