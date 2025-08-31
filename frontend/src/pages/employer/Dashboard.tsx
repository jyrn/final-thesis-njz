'use client';

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
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
import { JobsTab } from '../../components/employer/dashboard/JobsTab';
import { ApplicantsTab } from '../../components/employer/dashboard/ApplicantsTab';
import { OverviewTab } from '../../components/employer/dashboard/OverviewTab';
import { SettingsTab } from '../../components/employer/dashboard/SettingsTab';
import { WelcomeSection } from '../../components/employer/dashboard/WelcomeSection';
// Removed mock data imports - using real backend data only
import { 
  JobPosting, 
  Applicant
} from '../../types/dashboard';
import { jobApiService } from '../../services/jobApiService';
import { Job } from '../../types/Job';
import { ApplicantDetailsModal } from '../../components/employer/dashboard/ApplicantDetailsModal';
import { JobDetailsModal } from '../../components/employer/dashboard/JobDetailsModal';
import { CompanyProfileModal } from '../../components/employer/dashboard/CompanyProfileModal';
import { NotificationPreferencesModal } from '../../components/employer/dashboard/NotificationPreferencesModal';
import { TeamManagementModal } from '../../components/employer/dashboard/TeamManagementModal';
import { DocumentsModal } from '../../components/employer/dashboard/DocumentsModal';

// Modal data types
interface CompanyProfileData {
  companyName: string;
  industry: string;
  website: string;
  description: string;
  address: string;
  phone: string;
  email: string;
}

interface NotificationPreferences {
  email: {
    newApplications: boolean;
    applicationUpdates: boolean;
    interviewReminders: boolean;
    weeklyReports: boolean;
  };
  push: {
    newApplications: boolean;
    urgentUpdates: boolean;
    systemAlerts: boolean;
  };
  sms: {
    urgentOnly: boolean;
    interviewReminders: boolean;
  };
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'recruiter' | 'viewer';
  status: 'active' | 'pending' | 'inactive';
  joinDate: string;
}

interface TeamData {
  members: TeamMember[];
}

// Tab types
type TabType = 'overview' | 'applicants' | 'jobs' | 'settings';

const EmployerDashboard: React.FC = () => {
  // State management
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [applicantFilters, setApplicantFilters] = useState<{ status: string; sortBy: string; jobId: string }>({ status: '', sortBy: 'newest', jobId: '' });
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Settings modal states
  const [isCompanyProfileModalOpen, setIsCompanyProfileModalOpen] = useState(false);
  const [isNotificationPreferencesModalOpen, setIsNotificationPreferencesModalOpen] = useState(false);
  const [isTeamManagementModalOpen, setIsTeamManagementModalOpen] = useState(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [isJobDetailsModalOpen, setIsJobDetailsModalOpen] = useState(false);
  const [applicantStatuses, setApplicantStatuses] = useState<Record<number, string>>({});

  // Initialize Firebase auth state listener
  useEffect(() => {
    const { auth } = require('../../config/firebase');
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', !!user);
      setCurrentUser(user);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // Load jobs from backend when auth is ready
  useEffect(() => {
    if (!isAuthReady || !currentUser) {
      console.log('Auth not ready or no user:', { isAuthReady, hasUser: !!currentUser });
      return;
    }

    const loadJobs = async () => {
      try {
        setIsLoadingJobs(true);
        const response = await jobApiService.getEmployerJobs();
        
        // Convert backend jobs to JobPosting format
        const convertedJobs: JobPosting[] = response.jobs.map((job: any) => ({
          id: job._id || job.id,
          title: job.title,
          location: job.location,
          type: job.type,
          applicants: job.applicantCount || 0,
          posted: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently',
          status: job.status,
          salary: job.salary || `₱${job.salaryMin?.toLocaleString()} - ₱${job.salaryMax?.toLocaleString()}`,
          views: job.views || 0,
          description: job.description,
          requirements: job.requirements || [],
          responsibilities: job.responsibilities || [],
          benefits: job.benefits || [],
          urgency: 'medium',
          matchQuality: 85,
          department: job.department || 'General',
          postedDate: job.createdAt || new Date().toISOString(),
          remote: job.workplaceType === 'Remote' || job.remote
        }));
        
        setJobPostings(convertedJobs);
      } catch (error) {
        console.error('Error loading jobs:', error);
        // Set empty array instead of mock data
        setJobPostings([]);
      } finally {
        setIsLoadingJobs(false);
      }
    };

    loadJobs();
  }, [isAuthReady, currentUser]);


  // State for real applications from backend
  const [applications, setApplications] = useState<Applicant[]>([]);
  const [isLoadingApplications, setIsLoadingApplications] = useState(true);

  // Load applications from backend when auth is ready
  useEffect(() => {
    if (!isAuthReady || !currentUser) {
      console.log('Auth not ready for applications:', { isAuthReady, hasUser: !!currentUser });
      return;
    }

    const loadApplications = async () => {
      try {
        setIsLoadingApplications(true);
        
        const token = await currentUser.getIdToken();
        
        const response = await fetch('http://localhost:3001/api/applications/employer', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Applications API response status:', response.status);
        console.log('Applications API response headers:', response.headers);

        if (response.ok) {
          const data = await response.json();
          console.log('Applications data received:', data);
          console.log('Number of applications:', data.data?.length || data.applications?.length || 0);
          
          // If no applications, show empty state instead of mock data
          if (!data.data || data.data.length === 0) {
            console.log('No applications found, setting empty array');
            setApplications([]);
            return;
          }
          
          // Convert backend applications to Applicant format
          const applicationsArray = data.data || data.applications || [];
          const convertedApplications: Applicant[] = applicationsArray.map((app: any) => ({
            id: app._id,
            name: app.applicant?.name || app.resumeData?.personalInfo?.name || 'Unknown Applicant',
            position: app.jobTitle || 'Unknown Position',
            email: app.applicant?.email || app.resumeData?.personalInfo?.email || '',
            phone: app.applicant?.phone || app.resumeData?.personalInfo?.phone || '',
            location: app.applicant?.address || app.resumeData?.personalInfo?.address || 'Metro Manila',
            salary: app.jobSalary || '₱80,000',
            expectedSalary: app.resumeData?.expectedSalary || '₱70,000 - ₱90,000',
            experience: app.resumeData?.experience?.[0]?.duration || app.resumeData?.workExperience?.[0]?.duration || '2+ years',
            skills: app.resumeData?.skills || [],
            education: app.resumeData?.education?.[0]?.degree || app.resumeData?.education?.[0]?.institution || '',
            appliedDate: app.appliedDate,
            status: app.status,
            match: 85, // Default match score
            matchPercentage: 85,
            matchScore: 85,
            jobTitle: app.jobTitle || 'Unknown Position',
            jobId: app.jobId,
            resumeUrl: app.resumeData ? '#' : undefined,
            coverLetter: app.coverLetter || '',
            notes: app.notes || ''
          }));
          
          setApplications(convertedApplications);
        } else {
          console.error('Failed to load applications:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('Error response body:', errorText);
          // Show empty state - no mock data fallback
          setApplications([]);
        }
      } catch (error) {
        console.error('Error loading applications:', error);
        // Show empty state - no mock data fallback
        setApplications([]);
      } finally {
        setIsLoadingApplications(false);
      }
    };

    loadApplications();
  }, [isAuthReady, currentUser]);

  // Use real applications data only
  const enhancedApplicants: Applicant[] = applications.sort((a, b) => b.matchPercentage - a.matchPercentage);


  // Filter and sort applicants based on search and filters
  const filteredApplicants = enhancedApplicants
    .map(applicant => ({
      ...applicant,
      status: (applicantStatuses[applicant.id] || applicant.status || '').toLowerCase()
    }))
    .filter(applicant => {
      // Check search query match
      const matchesSearch = !searchQuery || 
        applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (applicant.position && applicant.position.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Check status match - if no status filter or status is empty, show all
      const matchesStatus = !applicantFilters.status || 
        applicantFilters.status === '' || 
        applicant.status === applicantFilters.status.toLowerCase();
      
      // Check job ID match - if no job filter or jobId is empty, show all
      const jobMatch = !applicantFilters.jobId || 
        applicantFilters.jobId === '' ||
        applicant.jobId === applicantFilters.jobId ||
        (applicant.jobId || '').toString() === applicantFilters.jobId.toString();
      
      return matchesSearch && matchesStatus && jobMatch;
  }).sort((a, b) => {
    const dateA = new Date(a.appliedDate).getTime();
    const dateB = new Date(b.appliedDate).getTime();
    
    switch (applicantFilters.sortBy) {
      case 'oldest':
        return dateA - dateB;
      case 'newest':
        return dateB - dateA;
      case 'match-high':
        return b.match - a.match;
      case 'match-low':
        return a.match - b.match;
      default:
        return dateB - dateA; // Default to newest first
    }
  });

  // Enhanced job postings from state
  const enhancedJobPostings: JobPosting[] = jobPostings.map((job, index) => ({
    ...job,
    views: job.views || [450, 320, 280, 390][index % 4],
    id: job.id || index + 1,
    title: job.title,
    location: job.location,
    salary: job.salary,
    postedDate: job.postedDate || job.posted,
    applicantCount: job.applicants,
    status: job.status,
    requirements: job.requirements || [],
    type: job.type || 'Full-time',
    remote: job.remote || false,
    department: job.department || 'Engineering',
    posted: job.posted,
    applicants: job.applicants
  }));

  // Reset job filter if selected job no longer exists
  useEffect(() => {
    if (applicantFilters.jobId) {
      const jobExists = enhancedJobPostings.some(job => job.id.toString() === applicantFilters.jobId);
      if (!jobExists) {
        setApplicantFilters(prev => ({ ...prev, jobId: '' }));
      }
    }
  }, [enhancedJobPostings, applicantFilters.jobId]);

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

  // Handle filter changes for job status
  const handleFilterChange = (filterType: string, value: string) => {
    if (filterType === 'status') {
      setFilterStatus(value);
    } else if (filterType === 'search') {
      setSearchQuery(value);
    }
  };

  // Handle editing a job
  const handleEditJob = (job: JobPosting) => {
    setSelectedJob(job);
    // In a real implementation, you would open an edit form modal here
    console.log('Edit job:', job);
  };

  const handleApplicantFilter = (status: string) => {
    setApplicantFilters(prev => ({ ...prev, status }));
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

  // Handle applicant actions with backend integration
  const handleApproveApplicant = async (applicantId: number) => {
    try {
      if (!currentUser) {
        alert('Please log in again to update application status');
        return;
      }

      const token = await currentUser.getIdToken();
      
      const response = await fetch(`http://localhost:3001/api/applications/${applicantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'interview' })
      });

      if (response.ok) {
        setApplicantStatuses(prev => ({
          ...prev,
          [applicantId]: 'interview'
        }));
        
        // Update local applications state
        setApplications(prev => prev.map(app => 
          app.id === applicantId ? { ...app, status: 'interview' } : app
        ));
        
        alert('Applicant moved to interview stage!');
      } else {
        throw new Error('Failed to update application status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Failed to update applicant status. Please try again.');
    }
  };

  const handleRejectApplicant = async (applicantId: number) => {
    try {
      if (!currentUser) {
        alert('Please log in again to update application status');
        return;
      }

      const token = await currentUser.getIdToken();
      
      const response = await fetch(`http://localhost:3001/api/applications/${applicantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'rejected' })
      });

      if (response.ok) {
        setApplicantStatuses(prev => ({
          ...prev,
          [applicantId]: 'rejected'
        }));
        
        // Update local applications state
        setApplications(prev => prev.map(app => 
          app.id === applicantId ? { ...app, status: 'rejected' } : app
        ));
        
        alert('Applicant has been rejected.');
      } else {
        throw new Error('Failed to update application status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Failed to update applicant status. Please try again.');
    }
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
    const applicant = enhancedApplicants.find(a => a.id === applicantId);
    if (applicant && applicant.resumeUrl) {
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


  const handleCreateJob = async (jobData: Partial<JobPosting>) => {
    try {
      setIsLoadingJobs(true);
      
      // Convert JobPosting data to backend format
      const backendJobData = {
        title: jobData.title || '',
        description: jobData.description || '',
        location: jobData.location || '',
        salary: jobData.salary,
        type: jobData.type || 'Full-time',
        level: 'Mid-level', // Default level since it's not in JobPosting interface
        department: jobData.department || 'General',
        workplaceType: jobData.remote ? 'Remote' : 'On-site',
        remote: jobData.remote || false,
        requirements: jobData.requirements || [],
        responsibilities: jobData.responsibilities || [],
        benefits: jobData.benefits || [],
        status: jobData.status || 'active'
      };

      const createdJob = await jobApiService.createJob(backendJobData);
      
      // Convert created job to JobPosting format and add to state
      const newJobPosting: JobPosting = {
        id: createdJob._id || createdJob.id || Math.random().toString(),
        title: createdJob.title || jobData.title || '',
        location: createdJob.location || jobData.location || '',
        type: createdJob.type || jobData.type || 'Full-time',
        applicants: 0,
        posted: 'Just now',
        status: createdJob.status || 'active',
        salary: createdJob.salary || jobData.salary || '',
        views: 0,
        description: createdJob.description || jobData.description || '',
        requirements: createdJob.requirements || jobData.requirements || [],
        responsibilities: createdJob.responsibilities || jobData.responsibilities || [],
        benefits: createdJob.benefits || jobData.benefits || [],
        urgency: 'medium',
        matchQuality: 85,
        department: createdJob.department || jobData.department || 'General',
        postedDate: createdJob.createdAt || createdJob.postedDate || new Date().toISOString(),
        remote: createdJob.workplaceType === 'Remote' || createdJob.remote || jobData.remote || false
      };
      
      setJobPostings(prev => [newJobPosting, ...prev]);
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Failed to create job. Please try again.');
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const [showEditConfirm, setShowEditConfirm] = useState(false);
  const [pendingJobUpdate, setPendingJobUpdate] = useState<Partial<JobPosting> | null>(null);

  const handleUpdateJob = async (jobData: Partial<JobPosting>) => {
    if (!jobData.id) return;
    
    try {
      setIsLoadingJobs(true);
      
      // Convert JobPosting data to backend format
      const backendJobData = {
        title: jobData.title,
        description: jobData.description,
        location: jobData.location,
        salary: jobData.salary,
        type: jobData.type,
        level: 'Mid-level', // Default level
        department: jobData.department,
        workplaceType: jobData.remote ? 'Remote' : 'On-site',
        remote: jobData.remote,
        requirements: jobData.requirements,
        responsibilities: jobData.responsibilities,
        benefits: jobData.benefits,
        status: jobData.status
      };

      await jobApiService.updateJob(jobData.id.toString(), backendJobData);
      
      // Update local state
      setJobPostings(prev => prev.map(job => {
        if (job.id === jobData.id) {
          return {
            ...job,
            ...jobData,
            requirements: jobData.requirements || [],
            responsibilities: jobData.responsibilities || [],
            benefits: jobData.benefits || []
          };
        }
        return job;
      }));
    } catch (error) {
      console.error('Error updating job:', error);
      alert('Failed to update job. Please try again.');
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const confirmUpdateJob = () => {
    if (!pendingJobUpdate?.id) return;
    
    setJobPostings(prev => prev.map(job => {
      if (job.id === pendingJobUpdate.id) {
        // Ensure arrays are properly handled and not lost during update
        return {
          ...job,
          ...pendingJobUpdate,
          requirements: pendingJobUpdate.requirements || [],
          responsibilities: pendingJobUpdate.responsibilities || [],
          benefits: pendingJobUpdate.benefits || []
        };
      }
      return job;
    }));
    
    setShowEditConfirm(false);
    setPendingJobUpdate(null);
  };

  const cancelUpdateJob = () => {
    setShowEditConfirm(false);
    setPendingJobUpdate(null);
  };

  const handleDeleteJob = async (jobId: number, hiredApplicantIds?: number[]) => {
    try {
      setIsLoadingJobs(true);
      
      await jobApiService.deleteJob(jobId.toString());
      
      // Update local state
      setJobPostings(prev => prev.filter(job => job.id !== jobId));
      
      // In a real app, you would also update applicant statuses based on hiredApplicantIds
      console.log('Job deleted:', jobId, 'Hired applicants:', hiredApplicantIds);
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Failed to delete job. Please try again.');
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const handleJobClick = (job: JobPosting) => {
    setSelectedJob(job);
    setApplicantFilters(prev => ({
      ...prev,
      jobId: job.id.toString(),
      status: ''
    }));
    setActiveTab('applicants');
    setIsJobDetailsModalOpen(true);
  };

  const handleViewJobDetails = (job: JobPosting) => {
    setSelectedJob(job);
    setIsJobDetailsModalOpen(true);
  };

  // Handle viewing applicants for a specific job
  const handleViewJobApplicants = (job: JobPosting) => {
    setActiveTab('applicants');
    setApplicantFilters(prev => ({
      ...prev,
      jobId: job.id.toString(),
      status: '' // Reset status filter to show all applicants for this job
    }));
  };

  const handleEditJobFromModal = (job: JobPosting) => {
    const handleEditJob = (job: JobPosting) => {
      setSelectedJob(job);
      // Here you would typically open an edit form modal
      // For now, we'll just log it
      console.log('Edit job:', job);
    };
    handleEditJob(job);
    setIsJobDetailsModalOpen(false);
  };

  const handleDeleteJobFromModal = (job: JobPosting) => {
    setIsJobDetailsModalOpen(false);
    handleDeleteJob(job.id || 0);
  };

  const closeJobDetailsModal = () => {
    setIsJobDetailsModalOpen(false);
    setSelectedJob(null);
  };

  // This has been consolidated into the filteredApplicants definition above

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
            className={`${sidebarStyles.navItem} ${activeTab === 'overview' ? sidebarStyles.active : ''}`}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('overview');
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
          {activeTab === 'overview' && (
            <>
              {/* Welcome Section */}
              <WelcomeSection 
                userName="Employer"
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
                            margin: '0 0 0.25rem 0'
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
                    Active Job Posts
                  </h2>
                  <button 
                    className={buttonStyles.viewAllButton}
                    onClick={() => setActiveTab('jobs')}
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
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem'
                }}>
                  {enhancedJobPostings.slice(0, 4).map((job) => (
                    <div 
                      key={job.id} 
                      style={{
                        background: 'white',
                        borderRadius: '12px',
                        border: '1px solid #e2e8f0',
                        padding: '1.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => handleJobClick(job)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#3b82f6';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e2e8f0';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ marginBottom: '1rem' }}>
                        <h4 style={{ 
                          fontSize: '1.125rem', 
                          fontWeight: '600', 
                          color: '#1e293b',
                          margin: '0 0 0.5rem 0'
                        }}>
                          {job.title}
                        </h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <span style={{ 
                            fontSize: '0.875rem', 
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            <FiBriefcase size={14} />
                            {job.type}
                          </span>
                          {job.remote && (
                            <span style={{
                              padding: '0.125rem 0.5rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              backgroundColor: '#dbeafe',
                              color: '#1e40af'
                            }}>
                              Remote
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div style={{ marginBottom: '1rem' }}>
                        <p style={{ 
                          fontSize: '0.875rem', 
                          color: '#64748b',
                          margin: '0 0 0.5rem 0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <FiMapPin size={14} />
                          {job.location}
                        </p>
                        <p style={{ 
                          fontSize: '1rem', 
                          fontWeight: '600',
                          color: '#1e293b',
                          margin: '0 0 0.5rem 0'
                        }}>
                          ₱{job.salary}
                        </p>
                        <p style={{ 
                          fontSize: '0.75rem', 
                          color: '#94a3b8',
                          margin: '0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}>
                          <FiClock size={12} />
                          Posted {formatDate(job.postedDate)}
                        </p>
                      </div>

                      <div style={{ marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {job.requirements.slice(0, 3).map((req, index) => (
                            <span 
                              key={index} 
                              style={{
                                padding: '0.25rem 0.5rem',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '500',
                                backgroundColor: '#f1f5f9',
                                color: '#475569'
                              }}
                            >
                              {req}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          backgroundColor: job.status === 'active' ? '#dcfce7' : '#fee2e2',
                          color: job.status === 'active' ? '#166534' : '#991b1b'
                        }}>
                          {job.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                        <div 
                          style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            color: '#3b82f6',
                            cursor: 'pointer'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            console.log('Clicked on applications for job ID:', job.id, 'type:', typeof job.id);
                            const newFilters = {
                              ...applicantFilters,
                              jobId: job.id.toString(),
                              status: ''
                            };
                            console.log('Setting new filters:', newFilters);
                            setApplicantFilters(newFilters);
                            setActiveTab('applicants');
                            // Force a re-render to ensure the filter is applied
                            setSearchQuery('');
                          }}
                        >
                          {job.applicantCount} Applications
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'applicants' && (
            <div style={{ padding: '2rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '2rem' 
              }}>
                <h1 style={{ 
                  fontSize: '2rem', 
                  fontWeight: '700', 
                  color: '#1e293b',
                  margin: 0 
                }}>
                  {applicantFilters.jobId ? 
                    `Applicants for ${enhancedJobPostings.find(job => job.id.toString() === applicantFilters.jobId)?.title}` : 
                    'All Applicants'
                  }
                </h1>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <div style={{ position: 'relative', minWidth: '200px' }}>
                    <FiSearch style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#64748b',
                      fontSize: '14px',
                      pointerEvents: 'none'
                    }} />
                    <input
                      type="text"
                      placeholder="Search applicants..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{
                        padding: '0.5rem 1rem 0.5rem 2.25rem',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '0.875rem',
                        backgroundColor: 'white',
                        width: '100%',
                        outline: 'none',
                        cursor: 'text'
                      }}
                    />
                  </div>
                  <select 
                    value={applicantFilters.jobId}
                    onChange={(e) => setApplicantFilters(prev => ({...prev, jobId: e.target.value}))}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.875rem',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      minWidth: '200px'
                    }}
                  >
                    <option value="">All Job Posts</option>
                    {enhancedJobPostings.map((job) => (
                      <option key={job.id} value={job.id.toString()}>
                        {job.title}
                      </option>
                    ))}
                  </select>
                  <select 
                    value={applicantFilters.status}
                    onChange={(e) => setApplicantFilters(prev => ({...prev, status: e.target.value}))}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.875rem',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending Review</option>
                    <option value="interview">Interview</option>
                    <option value="hired">Hired</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <select 
                    value={applicantFilters.sortBy}
                    onChange={(e) => setApplicantFilters(prev => ({...prev, sortBy: e.target.value}))}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.875rem',
                      backgroundColor: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="match-high">Highest Match</option>
                    <option value="match-low">Lowest Match</option>
                  </select>
                </div>
              </div>

              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                gap: '1.5rem'
              }}>
                {filteredApplicants.map((applicant) => (
                  <div 
                    key={applicant.id} 
                    style={{
                      background: 'white',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      padding: '1.5rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#3b82f6';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    onClick={() => handleViewApplicantDetails(applicant)}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '12px',
                        background: '#3b82f6',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.5rem',
                        fontWeight: '600',
                        flexShrink: 0
                      }}>
                        {applicant.name.charAt(0)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ 
                          fontSize: '1.25rem', 
                          fontWeight: '600', 
                          color: '#1e293b',
                          margin: '0 0 0.5rem 0'
                        }}>
                          {applicant.name}
                        </h3>
                        <p style={{ 
                          fontSize: '0.875rem', 
                          color: '#64748b',
                          margin: '0 0 0.25rem 0'
                        }}>
                          Applied for: <span style={{ fontWeight: '500', color: '#1e293b' }}>{applicant.position}</span>
                        </p>
                        <p style={{ 
                          fontSize: '0.75rem', 
                          color: '#94a3b8',
                          margin: '0'
                        }}>
                          Applied on {new Date(applicant.appliedDate).toLocaleDateString()} • {applicant.experience}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontSize: '1.5rem',
                          fontWeight: '700',
                          color: '#3b82f6',
                          lineHeight: '1'
                        }}>
                          {applicant.match}%
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: '#64748b',
                          marginBottom: '0.5rem'
                        }}>
                          Match
                        </div>
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
                           applicant.status === 'pending' ? 'Pending' : applicant.status}
                        </span>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '500', 
                        color: '#374151',
                        marginBottom: '0.5rem'
                      }}>
                        Skills:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {applicant.skills.slice(0, 4).map((skill, index) => (
                          <span 
                            key={index} 
                            style={{
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '500',
                              backgroundColor: '#f1f5f9',
                              color: '#475569'
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div 
                      style={{ 
                        display: 'flex', 
                        gap: '0.5rem',
                        paddingTop: '1rem'
                      }}
                    >
                      <button 
                        onClick={() => {
                          setSelectedApplicant(applicant);
                          setIsModalOpen(true);
                        }}
                        title="View Details"
                        style={{
                          padding: '0.5rem',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: 'white',
                          color: '#64748b',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                          e.currentTarget.style.borderColor = '#3b82f6';
                          e.currentTarget.style.color = '#3b82f6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.color = '#64748b';
                        }}
                      >
                        <FiEye size={16} />
                      </button>
                      <button 
                        onClick={() => handleDownloadResume(applicant.id)}
                        title="Download Resume"
                        style={{
                          padding: '0.5rem',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: 'white',
                          color: '#64748b',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f8fafc';
                          e.currentTarget.style.borderColor = '#3b82f6';
                          e.currentTarget.style.color = '#3b82f6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                          e.currentTarget.style.color = '#64748b';
                        }}
                      >
                        <FiDownload size={16} />
                      </button>
                      {applicant.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApproveApplicant(applicant.id)}
                            title="Approve"
                            style={{
                              padding: '0.5rem 1rem',
                              borderRadius: '8px',
                              border: 'none',
                              backgroundColor: '#10b981',
                              color: 'white',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.25rem',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              transition: 'all 0.2s',
                              flex: 1
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#059669';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#10b981';
                            }}
                          >
                            <FiCheck size={16} />
                            Approve
                          </button>
                          <button 
                            onClick={() => handleRejectApplicant(applicant.id)}
                            title="Reject"
                            style={{
                              padding: '0.5rem 1rem',
                              borderRadius: '8px',
                              border: 'none',
                              backgroundColor: '#ef4444',
                              color: 'white',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.25rem',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              transition: 'all 0.2s',
                              flex: 1
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#dc2626';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#ef4444';
                            }}
                          >
                            <FiXCircle size={16} />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <JobsTab
              jobs={filteredJobs}
              applicants={enhancedApplicants}
              searchTerm={searchQuery}
              filters={{
                status: filterStatus,
                department: '',
                location: ''
              }}
              onSearchChange={setSearchQuery}
              onFilterChange={handleFilterChange}
              onViewJob={handleViewJobApplicants}
              onEditJob={handleEditJob}
              onDeleteJob={handleDeleteJob}
              onCreateJob={handleCreateJob}
              onUpdateJob={handleUpdateJob}
              isLoading={isLoadingJobs}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab 
              onOpenCompanyProfile={() => setIsCompanyProfileModalOpen(true)}
              onOpenNotifications={() => setIsNotificationPreferencesModalOpen(true)}
              onOpenTeamManagement={() => setIsTeamManagementModalOpen(true)}
              onOpenDocuments={() => setIsDocumentsModalOpen(true)}
              onLogout={() => {
                // Clear any stored authentication data
                localStorage.removeItem('authToken');
                sessionStorage.clear();
                // Redirect to employer auth page
                window.location.href = '/auth/employer';
              }}
            />
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

      {/* Job Details Modal */}
      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          isOpen={isJobDetailsModalOpen}
          onClose={() => {
            setIsJobDetailsModalOpen(false);
            setSelectedJob(null);
          }}
          onEdit={() => {
            // Handle edit job
            console.log('Edit job:', selectedJob);
          }}
          onDelete={() => {
            // Handle delete job
            console.log('Delete job:', selectedJob);
          }}
          onViewApplicants={() => {
            // Handle view applicants
            console.log('View applicants for job:', selectedJob);
          }}
        />
      )}

      {/* Settings Modals */}
      <CompanyProfileModal
        isOpen={isCompanyProfileModalOpen}
        onClose={() => setIsCompanyProfileModalOpen(false)}
        onSave={(data: CompanyProfileData) => {
          console.log('Company profile updated:', data);
          // Handle save company profile
        }}
      />

      <NotificationPreferencesModal
        isOpen={isNotificationPreferencesModalOpen}
        onClose={() => setIsNotificationPreferencesModalOpen(false)}
        onSave={(preferences: NotificationPreferences) => {
          console.log('Notification preferences updated:', preferences);
          // Handle save notification preferences
        }}
      />

      <TeamManagementModal
        isOpen={isTeamManagementModalOpen}
        onClose={() => setIsTeamManagementModalOpen(false)}
        onSave={(teamData: TeamData) => {
          console.log('Team data updated:', teamData);
          // Handle save team data
        }}
      />

      <DocumentsModal
        isOpen={isDocumentsModalOpen}
        onClose={() => setIsDocumentsModalOpen(false)}
        onSave={(documentsData: any) => {
          console.log('Documents updated:', documentsData);
          // Handle save documents data
        }}
      />
      {showEditConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Confirm Changes</h3>
            <p>Are you sure you want to update this job posting?</p>
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem',
              marginTop: '1.5rem'
            }}>
              <button
                onClick={cancelUpdateJob}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  border: '1px solid #d1d5db',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmUpdateJob}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  border: 'none',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#3b82f6';
                }}
              >
                Confirm Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployerDashboard;
