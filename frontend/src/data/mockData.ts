import type { StatItem, JobPosting, Applicant, Employer } from '@/types/dashboard';

export const mockEmployer: Employer = {
  id: 1,
  name: "TechCorp Inc.",
  email: "contact@techcorp.com",
  phone: "(555) 123-4567",
  address: "123 Tech Street, San Francisco, CA 94107",
  avatar: "https://randomuser.me/api/portraits/lego/1.jpg",
  industry: "Information Technology",
  companySize: "51-200 employees"
};

export const statsData: StatItem[] = [
  { 
    id: 1, 
    title: 'Active Jobs', 
    value: '24', 
    change: 12, 
    trend: 'up', 
    icon: 'FiBriefcase'
  },
  { 
    id: 2, 
    title: 'Total Applicants', 
    value: '186', 
    change: 23, 
    trend: 'up', 
    icon: 'FiUsers'
  },
  { 
    id: 3, 
    title: 'Interviews', 
    value: '42', 
    change: 5, 
    trend: 'up', 
    icon: 'FiUserCheck'
  },
  { 
    id: 4, 
    title: 'Avg. Salary', 
    value: '₱65k', 
    change: 8, 
    trend: 'up', 
    icon: 'FiDollarSign'
  },
];

export const mockJobPostings: JobPosting[] = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    location: "Makati City, Metro Manila",
    type: "Full-time",
    applicants: 24,
    posted: "2 days ago",
    status: "active",
    salary: "₱120,000 - ₱150,000",
    views: 156,
    description: "We are looking for an experienced Frontend Developer to join our team...",
    requirements: ["React", "TypeScript", "Redux", "CSS"],
    urgency: "high",
    matchQuality: 92,
    department: "Engineering",
    postedDate: "2024-01-15T10:30:00Z",
    remote: false
  },
  {
    id: 2,
    title: "UX/UI Designer",
    location: "Remote",
    type: "Full-time",
    applicants: 18,
    posted: "1 week ago",
    status: "active",
    salary: "₱90,000 - ₱120,000",
    views: 210,
    description: "Looking for a creative UX/UI Designer to create amazing user experiences...",
    requirements: ["Figma", "Sketch", "Adobe XD", "User Research"],
    urgency: "medium",
    matchQuality: 85,
    department: "Design",
    postedDate: "2024-01-08T14:20:00Z",
    remote: true
  },
  {
    id: 3,
    title: "Backend Engineer",
    location: "Taguig City, Metro Manila",
    type: "Full-time",
    applicants: 15,
    posted: "3 days ago",
    status: "active",
    salary: "₱130,000 - ₱160,000",
    views: 98,
    description: "Join our backend team to build scalable and efficient systems...",
    requirements: ["Node.js", "Python", "Docker", "AWS", "SQL"],
    urgency: "high",
    matchQuality: 88,
    department: "Engineering",
    postedDate: "2024-01-13T09:15:00Z",
    remote: false
  }
];

export const mockApplicants: Applicant[] = [
  {
    id: 1,
    name: "John Doe",
    position: "Senior Frontend Developer",
    status: "New",
    date: "2023-04-15",
    match: 92,
    experience: "5 years",
    skills: ["React", "TypeScript", "Redux", "CSS", "Jest"],
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    resumeUrl: "/resumes/john-doe-resume.pdf",
    statusType: "info",
    priority: "high",
    jobTitle: "Senior Frontend Developer",
    appliedDate: "2023-04-15",
    matchScore: 92,
    lastActivity: "2 hours ago",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg"
  },
  {
    id: 2,
    name: "Jane Smith",
    position: "UX/UI Designer",
    status: "In Review",
    date: "2023-04-14",
    match: 85,
    experience: "4 years",
    skills: ["Figma", "Sketch", "User Research", "Prototyping"],
    email: "jane.smith@example.com",
    phone: "(555) 987-6543",
    resumeUrl: "/resumes/jane-smith-resume.pdf",
    statusType: "info",
    priority: "medium",
    jobTitle: "UX/UI Designer",
    appliedDate: "2023-04-14",
    matchScore: 85,
    lastActivity: "1 day ago",
    avatar: "https://randomuser.me/api/portraits/women/2.jpg"
  },
  {
    id: 3,
    name: "Alex Johnson",
    position: "Backend Engineer",
    status: "Interview Scheduled",
    date: "2023-04-12",
    match: 88,
    experience: "6 years",
    skills: ["Node.js", "Python", "AWS", "Docker", "PostgreSQL"],
    email: "alex.johnson@example.com",
    phone: "(555) 456-7890",
    resumeUrl: "/resumes/alex-johnson-resume.pdf",
    statusType: "success",
    priority: "high",
    jobTitle: "Backend Engineer",
    appliedDate: "2023-04-12",
    matchScore: 88,
    lastActivity: "3 hours ago",
    avatar: "https://randomuser.me/api/portraits/men/3.jpg"
  }
];
