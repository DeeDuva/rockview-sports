// auth.js - Authentication & Session Management (localStorage version)
const SESSION_KEY = 'rvs_current_session';
const AUTH_TOKEN = 'rvs_auth_token';
const DUMMY_TOKEN = 'dummy-jwt-token';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME_MS = 30 * 1000; // 30 seconds

const Auth = {
  // Hard-coded admin login using localStorage data
  async login(username, password) {
    // Check rate limiting
    const lockoutUntil = parseInt(localStorage.getItem('rvs_lockout_until') || '0');
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const secondsLeft = Math.ceil((lockoutUntil - Date.now()) / 1000);
      throw new Error(`Account locked. Try again in ${secondsLeft} seconds.`);
    }

    try {
      const data = await DB.login(username, password);
      // Backend returns: { token, user: { username, name } }
      // We set the legacy session info that auth.js and admin.js expect:
      sessionStorage.setItem('rvs_auth_token', data.token);
      const session = {
        username: data.user.username,
        name: data.user.name,
        loginTime: Date.now()
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

      // Clear login failures on successful login
      localStorage.removeItem('rvs_login_failures');
      localStorage.removeItem('rvs_lockout_until');
      return session;
    } catch (err) {
      this._incrementLoginFailures();
      throw err;
    }
  },

  // Handle login failures for rate limiting
  _incrementLoginFailures() {
    let failures = parseInt(localStorage.getItem('rvs_login_failures') || '0');
    failures++;
    localStorage.setItem('rvs_login_failures', failures.toString());

    if (failures >= MAX_LOGIN_ATTEMPTS) {
      const lockoutUntil = Date.now() + LOCKOUT_TIME_MS;
      localStorage.setItem('rvs_lockout_until', lockoutUntil.toString());
      localStorage.setItem('rvs_login_failures', '0');
    }
  },

  getLockoutInfo() {
    const lockoutUntil = parseInt(localStorage.getItem('rvs_lockout_until') || '0');
    const remaining = lockoutUntil && Date.now() < lockoutUntil
      ? Math.ceil((lockoutUntil - Date.now()) / 1000)
      : 0;
    return {
      locked: lockoutUntil && Date.now() < lockoutUntil,
      remaining
    };
  },

  // Session validation (2-hour expiry)
  isLoggedIn() {
    const token = sessionStorage.getItem(AUTH_TOKEN);
    const sessionData = sessionStorage.getItem(SESSION_KEY);
    if (!token || !sessionData) return false;
    try {
      const session = JSON.parse(sessionData);
      const expiryTime = 2 * 60 * 60 * 1000; // 2 hours
      if (Date.now() - session.loginTime > expiryTime) {
        this.logout();
        return false;
      }
      return true;
    } catch (e) {
      this.logout();
      return false;
    }
  },

  getCurrentUser() {
    return this.isLoggedIn() ? JSON.parse(sessionStorage.getItem(SESSION_KEY)) : null;
  },

  // Verify credentials without creating a session (returns true/false)
  async verifyCredentials(username, password) {
    try {
      const response = await fetch(`${window.BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      return response.ok;
    } catch (e) {
      return false;
    }
  },

  logout() {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(AUTH_TOKEN);
    window.location.href = 'login.html';
  },

  // Redirect helpers used by pages
  requireAuth() {
    if (!this.isLoggedIn()) window.location.href = 'login.html';
  },
  redirectIfAuthenticated() {
    if (this.isLoggedIn()) window.location.href = 'admin.html';
  }
};

// Expose globally
window.Auth = Auth;
