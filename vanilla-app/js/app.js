/**
 * Main application entry point for Impact Wrapped
 */

// Initialize all components
document.addEventListener('DOMContentLoaded', async () => {
  // Initialize the toast system
  Toast.init();
  
  // Initialize authentication
  await Auth.init();
  
  // Register routes
  Router.register('/', Pages.Landing.render);
  Router.register('/auth/login', Pages.Login.render);
  Router.register('/auth/register', Pages.Register.render);
  
  // Admin routes (require authentication)
  Router.register('/admin', Pages.AdminDashboard.render, { requireAuth: true });
  
  // Set up 404 handler
  Router.setNotFoundHandler(Pages.NotFound.render);
  
  // Initialize router
  Router.init();
  
  // Watch for auth changes
  Auth.subscribe(authState => {
    // Re-render current page on auth changes
    Router.handleRoute(Router.currentPath);
  });
  
  // Initialize Lucide icons if available
  if (window.lucide) {
    lucide.createIcons();
  }
  
  console.log('Impact Wrapped application initialized');
});

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