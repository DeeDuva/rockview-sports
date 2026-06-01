// db.js - API data layer (connects to backend at localhost:3001)

const BACKEND_URL = 'http://localhost:3001';

// Helper: get stored JWT token (set on login)
function getToken() {
    return sessionStorage.getItem('rvs_token') || localStorage.getItem('rvs_token') || null;
}

// Helper: build auth headers
function authHeaders() {
    const token = getToken();
    return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

// Helper: fetch wrapper with error handling
async function apiFetch(path, options = {}) {
    const res = await fetch(`${BACKEND_URL}${path}`, {
        ...options,
        headers: { ...authHeaders(), ...(options.headers || {}) }
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
}

const DB = {
    // --- MATCHES ---
    async getMatches() {
        return apiFetch('/api/matches');
    },
    async saveMatch(matchData) {
        return apiFetch('/api/matches', {
            method: 'POST',
            body: JSON.stringify(matchData)
        });
    },
    async deleteMatch(id) {
        return apiFetch(`/api/matches/${id}`, { method: 'DELETE' });
    },

    // --- RESULTS ---
    async getResults() {
        return apiFetch('/api/results');
    },
    async saveResult(resultData) {
        return apiFetch('/api/results', {
            method: 'POST',
            body: JSON.stringify(resultData)
        });
    },
    async deleteResult(id) {
        return apiFetch(`/api/results/${id}`, { method: 'DELETE' });
    },

    // --- NEWS ---
    async getNews() {
        return apiFetch('/api/news');
    },
    async saveNews(newsData) {
        return apiFetch('/api/news', {
            method: 'POST',
            body: JSON.stringify(newsData)
        });
    },
    async deleteNews(id) {
        return apiFetch(`/api/news/${id}`, { method: 'DELETE' });
    },

    // --- ADMINS ---
    async getAdmins() {
        return apiFetch('/api/admins');
    },
    async addAdmin(adminData) {
        return apiFetch('/api/admins', {
            method: 'POST',
            body: JSON.stringify(adminData)
        });
    },
    async deleteAdmin(username) {
        return apiFetch(`/api/admins/${username}`, { method: 'DELETE' });
    },

    // --- AUTH ---
    async login(username, password) {
        const data = await apiFetch('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        // Store token for subsequent requests
        if (data.token) {
            sessionStorage.setItem('rvs_token', data.token);
            localStorage.setItem('rvs_token', data.token);
        }
        return data;
    },
    logout() {
        sessionStorage.removeItem('rvs_token');
        localStorage.removeItem('rvs_token');
    }
};

// Expose globally
window.DB = DB;
window.BACKEND_URL = BACKEND_URL;
