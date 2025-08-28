import { auth } from '../config/firebase';

const API_BASE_URL = 'http://localhost:3001/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  user?: any;
  message?: string;
  error?: string;
}

class ApiService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await auth.currentUser?.getIdToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }
    
    return data;
  }

  // Auth endpoints
  async createUserProfile(userData: {
    uid: string;
    email: string;
    role: 'jobseeker' | 'employer';
    firstName?: string;
    lastName?: string;
    middleName?: string;
    companyName?: string;
    emailVerified?: boolean;
  }): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/create-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });
    
    return this.handleResponse(response);
  }

  async checkEmailExists(email: string, role?: string): Promise<ApiResponse> {
    const url = new URL(`${API_BASE_URL}/auth/check-email/${encodeURIComponent(email)}`);
    if (role) {
      url.searchParams.append('role', role);
    }
    
    const response = await fetch(url.toString());
    const data = await response.json();
    
    // For checkEmailExists, we want to return the data even for 404 responses
    // since 404 just means the email doesn't exist
    return {
      success: response.ok,
      data: data,
      error: !response.ok ? data.error : undefined
    };
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email/${token}`);
    return this.handleResponse(response);
  }

  async resendVerification(email: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email })
    });
    
    return this.handleResponse(response);
  }

  async verifyToken(): Promise<ApiResponse> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers
    });
    
    return this.handleResponse(response);
  }

  async getCurrentUser(): Promise<ApiResponse> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers
    });
    
    return this.handleResponse(response);
  }

  // User endpoints
  async getUserProfile(): Promise<ApiResponse> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      headers
    });
    
    return this.handleResponse(response);
  }

  async updateUserProfile(userData: any): Promise<ApiResponse> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(userData)
    });
    
    return this.handleResponse(response);
  }

  async checkUserExists(uid: string): Promise<ApiResponse> {
    const response = await fetch(`${API_BASE_URL}/users/check/${uid}`);
    return this.handleResponse(response);
  }

  async getUserByUid(uid: string): Promise<ApiResponse> {
    const headers = await this.getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/users/${uid}`, {
      headers
    });
    
    return this.handleResponse(response);
  }

  // Utility methods
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/`);
      return response.ok;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }
}

export const apiService = new ApiService();
export default apiService;
