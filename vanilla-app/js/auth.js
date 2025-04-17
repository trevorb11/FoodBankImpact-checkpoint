/**
 * Authentication system for Impact Wrapped application
 */

const Auth = {
  // Current user state
  user: null,
  loading: true,
  
  // Event listeners
  listeners: [],
  
  /**
   * Initializes the authentication system
   * @returns {Promise} Promise that resolves when auth is initialized
   */
  async init() {
    try {
      this.loading = true;
      this.notifyListeners();
      
      // Check if user is already logged in
      const userData = await API.auth.getCurrentUser();
      if (userData) {
        this.user = userData;
      }
      
      return this.user;
    } catch (error) {
      console.error('Auth initialization error:', error);
      return null;
    } finally {
      this.loading = false;
      this.notifyListeners();
    }
  },
  
  /**
   * Logs in a user
   * @param {string} username Username
   * @param {string} password Password
   * @returns {Promise<boolean>} Promise with login success
   */
  async login(username, password) {
    try {
      this.loading = true;
      this.notifyListeners();
      
      const userData = await API.auth.login(username, password);
      
      if (userData) {
        this.user = userData;
        Toast.show({
          title: 'Login successful',
          description: `Welcome back, ${userData.username}!`
        });
        this.notifyListeners();
        return true;
      }
      
      return false;
    } catch (error) {
      Toast.show({
        title: 'Login failed',
        description: 'Invalid username or password',
        variant: 'error'
      });
      return false;
    } finally {
      this.loading = false;
      this.notifyListeners();
    }
  },
  
  /**
   * Registers a new user
   * @param {string} username Username
   * @param {string} password Password
   * @returns {Promise<boolean>} Promise with registration success
   */
  async register(username, password) {
    try {
      this.loading = true;
      this.notifyListeners();
      
      const userData = await API.auth.register(username, password);
      
      if (userData) {
        this.user = userData;
        Toast.show({
          title: 'Registration successful',
          description: 'Your account has been created'
        });
        this.notifyListeners();
        return true;
      }
      
      return false;
    } catch (error) {
      Toast.show({
        title: 'Registration failed',
        description: 'Username may already be taken',
        variant: 'error'
      });
      return false;
    } finally {
      this.loading = false;
      this.notifyListeners();
    }
  },
  
  /**
   * Logs out the current user
   * @returns {Promise} Promise that resolves when logout is complete
   */
  async logout() {
    try {
      this.loading = true;
      this.notifyListeners();
      
      await API.auth.logout();
      this.user = null;
      
      Toast.show({
        title: 'Logged out',
        description: 'You have been logged out successfully'
      });
      
      // Navigate to home page after logout
      Router.navigate('/');
      
      return true;
    } catch (error) {
      Toast.show({
        title: 'Logout failed',
        description: 'Failed to log out',
        variant: 'error'
      });
      return false;
    } finally {
      this.loading = false;
      this.notifyListeners();
    }
  },
  
  /**
   * Subscribes to auth state changes
   * @param {function} listener Listener function
   * @returns {function} Unsubscribe function
   */
  subscribe(listener) {
    this.listeners.push(listener);
    
    // Call listener immediately with current state
    listener({
      user: this.user,
      loading: this.loading,
      isAuthenticated: !!this.user
    });
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },
  
  /**
   * Notifies all listeners of auth state changes
   */
  notifyListeners() {
    const authState = {
      user: this.user,
      loading: this.loading,
      isAuthenticated: !!this.user
    };
    
    this.listeners.forEach(listener => listener(authState));
  },
  
  /**
   * Checks if user is authenticated
   * @returns {boolean} Whether user is authenticated
   */
  get isAuthenticated() {
    return !!this.user;
  }
};

// Export the Auth object
window.Auth = Auth;