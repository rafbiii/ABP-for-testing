import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const AddRatingService = {
  addRating: async (token, articleId, ratingValue) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/rating/add`,
        {
          token: token,
          article_id: articleId,
          rating_value: ratingValue
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error adding rating:', error);
      if (error.response) {
        return error.response.data;
      }
      return { confirmation: 'backend error' };
    }
  }
};

export default AddRatingService;
