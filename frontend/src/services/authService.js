import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import api from '../lib/api';

/**
 * Authentication Service
 * Handles Firebase authentication and backend integration
 */
class AuthService {
  constructor() {
    this.currentUser = null;
    this.isAuthenticated = false;
    this.userProfile = null;
    
    // Listen for auth state changes
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.isAuthenticated = !!user;
    });
  }

  /**
   * Register new user with email and password
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration result
   */
  async registerWithEmail(userData) {
    try {
      const { email, password, fullName, role, additionalData } = userData;
      
      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Update Firebase profile with display name
      await updateProfile(firebaseUser, {
        displayName: fullName
      });
      
      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();
      
      // Wait a moment for Firebase auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Register with backend
      const response = await api.post('/auth/register', {
        idToken,
        fullName,
        role,
        additionalData
      });
      
      if (response.data.success) {
        this.userProfile = response.data.data;
        return {
          success: true,
          message: 'Registration successful',
          user: response.data.data.user,
          profile: response.data.data.profile
        };
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('An account with this email already exists');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address');
      }
      
      // Handle backend errors
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error(error.message || 'Registration failed');
    }
  }

  /**
   * Login user with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Login result
   */
  async loginWithEmail(email, password) {
    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();
      
      // Login with backend
      const response = await api.post('/auth/login', {
        idToken
      });
      
      if (response.data.success) {
        this.userProfile = response.data.data;
        return {
          success: true,
          message: 'Login successful',
          user: response.data.data.user,
          profile: response.data.data.profile
        };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific Firebase errors
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Incorrect password');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address');
      } else if (error.code === 'auth/too-many-requests') {
        throw new Error('Too many failed attempts. Please try again later');
      }
      
      // Handle backend errors
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      throw new Error(error.message || 'Login failed');
    }
  }

  /**
   * Login with Google
   * @param {string} role - User role (job_seeker or employer)
   * @returns {Promise<Object>} Login result
   */
  async loginWithGoogle(role = 'job_seeker') {
    try {
      // Sign in with Google
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      // Get Firebase ID token
      const idToken = await firebaseUser.getIdToken();
      
      // Try to login first (existing user)
      try {
        const loginResponse = await api.post('/auth/login', {
          idToken
        });
        
        if (loginResponse.data.success) {
          this.userProfile = loginResponse.data.data;
          return {
            success: true,
            message: 'Login successful',
            user: loginResponse.data.data.user,
            profile: loginResponse.data.data.profile,
            isNewUser: false
          };
        }
      } catch (loginError) {
        // If login fails, try to register (new user)
        if (loginError.response?.data?.code === 'USER_NOT_REGISTERED') {
          const registerResponse = await api.post('/auth/register', {
            idToken,
            fullName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
            role,
            additionalData: {
              photoURL: firebaseUser.photoURL
            }
          });
          
          if (registerResponse.data.success) {
            this.userProfile = registerResponse.data.data;
            return {
              success: true,
              message: 'Registration successful',
              user: registerResponse.data.data.user,
              profile: registerResponse.data.data.profile,
              isNewUser: true
            };
          }
        }
        throw loginError;
      }
      
    } catch (error) {
      console.error('Google login error:', error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error('Login cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup blocked. Please allow popups for this site');
      }
      
      throw new Error(error.message || 'Google login failed');
    }
  }

  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile
   */
  async getCurrentUser() {
    try {
      if (!auth.currentUser) {
        return null;
      }
      
      const idToken = await auth.currentUser.getIdToken();
      const response = await api.get('/auth/me', {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      if (response.data.success) {
        this.userProfile = response.data.data;
        return response.data.data;
      }
      
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  async logout() {
    try {
      // Notify backend about logout (optional)
      if (auth.currentUser) {
        try {
          const idToken = await auth.currentUser.getIdToken();
          await api.post('/auth/logout', {}, {
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
          });
        } catch (error) {
          console.warn('Backend logout failed:', error);
        }
      }
      
      // Sign out from Firebase
      await signOut(auth);
      
      // Clear local state
      this.currentUser = null;
      this.isAuthenticated = false;
      this.userProfile = null;
      
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Logout failed');
    }
  }

  /**
   * Send password reset email
   * @param {string} email - User email
   * @returns {Promise<void>}
   */
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      
      if (error.code === 'auth/user-not-found') {
        throw new Error('No account found with this email');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Please enter a valid email address');
      }
      
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isUserAuthenticated() {
    return this.isAuthenticated && !!auth.currentUser;
  }

  /**
   * Get Firebase ID token
   * @returns {Promise<string|null>}
   */
  async getIdToken() {
    try {
      if (!auth.currentUser) {
        return null;
      }
      return await auth.currentUser.getIdToken();
    } catch (error) {
      console.error('Get ID token error:', error);
      return null;
    }
  }

  /**
   * Listen for authentication state changes
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  }
}

// Create and export singleton instance
const authService = new AuthService();
export default authService;
