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
  FiFilter
} from 'react-icons/fi';
import { HiCheckCircle } from 'react-icons/hi';
import './AdminDashboard.css';

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

interface Job {
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

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingEmployers, setPendingEmployers] = useState<PendingEmployer[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);

  useEffect(() => {
    // Check if admin is authenticated
    const storedAdmin = localStorage.getItem('adminUser');
    const adminToken = localStorage.getItem('adminToken');
    
    if (!storedAdmin || !adminToken) {
      navigate('/admin/auth');
      return;
    }

    setAdminUser(JSON.parse(storedAdmin));
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, employersRes, jobsRes] = await Promise.all([
        fetch('/api/admin/dashboard/stats'),
        fetch('/api/admin/employers/pending'),
        fetch('/api/admin/jobs?limit=10')
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      if (employersRes.ok) {
        const employersData = await employersRes.json();
        setPendingEmployers(employersData.employers);
      }

      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData.jobs);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmployerAction = async (employerId: string, action: 'approve' | 'reject', reason?: string) => {
    try {
      const response = await fetch(`/api/admin/employers/${employerId}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, reason }),
      });

      if (response.ok) {
        // Refresh pending employers list
        fetchDashboardData();
      }
    } catch (error) {
      console.error('Error updating employer status:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminToken');
    navigate('/admin/auth');
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="loading-spinner"></div>
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>PESO Admin</h2>
          <div className="admin-info">
            <p>{adminUser?.adminName}</p>
            <span className="admin-role">{adminUser?.role}</span>
          </div>
        </div>

        <nav className="admin-nav">
          <button
            className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FiTrendingUp />
            Overview
          </button>
          <button
            className={`nav-item ${activeTab === 'employers' ? 'active' : ''}`}
            onClick={() => setActiveTab('employers')}
          >
            <FiBriefcase />
            Employer Verification
          </button>
          <button
            className={`nav-item ${activeTab === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            <FiFileText />
            Job Management
          </button>
          <button
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <FiUsers />
            User Analytics
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
          <h1>Admin Dashboard</h1>
          <div className="admin-header-actions">
            <span className="last-updated">Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="admin-content">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon users">
                  <FiUsers />
                </div>
                <div className="stat-info">
                  <h3>{stats?.totalUsers || 0}</h3>
                  <p>Total Users</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon employers">
                  <FiBriefcase />
                </div>
                <div className="stat-info">
                  <h3>{stats?.totalEmployers || 0}</h3>
                  <p>Employers</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon jobs">
                  <FiFileText />
                </div>
                <div className="stat-info">
                  <h3>{stats?.totalJobs || 0}</h3>
                  <p>Job Postings</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon applications">
                  <HiCheckCircle />
                </div>
                <div className="stat-info">
                  <h3>{stats?.totalApplications || 0}</h3>
                  <p>Applications</p>
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
                  <FiTrendingUp />
                </div>
                <div className="stat-info">
                  <h3>{stats?.activeJobs || 0}</h3>
                  <p>Active Jobs</p>
                </div>
              </div>
            </div>

            <div className="dashboard-sections">
              <div className="section">
                <h3>Recent Activity</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <HiCheckCircle className="activity-icon" />
                    <div>
                      <p>{stats?.recentApplications || 0} new applications this week</p>
                      <span>Job applications</span>
                    </div>
                  </div>
                  <div className="activity-item">
                    <FiBriefcase className="activity-icon" />
                    <div>
                      <p>{stats?.pendingEmployers || 0} employers awaiting verification</p>
                      <span>Verification queue</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'employers' && (
          <div className="admin-content">
            <div className="section-header">
              <h2>Employer Verification</h2>
              <p>Review and approve employer registrations</p>
            </div>

            <div className="employers-list">
              {pendingEmployers.length === 0 ? (
                <div className="empty-state">
                  <HiCheckCircle />
                  <h3>No pending verifications</h3>
                  <p>All employer applications have been processed</p>
                </div>
              ) : (
                pendingEmployers.map((employer) => (
                  <div key={employer._id} className="employer-card">
                    <div className="employer-info">
                      <h4>{employer.userId.companyName}</h4>
                      <p>{employer.userId.email}</p>
                      <span className="registration-date">
                        Registered: {new Date(employer.userId.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="employer-documents">
                      {employer.businessPermitUrl && (
                        <a 
                          href={employer.businessPermitUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="document-link"
                        >
                          <FiEye /> Business Permit
                        </a>
                      )}
                      {employer.dtiRegistrationUrl && (
                        <a 
                          href={employer.dtiRegistrationUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="document-link"
                        >
                          <FiEye /> DTI Registration
                        </a>
                      )}
                    </div>

                    <div className="employer-actions">
                      <button
                        className="approve-btn"
                        onClick={() => handleEmployerAction(employer._id, 'approve')}
                      >
                        <FiCheck /> Approve
                      </button>
                      <button
                        className="reject-btn"
                        onClick={() => handleEmployerAction(employer._id, 'reject')}
                      >
                        <FiX /> Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="admin-content">
            <div className="section-header">
              <h2>Job Management</h2>
              <p>Monitor and manage job postings</p>
            </div>

            <div className="jobs-list">
              {jobs.map((job) => (
                <div key={job._id} className="job-card">
                  <div className="job-info">
                    <h4>{job.title}</h4>
                    <p>{job.employerUid?.companyName}</p>
                    <span className={`job-status ${job.status}`}>
                      {job.status}
                    </span>
                  </div>
                  <div className="job-meta">
                    <span>Posted: {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="admin-content">
            <div className="section-header">
              <h2>User Analytics</h2>
              <p>User registration and activity insights</p>
            </div>

            <div className="analytics-placeholder">
              <FiTrendingUp size={48} />
              <h3>Analytics Dashboard</h3>
              <p>Detailed user analytics and reports will be displayed here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
