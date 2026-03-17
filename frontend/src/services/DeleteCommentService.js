import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const DeleteCommentService = {
  deleteComment: async (token, commentId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/comment/delete`,
        {
          token: token,
          comment_id: commentId
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
      console.error('Error deleting comment:', error);
      if (error.response) {
        return error.response.data;
      }
      return { confirmation: 'backend error' };
    }
  }
};

export default DeleteCommentService;
