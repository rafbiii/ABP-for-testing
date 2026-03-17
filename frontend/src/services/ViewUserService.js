const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const getAllUsers = async (token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/get_all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    throw error;
  }
};