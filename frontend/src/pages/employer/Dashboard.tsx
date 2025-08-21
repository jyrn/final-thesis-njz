"use client"

import React from "react"
import { useState, useCallback } from "react"
import styles from "./EmployerDashboard.module.css"

// Types
type StatusType = "info" | "success" | "danger" | "warning"
type PriorityUrgency = "high" | "medium" | "low"

interface Employer {
  name: string
  email: string
  phone: string
  address: string
  avatar: string | null
  companySize: string
  industry: string
}

interface JobPosting {
  id: number
  title: string
  department: string
  location: string
  type: string
  salary: string
  status: string
  applicants: number
  views: number
  posted: string
  description: string
  requirements: string[]
  urgency: PriorityUrgency
  matchQuality: number
}

interface Applicant {
  id: number
  name: string
  email: string
  phone: string
  jobTitle: string
  appliedDate: string
  status: string
  statusType: StatusType
  experience: string
  skills: string[]
  resumeUrl: string
  matchScore: number
  lastActivity: string
  priority: PriorityUrgency
}

// Icon Components with proper props
interface IconProps {
  style?: React.CSSProperties
  className?: string
}

const HomeIcon: React.FC<IconProps> = ({ style, className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={style} className={className}>
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
  </svg>
)

const BriefcaseIcon: React.FC<IconProps> = ({ style, className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={style} className={className}>
    <path d="M20 6h-2V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
  </svg>
)

const UsersIcon: React.FC<IconProps> = ({ style, className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={style} className={className}>
    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A2.996 2.996 0 0 0 16.96 6c-.8 0-1.54.37-2.01.97L12 10.5 9.05 6.97C8.58 6.37 7.84 6 7.04 6c-1.31 0-2.42.83-2.83 2.02L1.5 16H4v6h2v-6h2.5l1.5-4.5L12 14.5l1.5-3L15.5 16H18v6h2z" />
  </svg>
)

const SettingsIcon: React.FC<IconProps> = ({ style, className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={style} className={className}>
    <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.82,11.69,4.82,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
  </svg>
)

const LogOutIcon: React.FC<IconProps> = ({ style, className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={style} className={className}>
    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.59L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
  </svg>
)

const MenuIcon: React.FC<IconProps> = ({ style, className }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={style} className={className}>
    <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
  </svg>
)

const CloseIcon: React.FC<IconProps> = ({ style, className }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={style} className={className}>
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
  </svg>
)

const BellIcon: React.FC<IconProps> = ({ style, className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={style} className={className}>
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
  </svg>
)

const PlusIcon: React.FC<IconProps> = ({ style, className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={style} className={className}>
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
  </svg>
)

const EyeIcon: React.FC<IconProps> = ({ style, className }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={style} className={className}>
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
  </svg>
)

const EditIcon: React.FC<IconProps> = ({ style, className }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={style} className={className}>
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" />
  </svg>
)

const TrashIcon: React.FC<IconProps> = ({ style, className }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={style} className={className}>
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
  </svg>
)

const SearchIcon: React.FC<IconProps> = ({ style, className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={style} className={className}>
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
  </svg>
)

const FilterIcon: React.FC<IconProps> = ({ style, className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={style} className={className}>
    <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
  </svg>
)

const DownloadIcon: React.FC<IconProps> = ({ style, className }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={style} className={className}>
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
  </svg>
)

const MailIcon: React.FC<IconProps> = ({ style, className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={style} className={className}>
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
  </svg>
)

const PhoneIcon: React.FC<IconProps> = ({ style, className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={style} className={className}>
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
  </svg>
)

const MapPinIcon: React.FC<IconProps> = ({ style, className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={style} className={className}>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
)

const CalendarIcon: React.FC<IconProps> = ({ style, className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={style} className={className}>
    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
  </svg>
)

const TrendingUpIcon: React.FC<IconProps> = ({ style, className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={style} className={className}>
    <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z" />
  </svg>
)

const UserCheckIcon: React.FC<IconProps> = ({ style, className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={style} className={className}>
    <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7V9C15 10.66 13.66 12 12 12C10.34 12 9 10.66 9 9V7H3V9C3 11.76 5.24 14 8 14H16C18.76 14 21 11.76 21 9ZM16.5 16L18.5 18L22 14.5L20.5 13L18.5 15L17.5 14L16.5 16Z" />
  </svg>
)

const CheckCircleIcon: React.FC<IconProps> = ({ style, className }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={style} className={className}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
)

const XCircleIcon: React.FC<IconProps> = ({ style, className }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={style} className={className}>
    <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
  </svg>
)

const UserIcon: React.FC<IconProps> = ({ style, className }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={style} className={className}>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
)

const DollarSignIcon: React.FC<IconProps> = ({ style, className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={style} className={className}>
    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" />
  </svg>
)

const ClockIcon: React.FC<IconProps> = ({ style, className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={style} className={className}>
    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
    <path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
  </svg>
)

const StarIcon: React.FC<IconProps> = ({ style, className }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={style} className={className}>
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
)

// Mock data
const mockEmployer: Employer = {
  name: "TechCorp Inc.",
  email: "hr@techcorp.com",
  phone: "+63 2 123 4567",
  address: "Makati City, Philippines",
  avatar: null,
  companySize: "100-500 employees",
  industry: "Technology",
}

const mockJobPostings: JobPosting[] = [
  {
    id: 1,
    title: "Senior Software Engineer",
    department: "Engineering",
    location: "Manila, Philippines",
    type: "Full-time",
    salary: "₱80,000 - ₱120,000",
    status: "Active",
    applicants: 24,
    views: 156,
    posted: "2024-01-15",
    description: "We are looking for a Senior Software Engineer to join our dynamic team...",
    requirements: ["React", "Node.js", "TypeScript", "AWS", "Docker"],
    urgency: "high",
    matchQuality: 92,
  },
  {
    id: 2,
    title: "Frontend Developer",
    department: "Engineering",
    location: "Cebu City, Philippines",
    type: "Full-time",
    salary: "₱50,000 - ₱70,000",
    status: "Active",
    applicants: 18,
    views: 89,
    posted: "2024-01-12",
    description: "Join our frontend team to build amazing user experiences...",
    requirements: ["Vue.js", "CSS3", "JavaScript", "Git"],
    urgency: "medium",
    matchQuality: 88,
  },
  {
    id: 3,
    title: "DevOps Engineer",
    department: "Infrastructure",
    location: "Remote",
    type: "Full-time",
    salary: "₱70,000 - ₱100,000",
    status: "Draft",
    applicants: 0,
    views: 0,
    posted: "2024-01-20",
    description: "Manage and optimize our cloud infrastructure...",
    requirements: ["AWS", "Docker", "Kubernetes", "Jenkins"],
    urgency: "low",
    matchQuality: 75,
  },
]

const mockApplicants: Applicant[] = [
  {
    id: 1,
    name: "Juan Dela Cruz",
    email: "juan@email.com",
    phone: "+63 912 345 6789",
    jobTitle: "Senior Software Engineer",
    appliedDate: "2024-01-18",
    status: "Under Review",
    statusType: "info",
    experience: "5 years",
    skills: ["React", "Node.js", "TypeScript", "AWS"],
    resumeUrl: "#",
    matchScore: 92,
    lastActivity: "2 hours ago",
    priority: "high",
  },
  {
    id: 2,
    name: "Maria Santos",
    email: "maria@email.com",
    phone: "+63 917 123 4567",
    jobTitle: "Frontend Developer",
    appliedDate: "2024-01-17",
    status: "Interview Scheduled",
    statusType: "success",
    experience: "3 years",
    skills: ["Vue.js", "CSS3", "JavaScript"],
    resumeUrl: "#",
    matchScore: 88,
    lastActivity: "1 day ago",
    priority: "medium",
  },
  {
    id: 3,
    name: "Carlos Rodriguez",
    email: "carlos@email.com",
    phone: "+63 905 987 6543",
    jobTitle: "Senior Software Engineer",
    appliedDate: "2024-01-16",
    status: "Rejected",
    statusType: "danger",
    experience: "2 years",
    skills: ["Python", "Django", "PostgreSQL"],
    resumeUrl: "#",
    matchScore: 65,
    lastActivity: "3 days ago",
    priority: "low",
  },
]

// Reusable Components
const StatusBadge: React.FC<{ type: StatusType; text: string }> = ({ type, text }) => (
  <span className={`${styles.statusBadge} ${styles[type]}`}>{text}</span>
)

const PriorityIndicator: React.FC<{ priority: PriorityUrgency }> = ({ priority }) => {
  const colorMap = {
    high: "#ef4444",
    medium: "#f59e0b",
    low: "#10b981",
  }
  return <div className={styles.priorityIndicator} style={{ backgroundColor: colorMap[priority] }} />
}

const MetaItem: React.FC<{ icon: React.ReactNode; text: string }> = ({ icon, text }) => (
  <div className={styles.metaItem}>
    {icon}
    <span>{text}</span>
  </div>
)

const SkillTag: React.FC<{ skill: string }> = ({ skill }) => <span className={styles.requirementTag}>{skill}</span>

const SearchBar: React.FC<{
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}> = ({ placeholder, value, onChange }) => (
  <div className={styles.searchBar}>
    <SearchIcon />
    <input type="text" placeholder={placeholder} value={value} onChange={onChange} />
  </div>
)

const JobCard: React.FC<{
  job: JobPosting
  variant?: "compact" | "full"
  onEdit?: () => void
}> = ({ job, variant = "full", onEdit }) => {
  const isCompact = variant === "compact"

  return (
    <div className={`${styles.jobCard} ${isCompact ? "" : styles.fullCard}`}>
      <div className={styles.jobHeader}>
        <div className={styles.jobCompanyLogo}>{job.title.charAt(0)}</div>
        <div className={styles.jobActions}>
          <StatusBadge
            type={job.status === "Active" ? "success" : job.status === "Draft" ? "warning" : "info"}
            text={job.status}
          />
          <PriorityIndicator priority={job.urgency} />
        </div>
      </div>
      <div className={styles.jobInfo}>
        <h3>{job.title}</h3>
        <p className={styles.jobCompany}>
          {job.department} {!isCompact && `• ${job.type}`}
        </p>
        <div className={styles.jobMeta}>
          <MetaItem icon={<MapPinIcon />} text={job.location} />
          <MetaItem icon={<UsersIcon />} text={`${job.applicants} applicants`} />
          <MetaItem icon={<EyeIcon />} text={`${job.views} views`} />
          {!isCompact && (
            <MetaItem icon={<CalendarIcon />} text={`Posted ${new Date(job.posted).toLocaleDateString()}`} />
          )}
        </div>
        {!isCompact && (
          <>
            <p className={styles.jobDescription}>{job.description}</p>
            <div className={styles.jobRequirements}>
              {job.requirements.slice(0, 3).map((req, index) => (
                <SkillTag key={index} skill={req} />
              ))}
              {job.requirements.length > 3 && (
                <span className={styles.moreRequirements}>+{job.requirements.length - 3} more</span>
              )}
            </div>
          </>
        )}
      </div>
      <div className={styles.jobFooter}>
        {!isCompact && (
          <div className={styles.jobStats}>
            <span className={styles.salaryInfo}>
              <DollarSignIcon />
              {job.salary}
            </span>
            <span className={styles.matchQuality}>
              <StarIcon />
              {job.matchQuality}% match quality
            </span>
          </div>
        )}
        <div className={styles.jobActions}>
          <button className={styles.viewButton}>
            <EyeIcon /> View
          </button>
          <button className={styles.applyButton} onClick={onEdit}>
            <EditIcon /> Edit
          </button>
          {!isCompact && (
            <button className={styles.withdrawButton}>
              <TrashIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const ApplicantCard: React.FC<{
  applicant: Applicant
  onAccept?: () => void
  onReject?: () => void
}> = ({ applicant, onAccept, onReject }) => {
  return (
    <div className={styles.applicationCard}>
      <div className={styles.applicationHeader}>
        <div className={styles.applicationCompanyLogo}>
          {applicant.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()}
        </div>
        <div className={styles.applicationInfo}>
          <h3>{applicant.name}</h3>
          <p>Applied for: {applicant.jobTitle}</p>
          <div className={styles.appliedDate}>
            Applied on {new Date(applicant.appliedDate).toLocaleDateString()} • {applicant.experience} experience
          </div>
          <div className={styles.jobMeta} style={{ marginTop: "0.5rem" }}>
            <MetaItem icon={<MailIcon />} text={applicant.email} />
            <MetaItem icon={<PhoneIcon />} text={applicant.phone} />
          </div>
        </div>
        <div className={styles.applicationStatus}>
          <div style={{ textAlign: "right", marginBottom: "1rem" }}>
            <div
              className={styles.statValue}
              style={{
                fontSize: "1.5rem",
                margin: 0,
                color: applicant.matchScore >= 90 ? "#10b981" : applicant.matchScore >= 80 ? "#f59e0b" : "#ef4444",
              }}
            >
              {applicant.matchScore}%
            </div>
            <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Match Score</div>
          </div>
          <StatusBadge type={applicant.statusType} text={applicant.status} />
          <PriorityIndicator priority={applicant.priority} />
        </div>
      </div>

      <div className={styles.jobRequirements} style={{ margin: "1rem 0" }}>
        <strong style={{ fontSize: "0.875rem", color: "#374151", marginRight: "0.5rem" }}>Skills:</strong>
        {applicant.skills.map((skill, index) => (
          <SkillTag key={index} skill={skill} />
        ))}
      </div>

      <div className={styles.applicationActions}>
        <button className={styles.viewButton}>
          <DownloadIcon /> Download Resume
        </button>
        <button className={styles.applyButton}>
          <MailIcon /> Send Message
        </button>
        <button className={styles.viewButton} style={{ background: "#10b981" }} onClick={onAccept}>
          <CheckCircleIcon /> Accept
        </button>
        <button className={styles.withdrawButton} onClick={onReject}>
          <XCircleIcon /> Reject
        </button>
      </div>
    </div>
  )
}

const StatCard: React.FC<{
  icon: React.ReactElement
  title: string
  value: string | number
  changeText: string
  iconBg?: string
  iconColor?: string
  changeColor?: string
}> = ({ icon, title, value, changeText, iconBg = "#dbeafe", iconColor = "#2563eb", changeColor = "#10b981" }) => (
  <div className={styles.statCard}>
    <div className={styles.statIcon} style={{ backgroundColor: iconBg }}>
      {React.cloneElement(icon, { style: { color: iconColor } })}
    </div>
    <div className={styles.statInfo}>
      <h3>{title}</h3>
      <div className={styles.statValue}>{value}</div>
      <div className={styles.statChange}>
        <TrendingUpIcon style={{ color: changeColor }} />
        {changeText}
      </div>
    </div>
  </div>
)

const EmployerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    status: "",
    department: "",
    location: "",
  })
  const [jobPostings] = useState(mockJobPostings)
  const [applicants] = useState(mockApplicants)
  const [employer] = useState(mockEmployer)

  const handleLogout = useCallback(() => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    localStorage.removeItem("selectedRole")
    window.location.href = "/auth"
  }, [])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const clearFilters = () => {
    setFilters({
      status: "",
      department: "",
      location: "",
    })
  }

  const filteredJobs = jobPostings.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = !filters.status || job.status === filters.status
    const matchesDepartment = !filters.department || job.department === filters.department

    return matchesSearch && matchesStatus && matchesDepartment
  })

  const filteredApplicants = applicants.filter((applicant) => {
    return (
      applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      applicant.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const renderOverview = () => (
    <div className={styles.overviewContent}>
      <div className={styles.welcomeSection}>
        <div className={styles.welcomeText}>
          <h2>Welcome back, {employer.name}! 👋</h2>
          <p>Here's what's happening with your hiring process today.</p>
        </div>
        <div className={styles.quickActions}>
          <button className={styles.primaryButton} onClick={() => setActiveTab("jobs")}>
            <PlusIcon /> Post New Job
          </button>
          <button className={styles.secondaryButton} onClick={() => setActiveTab("applicants")}>
            <UsersIcon /> View Applicants
          </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard
          icon={<BriefcaseIcon />}
          title="Active Jobs"
          value={jobPostings.filter((job) => job.status === "Active").length}
          changeText="+2 this month"
          iconBg="#dbeafe"
          iconColor="#2563eb"
        />
        <StatCard
          icon={<UsersIcon />}
          title="Total Applicants"
          value={applicants.length}
          changeText="+12 this week"
          iconBg="#fef3c7"
          iconColor="#d97706"
        />
        <StatCard
          icon={<UserCheckIcon />}
          title="Interviews"
          value={applicants.filter((app) => app.status === "Interview Scheduled").length}
          changeText="+3 this week"
          iconBg="#dcfce7"
          iconColor="#16a34a"
        />
        <StatCard
          icon={<StarIcon />}
          title="Avg. Match Score"
          value="82%"
          changeText="+5% this month"
          iconBg="#f3e8ff"
          iconColor="#9333ea"
        />
      </div>

      <div className={styles.dashboardGrid}>
        <div className={styles.recentJobs}>
          <div className={styles.sectionHeader}>
            <h3>Recent Job Postings</h3>
            <button className={styles.viewAllButton} onClick={() => setActiveTab("jobs")}>
              View All
            </button>
          </div>
          <div className={styles.jobsList}>
            {jobPostings.slice(0, 3).map((job) => (
              <JobCard key={job.id} job={job} variant="compact" />
            ))}
          </div>
        </div>

        <div className={styles.recentActivity}>
          <div className={styles.sectionHeader}>
            <h3>Recent Applications</h3>
            <button className={styles.viewAllButton} onClick={() => setActiveTab("applicants")}>
              View All
            </button>
          </div>
          <div className={styles.activityList}>
            {applicants.slice(0, 4).map((applicant) => (
              <div key={applicant.id} className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  <UserIcon />
                </div>
                <div className={styles.activityContent}>
                  <p>
                    <strong>{applicant.name}</strong> applied for {applicant.jobTitle}
                  </p>
                  <div className={styles.activityTime}>
                    {applicant.matchScore}% match • {new Date(applicant.appliedDate).toLocaleDateString()}
                  </div>
                </div>
                <PriorityIndicator priority={applicant.priority} />
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
          <h2>Job Postings</h2>
          <p>Manage your job listings and track performance</p>
        </div>
        <div className={styles.jobsActions}>
          <SearchBar placeholder="Search jobs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <button className={styles.filterButton} onClick={() => setShowFilters(!showFilters)}>
            <FilterIcon />
            Filters
          </button>
          <button className={styles.primaryButton}>
            <PlusIcon /> Post New Job
          </button>
        </div>
      </div>

      {showFilters && (
        <div className={styles.filtersPanel}>
          <div className={styles.filterGroup}>
            <label>Status</label>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div className={styles.filterGroup}>
            <label>Department</label>
            <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })}>
              <option value="">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Marketing">Marketing</option>
              <option value="Sales">Sales</option>
              <option value="Infrastructure">Infrastructure</option>
            </select>
          </div>
          <button className={styles.clearFilters} onClick={clearFilters}>
            Clear All
          </button>
        </div>
      )}

      <div className={styles.jobsGrid}>
        {filteredJobs.map((job) => (
          <JobCard key={job.id} job={job} variant="full" />
        ))}
      </div>
    </div>
  )

  const renderApplicants = () => (
    <div className={styles.applicationsContent}>
      <div className={styles.sectionHeader}>
        <h2>Job Applicants</h2>
        <p>Review and manage candidate applications</p>
      </div>

      <div className={styles.jobsActions} style={{ marginBottom: "2rem" }}>
        <SearchBar
          placeholder="Search applicants..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className={styles.filterButton}>
          <FilterIcon />
          Filter by Job
        </button>
      </div>

      <div className={styles.applicationsList}>
        {filteredApplicants.map((applicant) => (
          <ApplicantCard
            key={applicant.id}
            applicant={applicant}
            onAccept={() => console.log("Accept", applicant.id)}
            onReject={() => console.log("Reject", applicant.id)}
          />
        ))}
      </div>
    </div>
  )

  const renderCompanyProfile = () => (
    <div className={styles.profileContent}>
      <div className={styles.profileHeader}>
        <div className={styles.profileAvatar}>
          {employer.avatar ? (
            <img src={employer.avatar || "/placeholder.svg"} alt={employer.name} />
          ) : (
            getInitials(employer.name)
          )}
        </div>
        <div className={styles.profileInfo}>
          <h2>{employer.name}</h2>
          <p className={styles.profileEmail}>{employer.email}</p>
          <p className={styles.profilePhone}>{employer.phone}</p>
          <p className={styles.profileAddress}>{employer.address}</p>
        </div>
        <button className={styles.editProfileButton}>
          <EditIcon /> Edit Company Profile
        </button>
      </div>

      <div className={styles.profileSections}>
        <div className={styles.profileSection}>
          <h3>Company Information</h3>
          <div className={styles.editGrid}>
            <div>
              <strong>Industry:</strong> {employer.industry}
            </div>
            <div>
              <strong>Company Size:</strong> {employer.companySize}
            </div>
            <div>
              <strong>Founded:</strong> 2015
            </div>
            <div>
              <strong>Website:</strong> www.techcorp.com
            </div>
          </div>
        </div>

        <div className={styles.profileSection}>
          <h3>Company Description</h3>
          <p>
            TechCorp Inc. is a leading technology company specializing in innovative software solutions. We are
            committed to delivering high-quality products and services to our clients while fostering a collaborative
            and inclusive work environment for our employees.
          </p>
        </div>

        <div className={styles.profileSection}>
          <h3>Hiring Statistics</h3>
          <div className={styles.statsGrid}>
            <StatCard
              icon={<BriefcaseIcon />}
              title="Total Positions Posted"
              value={24}
              changeText=""
              iconBg="#e0f2fe"
            />
            <StatCard icon={<UserCheckIcon />} title="Successful Hires" value={18} changeText="" iconBg="#dcfce7" />
            <StatCard
              icon={<ClockIcon />}
              title="Average Time to Hire"
              value="21 days"
              changeText=""
              iconBg="#fef3c7"
            />
          </div>
        </div>

        <div className={styles.profileSection}>
          <h3>Company Benefits</h3>
          <div className={styles.skillsList}>
            <SkillTag skill="Health Insurance" />
            <SkillTag skill="Flexible Hours" />
            <SkillTag skill="Remote Work" />
            <SkillTag skill="Professional Development" />
            <SkillTag skill="Competitive Salary" />
            <SkillTag skill="Team Building" />
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview()
      case "jobs":
        return renderJobs()
      case "applicants":
        return renderApplicants()
      case "company":
        return renderCompanyProfile()
      default:
        return renderOverview()
    }
  }

  return (
    <div className={styles.dashboard}>
      {/* Mobile Header */}
      <div className={styles.mobileHeader}>
        <div className={styles.logo}>
          <img src="/peso-logo.png" alt="PESO" />
          <h1>PESO</h1>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.notificationButton}>
            <BellIcon />
            <span className={styles.notificationBadge}>5</span>
          </button>
          <button className={styles.menuButton} onClick={() => setSidebarOpen(true)}>
            <MenuIcon />
          </button>
        </div>
      </div>

      <div className={styles.dashboardLayout}>
        {/* Sidebar Overlay for Mobile */}
        {sidebarOpen && <div className={styles.sidebarOverlay} onClick={() => setSidebarOpen(false)} />}

        {/* Sidebar */}
        <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
          <div className={styles.sidebarHeader}>
            <div className={styles.logo}>
              <img src="/peso-logo.png" alt="PESO" />
              <h1>PESO</h1>
            </div>
            <button className={styles.closeSidebar} onClick={() => setSidebarOpen(false)}>
              <CloseIcon />
            </button>
          </div>

          <div className={styles.userProfile}>
            <div className={styles.userAvatar}>
              {employer.avatar ? (
                <img src={employer.avatar || "/placeholder.svg"} alt={employer.name} />
              ) : (
                getInitials(employer.name)
              )}
            </div>
            <div className={styles.userInfo}>
              <h3>{employer.name}</h3>
              <p>Employer</p>
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
              <HomeIcon />
              Overview
            </button>
            <button
              className={`${styles.navItem} ${activeTab === "jobs" ? styles.active : ""}`}
              onClick={() => {
                setActiveTab("jobs")
                setSidebarOpen(false)
              }}
            >
              <BriefcaseIcon />
              Job Postings
              <span className={styles.navBadge}>{jobPostings.length}</span>
            </button>
            <button
              className={`${styles.navItem} ${activeTab === "applicants" ? styles.active : ""}`}
              onClick={() => {
                setActiveTab("applicants")
                setSidebarOpen(false)
              }}
            >
              <UsersIcon />
              Applicants
              <span className={styles.navBadge}>{applicants.length}</span>
            </button>
            <button
              className={`${styles.navItem} ${activeTab === "company" ? styles.active : ""}`}
              onClick={() => {
                setActiveTab("company")
                setSidebarOpen(false)
              }}
            >
              <SettingsIcon />
              Company Profile
            </button>
          </nav>

          <div className={styles.sidebarFooter}>
            <button className={styles.logoutButton} onClick={handleLogout}>
              <LogOutIcon />
              Logout
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.mainContent}>
          <div className={styles.contentWrapper}>{renderContent()}</div>
        </div>
      </div>
    </div>
  )
}

export default EmployerDashboard
