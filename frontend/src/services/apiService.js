import api from '../lib/api';

/**
 * API Service for authentication endpoints
 * Provides a clean interface for making API calls to the backend
 */
class ApiService {
  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} API response
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Login user
   * @param {Object} loginData - Login credentials
   * @returns {Promise<Object>} API response
   */
  async login(loginData) {
    try {
      const response = await api.post('/auth/login', loginData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get current user profile
   * @returns {Promise<Object>} API response
   */
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Logout user
   * @returns {Promise<Object>} API response
   */
  async logout() {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create user profile (legacy endpoint)
   * @param {Object} profileData - Profile data
   * @returns {Promise<Object>} API response
   */
  async createUserProfile(profileData) {
    try {
      const response = await api.post('/firebase-auth/create-profile', profileData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify Firebase token (legacy endpoint)
   * @param {Object} tokenData - Token data
   * @returns {Promise<Object>} API response
   */
  async verifyFirebaseToken(tokenData) {
    try {
      const response = await api.post('/firebase-auth/verify', tokenData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors consistently
   * @param {Error} error - API error
   * @returns {Error} Formatted error
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'An error occurred';
      const status = error.response.status;
      const code = error.response.data?.code;
      
      const apiError = new Error(message);
      apiError.status = status;
      apiError.code = code;
      apiError.data = error.response.data;
      
      return apiError;
    } else if (error.request) {
      // Network error
      return new Error('Network error. Please check your connection.');
    } else {
      // Other error
      return new Error(error.message || 'An unexpected error occurred');
    }
  }

  /**
   * Set authorization header for API requests
   * @param {string} token - Firebase ID token
   */
  setAuthToken(token) {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }

  /**
   * Clear authorization header
   */
  clearAuthToken() {
    delete api.defaults.headers.common['Authorization'];
  }
}

// Create and export singleton instance
const apiService = new ApiService();
export default apiService;
