import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const AddCommentService = {
  addComment: async (token, articleId, commentContent, parentCommentId = "") => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/comment/add`,
        {
          token: token,
          article_id: articleId,
          parent_comment_id: parentCommentId,
          comment_content: commentContent
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
      console.error('Error adding comment:', error);
      if (error.response) {
        return error.response.data;
      }
      return { confirmation: 'backend error' };
    }
  }
};

export default AddCommentService;
