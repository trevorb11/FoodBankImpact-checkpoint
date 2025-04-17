/**
 * WordPress Integration Module for Impact Wrapped
 * 
 * This module provides helpers for integrating the Impact Wrapped application
 * into a WordPress site through a shortcode or block.
 */

(function() {
  // Store original configuration to avoid conflicts with WordPress
  const originalConfig = {
    baseUrl: null,
    apiPrefix: null,
    mountPoint: null,
    initialized: false
  };

  // WordPress Integration API
  const WordPressIntegration = {
    /**
     * Initialize the Impact Wrapped app for WordPress embedding
     * @param {Object} config Configuration options
     * @param {string} config.baseUrl Base URL for the application API (e.g., 'https://api.example.com')
     * @param {string} config.apiPrefix Prefix for API endpoints (e.g., '/wp-json/impact-wrapped/v1')
     * @param {string} config.mountPoint CSS selector for the element where the app should be mounted
     * @returns {Object} The API instance
     */
    init(config) {
      if (originalConfig.initialized) {
        console.warn('Impact Wrapped WordPress integration already initialized');
        return this;
      }

      // Store original configuration
      originalConfig.baseUrl = config.baseUrl || window.location.origin;
      originalConfig.apiPrefix = config.apiPrefix || '/api';
      originalConfig.mountPoint = config.mountPoint || '#impact-wrapped-app';
      originalConfig.initialized = true;

      // Configure API for WordPress mode
      if (window.API && window.API.configure) {
        window.API.configure({
          baseUrl: originalConfig.baseUrl,
          apiPrefix: originalConfig.apiPrefix,
          wordPressMode: true
        });
      }

      // Initialize router to work within WordPress
      if (window.Router) {
        // Save original navigate method
        const originalNavigate = window.Router.navigate;
        
        // Override navigate method to handle WordPress environment
        window.Router.navigate = function(path) {
          // Get the hash part of the URL and remove it if present
          const currentUrl = window.location.href;
          const hashIndex = currentUrl.indexOf('#');
          const baseUrl = hashIndex !== -1 ? currentUrl.substring(0, hashIndex) : currentUrl;
          
          // Navigate with hash-based routing
          window.location.href = `${baseUrl}#${path}`;
          
          // Optionally update the UI directly
          window.Router.handleRouteChange();
        };
        
        // Add method to handle route changes manually
        window.Router.handleRouteChange = function() {
          const path = window.location.hash.slice(1) || '/';
          const route = window.Router.routes.find(route => route.path === path);
          
          if (route) {
            const mountPoint = document.querySelector(originalConfig.mountPoint);
            if (mountPoint) {
              // Clear mount point
              mountPoint.innerHTML = '';
              
              // Render the page
              const page = route.handler();
              mountPoint.appendChild(page);
              
              // Initialize page if needed
              if (route.init) {
                route.init();
              }
            }
          }
        };
        
        // Listen for hash changes
        window.addEventListener('hashchange', function() {
          window.Router.handleRouteChange();
        });
      }

      return this;
    },
    
    /**
     * Mount the Impact Wrapped app to the DOM
     * @param {string} [selector] Optional CSS selector to override the mount point
     * @returns {Promise} Promise that resolves when app is mounted
     */
    async mount(selector) {
      const mountPoint = document.querySelector(selector || originalConfig.mountPoint);
      
      if (!mountPoint) {
        console.error(`Mount point ${selector || originalConfig.mountPoint} not found`);
        return;
      }
      
      // Show loading indicator
      mountPoint.innerHTML = '<div class="impact-wrapped-loading">Loading Impact Wrapped...</div>';
      
      // Check if we should use the new initialization method
      if (window.ImpactWrappedInit) {
        try {
          // Initialize the app with WordPress options
          const app = await window.ImpactWrappedInit({
            containerId: mountPoint.id,
            wordPressMode: true
          });
          
          // Store the app instance for later use
          this.app = app;
          
          console.log('Impact Wrapped mounted in WordPress mode');
          return app;
        } catch (error) {
          console.error('Failed to mount Impact Wrapped:', error);
          mountPoint.innerHTML = '<div class="impact-wrapped-error">Failed to load Impact Wrapped</div>';
        }
      } else {
        // Fallback to the old method
        console.warn('Using legacy mounting method');
        
        // Handle initial routing
        if (window.Router) {
          // Initialize app with the correct route based on hash
          const path = window.location.hash.slice(1) || '/';
          const route = window.Router.routes.find(route => route.path === path) || 
                        window.Router.routes.find(route => route.path === '/');
          
          if (route) {
            // Clear mount point
            mountPoint.innerHTML = '';
            
            // Render the page
            const page = route.handler();
            mountPoint.appendChild(page);
            
            // Initialize page if needed
            if (route.init) {
              route.init();
            }
            
            console.log('Impact Wrapped mounted using legacy method');
          }
        }
      }
    },
    
    /**
     * Clean up the Impact Wrapped app and restore original state
     */
    unmount() {
      const mountPoint = document.querySelector(originalConfig.mountPoint);
      
      if (mountPoint) {
        mountPoint.innerHTML = '';
      }
      
      // Restore original configuration if needed
      originalConfig.initialized = false;
    }
  };
  
  // Make the integration API available globally
  window.ImpactWrappedWP = WordPressIntegration;
})();