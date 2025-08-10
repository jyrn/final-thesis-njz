"use client"

import type React from "react"
import { useState, useEffect } from "react"
import styles from "./Dashboard.module.css"
import { ResumeParser, type ParsedResume } from "../../utils/resumeParser"
import { JobService, type Job } from "../../services/jobService"

// SVG Icon Components (keeping existing icons)
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

const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
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

const MapPinIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
)

const DollarSignIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
  </svg>
)

const ClockIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
  </svg>
)

const BuildingIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
  </svg>
)

const StarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-5.46 4.73L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
)

const XIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
)

const UploadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
  </svg>
)

const FileTextIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
  </svg>
)

interface Application {
  id: number
  jobTitle: string
  company: string
  appliedDate: string
  status: "pending" | "accepted" | "rejected"
}

interface Notification {
  id: number
  type: "application" | "job_posted" | "status_change"
  title: string
  message: string
  timestamp: string
  read: boolean
}

interface OCRProgress {
  status: string
  progress: number
  message: string
}

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"home" | "notifications" | "applications" | "saved">("home")
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [userResume, setUserResume] = useState<ParsedResume | null>(null)
  const [resumeProcessing, setResumeProcessing] = useState(false)
  const [showResumeUpload, setShowResumeUpload] = useState(false)
  const [ocrProgress, setOcrProgress] = useState<OCRProgress | null>(null)

  // Add these state variables after the existing ones
  const [showResumeVerification, setShowResumeVerification] = useState(false)
  const [tempParsedResume, setTempParsedResume] = useState<ParsedResume | null>(null)
  const [editableResumeData, setEditableResumeData] = useState<ParsedResume | null>(null)

  // Filter states
  const [filters, setFilters] = useState({
    jobType: "",
    positionLevel: "",
    workplaceSetup: "",
    location: "",
    salaryRange: { min: "", max: "" },
  })

  const jobService = JobService.getInstance()
  const resumeParser = new ResumeParser()

  // Check if user has uploaded resume on component mount
  useEffect(() => {
    const checkExistingResume = async () => {
      // First check for pending resume upload from signup
      const pendingUpload = localStorage.getItem("pendingResumeUpload")
      const pendingFile = localStorage.getItem("pendingResumeFile")

      if (pendingUpload && pendingFile) {
        try {
          const uploadData = JSON.parse(pendingUpload)
          if (uploadData.needsProcessing) {
            console.log("Found pending resume from signup, processing now...")

            // Convert base64 back to file and process it
            const response = await fetch(pendingFile)
            const blob = await response.blob()
            const file = new File([blob], uploadData.fileName, { type: "application/pdf" })

            // Clean up pending data
            localStorage.removeItem("pendingResumeUpload")
            localStorage.removeItem("pendingResumeFile")

            // Process the resume with OCR
            handleResumeUpload(file)
            return
          }
        } catch (error) {
          console.error("Error processing pending resume:", error)
          localStorage.removeItem("pendingResumeUpload")
          localStorage.removeItem("pendingResumeFile")
        }
      }

      // Check if resume was uploaded during signup (legacy support)
      const uploadedResume = localStorage.getItem("uploadedResume")
      if (uploadedResume) {
        try {
          const resumeData = JSON.parse(uploadedResume)
          console.log("Found legacy resume data, creating mock parsed resume...")

          // Create a mock parsed resume for users who uploaded during signup (legacy)
          const mockParsedResume: ParsedResume = {
            personalInfo: {
              name: "User",
              email: "user@example.com",
              phone: "",
              location: "Philippines",
            },
            skills: ["JavaScript", "React", "HTML/CSS", "Node.js"],
            experience: [
              {
                title: "Software Developer",
                company: "Previous Company",
                duration: "2022 - Present",
                description: "Developed web applications and collaborated with cross-functional teams.",
              },
            ],
            education: [
              {
                degree: "Bachelor's Degree",
                institution: "University",
                year: "2020",
              },
            ],
            summary: "Experienced professional with strong technical skills and proven track record.",
            experienceLevel: "Mid-level",
            preferredJobTypes: ["Full-time"],
            ocrMetadata: {
              confidence: 85,
              quality: "good",
              wordCount: 250,
              processingTime: 2000,
            },
          }
          setUserResume(mockParsedResume)
          jobService.setUserResume(mockParsedResume)

          // Clean up legacy data
          localStorage.removeItem("uploadedResume")
          return
        } catch (error) {
          console.error("Error parsing uploaded resume:", error)
          localStorage.removeItem("uploadedResume")
        }
      }

      // Then check for processed resume
      const savedResume = localStorage.getItem("userResume")
      if (savedResume) {
        try {
          const parsedResume = JSON.parse(savedResume)
          console.log("Found saved parsed resume:", parsedResume)
          setUserResume(parsedResume)
          jobService.setUserResume(parsedResume)
        } catch (error) {
          console.error("Error parsing saved resume:", error)
          localStorage.removeItem("userResume")
          setShowResumeUpload(true)
        }
      } else {
        console.log("No resume found, showing upload modal")
        setShowResumeUpload(true)
      }
    }

    checkExistingResume()
  }, [])

  // Fetch jobs when resume is available
  useEffect(() => {
    const fetchJobs = async () => {
      if (!userResume && !showResumeUpload) return

      setLoading(true)
      try {
        const recommendedJobs = await jobService.getRecommendedJobs()
        setJobs(recommendedJobs)

        // Mock applications and notifications
        setApplications([
          {
            id: 1,
            jobTitle: "Frontend Developer",
            company: "Tech Solutions Inc.",
            appliedDate: "2024-01-15",
            status: "pending",
          },
          {
            id: 2,
            jobTitle: "React Developer",
            company: "Digital Agency Co.",
            appliedDate: "2024-01-10",
            status: "accepted",
          },
        ])

        setNotifications([
          {
            id: 1,
            type: "job_posted",
            title: "New high-match job available",
            message: `A new ${recommendedJobs[0]?.title} position at ${recommendedJobs[0]?.company} matches your profile (${recommendedJobs[0]?.matchPercentage}% match).`,
            timestamp: "2 hours ago",
            read: false,
          },
          {
            id: 2,
            type: "status_change",
            title: "Application accepted",
            message: "Congratulations! Your application for React Developer at Digital Agency Co. has been accepted.",
            timestamp: "1 day ago",
            read: false,
          },
        ])
      } catch (error) {
        console.error("Error fetching jobs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [userResume, showResumeUpload])

  // Replace the handleResumeUpload function
  const handleResumeUpload = async (file: File) => {
    console.log("Starting resume upload and OCR processing for:", file.name)
    setResumeProcessing(true)
    setOcrProgress(null)

    try {
      const parsedResume = await resumeParser.parseResumeFromPDF(file, (progress) => {
        console.log("OCR Progress:", progress)
        setOcrProgress(progress)
      })

      console.log("Resume parsed successfully:", parsedResume)

      // Store temporarily and show verification modal
      setTempParsedResume(parsedResume)
      setEditableResumeData({ ...parsedResume })
      setShowResumeVerification(true)
      setShowResumeUpload(false)
    } catch (error) {
      console.error("Error processing resume:", error)
      alert(`Error processing resume: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setResumeProcessing(false)
      setOcrProgress(null)
    }
  }

  // Add function to handle resume verification completion
  const handleResumeVerificationComplete = () => {
    if (editableResumeData) {
      console.log("Resume verification completed, saving data:", editableResumeData)
      setUserResume(editableResumeData)
      jobService.setUserResume(editableResumeData)

      // Save to localStorage
      localStorage.setItem("userResume", JSON.stringify(editableResumeData))
      setShowResumeVerification(false)

      // Show success notification
      const successNotification: Notification = {
        id: Date.now(),
        type: "application",
        title: "Resume verified successfully",
        message: `Your resume has been verified and saved. Found ${editableResumeData.skills.length} skills and ${editableResumeData.experience.length} work experiences.`,
        timestamp: "Just now",
        read: false,
      }

      setNotifications((prev) => [successNotification, ...prev])
    }
  }

  // Add function to update editable resume data
  const updateEditableResumeData = (field: keyof ParsedResume, value: any) => {
    if (editableResumeData) {
      setEditableResumeData({
        ...editableResumeData,
        [field]: value,
      })
    }
  }

  // Add function to update nested fields
  const updateNestedField = (section: string, field: string, value: any) => {
    if (editableResumeData) {
      const currentSection = editableResumeData[section as keyof ParsedResume]

      // Ensure the section exists and is an object before spreading
      if (currentSection && typeof currentSection === "object" && !Array.isArray(currentSection)) {
        setEditableResumeData({
          ...editableResumeData,
          [section]: {
            ...currentSection,
            [field]: value,
          },
        })
      }
    }
  }

  const handleSaveJob = (jobId: number) => {
    const updatedJob = jobService.toggleSaveJob(jobId)
    if (updatedJob) {
      setJobs((prevJobs) => prevJobs.map((job) => (job.id === jobId ? updatedJob : job)))
    }
  }

  const handleApplyJob = (jobId: number) => {
    const updatedJob = jobService.applyToJob(jobId)
    if (updatedJob) {
      setJobs((prevJobs) => prevJobs.map((job) => (job.id === jobId ? updatedJob : job)))

      // Add to applications
      const newApplication: Application = {
        id: applications.length + 1,
        jobTitle: updatedJob.title,
        company: updatedJob.company,
        appliedDate: new Date().toISOString().split("T")[0],
        status: "pending",
      }
      setApplications((prev) => [newApplication, ...prev])

      // Add notification
      const notification: Notification = {
        id: Date.now(),
        type: "application",
        title: "Application submitted",
        message: `Your application for ${updatedJob.title} at ${updatedJob.company} has been submitted successfully.`,
        timestamp: "Just now",
        read: false,
      }
      setNotifications((prev) => [notification, ...prev])
    }
  }

  const filteredJobs = jobService.searchJobs(searchQuery, filters)

  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return styles.matchHigh
    if (percentage >= 70) return styles.matchMedium
    return styles.matchLow
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return styles.statusAccepted
      case "rejected":
        return styles.statusRejected
      default:
        return styles.statusPending
    }
  }

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "excellent":
        return "#10b981"
      case "good":
        return "#3b82f6"
      case "fair":
        return "#f59e0b"
      case "poor":
        return "#ef4444"
      default:
        return "#6b7280"
    }
  }

  // Resume upload component with OCR progress
  const renderResumeUpload = () => (
    <div className={styles.resumeUploadOverlay}>
      <div className={styles.resumeUploadModal}>
        <div className={styles.modalHeader}>
          <FileTextIcon />
          <h2>Upload Your Resume (PDF Only)</h2>
        </div>

        <p>
          We use advanced OCR (Optical Character Recognition) technology to extract text from your PDF resume. This
          ensures accurate job matching based on your actual skills and experience.
        </p>

        <div className={styles.uploadArea}>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                // Triple validation like employer upload
                const allowedTypes = ["application/pdf"]

                // Check MIME type
                if (!allowedTypes.includes(file.type)) {
                  alert("Please upload only PDF files.")
                  e.target.value = "" // Clear the input
                  return
                }

                // Check file extension
                if (!file.name.toLowerCase().endsWith(".pdf")) {
                  alert("Please upload only PDF files.")
                  e.target.value = "" // Clear the input
                  return
                }

                // Check file size (max 10MB for OCR processing)
                if (file.size > 10 * 1024 * 1024) {
                  alert("File size must be less than 10MB for optimal OCR processing.")
                  e.target.value = "" // Clear the input
                  return
                }

                handleResumeUpload(file)
              }
            }}
            className={styles.fileInput}
            id="resumeUpload"
            disabled={resumeProcessing}
          />
          <label htmlFor="resumeUpload" className={styles.uploadLabel}>
            <UploadIcon />
            <span>{resumeProcessing ? "Processing PDF..." : "Choose PDF Resume"}</span>
            <small>PDF files only - OCR will extract text from images</small>
          </label>
        </div>

        {resumeProcessing && ocrProgress && (
          <div className={styles.processingStatus}>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${ocrProgress.progress}%` }} />
            </div>
            <div className={styles.progressInfo}>
              <span className={styles.progressText}>{ocrProgress.message}</span>
              <span className={styles.progressPercent}>{Math.round(ocrProgress.progress)}%</span>
            </div>
            <div className={styles.ocrSteps}>
              <div
                className={`${styles.step} ${ocrProgress.status === "converting" || ocrProgress.progress > 20 ? styles.active : ""}`}
              >
                📄 Converting PDF to images
              </div>
              <div
                className={`${styles.step} ${ocrProgress.status === "processing" || ocrProgress.progress > 50 ? styles.active : ""}`}
              >
                🔍 OCR text extraction
              </div>
              <div
                className={`${styles.step} ${ocrProgress.status === "parsing" || ocrProgress.progress > 90 ? styles.active : ""}`}
              >
                🧠 Analyzing resume content
              </div>
            </div>
          </div>
        )}

        <div className={styles.ocrInfo}>
          <h4>How OCR Works:</h4>
          <ul>
            <li>
              📄 <strong>PDF to Images:</strong> Each page is converted to high-resolution images
            </li>
            <li>
              🔍 <strong>Text Recognition:</strong> Tesseract OCR reads text from images
            </li>
            <li>
              🧠 <strong>Smart Parsing:</strong> AI extracts skills, experience, and education
            </li>
            <li>
              🎯 <strong>Job Matching:</strong> Personalized recommendations with match percentages
            </li>
          </ul>
        </div>

        <button className={styles.skipButton} onClick={() => setShowResumeUpload(false)} disabled={resumeProcessing}>
          Skip for now (limited functionality)
        </button>
      </div>
    </div>
  )

  // Resume verification component
  const renderResumeVerification = () => (
    <div className={styles.resumeUploadOverlay}>
      <div className={styles.resumeVerificationModal}>
        <div className={styles.modalHeader}>
          <FileTextIcon />
          <h2>Verify Your Resume Data</h2>
          <p>Please review and edit the information extracted from your resume</p>
        </div>

        {editableResumeData && (
          <div className={styles.verificationContent}>
            {/* Personal Information */}
            <div className={styles.verificationSection}>
              <h3>Personal Information</h3>
              <div className={styles.verificationGrid}>
                <div className={styles.verificationField}>
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={editableResumeData.personalInfo.name}
                    onChange={(e) => updateNestedField("personalInfo", "name", e.target.value)}
                    className={styles.verificationInput}
                  />
                </div>
                <div className={styles.verificationField}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={editableResumeData.personalInfo.email}
                    onChange={(e) => updateNestedField("personalInfo", "email", e.target.value)}
                    className={styles.verificationInput}
                  />
                </div>
                <div className={styles.verificationField}>
                  <label>Phone</label>
                  <input
                    type="text"
                    value={editableResumeData.personalInfo.phone}
                    onChange={(e) => updateNestedField("personalInfo", "phone", e.target.value)}
                    className={styles.verificationInput}
                  />
                </div>
                <div className={styles.verificationField}>
                  <label>Location</label>
                  <input
                    type="text"
                    value={editableResumeData.personalInfo.location}
                    onChange={(e) => updateNestedField("personalInfo", "location", e.target.value)}
                    className={styles.verificationInput}
                  />
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className={styles.verificationSection}>
              <h3>Skills</h3>
              <div className={styles.skillsEditor}>
                <textarea
                  value={editableResumeData.skills.join(", ")}
                  onChange={(e) =>
                    updateEditableResumeData(
                      "skills",
                      e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter((s) => s),
                    )
                  }
                  className={styles.skillsTextarea}
                  placeholder="Enter skills separated by commas"
                  rows={3}
                />
                <small>Separate skills with commas</small>
              </div>
            </div>

            {/* Experience Level */}
            <div className={styles.verificationSection}>
              <h3>Experience Level</h3>
              <select
                value={editableResumeData.experienceLevel}
                onChange={(e) => updateEditableResumeData("experienceLevel", e.target.value)}
                className={styles.verificationSelect}
              >
                <option value="Entry-level">Entry-level</option>
                <option value="Mid-level">Mid-level</option>
                <option value="Senior">Senior</option>
                <option value="Executive">Executive</option>
              </select>
            </div>

            {/* Summary */}
            <div className={styles.verificationSection}>
              <h3>Professional Summary</h3>
              <textarea
                value={editableResumeData.summary}
                onChange={(e) => updateEditableResumeData("summary", e.target.value)}
                className={styles.summaryTextarea}
                rows={4}
                placeholder="Enter your professional summary"
              />
            </div>

            {/* OCR Quality Info */}
            <div className={styles.ocrQualityInfo}>
              <h4>OCR Processing Results</h4>
              <div className={styles.ocrStats}>
                <span className={styles.ocrStat}>
                  <strong>Confidence:</strong> {editableResumeData.ocrMetadata.confidence}%
                </span>
                <span className={styles.ocrStat}>
                  <strong>Quality:</strong> {editableResumeData.ocrMetadata.quality}
                </span>
                <span className={styles.ocrStat}>
                  <strong>Words Extracted:</strong> {editableResumeData.ocrMetadata.wordCount}
                </span>
              </div>
            </div>

            <div className={styles.verificationActions}>
              <button
                className={styles.backButton}
                onClick={() => {
                  setShowResumeVerification(false)
                  setShowResumeUpload(true)
                }}
              >
                Back to Upload
              </button>
              <button className={styles.confirmButton} onClick={handleResumeVerificationComplete}>
                Confirm & Save Resume
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderJobCard = (job: Job) => (
    <div key={job.id} className={styles.jobCard}>
      <div className={styles.jobHeader}>
        <div className={styles.jobInfo}>
          <h3 className={styles.jobTitle}>{job.title}</h3>
          <p className={styles.company}>
            <BuildingIcon />
            {job.company}
          </p>
        </div>
        <div className={styles.jobActions}>
          <button
            className={`${styles.saveButton} ${job.saved ? styles.saved : ""}`}
            onClick={() => handleSaveJob(job.id)}
          >
            <BookmarkIcon filled={job.saved} />
          </button>
          <div className={`${styles.matchBadge} ${getMatchColor(job.matchPercentage)}`}>
            {job.matchPercentage}% match
          </div>
        </div>
      </div>

      <div className={styles.jobDetails}>
        <div className={styles.jobMeta}>
          <span className={styles.metaItem}>
            <MapPinIcon />
            {job.location}
          </span>
          <span className={styles.metaItem}>
            <DollarSignIcon />
            {job.salary}
          </span>
          <span className={styles.metaItem}>
            <ClockIcon />
            {job.postedDate}
          </span>
        </div>

        <p className={styles.jobDescription}>{job.description}</p>

        {/* Show match reasons if available */}
        {job.matchDetails?.reasonsForMatch && job.matchDetails.reasonsForMatch.length > 0 && (
          <div className={styles.matchReasons}>
            <h4>Why this matches you:</h4>
            <ul>
              {job.matchDetails.reasonsForMatch.slice(0, 3).map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.jobTags}>
          <span className={styles.tag}>{job.type}</span>
          <span className={styles.tag}>{job.level}</span>
          <span className={styles.tag}>{job.workplaceType}</span>
          {job.requirements.slice(0, 3).map((skill, index) => (
            <span key={index} className={styles.skillTag}>
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className={styles.jobFooter}>
        <button
          className={`${styles.applyButton} ${job.applied ? styles.applied : ""}`}
          onClick={() => handleApplyJob(job.id)}
          disabled={job.applied}
        >
          {job.applied ? "Applied" : "Apply Now"}
        </button>
      </div>
    </div>
  )

  const renderHome = () => (
    <div className={styles.homeContent}>
      {/* User Resume Summary with OCR info */}
      {userResume && (
        <div className={styles.resumeSummary}>
          <div className={styles.resumeInfo}>
            <h3>Your Profile (OCR Processed)</h3>
            <p>
              <strong>{userResume.personalInfo.name}</strong> • {userResume.experienceLevel}
            </p>
            <p>
              {userResume.skills.length} skills • {userResume.experience.length} work experiences
            </p>
            <div className={styles.ocrMetadata}>
              <span
                className={styles.qualityBadge}
                style={{ backgroundColor: getQualityColor(userResume.ocrMetadata.quality) }}
              >
                OCR Quality: {userResume.ocrMetadata.quality} ({userResume.ocrMetadata.confidence}%)
              </span>
              <span className={styles.processingTime}>
                Processed in {(userResume.ocrMetadata.processingTime / 1000).toFixed(1)}s
              </span>
            </div>
          </div>
          <button className={styles.updateResumeButton} onClick={() => setShowResumeUpload(true)}>
            Update Resume
          </button>
        </div>
      )}

      <div className={styles.searchSection}>
        <div className={styles.searchBar}>
          <SearchIcon />
          <input
            type="text"
            placeholder="Search jobs or companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className={styles.filterButton} onClick={() => setShowFilters(!showFilters)}>
          <FilterIcon />
        </button>
      </div>

      {showFilters && (
        <div className={styles.filterPanel}>
          <div className={styles.filterHeader}>
            <h3>Filter Jobs</h3>
            <button onClick={() => setShowFilters(false)}>
              <XIcon />
            </button>
          </div>

          <div className={styles.filterGrid}>
            <div className={styles.filterGroup}>
              <label>Job Type</label>
              <select
                value={filters.jobType}
                onChange={(e) => setFilters((prev) => ({ ...prev, jobType: e.target.value }))}
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Position Level</label>
              <select
                value={filters.positionLevel}
                onChange={(e) => setFilters((prev) => ({ ...prev, positionLevel: e.target.value }))}
              >
                <option value="">All Levels</option>
                <option value="Entry-level">Entry-level</option>
                <option value="Mid-level">Mid-level</option>
                <option value="Senior">Senior</option>
                <option value="Executive">Executive</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Workplace Setup</label>
              <select
                value={filters.workplaceSetup}
                onChange={(e) => setFilters((prev) => ({ ...prev, workplaceSetup: e.target.value }))}
              >
                <option value="">All Setups</option>
                <option value="On-site">On-site</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Location</label>
              <input
                type="text"
                placeholder="Enter location"
                value={filters.location}
                onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value }))}
              />
            </div>
          </div>

          <div className={styles.filterActions}>
            <button
              className={styles.clearFilters}
              onClick={() =>
                setFilters({
                  jobType: "",
                  positionLevel: "",
                  workplaceSetup: "",
                  location: "",
                  salaryRange: { min: "", max: "" },
                })
              }
            >
              Clear All
            </button>
            <button className={styles.applyFilters} onClick={() => setShowFilters(false)}>
              Apply Filters
            </button>
          </div>
        </div>
      )}

      <div className={styles.jobsSection}>
        <div className={styles.sectionHeader}>
          <h2>
            {userResume ? "Recommended Jobs" : "Available Jobs"}
            {userResume && <span className={styles.mlBadge}>OCR-Powered</span>}
          </h2>
          <span className={styles.jobCount}>{filteredJobs.length} jobs found</span>
        </div>

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>{userResume ? "Finding the best matches for you..." : "Loading jobs..."}</p>
          </div>
        ) : (
          <div className={styles.jobsList}>{filteredJobs.map(renderJobCard)}</div>
        )}
      </div>
    </div>
  )

  const renderNotifications = () => (
    <div className={styles.notificationsContent}>
      <div className={styles.sectionHeader}>
        <h2>Notifications</h2>
        <span className={styles.unreadCount}>{notifications.filter((n) => !n.read).length} unread</span>
      </div>

      <div className={styles.notificationsList}>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`${styles.notificationCard} ${!notification.read ? styles.unread : ""}`}
          >
            <div className={styles.notificationIcon}>
              {notification.type === "application" && <BellIcon />}
              {notification.type === "status_change" && <StarIcon />}
              {notification.type === "job_posted" && <BuildingIcon />}
            </div>
            <div className={styles.notificationContent}>
              <h4>{notification.title}</h4>
              <p>{notification.message}</p>
              <span className={styles.timestamp}>{notification.timestamp}</span>
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
        <span className={styles.applicationCount}>{applications.length} applications</span>
      </div>

      <div className={styles.applicationsList}>
        {applications.map((application) => (
          <div key={application.id} className={styles.applicationCard}>
            <div className={styles.applicationInfo}>
              <h4>{application.jobTitle}</h4>
              <p className={styles.company}>
                <BuildingIcon />
                {application.company}
              </p>
              <span className={styles.appliedDate}>Applied on {application.appliedDate}</span>
            </div>
            <div className={styles.applicationStatus}>
              <span className={`${styles.statusBadge} ${getStatusColor(application.status)}`}>
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderSavedJobs = () => {
    const savedJobs = jobService.getSavedJobs()

    return (
      <div className={styles.savedJobsContent}>
        <div className={styles.sectionHeader}>
          <h2>Saved Jobs</h2>
          <span className={styles.savedCount}>{savedJobs.length} saved jobs</span>
        </div>

        <div className={styles.jobsList}>{savedJobs.map(renderJobCard)}</div>
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      {/* Resume Upload Modal */}
      {showResumeUpload && renderResumeUpload()}

      {/* Resume Verification Modal */}
      {showResumeVerification && renderResumeVerification()}

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoSection}>
            <img src="/peso-logo.png" alt="PESO Logo" className={styles.logo} />
            <div className={styles.welcomeText}>
              <h1>Hello, {userResume?.personalInfo.name || "User"}</h1>
              <p>
                {userResume
                  ? "Find your perfect job match with OCR-powered matching"
                  : "Upload your PDF resume for personalized recommendations"}
              </p>
            </div>
          </div>

          <div className={styles.headerActions}>
            <button className={styles.notificationButton}>
              <BellIcon />
              {notifications.filter((n) => !n.read).length > 0 && (
                <span className={styles.notificationBadge}>{notifications.filter((n) => !n.read).length}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className={styles.navigation}>
        <button
          className={`${styles.navButton} ${activeTab === "home" ? styles.active : ""}`}
          onClick={() => setActiveTab("home")}
        >
          <SearchIcon />
          <span>Jobs</span>
        </button>
        <button
          className={`${styles.navButton} ${activeTab === "notifications" ? styles.active : ""}`}
          onClick={() => setActiveTab("notifications")}
        >
          <BellIcon />
          <span>Notifications</span>
          {notifications.filter((n) => !n.read).length > 0 && (
            <span className={styles.navBadge}>{notifications.filter((n) => !n.read).length}</span>
          )}
        </button>
        <button
          className={`${styles.navButton} ${activeTab === "applications" ? styles.active : ""}`}
          onClick={() => setActiveTab("applications")}
        >
          <BuildingIcon />
          <span>Applications</span>
        </button>
        <button
          className={`${styles.navButton} ${activeTab === "saved" ? styles.active : ""}`}
          onClick={() => setActiveTab("saved")}
        >
          <BookmarkIcon />
          <span>Saved</span>
        </button>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {activeTab === "home" && renderHome()}
        {activeTab === "notifications" && renderNotifications()}
        {activeTab === "applications" && renderApplications()}
        {activeTab === "saved" && renderSavedJobs()}
      </div>
    </div>
  )
}

export default Dashboard
