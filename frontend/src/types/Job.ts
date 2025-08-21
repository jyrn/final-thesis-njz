export interface Job {
  id: number
  title: string
  company: string
  location: string
  salary: string
  type: string
  level: string
  postedDate: string
  description: string
  requirements: string[]
  matchScore?: number
  matchingSkills?: string[]
}
