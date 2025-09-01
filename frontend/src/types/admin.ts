export interface DashboardStats {
  totalUsers: number;
  totalEmployers: number;
  totalJobSeekers: number;
  totalJobs: number;
  totalApplications: number;
  pendingEmployers: number;
  activeJobs: number;
  recentApplications: number;
}

export interface AdminUser {
  _id?: string;
  uid: string;
  email: string;
  role: 'admin' | 'superadmin';
  adminName: string;
  adminLevel?: string;
  department?: string;
  permissions?: string[];
  isActive?: boolean;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface PendingEmployer {
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

export interface Job {
  _id: string;
  title: string;
  company: string;
  status: string;
  createdAt: string;
  employerUid: {
    companyName: string;
    email: string;
  };
}

export interface AdminFormData {
  email: string;
  password: string;
  adminLevel?: string;
}

export type AdminTab = 'overview' | 'employers' | 'jobs' | 'users' | 'admins' | 'settings' | 'analytics';
