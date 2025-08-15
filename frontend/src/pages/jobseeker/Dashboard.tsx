"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import styles from "./Dashboard.module.css"
import { parseResume } from "../../utils/resumeParser"

// Types
interface ParsedResume {
  personalInfo: {
    name: string
    email: string
    phone: string
    address: string
  }
  summary: string
  experience: Array<{
    company: string
    position: string
    duration: string
    description: string
  }>
  education: Array<{
    institution: string
    degree: string
    year: string
  }>
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

const Dashboard: React.FC = () => {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")
  const [resumeData, setResumeData] = useState<ParsedResume | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [editableResumeData, setEditableResumeData] = useState<ParsedResume | null>(null)
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [resumeUploadInfo, setResumeUploadInfo] = useState<ResumeUploadData | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications] = useState(3) // Mock notification count

  useEffect(() => {
    checkExistingResume()
    loadJobs()
    loadApplications()
  }, [])

  const checkExistingResume = async () => {
    console.log("Checking for existing resume data...")

    // First, check for pending resume upload from signup
    const pendingUpload = localStorage.getItem("pendingResumeUpload")
    const pendingFile = localStorage.getItem("pendingResumeFile")

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

  const handleVerifyResumeData = () => {
    if (editableResumeData) {
      setResumeData(editableResumeData)
      localStorage.setItem("resumeData", JSON.stringify(editableResumeData))

      // Update upload info to mark as processed
      const updatedUploadInfo = {
        ...resumeUploadInfo!,
        processed: true,
        needsProcessing: false,
      }
      setResumeUploadInfo(updatedUploadInfo)
      localStorage.setItem("uploadedResume", JSON.stringify(updatedUploadInfo))

      setShowVerificationModal(false)
      console.log("Resume data verified and saved")
    }
  }

  const updateEditableResumeData = (section: keyof ParsedResume, field: string, value: any) => {
    if (!editableResumeData) return

    setEditableResumeData((prev) => {
      if (!prev) return null

      const currentSection = prev[section]

      // Type check to ensure currentSection exists and is an object
      if (!currentSection || typeof currentSection !== "object") return prev

      // Additional check to ensure it's not an array
      if (Array.isArray(currentSection)) return prev

      return {
        ...prev,
        [section]: {
          ...currentSection,
          [field]: value,
        },
      }
    })
  }

  const handleApplyToJob = (jobId: string) => {
    setJobs((prevJobs) => prevJobs.map((job) => (job.id === jobId ? { ...job, applied: true } : job)))

    // Add to applications
    const job = jobs.find((j) => j.id === jobId)
    if (job) {
      const newApplication = {
        id: jobId,
        jobTitle: job.title,
        company: job.company,
        status: "Under Review",
        appliedDate: new Date().toISOString().split("T")[0],
        statusColor: "warning",
      }
      setApplications((prev) => [newApplication, ...prev])
    }
  }

  const handleSaveJob = (jobId: string) => {
    setJobs((prevJobs) => prevJobs.map((job) => (job.id === jobId ? { ...job, saved: !job.saved } : job)))
  }

  const handleLogout = () => {
    localStorage.clear()
    localStorage.removeItem("selectedRole")
    navigate("/auth")
  }

  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return styles.matchHigh
    if (percentage >= 80) return styles.matchMedium
    return styles.matchLow
  }

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const renderOverview = () => (
    <div className={styles.overviewContent}>
      <div className={styles.welcomeSection}>
        <div className={styles.welcomeText}>
          <h2>Welcome back, {resumeData?.personalInfo.name || "Job Seeker"}! 👋</h2>
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
            <p className={styles.statValue}>{resumeData ? "100%" : "60%"}</p>
            <span className={styles.statChange}>+5% from last week</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: "#f3e5f5" }}>
            <span style={{ color: "#7b1fa2" }}>📄</span>
          </div>
          <div className={styles.statInfo}>
            <h3>Applications</h3>
            <p className={styles.statValue}>{applications.length}</p>
            <span className={styles.statChange}>+2 this week</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: "#e8f5e8" }}>
            <span style={{ color: "#388e3c" }}>💼</span>
          </div>
          <div className={styles.statInfo}>
            <h3>Job Matches</h3>
            <p className={styles.statValue}>{jobs.length}</p>
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

      <div className={styles.dashboardGrid}>
        <div className={styles.recentActivity}>
          <div className={styles.sectionHeader}>
            <h3>Recent Activity</h3>
            <button className={styles.viewAllButton}>View All</button>
          </div>
          <div className={styles.activityList}>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon} style={{ backgroundColor: "#e8f5e8" }}>
                <span style={{ color: "#388e3c" }}>📄</span>
              </div>
              <div className={styles.activityContent}>
                <p>
                  <strong>Applied to Senior Software Developer</strong>
                </p>
                <p>at Tech Innovations Inc.</p>
                <span className={styles.activityTime}>2 hours ago</span>
              </div>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon} style={{ backgroundColor: "#e3f2fd" }}>
                <span style={{ color: "#1976d2" }}>👁️</span>
              </div>
              <div className={styles.activityContent}>
                <p>
                  <strong>Profile viewed</strong>
                </p>
                <p>by Digital Solutions Corp</p>
                <span className={styles.activityTime}>1 day ago</span>
              </div>
            </div>
            <div className={styles.activityItem}>
              <div className={styles.activityIcon} style={{ backgroundColor: "#fff3e0" }}>
                <span style={{ color: "#f57c00" }}>💾</span>
              </div>
              <div className={styles.activityContent}>
                <p>
                  <strong>Saved Frontend Developer</strong>
                </p>
                <p>at Creative Agency Manila</p>
                <span className={styles.activityTime}>2 days ago</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.topMatches}>
          <div className={styles.sectionHeader}>
            <h3>Top Job Matches</h3>
            <button className={styles.viewAllButton} onClick={() => setActiveTab("jobs")}>
              View All
            </button>
          </div>
          <div className={styles.matchesList}>
            {jobs.slice(0, 3).map((job) => (
              <div key={job.id} className={styles.matchItem}>
                <div className={styles.matchInfo}>
                  <h4>{job.title}</h4>
                  <p>{job.company}</p>
                  <div className={styles.matchMeta}>
                    <span className={styles.location}>
                      <LocationIcon />
                      {job.location}
                    </span>
                    <span className={`${styles.matchBadge} ${getMatchColor(job.matchPercentage!)}`}>
                      {job.matchPercentage}% match
                    </span>
                  </div>
                </div>
                <button
                  className={styles.quickApplyButton}
                  onClick={() => handleApplyToJob(job.id)}
                  disabled={job.applied}
                >
                  {job.applied ? "Applied" : "Quick Apply"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  const renderJobs = () => (
    <div className={styles.jobsContent}>
      <div className={styles.jobsHeader}>
        <div className={styles.jobsTitle}>
          <h2>Job Recommendations</h2>
          <p>Personalized job matches based on your profile</p>
        </div>
        <div className={styles.jobsActions}>
          <div className={styles.searchBar}>
            <SearchIcon />
            <input
              type="text"
              placeholder="Search jobs, companies, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className={styles.filterButton} onClick={() => setShowFilters(!showFilters)}>
            <FilterIcon />
            Filters
          </button>
        </div>
      </div>

      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGroup}>
            <label>Job Type</label>
            <select>
              <option>All Types</option>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label>Location</label>
            <select>
              <option>All Locations</option>
              <option>Metro Manila</option>
              <option>Cebu</option>
              <option>Davao</option>
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label>Salary Range</label>
            <select>
              <option>Any Salary</option>
              <option>₱30,000 - ₱50,000</option>
              <option>₱50,000 - ₱80,000</option>
              <option>₱80,000+</option>
            </select>
          </div>
          <button className={styles.clearFilters}>Clear All</button>
        </div>
      )}

      <div className={styles.jobsGrid}>
        {filteredJobs.map((job) => (
          <div key={job.id} className={styles.jobCard}>
            <div className={styles.jobHeader}>
              <div className={styles.jobCompanyLogo}>
                <span>{job.company.charAt(0)}</span>
              </div>
              <div className={styles.jobActions}>
                <button
                  className={`${styles.saveButton} ${job.saved ? styles.saved : ""}`}
                  onClick={() => handleSaveJob(job.id)}
                >
                  <BookmarkIcon filled={job.saved} />
                </button>
                <div className={`${styles.matchBadge} ${getMatchColor(job.matchPercentage!)}`}>
                  {job.matchPercentage}% match
                </div>
              </div>
            </div>

            <div className={styles.jobInfo}>
              <h3>{job.title}</h3>
              <p className={styles.jobCompany}>{job.company}</p>

              <div className={styles.jobMeta}>
                <span className={styles.metaItem}>
                  <LocationIcon />
                  {job.location}
                </span>
                <span className={styles.metaItem}>
                  <SalaryIcon />
                  {job.salary}
                </span>
                <span className={styles.metaItem}>
                  <ClockIcon />
                  {job.type}
                </span>
              </div>

              <p className={styles.jobDescription}>{job.description}</p>

              <div className={styles.jobRequirements}>
                {job.requirements.slice(0, 4).map((req, index) => (
                  <span key={index} className={styles.requirementTag}>
                    {req}
                  </span>
                ))}
                {job.requirements.length > 4 && (
                  <span className={styles.moreRequirements}>+{job.requirements.length - 4} more</span>
                )}
              </div>
            </div>

            <div className={styles.jobFooter}>
              <span className={styles.postedDate}>Posted {job.postedDate}</span>
              <button
                className={`${styles.applyButton} ${job.applied ? styles.applied : ""}`}
                onClick={() => handleApplyToJob(job.id)}
                disabled={job.applied}
              >
                {job.applied ? "Applied ✓" : "Apply Now"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderApplications = () => (
    <div className={styles.applicationsContent}>
      <div className={styles.sectionHeader}>
        <h2>My Applications</h2>
        <p>Track your job application progress</p>
      </div>

      <div className={styles.applicationsList}>
        {applications.map((app) => (
          <div key={app.id} className={styles.applicationCard}>
            <div className={styles.applicationHeader}>
              <div className={styles.applicationCompanyLogo}>
                <span>{app.company.charAt(0)}</span>
              </div>
              <div className={styles.applicationInfo}>
                <h3>{app.jobTitle}</h3>
                <p>{app.company}</p>
                <span className={styles.appliedDate}>Applied on {new Date(app.appliedDate).toLocaleDateString()}</span>
              </div>
              <div className={styles.applicationStatus}>
                <span className={`${styles.statusBadge} ${styles[app.statusColor]}`}>{app.status}</span>
              </div>
            </div>

            <div className={styles.applicationActions}>
              <button className={styles.viewButton}>View Details</button>
              <button className={styles.withdrawButton}>Withdraw</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderProfile = () => (
    <div className={styles.profileContent}>
      <div className={styles.profileHeader}>
        <div className={styles.profileAvatar}>
          <img src="/diverse-user-avatars.png" alt="Profile" />
        </div>
        <div className={styles.profileInfo}>
          <h2>{resumeData?.personalInfo.name || "Your Name"}</h2>
          <p className={styles.profileEmail}>{resumeData?.personalInfo.email || "your.email@example.com"}</p>
          <p className={styles.profilePhone}>{resumeData?.personalInfo.phone || "+63 XXX XXX XXXX"}</p>
          <p className={styles.profileAddress}>{resumeData?.personalInfo.address || "Your Address"}</p>
        </div>
        <button className={styles.editProfileButton}>Edit Profile</button>
      </div>

      {resumeData ? (
        <div className={styles.profileSections}>
          <div className={styles.profileSection}>
            <h3>Professional Summary</h3>
            <p>{resumeData.summary}</p>
          </div>

          <div className={styles.profileSection}>
            <h3>Work Experience</h3>
            <div className={styles.experienceList}>
              {resumeData.experience.map((exp, index) => (
                <div key={index} className={styles.experienceItem}>
                  <div className={styles.experienceHeader}>
                    <h4>{exp.position}</h4>
                    <span className={styles.experienceDuration}>{exp.duration}</span>
                  </div>
                  <p className={styles.experienceCompany}>{exp.company}</p>
                  <p className={styles.experienceDescription}>{exp.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.profileSection}>
            <h3>Education</h3>
            <div className={styles.educationList}>
              {resumeData.education.map((edu, index) => (
                <div key={index} className={styles.educationItem}>
                  <h4>{edu.degree}</h4>
                  <p>{edu.institution}</p>
                  <span className={styles.educationYear}>{edu.year}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.profileSection}>
            <h3>Skills</h3>
            <div className={styles.skillsList}>
              {resumeData.skills.map((skill, index) => (
                <span key={index} className={styles.skillTag}>
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {resumeData.certifications.length > 0 && (
            <div className={styles.profileSection}>
              <h3>Certifications</h3>
              <div className={styles.certificationsList}>
                {resumeData.certifications.map((cert, index) => (
                  <div key={index} className={styles.certificationItem}>
                    <span>{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.noResumeData}>
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📄</div>
            <h3>No Resume Data Available</h3>
            <p>Upload your resume to see your complete profile information and get personalized job recommendations.</p>
            <button className={styles.uploadResumeButton}>Upload Resume</button>
          </div>

          {resumeUploadInfo && (
            <div className={styles.uploadInfo}>
              <h4>Resume Upload Status</h4>
              <p>
                <strong>File:</strong> {resumeUploadInfo.fileName}
              </p>
              <p>
                <strong>Uploaded:</strong> {new Date(resumeUploadInfo.uploadDate).toLocaleDateString()}
              </p>
              {resumeUploadInfo.needsProcessing && (
                <p className={styles.processingNote}>⏳ Resume is being processed...</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className={styles.dashboard}>
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

export default Dashboard
