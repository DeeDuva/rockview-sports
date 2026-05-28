/**
 * notification.js - Notification System
 * Displays stylish toast notifications and plays notification tones
 */

const NotificationSystem = {
    // Initialize notification container
    init() {
        const container = document.getElementById('notificationContainer');
        if (!container) {
            const div = document.createElement('div');
            div.id = 'notificationContainer';
            div.className = 'notification-container';
            document.body.appendChild(div);
        }
    },

    /**
     * Show a notification toast
     * @param {string} message - Notification message
     * @param {string} type - 'success', 'error', 'info', 'warning'
     * @param {number} duration - Duration in milliseconds (default: 4000)
     */
    show(message, type = 'info', duration = 4000) {
        this.init();
        
        const container = document.getElementById('notificationContainer');
        const notification = document.createElement('div');
        const notificationId = `notif-${Date.now()}`;
        
        notification.id = notificationId;
        notification.className = `notification-toast notification-${type}`;
        
        // Get appropriate icon
        let icon = '';
        switch(type) {
            case 'success':
                icon = '<i class="fa-solid fa-check-circle"></i>';
                break;
            case 'error':
                icon = '<i class="fa-solid fa-exclamation-circle"></i>';
                break;
            case 'warning':
                icon = '<i class="fa-solid fa-triangle-exclamation"></i>';
                break;
            case 'info':
            default:
                icon = '<i class="fa-solid fa-info-circle"></i>';
                break;
        }
        
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">${icon}</span>
                <span class="notification-message">${message}</span>
                <button class="notification-close" onclick="NotificationSystem.dismiss('${notificationId}')">
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
            <div class="notification-progress"></div>
        `;
        
        container.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Play notification tone
        this.playTone(type);
        
        // Auto-dismiss
        if (duration > 0) {
            setTimeout(() => {
                this.dismiss(notificationId);
            }, duration);
        }
        
        return notificationId;
    },

    /**
     * Dismiss a notification
     * @param {string} id - Notification ID
     */
    dismiss(id) {
        const notification = document.getElementById(id);
        if (notification) {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    },

    /**
     * Show success notification
     */
    success(message, duration = 4000) {
        return this.show(message, 'success', duration);
    },

    /**
     * Show error notification
     */
    error(message, duration = 5000) {
        return this.show(message, 'error', duration);
    },

    /**
     * Show info notification
     */
    info(message, duration = 4000) {
        return this.show(message, 'info', duration);
    },

    /**
     * Show warning notification
     */
    warning(message, duration = 4000) {
        return this.show(message, 'warning', duration);
    },

    /**
     * Play notification tone
     */
    playTone(type = 'info') {
        // Create a simple beep tone using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        let frequency = 800; // Default frequency
        let duration = 0.3;
        
        switch(type) {
            case 'success':
                frequency = 800;
                duration = 0.4;
                break;
            case 'error':
                frequency = 400;
                duration = 0.5;
                break;
            case 'warning':
                frequency = 600;
                duration = 0.35;
                break;
            case 'info':
            default:
                frequency = 700;
                duration = 0.3;
                break;
        }
        
        const now = audioContext.currentTime;
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        // Fade in and out
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        oscillator.start(now);
        oscillator.stop(now + duration);
    },

    /**
     * Show admin action notification with tone
     */
    adminAction(action, itemType) {
        const messages = {
            'match_created': `📅 New match scheduled! Fans will see it on the portal.`,
            'match_updated': `✏️ Match details updated!`,
            'match_deleted': `🗑️ Match removed from schedule.`,
            'result_posted': `🏆 Match result posted! The match has been moved to results.`,
            'result_updated': `✏️ Result updated!`,
            'result_deleted': `🗑️ Result removed.`,
            'news_published': `📢 Announcement published! Fans will see it now.`,
            'news_updated': `✏️ Announcement updated!`,
            'news_deleted': `🗑️ Announcement removed.`
        };
        
        const message = messages[action] || `${action} completed!`;
        const type = action.includes('deleted') ? 'warning' : 'success';
        
        return this.show(message, type, 4000);
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    NotificationSystem.init();
});
