import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const DetailArticleService = {
  /**
   * Fetch article details by ID
   * @param {string} token - User authentication token
   * @param {string} articleId - Article ID to fetch
   * @returns {Promise<Object>} Article details or error response
   */
  viewArticle: async (token, articleId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/article/view`, {
        token: token,
        article_id: articleId
      });

      return response.data;
    } catch (error) {
      if (error.response) {
        // Server responded with error
        return error.response.data;
      } else if (error.request) {
        // Request made but no response
        return {
          confirmation: "backend error",
          message: "No response from server"
        };
      } else {
        // Error in request setup
        return {
          confirmation: "backend error",
          message: error.message
        };
      }
    }
  }
};

export default DetailArticleService;
