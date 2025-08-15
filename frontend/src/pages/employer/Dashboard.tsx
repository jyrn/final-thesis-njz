"use client"

import type React from "react"
import { useState, useCallback } from "react"
import {
  FiHome,
  FiBriefcase,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
  FiBell,
  FiPlus,
  FiEye,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiDownload,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiTrendingUp,
  FiUserCheck,
  FiCheckCircle,
  FiXCircle,
  FiUser,
  FiTrendingDown,
  FiDollarSign,
  FiClock,
  FiStar,
} from "react-icons/fi"
import styles from "./EmployerDashboard.module.css"

// Mock data for employer
const mockEmployer = {
  name: "TechCorp Inc.",
  email: "hr@techcorp.com",
  phone: "+63 2 123 4567",
  address: "Makati City, Philippines",
  avatar: null,
  companySize: "100-500 employees",
  industry: "Technology",
}

// Mock job postings
const mockJobPostings = [
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

// Mock applicants
const mockApplicants = [
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

  // Handle logout
  const handleLogout = useCallback(() => {
    // Clear user data
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    localStorage.removeItem("selectedRole")

    // Redirect to login page
    window.location.href = "/auth"
  }, [])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "#ef4444"
      case "medium":
        return "#f59e0b"
      case "low":
        return "#10b981"
      default:
        return "#6b7280"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#ef4444"
      case "medium":
        return "#f59e0b"
      case "low":
        return "#10b981"
      default:
        return "#6b7280"
    }
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

  const clearFilters = () => {
    setFilters({
      status: "",
      department: "",
      location: "",
    })
  }

  const renderOverview = () => (
    <div className={styles.overviewContent}>
      <div className={styles.welcomeSection}>
        <div className={styles.welcomeText}>
          <h2>Welcome back, {employer.name}! 👋</h2>
          <p>Here's what's happening with your hiring process today.</p>
        </div>
        <div className={styles.quickActions}>
          <button className={styles.primaryButton} onClick={() => setActiveTab("jobs")}>
            <FiPlus /> Post New Job
          </button>
          <button className={styles.secondaryButton} onClick={() => setActiveTab("applicants")}>
            <FiUsers /> View Applicants
          </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: "#dbeafe" }}>
            <FiBriefcase style={{ color: "#2563eb" }} />
          </div>
          <div className={styles.statInfo}>
            <h3>Active Jobs</h3>
            <div className={styles.statValue}>{jobPostings.filter((job) => job.status === "Active").length}</div>
            <div className={styles.statChange}>
              <FiTrendingUp style={{ color: "#10b981" }} />
              +2 this month
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: "#fef3c7" }}>
            <FiUsers style={{ color: "#d97706" }} />
          </div>
          <div className={styles.statInfo}>
            <h3>Total Applicants</h3>
            <div className={styles.statValue}>{applicants.length}</div>
            <div className={styles.statChange}>
              <FiTrendingUp style={{ color: "#10b981" }} />
              +12 this week
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: "#dcfce7" }}>
            <FiUserCheck style={{ color: "#16a34a" }} />
          </div>
          <div className={styles.statInfo}>
            <h3>Interviews</h3>
            <div className={styles.statValue}>
              {applicants.filter((app) => app.status === "Interview Scheduled").length}
            </div>
            <div className={styles.statChange}>
              <FiTrendingUp style={{ color: "#10b981" }} />
              +3 this week
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ backgroundColor: "#f3e8ff" }}>
            <FiStar style={{ color: "#9333ea" }} />
          </div>
          <div className={styles.statInfo}>
            <h3>Avg. Match Score</h3>
            <div className={styles.statValue}>82%</div>
            <div className={styles.statChange}>
              <FiTrendingUp style={{ color: "#10b981" }} />
              +5% this month
            </div>
          </div>
        </div>
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
              <div key={job.id} className={styles.jobCard}>
                <div className={styles.jobHeader}>
                  <div className={styles.jobCompanyLogo}>
                    <span>{job.title.charAt(0)}</span>
                  </div>
                  <div className={styles.jobActions}>
                    <span
                      className={`${styles.statusBadge} ${job.status === "Active" ? styles.success : styles.warning}`}
                    >
                      {job.status}
                    </span>
                    <div 
                      className={styles.urgencyIndicator}
                      style={{ backgroundColor: getUrgencyColor(job.urgency) }}
                    />
                  </div>
                </div>
                <div className={styles.jobInfo}>
                  <h4>{job.title}</h4>
                  <p className={styles.jobCompany}>{job.department}</p>
                  <div className={styles.jobMeta}>
                    <div className={styles.metaItem}>
                      <FiMapPin />
                      <span>{job.location}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <FiUsers />
                      <span>{job.applicants} applicants</span>
                    </div>
                    <div className={styles.metaItem}>
                      <FiEye />
                      <span>{job.views} views</span>
                    </div>
                  </div>
                  <div className={styles.jobActions}>
                    <button className={styles.quickApplyButton}>
                      <FiEdit /> Edit
                    </button>
                  </div>
                </div>
              </div>
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
                  <FiUser />
                </div>
                <div className={styles.activityContent}>
                  <p>
                    <strong>{applicant.name}</strong> applied for {applicant.jobTitle}
                  </p>
                  <div className={styles.activityTime}>
                    {applicant.matchScore}% match • {new Date(applicant.appliedDate).toLocaleDateString()}
                  </div>
                </div>
                <div 
                  className={styles.priorityIndicator}
                  style={{ backgroundColor: getPriorityColor(applicant.priority) }}
                />
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
          <div className={styles.searchBar}>
            <FiSearch />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className={styles.filterButton} onClick={() => setShowFilters(!showFilters)}>
            <FiFilter />
            Filters
          </button>
          <button className={styles.primaryButton}>
            <FiPlus /> Post New Job
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
          <div key={job.id} className={`${styles.jobCard} ${styles.fullCard}`}>
            <div className={styles.jobHeader}>
              <div className={styles.jobCompanyLogo}>{job.title.charAt(0)}</div>
              <div className={styles.jobActions}>
                <span
                  className={`${styles.statusBadge} ${job.status === "Active" ? styles.success : job.status === "Draft" ? styles.warning : styles.info}`}
                >
                  {job.status}
                </span>
                <div 
                  className={styles.urgencyIndicator}
                  style={{ backgroundColor: getUrgencyColor(job.urgency) }}
                />
              </div>
            </div>
            <div className={styles.jobInfo}>
              <h3>{job.title}</h3>
              <p className={styles.jobCompany}>
                {job.department} • {job.type}
              </p>
              <div className={styles.jobMeta}>
                <div className={styles.metaItem}>
                  <FiMapPin />
                  <span>{job.location}</span>
                </div>
                <div className={styles.metaItem}>
                  <FiUsers />
                  <span>{job.applicants} applicants</span>
                </div>
                <div className={styles.metaItem}>
                  <FiEye />
                  <span>{job.views} views</span>
                </div>
                <div className={styles.metaItem}>
                  <FiCalendar />
                  <span>Posted {new Date(job.posted).toLocaleDateString()}</span>
                </div>
              </div>
              <p className={styles.jobDescription}>{job.description}</p>
              <div className={styles.jobRequirements}>
                {job.requirements.slice(0, 3).map((req, index) => (
                  <span key={index} className={styles.requirementTag}>
                    {req}
                  </span>
                ))}
                {job.requirements.length > 3 && (
                  <span className={styles.moreRequirements}>+{job.requirements.length - 3} more</span>
                )}
              </div>
            </div>
            <div className={styles.jobFooter}>
              <div className={styles.jobStats}>
                <span className={styles.salaryInfo}>
                  <FiDollarSign />
                  {job.salary}
                </span>
                <span className={styles.matchQuality}>
                  <FiStar />
                  {job.matchQuality}% match quality
                </span>
              </div>
              <div className={styles.jobActions}>
                <button className={styles.viewButton}>
                  <FiEye /> View
                </button>
                <button className={styles.applyButton}>
                  <FiEdit /> Edit
                </button>
                <button className={styles.withdrawButton}>
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </div>
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
        <div className={styles.searchBar}>
          <FiSearch />
          <input
            type="text"
            placeholder="Search applicants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className={styles.filterButton}>
          <FiFilter />
          Filter by Job
        </button>
      </div>

      <div className={styles.applicationsList}>
        {filteredApplicants.map((applicant) => (
          <div key={applicant.id} className={styles.applicationCard}>
            <div className={styles.applicationHeader}>
              <div className={styles.applicationCompanyLogo}>{getInitials(applicant.name)}</div>
              <div className={styles.applicationInfo}>
                <h3>{applicant.name}</h3>
                <p>Applied for: {applicant.jobTitle}</p>
                <div className={styles.appliedDate}>
                  Applied on {new Date(applicant.appliedDate).toLocaleDateString()} • {applicant.experience} experience
                </div>
                <div className={styles.jobMeta} style={{ marginTop: "0.5rem" }}>
                  <div className={styles.metaItem}>
                    <FiMail />
                    <span>{applicant.email}</span>
                  </div>
                  <div className={styles.metaItem}>
                    <FiPhone />
                    <span>{applicant.phone}</span>
                  </div>
                </div>
              </div>
              <div className={styles.applicationStatus}>
                <div style={{ textAlign: "right", marginBottom: "1rem" }}>
                  <div
                    className={styles.statValue}
                    style={{
                      fontSize: "1.5rem",
                      margin: 0,
                      color:
                        applicant.matchScore >= 90 ? "#10b981" : applicant.matchScore >= 80 ? "#f59e0b" : "#ef4444",
                    }}
                  >
                    {applicant.matchScore}%
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Match Score</div>
                </div>
                <span className={`${styles.statusBadge} ${styles[applicant.statusType]}`}>{applicant.status}</span>
                <div 
                  className={styles.priorityIndicator}
                  style={{ backgroundColor: getPriorityColor(applicant.priority) }}
                />
              </div>
            </div>

            <div className={styles.jobRequirements} style={{ margin: "1rem 0" }}>
              <strong style={{ fontSize: "0.875rem", color: "#374151", marginRight: "0.5rem" }}>Skills:</strong>
              {applicant.skills.map((skill, index) => (
                <span key={index} className={styles.requirementTag}>
                  {skill}
                </span>
              ))}
            </div>

            <div className={styles.applicationActions}>
              <button className={styles.viewButton}>
                <FiDownload /> Download Resume
              </button>
              <button className={styles.applyButton}>
                <FiMail /> Send Message
              </button>
              <button className={styles.viewButton} style={{ background: "#10b981" }}>
                <FiCheckCircle /> Accept
              </button>
              <button className={styles.withdrawButton}>
                <FiXCircle /> Reject
              </button>
            </div>
          </div>
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
          <FiEdit /> Edit Company Profile
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
            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <h3>Total Positions Posted</h3>
                <div className={styles.statValue}>24</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <h3>Successful Hires</h3>
                <div className={styles.statValue}>18</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statInfo}>
                <h3>Average Time to Hire</h3>
                <div className={styles.statValue}>21 days</div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.profileSection}>
          <h3>Company Benefits</h3>
          <div className={styles.skillsList}>
            <span className={styles.skillTag}>Health Insurance</span>
            <span className={styles.skillTag}>Flexible Hours</span>
            <span className={styles.skillTag}>Remote Work</span>
            <span className={styles.skillTag}>Professional Development</span>
            <span className={styles.skillTag}>Competitive Salary</span>
            <span className={styles.skillTag}>Team Building</span>
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
            <FiBell />
            <span className={styles.notificationBadge}>5</span>
          </button>
          <button className={styles.menuButton} onClick={() => setSidebarOpen(true)}>
            <FiMenu />
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
              <FiX />
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
              <FiHome />
              Overview
            </button>
            <button
              className={`${styles.navItem} ${activeTab === "jobs" ? styles.active : ""}`}
              onClick={() => {
                setActiveTab("jobs")
                setSidebarOpen(false)
              }}
            >
              <FiBriefcase />
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
              <FiUsers />
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
              <FiSettings />
              Company Profile
            </button>
          </nav>

          <div className={styles.sidebarFooter}>
            <button className={styles.logoutButton} onClick={handleLogout}>
              <FiLogOut />
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
