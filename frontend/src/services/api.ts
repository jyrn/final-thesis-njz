import { auth } from '../config/firebase';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No authenticated user');
    }

    const idToken = await user.getIdToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    };
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return { success: true, data };
    } catch (error) {
      console.error('API Error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Firebase Auth API calls
  async verifyToken(): Promise<ApiResponse> {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'No authenticated user' };
    }

    const idToken = await user.getIdToken();
    return this.makeRequest('/firebase-auth/verify', {
      method: 'POST',
      body: JSON.stringify({ idToken })
    });
  }

  async getUserProfile(): Promise<ApiResponse> {
    return this.makeRequest('/firebase-auth/me');
  }

  async updateUserRole(role: string): Promise<ApiResponse> {
    return this.makeRequest('/firebase-auth/update-role', {
      method: 'PUT',
      body: JSON.stringify({ role })
    });
  }

  // Job-related API calls
  async getJobs(): Promise<ApiResponse> {
    return this.makeRequest('/jobs');
  }

  async getJob(jobId: string): Promise<ApiResponse> {
    return this.makeRequest(`/jobs/${jobId}`);
  }

  async createJob(jobData: any): Promise<ApiResponse> {
    return this.makeRequest('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData)
    });
  }

  async applyForJob(jobId: string, applicationData: any): Promise<ApiResponse> {
    return this.makeRequest(`/jobs/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify(applicationData)
    });
  }

  async getUserApplications(): Promise<ApiResponse> {
    return this.makeRequest('/jobs/my-applications');
  }

  async getEmployerListings(): Promise<ApiResponse> {
    return this.makeRequest('/jobs/my-listings');
  }

  async updateJob(jobId: string, jobData: any): Promise<ApiResponse> {
    return this.makeRequest(`/jobs/${jobId}`, {
      method: 'PUT',
      body: JSON.stringify(jobData)
    });
  }

  async deleteJob(jobId: string): Promise<ApiResponse> {
    return this.makeRequest(`/jobs/${jobId}`, {
      method: 'DELETE'
    });
  }

  // Resume upload
  async uploadResume(file: File): Promise<ApiResponse> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user');
      }

      const idToken = await user.getIdToken();
      const formData = new FormData();
      formData.append('resume', file);

      const response = await fetch(`${API_BASE_URL}/resume/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      return { success: true, data };
    } catch (error) {
      console.error('Upload Error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      };
    }
  }
}

export const apiService = new ApiService();
export default apiService; 