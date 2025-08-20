"use client"

import React, { useState, useEffect, FC } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./Dashboard.module.css"

// Types
interface ParsedResume {
  personalInfo: {
    name: string
    email: string
    phone: string
    address: string
  }
  name: string
  email: string
  phone: string
  address: string
  summary: string
  experience: Array<{
    company: string
    position: string
    duration: string
    description: string
  }>
  company: string
  position: string
  duration: string
  description: string
  education: Array<{
    institution: string
    degree: string
    year: string
  }>
  institution: string
  degree: string
  year: string
  skills: string[]
  certifications: string[]
}

interface Job {
  id: string
  title: string
  company: string
  location: string
  type: string
  salary: string
  description: string
  requirements: string[]
  postedDate: string
  matchPercentage?: number
  saved?: boolean
  applied?: boolean
}

interface Application {
  id: string
  jobTitle: string
  company: string
  status: string;
  appliedDate: string;
  statusColor: string;
}

interface ResumeUploadData {
  fileName: string
  fileSize: number
  uploadDate: string
  needsProcessing?: boolean
  processed?: boolean
}

// Icon Components
const DashboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z" />
  </svg>
)

const JobsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 6h-2V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
  </svg>
)

const ApplicationsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
  </svg>
)

const ProfileIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
  </svg>
)

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
)

const FilterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
  </svg>
)

const BookmarkIcon = ({ filled = false }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
)

const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
)

const SalaryIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
  </svg>
)

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
  </svg>
)

const NotificationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
  </svg>
)

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
  </svg>
)

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
)

interface DashboardState {
  activeTab: string;
  resumeData: ParsedResume | null;
  editableResumeData: ParsedResume | null;
  isProcessing: boolean;
  showVerificationModal: boolean;
  showResumeUploadModal: boolean;
  jobs: Job[];
  applications: Application[];
  resumeUploadInfo: ResumeUploadData | null;
  searchQuery: string;
  showFilters: boolean;
  sidebarOpen: boolean;
  notifications: number;
  hasSeenResumePrompt: boolean;
}

const Dashboard: React.FC = (): JSX.Element => {
  // Initialize navigation at the top of the component
  const navigate = useNavigate();
  
  const [state, setState] = useState<DashboardState>({
    activeTab: 'overview',
    resumeData: null,
    editableResumeData: null,
    isProcessing: false,
    showVerificationModal: false,
    showResumeUploadModal: false,
    jobs: [],
    applications: [],
    resumeUploadInfo: null,
    searchQuery: '',
    showFilters: false,
    sidebarOpen: false,
    notifications: 3,
    hasSeenResumePrompt: false,
  });
  
  // Access state variables directly via state object
  // Example: state.jobs, state.applications, state.searchQuery, etc.
  
  // Helper function to update state
  const updateState = (updates: Partial<DashboardState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  // State update functions using the consolidated state object
  const setResumeUploadInfo = (info: ResumeUploadData | null) => updateState({ resumeUploadInfo: info });
  const setIsProcessing = (processing: boolean) => updateState({ isProcessing: processing });
  const setEditableResumeData = (data: ParsedResume | null) => updateState({ editableResumeData: data });
  const setShowVerificationModal = (show: boolean) => updateState({ showVerificationModal: show });
  const setResumeData = (data: ParsedResume | null) => updateState({ resumeData: data });
  const setApplications = (apps: Application[]) => updateState({ applications: apps });
  const setActiveTab = (tab: string) => updateState({ activeTab: tab });
  const setShowResumeUploadModal = (show: boolean) => updateState({ showResumeUploadModal: show });
  const setHasSeenResumePrompt = (seen: boolean) => {
    localStorage.setItem('hasSeenResumePrompt', seen ? 'true' : '');
    updateState({ hasSeenResumePrompt: seen });
  };
  const setSidebarOpen = (open: boolean) => updateState({ sidebarOpen: open });
  const setSearchQuery = (query: string) => updateState({ searchQuery: query });
  const setShowFilters = (show: boolean) => updateState({ showFilters: show });
  const setNotifications = (count: number) => updateState({ notifications: count });
  const setJobs = (jobsList: Job[]) => updateState({ jobs: jobsList });

  // Type-safe state updaters with proper type annotations
  const updateEditableResumeData = (section: keyof ParsedResume, field: string, value: any): void => {
    setState((prev: DashboardState) => ({
      ...prev,
      editableResumeData: prev.editableResumeData ? {
        ...prev.editableResumeData,
        [section]: {
          ...(prev.editableResumeData as any)[section],
          [field]: value
        }
      } : null
    }));
  };
  
  const updateJobs = (updater: (prevJobs: Job[]) => Job[]): void => {
    setState((prev: DashboardState) => ({
      ...prev,
      jobs: updater(prev.jobs || [])
    }));
  };
  
  const updateApplications = (updater: (prevApps: Application[]) => Application[]): void => {
    setState((prev: DashboardState) => ({
      ...prev,
      applications: updater(prev.applications || [])
    }));
  };

  useEffect(() => {
    checkExistingResume();
    loadJobs();
    loadApplications();
    
    // Check if we need to show the resume upload prompt
    const hasSeen = localStorage.getItem('hasSeenResumePrompt');
    updateState({ hasSeenResumePrompt: !!hasSeen });
    
    // Show resume upload modal on first visit if no resume
    const timer = setTimeout(() => {
      if (!state.resumeData && !hasSeen) {
        updateState({ showResumeUploadModal: true });
      }
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [state.resumeData]);

  const checkExistingResume = async () => {
    console.log("Checking for existing resume data...");

    // First, check for pending resume upload from signup
    const pendingUpload = localStorage.getItem("pendingResumeUpload");
    const pendingFile = localStorage.getItem("pendingResumeFile");

    if (pendingUpload && pendingFile) {
      console.log("Found pending resume upload from signup")
      const uploadData: ResumeUploadData = JSON.parse(pendingUpload)
      setResumeUploadInfo(uploadData)

      // Convert base64 back to File object for processing
      try {
        const response = await fetch(pendingFile)
        const blob = await response.blob()
        const file = new File([blob], uploadData.fileName, { type: "application/pdf" })

        console.log("Processing uploaded resume with OCR...")
        setIsProcessing(true)

        // Process the resume with OCR
        const parsedData = await parseResume(file)
        console.log("Resume parsed successfully:", parsedData)

        setEditableResumeData(parsedData)
        setShowVerificationModal(true)

        // Clean up pending upload data
        localStorage.removeItem("pendingResumeUpload")
        localStorage.removeItem("pendingResumeFile")
      } catch (error) {
        console.error("Error processing pending resume:", error)
      } finally {
        setIsProcessing(false)
      }
      return
    }

    // Check for legacy uploaded resume data
    const uploadedResume = localStorage.getItem("uploadedResume")
    if (uploadedResume) {
      console.log("Found legacy uploaded resume data")
      const uploadData: ResumeUploadData = JSON.parse(uploadedResume)
      setResumeUploadInfo(uploadData)
    }

    // Check for already processed resume data
    const savedResumeData = localStorage.getItem("resumeData")
    if (savedResumeData) {
      console.log("Found existing processed resume data")
      const parsedData: ParsedResume = JSON.parse(savedResumeData)
      setResumeData(parsedData)
      return
    }

    console.log("No existing resume data found")
  }

  const loadJobs = () => {
    // Mock job data with match percentages
    const mockJobs: Job[] = [
      {
        id: "1",
        title: "Senior Software Developer",
        company: "Tech Innovations Inc.",
        location: "Makati, Metro Manila",
        type: "Full-time",
        salary: "₱80,000 - ₱120,000",
        description:
          "We are looking for a skilled senior software developer to join our dynamic team. You'll be working on cutting-edge projects using modern technologies.",
        requirements: ["JavaScript", "React", "Node.js", "TypeScript", "AWS"],
        postedDate: "2024-01-15",
        matchPercentage: 95,
        saved: false,
        applied: false,
      },
      {
        id: "2",
        title: "Frontend Developer",
        company: "Digital Solutions Corp",
        location: "Quezon City, Metro Manila",
        type: "Full-time",
        salary: "₱60,000 - ₱90,000",
        description:
          "Join our creative team as a frontend developer. Work on exciting web applications and user interfaces that impact thousands of users.",
        requirements: ["HTML", "CSS", "JavaScript", "Vue.js", "Figma"],
        postedDate: "2024-01-14",
        matchPercentage: 88,
        saved: true,
        applied: false,
      },
      {
        id: "3",
        title: "Full Stack Developer",
        company: "StartupTech Philippines",
        location: "BGC, Taguig",
        type: "Full-time",
        salary: "₱70,000 - ₱100,000",
        description:
          "Be part of our growing startup! We're looking for a versatile full stack developer who can work across our entire technology stack.",
        requirements: ["Python", "Django", "React", "PostgreSQL", "Docker"],
        postedDate: "2024-01-13",
        matchPercentage: 82,
        saved: false,
        applied: true,
      },
      {
        id: "4",
        title: "Web Developer",
        company: "Creative Agency Manila",
        location: "Ortigas, Pasig",
        type: "Contract",
        salary: "₱50,000 - ₱75,000",
        description:
          "Looking for a creative web developer to work on various client projects. Perfect opportunity to work with diverse brands and technologies.",
        requirements: ["PHP", "MySQL", "WordPress", "jQuery", "Bootstrap"],
        postedDate: "2024-01-12",
        matchPercentage: 75,
        saved: false,
        applied: false,
      },
      {
        id: "5",
        title: "Mobile App Developer",
        company: "MobileTech Solutions",
        location: "Alabang, Muntinlupa",
        type: "Full-time",
        salary: "₱65,000 - ₱95,000",
        description:
          "Develop innovative mobile applications for iOS and Android platforms. Work with a team of passionate developers and designers.",
        requirements: ["React Native", "Flutter", "Firebase", "REST APIs"],
        postedDate: "2024-01-11",
        matchPercentage: 78,
        saved: true,
        applied: false,
      },
    ]
    setJobs(mockJobs)
  }

  const loadApplications = () => {
    // Mock application data
    const mockApplications = [
      {
        id: "1",
        jobTitle: "Senior Software Developer",
        company: "Tech Innovations Inc.",
        status: "Under Review",
        appliedDate: "2024-01-10",
        statusColor: "warning",
      },
      {
        id: "2",
        jobTitle: "Frontend Developer",
        company: "Digital Solutions Corp",
        status: "Interview Scheduled",
        appliedDate: "2024-01-08",
        statusColor: "info",
      },
      {
        id: "3",
        jobTitle: "Full Stack Developer",
        company: "StartupTech Philippines",
        status: "Accepted",
        appliedDate: "2024-01-05",
        statusColor: "success",
      },
    ]
    setApplications(mockApplications)
  }

  const handleVerifyResumeData = (): void => {
    if (state.editableResumeData) {
      setResumeData(state.editableResumeData)
      localStorage.setItem("resumeData", JSON.stringify(state.editableResumeData))

      // Update upload info to mark as processed
      const updatedUploadInfo = {
        ...(state.resumeUploadInfo || {} as ResumeUploadData),
        processed: true,
        needsProcessing: false,
      }
      setResumeUploadInfo(updatedUploadInfo)
      localStorage.setItem("uploadedResume", JSON.stringify(updatedUploadInfo))
      
      // Mark that we've seen the resume prompt
      setHasSeenResumePrompt(true)
      localStorage.setItem('hasSeenResumePrompt', 'true')

      setShowVerificationModal(false)
      setShowResumeUploadModal(false)
      console.log("Resume data verified and saved")
    }
  }

  // Handle job application
  const handleApplyToJob = (jobId: string): void => {
    // Check if user has uploaded a resume
    if (!state.resumeData) {
      setShowResumeUploadModal(true);
      return;
    }
    
    // Update jobs to mark the selected job as applied
    updateJobs((prevJobs: Job[]) => 
      prevJobs.map((job: Job) => 
        job.id === jobId ? { ...job, applied: true } : job
      )
    );
    
    // Add to applications
    const foundJob = state.jobs.find((j: Job) => j.id === jobId);
    if (foundJob) {
      const newApplication: Application = {
        id: `app-${Date.now()}`,
        jobTitle: foundJob.title,
        company: foundJob.company,
        status: 'Applied',
        appliedDate: new Date().toISOString().split('T')[0],
        statusColor: 'info'
      };
      
      updateApplications((prev: Application[]) => [...prev, newApplication]);
    }
  }

  const handleSaveJob = (jobId: string) => {
    updateJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId ? { ...job, saved: !job.saved } : job
      )
    );
  };

  const handleLogout = (): void => {
    localStorage.clear()
    localStorage.removeItem("selectedRole")
    navigate("/auth")
  }

  const getMatchColor = (percentage: number): string => {
    if (percentage >= 90) return styles.matchHigh
    if (percentage >= 80) return styles.matchMedium
    return styles.matchLow
  }

  const filteredJobs = state.jobs.filter(
    (job: Job) =>
      job.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(state.searchQuery.toLowerCase())
  )

  // Render functions - defined before usage
  const renderOverview = (): JSX.Element => (
    <div className={styles.overviewContent}>
      <div className={styles.welcomeSection}>
        <div className={styles.welcomeText}>
          <h2>Welcome back, {state.resumeData?.personalInfo.name || "Job Seeker"}! 👋</h2>
          <p>Here's what's happening with your job search today.</p>
        </div>
        <div className={styles.quickActions}>
          <button className={styles.primaryButton} onClick={() => setActiveTab("jobs")}>
            Browse Jobs
          </button>
          <button className={styles.secondaryButton} onClick={() => setActiveTab("profile")}>
            Update Profile
          </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: "#e3f2fd" }}>
            <span style={{ color: "#1976d2" }}>📊</span>
          </div>
          <div className={styles.statInfo}>
            <h3>Profile Completion</h3>
            <p className={styles.statValue}>{state.resumeData ? "100%" : "60%"}</p>
            <span className={styles.statChange}>+5% from last week</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: "#f3e5f5" }}>
            <span style={{ color: "#7b1fa2" }}>📄</span>
          </div>
          <div className={styles.statInfo}>
            <h3>Applications</h3>
            <p className={styles.statValue}>{state.applications.length}</p>
            <span className={styles.statChange}>+2 this week</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: "#e8f5e8" }}>
            <span style={{ color: "#388e3c" }}>💼</span>
          </div>
          <div className={styles.statInfo}>
            <h3>Job Matches</h3>
            <p className={styles.statValue}>{state.jobs.length}</p>
            <span className={styles.statChange}>+3 new matches</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: "#fff3e0" }}>
            <span style={{ color: "#f57c00" }}>⭐</span>
          </div>
          <div className={styles.statInfo}>
            <h3>Profile Views</h3>
            <p className={styles.statValue}>24</p>
            <span className={styles.statChange}>+8 this week</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderJobs = (): JSX.Element => (
    <div className={styles.jobsContent}>
      <div className={styles.jobsHeader}>
        <h2>Job Recommendations</h2>
        <div className={styles.jobsControls}>
          <button className={styles.filterButton} onClick={() => setShowFilters(!state.showFilters)}>
            <FilterIcon />
            Filters
          </button>
        </div>
      </div>
      <div className={styles.jobsList}>
        {filteredJobs.map((job: Job) => (
          <div key={job.id} className={styles.jobCard}>
            <div className={styles.jobHeader}>
              <h3>{job.title}</h3>
              <button 
                className={styles.saveButton}
                onClick={() => handleSaveJob(job.id)}
              >
                <BookmarkIcon filled={job.saved} />
              </button>
            </div>
            <p className={styles.jobCompany}>{job.company}</p>
            <div className={styles.jobDetails}>
              <span className={styles.jobLocation}>
                <LocationIcon />
                {job.location}
              </span>
              <span className={styles.jobSalary}>
                <SalaryIcon />
                {job.salary}
              </span>
              <span className={styles.jobType}>
                <ClockIcon />
                {job.type}
              </span>
            </div>
            <p className={styles.jobDescription}>{job.description}</p>
            {job.matchPercentage && (
              <div className={styles.jobMatch}>
                <span className={`${styles.matchBadge} ${getMatchColor(job.matchPercentage)}`}>
                  {job.matchPercentage}% Match
                </span>
              </div>
            )}
            <div className={styles.jobActions}>
              <button 
                className={styles.applyButton}
                onClick={() => handleApplyToJob(job)}
                disabled={job.applied}
              >
                {job.applied ? 'Applied' : 'Apply Now'}
              </button>
              <button className={styles.viewButton}>View Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderApplications = (): JSX.Element => (
    <div className={styles.applicationsContent}>
      <div className={styles.applicationsHeader}>
        <h2>My Applications</h2>
        <p>{state.applications.length} applications submitted</p>
      </div>
      <div className={styles.applicationsList}>
        {state.applications.map((app: Application) => (
          <div key={app.id} className={styles.applicationCard}>
            <div className={styles.applicationHeader}>
              <h3>{app.jobTitle}</h3>
              <span className={`${styles.statusBadge} ${app.statusColor}`}>
                {app.status}
              </span>
            </div>
            <p className={styles.applicationCompany}>{app.company}</p>
            <p className={styles.applicationDate}>Applied on {app.appliedDate}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfile = (): JSX.Element => (
    <div className={styles.profileContent}>
      <div className={styles.profileHeader}>
        <h2>My Profile</h2>
        {!state.resumeData ? (
          <button 
            className={styles.uploadButton}
            onClick={() => setShowResumeUploadModal(true)}
          >
            Upload Resume
          </button>
        ) : (
          <button className={styles.editButton}>Edit Profile</button>
        )}
      </div>
      {state.resumeData && (
        <div className={styles.profileDetails}>
          <div className={styles.profileSection}>
            <h3>Personal Information</h3>
            <p><strong>Name:</strong> {state.resumeData.personalInfo?.name}</p>
            <p><strong>Email:</strong> {state.resumeData.personalInfo?.email}</p>
            <p><strong>Phone:</strong> {state.resumeData.personalInfo?.phone}</p>
            <p><strong>Address:</strong> {state.resumeData.personalInfo?.address}</p>
          </div>
          
          <div className={styles.profileSection}>
            <h3>Summary</h3>
            <p>{state.resumeData.summary}</p>
          </div>

          <div className={styles.profileSection}>
            <h3>Experience</h3>
            {state.resumeData.experience?.map((exp: any, index: number) => (
              <div key={index} className={styles.experienceItem}>
                <h4>{exp.position} at {exp.company}</h4>
                <p className={styles.duration}>{exp.duration}</p>
                <p>{exp.description}</p>
              </div>
            ))}
          </div>

          <div className={styles.profileSection}>
            <h3>Education</h3>
            {state.resumeData.education?.map((edu: any, index: number) => (
              <div key={index} className={styles.educationItem}>
                <h4>{edu.degree}</h4>
                <p>{edu.institution} - {edu.year}</p>
              </div>
            ))}
          </div>

          <div className={styles.profileSection}>
            <h3>Skills</h3>
            <div className={styles.skillsList}>
              {state.resumeData.skills?.map((skill: string, index: number) => (
                <span key={index} className={styles.skillTag}>{skill}</span>
              ))}
            </div>
          </div>

          {state.resumeData.certifications && state.resumeData.certifications.length > 0 && (
            <div className={styles.profileSection}>
              <h3>Certifications</h3>
              <ul>
                {state.resumeData.certifications.map((cert: string, index: number) => (
                  <li key={index}>{cert}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderResumeUploadModal = (): JSX.Element => (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Upload Your Resume</h3>
          <button 
            className={styles.closeButton}
            onClick={() => setShowResumeUploadModal(false)}
          >
            <CloseIcon />
          </button>
        </div>
        <div className={styles.modalContent}>
          <p>Upload your resume to get personalized job recommendations and apply to positions.</p>
          <div className={styles.uploadArea}>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleResumeUpload}
              className={styles.fileInput}
            />
            <p>Drag and drop your resume here, or click to browse</p>
            <p className={styles.fileTypes}>Supported formats: PDF, DOC, DOCX</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVerificationModal = (): JSX.Element => (
    <div className={styles.modalOverlay}>
      {state.showVerificationModal && state.editableResumeData && (
        <div className={styles.verificationModal}>
          <div className={styles.modalHeader}>
            <h3>Verify Your Resume Information</h3>
            <button 
              className={styles.closeButton}
              onClick={() => setShowVerificationModal(false)}
            >
              <CloseIcon />
            </button>
          </div>
          <div className={styles.modalContent}>
            <p>Please review and edit your resume information as needed:</p>
            
            <div className={styles.editSection}>
              <h4>Personal Information</h4>
              <input
                type="text"
                placeholder="Full Name"
                value={state.editableResumeData.personalInfo?.name || ''}
                onChange={(e) => updateEditableResumeData('personalInfo', 'name', e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                value={state.editableResumeData.personalInfo?.email || ''}
                onChange={(e) => updateEditableResumeData('personalInfo', 'email', e.target.value)}
              />
              <input
                type="tel"
                placeholder="Phone"
                value={state.editableResumeData.personalInfo?.phone || ''}
                onChange={(e) => updateEditableResumeData('personalInfo', 'phone', e.target.value)}
              />
              <input
                type="text"
                placeholder="Address"
                value={state.editableResumeData.personalInfo?.address || ''}
                onChange={(e) => updateEditableResumeData('personalInfo', 'address', e.target.value)}
              />
            </div>

            <div className={styles.editSection}>
              <h4>Summary</h4>
              <textarea
                placeholder="Professional Summary"
                value={state.editableResumeData.summary || ''}
                onChange={(e) => updateEditableResumeData('summary', '', e.target.value)}
                rows={4}
              />
            </div>

            <div className={styles.editSection}>
              <h4>Skills</h4>
              <div className={styles.skillsEdit}>
                {state.editableResumeData.skills?.map((skill: string, index: number) => (
                  <div key={index} className={styles.skillEditItem}>
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => {
                        const newSkills = [...(state.editableResumeData?.skills || [])];
                        newSkills[index] = e.target.value;
                        updateEditableResumeData('skills', '', newSkills);
                      }}
                    />
                    <button
                      onClick={() => {
                        const newSkills = state.editableResumeData?.skills?.filter((_, i) => i !== index) || [];
                        updateEditableResumeData('skills', '', newSkills);
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.modalActions}>
              <button 
                className={styles.cancelButton}
                onClick={() => setShowVerificationModal(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.saveButton}
                onClick={handleVerifyResumeData}
              >
                Save & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Main component render
  return (
    <div className={styles.dashboard}>
      {/* Sidebar */}
      <div className={`${styles.sidebar} ${state.sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <h2>JobSeeker</h2>
          <button className={styles.closeSidebar} onClick={() => setSidebarOpen(false)}>
            <CloseIcon />
          </button>
        </div>
        <nav className={styles.nav}>
          <button
            className={`${styles.navItem} ${state.activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <DashboardIcon />
            <span>Overview</span>
          </button>
          <button
            className={`${styles.navItem} ${state.activeTab === 'jobs' ? styles.active : ''}`}
            onClick={() => setActiveTab('jobs')}
          >
            <JobsIcon />
            <span>Jobs</span>
          </button>
          <button
            className={`${styles.navItem} ${state.activeTab === 'applications' ? styles.active : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            <ApplicationsIcon />
            <span>Applications</span>
          </button>
          <button
            className={`${styles.navItem} ${state.activeTab === 'profile' ? styles.active : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <ProfileIcon />
            <span>Profile</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.menuButton} onClick={() => setSidebarOpen(true)}>
              <MenuIcon />
            </button>
            <div className={styles.searchBar}>
              <SearchIcon />
              <input
                type="text"
                placeholder="Search jobs..."
                value={state.searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.headerRight}>
            <button className={styles.notificationButton}>
              <NotificationIcon />
              {state.notifications > 0 && <span className={styles.notificationBadge}>{state.notifications}</span>}
            </button>
            <div className={styles.userAvatar}>
              <span>{state.resumeData?.personalInfo?.name?.charAt(0) || 'U'}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className={styles.pageContent}>
          {state.activeTab === 'overview' && renderOverview()}
          {state.activeTab === 'jobs' && renderJobs()}
          {state.activeTab === 'applications' && renderApplications()}
          {state.activeTab === 'profile' && renderProfile()}
        </div>
      </div>

      {/* Modals */}
      {state.showResumeUploadModal && renderResumeUploadModal()}
      {state.showVerificationModal && renderVerificationModal()}
      {state.isProcessing && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
          <p>Processing your resume...</p>
        </div>
      )}
    </div>
  )


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      try {
        const parsedData = await parseResume(file);
        setEditableResumeData(parsedData);
        setShowVerificationModal(true);
      } catch (error) {
        console.error("Error parsing resume:", error);
      } finally {
        setIsProcessing(false);
      }
    }
  }

  const renderJobCard = (job: Job) => {
    const formattedDate = new Date(job.postedDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    return (
      <div className={styles.jobCard}>
        <div className={styles.jobHeader}>
          <h3>{job.title}</h3>
          <div className={styles.jobCompany}>{job.company}</div>
          <div className={styles.jobLocation}>{job.location}</div>
          {job.matchPercentage && (
            <div className={`${styles.matchBadge} ${getMatchColor(job.matchPercentage)}`}>
              {job.matchPercentage}% Match
            </div>
          )}
        </div>
        <div className={styles.jobDetails}>
          <span className={styles.jobType}>{job.type}</span>
          <span className={styles.jobSalary}>{job.salary}</span>
          <span className={styles.jobPosted}>Posted {formattedDate}</span>
        </div>
        <p className={styles.jobDescription}>{job.description}</p>
        <div className={styles.jobActions}>
          <button
            className={`${styles.primaryButton} ${job.applied ? styles.appliedButton : ''}`}
            onClick={() => handleApplyToJob(job.id)}
            disabled={job.applied}
          >
            {job.applied ? 'Applied' : 'Apply Now'}
          </button>
          <button
            className={`${styles.secondaryButton} ${job.saved ? styles.savedButton : ''}`}
            onClick={() => handleSaveJob(job.id)}
          >
            {job.saved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>
    );
  };

  const renderJobs = (): JSX.Element => {
    const filteredJobs = state.jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(state.searchQuery.toLowerCase())
    );

    return (
      <div className={styles.jobsContent}>
        <h2>Available Jobs</h2>
        <div className={styles.jobList}>
          {filteredJobs.map((job) => (
            <div key={job.id} className={styles.jobCard}>
              <div className={styles.jobHeader}>
                <h3>{job.title}</h3>
                <div className={styles.jobCompany}>{job.company}</div>
                <div className={styles.jobLocation}>{job.location}</div>
                {job.matchPercentage && (
                  <div className={`${styles.matchBadge} ${getMatchColor(job.matchPercentage)}`}>
                    {job.matchPercentage}% Match
                  </div>
                )}
              </div>
              <div className={styles.jobDetails}>
                <span className={styles.jobType}>{job.type}</span>
                <span className={styles.jobSalary}>{job.salary}</span>
                <span className={styles.jobPosted}>Posted {job.posted}</span>
              </div>
              <p className={styles.jobDescription}>{job.description}</p>
              <div className={styles.jobActions}>
                <button
                  className={`${styles.primaryButton} ${job.applied ? styles.appliedButton : ''}`}
                  onClick={() => handleApplyToJob(job.id)}
                  disabled={job.applied}
                >
                  {job.applied ? 'Applied' : 'Apply Now'}
                </button>
                <button
                  className={`${styles.secondaryButton} ${job.saved ? styles.savedButton : ''}`}
                  onClick={() => handleSaveJob(job.id)}
                >
                  {job.saved ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderApplications = (): JSX.Element => {
    if (!applications.length) {
      return (
        <div className={styles.noApplications}>
          <p>You haven't applied to any jobs yet.</p>
          <button
            className={styles.primaryButton}
            onClick={() => setActiveTab('jobs')}
          >
            Browse Jobs
          </button>
        </div>
      );
    }

    return (
      <div className={styles.applicationsContent}>
        <h2>Your Applications</h2>
        <div className={styles.applicationsList}>
          {applications.map((app) => (
            <div key={app.id} className={styles.applicationCard}>
              <div className={styles.applicationHeader}>
                <h3>{app.jobTitle}</h3>
                <span className={`${styles.statusBadge} ${styles[app.statusColor]}`}>
                  {app.status}
                </span>
              </div>
              <p className={styles.companyName}>{app.company}</p>
              <p className={styles.appliedDate}>Applied on {app.appliedDate}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProfile = (): JSX.Element => {
    if (!resumeData) {
      return (
        <div className={styles.noResume}>
          <p>You haven't uploaded your resume yet.</p>
          <button
            className={styles.primaryButton}
            onClick={() => setShowResumeUploadModal(true)}
          >
            Upload Resume
          </button>
        </div>
      );
    }

    return (
      <div className={styles.profileContent}>
        <h2>Your Profile</h2>
        <div className={styles.profileHeader}>
          <div className={styles.avatarLarge}>
            {resumeData.personalInfo.name.charAt(0)}
          </div>
          <div>
            <h3>{resumeData.personalInfo.name}</h3>
            <p className={styles.profileEmail}>{resumeData.personalInfo.email}</p>
            <p className={styles.profileContact}>
              {resumeData.personalInfo.phone} • {resumeData.personalInfo.address}
            </p>
          </div>
        </div>
        
        <div className={styles.profileSection}>
          <h4>Professional Summary</h4>
          <p>{resumeData.summary}</p>
        </div>

        <div className={styles.profileSection}>
          <h4>Work Experience</h4>
          {resumeData.experience.map((exp, index) => (
            <div key={index} className={styles.experienceItem}>
              <h5>{exp.position}</h5>
              <p className={styles.companyName}>{exp.company}</p>
              <p className={styles.duration}>{exp.duration}</p>
              <p>{exp.description}</p>
            </div>
          ))}
        </div>

        <div className={styles.profileSection}>
          <h4>Education</h4>
          {resumeData.education.map((edu, index) => (
            <div key={index} className={styles.educationItem}>
              <h5>{edu.degree}</h5>
              <p className={styles.institution}>{edu.institution}</p>
              <p className={styles.year}>{edu.year}</p>
            </div>
          ))}
        </div>

        <div className={styles.profileSection}>
          <h4>Skills</h4>
          <div className={styles.skillsList}>
            {resumeData.skills.map((skill, index) => (
              <span key={index} className={styles.skillTag}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        {resumeData.certifications && resumeData.certifications.length > 0 && (
          <div className={styles.profileSection}>
            <h4>Certifications</h4>
            <ul className={styles.certificationsList}>
              {resumeData.certifications.map((cert, index) => (
                <li key={index}>{cert}</li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.profileActions}>
          <button
            className={styles.editButton}
            onClick={() => setShowResumeUploadModal(true)}
          >
            Update Resume
          </button>
          <button className={styles.logoutButton} onClick={() => navigate('/login')}>
            Logout
          </button>
        </div>
      </div>
    );
  };

  const renderVerificationModal = (): JSX.Element | null => {
    // ... existing code
  };

  const renderResumeUploadModal = (): JSX.Element | null => {
    // ... existing code
  };
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <h2>📄 Upload Your Resume</h2>
          <p className={styles.modalDescription}>
            Uploading your resume helps us find the best job matches for your skills and experience. 
            We'll use AI to analyze your qualifications and recommend relevant positions.
          We'll use AI to analyze your qualifications and recommend relevant positions.
        </p>
        
        <div className={styles.benefitsList}>
          <div className={styles.benefitItem}>
            <span className={styles.benefitIcon}>✨</span>
            <span>Get personalized job recommendations</span>
          </div>
          <div className={styles.benefitItem}>
            <span className={styles.benefitIcon}>⚡</span>
            <span>Apply to jobs faster with one-click applications</span>
          </div>
          <div className={styles.benefitItem}>
            <span className={styles.benefitIcon}>📊</span>
            <span>See how well you match with job requirements</span>
          </div>
        </div>
        
        <div className={styles.uploadArea}>
          <input
            type="file"
            id="resume-upload"
            accept=".pdf,.doc,.docx"
            className={styles.fileInput}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) {
                setIsProcessing(true);
                try {
                  const parsedData = await parseResume(file);
                  setEditableResumeData(parsedData);
                  setShowVerificationModal(true);
                } catch (error) {
                  console.error("Error parsing resume:", error);
                } finally {
                  setIsProcessing(false);
                }
              }
            }}
          />
          <label htmlFor="resume-upload" className={styles.uploadButton}>
            {isProcessing ? 'Processing...' : 'Upload Resume'}
          </label>
          <p className={styles.fileTypes}>Supports PDF, DOC, DOCX (Max 5MB)</p>
        </div>
        
        <div className={styles.modalFooter}>
          <button 
            className={styles.skipButton}
            onClick={() => {
              setShowResumeUploadModal(false);
              setHasSeenResumePrompt(true);
              localStorage.setItem('hasSeenResumePrompt', 'true');
            }}
          >
            Skip for Now
          </button>
          <p className={styles.reminderText}>
            You can upload your resume later, but it's required to apply for jobs.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.dashboard}>
      {/* Resume Upload Modal */}
      {showResumeUploadModal && renderResumeUploadModal()}
      
      {/* Mobile Header */}
      <header className={styles.mobileHeader}>
        <button className={styles.menuButton} onClick={() => setSidebarOpen(!sidebarOpen)}>
          <MenuIcon />
        </button>
        <div className={styles.logo}>
          <h1>PESO</h1>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.notificationButton}>
            <NotificationIcon />
            {notifications > 0 && <span className={styles.notificationBadge}>{notifications}</span>}
          </button>
        </div>
      </header>

      <div className={styles.dashboardLayout}>
        {/* Resume Upload Modal */}
        {showResumeUploadModal && renderResumeUploadModal()}

        {/* Sidebar */}
        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
          <div className={styles.sidebarHeader}>
            <div className={styles.logo}>
              <h1>PESO Dashboard</h1>
            </div>
            <button className={styles.closeSidebar} onClick={() => setSidebarOpen(false)}>
              <CloseIcon />
            </button>
          </div>

          <div className={styles.userProfile}>
            <div className={styles.userAvatar}>
              <img src="/diverse-user-avatars.png" alt="User" />
            </div>
            <div className={styles.userInfo}>
              <h3>{resumeData?.personalInfo.name || "Job Seeker"}</h3>
              <p>{resumeData?.personalInfo.email || "user@example.com"}</p>
            </div>
          </div>

          <nav className={styles.navigation}>
            <button
              className={`${styles.navItem} ${activeTab === "overview" ? styles.active : ""}`}
              onClick={() => {
                setActiveTab("overview")
                setSidebarOpen(false)
              }}
            >
              <DashboardIcon />
              <span>Overview</span>
            </button>
            <button
              className={`${styles.navItem} ${activeTab === "jobs" ? styles.active : ""}`}
              onClick={() => {
                setActiveTab("jobs")
                setSidebarOpen(false)
              }}
            >
              <JobsIcon />
              <span>Jobs</span>
              <span className={styles.navBadge}>{jobs.length}</span>
            </button>
            <button
              className={`${styles.navItem} ${activeTab === "applications" ? styles.active : ""}`}
              onClick={() => {
                setActiveTab("applications")
                setSidebarOpen(false)
              }}
            >
              <ApplicationsIcon />
              <span>Applications</span>
              <span className={styles.navBadge}>{applications.length}</span>
            </button>
            <button
              className={`${styles.navItem} ${activeTab === "profile" ? styles.active : ""}`}
              onClick={() => {
                setActiveTab("profile")
                setSidebarOpen(false)
              }}
            >
              <ProfileIcon />
              <span>Profile</span>
            </button>
          </nav>

          <div className={styles.sidebarFooter}>
            <button className={styles.logoutButton} onClick={handleLogout}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className={styles.mainContent}>
          {isProcessing && (
            <div className={styles.processingBanner}>
              <div className={styles.processingContent}>
                <div className={styles.spinner}></div>
                <span>Processing your resume with OCR technology...</span>
              </div>
            </div>
          )}

          <div className={styles.contentWrapper}>
            {activeTab === "overview" && renderOverview()}
            {activeTab === "jobs" && renderJobs()}
            {activeTab === "applications" && renderApplications()}
            {activeTab === "profile" && renderProfile()}
          </div>
        </main>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)} />}

      {/* Resume Verification Modal */}
      {showVerificationModal && editableResumeData && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Verify Your Resume Data</h3>
              <p>Please review and edit the information extracted from your resume:</p>
            </div>

            <div className={styles.modalContent}>
              <div className={styles.editSection}>
                <h4>Personal Information</h4>
                <div className={styles.editGrid}>
                  <div className={styles.editField}>
                    <label>Name:</label>
                    <input
                      type="text"
                      value={editableResumeData.personalInfo.name}
                      onChange={(e) => updateEditableResumeData("personalInfo", "name", e.target.value)}
                    />
                  </div>
                  <div className={styles.editField}>
                    <label>Email:</label>
                    <input
                      type="email"
                      value={editableResumeData.personalInfo.email}
                      onChange={(e) => updateEditableResumeData("personalInfo", "email", e.target.value)}
                    />
                  </div>
                  <div className={styles.editField}>
                    <label>Phone:</label>
                    <input
                      type="text"
                      value={editableResumeData.personalInfo.phone}
                      onChange={(e) => updateEditableResumeData("personalInfo", "phone", e.target.value)}
                    />
                  </div>
                  <div className={styles.editField}>
                    <label>Address:</label>
                    <input
                      type="text"
                      value={editableResumeData.personalInfo.address}
                      onChange={(e) => updateEditableResumeData("personalInfo", "address", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className={styles.editSection}>
                <h4>Summary</h4>
                <textarea
                  value={editableResumeData.summary}
                  onChange={(e) =>
                    setEditableResumeData((prev) => (prev ? { ...prev, summary: e.target.value } : null))
                  }
                  rows={4}
                />
              </div>

              <div className={styles.editSection}>
                <h4>Skills</h4>
                <div className={styles.skillsEdit}>
                  {editableResumeData.skills.map((skill, index) => (
                    <span key={index} className={styles.skillTag}>
                      {skill}
                    </span>
                  ))}
                </div>
                <p className={styles.editNote}>Skills extracted: {editableResumeData.skills.length} items</p>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.cancelButton} onClick={() => setShowVerificationModal(false)}>
                Cancel
              </button>
              <button className={styles.confirmButton} onClick={handleVerifyResumeData}>
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard;
