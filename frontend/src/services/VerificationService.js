import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Verify if user is admin
 * @param {string} token - JWT token from localStorage
 * @returns {Promise} Verification result
 */
export const verifyAdmin = async (token) => {
  try {
    const response = await apiClient.post('/article/verification', {
      token: token,
    });

    const data = response.data;
    // Handle different confirmations
    if (data.confirmation === 'token invalid') {
      return {
        success: false,
        isAdmin: false,
        error: 'token_invalid',
        confirmation: 'token invalid',
      };
    }

    if (data.confirmation === 'backend error') {
      return {
        success: false,
        isAdmin: false,
        error: 'backend_error',
        confirmation: 'backend error',
      };
    }

    if (data.confirmation === 'not admin') {
      return {
        success: true,
        isAdmin: false,
        confirmation: 'not admin',
      };
    }

    if (data.confirmation === 'successful') {
      return {
        success: true,
        isAdmin: true,
        confirmation: 'successful',
      };
    }

    // Default fallback
    return {
      success: false,
      isAdmin: false,
      error: 'unknown',
      confirmation: 'unknown',
    };
  } catch (error) {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        isAdmin: false,
        error: 'server_error',
        confirmation: error.response.data?.confirmation || 'Server error occurred',
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        success: false,
        isAdmin: false,
        error: 'network_error',
        confirmation: 'network error',
      };
    } else {
      // Something else happened
      return {
        success: false,
        isAdmin: false,
        error: 'unknown_error',
        confirmation: 'unknown error',
      };
    }
  }
};

export default {
  verifyAdmin,
};
