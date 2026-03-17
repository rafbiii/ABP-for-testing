const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const ManageUserService = {
  /**
   * Fetch all users from the backend
   * @param {string} token - Authentication token
   * @returns {Promise<Object>} Response object containing confirmation and users data
   */
  getAllUsers: async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/get_all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
      
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }
};

export default ManageUserService;