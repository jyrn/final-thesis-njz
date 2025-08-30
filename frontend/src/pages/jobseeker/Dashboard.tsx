import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Dashboard.module.css'
import { FiHome, FiBriefcase, FiFileText, FiUser, FiBookmark, FiMapPin, FiDollarSign, FiClock, FiBell, FiMenu, FiX, FiFilter, FiSliders, FiLogOut } from 'react-icons/fi'
import FilterModal from '../../components/jobseeker/FilterModal/FilterModal'
import SearchBar from '../../components/jobseeker/SearchBar/SearchBar'
import ResumeUploadPrompt from '../../components/ResumeUploadPrompt';
import JobDetailModal from '../../components/jobseeker/JobDetailModal/JobDetailModal';
import DashboardTab from '../../components/jobseeker/Dashboard/tabs/DashboardTab';
import JobsTab from '../../components/jobseeker/Dashboard/tabs/JobsTab';
import SavedJobsTab from '../../components/jobseeker/Dashboard/tabs/SavedJobsTab';
import ApplicationsTab from '../../components/jobseeker/Dashboard/tabs/ApplicationsTab';
import SettingsTab from '../../components/jobseeker/Settings/SettingsTab';
import { parseResume } from '../../utils/resumeParser'
import { Job } from '../../types/Job'
import { mockJobs, mockApplications } from '../../data/mockJobs'
import { JobService } from '../../services/jobService'

// Types
interface PersonalInfo {
  name: string
  email: string
  phone: string
  address: string
}

interface Experience {
  company: string
  position: string
  duration: string
  description: string
}

interface Education {
  institution: string
  degree: string
  year: string
}


interface Application {
  id: number
  jobId: number
  status: 'pending' | 'review' | 'interview' | 'rejected' | 'accepted'
  appliedDate: string
  updatedAt: string
}

interface ParsedResume {
  personalInfo: PersonalInfo
  summary: string
  experience: Experience[]
  education: Education[]
  skills: string[]
  certifications: string[]
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showFilters, setShowFilters] = useState(false)
  const [showJobDetail, setShowJobDetail] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [showResumeUpload, setShowResumeUpload] = useState(false)
  const [resume, setResume] = useState<ParsedResume | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [savedJobs, setSavedJobs] = useState<Set<number>>(new Set())
  const [notifications, setNotifications] = useState<number>(3)
  const [error, setError] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isFirstVisit, setIsFirstVisit] = useState(true)
  const [hasSkippedResume, setHasSkippedResume] = useState(false)
  const [showInitialResumePrompt, setShowInitialResumePrompt] = useState(false)
  const [attemptedJobId, setAttemptedJobId] = useState<number | null>(null)
  const [showFilterModal, setShowFilterModal] = useState(false)
  
  interface ActiveFilters {
    lastUpdate: string;
    workplaceType: string;
    jobType: string[];
    positionLevel: string[];
    location: {
      withinKm: number;
      nearMe: boolean;
      withinCountry: boolean;
      international: boolean;
      remote: boolean;
    };
    salary: {
      min: number;
      max: number;
    };
  }
  
  const [activeFilters, setActiveFilters] = useState<ActiveFilters>({
    lastUpdate: '',
    workplaceType: '',
    jobType: [],
    positionLevel: [],
    location: {
      withinKm: 10,
      nearMe: false,
      withinCountry: false,
      international: false,
      remote: false
    },
    salary: {
      min: 20000,
      max: 50000
    }
  })

  // Handle user logout
  const handleLogout = () => {
    // Clear user session data
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Redirect to jobseeker auth page
    navigate('/auth/jobseeker')
  }

  // Filter jobs based on search query and filters
  useEffect(() => {
    const query = searchQuery.toLowerCase().trim();
    
    const filtered = jobs.filter(job => {
      // Search query matching - check all relevant fields
      if (query === '') {
        return true; // No search query, show all jobs (subject to filters)
      }
      
      // Check each field individually for better debugging
      const titleMatch = job.title?.toLowerCase().includes(query);
      const companyMatch = job.company?.toLowerCase().includes(query);
      const locationMatch = job.location?.toLowerCase().includes(query);
      const descriptionMatch = job.description?.toLowerCase().includes(query);
      const typeMatch = job.type?.toLowerCase().includes(query);
      const levelMatch = job.level?.toLowerCase().includes(query);
      const experienceLevelMatch = job.experienceLevel?.toLowerCase().includes(query);
      const requirementsMatch = job.requirements?.some(req => 
        req && req.toLowerCase().includes(query)
      );
      
      const matchesSearch = titleMatch || companyMatch || locationMatch || 
                           descriptionMatch || typeMatch || levelMatch || 
                           experienceLevelMatch || requirementsMatch;
      
      // Debug logging (remove in production)
      if (query && matchesSearch) {
        console.log(`Search "${query}" matched job: ${job.title} at ${job.company}`, {
          titleMatch, companyMatch, locationMatch, descriptionMatch, 
          typeMatch, levelMatch, experienceLevelMatch, requirementsMatch
        });
      }
      
      return matchesSearch;
    });
    
    // Apply additional filters only if search returned results or no search query
    const finalFiltered = filtered.filter(job => {
      // Always apply filters - let each filter decide if it should be active
      // This way filters work immediately when set
      
      // Filter matching with proper type checking
      const jobTypeMatch = !activeFilters.jobType?.length || 
        activeFilters.jobType.some(filterType => 
          job.type?.toLowerCase() === filterType.toLowerCase()
        );
      
      const workplaceTypeMatch = !activeFilters.workplaceType || 
        (activeFilters.workplaceType === 'Remote' && (job.isRemote || job.workplaceType === 'Remote')) ||
        (activeFilters.workplaceType === 'Hybrid' && (job.isHybrid || job.workplaceType === 'Hybrid')) ||
        (activeFilters.workplaceType === 'On-site' && (!job.isRemote && !job.isHybrid));
      
      const positionLevelMatch = !activeFilters.positionLevel?.length || 
        activeFilters.positionLevel.some((level: string) => 
          (job.title?.toLowerCase() || '').includes(level.toLowerCase()) ||
          (job.level?.toLowerCase() || '').includes(level.toLowerCase()) ||
          (job.experienceLevel?.toLowerCase() || '').includes(level.toLowerCase())
        );
      
      const salaryMatch = job.salary >= (activeFilters.salary?.min || 0) && 
        job.salary <= (activeFilters.salary?.max || Number.MAX_SAFE_INTEGER);
      
      const locationMatch = 
        (!activeFilters.location?.remote || job.isRemote || job.workplaceType === 'Remote') &&
        (!activeFilters.location?.withinCountry || job.location?.toLowerCase().includes('metro manila')) &&
        (!activeFilters.location?.international || !job.location?.toLowerCase().includes('metro manila'));
      
      const matchesFilters = jobTypeMatch && workplaceTypeMatch && positionLevelMatch && salaryMatch && locationMatch;
      
      // Debug logging for filters
      if (activeFilters.jobType?.length > 0 || activeFilters.workplaceType || activeFilters.positionLevel?.length > 0) {
        console.log(`Filter check for ${job.title}:`, {
          jobTypeMatch, workplaceTypeMatch, positionLevelMatch, salaryMatch, locationMatch,
          activeFilters: {
            jobType: activeFilters.jobType,
            workplaceType: activeFilters.workplaceType,
            positionLevel: activeFilters.positionLevel
          },
          jobData: {
            type: job.type,
            isRemote: job.isRemote,
            isHybrid: job.isHybrid,
            level: job.level,
            experienceLevel: job.experienceLevel
          }
        });
      }
      
      return matchesFilters;
    });
    
    setFilteredJobs(finalFiltered);
  }, [searchQuery, jobs, activeFilters]);
  
  const handleApplyFilters = (filters: ActiveFilters) => {
    setActiveFilters(filters);
    setShowFilterModal(false);
  };

  // Load jobs from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load jobs from backend API
        const jobService = JobService.getInstance();
        const backendJobs = await jobService.getRecommendedJobs();
        setJobs(backendJobs);
        setApplications(mockApplications);

        // Check if this is first visit and no resume
        const hasVisited = localStorage.getItem('hasVisitedDashboard')
        const storedResume = localStorage.getItem('userResume')
        
        if (!hasVisited && !storedResume) {
          setShowInitialResumePrompt(true)
          setIsFirstVisit(true)
        } else {
          setIsFirstVisit(false)
          if (storedResume) {
          // Load stored resume data
          try {
            const resumeData = JSON.parse(storedResume)
            setResume(resumeData)
            
            // Set resume in JobService for better job matching
            const jobService = JobService.getInstance();
            jobService.setUserResume(resumeData);
          } catch (e) {
            console.error('Error parsing stored resume:', e)
          }
        }
        }

        localStorage.setItem('hasVisitedDashboard', 'true')
      } catch (err) {
        setError('Failed to load data. Please try again later.')
        console.error('Error loading data:', err)
      }
    }

    loadData()
  }, [])

  const handleResumeUpload = async (file: File) => {
    try {
      const parsed = await parseResume(file)
      const resumeData = {
        personalInfo: {
          name: parsed.personalInfo.name,
          email: parsed.personalInfo.email,
          phone: parsed.personalInfo.phone,
          address: parsed.personalInfo.address || 'Not specified'
        },
        summary: parsed.summary,
        experience: parsed.experience,
        education: parsed.education.map(edu => ({
          institution: edu.institution || 'Not specified',
          degree: edu.degree || 'Not specified',
          year: edu.year || 'Not specified'
        })),
        skills: parsed.skills,
        certifications: parsed.certifications || []
      }
      
      setResume(resumeData)
      setShowResumeUpload(false)
      setShowInitialResumePrompt(false)
      setHasSkippedResume(false)
      
      // Store resume data
      localStorage.setItem('userResume', JSON.stringify(resumeData))
      
      // Set resume in JobService for better job matching
      const jobService = JobService.getInstance();
      jobService.setUserResume(resumeData);
      
      // If user was trying to apply to a job, proceed with application
      if (attemptedJobId) {
        handleApplyJob(attemptedJobId)
        setAttemptedJobId(null)
      }
    } catch (err) {
      setError('Failed to parse resume. Please try again.')
      console.error('Error parsing resume:', err)
    }
  }

  const handleSkipResume = () => {
    setHasSkippedResume(true);
    setShowInitialResumePrompt(false);
    setShowResumeUpload(false);
    // Don't change the active tab, just close the modal
  };

  // Job matching logic based on resume skills
  const getMatchedJobs = () => {
    if (!resume || !resume.skills?.length) {
      return jobs // Return all jobs if no resume or skills
    }

    const userSkills = resume.skills.map(skill => skill?.toLowerCase() || '')
    
    return jobs
      .map(job => {
        const jobRequirements = job.requirements || []
        const matchingSkills = jobRequirements.filter(req => 
          req && userSkills.some(skill => 
            skill && req.toLowerCase().includes(skill.toLowerCase())
          )
        )
        
        return {
          ...job,
          matchScore: matchingSkills.length,
          matchingSkills
        }
      })
      .sort((a, b) => b.matchScore - a.matchScore)
  }

  const getJobsToDisplay = () => {
    // Always use filteredJobs as the base (includes both search and filter results)
    let jobsToShow = filteredJobs;
    
    // If no search query and user has resume, apply skill matching to filtered results
    if (searchQuery.trim() === '' && resume && !hasSkippedResume) {
      const userSkills = resume.skills?.map(skill => skill?.toLowerCase() || '') || [];
      
      jobsToShow = filteredJobs
        .map(job => {
          const jobRequirements = job.requirements || []
          const matchingSkills = jobRequirements.filter(req => 
            req && userSkills.some(skill => 
              skill && req.toLowerCase().includes(skill.toLowerCase())
            )
          )
          
          return {
            ...job,
            matchScore: matchingSkills.length,
            matchingSkills
          }
        })
        .sort((a, b) => b.matchScore - a.matchScore)
    }
    
    return jobsToShow;
  }

  const handleSaveJob = (jobId: number) => {
    const jobService = JobService.getInstance();
    const updatedJob = jobService.toggleSaveJob(jobId);
    
    setSavedJobs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(jobId)) {
        newSet.delete(jobId)
      } else {
        newSet.add(jobId)
      }
      return newSet
    })
    
    // Update the jobs list to reflect the saved status
    if (updatedJob) {
      setJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, saved: updatedJob.saved } : job
      ));
    }
  }

  const handleApplyJob = (jobId: number) => {
    // Check if user has resume before allowing application
    if (!resume) {
      setAttemptedJobId(jobId)
      setShowResumeUpload(true)
      return
    }
    
    // Apply through JobService
    const jobService = JobService.getInstance();
    const updatedJob = jobService.applyToJob(jobId);
    
    // Proceed with application
    console.log('Applying to job:', jobId)
    const newApplication: Application = {
      id: Date.now(),
      jobId: jobId,
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString()
    }
    
    setApplications(prev => [...prev, newApplication])
    setShowJobDetail(false)
    
    // Update the jobs list to reflect the applied status
    if (updatedJob) {
      setJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, applied: updatedJob.applied } : job
      ));
    }
    
    // Show success message
    setError(null)
  }

  const handleJobClick = (job: Job) => {
    setSelectedJob(job)
    setShowJobDetail(true)
  }

  const handleFilterApply = (filters: any) => {
    console.log('Applying filters:', filters)
    setShowFilters(false)
  }

  const renderDesktopSidebar = () => (
    <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.logo}>JobPortal</h2>
        <button 
          className={styles.closeSidebar}
          onClick={() => setIsSidebarOpen(false)}
        >
          <FiX />
        </button>
      </div>
      <nav className={styles.sidebarNav}>
        <button
          className={`${styles.navItem} ${activeTab === 'dashboard' ? styles.active : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <FiHome />
          <span>Dashboard</span>
        </button>
        <button
          className={`${styles.navItem} ${activeTab === 'jobs' ? styles.active : ''}`}
          onClick={() => setActiveTab('jobs')}
        >
          <FiBriefcase />
          <span>Find Jobs</span>
        </button>
        <button
          className={`${styles.navItem} ${activeTab === 'applications' ? styles.active : ''}`}
          onClick={() => setActiveTab('applications')}
        >
          <FiFileText />
          <span>Applications</span>
        </button>
        <button
          className={`${styles.navItem} ${activeTab === 'saved' ? styles.active : ''}`}
          onClick={() => setActiveTab('saved')}
        >
          <FiBookmark />
          <span>Saved Jobs</span>
        </button>
        <button
          className={`${styles.navItem} ${activeTab === 'profile' ? styles.active : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <FiUser />
          <span>Settings</span>
        </button>
      </nav>
    </aside>
  )

  const renderContent = () => {
    const tabProps = {
      resume,
      applications,
      savedJobs,
      jobs,
      hasSkippedResume,
      onNavigate: setActiveTab,
      onShowResumeUpload: () => setShowResumeUpload(true),
      getJobsToDisplay,
      onSaveJob: handleSaveJob,
      onApplyJob: handleApplyJob,
      onJobClick: handleJobClick,
      onOpenFilters: () => setShowFilterModal(true),
    };

    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab {...tabProps} />;
      case 'jobs':
        return <JobsTab {...tabProps} />;
      case 'saved':
        return <SavedJobsTab {...tabProps} />;
      case 'applications':
        return <ApplicationsTab />;
      case 'profile':
        return <SettingsTab />;
      default:
        return (
          <div className={styles.pageContent}>
            <div className={styles.emptyState}>
              <FiX size={48} className={styles.emptyIcon} />
              <h3>Page not found</h3>
              <p>The requested page could not be found</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={styles.dashboard}>
      {/* Desktop Sidebar */}
      {renderDesktopSidebar()}
      
      {/* Mobile Header - Removed for now */}

      {/* Main Content */}
      <main className={`${styles.mainContent} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
        {/* Desktop Header */}
        <header className={styles.desktopHeader}>
          <div className={styles.headerLeft}>
            <button 
              className={styles.menuToggle}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle menu"
            >
              <FiMenu />
            </button>
            <h1 className={styles.pageTitle}>Dashboard</h1>
          </div>
          
          {activeTab === 'jobs' && (
            <div className={styles.headerSearch}>
              <SearchBar 
                value={searchQuery}
                onChange={(value) => setSearchQuery(value)}
                placeholder="Search for jobs, companies, or keywords"
              />
            </div>
          )}
          
          <div className={styles.headerActions}>
            <button 
              className={styles.notificationBtn}
              aria-label="Notifications"
            >
              <FiBell />
              {notifications > 0 && (
                <span className={styles.notificationBadge}>
                  {notifications > 9 ? '9+' : notifications}
                </span>
              )}
            </button>
            <div 
              className={styles.userAvatar}
              aria-label="User profile"
            >
              {resume?.personalInfo.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        {/* Content */}
        <div className={styles.contentArea}>
          {error && (
            <div className={styles.errorBanner}>
              <p>{error}</p>
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}

          {renderContent()}
        </div>
      </main>

      <FilterModal 
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilters}
      />

      {/* Mobile Bottom Navigation - Removed for now */}

      {/* Modals - Filter modal removed for now */}

      <JobDetailModal
        job={selectedJob}
        isOpen={showJobDetail}
        onClose={() => setShowJobDetail(false)}
        onApply={handleApplyJob}
      />

      {showResumeUpload && (
        <ResumeUploadPrompt 
          isOpen={showResumeUpload || (isFirstVisit && !hasSkippedResume && !resume)} 
          onClose={() => setShowResumeUpload(false)} 
          onUpload={handleResumeUpload}
          onSkip={handleSkipResume}
        />
      )}

      {showInitialResumePrompt && (
        <div className={styles.modalOverlay}>
          <div className={styles.initialResumeModal}>
            <div className={styles.modalHeader}>
              <h2>Welcome to Your Job Dashboard!</h2>
            </div>
            <div className={styles.modalContent}>
              <div className={styles.resumeIcon}>
                <FiFileText size={48} />
              </div>
              <h3>Upload Your Resume for Better Job Matches</h3>
              <p>
                Your resume helps us understand your skills and experience to recommend 
                the most relevant job opportunities. We'll analyze your background and 
                match you with positions that fit your profile.
              </p>
              <ul className={styles.benefitsList}>
                <li>Get personalized job recommendations</li>
                <li>See jobs ranked by skill match</li>
                <li>Apply to jobs with one click</li>
                <li>Track your application status</li>
              </ul>
            </div>
            <div className={styles.modalActions}>
              <button 
                className={styles.primaryBtn}
                onClick={() => {
                  setShowInitialResumePrompt(false)
                  setShowResumeUpload(true)
                }}
              >
                Upload Resume
              </button>
              <button 
                className={styles.secondaryBtn}
                onClick={handleSkipResume}
              >
                Skip for Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
