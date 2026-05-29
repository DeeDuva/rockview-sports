/**
 * realtime-updates.js - Real-time Update Polling System
 * Checks for new updates from the backend every 3 seconds
 * and displays notifications when new content is found
 */

const RealtimeUpdates = {
    apiUrl: 'https://rockview-sports.onrender.com',
    pollInterval: 3000, // 3 seconds
    isPolling: false,
    lastNewsIds: new Set(),
    lastMatchIds: new Set(),
    lastResultIds: new Set(),

    /**
     * Initialize the polling system
     */
    init() {
        console.log('Initializing real-time updates');
        this.loadCachedIds();
        this.startPolling();
    },

    /**
     * Load previously seen IDs from localStorage
     */
    loadCachedIds() {
        try {
            const cached = localStorage.getItem('rvs_update_cache');
            if (cached) {
                const data = JSON.parse(cached);
                this.lastNewsIds = new Set(data.news || []);
                this.lastMatchIds = new Set(data.matches || []);
                this.lastResultIds = new Set(data.results || []);
            }
        } catch (err) {
            console.error('Error loading cache:', err);
        }
    },

    /**
     * Save current IDs to localStorage
     */
    saveCachedIds() {
        try {
            localStorage.setItem('rvs_update_cache', JSON.stringify({
                news: Array.from(this.lastNewsIds),
                matches: Array.from(this.lastMatchIds),
                results: Array.from(this.lastResultIds)
            }));
        } catch (err) {
            console.error('Error saving cache:', err);
        }
    },

    /**
     * Start the polling loop
     */
    startPolling() {
        if (this.isPolling) return;
        this.isPolling = true;
        console.log('Started polling for updates');
        this.poll();
    },

    /**
     * Stop the polling loop
     */
    stopPolling() {
        this.isPolling = false;
        console.log('Stopped polling for updates');
    },

    /**
     * Poll the API for updates
     */
    async poll() {
        while (this.isPolling) {
            try {
                await this.checkForUpdates();
            } catch (err) {
                console.error('Polling error:', err);
            }
            await new Promise(resolve => setTimeout(resolve, this.pollInterval));
        }
    },

    /**
     * Check all endpoints for new data
     */
    async checkForUpdates() {
        try {
            const [news, matches, results] = await Promise.all([
                this.fetchData(`${this.apiUrl}/api/news`),
                this.fetchData(`${this.apiUrl}/api/matches`),
                this.fetchData(`${this.apiUrl}/api/results`)
            ]);

            this.checkNewsUpdates(news);
            this.checkMatchUpdates(matches);
            this.checkResultUpdates(results);

        } catch (err) {
            console.debug('Failed to check updates:', err.message);
        }
    },

    /**
     * Fetch data from an endpoint
     */
    async fetchData(url) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    },

    /**
     * Check for new news items
     */
    checkNewsUpdates(newsItems) {
        if (!Array.isArray(newsItems)) return;

        newsItems.forEach(news => {
            if (!this.lastNewsIds.has(news.id)) {
                this.lastNewsIds.add(news.id);
                NotificationSystem.show(
                    `📰 New: ${news.title}`,
                    'info',
                    5000
                );
            }
        });
        this.saveCachedIds();
    },

    /**
     * Check for new matches
     */
    checkMatchUpdates(matches) {
        if (!Array.isArray(matches)) return;

        matches.forEach(match => {
            if (!this.lastMatchIds.has(match.id)) {
                this.lastMatchIds.add(match.id);
                NotificationSystem.show(
                    `🏆 New Match: ${match.teamA} vs ${match.teamB}`,
                    'info',
                    5000
                );
            }
        });
        this.saveCachedIds();
    },

    /**
     * Check for new results
     */
    checkResultUpdates(results) {
        if (!Array.isArray(results)) return;

        results.forEach(result => {
            if (!this.lastResultIds.has(result.id)) {
                this.lastResultIds.add(result.id);
                NotificationSystem.show(
                    `⚡ Result: ${result.teamA} ${result.scoreA}-${result.scoreB} ${result.teamB}`,
                    'success',
                    5000
                );
            }
        });
        this.saveCachedIds();
    }
};

// Start polling when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        RealtimeUpdates.init();
    });
} else {
    RealtimeUpdates.init();
}
