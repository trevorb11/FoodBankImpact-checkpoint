/**
 * Utility functions for Impact Wrapped application
 */

const Util = {
  /**
   * Formats a number as currency
   * @param {number} value Number to format
   * @param {string} locale Locale to use for formatting
   * @param {string} currency Currency code
   * @returns {string} Formatted currency string
   */
  formatCurrency(value, locale = 'en-US', currency = 'USD') {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency
    }).format(value);
  },
  
  /**
   * Formats a date
   * @param {string|Date} date Date to format
   * @param {Object} options Formatting options
   * @returns {string} Formatted date string
   */
  formatDate(date, options = {}) {
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    };
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(dateObj);
  },
  
  /**
   * Formats a large number with abbreviations (K, M, B)
   * @param {number} num Number to format
   * @returns {string} Formatted number string
   */
  formatNumber(num) {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },
  
  /**
   * Truncates a string to a specified length
   * @param {string} str String to truncate
   * @param {number} length Maximum length
   * @param {string} ellipsis Ellipsis string
   * @returns {string} Truncated string
   */
  truncate(str, length = 100, ellipsis = '...') {
    if (!str || str.length <= length) {
      return str;
    }
    
    return str.slice(0, length) + ellipsis;
  },
  
  /**
   * Debounces a function call
   * @param {function} func Function to debounce
   * @param {number} wait Wait time in milliseconds
   * @returns {function} Debounced function
   */
  debounce(func, wait = 300) {
    let timeout;
    
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      
      timeout = setTimeout(() => {
        func.apply(context, args);
      }, wait);
    };
  },
  
  /**
   * Generates a random string
   * @param {number} length Length of the string
   * @returns {string} Random string
   */
  randomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  },
  
  /**
   * Parses query parameters from URL
   * @param {string} url URL to parse
   * @returns {Object} Query parameters
   */
  parseQueryParams(url = window.location.search) {
    const params = {};
    const searchParams = new URLSearchParams(url);
    
    for (const [key, value] of searchParams.entries()) {
      params[key] = value;
    }
    
    return params;
  },
  
  /**
   * Creates a URL with query parameters
   * @param {string} url Base URL
   * @param {Object} params Query parameters
   * @returns {string} URL with query parameters
   */
  buildUrl(url, params = {}) {
    const urlObj = new URL(url, window.location.origin);
    
    for (const key in params) {
      if (params[key] !== undefined && params[key] !== null) {
        urlObj.searchParams.append(key, params[key]);
      }
    }
    
    return urlObj.toString();
  },
  
  /**
   * Calculates impact metrics from donation amount
   * @param {number} donationAmount Donation amount in dollars
   * @param {Object} metrics Impact metrics configuration
   * @returns {Object} Calculated impact metrics
   */
  calculateImpact(donationAmount, metrics = {}) {
    const defaultMetrics = {
      dollarsPerMeal: 0.20,
      mealsPerPerson: 3,
      poundsPerMeal: 1.2,
      co2PerPound: 2.5,
      waterPerPound: 108
    };
    
    const config = { ...defaultMetrics, ...metrics };
    
    const meals = donationAmount / config.dollarsPerMeal;
    const peopleNourished = Math.floor(meals / config.mealsPerPerson);
    const daysNourished = Math.floor(meals / config.mealsPerPerson / 1);
    const poundsOfFood = meals * config.poundsPerMeal;
    const co2Saved = poundsOfFood * config.co2PerPound;
    const waterSaved = poundsOfFood * config.waterPerPound;
    
    return {
      meals: Math.round(meals),
      peopleNourished,
      daysNourished,
      poundsOfFood: Math.round(poundsOfFood),
      co2Saved: Math.round(co2Saved),
      waterSaved: Math.round(waterSaved)
    };
  }
};

// Export the Util object
window.Util = Util;