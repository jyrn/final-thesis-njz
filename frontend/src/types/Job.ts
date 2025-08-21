export interface Job {
  id: number
  title: string
  company: string
  location: string
  salary: number
  type: string
  level: string
  postedDate: string
  description: string
  requirements?: string[]
  matchScore?: number
  matchingSkills?: string[]
  isRemote?: boolean
  isHybrid?: boolean
  experienceLevel?: string
  lastUpdated?: string
  workplaceType?: 'On-site' | 'Hybrid' | 'Remote'
}
