import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminUser, DashboardStats, PendingEmployer, Job, AdminTab } from '../../types/admin';
import { 
  AdminSidebar, 
  AdminHeader, 
  OverviewTab, 
  EmployersTab, 
  JobsTab, 
  UsersTab,
  AdminManagementTab,
  SystemSettingsTab,
  AnalyticsTab
} from '../../components/admin';
import adminService from '../../services/adminService';
import './SuperAdminDashboard.css';



const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('analytics');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingEmployers, setPendingEmployers] = useState<PendingEmployer[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    // Check if super admin is authenticated
    const storedAdmin = localStorage.getItem('adminUser');
    const adminToken = localStorage.getItem('adminToken');
    
    if (!storedAdmin || !adminToken) {
      navigate('/admin/auth');
      return;
    }

    const admin = JSON.parse(storedAdmin);
    if (admin.role !== 'superadmin') {
      navigate('/admin/dashboard');
      return;
    }

    setAdminUser(admin);
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const [statsData, employersData, jobsData, adminsData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getPendingEmployers(),
        adminService.getJobs({ limit: 10 }),
        adminService.getAdminUsers()
      ]);

      setStats(statsData);
      setPendingEmployers(employersData);
      setJobs(jobsData.jobs || []);
      setAdminUsers(adminsData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployerAction = async (employerId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      await adminService.verifyEmployer(employerId, action, reason);
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating employer status:', error);
    }
  };

  const handleCreateAdmin = async (adminData: any) => {
    try {
      await adminService.createAdmin(adminData);
      fetchDashboardData();
    } catch (error) {
      console.error('Error creating admin:', error);
    }
  };

  const handleEditAdmin = async (adminId: string, adminData: any) => {
    // Implementation for editing admin
    console.log('Edit admin:', adminId, adminData);
  };

  const handleDeleteAdmin = async (adminId: string) => {
    if (window.confirm('Are you sure you want to delete this admin?')) {
      try {
        // Implementation for deleting admin
        console.log('Delete admin:', adminId);
        fetchDashboardData();
      } catch (error) {
        console.error('Error deleting admin:', error);
      }
    }
  };

  const handleLogout = () => {
    adminService.logout();
    navigate('/admin/auth');
  };

  const generateSystemReport = () => {
    // Mock system report generation
    const reportData = {
      timestamp: new Date().toISOString(),
      stats,
      admins: adminUsers.length,
      systemHealth: 'Good'
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `peso-system-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading super admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="superadmin-dashboard">
      <AdminSidebar 
        adminUser={adminUser!}
        activeTab={activeTab as AdminTab}
        onTabChange={(tab: AdminTab) => setActiveTab(tab)}
        onLogout={handleLogout}
      />

      <div className="admin-main">
        <AdminHeader 
          title="Super Admin Dashboard"
          subtitle="Comprehensive system management and oversight"
          actions={
            <button className="report-btn" onClick={generateSystemReport}>
              Generate Report
            </button>
          }
        />

        {activeTab === 'analytics' && (
          <AnalyticsTab />
        )}

        {activeTab === 'overview' && (
          <OverviewTab 
            stats={stats}
          />
        )}

        {activeTab === 'employers' && (
          <EmployersTab 
            pendingEmployers={pendingEmployers}
            onEmployerAction={handleEmployerAction}
          />
        )}

        {activeTab === 'jobs' && (
          <JobsTab 
            jobs={jobs}
          />
        )}

        {activeTab === 'users' && (
          <UsersTab />
        )}

        {activeTab === 'admins' && (
          <AdminManagementTab 
            adminUsers={adminUsers}
            onCreateAdmin={handleCreateAdmin}
            onEditAdmin={handleEditAdmin}
            onDeleteAdmin={handleDeleteAdmin}
          />
        )}

        {activeTab === 'settings' && (
          <SystemSettingsTab />
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
