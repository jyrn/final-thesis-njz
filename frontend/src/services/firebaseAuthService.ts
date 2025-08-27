import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification, 
  sendPasswordResetEmail, 
  onAuthStateChanged, 
  User, 
  GoogleAuthProvider, 
  signInWithPopup,
  reload,
  fetchSignInMethodsForEmail,
  updateProfile
} from 'firebase/auth';
import { auth } from '../config/firebase';

// API URL for backend integration
const API_BASE_URL = 'http://localhost:3001/api';

export interface AuthResponse {
  success: boolean;
  user?: User | null;
  error?: string;
  message?: string;
}

export interface UserData {
  uid: string;
  email: string;
  role: 'jobseeker' | 'employer';
  firstName?: string;
  lastName?: string;
  middleName?: string;
  companyName?: string;
  emailVerified: boolean;
}

// Helper functions for database interaction
const checkUserExists = async (uid: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/check/${uid}`);
    const data = await response.json();
    return data.exists;
  } catch (error) {
    console.error('Check user error:', error);
    return false;
  }
};

const saveUserToDatabase = async (userData: Partial<UserData>): Promise<void> => {
  try {
    const token = await auth.currentUser?.getIdToken();
    
    const response = await fetch(`${API_BASE_URL}/auth/create-profile`, { // Corrected endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save user data to database');
    }
  } catch (error) {
    console.error('Save user error:', error);
    // We don't throw here to prevent blocking the registration process
  }
};

const getUserFromDatabase = async (uid: string): Promise<UserData | null> => {
  try {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to get user profile');
    }
    
    const data = await response.json();
    return data.user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
};

const updateUserInDatabase = async (uid: string, userData: Partial<UserData>): Promise<void> => {
  try {
    const token = await auth.currentUser?.getIdToken();
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update user profile');
    }
  } catch (error) {
    console.error('Update user error:', error);
    throw error;
  }
};

const firebaseAuthService = {
  // Register a new user with email and password
  async registerWithEmailPassword(
    email: string, 
    password: string, 
    userData: Partial<UserData>
  ): Promise<AuthResponse> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;
      
      if (userData.firstName && userData.lastName) {
        await updateProfile(user, {
          displayName: `${userData.firstName} ${userData.middleName || ''} ${userData.lastName}`.trim()
        });
      } else if (userData.companyName) {
        await updateProfile(user, {
          displayName: userData.companyName
        });
      }
      
      await sendEmailVerification(user);
      
      await saveUserToDatabase({
        uid: user.uid,
        email: user.email || email,
        emailVerified: user.emailVerified,
        ...userData
      });
      
      return {
        success: true,
        user,
        message: 'Registration successful! Please verify your email.'
      };
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message || 'Failed to register user'
      };
    }
  },
  
  // Sign in with email and password
  async signInWithEmailPassword(email: string, password: string): Promise<AuthResponse> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;
      
      await getUserFromDatabase(user.uid);
      
      return {
        success: true,
        user,
        message: 'Sign in successful!'
      };
    } catch (error: any) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign in'
      };
    }
  },
  
  // Check what sign-in methods exist for an email
  async checkSignInMethods(email: string): Promise<{ success: boolean; methods: string[]; error?: string }> {
    try {
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return {
        success: true,
        methods
      };
    } catch (error: any) {
      console.error('Check sign-in methods error:', error);
      return {
        success: false,
        methods: [],
        error: error.message || 'Failed to check sign-in methods'
      };
    }
  },

  // Sign in with Google
  async signInWithGoogle(role: 'jobseeker' | 'employer'): Promise<AuthResponse> {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const { user } = userCredential;
      
      const existingUser = await checkUserExists(user.uid);
      
      if (!existingUser) {
        await saveUserToDatabase({
          uid: user.uid,
          email: user.email || '',
          role,
          emailVerified: user.emailVerified,
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(-1)[0] || '',
          companyName: role === 'employer' ? user.displayName || '' : undefined
        });
      }
      
      return {
        success: true,
        user,
        message: 'Google sign in successful!'
      };
    } catch (error: any) {
      console.error('Google sign in error:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign in with Google'
      };
    }
  },
  
  // Sign out
  async signOut(): Promise<AuthResponse> {
    try {
      await signOut(auth);
      return {
        success: true,
        message: 'Sign out successful!'
      };
    } catch (error: any) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: error.message || 'Failed to sign out'
      };
    }
  },
  
  // Send password reset email
  async sendPasswordResetEmail(email: string): Promise<AuthResponse> {
    try {
      console.log('Firebase auth service: Sending password reset email to:', email);
      
      // Try without action code settings first to see if that's the issue
      await sendPasswordResetEmail(auth, email);
      
      console.log('Firebase auth service: Password reset email sent successfully');
      return {
        success: true,
        message: 'Password reset email sent!'
      };
    } catch (error: any) {
      console.error('Firebase auth service - Password reset error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Handle specific Firebase errors
      let errorMessage = 'Failed to send password reset email';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later.';
      } else if (error.code === 'auth/missing-email') {
        errorMessage = 'Email address is required.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },
  
  // Resend verification email
  async resendVerificationEmail(): Promise<AuthResponse> {
    try {
      const user = auth.currentUser;
      
      if (!user) {
        return {
          success: false,
          error: 'No authenticated user found'
        };
      }
      
      await sendEmailVerification(user);
      return {
        success: true,
        message: 'Verification email sent!'
      };
    } catch (error: any) {
      console.error('Verification email error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send verification email'
      };
    }
  },

  // Send email verification (alias for resendVerificationEmail for compatibility)
  async sendEmailVerification(email?: string): Promise<AuthResponse> {
    return this.resendVerificationEmail();
  },

  // Confirm password reset
  async confirmPasswordReset(code: string, newPassword: string): Promise<AuthResponse> {
    try {
      const { confirmPasswordReset } = await import('firebase/auth');
      await confirmPasswordReset(auth, code, newPassword);
      return {
        success: true,
        message: 'Password reset successfully!'
      };
    } catch (error: any) {
      console.error('Password reset confirmation error:', error);
      return {
        success: false,
        error: error.message || 'Failed to reset password'
      };
    }
  },
  
  // Verify email with token (placeholder)
  async verifyEmail(token: string): Promise<AuthResponse> {
    return {
      success: true,
      message: 'Email verified successfully (client-side placeholder)'
    };
  },
  
  // Get current user
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  // Add the helper functions to the exported object
  updateUserInDatabase,
  getUserFromDatabase,

  reloadUser: async (): Promise<void> => {
    try {
      if (auth.currentUser) {
        await reload(auth.currentUser);
      }
    } catch (error) {
      console.error('Reload user error:', error);
      throw error;
    }
  }
};

export default firebaseAuthService;