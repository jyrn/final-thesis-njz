import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUsers, 
  FiBriefcase, 
  FiFileText, 
  FiTrendingUp, 
  FiClock, 
  FiAlertCircle,
  FiLogOut,
  FiEye,
  FiCheck,
  FiX,
  FiSearch,
  FiFilter,
  FiSettings,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiDownload
} from 'react-icons/fi';
import { HiCheckCircle, HiShieldCheck, HiDatabase } from 'react-icons/hi';
import './SuperAdminDashboard.css';

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

interface AdminUser {
  _id: string;
  uid: string;
  email: string;
  role: string;
  adminName: string;
  department: string;
  isActive: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface SystemMetrics {
  serverUptime: string;
  databaseSize: string;
  activeConnections: number;
  memoryUsage: string;
}

const SuperAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({
    email: '',
    adminName: '',
    department: '',
    adminLevel: 'admin' as 'admin' | 'superadmin'
  });

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
      const [statsRes, adminsRes] = await Promise.all([
        fetch('/api/admin/dashboard/stats'),
        fetch('/api/admin/admins')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      if (adminsRes.ok) {
        const adminsData = await adminsRes.json();
        setAdmins(adminsData.admins);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAdminForm),
      });

      if (response.ok) {
        setShowCreateAdmin(false);
        setNewAdminForm({
          email: '',
          adminName: '',
          department: '',
          adminLevel: 'admin'
        });
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error creating admin:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    navigate('/admin/auth');
  };

  const generateSystemReport = () => {
    // Mock system report generation
    const reportData = {
      timestamp: new Date().toISOString(),
      stats,
      admins: admins.length,
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
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>PESO Super Admin</h2>
          <div className="admin-info">
            <p>{adminUser?.adminName}</p>
            <span className="superadmin-role">{adminUser?.role}</span>
          </div>
        </div>

        <nav className="admin-nav">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FiTrendingUp />
            System Overview
          </button>
          <button
            className={`nav-item ${activeTab === 'admins' ? 'active' : ''}`}
            onClick={() => setActiveTab('admins')}
          >
            <HiShieldCheck />
            Admin Management
          </button>
          <button
            className={`nav-item ${activeTab === 'employers' ? 'active' : ''}`}
            onClick={() => setActiveTab('employers')}
          >
            <FiBriefcase />
            Employer Verification
          </button>
          <button
            className={`nav-item ${activeTab === 'system' ? 'active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            <FiSettings />
            System Settings
          </button>
          <button
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <HiDatabase />
            Advanced Analytics
          </button>
        </nav>

        <div className="admin-sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut />
            Logout
          </button>
        </div>
      </div>

      <div className="admin-main">
        <div className="admin-header">
          <h1>Super Admin Dashboard</h1>
          <div className="admin-header-actions">
            <button className="report-btn" onClick={generateSystemReport}>
              <FiDownload />
              Generate Report
            </button>
            <span className="last-updated">Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="admin-content">
            <div className="stats-grid">
              <div className="stat-card system">
                <div className="stat-icon system-icon">
                  <HiDatabase />
                </div>
                <div className="stat-info">
                  <h3>{stats?.totalUsers || 0}</h3>
                  <p>Total System Users</p>
                </div>
              </div>

              <div className="stat-card admins">
                <div className="stat-icon admins-icon">
                  <HiShieldCheck />
                </div>
                <div className="stat-info">
                  <h3>{admins.length}</h3>
                  <p>Admin Users</p>
                </div>
              </div>

              <div className="stat-card employers">
                <div className="stat-icon employers">
                  <FiBriefcase />
                </div>
                <div className="stat-info">
                  <h3>{stats?.totalEmployers || 0}</h3>
                  <p>Registered Employers</p>
                </div>
              </div>

              <div className="stat-card jobs">
                <div className="stat-icon jobs">
                  <FiFileText />
                </div>
                <div className="stat-info">
                  <h3>{stats?.totalJobs || 0}</h3>
                  <p>Total Job Postings</p>
                </div>
              </div>

              <div className="stat-card pending">
                <div className="stat-icon pending-icon">
                  <FiClock />
                </div>
                <div className="stat-info">
                  <h3>{stats?.pendingEmployers || 0}</h3>
                  <p>Pending Verifications</p>
                </div>
              </div>

              <div className="stat-card active">
                <div className="stat-icon active-icon">
                  <HiCheckCircle />
                </div>
                <div className="stat-info">
                  <h3>{stats?.activeJobs || 0}</h3>
                  <p>Active Job Listings</p>
                </div>
              </div>
            </div>

            <div className="system-health">
              <h3>System Health</h3>
              <div className="health-metrics">
                <div className="metric">
                  <span className="metric-label">Server Status</span>
                  <span className="metric-value healthy">Online</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Database</span>
                  <span className="metric-value healthy">Connected</span>
                </div>
                <div className="metric">
                  <span className="metric-label">API Response</span>
                  <span className="metric-value healthy">Normal</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Error Rate</span>
                  <span className="metric-value healthy">0.1%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'admins' && (
          <div className="admin-content">
            <div className="section-header">
              <h2>Admin User Management</h2>
              <button 
                className="create-admin-btn"
                onClick={() => setShowCreateAdmin(true)}
              >
                <FiPlus />
                Create Admin
              </button>
            </div>

            {showCreateAdmin && (
              <div className="create-admin-modal">
                <div className="modal-content">
                  <h3>Create New Admin User</h3>
                  <form onSubmit={handleCreateAdmin}>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        type="email"
                        value={newAdminForm.email}
                        onChange={(e) => setNewAdminForm({...newAdminForm, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Admin Name</label>
                      <input
                        type="text"
                        value={newAdminForm.adminName}
                        onChange={(e) => setNewAdminForm({...newAdminForm, adminName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Department</label>
                      <input
                        type="text"
                        value={newAdminForm.department}
                        onChange={(e) => setNewAdminForm({...newAdminForm, department: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Admin Level</label>
                      <select
                        value={newAdminForm.adminLevel}
                        onChange={(e) => setNewAdminForm({...newAdminForm, adminLevel: e.target.value as 'admin' | 'superadmin'})}
                      >
                        <option value="admin">Admin</option>
                        <option value="superadmin">Super Admin</option>
                      </select>
                    </div>
                    <div className="modal-actions">
                      <button type="button" onClick={() => setShowCreateAdmin(false)}>
                        Cancel
                      </button>
                      <button type="submit">Create Admin</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="admins-list">
              {admins.map((admin) => (
                <div key={admin._id} className="admin-card">
                  <div className="admin-info">
                    <h4>{admin.adminName}</h4>
                    <p>{admin.email}</p>
                    <span className="department">{admin.department}</span>
                  </div>
                  <div className="admin-meta">
                    <span className={`role-badge ${admin.role}`}>
                      {admin.role}
                    </span>
                    <span className={`status ${admin.isActive ? 'active' : 'inactive'}`}>
                      {admin.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="admin-actions">
                    <button className="edit-btn">
                      <FiEdit2 />
                    </button>
                    <button className="delete-btn">
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="admin-content">
            <div className="section-header">
              <h2>System Configuration</h2>
              <p>Manage system-wide settings and configurations</p>
            </div>

            <div className="system-settings">
              <div className="setting-group">
                <h4>Security Settings</h4>
                <div className="setting-item">
                  <span>Two-Factor Authentication</span>
                  <button className="toggle-btn active">Enabled</button>
                </div>
                <div className="setting-item">
                  <span>Session Timeout (minutes)</span>
                  <input type="number" value="30" />
                </div>
              </div>

              <div className="setting-group">
                <h4>Email Configuration</h4>
                <div className="setting-item">
                  <span>SMTP Server</span>
                  <input type="text" value="smtp.gmail.com" />
                </div>
                <div className="setting-item">
                  <span>Email Notifications</span>
                  <button className="toggle-btn active">Enabled</button>
                </div>
              </div>

              <div className="setting-group">
                <h4>System Maintenance</h4>
                <div className="setting-item">
                  <span>Maintenance Mode</span>
                  <button className="toggle-btn">Disabled</button>
                </div>
                <div className="setting-item">
                  <span>Backup Frequency</span>
                  <select>
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="admin-content">
            <div className="section-header">
              <h2>Advanced Analytics</h2>
              <p>Comprehensive system analytics and insights</p>
            </div>

            <div className="analytics-dashboard">
              <div className="analytics-card">
                <h4>User Growth Trends</h4>
                <div className="chart-placeholder">
                  <FiTrendingUp size={48} />
                  <p>User registration trends over time</p>
                </div>
              </div>

              <div className="analytics-card">
                <h4>Job Market Analysis</h4>
                <div className="chart-placeholder">
                  <FiBriefcase size={48} />
                  <p>Job posting and application analytics</p>
                </div>
              </div>

              <div className="analytics-card">
                <h4>System Performance</h4>
                <div className="chart-placeholder">
                  <HiDatabase size={48} />
                  <p>Server performance and usage metrics</p>
                </div>
              </div>

              <div className="analytics-card">
                <h4>Geographic Distribution</h4>
                <div className="chart-placeholder">
                  <FiUsers size={48} />
                  <p>User distribution across regions</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
