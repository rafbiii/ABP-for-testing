import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Get article data for editing
export const getArticleForEdit = async (articleId, token) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/article/edit/get`, {
      token: token,
      article_id: articleId
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { confirmation: 'backend error' };
  }
};

// Update article
export const updateArticle = async (articleData, token) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/article/edit/update`, {
      token,
      article_id: articleData.article_id,
      article_title: articleData.article_title,
      article_preview: articleData.article_preview,
      article_content: articleData.article_content,
      article_tag: articleData.article_tag,
      article_image: articleData.article_image
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { confirmation: 'backend error' };
  }
};
