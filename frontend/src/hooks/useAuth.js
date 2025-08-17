import { useState, useEffect, useContext, createContext } from 'react';
import authService from '../services/authService';

// Create Auth Context
const AuthContext = createContext();

/**
 * Auth Provider Component
 * Wraps the app and provides authentication state
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Listen for authentication state changes
    const unsubscribe = authService.onAuthStateChange(async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        try {
          // Get user profile from backend
          const userData = await authService.getCurrentUser();
          if (userData) {
            setUser(userData.user);
            setProfile(userData.profile);
            setIsAuthenticated(true);
          } else {
            // Firebase user exists but no backend profile
            setUser(null);
            setProfile(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser(null);
          setProfile(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    profile,
    loading,
    isAuthenticated,
    setUser,
    setProfile,
    setIsAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use authentication
 * @returns {Object} Authentication state and methods
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { user, profile, loading, isAuthenticated, setUser, setProfile, setIsAuthenticated } = context;

  /**
   * Register new user
   * @param {Object} userData - Registration data
   * @returns {Promise<Object>} Registration result
   */
  const register = async (userData) => {
    try {
      const result = await authService.registerWithEmail(userData);
      
      if (result.success) {
        setUser(result.user);
        setProfile(result.profile);
        setIsAuthenticated(true);
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Login with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login result
   */
  const login = async (email, password) => {
    try {
      const result = await authService.loginWithEmail(email, password);
      
      if (result.success) {
        setUser(result.user);
        setProfile(result.profile);
        setIsAuthenticated(true);
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Login with Google
   * @param {string} role - User role
   * @returns {Promise<Object>} Login result
   */
  const loginWithGoogle = async (role = 'job_seeker') => {
    try {
      const result = await authService.loginWithGoogle(role);
      
      if (result.success) {
        setUser(result.user);
        setProfile(result.profile);
        setIsAuthenticated(true);
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if backend call fails
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
    }
  };

  /**
   * Reset password
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  const resetPassword = async (email) => {
    return await authService.resetPassword(email);
  };

  /**
   * Refresh user profile
   * @returns {Promise<void>}
   */
  const refreshProfile = async () => {
    try {
      const userData = await authService.getCurrentUser();
      if (userData) {
        setUser(userData.user);
        setProfile(userData.profile);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  return {
    // State
    user,
    profile,
    loading,
    isAuthenticated,
    
    // Methods
    register,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    refreshProfile,
    
    // Utility methods
    getIdToken: authService.getIdToken.bind(authService),
    isUserAuthenticated: authService.isUserAuthenticated.bind(authService)
  };
};

export default useAuth;
