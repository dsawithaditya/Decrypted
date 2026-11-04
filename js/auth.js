/* ====================================================================
   auth.js: Shared Auth & Session Manager for Mess Queue Manager
   Team Decrypted · SE-302A · Jain University Canteen Mess
   ==================================================================== */
(function (root) {
  'use strict';

  const Auth = {
    getUser() {
      if (root.Store && root.Store.getUser) {
        return root.Store.getUser();
      }
      try {
        const raw = localStorage.getItem('mqm-user-v2');
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    },

    setUser(user) {
      if (root.Store && root.Store.saveUser) {
        root.Store.saveUser(user);
      } else {
        localStorage.setItem('mqm-user-v2', JSON.stringify(user));
      }
      this.renderNavUser();
    },

    async logout() {
      if (root.Store && root.Store.logout) {
        await root.Store.logout();
      } else {
        localStorage.removeItem('mqm-user-v2');
      }
      sessionStorage.removeItem('mqm-staff-ok');
      window.location.href = 'login.html';
    },

    renderNavUser() {
      const container = document.getElementById('nav-user-slot');
      if (!container) return;

      const user = this.getUser();
      // If NOT signed in: only show Sign In button (no Profile button)
      if (!user) {
        container.innerHTML = `
          <a class="btn btn-sm btn-gold nav-auth-btn" href="login.html">Sign In ▶</a>
        `;
        return;
      }

      // If SIGNED IN: Profile button and Logout action are visible (uncluttered navbar)
      if (user.role === 'staff' || user.role === 'admin') {
        container.innerHTML = `
          <a class="btn btn-sm btn-cyan" href="staff.html" data-i18n="nav_profile" title="Staff Console">Profile</a>
          <button class="btn btn-sm btn-red user-logout-btn" type="button" data-i18n="nav_exit" title="Log Out">Lock</button>
        `;
      } else {
        container.innerHTML = `
          <a class="btn btn-sm btn-cyan" href="login.html" data-i18n="nav_profile" title="View / Edit Profile">Profile</a>
          <button class="btn btn-sm btn-red user-logout-btn" type="button" data-i18n="nav_exit" title="Log Out">Exit</button>
        `;
      }

      if (root.MQM_I18N) {
        root.MQM_I18N.apply();
      }

      container.querySelector('.user-logout-btn')?.addEventListener('click', () => {
        Auth.logout();
      });
    },

    initNavbar() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.renderNavUser());
      } else {
        this.renderNavUser();
      }
    }
  };

  root.Auth = Auth;
  Auth.initNavbar();
})(typeof window !== 'undefined' ? window : globalThis);
