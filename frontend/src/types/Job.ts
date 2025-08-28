export interface Company {
  name: string
  description?: string
  industry?: string
  website?: string
  logo?: string
  size?: string
  founded?: number
  headquarters?: string
}

export interface Job {
  id: number
  title: string
  company: string
  companyDetails?: Company
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
