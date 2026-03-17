import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const EditCommentService = {
  editComment: async (token, articleId, commentId, commentContent, parentCommentId = null) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/comment/edit/update`,
        {
          article_id: articleId,
          token: token,
          comment_id: commentId,
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
      console.error('Error editing comment:', error);
      if (error.response) {
        return error.response.data;
      }
      return { confirmation: 'backend error' };
    }
  }
};

export default EditCommentService;
