/* Shared UI: mobile menu, year, scroll-reveal, interactive boxes, moving clouds, i18n */
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

  // Helper: Spawn retro 8-bit Gold & Cyan pixel sparkles at screen coordinates
  const spawnPixelSparkles = (clientX, clientY, count = 6) => {
    const colors = ['#ffcf3f', '#5fe3ff', '#3ddc84', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const spark = document.createElement('span');
      spark.className = 'cloud-sparkle';
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.5 - 0.25);
      const dist = 22 + Math.random() * 28;
      spark.style.left = `${clientX - 3}px`;
      spark.style.top = `${clientY - 3}px`;
      spark.style.background = colors[i % colors.length];
      spark.style.setProperty('--tx', `${Math.round(Math.cos(angle) * dist)}px`);
      spark.style.setProperty('--ty', `${Math.round(Math.sin(angle) * dist - 10)}px`);
      document.body.appendChild(spark);
      setTimeout(() => spark.remove(), 560);
    }
  };

  // 5. Universal Box Arrow-Hover Spotlight & Clickable Arcade Bounce
  const BOX_SELECTOR = '.card, .contact-card, .ccard, .menu-card, .hud-item, .callout, .express-pass-card';

  document.addEventListener('pointermove', (e) => {
    const box = e.target.closest(BOX_SELECTOR);
    if (!box) return;
    const rect = box.getBoundingClientRect();
    box.style.setProperty('--mx', `${Math.round(e.clientX - rect.left)}px`);
    box.style.setProperty('--my', `${Math.round(e.clientY - rect.top)}px`);
  }, { passive: true });

  document.addEventListener('pointerout', (e) => {
    const box = e.target.closest(BOX_SELECTOR);
    if (box && !box.contains(e.relatedTarget)) {
      box.style.setProperty('--mx', '50%');
      box.style.setProperty('--my', '-200%');
    }
  }, { passive: true });

  document.addEventListener('click', (e) => {
    const box = e.target.closest(BOX_SELECTOR);
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

    // Spawn subtle 8-bit pixel sparks at the cursor
    spawnPixelSparkles(e.clientX, e.clientY, 5);
  });

  // 6. Moving & Interactive Pixel Clouds across all Sky Hero sections
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
      // Inject 2 floating pixel clouds into page-sky headers (About, Help, Student, Staff, Login)
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
      spawnPixelSparkles(e.clientX, e.clientY, 5);
    });

    cloud.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - lastCloudSparkTime > 180) {
        lastCloudSparkTime = now;
        spawnPixelSparkles(e.clientX, e.clientY, 2);
      }
    });

    cloud.addEventListener('click', (e) => {
      e.stopPropagation();
      cloud.classList.remove('cloud-jump');
      void cloud.getBoundingClientRect();
      cloud.classList.add('cloud-jump');
      spawnPixelSparkles(e.clientX, e.clientY, 8);
      setTimeout(() => cloud.classList.remove('cloud-jump'), 520);
    });
  });

  // 7. Trigger i18n application if loaded
  if (window.MQM_I18N) {
    window.MQM_I18N.apply();
  }
});
