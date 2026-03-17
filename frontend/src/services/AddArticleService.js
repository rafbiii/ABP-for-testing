import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Convert file to base64 string
 * @param {File} file - File to convert
 * @returns {Promise<string>} Base64 string
 */
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove the data URL prefix (e.g., "data:image/png;base64,")
      const base64String = reader.result.split(',')[1];
      resolve(base64String);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Add a new article
 * @param {Object} articleData - Article data
 * @param {string} articleData.article_title - Article title
 * @param {string} articleData.article_preview - Article preview/excerpt
 * @param {string} articleData.article_content - Article content
 * @param {string} articleData.article_tag - Article category/tag (office, budget, gaming, flagship)
 * @param {File} articleData.article_image - Article image file (PNG/JPG)
 * @returns {Promise<Object>} Response with success/error structure
 */
export const addArticle = async (articleData) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return {
        success: false,
        error: 'token_invalid',
        message: 'No token found'
      };
    }

    // Convert image to base64 if exists
    let imageBase64 = '';
    if (articleData.article_image) {
      try {
        imageBase64 = await fileToBase64(articleData.article_image);
      } catch (err) {
        return {
          success: false,
          error: 'image_error',
          message: 'Failed to process image'
        };
      }
    }

    // Create JSON payload - ensure all required fields are present
    const payload = {
      token: token,
      article_title: articleData.article_title.trim(),
      article_preview: articleData.article_preview.trim(),
      article_content: articleData.article_content.trim(),
      article_tag: articleData.article_tag,
      article_image: imageBase64
    };

    console.log('Sending payload:', {
      ...payload,
      article_image: payload.article_image ? `${payload.article_image.substring(0, 50)}...` : 'empty',
      token: '***'
    });

    const response = await axios.post(
      `${API_BASE_URL}/article/add`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Backend response:', response.data);

    // Check backend response
    const confirmation = response.data.confirmation;

    if (confirmation === 'success: article added') {
      return {
        success: true,
        message: 'Article added successfully',
        data: response.data
      };
    } else if (confirmation === 'token invalid') {
      return {
        success: false,
        error: 'token_invalid',
        message: 'Authentication failed - please login again'
      };
    } else if (confirmation === 'not admin') {
      return {
        success: false,
        error: 'not_admin',
        message: 'You do not have admin privileges'
      };
    } else if (confirmation === 'backend error') {
      return {
        success: false,
        error: 'backend_error',
        message: 'Backend error occurred'
      };
    } else if (confirmation && confirmation.includes('must be')) {
      // Validation errors from backend
      return {
        success: false,
        error: 'validation_error',
        message: confirmation
      };
    } else {
      return {
        success: false,
        error: 'unknown_error',
        message: confirmation || 'Unknown error occurred'
      };
    }

  } catch (error) {
    console.error('Error in addArticle:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);

    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;

      // 422 Unprocessable Entity - Validation error
      if (status === 422) {
        const detail = data.detail;
        if (Array.isArray(detail) && detail.length > 0) {
          // FastAPI validation error format
          const errorMsg = detail.map(err => `${err.loc.join('.')}: ${err.msg}`).join(', ');
          return {
            success: false,
            error: 'validation_error',
            message: errorMsg
          };
        }
        return {
          success: false,
          error: 'validation_error',
          message: 'Invalid data format - please check all fields'
        };
      }

      // Token invalid or unauthorized
      if (status === 401 || status === 403) {
        return {
          success: false,
          error: 'token_invalid',
          message: 'Authentication failed'
        };
      }

      // Backend returned error with confirmation field
      if (data.confirmation) {
        return {
          success: false,
          error: 'backend_error',
          message: data.confirmation
        };
      }

      return {
        success: false,
        error: 'server_error',
        message: data.message || `Server error (${status})`
      };

    } else if (error.request) {
      // Request made but no response (network error)
      return {
        success: false,
        error: 'network_error',
        message: 'Cannot connect to server'
      };
    } else {
      // Something else happened
      return {
        success: false,
        error: 'unknown_error',
        message: error.message || 'An unexpected error occurred'
      };
    }
  }
};

/**
 * Validate image file format
 * @param {File} file - Image file to validate
 * @returns {boolean} True if valid PNG/JPG format
 */
export const validateImageFormat = (file) => {
  if (!file) return false;
  
  const validTypes = ['image/png', 'image/jpg', 'image/jpeg'];
  return validTypes.includes(file.type.toLowerCase());
};

/**
 * Validate article input data
 * @param {Object} articleData - Article data to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validateArticleInput = (articleData) => {
  const errors = {};
  
  // Title validation (1- 256 characters)
  if (!articleData.article_title || articleData.article_title.trim() === '') {
    errors.title = 'Please fill in the title';
  } else {
    const titleLength = articleData.article_title.trim().length;
    if (titleLength < 1) {
      errors.title = 'Title must be at least 1 character long';
    } else if (titleLength > 256) {
      errors.title = 'Title must not exceed 256 characters';
    }
  }
  
  // Preview validation (1-128 characters)
  if (!articleData.article_preview || articleData.article_preview.trim() === '') {
    errors.preview = 'Please fill in the excerpt';
  } else {
    const previewLength = articleData.article_preview.trim().length;
    if (previewLength < 1) {
      errors.preview = 'Excerpt must be at least 1 character long';
    } else if (previewLength > 128) {
      errors.preview = 'Excerpt must not exceed 128 characters';
    }
  }
  
  // Content validation (minimum 50 characters)
  if (!articleData.article_content || articleData.article_content.trim() === '') {
    errors.content = 'Please fill in the content';
  } else if (articleData.article_content.trim().length < 1) {
    errors.content = 'Content must be at least 1 character long';
  } else if (articleData.article_content.trim().length > 65536) {
    errors.content = 'Content must not exceed 65536 characters';
  }
  
  // Tag validation
  if (!articleData.article_tag || articleData.article_tag.trim() === '') {
    errors.tag = 'Please select a category';
  } else if (!['office', 'budget', 'gaming', 'flagship'].includes(articleData.article_tag)) {
    errors.tag = 'Category must be one of: office, budget, gaming, flagship';
  }
  
  // Image validation
  if (!articleData.article_image) {
    errors.image = 'Please select an image';
  } else if (!validateImageFormat(articleData.article_image)) {
    errors.image = 'Image must be in PNG or JPG format';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
