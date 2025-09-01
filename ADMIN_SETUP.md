# PESO Admin Portal Setup Guide

## Overview
The PESO Job Portal now includes a comprehensive admin system with two levels of administrative access:

- **Super Admin**: Full system control, admin management, system settings
- **Regular Admin**: Employer verification, job management, user analytics

## Admin Portal Access

### Entry Points
- **Admin Portal**: `http://localhost:3000/admin/auth`
- **Admin Dashboard**: `http://localhost:3000/admin/dashboard` (Regular Admin)
- **Super Admin Dashboard**: `http://localhost:3000/superadmin/dashboard` (Super Admin)

### Default Admin Accounts
Run the admin user creation script to set up default accounts:

```bash
cd backend
node scripts/createAdminUsers.js
```

**Default Credentials:**
- **Super Admin**: `superadmin@peso.gov.ph` (any password in demo mode)
- **Regular Admin**: `admin@peso.gov.ph` (any password in demo mode)

## Admin Capabilities

### Regular Admin Features
- ✅ **Employer Verification**: Review and approve/reject employer registrations
- ✅ **Job Management**: Monitor job postings, update job status
- ✅ **User Analytics**: View user registration trends and statistics
- ✅ **Dashboard Overview**: System statistics and recent activity

### Super Admin Features (All Regular Admin + )
- ✅ **Admin Management**: Create, edit, and manage admin users
- ✅ **System Settings**: Configure system-wide settings and security
- ✅ **Advanced Analytics**: Comprehensive system analytics and reporting
- ✅ **System Reports**: Generate and download system reports
- ✅ **Full System Control**: Complete administrative oversight

## Backend Implementation

### New Routes
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/dashboard/stats` - Dashboard statistics
- `GET /api/admin/employers/pending` - Pending employer verifications
- `PUT /api/admin/employers/:id/verify` - Approve/reject employers
- `GET /api/admin/jobs` - Job management with filters
- `PUT /api/admin/jobs/:id/status` - Update job status
- `GET /api/admin/analytics/users` - User analytics
- `GET /api/admin/admins` - Admin user management (Super Admin only)
- `POST /api/admin/admins` - Create admin users (Super Admin only)

### Enhanced User Model
- Added `admin` and `superadmin` roles
- Admin-specific fields: `adminName`, `adminLevel`, `department`
- Role-based permissions system
- Enhanced authentication middleware

### Security Features
- Role-based access control (RBAC)
- Admin-specific middleware validation
- Super Admin privilege separation
- Secure admin authentication flow

## Frontend Implementation

### Components Created
- `AdminAuth.tsx` - Secure admin login interface
- `AdminDashboard.tsx` - Regular admin dashboard
- `SuperAdminDashboard.tsx` - Super admin dashboard with advanced features
- `adminService.ts` - Admin API service layer

### Admin Dashboard Features
- **Overview Tab**: System statistics and health metrics
- **Employer Verification**: Review pending employer applications
- **Job Management**: Monitor and manage job postings
- **User Analytics**: Registration trends and user insights

### Super Admin Dashboard Features
- **System Overview**: Comprehensive system statistics
- **Admin Management**: Create and manage admin users
- **System Settings**: Configure system parameters
- **Advanced Analytics**: Detailed system analytics

## Usage Instructions

1. **Start the Backend Server**:
   ```bash
   cd backend
   npm start
   ```

2. **Create Admin Users**:
   ```bash
   cd backend
   node scripts/createAdminUsers.js
   ```

3. **Start the Frontend**:
   ```bash
   cd frontend
   npm start
   ```

4. **Access Admin Portal**:
   - Navigate to `http://localhost:3000`
   - Click "Admin Portal" button at the bottom
   - Login with admin credentials
   - Choose appropriate admin level

## Admin Workflow

### Employer Verification Process
1. Admin logs into admin portal
2. Navigate to "Employer Verification" tab
3. Review pending employer applications
4. View submitted documents (Business Permit, DTI Registration)
5. Approve or reject applications with optional reason
6. Employers receive updated status and can access dashboard

### Job Management Process
1. Navigate to "Job Management" tab
2. View all job postings with filters
3. Monitor job status (active, inactive, expired)
4. Update job status with admin notes
5. Track job posting trends and employer activity

### System Administration (Super Admin)
1. Access super admin dashboard
2. Manage admin users (create, edit, deactivate)
3. Configure system settings and security
4. Generate comprehensive system reports
5. Monitor system health and performance

## Security Considerations

- Admin authentication is separate from regular user auth
- Role-based permissions prevent privilege escalation
- Super Admin actions are logged and audited
- Secure document access for employer verification
- Session management for admin users

## Future Enhancements

- Two-factor authentication for admin users
- Detailed audit logging and activity tracking
- Advanced analytics with charts and graphs
- Email notifications for admin actions
- Bulk operations for user management
- System backup and restore functionality
