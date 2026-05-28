/**
 * admin.js - Admin Portal Logic
 * Implements CRUD actions, tab switching, and auth triggers.
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Guard check (double safety)
    if (!window.Auth || !window.Auth.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const currentUser = window.Auth.getCurrentUser();
    
    // 2. Set Admin User Info
    const adminDisplayName = document.getElementById('adminDisplayName');
    const adminAvatar = document.getElementById('adminAvatar');
    if (currentUser) {
        adminDisplayName.innerText = currentUser.name;
        adminAvatar.innerText = currentUser.name.charAt(0).toUpperCase();
    }

    // 3. Log out button
    document.getElementById('adminLogoutBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to log out?')) {
            window.Auth.logout();
        }
    });

    // 4. Tab navigation switching
    const navItems = document.querySelectorAll('.admin-nav-item');
    const views = document.querySelectorAll('.admin-view');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetView = item.getAttribute('data-view');
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            views.forEach(view => {
                if (view.id === targetView) {
                    view.classList.add('active');
                } else {
                    view.classList.remove('active');
                }
            });
        });
    });

    // --- DOM Elements ---
    // Tables
    const footballMatchesBody = document.getElementById('footballMatchesBody');
    const basketballMatchesBody = document.getElementById('basketballMatchesBody');
    const volleyballMatchesBody = document.getElementById('volleyballMatchesBody');
    const netballMatchesBody = document.getElementById('netballMatchesBody');
    const footballResultsBody = document.getElementById('footballResultsBody');
    const basketballResultsBody = document.getElementById('basketballResultsBody');
    const volleyballResultsBody = document.getElementById('volleyballResultsBody');
    const netballResultsBody = document.getElementById('netballResultsBody');
    const newsTableBody = document.getElementById('newsTableBody');
    const adminsTableBody = document.getElementById('adminsTableBody');

    // Counts
    const statMatchCount = document.getElementById('statMatchCount');
    const statResultCount = document.getElementById('statResultCount');
    const statNewsCount = document.getElementById('statNewsCount');

    // Modals
    const matchModal = document.getElementById('matchModal');
    const resultModal = document.getElementById('resultModal');
    const newsModal = document.getElementById('newsModal');
    const adminModal = document.getElementById('adminModal');

    // Forms
    const matchForm = document.getElementById('matchForm');
    const resultForm = document.getElementById('resultForm');
    const todayMatchesModal = document.getElementById('todayMatchesModal');
    const todayMatchesList = document.getElementById('todayMatchesList');
    const newsForm = document.getElementById('newsForm');
    const adminForm = document.getElementById('adminForm');

    // Modal Trigger Buttons
    document.getElementById('addMatchBtn').addEventListener('click', () => openMatchForm());
    document.getElementById('addResultBtn').addEventListener('click', () => openTodayMatchesModal());
    document.getElementById('addNewsBtn').addEventListener('click', () => openNewsForm());
    document.getElementById('addAdminBtn').addEventListener('click', () => openAdminForm());

    // Generic Modal Close listeners
    document.querySelectorAll('.form-modal-close, .form-modal-cancel').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            closeAllModals();
        });
    });

    // --- CRUD: MATCHES ---
    async function loadMatches() {
        const matches = await window.DB.getMatches();
        statMatchCount.innerText = matches.length;

        // Separate matches by sport
        const football = matches.filter(m => m.sport.toLowerCase() === 'football');
        const basketball = matches.filter(m => m.sport.toLowerCase() === 'basketball');
        const volleyball = matches.filter(m => m.sport.toLowerCase() === 'volleyball');
        const netball = matches.filter(m => m.sport.toLowerCase() === 'netball');

        // Render each category container
        renderSportMatchTable(footballMatchesBody, football, 'Football');
        renderSportMatchTable(basketballMatchesBody, basketball, 'Basketball');
        renderSportMatchTable(volleyballMatchesBody, volleyball, 'Volleyball');
        renderSportMatchTable(netballMatchesBody, netball, 'Netball');

        bindMatchActions();
    }

    function bindMatchActions() {
        document.querySelectorAll('.edit-match').forEach(btn => {
            const clone = btn.cloneNode(true);
            btn.parentNode.replaceChild(clone, btn);
        });
        document.querySelectorAll('.delete-match').forEach(btn => {
            const clone = btn.cloneNode(true);
            btn.parentNode.replaceChild(clone, btn);
        });

        document.querySelectorAll('.edit-match').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                const list = await window.DB.getMatches();
                const item = list.find(m => m.id === id);
                if (item) openMatchForm(item);
            });
        });

        document.querySelectorAll('.delete-match').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('Delete this match schedule permanently?')) {
                    const id = btn.getAttribute('data-id');
                    await window.DB.deleteMatch(id);
                    NotificationSystem.adminAction('match_deleted', 'match');
                    loadMatches();
                }
            });
        });
    }

    function renderSportMatchTable(element, sportMatches, sportName) {
        if (!element) return;
        
        if (sportMatches.length === 0) {
            element.innerHTML = `
                <tr>
                    <td colspan="3" class="empty-state" style="padding: 1.5rem 0; font-size: 0.85rem;">
                        <i class="fa-regular fa-calendar-times" style="font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
                        <p>No upcoming matches</p>
                    </td>
                </tr>`;
            return;
        }

        element.innerHTML = sportMatches.map(match => `
            <tr>
                <td style="padding: 1.5rem;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 1rem; margin-bottom: 1rem;">
                        <span style="font-size: 1.05rem; font-weight: 600; flex: 1; text-align: right;">${match.teamA}</span>
                        <span style="color: var(--primary); font-size: 1.1rem; font-weight: 700;">VS</span>
                        <span style="font-size: 1.05rem; font-weight: 600; flex: 1; text-align: left;">${match.teamB}</span>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: center; gap: 1.5rem; font-size: 0.95rem; color: var(--text-muted);">
                        <span><i class="fa-regular fa-calendar"></i> ${formatDate(match.date)}</span>
                        <span><i class="fa-regular fa-clock"></i> ${match.time}</span>
                        <span><i class="fa-solid fa-location-dot"></i> ${match.venue}</span>
                    </div>
                </td>
                <td style="text-align: center; vertical-align: middle;">
                    <div class="row-actions" style="justify-content: center;">
                        <button class="action-btn edit edit-match" data-id="${match.id}" title="Edit Match"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="action-btn delete delete-match" data-id="${match.id}" title="Delete Match"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function openMatchForm(matchItem = null) {
        document.getElementById('matchId').value = matchItem ? matchItem.id : '';
        document.getElementById('matchSport').value = matchItem ? matchItem.sport : '';
        document.getElementById('matchCategory').value = matchItem ? matchItem.category : '';
        document.getElementById('matchTeamA').value = matchItem ? matchItem.teamA : 'Rockview Hawks';
        document.getElementById('matchTeamB').value = matchItem ? matchItem.teamB : '';
        document.getElementById('matchDate').value = matchItem ? matchItem.date : '';
        document.getElementById('matchTime').value = matchItem ? matchItem.time : '';
        document.getElementById('matchVenue').value = matchItem ? matchItem.venue : '';

        document.getElementById('matchModalTitle').innerText = matchItem ? 'Edit Match Details' : 'Add Upcoming Match';
        matchModal.classList.add('active');
    }

    matchForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const matchData = {
            id: document.getElementById('matchId').value || null,
            sport: document.getElementById('matchSport').value,
            category: document.getElementById('matchCategory').value.trim(),
            teamA: document.getElementById('matchTeamA').value.trim(),
            teamB: document.getElementById('matchTeamB').value.trim(),
            date: document.getElementById('matchDate').value,
            time: document.getElementById('matchTime').value,
            venue: document.getElementById('matchVenue').value.trim()
        };

        await window.DB.saveMatch(matchData);
        
        // Show notification
        if (matchData.id) {
            NotificationSystem.adminAction('match_updated', 'match');
        } else {
            NotificationSystem.adminAction('match_created', 'match');
        }
        
        closeAllModals();
        loadMatches();
    });

    // --- CRUD: RESULTS ---
    async function loadResults() {
        const results = await window.DB.getResults();
        statResultCount.innerText = results.length;

        // Separate results by sport
        const football = results.filter(r => r.sport.toLowerCase() === 'football');
        const basketball = results.filter(r => r.sport.toLowerCase() === 'basketball');
        const volleyball = results.filter(r => r.sport.toLowerCase() === 'volleyball');
        const netball = results.filter(r => r.sport.toLowerCase() === 'netball');

        // Render each category container
        renderSportResultTable(footballResultsBody, football, 'Football');
        renderSportResultTable(basketballResultsBody, basketball, 'Basketball');
        renderSportResultTable(volleyballResultsBody, volleyball, 'Volleyball');
        renderSportResultTable(netballResultsBody, netball, 'Netball');

        // Bind Action Events
        document.querySelectorAll('.edit-result').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                const list = await window.DB.getResults();
                const item = list.find(r => r.id === id);
                if (item) openResultForm(item);
            });
        });

        document.querySelectorAll('.delete-result').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('Delete this game result record permanently?')) {
                    const id = btn.getAttribute('data-id');
                    await window.DB.deleteResult(id);
                    NotificationSystem.adminAction('result_deleted', 'result');
                    loadResults();
                }
            });
        });
    }

    function renderSportResultTable(element, sportResults, sportName) {
        if (!element) return;
        
        if (sportResults.length === 0) {
            element.innerHTML = `
                <tr>
                    <td colspan="2" class="empty-state" style="padding: 1.5rem 0; font-size: 0.85rem;">
                        <i class="fa-solid fa-clipboard-question" style="font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
                        <p>No results posted</p>
                    </td>
                </tr>`;
            return;
        }

        element.innerHTML = sportResults.map(res => `
            <tr>
                <td style="padding: 1.5rem;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 1rem; margin-bottom: 1rem;">
                        <span style="font-size: 1.05rem; font-weight: 600; flex: 1; text-align: right;">${res.teamA}</span>
                        <span style="font-size: 1.3rem; font-weight: 800; color: var(--secondary); font-family: 'Outfit'; min-width: 40px; text-align: center;">${res.scoreA}</span>
                        <span style="font-size: 1.1rem; color: var(--text-muted); font-weight: 600;">-</span>
                        <span style="font-size: 1.3rem; font-weight: 800; color: var(--secondary); font-family: 'Outfit'; min-width: 40px; text-align: center;">${res.scoreB}</span>
                        <span style="font-size: 1.05rem; font-weight: 600; flex: 1; text-align: left;">${res.teamB}</span>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: center; gap: 2rem; font-size: 0.9rem; color: var(--text-muted);">
                        <span><i class="fa-regular fa-calendar"></i> ${formatDate(res.date)}</span>
                        <span><i class="fa-solid fa-location-dot"></i> ${res.venue}</span>
                    </div>
                </td>
                <td style="text-align: center; vertical-align: middle;">
                    <div class="row-actions" style="justify-content: center;">
                        <button class="action-btn edit edit-result" data-id="${res.id}" title="Edit Result"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="action-btn delete delete-result" data-id="${res.id}" title="Delete Result"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function openResultForm(resItem = null) {
        document.getElementById('resultId').value = resItem ? resItem.id : '';
        document.getElementById('resultSport').value = resItem ? resItem.sport : '';
        document.getElementById('resultTeamA').value = resItem ? resItem.teamA : 'Rockview Hawks';
        document.getElementById('resultScoreA').value = resItem ? resItem.scoreA : '';
        document.getElementById('resultTeamB').value = resItem ? resItem.teamB : '';
        document.getElementById('resultScoreB').value = resItem ? resItem.scoreB : '';
        document.getElementById('resultDate').value = resItem ? resItem.date : '';
        document.getElementById('resultVenue').value = resItem ? resItem.venue : '';
        document.getElementById('resultNotes').value = resItem ? resItem.notes : '';

        document.getElementById('resultModalTitle').innerText = resItem ? 'Edit Match Result' : 'Post Match Score Result';
        resultModal.classList.add('active');
    }

    function openResultFormFromMatch(matchItem) {
        document.getElementById('resultId').value = '';
        document.getElementById('resultSport').value = matchItem.sport;
        document.getElementById('resultTeamA').value = matchItem.teamA;
        document.getElementById('resultScoreA').value = '';
        document.getElementById('resultTeamB').value = matchItem.teamB;
        document.getElementById('resultScoreB').value = '';
        document.getElementById('resultDate').value = matchItem.date;
        document.getElementById('resultVenue').value = matchItem.venue;
        document.getElementById('resultNotes').value = '';

        document.getElementById('resultModalTitle').innerText = `Add Result for ${matchItem.teamA} vs ${matchItem.teamB}`;
        resultModal.classList.add('active');
    }

    async function openTodayMatchesModal() {
        const matches = await window.DB.getMatches();
        const results = await window.DB.getResults();
        const today = new Date().toISOString().split('T')[0];

        const scheduledToday = matches.filter(match => {
            const hasResult = results.some(result => 
                result.date === match.date &&
                result.sport.toLowerCase() === match.sport.toLowerCase() &&
                ((result.teamA.toLowerCase() === match.teamA.toLowerCase() && result.teamB.toLowerCase() === match.teamB.toLowerCase()) ||
                 (result.teamA.toLowerCase() === match.teamB.toLowerCase() && result.teamB.toLowerCase() === match.teamA.toLowerCase()))
            );
            return match.date === today && !hasResult;
        });

        if (scheduledToday.length === 0) {
            todayMatchesList.innerHTML = `
                <div class="empty-state" style="width: 100%; padding: 3rem 1.5rem; text-align: center;">
                    <i class="fa-solid fa-calendar-check" style="font-size: 2rem; margin-bottom: 1rem;"></i>
                    <p>No active matches found for today. You can still post results after selecting a match schedule from Upcoming Matches.</p>
                </div>`;
        } else {
            todayMatchesList.innerHTML = scheduledToday.map(match => `
                <div class="today-match-card glass-panel">
                    <div class="today-match-header">
                        <div>
                            <h4>${match.teamA} <span style="color: var(--secondary);">vs</span> ${match.teamB}</h4>
                            <p style="margin: 0.35rem 0 0; color: var(--text-muted); font-size: 0.95rem;">${match.sport} • ${match.category}</p>
                        </div>
                        <button class="btn btn-secondary today-add-result-btn" data-id="${match.id}">Add Match Results</button>
                    </div>
                    <div class="today-match-details" style="display: grid; gap: 0.5rem; font-size: 0.92rem; color: var(--text-muted);">
                        <span><i class="fa-regular fa-calendar"></i> ${formatDate(match.date)}</span>
                        <span><i class="fa-regular fa-clock"></i> ${match.time || 'Time not set'}</span>
                        <span><i class="fa-solid fa-location-dot"></i> ${match.venue}</span>
                    </div>
                </div>
            `).join('');

            todayMatchesList.querySelectorAll('.today-add-result-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const matchId = btn.getAttribute('data-id');
                    const selectedMatch = scheduledToday.find(match => match.id === matchId);
                    if (selectedMatch) {
                        todayMatchesModal.classList.remove('active');
                        openResultFormFromMatch(selectedMatch);
                    }
                });
            });
        }

        todayMatchesModal.classList.add('active');
    }

    resultForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const resData = {
            id: document.getElementById('resultId').value || null,
            sport: document.getElementById('resultSport').value,
            teamA: document.getElementById('resultTeamA').value.trim(),
            scoreA: parseInt(document.getElementById('resultScoreA').value),
            teamB: document.getElementById('resultTeamB').value.trim(),
            scoreB: parseInt(document.getElementById('resultScoreB').value),
            date: document.getElementById('resultDate').value,
            venue: document.getElementById('resultVenue').value.trim(),
            notes: document.getElementById('resultNotes').value.trim()
        };

        await window.DB.saveResult(resData);
        
        // Show notification
        if (resData.id) {
            NotificationSystem.adminAction('result_updated', 'result');
        } else {
            NotificationSystem.adminAction('result_posted', 'result');
        }
        
        // Auto-delete corresponding match from upcoming matches
        const matches = await window.DB.getMatches();
        const matchToDelete = matches.find(m => 
            m.sport.toLowerCase() === resData.sport.toLowerCase() &&
            ((m.teamA.toLowerCase() === resData.teamA.toLowerCase() && m.teamB.toLowerCase() === resData.teamB.toLowerCase()) ||
             (m.teamA.toLowerCase() === resData.teamB.toLowerCase() && m.teamB.toLowerCase() === resData.teamA.toLowerCase())) &&
            m.date === resData.date
        );
        
        if (matchToDelete) {
            await window.DB.deleteMatch(matchToDelete.id);
        }
        
        closeAllModals();
        loadResults();
        loadMatches();
    });

    // --- CRUD: NEWS/ANNOUNCEMENTS ---
    async function loadNews() {
        const news = await window.DB.getNews();
        statNewsCount.innerText = news.length;

        // Separate news by category
        const football = news.filter(n => n.category.toLowerCase() === 'football');
        const basketball = news.filter(n => n.category.toLowerCase() === 'basketball');
        const volleyball = news.filter(n => n.category.toLowerCase() === 'volleyball');
        const netball = news.filter(n => n.category.toLowerCase() === 'netball');
        const tennis = news.filter(n => n.category.toLowerCase() === 'tennis');
        const general = news.filter(n => !['football', 'basketball', 'volleyball', 'netball', 'tennis'].includes(n.category.toLowerCase()));

        // Render each category container
        renderSportNewsTable(document.getElementById('footballNewsBody'), football, 'Football');
        renderSportNewsTable(document.getElementById('basketballNewsBody'), basketball, 'Basketball');
        renderSportNewsTable(document.getElementById('volleyballNewsBody'), volleyball, 'Volleyball');
        renderSportNewsTable(document.getElementById('netballNewsBody'), netball, 'Netball');
        renderSportNewsTable(document.getElementById('tennisNewsBody'), tennis, 'Tennis');
        renderSportNewsTable(document.getElementById('generalNewsBody'), general, 'General');

        // Bind Action Events
        bindNewsActions();
    }

    function renderSportNewsTable(element, newsItems, categoryName) {
        if (!element) return;
        
        if (newsItems.length === 0) {
            element.innerHTML = `
                <tr>
                    <td colspan="2" class="empty-state" style="padding: 1.5rem 0; font-size: 0.85rem;">
                        <i class="fa-regular fa-newspaper" style="font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
                        <p>No announcements in this category</p>
                    </td>
                </tr>`;
            return;
        }

        element.innerHTML = newsItems.map(item => `
            <tr>
                <td style="padding: 1.5rem;">
                    <div style="margin-bottom: 0.75rem;">
                        <h4 style="font-size: 1.05rem; font-weight: 600; margin-bottom: 0.5rem; color: var(--text-main);">${item.title}</h4>
                    </div>
                    <div style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 1rem; line-height: 1.5;">${item.summary}</div>
                    <div style="display: flex; align-items: center; gap: 2rem; font-size: 0.9rem; color: var(--text-muted);">
                        <span><i class="fa-regular fa-calendar"></i> ${formatDate(item.date)}</span>
                    </div>
                </td>
                <td style="text-align: center; vertical-align: middle;">
                    <div class="row-actions" style="justify-content: center;">
                        <button class="action-btn edit edit-news" data-id="${item.id}" title="Edit Announcement"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="action-btn delete delete-news" data-id="${item.id}" title="Delete Announcement"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function bindNewsActions() {
        // Bind Edit Events
        document.querySelectorAll('.edit-news').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = btn.getAttribute('data-id');
                const list = await window.DB.getNews();
                const item = list.find(n => n.id === id);
                if (item) openNewsForm(item);
            });
        });

        // Bind Delete Events
        document.querySelectorAll('.delete-news').forEach(btn => {
            btn.addEventListener('click', async () => {
                if (confirm('Delete this announcement permanently?')) {
                    const id = btn.getAttribute('data-id');
                    await window.DB.deleteNews(id);
                    NotificationSystem.adminAction('news_deleted', 'news');
                    loadNews();
                }
            });
        });
    }

    function openNewsForm(newsItem = null) {
        document.getElementById('newsId').value = newsItem ? newsItem.id : '';
        document.getElementById('newsTitle').value = newsItem ? newsItem.title : '';
        document.getElementById('newsCategory').value = newsItem ? newsItem.category : '';
        document.getElementById('newsAuthor').value = newsItem ? newsItem.author : '';
        document.getElementById('newsDate').value = newsItem ? newsItem.date : '';
        document.getElementById('newsImageSelect').value = newsItem ? newsItem.imageUrl : 'assets/news_default.png';
        document.getElementById('newsSummary').value = newsItem ? newsItem.summary : '';
        document.getElementById('newsContent').value = newsItem ? newsItem.content : '';

        document.getElementById('newsModalTitle').innerText = newsItem ? 'Edit Announcement' : 'Publish Announcement';
        newsModal.classList.add('active');
    }

    newsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newsData = {
            id: document.getElementById('newsId').value || null,
            title: document.getElementById('newsTitle').value.trim(),
            category: document.getElementById('newsCategory').value.trim(),
            author: document.getElementById('newsAuthor').value.trim(),
            date: document.getElementById('newsDate').value,
            imageUrl: document.getElementById('newsImageSelect').value,
            summary: document.getElementById('newsSummary').value.trim(),
            content: document.getElementById('newsContent').value.trim()
        };

        await window.DB.saveNews(newsData);
        
        // Show notification
        if (newsData.id) {
            NotificationSystem.adminAction('news_updated', 'news');
        } else {
            NotificationSystem.adminAction('news_published', 'news');
        }
        
        closeAllModals();
        loadNews();
    });

    // --- CRUD: ADMIN ACCOUNTS ---
    async function loadAdmins() {
        const admins = await window.DB.getAdmins();

        adminsTableBody.innerHTML = admins.map(adm => `
            <tr>
                <td><strong><i class="fa-solid fa-circle-user"></i> ${adm.username}</strong></td>
                <td>${adm.name}</td>
                <td>
                    <div class="row-actions">
                        ${adm.username.toLowerCase() !== 'admin' ? 
                            `<button class="action-btn delete delete-admin" data-username="${adm.username}" title="Delete Admin"><i class="fa-solid fa-user-minus"></i></button>` : 
                            `<span style="font-size:0.75rem; color:var(--text-muted); font-style:italic;">Main System Account</span>`
                        }
                    </div>
                </td>
            </tr>
        `).join('');

        // Bind Delete Action
        document.querySelectorAll('.delete-admin').forEach(btn => {
            btn.addEventListener('click', async () => {
                const username = btn.getAttribute('data-username');
                if (confirm(`Remove admin account for "${username}"?`)) {
                    try {
                        await window.DB.deleteAdmin(username);
                        loadAdmins();
                    } catch (err) {
                        alert(err.message);
                    }
                }
            });
        });
    }

    function openAdminForm() {
        document.getElementById('newAdminUsername').value = '';
        document.getElementById('newAdminName').value = '';
        document.getElementById('newAdminPassword').value = '';
        document.getElementById('newAdminError').innerText = '';
        adminModal.classList.add('active');
    }

    adminForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const errorDiv = document.getElementById('newAdminError');
        errorDiv.innerText = '';

        const username = document.getElementById('newAdminUsername').value.trim().toLowerCase();
        const name = document.getElementById('newAdminName').value.trim();
        const password = document.getElementById('newAdminPassword').value;

        if (username.includes(' ')) {
            errorDiv.innerText = 'Username cannot contain spaces.';
            errorDiv.style.display = 'block';
            return;
        }

        if (password.length < 8) {
            errorDiv.innerText = 'Password must be at least 8 characters long.';
            errorDiv.style.display = 'block';
            return;
        }

        if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
            errorDiv.innerText = 'Password must contain both letters and numbers.';
            errorDiv.style.display = 'block';
            return;
        }

        try {
            await window.DB.addAdmin({ username, name, password });
            closeAllModals();
            loadAdmins();
        } catch (err) {
            errorDiv.innerText = err.message;
            errorDiv.style.display = 'block';
        }
    });

    // --- UTILITIES ---
    function closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    }

    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', options);
    }

    function getSportIcon(sportName) {
        const sport = sportName.toLowerCase();
        if (sport.includes('foot') || sport.includes('soccer')) return 'fa-solid fa-football';
        if (sport.includes('basket')) return 'fa-solid fa-basketball';
        if (sport.includes('volley')) return 'fa-solid fa-volleyball';
        if (sport.includes('tennis')) return 'fa-solid fa-table-tennis-paddle-ball';
        if (sport.includes('swim')) return 'fa-solid fa-person-swimming';
        if (sport.includes('run') || sport.includes('athlet')) return 'fa-solid fa-person-running';
        return 'fa-solid fa-circle-question';
    }

    // --- INITIALIZATION ---
    async function initAdminPanel() {
        await Promise.all([
            loadMatches(),
            loadResults(),
            loadNews(),
            loadAdmins()
        ]);
    }

    initAdminPanel();
});
