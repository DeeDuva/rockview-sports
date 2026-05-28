// db.js - LocalStorage data layer (replaces server API calls)

// Helper to safely parse JSON from localStorage
function getArray(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch (e) {
    console.error('Corrupted data for', key, e);
    return [];
  }
}

function setArray(key, arr) {
  localStorage.setItem(key, JSON.stringify(arr));
}

// Initialize default data if not present (admin account only, matches, results, news empty)
(function initData() {
  if (!localStorage.getItem('admins')) {
    // default admin credentials (username: admin, password: Admin@123)
    const defaultAdmins = [{ username: 'admin', password: 'Admin@123', name: 'Administrator' }];
    setArray('admins', defaultAdmins);
  }
  if (!localStorage.getItem('matches')) setArray('matches', []);
  if (!localStorage.getItem('results')) setArray('results', []);
  if (!localStorage.getItem('news')) setArray('news', []);
})();

const DB = {
  // --- MATCHES CRUD ---
  async getMatches() {
    const data = localStorage.getItem('matches');
    return data ? JSON.parse(data) : [];
  },
  async saveMatch(matchData) {
    const matches = await this.getMatches();
    if (!matchData.id) matchData.id = 'm_' + Date.now();
    const idx = matches.findIndex(m => m.id === matchData.id);
    if (idx >= 0) matches[idx] = matchData; else matches.push(matchData);
    localStorage.setItem('matches', JSON.stringify(matches));
    return matchData;
  },
  async deleteMatch(id) {
    let matches = await this.getMatches();
    matches = matches.filter(m => m.id !== id);
    localStorage.setItem('matches', JSON.stringify(matches));
    return true;
  },

  // --- RESULTS CRUD ---
  async getResults() {
    return getArray('results');
  },
  async saveResult(resultData) {
    const results = getArray('results');
    if (resultData.id) {
      const idx = results.findIndex(r => r.id === resultData.id);
      if (idx !== -1) results[idx] = resultData;
      else results.push(resultData);
    } else {
      resultData.id = 'r_' + Date.now();
      results.push(resultData);
    }
    setArray('results', results);
    return resultData;
  },
  async deleteResult(id) {
    const results = getArray('results').filter(r => r.id !== id);
    setArray('results', results);
    return true;
  },

  // --- NEWS CRUD ---
  async getNews() {
    return getArray('news');
  },
  async saveNews(newsData) {
    const news = getArray('news');
    if (newsData.id) {
      const idx = news.findIndex(n => n.id === newsData.id);
      if (idx !== -1) news[idx] = newsData;
      else news.push(newsData);
    } else {
      newsData.id = 'n_' + Date.now();
      news.push(newsData);
    }
    setArray('news', news);
    return newsData;
  },
  async deleteNews(id) {
    const news = getArray('news').filter(n => n.id !== id);
    setArray('news', news);
    return true;
  },

  // --- ADMIN CRUD (protected) ---
  async getAdmins() {
    // Returns full admin objects (with password) for auth system
    return getArray('admins');
  },
  
  async getAdminsForDisplay() {
    // Returns admin objects without passwords for UI display
    const admins = getArray('admins');
    return admins.map(a => ({ username: a.username, name: a.name }));
  },

  async addAdmin(adminData) {
    const admins = getArray('admins');
    if (admins.some(a => a.username.toLowerCase() === adminData.username.toLowerCase())) {
      throw new Error('Admin username already exists.');
    }
    // Store password (in production, use hashing on server)
    admins.push({
      username: adminData.username,
      password: adminData.password,
      name: adminData.name
    });
    setArray('admins', admins);
    return { username: adminData.username, name: adminData.name };
  },

  async updateAdmin(username, updates) {
    const admins = getArray('admins');
    const idx = admins.findIndex(a => a.username.toLowerCase() === username.toLowerCase());
    if (idx === -1) {
      throw new Error('Admin not found.');
    }
    // Update allowed fields
    if (updates.name) admins[idx].name = updates.name;
    if (updates.password) admins[idx].password = updates.password;
    setArray('admins', admins);
    return { username: admins[idx].username, name: admins[idx].name };
  },

  async deleteAdmin(username) {
    const admins = getArray('admins');
    if (admins.length === 1) {
      throw new Error('Cannot delete the last admin account.');
    }
    const filtered = admins.filter(a => a.username.toLowerCase() !== username.toLowerCase());
    if (filtered.length === admins.length) {
      throw new Error('Admin not found.');
    }
    setArray('admins', filtered);
    return true;
  }
};

// Expose globally for the rest of the app
window.DB = DB;
window.BACKEND_URL = null; // no remote backend
