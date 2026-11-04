/* Shared UI: mobile menu, year, scroll-reveal, interactive boxes, moving clouds, 8-bit pixel arrow follower, i18n */
document.documentElement.classList.add('js');

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile navigation menu toggle
  const btn = document.getElementById('menu-btn');
  const links = document.getElementById('nav-links');
  if (btn && links) {
    btn.addEventListener('click', () => {
      const open = links.classList.toggle('open');
      btn.setAttribute('aria-expanded', open);
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
  }

  // 2. Dynamic Year
  document.querySelectorAll('[data-year]').forEach(e => (e.textContent = new Date().getFullYear()));

  // 3. Tag standalone emoji icon headers inside .card so they bounce on hover
  document.querySelectorAll('.card > div:first-child').forEach(div => {
    if (div.children.length === 0 && div.textContent.trim().length > 0 && div.textContent.trim().length <= 4) {
      div.classList.add('box-emoji-icon');
    }
  });

  // 4. Scroll-Reveal Animation for Arcade Boxes & Cards
  const markRevealReady = (el) => {
    el.addEventListener('animationend', () => el.classList.add('reveal-ready'), { once: true });
    setTimeout(() => el.classList.add('reveal-ready'), 650);
  };

  const targets = document.querySelectorAll('.reveal, .card, .pillar, .contact-card, .pixel-box, .stat-hud-card');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          markRevealReady(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.06,
      rootMargin: '0px 0px -20px 0px'
    });

    targets.forEach(el => {
      el.classList.add('reveal');
      io.observe(el);
    });
  } else {
    targets.forEach(el => {
      el.classList.add('in', 'reveal-ready');
    });
  }

  // Helper: Spawn retro 8-bit Gold, Cyan, Green & White pixel squares (matching 1st image)
  const PIXEL_COLORS = ['#ffcf3f', '#5fe3ff', '#3ddc84', '#ffffff'];
  const spawnPixelSparkles = (clientX, clientY, count = 8, spread = 28) => {
    for (let i = 0; i < count; i++) {
      const spark = document.createElement('span');
      spark.className = 'cloud-sparkle';
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.6 - 0.3);
      const dist = 8 + Math.random() * spread;
      const size = 7 + Math.floor(Math.random() * 6); // 7px to 12px crisp 8-bit blocks
      const offsetX = Math.round((Math.random() - 0.5) * 12);
      const offsetY = Math.round((Math.random() - 0.5) * 12);
      spark.style.left = `${clientX + offsetX - size / 2}px`;
      spark.style.top = `${clientY + offsetY - size / 2}px`;
      spark.style.setProperty('--sz', `${size}px`);
      spark.style.background = PIXEL_COLORS[i % PIXEL_COLORS.length];
      spark.style.setProperty('--tx', `${Math.round(Math.cos(angle) * dist)}px`);
      spark.style.setProperty('--ty', `${Math.round(Math.sin(angle) * dist - 6)}px`);
      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 660);
    }
  };

  // 5. Custom 8-Bit Pixel HUD Reticle + Pixel Square Core + Pixel Trail across whole website
  const cursorDot = document.createElement('div');
  cursorDot.className = 'mqm-cursor-dot';
  cursorDot.setAttribute('aria-hidden', 'true');

  const cursorRing = document.createElement('div');
  cursorRing.className = 'mqm-cursor-ring';
  cursorRing.setAttribute('aria-hidden', 'true');
  cursorRing.innerHTML = `
    <svg viewBox="0 0 24 24" shape-rendering="crispEdges">
      <g class="reticle-main">
        <!-- Top-Left Pixel Bracket -->
        <rect x="0" y="0" width="7" height="2" />
        <rect x="0" y="2" width="2" height="5" />
        <rect x="2" y="2" width="2" height="2" />
        <!-- Top-Right Pixel Bracket -->
        <rect x="17" y="0" width="7" height="2" />
        <rect x="22" y="2" width="2" height="5" />
        <rect x="20" y="2" width="2" height="2" />
        <!-- Bottom-Left Pixel Bracket -->
        <rect x="0" y="22" width="7" height="2" />
        <rect x="0" y="17" width="2" height="5" />
        <rect x="2" y="20" width="2" height="2" />
        <!-- Bottom-Right Pixel Bracket -->
        <rect x="17" y="22" width="7" height="2" />
        <rect x="22" y="17" width="2" height="5" />
        <rect x="20" y="20" width="2" height="2" />
      </g>
      <g class="reticle-accent">
        <!-- 4 Cardinal Pixel Crosshair Ticks -->
        <rect x="11" y="0" width="2" height="2" />
        <rect x="11" y="22" width="2" height="2" />
        <rect x="0" y="11" width="2" height="2" />
        <rect x="22" y="11" width="2" height="2" />
      </g>
    </svg>
  `;

  document.body.appendChild(cursorRing);
  document.body.appendChild(cursorDot);

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;
  let lastTrailX = -100;
  let lastTrailY = -100;
  let lastTrailTime = 0;
  let cursorInitialized = false;

  const INTERACTIVE_SELECTOR = 'a, button, .btn, .card, .contact-card, .ccard, .menu-card, .cloud, .subtab, .seg, .hud-item, .callout, .express-pass-card, input, select, textarea, summary';

  const animateCursor = () => {
    if (cursorInitialized) {
      // Smooth spring lerp for the outer 8-bit pixel HUD reticle
      ringX += (mouseX - ringX) * 0.25;
      ringY += (mouseY - ringY) * 0.25;
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      cursorRing.style.transform = `translate3d(${ringX.toFixed(1)}px, ${ringY.toFixed(1)}px, 0) translate(-50%, -50%)`;
    }
    requestAnimationFrame(animateCursor);
  };
  requestAnimationFrame(animateCursor);

  // 6. Universal Box Arrow-Hover Spotlight, Cursor Follower Tracking & Clickable Arcade Bounce
  const BOX_SELECTOR = '.card, .contact-card, .ccard, .menu-card, .hud-item, .callout, .express-pass-card';

  document.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;

    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!cursorInitialized) {
      ringX = mouseX;
      ringY = mouseY;
      cursorInitialized = true;
      cursorDot.classList.add('is-visible');
      cursorRing.classList.add('is-visible');
    }

    // Toggle hover state on custom cursor when over interactive elements
    const isInteractive = Boolean(e.target && e.target.closest && e.target.closest(INTERACTIVE_SELECTOR));
    cursorDot.classList.toggle('is-hover', isInteractive);
    cursorRing.classList.toggle('is-hover', isInteractive);

    // Emit 8-bit pixel trail blocks as arrow moves across website (1st image effect)
    const now = Date.now();
    const distMoved = Math.hypot(mouseX - lastTrailX, mouseY - lastTrailY);
    if (distMoved > 14 && now - lastTrailTime > 34) {
      lastTrailX = mouseX;
      lastTrailY = mouseY;
      lastTrailTime = now;
      spawnPixelSparkles(mouseX, mouseY, 4, 20);
    }

    // Update box spotlight coordinates if hovering a box
    const box = e.target.closest ? e.target.closest(BOX_SELECTOR) : null;
    if (box) {
      const rect = box.getBoundingClientRect();
      box.style.setProperty('--mx', `${Math.round(e.clientX - rect.left)}px`);
      box.style.setProperty('--my', `${Math.round(e.clientY - rect.top)}px`);
    }
  }, { passive: true });

  document.addEventListener('pointerdown', (e) => {
    cursorDot.classList.add('is-down');
    cursorRing.classList.add('is-down');
    // Rich burst of 8-bit pixel squares on every click anywhere on the website (1st image effect)
    spawnPixelSparkles(e.clientX, e.clientY, 10, 32);
  }, { passive: true });

  document.addEventListener('pointerup', () => {
    cursorDot.classList.remove('is-down');
    cursorRing.classList.remove('is-down');
  }, { passive: true });

  document.addEventListener('mouseleave', () => {
    cursorDot.classList.remove('is-visible');
    cursorRing.classList.remove('is-visible');
    cursorInitialized = false;
  });

  document.addEventListener('pointerout', (e) => {
    const box = e.target.closest ? e.target.closest(BOX_SELECTOR) : null;
    if (box && !box.contains(e.relatedTarget)) {
      box.style.setProperty('--mx', '50%');
      box.style.setProperty('--my', '-200%');
    }
  }, { passive: true });

  document.addEventListener('click', (e) => {
    const box = e.target.closest ? e.target.closest(BOX_SELECTOR) : null;
    if (!box) return;

    // Trigger clickable arcade press & bounce animation
    box.classList.remove('box-clicked');
    void box.offsetWidth; // Reflow to restart animation
    box.classList.add('box-clicked');
    setTimeout(() => box.classList.remove('box-clicked'), 420);

    // Spawn retro pixel ripple inside the box at click coordinates
    const rect = box.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'pixel-click-ripple';
    ripple.style.left = `${Math.round(e.clientX - rect.left)}px`;
    ripple.style.top = `${Math.round(e.clientY - rect.top)}px`;
    box.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  });

  // 7. Moving & Interactive Pixel Clouds across all Sky Hero sections
  const CLOUD_SVG_MARKUP = `
    <g fill="#fff">
      <rect x="10" y="0" width="8" height="2" />
      <rect x="8" y="2" width="18" height="2" />
      <rect x="4" y="4" width="24" height="2" />
      <rect x="2" y="6" width="28" height="2" />
      <rect x="0" y="8" width="32" height="2" />
    </g>
    <rect x="0" y="10" width="32" height="2" fill="#cfe3f7" />
  `;

  document.querySelectorAll('.sky').forEach(sky => {
    const existingClouds = sky.querySelectorAll('.cloud');
    if (existingClouds.length === 0) {
      // Inject 2 floating pixel clouds into page-sky headers (About, Help, Student, Staff, Login, Tests)
      const c1 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      c1.setAttribute('class', 'cloud');
      c1.setAttribute('viewBox', '0 0 32 12');
      c1.setAttribute('shape-rendering', 'crispEdges');
      c1.setAttribute('aria-hidden', 'true');
      c1.style.cssText = 'top:76px;right:8%;width:145px;--dur:9s';
      c1.innerHTML = CLOUD_SVG_MARKUP;

      const c2 = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      c2.setAttribute('class', 'cloud');
      c2.setAttribute('viewBox', '0 0 32 12');
      c2.setAttribute('shape-rendering', 'crispEdges');
      c2.setAttribute('aria-hidden', 'true');
      c2.style.cssText = 'top:138px;right:26%;width:105px;--dur:12s;opacity:0.9';
      c2.innerHTML = CLOUD_SVG_MARKUP;

      sky.insertBefore(c2, sky.firstChild);
      sky.insertBefore(c1, sky.firstChild);
    } else {
      // Speed up existing clouds so continuous movement is lively and clearly visible
      existingClouds.forEach((c, idx) => {
        c.style.setProperty('--dur', idx % 2 === 0 ? '9s' : '12s');
      });
    }
  });

  // Attach hover and click interactions to all pixel clouds
  let lastCloudSparkTime = 0;
  document.querySelectorAll('.cloud').forEach(cloud => {
    cloud.addEventListener('mouseenter', (e) => {
      spawnPixelSparkles(e.clientX, e.clientY, 10, 28);
    });

    cloud.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - lastCloudSparkTime > 100) {
        lastCloudSparkTime = now;
        spawnPixelSparkles(e.clientX, e.clientY, 5, 22);
      }
    });

    cloud.addEventListener('click', (e) => {
      e.stopPropagation();
      cloud.classList.remove('cloud-jump');
      void cloud.getBoundingClientRect();
      cloud.classList.add('cloud-jump');
      spawnPixelSparkles(e.clientX, e.clientY, 14, 34);
      setTimeout(() => cloud.classList.remove('cloud-jump'), 520);
    });
  });

  // 8. Trigger i18n application if loaded
  if (window.MQM_I18N) {
    window.MQM_I18N.apply();
  }
});
