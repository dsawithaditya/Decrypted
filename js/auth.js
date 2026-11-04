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
      if (!user) {
        container.innerHTML = `
          <a class="btn btn-sm btn-gold" href="login.html">Sign In ▶</a>
        `;
        return;
      }

      if (user.role === 'staff' || user.role === 'admin') {
        container.innerHTML = `
          <div class="user-chip user-chip-staff">
            <span class="user-avatar-tag">STAFF</span>
            <span class="user-name">${user.fullName || 'Mess In-Charge'}</span>
            <button class="btn btn-sm btn-red user-logout-btn" type="button" title="Log Out">Lock</button>
          </div>
        `;
      } else {
        const typeChip = user.studentType === 'international' ? 'INTL' : 'NAT';
        container.innerHTML = `
          <div class="user-chip">
            <span class="user-avatar-tag">${typeChip}</span>
            <span class="user-name">${user.fullName || 'Student'} (${user.roomNumber || 'Room'})</span>
            <button class="btn btn-sm user-logout-btn" type="button" title="Log Out">Exit</button>
          </div>
        `;
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

