/**
 * Utility functions for the application
 */

/**
 * Format date to locale string
 */
export const formatDate = (date, locale = 'de-DE') => {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format datetime to locale string
 */
export const formatDateTime = (date, locale = 'de-DE') => {
  return new Date(date).toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Debounce function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

/**
 * Deep clone object
 */
export const deepClone = obj => JSON.parse(JSON.stringify(obj));

/**
 * Check if object is empty
 */
export const isEmpty = obj => {
  if (!obj) return true;
  return Object.keys(obj).length === 0;
};

/**
 * Capitalize first letter
 */
export const capitalize = str => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Truncate text
 */
export const truncate = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (value, total) => {
  if (!total) return 0;
  return Math.round((value / total) * 100);
};

/**
 * Format score to percentage
 */
export const formatScore = score => {
  return `${Math.round(score * 100)}%`;
};

/**
 * Get level color
 */
export const getLevelColor = level => {
  const colors = {
    A1: 'text-green-600',
    A2: 'text-blue-600',
    B1: 'text-purple-600',
    B2: 'text-orange-600',
    C1: 'text-red-600',
    C2: 'text-pink-600',
  };
  return colors[level] || 'text-gray-600';
};

/**
 * Get level gradient
 */
export const getLevelGradient = level => {
  const gradients = {
    A1: 'from-green-400 to-green-600',
    A2: 'from-blue-400 to-blue-600',
    B1: 'from-purple-400 to-purple-600',
    B2: 'from-orange-400 to-orange-600',
    C1: 'from-red-400 to-red-600',
    C2: 'from-pink-400 to-pink-600',
  };
  return gradients[level] || 'from-gray-400 to-gray-600';
};

/**
 * Generate random ID
 */
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Sleep/delay function
 */
export const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if user is on mobile
 */
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async text => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

/**
 * Validate email
 */
export const isValidEmail = email => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Get error message
 */
export const getErrorMessage = error => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};
