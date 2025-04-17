/**
 * Utility functions for the Impact Wrapped application
 */

// Helper to combine class names
function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Calculates impact metrics based on donation amount using food bank specific metrics if available
 * @param {number} amount Donation amount in dollars
 * @param {Object} foodBank Optional food bank with custom impact factors
 * @returns {Object} Object with calculated impact metrics
 */
function calculateImpactMetrics(amount, foodBank = null) {
  // Default values based on Feeding America metrics
  const dollarsPerMeal = foodBank?.dollarsPerMeal || 0.20;
  const mealsPerPerson = foodBank?.mealsPerPerson || 3;
  const poundsPerMeal = foodBank?.poundsPerMeal || 1.2;
  const co2PerPound = foodBank?.co2PerPound || 2.5;
  const waterPerPound = foodBank?.waterPerPound || 108;

  // Calculate metrics
  const meals = Math.round(amount / dollarsPerMeal);
  const peopleServed = Math.round(meals / mealsPerPerson);
  const poundsSaved = Math.round(meals * poundsPerMeal);
  const co2Saved = Math.round(poundsSaved * co2PerPound);
  const waterSaved = Math.round(poundsSaved * waterPerPound);

  return {
    meals,
    peopleServed,
    poundsSaved,
    co2Saved,
    waterSaved
  };
}

/**
 * Formats a date to a readable string
 * @param {string|Date} dateString Date string or Date object
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

/**
 * Generates a unique hash for donor impact URLs
 * @param {string} email Donor email
 * @returns {string} Hashed string
 */
function generateImpactUrlHash(email) {
  // Simple hash function for demo purposes
  // In production, use a proper crypto library
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    const char = email.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Copies text to clipboard
 * @param {string} text Text to copy
 * @returns {Promise} Promise that resolves when text is copied
 */
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
}

/**
 * Creates DOM element with attributes and children
 * @param {string} tag HTML tag name
 * @param {Object} attrs Attributes to set on element
 * @param {Array|Node|string} children Children to append
 * @returns {HTMLElement} Created element
 */
function createElement(tag, attrs = {}, children = []) {
  const element = document.createElement(tag);
  
  // Set attributes
  Object.entries(attrs).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else if (key.startsWith('on') && typeof value === 'function') {
      const eventName = key.substring(2).toLowerCase();
      element.addEventListener(eventName, value);
    } else {
      element.setAttribute(key, value);
    }
  });
  
  // Append children
  if (Array.isArray(children)) {
    children.forEach(child => {
      if (child) {
        appendChild(element, child);
      }
    });
  } else if (children) {
    appendChild(element, children);
  }
  
  return element;
}

/**
 * Helper function to append a child to an element
 * @param {HTMLElement} parent Parent element
 * @param {Node|string} child Child to append
 */
function appendChild(parent, child) {
  if (typeof child === 'string' || typeof child === 'number') {
    parent.appendChild(document.createTextNode(child));
  } else if (child instanceof Node) {
    parent.appendChild(child);
  }
}

/**
 * Validates an email address
 * @param {string} email Email to validate
 * @returns {boolean} Whether email is valid
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Format currency amount
 * @param {number} amount Amount to format
 * @returns {string} Formatted currency
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Format number with commas
 * @param {number} num Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num);
}