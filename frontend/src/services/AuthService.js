import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,  // Increased timeout
  withCredentials: false,  // Add this line
});

api.interceptors.request.use((config) => config);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('⚠️ Unauthorized access');
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      const data = response.data;
      const conf = (data.confirmation || "").trim().toLowerCase();

      if (conf === "email doesn't exist") {
        throw new Error("Email doesn't exist");
      }

      if (conf === "password incorrect") {
        throw new Error("Password is incorrect");
      }

      if (conf === "backend error") {
        throw new Error("Server is busy, try again later");
      }

      if (conf === "login successful" && data.token) {
        localStorage.setItem('token', data.token);
        return { token: data.token };
      }

      throw new Error("Unknown login response");

    } catch (error) {
      // Handle custom errors
      if (error.message === "Email doesn't exist" || 
          error.message === "Password is incorrect" ||
          error.message === "Server is busy, try again later" ||
          error.message === "Unknown login response") {
        throw error;
      }

      // Handle network errors
      if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
        throw new Error("Backend unavailable");
      }

      // Check response data
      const conf = error.response?.data?.confirmation;
      if (conf === "email doesn't exist") {
        throw new Error("Email doesn't exist");
      }
      if (conf === "password incorrect") {
        throw new Error("Password is incorrect");
      }
      if (conf === "backend error") {
        throw new Error("Server is busy, try again later");
      }

      throw new Error("Login failed");
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post('/auth/registration', {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        fullname: userData.fullname,
      });

      const data = response.data;
      
      console.log('🔍 Confirmation value:', data.confirmation);

      if (data.confirmation === 'register successful') {
        return { success: true };
      }

      if (data.confirmation === 'email already registered') {
        throw new Error('Email already exists');
      }

      if (data.confirmation === 'backend error') {
        throw new Error('Server is busy, try again later');
      }

      throw new Error('Unknown registration response');
      
    } catch (error) {
      // Handle custom errors
      if (error.message === 'Email already exists' || 
          error.message === 'Server is busy, try again later' ||
          error.message === 'Unknown registration response') {
        throw error;
      }

      // Handle network errors
      if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
        throw new Error('Backend unavailable');
      }

      // Check response data
      const conf = error.response?.data?.confirmation;
      if (conf === 'email already registered') {
        throw new Error('Email already exists');
      }
      if (conf === 'backend error') {
        throw new Error('Server is busy, try again later');
      }

      throw new Error('Server is busy, try again later');
    }
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  isAuthenticated: () => !!localStorage.getItem('token'),

  getBackendStatus: () => ({
    apiUrl: API_BASE_URL,
  }),
};

export default api;
