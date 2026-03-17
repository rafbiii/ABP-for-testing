import axios from 'axios';

// Configure base URL for API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetch main page data including user info and articles
 * @param {string} token - JWT token from localStorage
 * @returns {Promise} API response data
 */
export const fetchMainPageData = async (token) => {
  try {
    const response = await apiClient.post('/article/main_page', {
      token: token,
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        error: 'server_error',
        message: error.response.data?.confirmation || 'Server error occurred',
        data: error.response.data,
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        success: false,
        error: 'network_error',
        message: 'Network error. Please check your connection.',
      };
    } else {
      // Something else happened
      return {
        success: false,
        error: 'unknown_error',
        message: 'An unexpected error occurred',
      };
    }
  }
};

/**
 * Convert binary image data to base64 data URL
 * @param {string} imageData - Binary image data from API
 * @returns {string|null} Base64 data URL or null
 */
export const convertImageToBase64 = (imageData) => {
  if (!imageData) return null;

  try {
    // Convert string to Uint8Array
    const uint8Array = new Uint8Array(
      imageData.split('').map((char) => char.charCodeAt(0))
    );

    // Convert Uint8Array to base64
    let binary = '';
    const len = uint8Array.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8Array[i]);
    }
    const base64 = window.btoa(binary);

    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error('Error converting image:', error);
    return null;
  }
};

/**
 * Map article tag to display category name
 * @param {string} tag - Article tag from API
 * @returns {string} Display category name
 */
export const getCategoryName = (tag) => {
  const categoryMap = {
    gaming: 'Gaming',
    office: 'Office',
    flagship: 'Flagship',
    budget: 'Budget',
    ultrabook: 'Ultrabook',
    workstation: 'Workstation',
    premium: 'Premium',
  };
  return categoryMap[tag?.toLowerCase()] || tag || 'General';
};

/**
 * Transform API article data to component format
 * @param {Array} apiArticles - Articles from API
 * @returns {Array} Transformed articles
 */
export const transformArticles = (apiArticles) => {
  if (!Array.isArray(apiArticles)) return [];

  return apiArticles.map((article) => ({
    id: article.article_id,
    title: article.article_title || 'Untitled',
    category: getCategoryName(article.article_tag),
    excerpt: article.article_preview || 'No description available',
    image: convertImageToBase64(article.article_image),
    tag: article.article_tag,
  }));
};

export default {
  fetchMainPageData,
  convertImageToBase64,
  getCategoryName,
  transformArticles,
};
