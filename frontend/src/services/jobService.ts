// Job service for fetching and managing job data
import { type ParsedResume, enhancedJobMatching } from "../utils/resumeParser"

export interface Job {
  id: number
  title: string
  company: string
  location: string
  salary: string
  type: string
  level: string
  workplaceType: string
  description: string
  requirements: string[]
  preferredSkills?: string[]
  industry: string
  postedDate: string
  matchPercentage: number
  saved: boolean
  applied: boolean
  matchDetails?: {
    skillMatch: number
    experienceMatch: number
    locationMatch: number
    reasonsForMatch: string[]
  }
}

// Mock job database - in real app, this would come from your backend
const mockJobs: Omit<Job, "matchPercentage" | "saved" | "applied" | "matchDetails">[] = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "Google Philippines",
    location: "Makati City, Metro Manila",
    salary: "₱80,000 - ₱120,000/mo",
    type: "Full-time",
    level: "Senior",
    workplaceType: "Hybrid",
    description:
      "Lead frontend development initiatives using React, TypeScript, and modern web technologies. Collaborate with cross-functional teams to deliver exceptional user experiences.",
    requirements: ["React", "TypeScript", "JavaScript", "HTML/CSS", "Node.js", "Git", "Agile Methodology"],
    preferredSkills: ["Next.js", "GraphQL", "Testing", "UI/UX Design"],
    industry: "Technology",
    postedDate: "2024-01-20",
  },
  {
    id: 2,
    title: "UX/UI Designer",
    company: "Shopee Philippines",
    location: "Taguig City, Metro Manila",
    salary: "₱50,000 - ₱75,000/mo",
    type: "Full-time",
    level: "Mid-level",
    workplaceType: "Hybrid",
    description:
      "Design intuitive user interfaces and experiences for mobile and web applications. Conduct user research and create prototypes.",
    requirements: ["UI/UX Design", "Figma", "Adobe Creative Suite", "User Research", "Prototyping"],
    preferredSkills: ["Sketch", "InVision", "User Testing", "Design Systems"],
    industry: "E-commerce",
    postedDate: "2024-01-19",
  },
  {
    id: 3,
    title: "Full Stack Developer",
    company: "Accenture Philippines",
    location: "Lipa City, Batangas",
    salary: "₱45,000 - ₱65,000/mo",
    type: "Full-time",
    level: "Mid-level",
    workplaceType: "On-site",
    description:
      "Develop end-to-end web applications using modern JavaScript frameworks. Work with both frontend and backend technologies.",
    requirements: ["JavaScript", "React", "Node.js", "MongoDB", "Express.js", "HTML/CSS"],
    preferredSkills: ["Python", "AWS", "Docker", "Microservices"],
    industry: "Consulting",
    postedDate: "2024-01-18",
  },
  {
    id: 4,
    title: "Junior Web Developer",
    company: "Local Tech Startup",
    location: "Batangas City, Batangas",
    salary: "₱25,000 - ₱35,000/mo",
    type: "Full-time",
    level: "Entry-level",
    workplaceType: "Remote",
    description:
      "Join our growing team to build innovative web solutions. Perfect opportunity for recent graduates to grow their skills.",
    requirements: ["HTML/CSS", "JavaScript", "Git", "Responsive Design"],
    preferredSkills: ["React", "Vue.js", "Bootstrap", "jQuery"],
    industry: "Startup",
    postedDate: "2024-01-17",
  },
  {
    id: 5,
    title: "Product Designer",
    company: "GCash (Globe Fintech)",
    location: "Bonifacio Global City, Taguig",
    salary: "₱70,000 - ₱95,000/mo",
    type: "Full-time",
    level: "Senior",
    workplaceType: "Hybrid",
    description:
      "Lead product design for fintech solutions. Create user-centered designs that solve complex financial problems.",
    requirements: ["Product Design", "UI/UX Design", "User Research", "Prototyping", "Design Systems"],
    preferredSkills: ["Fintech Experience", "Mobile Design", "Data Visualization"],
    industry: "Fintech",
    postedDate: "2024-01-16",
  },
  {
    id: 6,
    title: "React Developer",
    company: "Thinking Machines",
    location: "Makati City, Metro Manila",
    salary: "₱60,000 - ₱85,000/mo",
    type: "Full-time",
    level: "Mid-level",
    workplaceType: "Remote",
    description:
      "Build data visualization dashboards and web applications using React and D3.js. Work with data scientists and analysts.",
    requirements: ["React", "JavaScript", "TypeScript", "D3.js", "HTML/CSS"],
    preferredSkills: ["Data Visualization", "Python", "Machine Learning", "Statistics"],
    industry: "Data Science",
    postedDate: "2024-01-15",
  },
  {
    id: 7,
    title: "Frontend Engineer",
    company: "Kumu (Kumu Networks)",
    location: "Quezon City, Metro Manila",
    salary: "₱55,000 - ₱80,000/mo",
    type: "Full-time",
    level: "Mid-level",
    workplaceType: "Hybrid",
    description:
      "Develop mobile-first web applications for social media platform. Focus on performance and user engagement.",
    requirements: ["React", "JavaScript", "Mobile Development", "Performance Optimization"],
    preferredSkills: ["React Native", "WebRTC", "Real-time Applications"],
    industry: "Social Media",
    postedDate: "2024-01-14",
  },
  {
    id: 8,
    title: "Web Developer",
    company: "Pointwest Technologies",
    location: "Alabang, Muntinlupa",
    salary: "₱40,000 - ₱55,000/mo",
    type: "Full-time",
    level: "Mid-level",
    workplaceType: "On-site",
    description:
      "Develop enterprise web applications using modern frameworks. Work on projects for international clients.",
    requirements: ["JavaScript", "HTML/CSS", "Git", "Agile Methodology"],
    preferredSkills: ["Angular", "Vue.js", "PHP", "Laravel"],
    industry: "Software Development",
    postedDate: "2024-01-13",
  },
]

export class JobService {
  private static instance: JobService
  private jobs: Job[] = []
  private userResume: ParsedResume | null = null

  private constructor() {}

  public static getInstance(): JobService {
    if (!JobService.instance) {
      JobService.instance = new JobService()
    }
    return JobService.instance
  }

  // Set user resume for job matching
  public setUserResume(resume: ParsedResume): void {
    this.userResume = resume
    this.updateJobMatches()
  }

  // Get jobs with ML-powered matching
  public async getRecommendedJobs(): Promise<Job[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (!this.userResume) {
      // Return jobs without matching if no resume
      return mockJobs.map((job) => ({
        ...job,
        matchPercentage: Math.floor(Math.random() * 40) + 30, // Random 30-70%
        saved: false,
        applied: false,
        postedDate: this.formatPostedDate(job.postedDate),
      }))
    }

    // Use ML-powered matching
    const jobsWithDefaults = mockJobs.map((job) => ({
      ...job,
      saved: false,
      applied: false,
      matchPercentage: 0,
      postedDate: this.formatPostedDate(job.postedDate),
    }))

    const matchedJobs = enhancedJobMatching(this.userResume, jobsWithDefaults)
    this.jobs = matchedJobs

    return matchedJobs
  }

  // Update job matches when resume changes
  private updateJobMatches(): void {
    if (this.jobs.length > 0 && this.userResume) {
      this.jobs = enhancedJobMatching(this.userResume, this.jobs)
    }
  }

  // Format posted date to relative time
  private formatPostedDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "1 day ago"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 14) return "1 week ago"
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  // Save/unsave job
  public toggleSaveJob(jobId: number): Job | null {
    const job = this.jobs.find((j) => j.id === jobId)
    if (job) {
      job.saved = !job.saved
      return job
    }
    return null
  }

  // Apply to job
  public applyToJob(jobId: number): Job | null {
    const job = this.jobs.find((j) => j.id === jobId)
    if (job) {
      job.applied = true
      return job
    }
    return null
  }

  // Get saved jobs
  public getSavedJobs(): Job[] {
    return this.jobs.filter((job) => job.saved)
  }

  // Search and filter jobs
  public searchJobs(query: string, filters: any): Job[] {
    let filteredJobs = [...this.jobs]

    // Text search
    if (query.trim()) {
      const searchTerm = query.toLowerCase()
      filteredJobs = filteredJobs.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm) ||
          job.company.toLowerCase().includes(searchTerm) ||
          job.description.toLowerCase().includes(searchTerm) ||
          job.requirements.some((req) => req.toLowerCase().includes(searchTerm)),
      )
    }

    // Apply filters
    if (filters.jobType) {
      filteredJobs = filteredJobs.filter((job) => job.type === filters.jobType)
    }
    if (filters.positionLevel) {
      filteredJobs = filteredJobs.filter((job) => job.level === filters.positionLevel)
    }
    if (filters.workplaceSetup) {
      filteredJobs = filteredJobs.filter((job) => job.workplaceType === filters.workplaceSetup)
    }
    if (filters.location) {
      filteredJobs = filteredJobs.filter((job) => job.location.toLowerCase().includes(filters.location.toLowerCase()))
    }

    // Sort by match percentage
    return filteredJobs.sort((a, b) => b.matchPercentage - a.matchPercentage)
  }

  // Get job statistics
  public getJobStats() {
    return {
      totalJobs: this.jobs.length,
      highMatches: this.jobs.filter((job) => job.matchPercentage >= 80).length,
      mediumMatches: this.jobs.filter((job) => job.matchPercentage >= 60 && job.matchPercentage < 80).length,
      appliedJobs: this.jobs.filter((job) => job.applied).length,
      savedJobs: this.jobs.filter((job) => job.saved).length,
    }
  }
}
