import { Job } from '../types/Job';

export const mockJobs: Job[] = [
  {
    id: 1,
    title: "UI/UX Designer",
    company: "Accenture",
    location: "Taguig, Metro Manila",
    salary: "60,000 - 90,000/month",
    type: "Full time",
    level: "Mid to Senior",
    postedDate: "1 day ago",
    description: "Looking for a talented UI/UX Designer to create amazing user experiences...",
    requirements: ["Figma", "Adobe XD", "User Research", "Prototyping", "Responsive Design"]
  },
  {
    id: 2,
    title: "Frontend Developer",
    company: "Shopee Philippines",
    location: "Pasig, Metro Manila",
    salary: "80,000 - 120,000/month",
    type: "Full time",
    level: "Mid to Senior",
    postedDate: "2 days ago",
    description: "Join our team to build amazing e-commerce experiences...",
    requirements: ["React", "TypeScript", "Vue.js", "Responsive Design"]
  },
  {
    id: 3,
    title: "Backend Developer",
    company: "GCash",
    location: "Taguig, Metro Manila",
    salary: "90,000 - 150,000/month",
    type: "Full time",
    level: "Senior",
    postedDate: "3 days ago",
    description: "Help us build the next generation of digital banking...",
    requirements: ["Node.js", "Python", "Java", "Microservices", "Cloud Computing"]
  },
  {
    id: 4,
    title: "Data Analyst",
    company: "Lazada",
    location: "Taguig, Metro Manila",
    salary: "50,000 - 80,000/month",
    type: "Full time",
    level: "Mid-level",
    postedDate: "4 days ago",
    description: "Transform data into actionable business insights...",
    requirements: ["SQL", "Python", "Tableau", "Data Visualization"]
  },
  {
    id: 5,
    title: "Digital Marketing Specialist",
    company: "Ayala Land",
    location: "Makati, Metro Manila",
    salary: "40,000 - 60,000/month",
    type: "Full time",
    level: "Junior to Mid-level",
    postedDate: "5 days ago",
    description: "Drive digital marketing campaigns for premium real estate...",
    requirements: ["Social Media Marketing", "SEO", "Content Creation", "Google Analytics"]
  },
  {
    id: 6,
    title: "Software Engineering Intern",
    company: "Globe Telecom",
    location: "Taguig, Metro Manila",
    salary: "Stipend provided",
    type: "Internship",
    level: "Student",
    postedDate: "1 week ago",
    description: "Gain hands-on experience in software development at a leading telecom company...",
    requirements: ["Computer Science Student", "Basic Programming", "Eager to Learn"]
  },
  {
    id: 7,
    title: "Part-time Social Media Manager",
    company: "Kumu",
    location: "Quezon City, Metro Manila",
    salary: "Negotiable",
    type: "Part time",
    level: "Entry Level",
    postedDate: "3 days ago",
    description: "Manage social media presence for a leading local social platform...",
    requirements: ["Social Media Management", "Content Creation", "Filipino Language"]
  },
  {
    id: 8,
    title: "Mobile App Developer",
    company: "Coins.ph",
    location: "Taguig, Metro Manila",
    salary: "",
    type: "Full time",
    level: "Mid to Senior",
    postedDate: "2 days ago",
    description: "Help build the future of finance in the Philippines...",
    requirements: ["React Native", "iOS/Android Development", "Blockchain Knowledge is a Plus"]
  },
  {
    id: 9,
    title: "Marketing Intern",
    company: "Lazada",
    location: "Taguig, Metro Manila",
    salary: "",
    type: "Internship",
    level: "Student",
    postedDate: "5 days ago",
    description: "Learn digital marketing at one of the largest e-commerce platforms in SEA...",
    requirements: ["Marketing Student", "Creative Thinking", "Basic Design Skills"]
  },
  {
    id: 10,
    title: "Freelance Content Writer",
    company: "iAcademy",
    location: "Makati, Metro Manila",
    salary: "",
    type: "Freelance",
    level: "Entry Level",
    postedDate: "1 day ago",
    description: "Create engaging educational content for various learning materials...",
    requirements: ["Excellent Writing Skills", "Research Skills", "Education Background is a Plus"]
  }
];

export const mockApplications = [
  {
    id: 1,
    jobId: 1,
    status: 'review' as const,
    appliedDate: '2023-06-15',
    updatedAt: '2023-06-15T10:30:00Z'
  },
  {
    id: 2,
    jobId: 2,
    status: 'interview' as const,
    appliedDate: '2023-06-10',
    updatedAt: '2023-06-12T14:20:00Z'
  }
];
