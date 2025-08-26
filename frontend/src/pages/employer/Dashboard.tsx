'use client';

import React, { useState } from 'react';
import { 
  FiHome,
  FiUsers,
  FiBriefcase,
  FiSettings,
  FiSearch,
  FiBell,
  FiMenu,
  FiX,
  FiPlus,
  FiEye,
  FiDownload,
  FiCheck,
  FiXCircle,
  FiTrendingUp,
  FiUserCheck,
  FiCalendar,
  FiLogOut,
  FiMapPin,
  FiClock,
  FiFilter
} from 'react-icons/fi';
import layoutStyles from '../../components/employer/dashboard/Layout.module.css';
import cardStyles from '../../components/employer/dashboard/Cards.module.css';
import sidebarStyles from '../../components/employer/dashboard/Sidebar.module.css';
import buttonStyles from '../../components/employer/dashboard/Buttons.module.css';
import { WelcomeSection } from '../../components/employer/dashboard/WelcomeSection';
import { 
  mockEmployer, 
  mockJobPostings, 
  mockApplicants, 
  statsData 
} from '../../data/mockData';
import { 
  JobPosting, 
  Applicant
} from '../../types/dashboard';
import { ApplicantDetailsModal } from '../../components/employer/dashboard/ApplicantDetailsModal';

// Tab types
type TabType = 'dashboard' | 'applicants' | 'jobs' | 'settings';

const EmployerDashboard: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [applicantFilters, setApplicantFilters] = useState<{ status: string }>({ status: '' });
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Enhanced applicants using centralized mock data
  const enhancedApplicants: Applicant[] = mockApplicants.map(applicant => ({
    ...applicant,
    matchPercentage: applicant.match,
    matchScore: applicant.match,
    location: 'Metro Manila',
    salary: '₱80,000',
    expectedSalary: '₱70,000 - ₱90,000',
    jobTitle: applicant.position
  })).sort((a, b) => b.matchPercentage - a.matchPercentage);

  // Enhanced job postings mock data
  const enhancedJobPostings: JobPosting[] = mockJobPostings.map((job, index) => ({
    ...job,
    views: [450, 320, 280, 390][index % 4],
    id: index + 1,
    title: job.title,
    location: job.location,
    salary: job.salary,
    postedDate: job.posted,
    applicantCount: job.applicants,
    status: job.status,
    requirements: job.requirements || [],
    type: job.type || 'Full-time',
    remote: job.remote || false,
    department: job.department || 'Engineering',
    posted: job.posted,
    applicants: job.applicants
  }));

  // Real-time stats with enhanced calculations
  const realTimeStats = {
    totalApplicants: enhancedApplicants.length,
    pendingReviews: enhancedApplicants.filter(app => app.status === 'pending').length,
    openPositions: enhancedJobPostings.filter(job => job.status === 'active').length,
    hiredThisMonth: enhancedApplicants.filter(app => app.status === 'hired').length,
    totalApplicationsThisWeek: enhancedApplicants.filter(app => 
      new Date(app.appliedDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length
  };

  // Recent applicants (oldest pending first)
  const recentApplicants = enhancedApplicants
    .filter(applicant => applicant.status === 'pending')
    .sort((a, b) => new Date(a.appliedDate).getTime() - new Date(b.appliedDate).getTime())
    .slice(0, 4);

  // Handle tab change
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  // Handle search
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleApplicantFilter = (status: string) => {
    setApplicantFilters({ status });
  };

  const handleLogout = () => {
    console.log('Logging out...');
    // Add logout logic here - clear tokens, redirect to login, etc.
    window.location.href = '/auth';
  };

  const handleApplicantFilterChange = (filterType: string, value: string) => {
    setApplicantFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // State for managing applicant updates
  const [applicantStatuses, setApplicantStatuses] = useState<Record<number, string>>({});

  // Handle applicant actions
  const handleApproveApplicant = (applicantId: number) => {
    setApplicantStatuses(prev => ({
      ...prev,
      [applicantId]: 'interview'
    }));
    
    // Show success notification (you can replace with toast notification)
    alert('Applicant moved to interview stage!');
  };

  const handleRejectApplicant = (applicantId: number) => {
    setApplicantStatuses(prev => ({
      ...prev,
      [applicantId]: 'rejected'
    }));
    
    // Show notification
    alert('Applicant has been rejected.');
  };

  const handleViewResume = (applicantId: number) => {
    const applicant = enhancedApplicants.find(app => app.id === applicantId);
    if (applicant?.resumeUrl) {
      // In a real app, this would open the resume in a new tab or modal
      window.open(applicant.resumeUrl, '_blank');
    } else {
      alert('Resume not available for this applicant.');
    }
  };

  const handleViewApplicantDetails = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedApplicant(null);
  };

  const handleDownloadResume = (applicantId: number) => {
    const applicant = enhancedApplicants.find(app => app.id === applicantId);
    if (applicant?.resumeUrl) {
      // Create a temporary link to trigger download
      const link = document.createElement('a');
      link.href = applicant.resumeUrl;
      link.download = `${applicant.name.replace(/\s+/g, '_')}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('Resume not available for download.');
    }
  };

  const handleCreateJob = () => {
    // In a real app, this would navigate to job creation form
    alert('Job creation form would open here. This feature will be implemented in the next phase.');
  };

  // Filter applicants based on search and filters
  const filteredApplicants = enhancedApplicants.map(applicant => ({
    ...applicant,
    status: applicantStatuses[applicant.id] || applicant.status
  })).filter(applicant => {
    const matchesSearch = applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         applicant.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !applicantFilters.status || applicant.status === applicantFilters.status;
    return matchesSearch && matchesStatus;
  });

  // Filter jobs based on status
  const filteredJobs = enhancedJobPostings.filter(job => {
    if (filterStatus === 'all') return true;
    return job.status === filterStatus;
  });

  // Get status badge style
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'hired': return { backgroundColor: '#10b981', color: 'white' };
      case 'interview': return { backgroundColor: '#3b82f6', color: 'white' };
      case 'pending': return { backgroundColor: '#f59e0b', color: 'white' };
      case 'rejected': return { backgroundColor: '#ef4444', color: 'white' };
      default: return { backgroundColor: '#6b7280', color: 'white' };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Navigation items
  const navigationItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: FiHome, badge: null },
    { id: 'applicants' as TabType, label: 'Applicants', icon: FiUsers, badge: realTimeStats.pendingReviews },
    { id: 'jobs' as TabType, label: 'Job Posts', icon: FiBriefcase, badge: realTimeStats.openPositions },
    { id: 'settings' as TabType, label: 'Settings', icon: FiSettings, badge: null }
  ];

  return (
    <div className={layoutStyles.dashboard}>
      {/* Sidebar */}
      <div className={`${sidebarStyles.sidebar} ${sidebarOpen ? sidebarStyles.open : ''}`}>
        <div className={sidebarStyles.sidebarHeader}>
          <div className={sidebarStyles.logo}>
            JobPortal
          </div>
        </div>
        
        <nav className={sidebarStyles.sidebarNav}>
          <a 
            href="#" 
            className={`${sidebarStyles.navItem} ${activeTab === 'dashboard' ? sidebarStyles.active : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('dashboard');
            }}
          >
            <FiHome className={sidebarStyles.navIcon} size={20} />
            Dashboard
          </a>
          <a 
            href="#" 
            className={`${sidebarStyles.navItem} ${activeTab === 'applicants' ? sidebarStyles.active : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('applicants');
            }}
          >
            <FiUsers className={sidebarStyles.navIcon} size={20} />
            Applicants
          </a>
          <a 
            href="#" 
            className={`${sidebarStyles.navItem} ${activeTab === 'jobs' ? sidebarStyles.active : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('jobs');
            }}
          >
            <FiBriefcase className={sidebarStyles.navIcon} size={20} />
            Job Posts
          </a>
          <a 
            href="#" 
            className={`${sidebarStyles.navItem} ${activeTab === 'settings' ? sidebarStyles.active : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('settings');
            }}
          >
            <FiSettings className={sidebarStyles.navIcon} size={20} />
            Settings
          </a>
        </nav>
        
        <div className={sidebarStyles.sidebarFooter}>
          <p className={sidebarStyles.footerText}> 2024 HireHub</p>
        </div>
      </div>

      <div 
        className={`${sidebarStyles.sidebarOverlay} ${sidebarOpen ? sidebarStyles.open : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className={layoutStyles.mainContent}>
        {/* Mobile Header */}
        <div className={layoutStyles.mobileHeaderContainer}>
          <div className={layoutStyles.mobileHeader}>
            <button 
              className={layoutStyles.menuButton}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <FiX /> : <FiMenu />}
            </button>
            <h1 className={layoutStyles.pageTitle}>Dashboard</h1>
            <div className={layoutStyles.headerRight}>
              <button className={layoutStyles.notificationButton}>
                <FiBell />
                <span className={layoutStyles.notificationBadge}>1</span>
              </button>
              <div className={layoutStyles.profileAvatar}>
                U
              </div>
            </div>
          </div>
        </div>

        <div className={layoutStyles.content}>
          {activeTab === 'dashboard' && (
            <>
              {/* Welcome Section */}
              <WelcomeSection 
                userName={mockEmployer.name}
                subtitle="Here's what's happening with your hiring process today"
              />

              {/* Enhanced Stats Grid */}
              <div className={layoutStyles.statsGrid}>
                <div className={cardStyles.statCard}>
                  <div className={`${cardStyles.statIcon} ${cardStyles.primary}`}>
                    <FiUsers size={28} />
                  </div>
                  <div className={cardStyles.statContent}>
                    <h3>{realTimeStats.totalApplicants}</h3>
                    <p>Total Applicants</p>
                    <div className={cardStyles.statTrend}>
                      <FiTrendingUp className={`${cardStyles.trendIcon} ${cardStyles.up}`} size={14} />
                      <span className={`${cardStyles.trendText} ${cardStyles.up}`}>+12% this month</span>
                    </div>
                  </div>
                </div>

                <div className={cardStyles.statCard}>
                  <div className={`${cardStyles.statIcon} ${cardStyles.success}`}>
                    <FiUserCheck size={28} />
                  </div>
                  <div className={cardStyles.statContent}>
                    <h3>{realTimeStats.pendingReviews}</h3>
                    <p>Pending Reviews</p>
                    <div className={cardStyles.statTrend}>
                      <FiTrendingUp className={`${cardStyles.trendIcon} ${cardStyles.up}`} size={14} />
                      <span className={`${cardStyles.trendText} ${cardStyles.up}`}>+5 new today</span>
                    </div>
                  </div>
                </div>

                <div className={cardStyles.statCard}>
                  <div className={`${cardStyles.statIcon} ${cardStyles.warning}`}>
                    <FiBriefcase size={28} />
                  </div>
                  <div className={cardStyles.statContent}>
                    <h3>{realTimeStats.openPositions}</h3>
                    <p>Open Positions</p>
                    <div className={cardStyles.statTrend}>
                      <FiTrendingUp className={`${cardStyles.trendIcon} ${cardStyles.up}`} size={14} />
                      <span className={`${cardStyles.trendText} ${cardStyles.up}`}>3 active</span>
                    </div>
                  </div>
                </div>

                <div className={cardStyles.statCard}>
                  <div className={`${cardStyles.statIcon} ${cardStyles.info}`}>
                    <FiCalendar size={28} />
                  </div>
                  <div className={cardStyles.statContent}>
                    <h3>{realTimeStats.hiredThisMonth}</h3>
                    <p>Interviews This Week</p>
                    <div className={cardStyles.statTrend}>
                      <FiTrendingUp className={`${cardStyles.trendIcon} ${cardStyles.up}`} size={14} />
                      <span className={`${cardStyles.trendText} ${cardStyles.up}`}>2 upcoming</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Section */}
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '600', 
                  color: '#1e293b',
                  margin: '0 0 1.5rem 0' 
                }}>
                  Quick Actions
                </h2>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '1rem'
                }}>
                  <div 
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      padding: '2rem 1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      minHeight: '120px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#6366f1';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onClick={handleCreateJob}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      color: '#6366f1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem'
                    }}>
                      <FiPlus size={32} />
                    </div>
                    <h4 style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '600', 
                      color: '#1e293b',
                      margin: '0'
                    }}>
                      Post Jobs
                    </h4>
                  </div>

                  <div 
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      padding: '2rem 1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      minHeight: '120px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#6366f1';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onClick={() => setActiveTab('jobs')}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      color: '#6366f1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem'
                    }}>
                      <FiEye size={32} />
                    </div>
                    <h4 style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '600', 
                      color: '#1e293b',
                      margin: '0'
                    }}>
                      View Job Posts
                    </h4>
                  </div>

                  <div 
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      padding: '2rem 1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      minHeight: '120px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#6366f1';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onClick={() => setActiveTab('applicants')}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      color: '#6366f1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem'
                    }}>
                      <FiBriefcase size={32} />
                    </div>
                    <h4 style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '600', 
                      color: '#1e293b',
                      margin: '0'
                    }}>
                      View Applications
                    </h4>
                  </div>

                  <div 
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      padding: '2rem 1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      minHeight: '120px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#6366f1';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onClick={() => setActiveTab('settings')}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      color: '#6366f1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem'
                    }}>
                      <FiSettings size={32} />
                    </div>
                    <h4 style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '600', 
                      color: '#1e293b',
                      margin: '0'
                    }}>
                      Edit Profile
                    </h4>
                  </div>
                </div>
              </div>

              {/* Recent Applicants Section */}
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '1.5rem' 
                }}>
                  <h2 style={{ 
                    fontSize: '1.5rem', 
                    fontWeight: '600', 
                    color: '#1e293b',
                    margin: 0 
                  }}>
                    Recent Applicants
                  </h2>
                  <button 
                    className={buttonStyles.viewAllButton}
                    onClick={() => setActiveTab('applicants')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#3b82f6',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      cursor: 'pointer',
                      padding: '0.5rem 0'
                    }}
                  >
                    View All
                  </button>
                </div>
                <div style={{ 
                  background: 'white',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden'
                }}>
                  {recentApplicants.map((applicant, index) => (
                    <div 
                      key={applicant.id} 
                      onClick={() => handleViewApplicantDetails(applicant)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '1rem 1.5rem',
                        borderBottom: index < recentApplicants.length - 1 ? '1px solid #f1f5f9' : 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          background: '#3b82f6',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1rem',
                          fontWeight: '600'
                        }}>
                          <FiUsers size={20} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ 
                            fontSize: '1rem', 
                            fontWeight: '600', 
                            color: '#1e293b',
                            margin: '0 0 0.25rem 0'
                          }}>
                            Applied to {applicant.position}
                          </h3>
                          <p style={{ 
                            fontSize: '0.875rem', 
                            color: '#64748b',
                            margin: '0'
                          }}>
                            {applicant.name}
                          </p>
                          <p style={{ 
                            fontSize: '0.75rem', 
                            color: '#94a3b8',
                            margin: '0.25rem 0 0 0'
                          }}>
                            {new Date(applicant.appliedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          backgroundColor: applicant.status === 'hired' ? '#dcfce7' : 
                                          applicant.status === 'interview' ? '#dbeafe' : 
                                          applicant.status === 'pending' ? '#fef3c7' : '#fee2e2',
                          color: applicant.status === 'hired' ? '#166534' : 
                                 applicant.status === 'interview' ? '#1e40af' : 
                                 applicant.status === 'pending' ? '#92400e' : '#991b1b'
                        }}>
                          {applicant.status === 'interview' ? 'Interview' : 
                           applicant.status === 'hired' ? 'Hired' : 
                           applicant.status === 'pending' ? 'Review' : applicant.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Job Posts Section */}
              <div className={cardStyles.sectionCard}>
                <div className={cardStyles.sectionHeader}>
                  <h3>
                    <FiBriefcase className={cardStyles.sectionIcon} />
                    Active Job Posts
                  </h3>
                  <button 
                    className={buttonStyles.createButton}
                    onClick={handleCreateJob}
                  >
                    <FiPlus />
                    Create Job
                  </button>
                </div>

                <div className={layoutStyles.jobPostsGrid}>
                  {enhancedJobPostings.map((job) => (
                    <div key={job.id} className={cardStyles.jobCard}>
                      <div className={cardStyles.jobHeader}>
                        <h4 className={cardStyles.jobTitle}>{job.title}</h4>
                        <div className={cardStyles.jobMeta}>
                          <span className={cardStyles.jobMetaItem}>
                            <FiBriefcase size={14} />
                            {job.type}
                          </span>
                          {job.remote && <span className={cardStyles.requirementTag}>Remote</span>}
                        </div>
                      </div>
                      
                      <div className={cardStyles.jobMeta}>
                        <p className={cardStyles.jobMetaItem}>
                          <FiMapPin size={14} />
                          {job.location}
                        </p>
                        <p className={cardStyles.jobSalary}>
                          ₱{job.salary}
                        </p>
                        <p className={cardStyles.jobMetaItem}>
                          <FiClock size={14} />
                          Posted {formatDate(job.postedDate)}
                        </p>
                      </div>

                      <div className={cardStyles.jobRequirements}>
                        {job.requirements.slice(0, 3).map((req, index) => (
                          <span key={index} className={cardStyles.requirementTag}>
                            {req}
                          </span>
                        ))}
                      </div>
                      
                      <div style={{ 
                        padding: '0.5rem 1rem',
                        background: 'rgba(59, 130, 246, 0.1)',
                        borderRadius: '12px',
                        color: '#3b82f6',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}>
                        {job.applicantCount} Applications
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'applicants' && (
            <div className={cardStyles.sectionCard}>
              <div className={cardStyles.sectionHeader}>
                <h2>
                  <FiUsers className={cardStyles.sectionIcon} />
                  All Applicants
                </h2>
                <div className={cardStyles.sectionActions}>
                  <select 
                    className={buttonStyles.filterSelect}
                    value={applicantFilters.status}
                    onChange={(e) => setApplicantFilters({...applicantFilters, status: e.target.value})}
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending Review</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="interviewed">Interviewed</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
              <div className={cardStyles.sectionContent}>
                <div className={layoutStyles.applicantGrid}>
                  {filteredApplicants.map((applicant) => (
                    <div 
                      key={applicant.id} 
                      className={cardStyles.applicantCard}
                      onClick={() => handleViewApplicantDetails(applicant)}
                    >
                      <div className={cardStyles.applicantHeader}>
                        <div className={cardStyles.applicantLeft}>
                          <div className={cardStyles.applicantAvatar}>
                            {applicant.name.charAt(0)}
                          </div>
                          <div className={cardStyles.applicantInfo}>
                            <h4 className={cardStyles.applicantName}>{applicant.name}</h4>
                            <p className={cardStyles.applicantPosition}>Applied for: {applicant.position}</p>
                            <p className={cardStyles.applicantMeta}>
                              Applied on {new Date(applicant.appliedDate).toLocaleDateString()} • {applicant.experience}
                            </p>
                          </div>
                        </div>
                        <div className={cardStyles.applicantRight}>
                          <div className={cardStyles.matchScore}>{applicant.match}%</div>
                          <div className={cardStyles.matchLabel}>Match Score</div>
                          <span className={`${cardStyles.applicantStatus} ${cardStyles[applicant.status.toLowerCase().replace(/\s+/g, '')]}`}>
                            {applicant.status}
                          </span>
                        </div>
                      </div>
                      <div className={cardStyles.skillsSection}>
                        <div className={cardStyles.skillsLabel}>Skills:</div>
                        <div className={cardStyles.skillsList}>
                          {applicant.skills.slice(0, 4).map((skill, index) => (
                            <span key={index} className={cardStyles.skillTag}>{skill}</span>
                          ))}
                        </div>
                      </div>
                      <div className={cardStyles.jobActions} onClick={(e) => e.stopPropagation()}>
                        <button 
                          className={cardStyles.jobAction}
                          onClick={() => handleViewResume(applicant.id)}
                          title="View Resume"
                        >
                          <FiEye />
                        </button>
                        <button 
                          className={cardStyles.jobAction}
                          onClick={() => handleDownloadResume(applicant.id)}
                          title="Download Resume"
                        >
                          <FiDownload />
                        </button>
                        <button 
                          className={buttonStyles.successButton}
                          onClick={() => handleApproveApplicant(applicant.id)}
                          title="Approve"
                        >
                          <FiCheck />
                        </button>
                        <button 
                          className={buttonStyles.dangerButton}
                          onClick={() => handleRejectApplicant(applicant.id)}
                          title="Reject"
                        >
                          <FiXCircle />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className={cardStyles.sectionCard}>
              <div className={cardStyles.sectionHeader}>
                <h2>
                  <FiBriefcase className={cardStyles.sectionIcon} />
                  All Job Posts
                </h2>
                <div className={cardStyles.sectionActions}>
                  <select 
                    className={buttonStyles.filterSelect}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Jobs</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="closed">Closed</option>
                  </select>
                  <button className={buttonStyles.primaryButton}>
                    <FiPlus size={16} />
                    Post New Job
                  </button>
                </div>
              </div>
              <div className={cardStyles.sectionContent}>
                <div className={layoutStyles.jobPostsGrid}>
                  {filteredJobs.map((job) => (
                    <div key={job.id} className={cardStyles.jobCard}>
                      <div className={cardStyles.jobHeader}>
                        <h3 className={cardStyles.jobTitle}>{job.title}</h3>
                        <span className={`${cardStyles.statusBadge} ${cardStyles[job.status]}`}>
                          {job.status}
                        </span>
                      </div>
                      <div className={cardStyles.jobMeta}>
                        <p className={cardStyles.jobMetaItem}>
                          <FiBriefcase size={14} />
                          {job.type} • {job.location}
                        </p>
                        <p className={cardStyles.jobSalary}>
                          ₱{job.salary}
                        </p>
                        <p className={cardStyles.jobMetaItem}>
                          <FiClock size={14} />
                          Posted {formatDate(job.postedDate)}
                        </p>
                      </div>
                      <div className={cardStyles.jobRequirements}>
                        {job.requirements.slice(0, 3).map((req, index) => (
                          <span key={index} className={cardStyles.requirementTag}>
                            {req}
                          </span>
                        ))}
                      </div>
                      <div className={cardStyles.jobStats}>
                        <div className={cardStyles.jobStat}>
                          <span className={cardStyles.statNumber}>{job.applicantCount}</span>
                          <span className={cardStyles.statLabel}>Applications</span>
                        </div>
                        <div className={cardStyles.jobStat}>
                          <span className={cardStyles.statNumber}>{job.views || Math.floor(Math.random() * 500) + 100}</span>
                          <span className={cardStyles.statLabel}>Views</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className={cardStyles.sectionCard}>
              <div className={cardStyles.sectionHeader}>
                <h2>
                  <FiSettings className={cardStyles.sectionIcon} />
                  Account Settings
                </h2>
              </div>
              <div className={cardStyles.sectionContent}>
                <div className={layoutStyles.settingsGrid}>
                  <div className={cardStyles.settingCard}>
                    <h3>Company Profile</h3>
                    <p>Update your company information and branding</p>
                    <button className={buttonStyles.secondaryButton}>Edit Profile</button>
                  </div>
                  <div className={cardStyles.settingCard}>
                    <h3>Notification Preferences</h3>
                    <p>Manage how you receive updates about applications</p>
                    <button className={buttonStyles.secondaryButton}>Configure</button>
                  </div>
                  <div className={cardStyles.settingCard}>
                    <h3>Billing & Subscription</h3>
                    <p>View your current plan and billing information</p>
                    <button className={buttonStyles.secondaryButton}>Manage Billing</button>
                  </div>
                  <div className={cardStyles.settingCard}>
                    <h3>Team Management</h3>
                    <p>Add or remove team members and set permissions</p>
                    <button className={buttonStyles.secondaryButton}>Manage Team</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Applicant Details Modal */}
      {selectedApplicant && (
        <ApplicantDetailsModal
          applicant={selectedApplicant}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onApprove={handleApproveApplicant}
          onReject={handleRejectApplicant}
          onViewResume={handleViewResume}
          onDownloadResume={handleDownloadResume}
        />
      )}
    </div>
  );
};

export default EmployerDashboard;
