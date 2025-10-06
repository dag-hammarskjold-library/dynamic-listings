/**
 * Modern JavaScript for Dynamic Listings UI
 * Handles sidebar, theme, and other modern UI interactions
 */

// Global state
const ModernUI = {
    sidebarCollapsed: false,
    theme: 'light',
    isLoading: false
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeModernUI();
    setupEventListeners();
    initializeTooltips();
    initializeAnimations();
});

/**
 * Initialize modern UI components
 */
function initializeModernUI() {
    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    
    // Initialize sidebar state
    const sidebarState = localStorage.getItem('sidebarCollapsed');
    if (sidebarState === 'true') {
        toggleSidebar();
    }
    
    // Add loading states to buttons
    addLoadingStates();
    
    // Initialize form enhancements
    enhanceForms();
    
    console.log('Modern UI initialized');
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Sidebar toggle
    const sidebarToggle = document.querySelector('.sidebar-toggle-desktop');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', toggleSidebar);
    }
    
    // Mobile sidebar toggle
    const mobileSidebarToggle = document.querySelector('.sidebar-toggle');
    if (mobileSidebarToggle) {
        mobileSidebarToggle.addEventListener('click', function() {
            const sidebar = document.querySelector('.modern-sidebar');
            sidebar.classList.toggle('show');
        });
    }
    
    // Close mobile sidebar when clicking outside
    document.addEventListener('click', function(e) {
        const sidebar = document.querySelector('.modern-sidebar');
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        
        if (window.innerWidth <= 768 && 
            !sidebar.contains(e.target) && 
            !sidebarToggle.contains(e.target) && 
            sidebar.classList.contains('show')) {
            sidebar.classList.remove('show');
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', handleResize);
    
    // Theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Navigation links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Add active state
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // Show loading if it's a navigation link
            if (this.getAttribute('href') && !this.getAttribute('href').startsWith('#')) {
                showLoading();
            }
        });
    });
}

/**
 * Toggle sidebar collapsed state
 */
function toggleSidebar() {
    const sidebar = document.querySelector('.modern-sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (!sidebar || !mainContent) return;
    
    ModernUI.sidebarCollapsed = !ModernUI.sidebarCollapsed;
    
    if (ModernUI.sidebarCollapsed) {
        sidebar.classList.add('collapsed');
        localStorage.setItem('sidebarCollapsed', 'true');
    } else {
        sidebar.classList.remove('collapsed');
        localStorage.setItem('sidebarCollapsed', 'false');
    }
    
    // Update toggle button icon
    const toggleBtn = document.querySelector('.sidebar-toggle-desktop i');
    if (toggleBtn) {
        if (ModernUI.sidebarCollapsed) {
            toggleBtn.className = 'fas fa-chevron-right';
        } else {
            toggleBtn.className = 'fas fa-bars';
        }
    }
    
    console.log('Sidebar toggled:', ModernUI.sidebarCollapsed ? 'collapsed' : 'expanded');
}

/**
 * Toggle theme between light and dark
 */
function toggleTheme() {
    const currentTheme = getCurrentTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

/**
 * Get current theme
 */
function getCurrentTheme() {
    return document.documentElement.getAttribute('data-bs-theme') || 'light';
}

/**
 * Set theme
 */
function setTheme(theme) {
    document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
    ModernUI.theme = theme;
    
    // Update theme toggle icon
    const themeIcon = document.querySelector('#theme-icon');
    const sidebarThemeIcon = document.querySelector('#sidebar-theme-icon');
    
    if (themeIcon) {
        if (theme === 'dark') {
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }
    }
    
    if (sidebarThemeIcon) {
        if (theme === 'dark') {
            sidebarThemeIcon.className = 'fas fa-sun';
        } else {
            sidebarThemeIcon.className = 'fas fa-moon';
        }
    }
    
    console.log('Theme changed to:', theme);
}

/**
 * Handle window resize
 */
function handleResize() {
    const sidebar = document.querySelector('.modern-sidebar');
    
    if (window.innerWidth <= 768) {
        // Mobile view
        sidebar.classList.add('mobile');
        sidebar.classList.remove('show');
    } else {
        // Desktop view
        sidebar.classList.remove('mobile');
        sidebar.classList.remove('show');
    }
}

/**
 * Show loading overlay
 */
function showLoading(message = 'Loading...') {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        const loadingText = overlay.querySelector('p');
        if (loadingText) {
            loadingText.textContent = message;
        }
        overlay.classList.add('show');
        ModernUI.isLoading = true;
    }
}

/**
 * Hide loading overlay
 */
function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('show');
        ModernUI.isLoading = false;
    }
}

/**
 * Add loading states to buttons
 */
function addLoadingStates() {
    const buttons = document.querySelectorAll('button, .btn');
    buttons.forEach(button => {
        if (button.type === 'submit' || button.classList.contains('btn-primary-modern')) {
            button.addEventListener('click', function() {
                if (!this.disabled) {
                    this.style.pointerEvents = 'none';
                    this.style.opacity = '0.7';
                    
                    const originalText = this.textContent;
                    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
                    
                    // Reset after 3 seconds if still loading
                    setTimeout(() => {
                        this.style.pointerEvents = 'auto';
                        this.style.opacity = '1';
                        this.innerHTML = originalText;
                    }, 3000);
                }
            });
        }
    });
}

/**
 * Enhance forms with modern styling
 */
function enhanceForms() {
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        // Add modern classes
        form.classList.add('form-modern');
        
        // Enhance form controls
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.type !== 'checkbox' && input.type !== 'radio') {
                input.classList.add('form-control-modern');
            }
        });
        
        // Enhance labels
        const labels = form.querySelectorAll('label');
        labels.forEach(label => {
            label.classList.add('form-label-modern');
        });
    });
}

/**
 * Initialize Bootstrap tooltips
 */
function initializeTooltips() {
    // Initialize tooltips for elements with data-bs-toggle="tooltip"
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

/**
 * Initialize animations
 */
function initializeAnimations() {
    // Add fade-in animation to cards
    const cards = document.querySelectorAll('.modern-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
    });
    
    // Add slide-in animation to sidebar
    const sidebar = document.querySelector('.modern-sidebar');
    if (sidebar) {
        sidebar.classList.add('slide-in-left');
    }
}


/**
 * Format date for display
 */
function formatDate(date, format = 'short') {
    const d = new Date(date);
    const options = {
        short: { year: 'numeric', month: 'short', day: 'numeric' },
        long: { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' },
        time: { hour: '2-digit', minute: '2-digit' }
    };
    
    return d.toLocaleDateString('en-US', options[format] || options.short);
}

/**
 * Debounce function for performance
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function for performance
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Smooth scroll to element
 */
function smoothScrollTo(element, offset = 0) {
    const target = typeof element === 'string' ? document.querySelector(element) : element;
    if (target) {
        const targetPosition = target.offsetTop - offset;
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

/**
 * Copy text to clipboard
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('Copied to clipboard!', 'success');
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Copied to clipboard!', 'success');
    }
}

/**
 * Export data as CSV
 */
function exportToCSV(data, filename = 'export.csv') {
    if (!data || !Array.isArray(data)) {
        showNotification('No data to export', 'warning');
        return;
    }
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('File exported successfully!', 'success');
    }
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Get URL parameters
 */
function getUrlParams() {
    const params = {};
    const urlParams = new URLSearchParams(window.location.search);
    for (const [key, value] of urlParams) {
        params[key] = value;
    }
    return params;
}

/**
 * Update URL without page reload
 */
function updateURL(params, title = null) {
    const url = new URL(window.location);
    
    Object.keys(params).forEach(key => {
        if (params[key] === null || params[key] === undefined) {
            url.searchParams.delete(key);
        } else {
            url.searchParams.set(key, params[key]);
        }
    });
    
    window.history.pushState({}, title || document.title, url);
}

// Global utility functions
window.ModernUI = ModernUI;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.toggleSidebar = toggleSidebar;
window.toggleTheme = toggleTheme;
window.formatDate = formatDate;
window.copyToClipboard = copyToClipboard;
window.exportToCSV = exportToCSV;
window.formatFileSize = formatFileSize;
window.isValidEmail = isValidEmail;
window.smoothScrollTo = smoothScrollTo;

// Console welcome message
console.log('%c🚀 Modern UI Loaded!', 'color: #6366f1; font-size: 16px; font-weight: bold;');
console.log('%cDynamic Listings - Modern Interface Ready', 'color: #64748b; font-size: 12px;');
