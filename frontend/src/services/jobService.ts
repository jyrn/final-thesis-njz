// Job service for fetching and managing job data
import { type ParsedResume, enhancedJobMatching } from "../utils/resumeParser"
import { apiService } from "./api"

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

  public setUserResume(resume: ParsedResume): void {
    this.userResume = resume
    this.updateJobMatches()
  }

  public async getRecommendedJobs(): Promise<Job[]> {
    try {
      // Fetch jobs from backend API
      const result = await apiService.getJobs()
      if (result.success && result.data) {
        this.jobs = result.data.map((job: any) => ({
          ...job,
          matchPercentage: 0,
          saved: false,
          applied: false
        }))
        
        // Calculate match percentages if user has resume
        if (this.userResume) {
          this.updateJobMatches()
        }
        
        return this.jobs
      } else {
        console.error('Failed to fetch jobs:', result.error)
        return []
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
      return []
    }
  }

  private updateJobMatches(): void {
    if (!this.userResume) return

    this.jobs = this.jobs.map(job => {
      const matchPercentage = enhancedJobMatching(this.userResume!, [job])[0]?.matchPercentage || 0
      return { ...job, matchPercentage }
    })
  }

  private formatPostedDate(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Today"
    if (diffDays === 2) return "Yesterday"
    if (diffDays <= 7) return `${diffDays - 1} days ago`
    if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`
    if (diffDays <= 365) return `${Math.floor(diffDays / 30)} months ago`
    return `${Math.floor(diffDays / 365)} years ago`
  }

  public toggleSaveJob(jobId: number): Job | null {
    const job = this.jobs.find(j => j.id === jobId)
    if (job) {
      job.saved = !job.saved
      return job
    }
    return null
  }

  public async applyToJob(jobId: number): Promise<Job | null> {
    try {
      const result = await apiService.applyForJob(jobId.toString(), {
        appliedAt: new Date().toISOString()
      })
      
      if (result.success) {
        const job = this.jobs.find(j => j.id === jobId)
        if (job) {
          job.applied = true
          return job
        }
      }
      return null
    } catch (error) {
      console.error('Error applying to job:', error)
      return null
    }
  }

  public getSavedJobs(): Job[] {
    return this.jobs.filter(job => job.saved)
  }

  public async getUserApplications(): Promise<Job[]> {
    try {
      const result = await apiService.getUserApplications()
      if (result.success && result.data) {
        return result.data
      }
      return []
    } catch (error) {
      console.error('Error fetching applications:', error)
      return []
    }
  }

  public async getEmployerListings(): Promise<Job[]> {
    try {
      const result = await apiService.getEmployerListings()
      if (result.success && result.data) {
        return result.data
      }
      return []
    } catch (error) {
      console.error('Error fetching employer listings:', error)
      return []
    }
  }

  public searchJobs(query: string, filters: any): Job[] {
    let filteredJobs = [...this.jobs]

    // Text search
    if (query) {
      const searchTerm = query.toLowerCase()
      filteredJobs = filteredJobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm) ||
        job.company.toLowerCase().includes(searchTerm) ||
        job.description.toLowerCase().includes(searchTerm) ||
        job.location.toLowerCase().includes(searchTerm)
      )
    }

    // Apply filters
    if (filters.location) {
      filteredJobs = filteredJobs.filter(job =>
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    if (filters.type) {
      filteredJobs = filteredJobs.filter(job => job.type === filters.type)
    }

    if (filters.level) {
      filteredJobs = filteredJobs.filter(job => job.level === filters.level)
    }

    if (filters.workplaceType) {
      filteredJobs = filteredJobs.filter(job => job.workplaceType === filters.workplaceType)
    }

    if (filters.salaryRange) {
      // Implement salary range filtering logic
      // This would require parsing salary strings and comparing ranges
    }

    // Sort by match percentage (if user has resume) or by date
    if (this.userResume) {
      filteredJobs.sort((a, b) => b.matchPercentage - a.matchPercentage)
    } else {
      filteredJobs.sort((a, b) => new Date(b.postedDate).getTime() - new Date(a.postedDate).getTime())
    }

    return filteredJobs
  }

  public getJobStats() {
    const totalJobs = this.jobs.length
    const savedJobs = this.jobs.filter(job => job.saved).length
    const appliedJobs = this.jobs.filter(job => job.applied).length
    const avgMatchPercentage = this.jobs.length > 0 
      ? this.jobs.reduce((sum, job) => sum + job.matchPercentage, 0) / this.jobs.length 
      : 0

    return {
      totalJobs,
      savedJobs,
      appliedJobs,
      avgMatchPercentage: Math.round(avgMatchPercentage)
    }
  }

  public async createJob(jobData: any): Promise<Job | null> {
    try {
      const result = await apiService.createJob(jobData)
      if (result.success && result.data) {
        const newJob = {
          ...result.data,
          matchPercentage: 0,
          saved: false,
          applied: false
        }
        this.jobs.unshift(newJob)
        return newJob
      }
      return null
    } catch (error) {
      console.error('Error creating job:', error)
      return null
    }
  }

  public async updateJob(jobId: number, jobData: any): Promise<Job | null> {
    try {
      const result = await apiService.updateJob(jobId.toString(), jobData)
      if (result.success && result.data) {
        const index = this.jobs.findIndex(job => job.id === jobId)
        if (index !== -1) {
          this.jobs[index] = { ...this.jobs[index], ...result.data }
          return this.jobs[index]
        }
      }
      return null
    } catch (error) {
      console.error('Error updating job:', error)
      return null
    }
  }

  public async deleteJob(jobId: number): Promise<boolean> {
    try {
      const result = await apiService.deleteJob(jobId.toString())
      if (result.success) {
        this.jobs = this.jobs.filter(job => job.id !== jobId)
        return true
      }
      return false
    } catch (error) {
      console.error('Error deleting job:', error)
      return false
    }
  }
}

export default JobService
