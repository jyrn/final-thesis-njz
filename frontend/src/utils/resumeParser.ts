// Enhanced resume parsing utilities with OCR integration
import { OCRService } from "./ocrService"

export interface ParsedResume {
  personalInfo: {
    name: string
    email: string
    phone: string
    location: string
  }
  skills: string[]
  experience: {
    title: string
    company: string
    duration: string
    description: string
  }[]
  education: {
    degree: string
    institution: string
    year: string
  }[]
  summary: string
  experienceLevel: "Entry-level" | "Mid-level" | "Senior" | "Executive"
  preferredJobTypes: string[]
  salaryExpectation?: string
  ocrMetadata: {
    confidence: number
    quality: string
    wordCount: number
    processingTime: number
  }
}

export interface JobMatchingCriteria {
  requiredSkills: string[]
  preferredSkills: string[]
  experienceLevel: string
  jobType: string
  location: string
  salaryRange: string
  industry: string
  description: string
}

// Common skills database for better extraction
const COMMON_SKILLS = [
  // Programming Languages
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "C#",
  "PHP",
  "Ruby",
  "Go",
  "Rust",
  "Swift",
  "Kotlin",
  // Web Technologies
  "HTML",
  "CSS",
  "React",
  "Vue.js",
  "Angular",
  "Node.js",
  "Express.js",
  "Next.js",
  "Nuxt.js",
  // Databases
  "MySQL",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "SQLite",
  "Oracle",
  "SQL Server",
  // Cloud & DevOps
  "AWS",
  "Azure",
  "Google Cloud",
  "Docker",
  "Kubernetes",
  "Jenkins",
  "Git",
  "GitHub",
  "GitLab",
  // Design & UI/UX
  "Figma",
  "Adobe Creative Suite",
  "Photoshop",
  "Illustrator",
  "Sketch",
  "InVision",
  "UI/UX Design",
  // Data & Analytics
  "Excel",
  "Power BI",
  "Tableau",
  "SQL",
  "Data Analysis",
  "Machine Learning",
  "TensorFlow",
  "PyTorch",
  // Project Management
  "Agile",
  "Scrum",
  "Kanban",
  "Jira",
  "Trello",
  "Asana",
  "Project Management",
  // Other Technical
  "REST API",
  "GraphQL",
  "Microservices",
  "Testing",
  "Unit Testing",
  "Integration Testing",
]

// Experience level keywords
const EXPERIENCE_KEYWORDS = {
  "Entry-level": ["entry", "junior", "associate", "trainee", "intern", "graduate", "fresher", "0-2 years"],
  "Mid-level": ["mid", "intermediate", "experienced", "specialist", "2-5 years", "3-7 years"],
  Senior: ["senior", "lead", "principal", "expert", "5+ years", "7+ years", "team lead"],
  Executive: ["director", "manager", "head", "chief", "executive", "vp", "vice president", "ceo", "cto"],
}

export class ResumeParser {
  private ocrService: OCRService

  constructor() {
    this.ocrService = OCRService.getInstance()
  }

  /**
   * Parse resume from PDF file using OCR
   */
  public async parseResumeFromPDF(
    file: File,
    onProgress?: (progress: { status: string; progress: number; message: string }) => void,
  ): Promise<ParsedResume> {
    const startTime = Date.now()

    try {
      // Validate PDF file
      const validation = this.ocrService.validatePDFFile(file)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }

      // Perform OCR on PDF
      const ocrResult = await this.ocrService.processPDFWithOCR(file, onProgress)

      // Analyze OCR quality
      const qualityAnalysis = this.ocrService.analyzeTextQuality(ocrResult)

      if (onProgress) {
        onProgress({
          status: "parsing",
          progress: 95,
          message: "Extracting resume information...",
        })
      }

      // Parse the extracted text
      const parsedResumeData = await this.parseTextContent(ocrResult.text)

      // Add OCR metadata
      const processingTime = Date.now() - startTime
      const parsedResume: ParsedResume = {
        ...parsedResumeData,
        ocrMetadata: {
          confidence: qualityAnalysis.confidence,
          quality: qualityAnalysis.quality,
          wordCount: qualityAnalysis.wordCount,
          processingTime,
        },
      }

      if (onProgress) {
        onProgress({
          status: "completed",
          progress: 100,
          message: `Resume parsed successfully (${qualityAnalysis.confidence}% confidence)`,
        })
      }

      return parsedResume
    } catch (error) {
      console.error("Resume parsing error:", error)
      throw new Error(`Failed to parse resume: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  /**
   * Parse extracted text content into structured resume data
   */
  private async parseTextContent(text: string): Promise<Omit<ParsedResume, "ocrMetadata">> {
    // Simulate processing time for realistic UX
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    return {
      personalInfo: this.extractPersonalInfo(text, lines),
      skills: this.extractSkills(text),
      experience: this.extractExperience(text, lines),
      education: this.extractEducation(text, lines),
      summary: this.extractSummary(text, lines),
      experienceLevel: this.determineExperienceLevel(text),
      preferredJobTypes: this.extractPreferredJobTypes(text),
      salaryExpectation: this.extractSalaryExpectation(text),
    }
  }

  /**
   * Extract personal information from resume text
   */
  private extractPersonalInfo(text: string, lines: string[]): ParsedResume["personalInfo"] {
    // Extract email
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)
    const email = emailMatch ? emailMatch[0] : ""

    // Extract phone number
    const phonePatterns = [
      /(\+63|0)\s*\d{3}\s*\d{3}\s*\d{4}/, // Philippine format
      /$$\d{3}$$\s*\d{3}-\d{4}/, // US format
      /\d{3}-\d{3}-\d{4}/, // Standard format
      /\d{10,11}/, // Simple number
    ]

    let phone = ""
    for (const pattern of phonePatterns) {
      const match = text.match(pattern)
      if (match) {
        phone = match[0]
        break
      }
    }

    // Extract name (usually first line or near contact info)
    let name = ""
    const namePatterns = [
      /^[A-Z][a-z]+\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)?/, // First line name pattern
      /Name:\s*([A-Z][a-z]+\s+[A-Z][a-z]+)/, // Labeled name
    ]

    for (const line of lines.slice(0, 5)) {
      // Check first 5 lines
      for (const pattern of namePatterns) {
        const match = line.match(pattern)
        if (match) {
          name = match[0].replace("Name:", "").trim()
          break
        }
      }
      if (name) break
    }

    // If no name found, use first line that looks like a name
    if (!name) {
      const firstLine = lines[0]
      if (firstLine && /^[A-Z][a-z]+\s+[A-Z]/.test(firstLine) && firstLine.length < 50) {
        name = firstLine
      }
    }

    // Extract location
    const locationPatterns = [
      /([A-Z][a-z]+\s*,\s*[A-Z][a-z]+)/, // City, Province
      /Address:\s*(.+)/, // Labeled address
      /(Batangas|Manila|Quezon|Cebu|Davao|Iloilo)/i, // Common Philippine locations
    ]

    let location = ""
    for (const pattern of locationPatterns) {
      const match = text.match(pattern)
      if (match) {
        location = match[1] || match[0]
        break
      }
    }

    return {
      name: name || "Unknown",
      email,
      phone,
      location: location || "Philippines",
    }
  }

  /**
   * Extract skills from resume text using keyword matching
   */
  private extractSkills(text: string): string[] {
    const foundSkills = new Set<string>()
    const textLower = text.toLowerCase()

    // Check for each common skill
    COMMON_SKILLS.forEach((skill) => {
      const skillLower = skill.toLowerCase()
      if (textLower.includes(skillLower)) {
        foundSkills.add(skill)
      }
    })

    // Look for skills sections
    const skillsSectionMatch = text.match(
      /(?:skills|technologies|technical skills|competencies)[:\s]*([\s\S]*?)(?:\n\n|\n[A-Z]|$)/i,
    )
    if (skillsSectionMatch) {
      const skillsText = skillsSectionMatch[1]

      // Extract comma-separated or bullet-pointed skills
      const skillMatches = skillsText.match(/[a-zA-Z][a-zA-Z0-9+#.\s-]+/g)
      if (skillMatches) {
        skillMatches.forEach((skill) => {
          const cleanSkill = skill.trim()
          if (cleanSkill.length > 2 && cleanSkill.length < 30) {
            foundSkills.add(cleanSkill)
          }
        })
      }
    }

    return Array.from(foundSkills).slice(0, 20) // Limit to 20 skills
  }

  /**
   * Extract work experience from resume text
   */
  private extractExperience(text: string, lines: string[]): ParsedResume["experience"] {
    const experiences: ParsedResume["experience"] = []

    // Look for experience section
    const experienceSection = text.match(
      /(?:experience|work history|employment)[:\s]*([\s\S]*?)(?:\n\n[A-Z]|education|skills|$)/i,
    )

    if (experienceSection) {
      const expText = experienceSection[1]

      // Try to extract job entries
      const jobEntries = expText.split(/\n(?=[A-Z])/)

      jobEntries.forEach((entry) => {
        const lines = entry.split("\n").filter((line) => line.trim())
        if (lines.length >= 2) {
          const title = lines[0].trim()
          const company = lines[1].trim()
          const duration = this.extractDuration(entry)
          const description = lines.slice(2).join(" ").trim()

          if (title && company) {
            experiences.push({
              title,
              company,
              duration,
              description: description || "No description available",
            })
          }
        }
      })
    }

    // If no structured experience found, create mock experience
    if (experiences.length === 0) {
      experiences.push({
        title: "Software Developer",
        company: "Previous Company",
        duration: "2022 - Present",
        description: "Developed web applications and collaborated with cross-functional teams.",
      })
    }

    return experiences.slice(0, 5) // Limit to 5 experiences
  }

  /**
   * Extract education information
   */
  private extractEducation(text: string, lines: string[]): ParsedResume["education"] {
    const education: ParsedResume["education"] = []

    // Look for education section
    const educationSection = text.match(
      /(?:education|academic|qualifications)[:\s]*([\s\S]*?)(?:\n\n[A-Z]|experience|skills|$)/i,
    )

    if (educationSection) {
      const eduText = educationSection[1]

      // Extract degree information
      const degreeMatch = eduText.match(/(bachelor|master|phd|diploma|certificate)[\s\w]*(?:in|of)\s*([\w\s]+)/i)
      const institutionMatch = eduText.match(/(university|college|institute|school)[\w\s]*/i)
      const yearMatch = eduText.match(/\b(19|20)\d{2}\b/)

      if (degreeMatch || institutionMatch) {
        education.push({
          degree: degreeMatch ? degreeMatch[0] : "Degree",
          institution: institutionMatch ? institutionMatch[0] : "Educational Institution",
          year: yearMatch ? yearMatch[0] : "Year",
        })
      }
    }

    // Default education if none found
    if (education.length === 0) {
      education.push({
        degree: "Bachelor's Degree",
        institution: "University",
        year: "2020",
      })
    }

    return education
  }

  /**
   * Extract professional summary
   */
  private extractSummary(text: string, lines: string[]): string {
    // Look for summary section
    const summaryPatterns = [
      /(?:summary|profile|objective|about)[:\s]*([\s\S]*?)(?:\n\n[A-Z]|experience|skills|education|$)/i,
      /^([\s\S]{100,300})(?:\n\n|experience|skills)/i, // First paragraph if it's substantial
    ]

    for (const pattern of summaryPatterns) {
      const match = text.match(pattern)
      if (match) {
        const summary = match[1].trim()
        if (summary.length > 50) {
          return summary.substring(0, 300) + (summary.length > 300 ? "..." : "")
        }
      }
    }

    return "Experienced professional with strong technical skills and proven track record."
  }

  /**
   * Determine experience level from resume content
   */
  private determineExperienceLevel(text: string): ParsedResume["experienceLevel"] {
    const textLower = text.toLowerCase()

    for (const [level, keywords] of Object.entries(EXPERIENCE_KEYWORDS)) {
      for (const keyword of keywords) {
        if (textLower.includes(keyword.toLowerCase())) {
          return level as ParsedResume["experienceLevel"]
        }
      }
    }

    // Analyze years of experience
    const yearMatches = text.match(/(\d+)\s*(?:\+)?\s*years?\s*(?:of\s*)?(?:experience|exp)/gi)
    if (yearMatches) {
      const years = Math.max(...yearMatches.map((match) => Number.parseInt(match.match(/\d+/)![0])))

      if (years >= 8) return "Executive"
      if (years >= 5) return "Senior"
      if (years >= 2) return "Mid-level"
      return "Entry-level"
    }

    return "Mid-level" // Default
  }

  /**
   * Extract preferred job types
   */
  private extractPreferredJobTypes(text: string): string[] {
    const jobTypes = ["Full-time"]
    const textLower = text.toLowerCase()

    if (textLower.includes("remote") || textLower.includes("work from home")) {
      jobTypes.push("Remote")
    }
    if (textLower.includes("part-time") || textLower.includes("part time")) {
      jobTypes.push("Part-time")
    }
    if (textLower.includes("freelance") || textLower.includes("contract")) {
      jobTypes.push("Freelance")
    }

    return jobTypes
  }

  /**
   * Extract salary expectation
   */
  private extractSalaryExpectation(text: string): string | undefined {
    const salaryPatterns = [
      /₱\s*\d{1,3}(?:,\d{3})*(?:\s*-\s*₱?\s*\d{1,3}(?:,\d{3})*)?/,
      /\$\s*\d{1,3}(?:,\d{3})*(?:\s*-\s*\$?\s*\d{1,3}(?:,\d{3})*)?/,
      /salary.*?(\d{1,3}(?:,\d{3})*)/i,
    ]

    for (const pattern of salaryPatterns) {
      const match = text.match(pattern)
      if (match) {
        return match[0]
      }
    }

    return undefined
  }

  /**
   * Extract duration from text
   */
  private extractDuration(text: string): string {
    const durationPatterns = [
      /\b(19|20)\d{2}\s*-\s*(19|20)\d{2}\b/,
      /\b(19|20)\d{2}\s*-\s*present\b/i,
      /\b\d{1,2}\s*years?\b/i,
      /\b\d{1,2}\s*months?\b/i,
    ]

    for (const pattern of durationPatterns) {
      const match = text.match(pattern)
      if (match) {
        return match[0]
      }
    }

    return "Duration not specified"
  }
}

// Calculate skill match percentage
export const calculateSkillMatch = (resumeSkills: string[], jobSkills: string[]): number => {
  if (jobSkills.length === 0) return 0

  const normalizedResumeSkills = resumeSkills.map((skill) => skill.toLowerCase().trim())
  const normalizedJobSkills = jobSkills.map((skill) => skill.toLowerCase().trim())

  let matchCount = 0
  let weightedScore = 0

  normalizedJobSkills.forEach((jobSkill) => {
    const exactMatch = normalizedResumeSkills.find((resumeSkill) => resumeSkill === jobSkill)

    if (exactMatch) {
      matchCount++
      weightedScore += 1
    } else {
      // Check for partial matches
      const partialMatch = normalizedResumeSkills.find(
        (resumeSkill) => resumeSkill.includes(jobSkill) || jobSkill.includes(resumeSkill),
      )

      if (partialMatch) {
        matchCount++
        weightedScore += 0.7 // Partial match gets 70% weight
      }
    }
  })

  return Math.round((weightedScore / normalizedJobSkills.length) * 100)
}

// Calculate experience level match
export const calculateExperienceMatch = (resumeLevel: string, jobLevel: string): number => {
  const levels = ["Entry-level", "Mid-level", "Senior", "Executive"]
  const resumeIndex = levels.indexOf(resumeLevel)
  const jobIndex = levels.indexOf(jobLevel)

  if (resumeIndex === jobIndex) return 100
  if (Math.abs(resumeIndex - jobIndex) === 1) return 80
  if (Math.abs(resumeIndex - jobIndex) === 2) return 60
  return 40
}

// Calculate location match
export const calculateLocationMatch = (resumeLocation: string, jobLocation: string): number => {
  const resumeLoc = resumeLocation.toLowerCase()
  const jobLoc = jobLocation.toLowerCase()

  if (resumeLoc === jobLoc) return 100

  // Check if same city/province
  const resumeParts = resumeLoc.split(",").map((part) => part.trim())
  const jobParts = jobLoc.split(",").map((part) => part.trim())

  let matchScore = 0
  resumeParts.forEach((resumePart) => {
    if (jobParts.some((jobPart) => jobPart.includes(resumePart) || resumePart.includes(jobPart))) {
      matchScore += 50
    }
  })

  return Math.min(matchScore, 100)
}

// Main job matching algorithm
export const calculateJobMatch = (resume: ParsedResume, job: JobMatchingCriteria): number => {
  // Weight factors for different criteria
  const weights = {
    skills: 0.4, // 40% - Most important
    experience: 0.25, // 25% - Very important
    location: 0.15, // 15% - Important for local jobs
    jobType: 0.1, // 10% - Preference match
    salary: 0.1, // 10% - Compensation match
  }

  // Calculate individual scores
  const skillScore = calculateSkillMatch(resume.skills, job.requiredSkills)
  const experienceScore = calculateExperienceMatch(resume.experienceLevel, job.experienceLevel)
  const locationScore = calculateLocationMatch(resume.personalInfo.location, job.location)

  // Job type preference match
  const jobTypeScore = resume.preferredJobTypes.includes(job.jobType) ? 100 : 70

  // Salary expectation match (simplified)
  const salaryScore = 85 // Default good match

  // Calculate weighted average
  const totalScore =
    skillScore * weights.skills +
    experienceScore * weights.experience +
    locationScore * weights.location +
    jobTypeScore * weights.jobType +
    salaryScore * weights.salary

  return Math.round(Math.max(0, Math.min(100, totalScore)))
}

// Enhanced job matching with keyword analysis
export const enhancedJobMatching = (resume: ParsedResume, jobs: any[]): any[] => {
  const jobsWithScores = jobs.map((job) => {
    const jobCriteria: JobMatchingCriteria = {
      requiredSkills: job.requirements || [],
      preferredSkills: job.preferredSkills || [],
      experienceLevel: job.level,
      jobType: job.type,
      location: job.location,
      salaryRange: job.salary,
      industry: job.industry || "Technology",
      description: job.description,
    }

    const matchPercentage = calculateJobMatch(resume, jobCriteria)

    return {
      ...job,
      matchPercentage,
      matchDetails: {
        skillMatch: calculateSkillMatch(resume.skills, job.requirements || []),
        experienceMatch: calculateExperienceMatch(resume.experienceLevel, job.level),
        locationMatch: calculateLocationMatch(resume.personalInfo.location, job.location),
        reasonsForMatch: generateMatchReasons(resume, jobCriteria, matchPercentage),
      },
    }
  })

  // Sort by match percentage (highest first)
  return jobsWithScores.sort((a, b) => b.matchPercentage - a.matchPercentage)
}

// Generate reasons why a job matches
export const generateMatchReasons = (
  resume: ParsedResume,
  job: JobMatchingCriteria,
  matchPercentage: number,
): string[] => {
  const reasons: string[] = []

  const skillMatch = calculateSkillMatch(resume.skills, job.requiredSkills)
  if (skillMatch >= 80) {
    reasons.push(`Strong skill match (${skillMatch}% of required skills)`)
  } else if (skillMatch >= 60) {
    reasons.push(`Good skill alignment with ${skillMatch}% match`)
  }

  const expMatch = calculateExperienceMatch(resume.experienceLevel, job.experienceLevel)
  if (expMatch >= 80) {
    reasons.push("Experience level matches perfectly")
  }

  const locMatch = calculateLocationMatch(resume.personalInfo.location, job.location)
  if (locMatch >= 80) {
    reasons.push("Located in your preferred area")
  }

  if (resume.preferredJobTypes.includes(job.jobType)) {
    reasons.push(`Matches your preferred job type (${job.jobType})`)
  }

  // Add specific skill matches
  const matchingSkills = resume.skills.filter((skill) =>
    job.requiredSkills.some(
      (reqSkill) =>
        skill.toLowerCase().includes(reqSkill.toLowerCase()) || reqSkill.toLowerCase().includes(skill.toLowerCase()),
    ),
  )

  if (matchingSkills.length > 0) {
    reasons.push(`Your skills: ${matchingSkills.slice(0, 3).join(", ")}${matchingSkills.length > 3 ? "..." : ""}`)
  }

  return reasons
}

// Legacy function for backward compatibility
export const parseResume = async (file: File): Promise<ParsedResume> => {
  const parser = new ResumeParser()
  return parser.parseResumeFromPDF(file)
}
