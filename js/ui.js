/* Shared UI: mobile menu, year, scroll-reveal animation, i18n initialization */
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

  // 3. Scroll-Reveal Animation for Arcade Boxes & Cards (Request 5)
  const targets = document.querySelectorAll('.reveal, .card, .pillar, .contact-card, .pixel-box, .stat-hud-card');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -30px 0px'
    });

    targets.forEach(el => {
      el.classList.add('reveal');
      io.observe(el);
    });
  } else {
    targets.forEach(el => el.classList.add('in'));
  }

  // 4. Trigger i18n application if loaded
  if (window.MQM_I18N) {
    window.MQM_I18N.apply();
  }
});
