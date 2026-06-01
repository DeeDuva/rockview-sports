/**
 * realtime-updates.js - Real-time Update Polling System
 * Checks for new updates from the backend every 3 seconds
 * and displays notifications when new content is found
 */

const RealtimeUpdates = {
    apiUrl: `http://localhost:3001`,
    pollInterval: 3000, // 3 seconds
    isPolling: false,
    // Track already seen IDs for fallback (if needed)
    lastNewsIds: new Set(),
    lastMatchIds: new Set(),
    lastResultIds: new Set(),
    // Timestamp of last successful poll
    lastTimestamp: 0,

    /**
     * Initialize the polling system
     */
    init() {
        console.log('Initializing real-time updates');
        this.loadCachedIds();
        this.startPolling();
    },

    /**
     * Load cached state (IDs + timestamp) from localStorage
     */
    loadCachedIds() {
        try {
            const cached = localStorage.getItem('rvs_update_cache');
            if (cached) {
                const data = JSON.parse(cached);
                this.lastNewsIds = new Set(data.news || []);
                this.lastMatchIds = new Set(data.matches || []);
                this.lastResultIds = new Set(data.results || []);
                this.lastTimestamp = data.since || 0;
            }
        } catch (err) {
            console.error('Error loading cache:', err);
        }
    },

    /**
     * Save cached state (IDs + timestamp) to localStorage
     */
    saveCachedIds() {
        try {
            localStorage.setItem('rvs_update_cache', JSON.stringify({
                news: Array.from(this.lastNewsIds),
                matches: Array.from(this.lastMatchIds),
                results: Array.from(this.lastResultIds),
                since: this.lastTimestamp
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
     * Fetch updates since last timestamp using a single endpoint
     */
    async checkForUpdates() {
        try {
            const data = await this.fetchData(`${this.apiUrl}/api/updates?since=${this.lastTimestamp}`);

            // Process each type if present
            if (data.news) this.checkNewsUpdates(data.news);
            if (data.matches) this.checkMatchUpdates(data.matches);
            if (data.results) this.checkResultUpdates(data.results);

            // Update timestamp to the latest `updated_at` among fetched items
            let maxTs = this.lastTimestamp;
            const allItems = [...(data.news || []), ...(data.matches || []), ...(data.results || [])];
            allItems.forEach(item => {
                if (item.updated_at && item.updated_at > maxTs) maxTs = item.updated_at;
            });
            this.lastTimestamp = maxTs;
            this.saveCachedIds();

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
        let hasNew = false;
        newsItems.forEach(news => {
            if (!this.lastNewsIds.has(news.id)) {
                this.lastNewsIds.add(news.id);
                hasNew = true;
                NotificationSystem.show(
                    `📰 New Announcement: ${news.title}`,
                    'info',
                    6000
                );
            }
        });
        if (hasNew && window.AppReload) window.AppReload();
        this.saveCachedIds();
    },

    /**
     * Check for new matches
     */
    checkMatchUpdates(matches) {
        if (!Array.isArray(matches)) return;
        let hasNew = false;
        matches.forEach(match => {
            if (!this.lastMatchIds.has(match.id)) {
                this.lastMatchIds.add(match.id);
                hasNew = true;
                NotificationSystem.show(
                    `🏆 New Match: ${match.teamA} vs ${match.teamB}`,
                    'info',
                    5000
                );
            }
        });
        if (hasNew && window.AppReload) window.AppReload();
        this.saveCachedIds();
    },

    /**
     * Check for new results
     */
    checkResultUpdates(results) {
        if (!Array.isArray(results)) return;
        let hasNew = false;
        results.forEach(result => {
            if (!this.lastResultIds.has(result.id)) {
                this.lastResultIds.add(result.id);
                hasNew = true;
                NotificationSystem.show(
                    `⚡ Result: ${result.teamA} ${result.scoreA}-${result.scoreB} ${result.teamB}`,
                    'success',
                    5000
                );
            }
        });
        if (hasNew && window.AppReload) window.AppReload();
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
