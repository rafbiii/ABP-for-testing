const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

/**
 * Get user details by user ID
 * @param {string} userId - The user ID to fetch details for
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response from the API
 */
export const getUserDetails = async (userEmail, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/get_details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token,
        user_email: userEmail
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    return {
      confirmation: 'backend error'
    };
  }
};

/**
 * Delete user by user ID
 * @param {string} userId - The user ID to delete
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response from the API
 */
export const deleteUser = async (userId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token,
        user_id: userId
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting user:', error);
    return {
      confirmation: 'backend error'
    };
  }
};

/**
 * Make user an admin
 * @param {string} userId - The user ID to promote to admin
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Response from the API
 */
export const makeAdmin = async (userId, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/make_admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token,
        user_id: userId
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error making user admin:', error);
    return {
      confirmation: 'backend error'
    };
  }
};

export default {
  getUserDetails,
  deleteUser,
  makeAdmin
};