/**
 * Toast notification system for Impact Wrapped application
 */

const Toast = {
  // Container element for toasts
  container: null,
  
  // Default toast duration in milliseconds
  defaultDuration: 5000,
  
  // Maximum number of visible toasts
  maxToasts: 5,
  
  // Currently active toasts
  toasts: [],
  
  /**
   * Initializes the toast system
   */
  init() {
    this.container = document.getElementById('toast-container');
    if (!this.container) {
      console.error('Toast container not found');
    }
  },
  
  /**
   * Shows a toast notification
   * @param {Object} options Toast options
   * @param {string} options.title Toast title
   * @param {string} options.description Toast description
   * @param {string} options.variant Toast variant (default, success, error)
   * @param {number} options.duration Toast duration in milliseconds
   * @returns {string} Toast ID
   */
  show({ title, description, variant = 'default', duration = this.defaultDuration }) {
    // Generate random ID
    const id = Math.random().toString(36).substring(2, 10);
    
    // Create toast element
    const toastElement = this.createToastElement({
      id,
      title,
      description,
      variant
    });
    
    // Add toast to container
    this.container.appendChild(toastElement);
    
    // Add to active toasts
    this.toasts.push({
      id,
      element: toastElement,
      timeoutId: setTimeout(() => this.dismiss(id), duration)
    });
    
    // Prune old toasts if we exceed the maximum
    this.pruneOldToasts();
    
    return id;
  },
  
  /**
   * Creates a toast element
   * @param {Object} options Toast options
   * @returns {HTMLElement} Toast element
   */
  createToastElement({ id, title, description, variant }) {
    // Create toast container
    const toast = document.createElement('div');
    toast.className = `toast ${variant === 'error' ? 'toast-error' : variant === 'success' ? 'toast-success' : ''}`;
    toast.id = `toast-${id}`;
    
    // Create toast header
    const header = document.createElement('div');
    header.className = 'toast-header';
    
    // Create title
    const titleElement = document.createElement('div');
    titleElement.className = 'toast-title';
    titleElement.textContent = title;
    header.appendChild(titleElement);
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'toast-close';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = () => this.dismiss(id);
    header.appendChild(closeButton);
    
    toast.appendChild(header);
    
    // Create description
    if (description) {
      const descriptionElement = document.createElement('div');
      descriptionElement.className = 'toast-description';
      descriptionElement.textContent = description;
      toast.appendChild(descriptionElement);
    }
    
    return toast;
  },
  
  /**
   * Dismisses a toast
   * @param {string} id Toast ID
   */
  dismiss(id) {
    const toast = this.toasts.find(t => t.id === id);
    if (!toast) return;
    
    // Clear timeout
    clearTimeout(toast.timeoutId);
    
    // Add exit animation
    toast.element.style.opacity = '0';
    toast.element.style.transform = 'translateX(10px)';
    
    // Remove element after animation
    setTimeout(() => {
      if (toast.element.parentNode) {
        toast.element.parentNode.removeChild(toast.element);
      }
      
      // Remove from active toasts
      this.toasts = this.toasts.filter(t => t.id !== id);
    }, 300);
  },
  
  /**
   * Dismisses all toasts
   */
  dismissAll() {
    [...this.toasts].forEach(toast => this.dismiss(toast.id));
  },
  
  /**
   * Prunes old toasts if we exceed the maximum
   */
  pruneOldToasts() {
    if (this.toasts.length <= this.maxToasts) return;
    
    // Dismiss the oldest toasts
    const toastsToDismiss = this.toasts.slice(0, this.toasts.length - this.maxToasts);
    toastsToDismiss.forEach(toast => this.dismiss(toast.id));
  }
};

// Export the Toast object
window.Toast = Toast;