const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const EditRatingService = {
  editRating: async (token, articleId, ratingId, ratingValue) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rating/edit/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          token: token,
          article_id: articleId,
          rating_id: ratingId,
          rating_value: ratingValue
        })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error editing rating:', error);
      throw error;
    }
  }
};

export default EditRatingService;