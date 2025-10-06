/**
 * Reusable Notification Component
 * Beautiful right-bottom notifications to replace alerts
 */

class NotificationSystem {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Create notification container if it doesn't exist
        if (!document.getElementById('notification-container')) {
            this.container = document.createElement('div');
            this.container.id = 'notification-container';
            this.container.className = 'notification-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('notification-container');
        }
    }

    show(message, type = 'info', title = '', duration = 5000) {
        console.log('NotificationSystem.show called:', message, type);
        const notification = this.createNotification(message, type, title);
        this.container.appendChild(notification);

        // Trigger animation
        setTimeout(() => {
            notification.classList.add('show');
            console.log('Notification added to DOM and animated');
        }, 100);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.remove(notification);
            }, duration);
        }

        return notification;
    }

    createNotification(message, type, title) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;

        const iconMap = {
            success: 'fas fa-check',
            error: 'fas fa-times',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        const icon = iconMap[type] || iconMap.info;

        notification.innerHTML = `
            <div class="notification-icon">
                <i class="${icon}"></i>
            </div>
            <div class="notification-content">
                ${title ? `<div class="notification-title">${title}</div>` : ''}
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" onclick="notificationSystem.remove(this.parentElement)">
                <i class="fas fa-times"></i>
            </button>
        `;

        return notification;
    }

    remove(notification) {
        if (!notification) return;
        
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentElement) {
                notification.parentElement.removeChild(notification);
            }
        }, 300);
    }

    success(message, title = 'Success', duration = 5000) {
        return this.show(message, 'success', title, duration);
    }

    error(message, title = 'Error', duration = 7000) {
        return this.show(message, 'error', title, duration);
    }

    warning(message, title = 'Warning', duration = 6000) {
        return this.show(message, 'warning', title, duration);
    }

    info(message, title = 'Info', duration = 5000) {
        return this.show(message, 'info', title, duration);
    }
}

// Initialize global notification system
const notificationSystem = new NotificationSystem();

// Test notification on load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Notification system initialized');
    // Uncomment the line below to test notifications
    // showSuccess('Notification system is working!', 'Test', 3000);
});

// Global functions for easy access
window.showNotification = (message, type = 'info', title = '', duration = 5000) => {
    console.log('showNotification called:', message, type);
    return notificationSystem.show(message, type, title, duration);
};

window.showSuccess = (message, title = 'Success', duration = 5000) => {
    console.log('showSuccess called:', message);
    return notificationSystem.success(message, title, duration);
};

window.showError = (message, title = 'Error', duration = 7000) => {
    console.log('showError called:', message);
    return notificationSystem.error(message, title, duration);
};

window.showWarning = (message, title = 'Warning', duration = 6000) => {
    console.log('showWarning called:', message);
    return notificationSystem.warning(message, title, duration);
};

window.showInfo = (message, title = 'Info', duration = 5000) => {
    console.log('showInfo called:', message);
    return notificationSystem.info(message, title, duration);
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NotificationSystem;
}
