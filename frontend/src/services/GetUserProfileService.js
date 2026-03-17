const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

class GetUserProfileService {
  static async getUserProfile(token, user_email) {
    try {
      const response = await fetch(`${API_BASE_URL}/report_user/get_user_profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
          user_email: user_email
        }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return { confirmation: 'backend error' };
    }
  }
}

export default GetUserProfileService;