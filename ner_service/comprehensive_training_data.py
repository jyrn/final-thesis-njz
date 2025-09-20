"""
Enhanced Comprehensive Training Data Generator for Filipino Resume NER Model
Generates 1000+ diverse training examples with improved accuracy for:
- Better certification extraction
- More accurate skill classification
- Enhanced entity boundary detection
"""

import json
import random
from typing import List, Dict, Tuple

class FilipinoresumeTrainingDataGenerator:
    def __init__(self):
        # Filipino names
        self.filipino_first_names = [
            "Maria", "Jose", "Juan", "Ana", "Antonio", "Rosa", "Francisco", "Elena", "Miguel", "Carmen",
            "Pedro", "Luz", "Manuel", "Esperanza", "Jesus", "Josefa", "Ramon", "Remedios", "Ricardo", "Corazon",
            "Roberto", "Teresita", "Ernesto", "Cristina", "Eduardo", "Marilyn", "Carlos", "Josephine", "Alfredo", "Gloria",
            "Ferdinand", "Rosario", "Rodrigo", "Milagros", "Arturo", "Dolores", "Reynaldo", "Soledad", "Jaime", "Concepcion",
            "Angelo", "Angelica", "Benjamin", "Carmelita", "Christopher", "Divina", "Daniel", "Estrella", "Emmanuel", "Fe",
            "Gabriel", "Grace", "Harold", "Helen", "Ignacio", "Irene", "Jonathan", "Jasmine", "Kenneth", "Karen",
            "Leonardo", "Lourdes", "Marvin", "Michelle", "Nathan", "Nicole", "Oliver", "Patricia", "Patrick", "Queen",
            "Rafael", "Rachel", "Samuel", "Sarah", "Theodore", "Theresa", "Vincent", "Victoria", "William", "Yvonne"
        ]
        
        self.filipino_last_names = [
            "Santos", "Reyes", "Cruz", "Bautista", "Ocampo", "Garcia", "Mendoza", "Torres", "Tomas", "Andres",
            "Marquez", "Romualdez", "Mercado", "Aguilar", "Flores", "Ramos", "Valdez", "Castillo", "Aquino", "Fernandez",
            "Villanueva", "Francisco", "Soriano", "Navarro", "Dela Cruz", "Gonzales", "Rodriguez", "Perez", "Sanchez", "Rivera",
            "Morales", "Pascual", "Salazar", "De Leon", "Guerrero", "Cabrera", "Jimenez", "Rosales", "Alvarez", "Herrera",
            "Velasco", "Santiago", "Domingo", "Espiritu", "Tolentino", "Dizon", "Manalo", "Lim", "Tan", "Go",
            "Chua", "Ong", "Lee", "Wong", "Sy", "Co", "Yap", "Ng", "Chiu", "Ang"
        ]
        
        # Enhanced Technical skills with better categorization
        self.programming_languages = [
            "Python", "JavaScript", "Java", "C++", "C#", "PHP", "Ruby", "Go", "Rust", "Swift", "Kotlin",
            "TypeScript", "Scala", "R", "MATLAB", "Perl", "Objective-C", "Dart", "Elixir", "Haskell"
        ]
        
        self.web_technologies = [
            "HTML5", "CSS3", "React", "Angular", "Vue.js", "Svelte", "Next.js", "Nuxt.js", "Gatsby",
            "Node.js", "Express.js", "Koa.js", "Fastify", "NestJS", "jQuery", "Bootstrap", "Tailwind CSS",
            "SASS", "LESS", "Webpack", "Vite", "Parcel", "Rollup"
        ]
        
        self.backend_frameworks = [
            "Django", "Flask", "FastAPI", "Spring Boot", "Spring MVC", "Laravel", "CodeIgniter", "Symfony",
            "Ruby on Rails", "ASP.NET Core", "Express.js", "Koa.js", "Gin", "Echo", "Fiber"
        ]
        
        self.databases = [
            "MySQL", "PostgreSQL", "MongoDB", "Oracle Database", "SQL Server", "SQLite", "Redis",
            "Elasticsearch", "Cassandra", "DynamoDB", "Firebase Firestore", "CouchDB", "Neo4j"
        ]
        
        self.cloud_platforms = [
            "Amazon Web Services (AWS)", "Microsoft Azure", "Google Cloud Platform (GCP)", "IBM Cloud",
            "DigitalOcean", "Heroku", "Vercel", "Netlify", "Railway", "PlanetScale"
        ]
        
        self.devops_tools = [
            "Docker", "Kubernetes", "Jenkins", "GitLab CI/CD", "GitHub Actions", "CircleCI", "Travis CI",
            "Ansible", "Terraform", "Vagrant", "Chef", "Puppet", "Prometheus", "Grafana", "ELK Stack"
        ]
        
        self.mobile_development = [
            "React Native", "Flutter", "Ionic", "Xamarin", "Swift (iOS)", "Kotlin (Android)", 
            "Java (Android)", "Cordova", "PhoneGap", "Unity", "Unreal Engine"
        ]
        
        self.data_science_ai = [
            "Machine Learning", "Deep Learning", "Natural Language Processing", "Computer Vision",
            "TensorFlow", "PyTorch", "Scikit-learn", "Pandas", "NumPy", "Matplotlib", "Seaborn",
            "Jupyter Notebook", "Apache Spark", "Hadoop", "Tableau", "Power BI"
        ]
        
        # Combine all technical skills
        self.technical_skills = (
            self.programming_languages + self.web_technologies + self.backend_frameworks + 
            self.databases + self.cloud_platforms + self.devops_tools + self.mobile_development + 
            self.data_science_ai + ["Git", "Linux", "Windows", "macOS", "REST API", "GraphQL", 
            "Microservices", "Agile", "Scrum", "DevOps", "CI/CD", "Test-Driven Development"]
        )
        
        self.soft_skills = [
            "Leadership", "Communication", "Problem Solving", "Team Work", "Time Management", "Critical Thinking",
            "Adaptability", "Creativity", "Attention to Detail", "Customer Service", "Project Management",
            "Analytical Skills", "Decision Making", "Conflict Resolution", "Negotiation", "Public Speaking"
        ]
        
        # Job positions
        self.job_positions = [
            "Software Developer", "Web Developer", "Mobile Developer", "Full Stack Developer", "Frontend Developer",
            "Backend Developer", "DevOps Engineer", "Data Scientist", "Machine Learning Engineer", "AI Engineer",
            "Software Engineer", "Senior Developer", "Lead Developer", "Technical Lead", "Engineering Manager",
            "Product Manager", "Project Manager", "Business Analyst", "Quality Assurance Engineer", "UI/UX Designer",
            "Database Administrator", "System Administrator", "Network Engineer", "Cybersecurity Specialist",
            "Marketing Manager", "Sales Representative", "Account Manager", "Customer Success Manager",
            "Human Resources Specialist", "Financial Analyst", "Operations Manager", "Supply Chain Manager"
        ]
        
        # Companies
        self.companies = [
            "Accenture Philippines", "IBM Philippines", "Microsoft Philippines", "Google Philippines", "Amazon Philippines",
            "Ayala Corporation", "SM Investments", "Jollibee Foods Corporation", "Globe Telecom", "PLDT",
            "BDO Unibank", "Metrobank", "BPI", "Ayala Land", "Megaworld Corporation",
            "Converge ICT", "DITO Telecommunity", "GCash", "PayMaya", "Grab Philippines",
            "Shopee Philippines", "Lazada Philippines", "Foodpanda Philippines", "GoTyme Bank", "UnionBank",
            "Concentrix", "Teleperformance", "Sitel", "Alorica", "Sutherland Global Services",
            "Trends and Technologies Inc", "Pointwest Technologies", "Exist Software Labs", "Orange and Bronze",
            "Stratpoint Technologies", "Thinking Machines", "Kalibrr", "JobStreet Philippines", "Monster Philippines"
        ]
        
        # Educational institutions
        self.universities = [
            "University of the Philippines", "Ateneo de Manila University", "De La Salle University", "University of Santo Tomas",
            "Polytechnic University of the Philippines", "Technological University of the Philippines", "Far Eastern University",
            "Adamson University", "National University", "Centro Escolar University", "Mapua University",
            "Asian Institute of Management", "Miriam College", "Saint Louis University", "University of San Carlos",
            "Cebu Institute of Technology", "Mindanao State University", "Central Philippine University",
            "Silliman University", "Xavier University", "Holy Angel University", "Angeles University Foundation",
            "Bulacan State University", "Cavite State University", "Laguna State Polytechnic University"
        ]
        
        # Degrees
        self.degrees = [
            "Bachelor of Science in Computer Science", "Bachelor of Science in Information Technology",
            "Bachelor of Science in Computer Engineering", "Bachelor of Science in Software Engineering",
            "Bachelor of Science in Information Systems", "Bachelor of Science in Electronics Engineering",
            "Bachelor of Science in Electrical Engineering", "Bachelor of Arts in Communication",
            "Bachelor of Science in Business Administration", "Bachelor of Science in Marketing",
            "Bachelor of Science in Accountancy", "Bachelor of Science in Finance",
            "Bachelor of Science in Psychology", "Bachelor of Arts in English",
            "Master of Science in Computer Science", "Master of Business Administration",
            "Master of Science in Information Technology", "Master of Science in Data Science"
        ]
        
        # Enhanced Certifications with various formats
        self.certifications = [
            # Cloud Certifications
            "AWS Certified Solutions Architect - Associate", "AWS Certified Developer - Associate", "AWS Certified SysOps Administrator",
            "Microsoft Azure Fundamentals (AZ-900)", "Microsoft Azure Developer Associate (AZ-204)", "Microsoft Azure Solutions Architect Expert",
            "Google Cloud Professional Cloud Architect", "Google Cloud Professional Data Engineer", "Google Cloud Associate Cloud Engineer",
            
            # Programming & Development
            "Oracle Certified Professional, Java SE Developer", "Microsoft Certified: Azure Developer Associate", 
            "Red Hat Certified System Administrator (RHCSA)", "Certified Kubernetes Administrator (CKA)",
            "Docker Certified Associate", "Terraform Associate Certification",
            
            # Project Management
            "Project Management Professional (PMP)", "Certified Scrum Master (CSM)", "Certified ScrumProduct Owner (CSPO)",
            "Agile Certified Practitioner (PMI-ACP)", "PRINCE2 Foundation Certificate", "Lean Six Sigma Green Belt",
            
            # Security
            "Certified Information Systems Security Professional (CISSP)", "Certified Ethical Hacker (CEH)",
            "CompTIA Security+", "CompTIA Network+", "CompTIA A+", "Certified Information Security Manager (CISM)",
            
            # Networking
            "Cisco Certified Network Associate (CCNA)", "Cisco Certified Network Professional (CCNP)",
            "CompTIA Network+", "Juniper Networks Certified Associate (JNCIA)",
            
            # Data & Analytics
            "Google Analytics Individual Qualification (IQ)", "Google Ads Certification", "Facebook Blueprint Certification",
            "Tableau Desktop Specialist", "Microsoft Power BI Data Analyst Associate", "Certified Analytics Professional (CAP)",
            
            # IT Service Management
            "ITIL Foundation Certificate in IT Service Management", "ITIL Practitioner Certificate", "COBIT 5 Foundation",
            
            # Digital Marketing
            "Google Ads Certified", "Facebook Blueprint Certification", "HubSpot Content Marketing Certification",
            "Google Analytics Certified", "Hootsuite Social Media Marketing Certification",
            
            # Online Learning Platforms
            "Coursera Machine Learning Specialization", "edX MITx Introduction to Computer Science",
            "Udacity Full Stack Web Developer Nanodegree", "LinkedIn Learning Certificate in Data Science",
            "Pluralsight Skill Assessment - JavaScript", "FreeCodeCamp Full Stack Development Certification"
        ]
        
        # Philippine addresses
        self.cities = [
            "Manila", "Quezon City", "Makati", "Pasig", "Taguig", "Mandaluyong", "San Juan", "Pasay",
            "Caloocan", "Malabon", "Navotas", "Valenzuela", "Marikina", "Parañaque", "Las Piñas", "Muntinlupa",
            "Cebu City", "Davao City", "Iloilo City", "Bacolod", "Cagayan de Oro", "General Santos",
            "Zamboanga City", "Baguio", "Antipolo", "Bacoor", "Imus", "Dasmariñas", "Biñan", "Santa Rosa"
        ]

    def generate_name(self) -> str:
        """Generate a Filipino name"""
        first = random.choice(self.filipino_first_names)
        last = random.choice(self.filipino_last_names)
        
        # Sometimes add middle initial
        if random.random() < 0.7:
            middle_initial = random.choice("ABCDEFGHIJKLMNOPQRSTUVWXYZ")
            return f"{first} {middle_initial}. {last}"
        return f"{first} {last}"

    def generate_email(self, name: str) -> str:
        """Generate email from name"""
        clean_name = name.replace(" ", "").replace(".", "").lower()
        domains = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "protonmail.com"]
        
        # Various email formats
        formats = [
            f"{clean_name}@{random.choice(domains)}",
            f"{clean_name}{random.randint(1, 999)}@{random.choice(domains)}",
            f"{clean_name.split()[0]}.{clean_name.split()[-1]}@{random.choice(domains)}"
        ]
        return random.choice(formats)

    def generate_phone(self) -> str:
        """Generate Philippine phone number"""
        formats = [
            f"+63 9{random.randint(10, 99)}{random.randint(1000000, 9999999)}",
            f"09{random.randint(10, 99)}{random.randint(1000000, 9999999)}",
            f"(+63) 9{random.randint(10, 99)}-{random.randint(100, 999)}-{random.randint(1000, 9999)}"
        ]
        return random.choice(formats)

    def generate_address(self) -> str:
        """Generate Philippine address"""
        street_num = random.randint(1, 999)
        streets = ["Rizal St.", "Bonifacio Ave.", "Quezon Blvd.", "EDSA", "Ortigas Ave.", "Makati Ave.", "Taft Ave."]
        barangays = ["Barangay San Antonio", "Barangay Poblacion", "Barangay Central", "Barangay East", "Barangay West"]
        
        city = random.choice(self.cities)
        street = random.choice(streets)
        barangay = random.choice(barangays)
        
        return f"{street_num} {street}, {barangay}, {city}, Philippines"

    def generate_skills(self, count: int = None) -> List[str]:
        """Generate random skills"""
        if count is None:
            count = random.randint(5, 12)
        
        tech_count = random.randint(3, count - 2)
        soft_count = count - tech_count
        
        skills = random.sample(self.technical_skills, min(tech_count, len(self.technical_skills)))
        skills.extend(random.sample(self.soft_skills, min(soft_count, len(self.soft_skills))))
        
        return skills

    def generate_experience(self) -> List[Dict]:
        """Generate work experience"""
        exp_count = random.randint(1, 4)
        experiences = []
        
        current_year = 2024
        
        for i in range(exp_count):
            position = random.choice(self.job_positions)
            company = random.choice(self.companies)
            
            # Generate duration
            end_year = current_year - i
            start_year = end_year - random.randint(1, 4)
            
            if i == 0 and random.random() < 0.3:  # Current job
                duration = f"{start_year} - Present"
            else:
                duration = f"{start_year} - {end_year}"
            
            # Generate description
            descriptions = [
                "Developed and maintained web applications using modern frameworks",
                "Collaborated with cross-functional teams to deliver high-quality software solutions",
                "Implemented responsive user interfaces and optimized application performance",
                "Participated in code reviews and mentored junior developers",
                "Worked with databases and API integrations",
                "Followed agile development methodologies and best practices"
            ]
            
            description = ". ".join(random.sample(descriptions, random.randint(2, 4)))
            
            experiences.append({
                "position": position,
                "company": company,
                "duration": duration,
                "description": description
            })
        
        return experiences

    def generate_education(self) -> List[Dict]:
        """Generate education background"""
        edu_count = random.randint(1, 3)
        education = []
        
        for i in range(edu_count):
            degree = random.choice(self.degrees)
            institution = random.choice(self.universities)
            year = str(random.randint(2010, 2023))
            
            education.append({
                "degree": degree,
                "institution": institution,
                "year": year
            })
        
        return education

    def generate_certifications(self) -> List[str]:
        """Generate certifications"""
        cert_count = random.randint(0, 5)
        if cert_count == 0:
            return []
        
        return random.sample(self.certifications, min(cert_count, len(self.certifications)))

    def create_resume_text(self, data: Dict) -> str:
        """Create resume text from structured data"""
        resume_parts = []
        
        # Header
        resume_parts.append(f"{data['name']}")
        resume_parts.append(f"Email: {data['email']}")
        resume_parts.append(f"Phone: {data['phone']}")
        if data['address']:
            resume_parts.append(f"Address: {data['address']}")
        resume_parts.append("")
        
        # Skills
        if data['skills']:
            resume_parts.append("SKILLS")
            resume_parts.append("=" * 20)
            skills_text = ", ".join(data['skills'])
            resume_parts.append(skills_text)
            resume_parts.append("")
        
        # Experience
        if data['experience']:
            resume_parts.append("WORK EXPERIENCE")
            resume_parts.append("=" * 30)
            for exp in data['experience']:
                resume_parts.append(f"{exp['position']}")
                resume_parts.append(f"{exp['company']}")
                resume_parts.append(f"{exp['duration']}")
                resume_parts.append(f"• {exp['description']}")
                resume_parts.append("")
        
        # Education
        if data['education']:
            resume_parts.append("EDUCATION")
            resume_parts.append("=" * 20)
            for edu in data['education']:
                resume_parts.append(f"{edu['degree']}")
                resume_parts.append(f"{edu['institution']}")
                resume_parts.append(f"Graduated: {edu['year']}")
                resume_parts.append("")
        
        # Certifications with various formats
        if data['certifications']:
            cert_headers = ["CERTIFICATIONS", "CERTIFICATES", "PROFESSIONAL CERTIFICATIONS", "LICENSES & CERTIFICATIONS"]
            resume_parts.append(random.choice(cert_headers))
            resume_parts.append("=" * 25)
            
            # Various certification formats
            for cert in data['certifications']:
                formats = [
                    f"• {cert}",
                    f"- {cert}",
                    f"* {cert}",
                    f"○ {cert}",
                    f"{cert}",
                    f"✓ {cert}"
                ]
                resume_parts.append(random.choice(formats))
            resume_parts.append("")
        
        return "\n".join(resume_parts)

    def create_ner_annotations(self, text: str, data: Dict) -> List[Tuple[int, int, str]]:
        """Create NER annotations for the text"""
        annotations = []
        
        # Find entity positions in text
        # Name
        name_start = text.find(data['name'])
        if name_start != -1:
            annotations.append((name_start, name_start + len(data['name']), 'PERSON'))
        
        # Email
        email_start = text.find(data['email'])
        if email_start != -1:
            annotations.append((email_start, email_start + len(data['email']), 'EMAIL'))
        
        # Phone
        phone_start = text.find(data['phone'])
        if phone_start != -1:
            annotations.append((phone_start, phone_start + len(data['phone']), 'PHONE'))
        
        # Skills
        for skill in data['skills']:
            skill_start = text.find(skill)
            if skill_start != -1:
                annotations.append((skill_start, skill_start + len(skill), 'SKILL'))
        
        # Experience
        for exp in data['experience']:
            # Position
            pos_start = text.find(exp['position'])
            if pos_start != -1:
                annotations.append((pos_start, pos_start + len(exp['position']), 'JOB_TITLE'))
            
            # Company
            comp_start = text.find(exp['company'])
            if comp_start != -1:
                annotations.append((comp_start, comp_start + len(exp['company']), 'ORGANIZATION'))
        
        # Education
        for edu in data['education']:
            # Degree
            deg_start = text.find(edu['degree'])
            if deg_start != -1:
                annotations.append((deg_start, deg_start + len(edu['degree']), 'DEGREE'))
            
            # Institution
            inst_start = text.find(edu['institution'])
            if inst_start != -1:
                annotations.append((inst_start, inst_start + len(edu['institution']), 'ORGANIZATION'))
        
        # Certifications
        for cert in data['certifications']:
            cert_start = text.find(cert)
            if cert_start != -1:
                annotations.append((cert_start, cert_start + len(cert), 'CERTIFICATION'))
        
        return annotations

    def generate_training_example(self) -> Dict:
        """Generate a single training example"""
        # Generate structured data
        name = self.generate_name()
        email = self.generate_email(name)
        phone = self.generate_phone()
        address = self.generate_address() if random.random() < 0.8 else ""
        skills = self.generate_skills()
        experience = self.generate_experience()
        education = self.generate_education()
        certifications = self.generate_certifications()
        
        data = {
            'name': name,
            'email': email,
            'phone': phone,
            'address': address,
            'skills': skills,
            'experience': experience,
            'education': education,
            'certifications': certifications
        }
        
        # Create resume text
        text = self.create_resume_text(data)
        
        # Create NER annotations
        annotations = self.create_ner_annotations(text, data)
        
        return {
            'text': text,
            'entities': annotations,
            'structured_data': data
        }

    def generate_dataset(self, size: int = 500) -> List[Dict]:
        """Generate complete training dataset"""
        print(f"🔄 Generating {size} training examples...")
        dataset = []
        
        for i in range(size):
            if i % 50 == 0:
                print(f"   Generated {i}/{size} examples...")
            
            example = self.generate_training_example()
            dataset.append(example)
        
        print(f"✅ Generated {len(dataset)} training examples")
        return dataset

def main():
    generator = FilipinoresumeTrainingDataGenerator()
    
    # Generate 500 training examples
    dataset = generator.generate_dataset(500)
    
    # Save to JSON file
    output_file = "filipino_resume_training_data_500.json"
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(dataset, f, indent=2, ensure_ascii=False)
    
    print(f"💾 Saved {len(dataset)} examples to {output_file}")
    
    # Show sample
    print("\n📋 Sample training example:")
    sample = dataset[0]
    print(f"Text preview: {sample['text'][:200]}...")
    print(f"Entities: {len(sample['entities'])} annotations")
    print(f"Structured data keys: {list(sample['structured_data'].keys())}")

if __name__ == "__main__":
    main()
