/**
 * Main application entry point for Impact Wrapped
 * - Supports both standalone mode and WordPress embedding
 */

// Main initialization function
const initializeApp = async (options = {}) => {
  const isWordPressMode = options.wordPressMode || false;
  const containerId = options.containerId || 'app';
  
  console.log(`Initializing Impact Wrapped in ${isWordPressMode ? 'WordPress' : 'standalone'} mode`);
  
  // Initialize the toast system
  Toast.init({
    containerClass: isWordPressMode ? 'impact-wrapped-toasts' : 'toast-container'
  });
  
  // Initialize authentication
  await Auth.init();
  
  // Register routes
  Router.register('/', Pages.Landing.render);
  Router.register('/auth/login', Pages.Login.render);
  Router.register('/auth/register', Pages.Register.render);
  
  // Admin routes (require authentication)
  Router.register('/admin', Pages.AdminDashboard.render, { requireAuth: true });
  Router.register('/admin/upload-new', AdminPages.UploadPage.render, { requireAuth: true });
  Router.register('/admin/configure', AdminPages.ConfigurePage.render, { requireAuth: true });
  
  // Set up 404 handler
  Router.setNotFoundHandler(Pages.NotFound.render);
  
  // Initialize router with options
  Router.init({
    containerId: containerId,
    wordPressMode: isWordPressMode
  });
  
  // Watch for auth changes
  Auth.subscribe(authState => {
    // Re-render current page on auth changes
    Router.handleRoute(Router.currentPath);
  });
  
  // Component initialization functions
  const initializePageComponents = () => {
    // Check if we're on the upload page - handle both URL path and hash-based routing
    const currentPath = isWordPressMode ? 
      (window.location.hash.slice(1) || '/') : 
      window.location.pathname;
      
    if (currentPath === '/admin/upload-new') {
      AdminPages.UploadPage.init();
    } else if (currentPath === '/admin/configure') {
      AdminPages.ConfigurePage.init && AdminPages.ConfigurePage.init();
    }
  };
  
  // Initialize components after route changes
  Router.onAfterRouteChange = initializePageComponents;
  
  // Run initial component initialization
  initializePageComponents();
  
  // Initialize Lucide icons if available
  if (window.lucide) {
    lucide.createIcons();
  }
  
  console.log('Impact Wrapped application initialized');
  
  // Return the app API for external control
  return {
    navigate: (path) => Router.navigate(path),
    refresh: () => Router.handleRoute(Router.currentPath)
  };
};

// Auto-initialize in standalone mode
if (!window.ImpactWrappedWP) {
  document.addEventListener('DOMContentLoaded', async () => {
    window.ImpactWrappedApp = await initializeApp();
  });
} else {
  // Export the initializer for WordPress integration
  window.ImpactWrappedInit = initializeApp;
}

// Create error reporting mechanism
window.addEventListener('error', event => {
  console.error('Application error:', event.error);
  
  // Show error toast
  Toast.show({
    title: 'Application Error',
    description: 'An unexpected error occurred. Please try again.',
    variant: 'error'
  });
});

// Handle unhandled promises
window.addEventListener('unhandledrejection', event => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // Show error toast
  Toast.show({
    title: 'Application Error',
    description: 'An unexpected error occurred. Please try again.',
    variant: 'error'
  });
});