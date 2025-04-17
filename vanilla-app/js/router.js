/**
 * Client-side router for Impact Wrapped application
 * - Supports both direct usage and WordPress integration
 */

const Router = {
  // Current route
  currentPath: window.location.pathname,
  
  // Route handlers
  routes: [],
  
  // Not found handler
  notFoundHandler: null,
  
  // App container element
  container: null,
  
  // After route change callback
  onAfterRouteChange: null,
  
  // WordPress mode flag
  isWordPressMode: false,
  
  /**
   * Initializes the router
   * @param {Object} options Router initialization options
   * @param {string} [options.containerId='app'] Container ID
   * @param {boolean} [options.wordPressMode=false] Whether in WordPress mode
   */
  init(options = {}) {
    const containerId = options.containerId || 'app';
    this.isWordPressMode = options.wordPressMode || false;
    
    // Get app container
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.error(`App container with ID "${containerId}" not found`);
      return;
    }
    
    // In WordPress mode, check for hash-based routing
    if (this.isWordPressMode) {
      // Listen for hashchange events
      window.addEventListener('hashchange', () => {
        const path = window.location.hash.slice(1) || '/';
        this.handleRoute(path);
      });
      
      // Initial route handling from hash
      const initialPath = window.location.hash.slice(1) || '/';
      this.handleRoute(initialPath);
    } else {
      // Standard SPA routing
      // Listen for popstate events (back/forward navigation)
      window.addEventListener('popstate', () => {
        this.handleRoute(window.location.pathname);
      });
      
      // Initial route handling
      this.handleRoute(window.location.pathname);
    }
  },
  
  /**
   * Registers a route
   * @param {string|RegExp} path Route path or pattern
   * @param {function} handler Route handler function
   * @param {Object} options Route options
   */
  register(path, handler, options = {}) {
    this.routes.push({
      path,
      handler,
      options
    });
  },
  
  /**
   * Sets the not found handler
   * @param {function} handler Not found handler function
   */
  setNotFoundHandler(handler) {
    this.notFoundHandler = handler;
  },
  
  /**
   * Navigates to a new route
   * @param {string} path Route path
   * @param {boolean} replace Whether to replace history entry
   */
  navigate(path, replace = false) {
    if (this.isWordPressMode) {
      // In WordPress mode, use hash-based routing
      const currentUrl = window.location.href;
      const baseUrl = currentUrl.split('#')[0];
      
      if (replace) {
        window.location.replace(`${baseUrl}#${path}`);
      } else {
        window.location.href = `${baseUrl}#${path}`;
      }
      
      // The hashchange event will trigger handleRoute
    } else {
      // Standard history API based routing
      if (replace) {
        window.history.replaceState(null, '', path);
      } else {
        window.history.pushState(null, '', path);
      }
      
      // Handle the new route
      this.handleRoute(path);
    }
  },
  
  /**
   * Handles a route change
   * @param {string} path Route path
   */
  handleRoute(path) {
    this.currentPath = path;
    
    // Find matching route
    const route = this.findRoute(path);
    
    if (route) {
      // Extract params if route pattern is a regular expression
      let params = {};
      if (route.path instanceof RegExp) {
        const matches = path.match(route.path);
        if (matches && matches.groups) {
          params = matches.groups;
        }
      }
      
      // Check if route requires authentication
      if (route.options.requireAuth && !Auth.isAuthenticated) {
        // Redirect to login page
        this.navigate('/auth/login', true);
        return;
      }
      
      // Render route
      this.renderRoute(route.handler, params);
    } else if (this.notFoundHandler) {
      // Render not found page
      this.renderRoute(this.notFoundHandler);
    } else {
      // Default not found message
      this.container.innerHTML = '<div class="p-8"><h1 class="text-2xl font-bold">Page Not Found</h1></div>';
    }
  },
  
  /**
   * Finds a matching route for a path
   * @param {string} path Route path
   * @returns {Object|null} Matching route or null
   */
  findRoute(path) {
    return this.routes.find(route => {
      if (typeof route.path === 'string') {
        return route.path === path;
      } else if (route.path instanceof RegExp) {
        return route.path.test(path);
      }
      return false;
    }) || null;
  },
  
  /**
   * Renders a route
   * @param {function} handler Route handler function
   * @param {Object} params Route parameters
   */
  renderRoute(handler, params = {}) {
    // Clear container
    this.container.innerHTML = '';
    
    // Execute handler and get content
    const content = handler(params);
    
    // Append content to container
    if (typeof content === 'string') {
      this.container.innerHTML = content;
    } else if (content instanceof Node) {
      this.container.appendChild(content);
    }
    
    // Scroll to top of page
    window.scrollTo(0, 0);
    
    // Initialize any components in the new page
    this.initPageComponents();
    
    // Call onAfterRouteChange callback if defined
    if (typeof this.onAfterRouteChange === 'function') {
      this.onAfterRouteChange();
    }
  },
  
  /**
   * Initializes components in the current page
   */
  initPageComponents() {
    // Initialize Lucide icons
    if (window.lucide) {
      lucide.createIcons();
    }
    
    // Select all elements with data-component attribute
    const componentElements = document.querySelectorAll('[data-component]');
    
    // Initialize each component
    componentElements.forEach(element => {
      const componentName = element.dataset.component;
      const componentId = element.id;
      
      if (Components[componentName] && typeof Components[componentName].init === 'function') {
        Components[componentName].init(componentId, element);
      }
    });
  }
};

// Export the Router object
window.Router = Router;