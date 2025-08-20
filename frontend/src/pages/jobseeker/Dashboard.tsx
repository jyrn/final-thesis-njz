import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Dashboard.module.css'
import { FiHome, FiBriefcase, FiFileText, FiUser, FiBookmark, FiMapPin, FiDollarSign, FiClock, FiBell, FiMenu, FiX, FiFilter } from 'react-icons/fi'
import SearchBar from '../../components/jobseeker/SearchBar/SearchBar'
import ResumeUploadPrompt from '../../components/ResumeUploadPrompt';
import JobDetailModal from '../../components/jobseeker/JobDetailModal/JobDetailModal';
import DashboardTab from '../../components/jobseeker/Dashboard/tabs/DashboardTab';
import JobsTab from '../../components/jobseeker/Dashboard/tabs/JobsTab';
import SavedJobsTab from '../../components/jobseeker/Dashboard/tabs/SavedJobsTab';
import ApplicationsTab from '../../components/jobseeker/Dashboard/tabs/ApplicationsTab';
import ProfileTab from '../../components/jobseeker/Dashboard/tabs/ProfileTab';
import { parseResume } from '../../utils/resumeParser'
import { Job } from '../../types/Job'

// Types
interface PersonalInfo {
  name: string
  email: string
  phone: string
  location: string
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
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showFilters, setShowFilters] = useState(false)
  const [showJobDetail, setShowJobDetail] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showResumeUpload, setShowResumeUpload] = useState(false)
  const [resume, setResume] = useState<ParsedResume | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [savedJobs, setSavedJobs] = useState<Set<number>>(new Set())
  const [notifications, setNotifications] = useState<number>(3)
  const [error, setError] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isFirstVisit, setIsFirstVisit] = useState(true)
  const [hasSkippedResume, setHasSkippedResume] = useState(false)
  const [showInitialResumePrompt, setShowInitialResumePrompt] = useState(false)
  const [attemptedJobId, setAttemptedJobId] = useState<number | null>(null)

  // Mock data loading
  useEffect(() => {
    const loadData = async () => {
      try {
        const mockJobs: Job[] = [
          {
            id: 1,
            title: "UI/UX Designer",
            company: "Google",
            location: "California, USA",
            salary: "15K/Mo",
            type: "Full time",
            level: "Senior designer",
            postedDate: "1 day ago",
            description: "We are looking for a Senior UI/UX Designer...",
            requirements: ["Figma", "Adobe Creative Suite", "User Research", "Prototyping"]
          },
          {
            id: 2,
            title: "Product Designer",
            company: "Apple",
            location: "California, USA",
            salary: "15K/Mo",
            type: "Full time",
            level: "Senior designer",
            postedDate: "2 days ago",
            description: "Join our design team as a Product Designer...",
            requirements: ["Sketch", "Design Systems", "User Testing", "Wireframing"]
          },
          {
            id: 3,
            title: "Frontend Developer",
            company: "Microsoft",
            location: "Washington, USA",
            salary: "18K/Mo",
            type: "Full time",
            level: "Mid-level",
            postedDate: "3 days ago",
            description: "We need a Frontend Developer to build amazing web experiences...",
            requirements: ["React", "TypeScript", "CSS", "JavaScript"]
          },
          {
            id: 4,
            title: "Full Stack Developer",
            company: "Netflix",
            location: "California, USA",
            salary: "20K/Mo",
            type: "Full time",
            level: "Senior",
            postedDate: "4 days ago",
            description: "Join our engineering team as a Full Stack Developer...",
            requirements: ["Node.js", "React", "MongoDB", "AWS"]
          },
          {
            id: 5,
            title: "Marketing Specialist",
            company: "Spotify",
            location: "New York, USA",
            salary: "12K/Mo",
            type: "Full time",
            level: "Junior",
            postedDate: "5 days ago",
            description: "We're looking for a creative Marketing Specialist...",
            requirements: ["Digital Marketing", "SEO", "Content Creation", "Analytics"]
          }
        ]
        setJobs(mockJobs)

        const mockApplications: Application[] = [
          {
            id: 1,
            jobId: 1,
            status: 'review',
            appliedDate: '2023-06-15',
            updatedAt: '2023-06-15T10:30:00Z'
          },
          {
            id: 2,
            jobId: 2,
            status: 'interview',
            appliedDate: '2023-06-10',
            updatedAt: '2023-06-12T14:20:00Z'
          }
        ]
        setApplications(mockApplications)

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
          location: parsed.personalInfo.address || 'Not specified'
        },
        summary: parsed.summary,
        experience: parsed.experience,
        education: parsed.education.map(edu => ({
          institution: edu.institution || 'Not specified',
          degree: edu.degree || 'Not specified',
          year: edu.year || 'Not specified'
        })),
        skills: parsed.skills
      }
      
      setResume(resumeData)
      setShowResumeUpload(false)
      setShowInitialResumePrompt(false)
      setHasSkippedResume(false)
      
      // Store resume data
      localStorage.setItem('userResume', JSON.stringify(resumeData))
      
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
    setActiveTab('dashboard');
  };

  // Job matching logic based on resume skills
  const getMatchedJobs = () => {
    if (!resume || !resume.skills.length) {
      return jobs // Return all jobs if no resume
    }

    const userSkills = resume.skills.map(skill => skill.toLowerCase())
    
    return jobs
      .map(job => {
        const jobRequirements = job.requirements || []
        const matchingSkills = jobRequirements.filter(req => 
          userSkills.some(skill => skill.includes(req.toLowerCase()) || req.toLowerCase().includes(skill))
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
    if (resume && !hasSkippedResume) {
      return getMatchedJobs()
    }
    // Show latest jobs (sorted by posted date) when no resume
    return [...jobs].sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime())
  }

  const handleSaveJob = (jobId: number) => {
    setSavedJobs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(jobId)) {
        newSet.delete(jobId)
      } else {
        newSet.add(jobId)
      }
      return newSet
    })
  }

  const handleApplyJob = (jobId: number) => {
    // Check if user has resume before allowing application
    if (!resume) {
      setAttemptedJobId(jobId)
      setShowResumeUpload(true)
      return
    }
    
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
          <span>Profile</span>
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
        return <ProfileTab />;
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
          
          <div className={styles.headerSearch}>
            <SearchBar 
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search jobs..."
            />
          </div>
          
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
