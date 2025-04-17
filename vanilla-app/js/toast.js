/**
 * Toast notification system for Impact Wrapped application
 */

const Toast = {
  // Container element
  container: null,
  
  // Toast configuration
  defaultDuration: 5000, // 5 seconds
  
  /**
   * Initializes the toast system
   */
  init() {
    // Get or create toast container
    this.container = document.getElementById('toast-container');
    
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
      document.body.appendChild(this.container);
    }
  },
  
  /**
   * Shows a toast notification
   * @param {Object} options Toast options
   * @param {string} options.title Toast title
   * @param {string} options.description Toast description
   * @param {string} options.variant Toast variant (success, error, warning, info)
   * @param {number} options.duration Toast duration in milliseconds
   */
  show(options) {
    const { title, description, variant = 'info', duration = this.defaultDuration } = options;
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${variant}`;
    
    // Create toast icon
    const iconElement = document.createElement('div');
    iconElement.className = 'toast-icon';
    
    // Set icon based on variant
    let icon = '🔵'; // Default info icon
    
    if (variant === 'success') {
      icon = '✅';
    } else if (variant === 'error') {
      icon = '❌';
    } else if (variant === 'warning') {
      icon = '⚠️';
    }
    
    iconElement.textContent = icon;
    
    // Create toast content
    const contentElement = document.createElement('div');
    contentElement.className = 'toast-content';
    
    // Create toast title
    if (title) {
      const titleElement = document.createElement('div');
      titleElement.className = 'toast-title';
      titleElement.textContent = title;
      contentElement.appendChild(titleElement);
    }
    
    // Create toast description
    if (description) {
      const descriptionElement = document.createElement('div');
      descriptionElement.className = 'toast-description';
      descriptionElement.textContent = description;
      contentElement.appendChild(descriptionElement);
    }
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'toast-close';
    closeButton.textContent = '×';
    closeButton.setAttribute('aria-label', 'Close');
    closeButton.addEventListener('click', () => {
      this.dismiss(toast);
    });
    
    // Assemble toast
    toast.appendChild(iconElement);
    toast.appendChild(contentElement);
    toast.appendChild(closeButton);
    
    // Add to container
    this.container.appendChild(toast);
    
    // Auto-dismiss after duration
    setTimeout(() => {
      if (toast.parentNode === this.container) {
        this.dismiss(toast);
      }
    }, duration);
    
    return toast;
  },
  
  /**
   * Dismisses a toast notification
   * @param {HTMLElement} toast Toast element
   */
  dismiss(toast) {
    // Apply exit animation
    toast.style.animation = 'toast-exit 200ms ease-out forwards';
    
    // Remove from DOM after animation
    setTimeout(() => {
      if (toast.parentNode === this.container) {
        this.container.removeChild(toast);
      }
    }, 200);
  },
  
  /**
   * Shows a success toast
   * @param {Object} options Toast options
   */
  success(options) {
    return this.show({ ...options, variant: 'success' });
  },
  
  /**
   * Shows an error toast
   * @param {Object} options Toast options
   */
  error(options) {
    return this.show({ ...options, variant: 'error' });
  },
  
  /**
   * Shows a warning toast
   * @param {Object} options Toast options
   */
  warning(options) {
    return this.show({ ...options, variant: 'warning' });
  },
  
  /**
   * Shows an info toast
   * @param {Object} options Toast options
   */
  info(options) {
    return this.show({ ...options, variant: 'info' });
  }
};

// Export the Toast object
window.Toast = Toast;