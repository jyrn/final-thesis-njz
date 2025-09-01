interface AdminUser {
  uid: string;
  email: string;
  role: 'admin' | 'superadmin';
  adminName: string;
  adminLevel: string;
  department: string;
  permissions: string[];
}

interface DashboardStats {
  totalUsers: number;
  totalEmployers: number;
  totalJobSeekers: number;
  totalJobs: number;
  totalApplications: number;
  pendingEmployers: number;
  activeJobs: number;
  recentApplications: number;
}

interface PendingEmployer {
  _id: string;
  userId: {
    email: string;
    companyName: string;
    createdAt: string;
  };
  businessPermitUrl?: string;
  dtiRegistrationUrl?: string;
  accountStatus: string;
}

class AdminService {
  private baseUrl = 'http://localhost:3001/api/admin';

  async login(email: string, password: string, adminLevel: string): Promise<AdminUser> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, adminLevel }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Login failed');
    }

    return data.admin;
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch(`${this.baseUrl}/dashboard/stats`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch dashboard stats');
    }

    return data.stats;
  }

  async getPendingEmployers(): Promise<PendingEmployer[]> {
    const response = await fetch(`${this.baseUrl}/employers/pending`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch pending employers');
    }

    return data.employers;
  }

  async verifyEmployer(employerId: string, action: 'approve' | 'reject', reason?: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/employers/${employerId}/verify`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, reason }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to update employer status');
    }
  }

  async getJobs(params?: { page?: number; limit?: number; status?: string; search?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const response = await fetch(`${this.baseUrl}/jobs?${queryParams}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch jobs');
    }

    return data;
  }

  async updateJobStatus(jobId: string, status: string, reason?: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/jobs/${jobId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, reason }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to update job status');
    }
  }

  async getAnalytics(period: string = '30') {
    const response = await fetch(`${this.baseUrl}/analytics/users?period=${period}`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch analytics');
    }

    return data.analytics;
  }

  // Super Admin only methods
  async getAdminUsers(): Promise<AdminUser[]> {
    const response = await fetch(`${this.baseUrl}/admins`);
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to fetch admin users');
    }

    return data.admins;
  }

  async createAdmin(adminData: {
    email: string;
    adminName: string;
    department: string;
    adminLevel: 'admin' | 'superadmin';
  }): Promise<AdminUser> {
    const response = await fetch(`${this.baseUrl}/admins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to create admin user');
    }

    return data.admin;
  }

  // Authentication helpers
  isAuthenticated(): boolean {
    return !!(localStorage.getItem('adminUser') && localStorage.getItem('adminToken'));
  }

  getCurrentAdmin(): AdminUser | null {
    const adminData = localStorage.getItem('adminUser');
    return adminData ? JSON.parse(adminData) : null;
  }

  logout(): void {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
  }
}

export default new AdminService();
