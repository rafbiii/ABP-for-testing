const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class ReportArticleService {
  static async reportArticle(token, article_id, description) {
    try {
      const response = await fetch(`${API_BASE_URL}/report_article/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          article_id: article_id,
          description: description
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error reporting article:', error);
      return { confirmation: 'backend error' };
    }
  }
}

export default ReportArticleService;