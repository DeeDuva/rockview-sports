/**
 * app.js - Public Portal Logic
 * Fetches and renders sports data dynamically.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check if database is loaded
    if (!window.DB) {
        console.error('Database module not loaded!');
        return;
    }

    // Dom Elements
    const newsContainer = document.getElementById('newsContainer');
    const matchesContainer = document.getElementById('matchesContainer');
    const resultsContainer = document.getElementById('resultsContainer');
    
    // Nav elements
    const mobileNavToggle = document.getElementById('mobileNavToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    // News Modal elements
    const newsModal = document.getElementById('newsModal');
    const modalNewsImg = document.getElementById('modalNewsImg');
    const modalNewsTitle = document.getElementById('modalNewsTitle');
    const modalNewsDate = document.getElementById('modalNewsDate');
    const modalNewsAuthor = document.getElementById('modalNewsAuthor');
    const modalNewsCat = document.getElementById('modalNewsCat');
    const modalNewsText = document.getElementById('modalNewsText');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    // Mobile Navigation Toggle
    mobileNavToggle.addEventListener('click', () => {
        const isOpened = navMenu.classList.toggle('active-mobile');
        mobileNavToggle.innerHTML = isOpened ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
        if (isOpened) {
            navMenu.style.display = 'flex';
            navMenu.style.flexDirection = 'column';
            navMenu.style.position = 'absolute';
            navMenu.style.top = '100%';
            navMenu.style.left = '0';
            navMenu.style.width = '100%';
            navMenu.style.background = 'rgba(7, 10, 19, 0.95)';
            navMenu.style.backdropFilter = 'blur(15px)';
            navMenu.style.padding = '2rem';
            navMenu.style.borderBottom = '1px solid var(--border-light)';
            navMenu.style.gap = '1.5rem';
        } else {
            navMenu.removeAttribute('style');
        }
    });

    // Close mobile nav when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active-mobile')) {
                navMenu.classList.remove('active-mobile');
                mobileNavToggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
                navMenu.removeAttribute('style');
            }
        });
    });

    // Fetch and render data
    async function loadDashboardData() {
        try {
            // Get data concurrently
            const [matches, results, news] = await Promise.all([
                window.DB.getMatches(),
                window.DB.getResults(),
                window.DB.getNews()
            ]);

            renderNews(news);
            renderMatches(matches);
            renderResults(results);
        } catch (error) {
            console.error('Failed to load data from database:', error);
            const errMsg = `<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><p>Unable to load contents. Please try again later.</p></div>`;
            newsContainer.innerHTML = errMsg;
            matchesContainer.innerHTML = errMsg;
            resultsContainer.innerHTML = errMsg;
        }
    }

    // Render News & Announcements
    function renderNews(newsItems) {
        if (!newsItems || newsItems.length === 0) {
            newsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fa-regular fa-newspaper"></i>
                    <p>No announcements published yet.</p>
                </div>`;
            return;
        }

        // Sort news by date descending
        const sortedNews = [...newsItems].sort((a, b) => new Date(b.date) - new Date(a.date));

        newsContainer.innerHTML = sortedNews.map(item => {
            const formattedDate = formatDate(item.date);
            return `
                <div class="news-card glass-panel" style="padding: 1.5rem;">
                    <h3 class="news-title" style="margin-bottom: 1rem; font-size: 1.25rem; font-weight: 600;">${item.title}</h3>
                    <p class="news-summary" style="margin-bottom: 1.5rem; line-height: 1.6; color: var(--text-muted); font-size: 1rem;">${item.summary}</p>
                    <div class="news-meta" style="display: flex; gap: 1.5rem; font-size: 0.9rem; color: var(--text-muted); border-top: 1px solid rgba(255,255,255,0.1); padding-top: 1rem; margin-bottom: 1rem;">
                        <span><i class="fa-regular fa-calendar"></i> ${formattedDate}</span>
                    </div>
                    <div class="news-footer">
                        <button class="btn btn-outline btn-sm read-more-btn" data-id="${item.id}">
                            Read More <i class="fa-solid fa-arrow-right-long"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Bind Read More click events
        document.querySelectorAll('.read-more-btn').forEach(button => {
            button.addEventListener('click', () => {
                const newsId = button.getAttribute('data-id');
                const selectedNews = newsItems.find(n => n.id === newsId);
                if (selectedNews) {
                    openNewsModal(selectedNews);
                }
            });
        });
    }

    // Render Upcoming Matches
    function renderMatches(matches) {
        if (!matches || matches.length === 0) {
            matchesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fa-regular fa-calendar-times"></i>
                    <p>No upcoming matches scheduled.</p>
                </div>`;
            return;
        }

        // Sort by date ascending (soonest first)
        const sortedMatches = [...matches].sort((a, b) => new Date(a.date) - new Date(b.date));

        matchesContainer.innerHTML = sortedMatches.map(match => {
            const formattedDate = formatDate(match.date);
            
            // Transform category text
            let categoryDisplay = match.category;
            if (match.category.toLowerCase().includes('mens')) {
                categoryDisplay = 'MENS GAME';
            } else if (match.category.toLowerCase().includes('womens')) {
                categoryDisplay = 'WOMENS GAME';
            }

            return `
                <div class="match-card glass-panel">
                    <div class="match-header">
                        <span class="match-sport">
                            <i class="${getSportIcon(match.sport)}"></i> ${match.sport}
                        </span>
                        <span class="match-category">${categoryDisplay}</span>
                    </div>
                    <div style="display: flex; align-items: center; justify-content: center; gap: 1.5rem; margin: 1.5rem 0; font-weight: 600;">
                        <span style="font-size: 1.05rem;">${match.teamA}</span>
                        <span style="font-size: 1.1rem; color: var(--primary);">VS</span>
                        <span style="font-size: 1.05rem;">${match.teamB}</span>
                    </div>
                    <div class="match-details-row">
                        <span class="match-info-item">
                            <i class="fa-regular fa-calendar"></i> ${formattedDate}
                        </span>
                        <span class="match-info-item">
                            <i class="fa-regular fa-clock"></i> ${match.time}
                        </span>
                    </div>
                    <div class="match-details-row" style="margin-top: 0.5rem; justify-content: flex-start;">
                        <span class="match-info-item">
                            <i class="fa-solid fa-location-dot"></i> ${match.venue}
                        </span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Render Match Results
    function renderResults(results) {
        if (!results || results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-clipboard-question"></i>
                    <p>No match results posted yet.</p>
                </div>`;
            return;
        }

        // Sort results by date descending (latest first)
        const sortedResults = [...results].sort((a, b) => new Date(b.date) - new Date(a.date));

        resultsContainer.innerHTML = sortedResults.map(res => {
            const formattedDate = formatDate(res.date);
            const scoreA = parseInt(res.scoreA);
            const scoreB = parseInt(res.scoreB);
            
            const isWinnerA = scoreA > scoreB;
            const isWinnerB = scoreB > scoreA;

            return `
                <div class="result-card glass-panel">
                    <div class="result-header">
                        <span><i class="${getSportIcon(res.sport)}"></i> ${res.sport}</span>
                        <span class="result-date">${formattedDate}</span>
                    </div>
                    <div class="result-score-container">
                        <div class="result-team-info team-a">
                            <span class="team-name" style="text-align: left;">${res.teamA}</span>
                        </div>
                        <div class="result-score-box ${isWinnerA ? 'winner' : ''}">${res.scoreA}</div>
                        <span class="result-vs-divider">VS</span>
                        <div class="result-score-box ${isWinnerB ? 'winner' : ''}">${res.scoreB}</div>
                        <div class="result-team-info team-b">
                            <span class="team-name" style="text-align: right;">${res.teamB}</span>
                        </div>
                    </div>
                    <div style="font-size:0.8rem; color:var(--text-muted); margin-bottom: 0.5rem;">
                        <i class="fa-solid fa-location-dot"></i> ${res.venue}
                    </div>
                    ${res.notes ? `<div class="result-notes">${res.notes}</div>` : ''}
                </div>
            `;
        }).join('');
    }

    // Helper functions
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

    // Modal Control functions
    function openNewsModal(newsItem) {
        modalNewsImg.src = newsItem.imageUrl;
        modalNewsTitle.innerText = newsItem.title;
        modalNewsDate.innerText = formatDate(newsItem.date);
        modalNewsAuthor.innerText = newsItem.author;
        modalNewsCat.innerText = newsItem.category;
        modalNewsText.innerText = newsItem.content;

        newsModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Lock background scroll
    }

    function closeNewsModal() {
        newsModal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Unlock background scroll
    }

    modalCloseBtn.addEventListener('click', closeNewsModal);
    
    // Close modal by clicking outer overlay
    newsModal.addEventListener('click', (e) => {
        if (e.target === newsModal) {
            closeNewsModal();
        }
    });

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && newsModal.classList.contains('active')) {
            closeNewsModal();
        }
    });

    // Scroll Spy for Nav links
    window.addEventListener('scroll', () => {
        const scrollPos = window.scrollY + 100;
        document.querySelectorAll('section').forEach(section => {
            if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
                const id = section.getAttribute('id');
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });

    // Run loader
    loadDashboardData();
    window.AppReload = loadDashboardData;
});
