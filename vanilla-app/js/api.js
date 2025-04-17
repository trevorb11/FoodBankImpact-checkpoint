/**
 * API client for Impact Wrapped application
 * - Compatible with WordPress integration
 */

const API = {
  // API configuration
  baseUrl: '',
  apiPrefix: '/api',
  wordPressMode: false,
  
  /**
   * Configures the API client
   * @param {Object} config API configuration
   * @param {string} config.baseUrl Base URL for API requests (used in WordPress mode)
   * @param {string} config.apiPrefix API endpoint prefix
   * @param {boolean} config.wordPressMode Whether to use WordPress mode
   */
  configure(config = {}) {
    if (config.baseUrl !== undefined) this.baseUrl = config.baseUrl;
    if (config.apiPrefix !== undefined) this.apiPrefix = config.apiPrefix;
    if (config.wordPressMode !== undefined) this.wordPressMode = config.wordPressMode;
    
    console.log(`API configured: ${this.wordPressMode ? 'WordPress' : 'Standalone'} mode, baseUrl: ${this.baseUrl || '(none)'}, prefix: ${this.apiPrefix}`);
  },
  
  /**
   * Makes a request to the API
   * @param {string} endpoint API endpoint
   * @param {Object} options Fetch options
   * @returns {Promise} Promise with response data
   */
  async request(endpoint, options = {}) {
    // Handle URL construction based on mode
    let url;
    
    if (this.wordPressMode) {
      // WordPress mode - construct full URL with baseUrl
      if (endpoint.startsWith('http')) {
        // Already a full URL
        url = endpoint;
      } else {
        // Construct URL with baseUrl and apiPrefix
        const endpointWithPrefix = endpoint.startsWith(this.apiPrefix) ? 
          endpoint : 
          `${this.apiPrefix}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
        
        url = `${this.baseUrl}${endpointWithPrefix}`;
      }
    } else {
      // Standard mode - use relative URL
      url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    }
    
    // Default headers
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    // Build request options
    const requestOptions = {
      ...options,
      headers,
      credentials: 'include' // Include cookies in all requests
    };
    
    try {
      const response = await fetch(url, requestOptions);
      
      // If status is 204 No Content, return null
      if (response.status === 204) {
        return null;
      }
      
      // Parse JSON response
      const data = await response.json();
      
      // Check if response is ok
      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },
  
  /**
   * Performs a GET request
   * @param {string} endpoint API endpoint
   * @param {Object} options Additional fetch options
   * @returns {Promise} Promise with response data
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'GET',
      ...options
    });
  },
  
  /**
   * Performs a POST request
   * @param {string} endpoint API endpoint
   * @param {Object} data Data to send
   * @param {Object} options Additional fetch options
   * @returns {Promise} Promise with response data
   */
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    });
  },
  
  /**
   * Performs a PUT request
   * @param {string} endpoint API endpoint
   * @param {Object} data Data to send
   * @param {Object} options Additional fetch options
   * @returns {Promise} Promise with response data
   */
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    });
  },
  
  /**
   * Performs a DELETE request
   * @param {string} endpoint API endpoint
   * @param {Object} options Additional fetch options
   * @returns {Promise} Promise with response data
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options
    });
  },
  
  // API endpoints
  auth: {
    /**
     * Registers a new user
     * @param {string} username Username
     * @param {string} password Password
     * @returns {Promise} Promise with user data
     */
    register(username, password) {
      return API.post('/api/auth/register', { username, password });
    },
    
    /**
     * Logs in a user
     * @param {string} username Username
     * @param {string} password Password
     * @returns {Promise} Promise with user data
     */
    login(username, password) {
      return API.post('/api/auth/login', { username, password });
    },
    
    /**
     * Logs out the current user
     * @returns {Promise} Promise
     */
    logout() {
      return API.post('/api/auth/logout', {});
    },
    
    /**
     * Gets the current user
     * @returns {Promise} Promise with user data
     */
    getCurrentUser() {
      return API.get('/api/auth/me').catch(err => {
        // If unauthorized, return null instead of throwing
        if (err.message === 'Unauthorized') {
          return null;
        }
        throw err;
      });
    }
  },
  
  foodBank: {
    /**
     * Gets the current user's food bank
     * @returns {Promise} Promise with food bank data
     */
    getMyFoodBank() {
      return API.get('/api/my-food-bank');
    },
    
    /**
     * Updates the current user's food bank
     * @param {Object} foodBankData Food bank data
     * @returns {Promise} Promise with updated food bank
     */
    updateMyFoodBank(foodBankData) {
      return API.post('/api/my-food-bank', foodBankData);
    },
    
    /**
     * Gets a food bank by ID
     * @param {number} id Food bank ID
     * @returns {Promise} Promise with food bank data
     */
    getFoodBank(id) {
      return API.get(`/api/food-bank/${id}`);
    },
    
    /**
     * Updates a food bank
     * @param {number} id Food bank ID
     * @param {Object} foodBankData Food bank data
     * @returns {Promise} Promise with updated food bank
     */
    updateFoodBank(id, foodBankData) {
      return API.post(`/api/food-bank/${id}`, foodBankData);
    }
  },
  
  donors: {
    /**
     * Gets all donors for the current user's food bank
     * @returns {Promise} Promise with donors data
     */
    getMyDonors() {
      return API.get('/api/my-donors');
    },
    
    /**
     * Uploads donor data
     * @param {Object} data Donor data to upload
     * @returns {Promise} Promise with upload result
     */
    uploadDonors(data) {
      return API.post('/api/donors/upload', data);
    },
    
    /**
     * Gets donor files for the current user's food bank
     * @returns {Promise} Promise with donor files
     */
    getMyDonorFiles() {
      return API.get('/api/my-donor-files');
    },
    
    /**
     * Gets donors for a specific file
     * @param {number} fileId File ID
     * @returns {Promise} Promise with donors data
     */
    getDonorsByFile(fileId) {
      return API.get(`/api/donor-files/${fileId}/donors`);
    },
    
    /**
     * Gets donors for a specific food bank
     * @param {number} foodBankId Food bank ID
     * @returns {Promise} Promise with donors data
     */
    getDonorsByFoodBank(foodBankId) {
      return API.get(`/api/donors/food-bank/${foodBankId}`);
    },
    
    /**
     * Gets a donor's impact data by URL hash
     * @param {string} urlHash URL hash
     * @returns {Promise} Promise with impact data
     */
    getImpactByUrl(urlHash) {
      return API.get(`/api/impact/${urlHash}`);
    }
  },
  
  settings: {
    /**
     * Gets current user's settings
     * @returns {Promise} Promise with settings data
     */
    getMySettings() {
      return API.get('/api/my-settings');
    },
    
    /**
     * Updates current user's settings
     * @param {Object} settingsData Settings data
     * @returns {Promise} Promise with updated settings
     */
    updateMySettings(settingsData) {
      return API.post('/api/my-settings', settingsData);
    }
  }
};

// Export the API object
window.API = API;