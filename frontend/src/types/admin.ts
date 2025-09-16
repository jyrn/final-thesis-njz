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

export interface EmployerDocument {
  _id: string;
  employerId: string;
  employerUid: string;
  documentType: 'business_permit' | 'dti_registration' | 'bir_certificate' | 'sec_certificate' | 'mayor_permit' | 'barangay_clearance' | 'other';
  documentName: string;
  documentUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'requires_resubmission';
  verifiedAt?: string;
  verifiedBy?: string;
  rejectionReason?: string;
  adminNotes?: string;
  isRequired: boolean;
  expiryDate?: string;
  documentNumber?: string;
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
  documents?: EmployerDocument[];
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

export type AdminTab = 'overview' | 'analytics' | 'employers' | 'jobs' | 'users' | 'admins' | 'settings';
