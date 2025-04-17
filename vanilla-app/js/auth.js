/**
 * Authentication module for Impact Wrapped application
 */

const Auth = {
  // Auth state
  isAuthenticated: false,
  user: null,
  
  // Subscribers to auth state changes
  subscribers: [],
  
  /**
   * Initializes the auth module
   * @returns {Promise} Promise that resolves when initialization is complete
   */
  async init() {
    try {
      const currentUser = await API.Auth.getCurrentUser();
      this.setUser(currentUser);
    } catch (error) {
      // User is not authenticated, that's okay
      this.setUser(null);
    }
    
    return Promise.resolve();
  },
  
  /**
   * Sets the current user and updates auth state
   * @param {Object|null} user User object or null if not authenticated
   */
  setUser(user) {
    this.user = user;
    this.isAuthenticated = !!user;
    
    // Notify subscribers
    this.notifySubscribers();
  },
  
  /**
   * Registers for signup
   * @param {string} username Username
   * @param {string} password Password
   * @returns {Promise} Promise that resolves with the user
   */
  async register(username, password) {
    try {
      const user = await API.Auth.register(username, password);
      this.setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Logs in a user
   * @param {string} username Username
   * @param {string} password Password
   * @returns {Promise} Promise that resolves with the user
   */
  async login(username, password) {
    try {
      const user = await API.Auth.login(username, password);
      this.setUser(user);
      return user;
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Logs out the current user
   * @returns {Promise} Promise that resolves when logout is complete
   */
  async logout() {
    try {
      await API.Auth.logout();
      this.setUser(null);
    } catch (error) {
      throw error;
    }
  },
  
  /**
   * Subscribes to auth state changes
   * @param {function} callback Callback function
   * @returns {function} Unsubscribe function
   */
  subscribe(callback) {
    this.subscribers.push(callback);
    
    // Immediately call with current state
    callback({
      isAuthenticated: this.isAuthenticated,
      user: this.user
    });
    
    // Return unsubscribe function
    return () => {
      this.subscribers = this.subscribers.filter(cb => cb !== callback);
    };
  },
  
  /**
   * Notifies subscribers of auth state changes
   */
  notifySubscribers() {
    const authState = {
      isAuthenticated: this.isAuthenticated,
      user: this.user
    };
    
    this.subscribers.forEach(callback => {
      callback(authState);
    });
  }
};

// Export the Auth object
window.Auth = Auth;