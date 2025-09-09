#!/usr/bin/env python3
"""
Test script for the improved resume parsing system
"""
import requests
import json

def test_improved_parsing():
    """Test the improved NER service with comprehensive resume text"""
    
    # Comprehensive test resume with various formats
    test_data = {
        'text': '''Maria Santos dela Cruz
Email: maria.santos@gmail.com
Phone: +639171234567
Address: 123 Rizal Street, Quezon City, Metro Manila, Philippines

OBJECTIVE
Seeking a challenging position as a Senior Software Developer

EDUCATION
Bachelor of Science in Computer Science
University of the Philippines Diliman
Graduated: 2018
Magna Cum Laude

Certificate in Web Development
TESDA
2017

WORK EXPERIENCE
Senior Software Developer
Tech Solutions Philippines Inc.
January 2021 - Present
• Developed and maintained web applications using React, Node.js, and MongoDB
• Led a team of 3 junior developers
• Implemented REST APIs and microservices architecture
• Collaborated with cross-functional teams using Agile methodology

Software Developer
Digital Innovations Corp
June 2019 - December 2020
• Built mobile applications using React Native and Flutter
• Integrated third-party APIs and payment gateways
• Participated in code reviews and testing procedures
• Worked with MySQL and PostgreSQL databases

Junior Web Developer
StartUp Solutions Ltd
March 2018 - May 2019
• Assisted in frontend development using HTML, CSS, JavaScript
• Maintained WordPress websites for clients
• Learned version control using Git and GitHub

TECHNICAL SKILLS
Programming Languages: JavaScript, Python, Java, PHP, TypeScript
Frontend Technologies: React, Vue.js, Angular, HTML5, CSS3, Bootstrap
Backend Technologies: Node.js, Express.js, Django, Laravel
Databases: MongoDB, MySQL, PostgreSQL, Redis
Cloud & DevOps: AWS, Azure, Docker, Kubernetes, Jenkins
Tools: Git, GitHub, Jira, Postman, Webpack

SOFT SKILLS
Leadership, Communication, Problem Solving, Team Collaboration, Project Management, Agile Methodology'''
    }

    try:
        print("🚀 Testing Improved Resume Parsing System")
        print("=" * 60)
        
        # Test the enhanced parsing endpoint
        response = requests.post('http://localhost:5000/test-parse', json=test_data, timeout=30)
        print(f'📡 Status Code: {response.status_code}')
        
        if response.status_code == 200:
            result = response.json()
            print(f'\n✅ SUCCESS: {result.get("success")}')
            print(f'📊 Entity Count: {result.get("entityCount")}')
            
            parsed_data = result.get('parsed_data', {})
            
            # Personal Info
            personal_info = parsed_data.get('personalInfo', {})
            print(f'\n👤 PERSONAL INFORMATION:')
            print(f'  Name: {personal_info.get("name", "Not found")}')
            print(f'  Email: {personal_info.get("email", "Not found")}')
            print(f'  Phone: {personal_info.get("phone", "Not found")}')
            
            # Education
            education = parsed_data.get('education', [])
            print(f'\n🎓 EDUCATION ({len(education)} entries):')
            if education:
                for i, edu in enumerate(education, 1):
                    print(f'  {i}. {edu.get("degree", "N/A")} in {edu.get("field", "N/A")}')
                    print(f'     Institution: {edu.get("institution", "N/A")}')
                    print(f'     Year: {edu.get("year", "N/A")}')
            else:
                print('  No structured education entries found')
            
            # Experience
            experience = parsed_data.get('experience', [])
            print(f'\n💼 WORK EXPERIENCE ({len(experience)} entries):')
            if experience:
                for i, exp in enumerate(experience, 1):
                    print(f'  {i}. {exp.get("position", "N/A")} at {exp.get("company", "N/A")}')
                    print(f'     Duration: {exp.get("duration", "N/A")}')
                    if exp.get("description"):
                        print(f'     Description: {exp.get("description")[:80]}...')
            else:
                print('  No structured experience entries found')
            
            # Skills
            skills = parsed_data.get('skills', [])
            print(f'\n🛠️ SKILLS ({len(skills)} skills):')
            if skills:
                # Categorize skills
                tech_keywords = ['javascript', 'python', 'react', 'node', 'html', 'css', 'sql', 'git', 'aws', 'docker']
                tech_skills = [s for s in skills if any(keyword in s.lower() for keyword in tech_keywords)]
                soft_skills = [s for s in skills if s not in tech_skills and any(keyword in s.lower() for keyword in ['leadership', 'communication', 'problem', 'team', 'project'])]
                other_skills = [s for s in skills if s not in tech_skills and s not in soft_skills]
                
                if tech_skills:
                    print('  Technical Skills:')
                    for skill in tech_skills[:10]:
                        print(f'    • {skill}')
                
                if soft_skills:
                    print('  Soft Skills:')
                    for skill in soft_skills[:5]:
                        print(f'    • {skill}')
                
                if other_skills:
                    print('  Other Skills:')
                    for skill in other_skills[:5]:
                        print(f'    • {skill}')
                        
                if len(skills) > 20:
                    print(f'  ... and {len(skills) - 20} more skills')
            else:
                print('  No skills extracted')
            
            # AI Analysis
            print(f'\n🤖 AI ANALYSIS:')
            print(f'  Experience Level: {parsed_data.get("experienceLevel", "Not determined")}')
            industry_tags = parsed_data.get('industryTags', [])
            print(f'  Industry Tags: {", ".join(industry_tags) if industry_tags else "None identified"}')
            
            # Improvement Analysis
            print(f'\n📈 PARSING IMPROVEMENT ANALYSIS:')
            print(f'  ✓ Personal Info: {"Complete" if all([personal_info.get("name"), personal_info.get("email")]) else "Partial"}')
            print(f'  ✓ Education: {len(education)} structured entries')
            print(f'  ✓ Experience: {len(experience)} structured entries')
            print(f'  ✓ Skills: {len(skills)} skills identified')
            
            # Calculate improvement score
            improvement_score = 0
            if personal_info.get("name") and personal_info.get("email"):
                improvement_score += 25
            improvement_score += min(len(education) * 15, 30)
            improvement_score += min(len(experience) * 15, 30)
            improvement_score += min(len(skills) * 2, 15)
            
            print(f'  📊 Overall Parsing Score: {improvement_score}/100')
            
            if improvement_score >= 80:
                print('  🎉 EXCELLENT parsing accuracy!')
            elif improvement_score >= 60:
                print('  👍 GOOD parsing accuracy')
            elif improvement_score >= 40:
                print('  ⚠️ MODERATE parsing accuracy - needs improvement')
            else:
                print('  ❌ POOR parsing accuracy - significant improvements needed')
                
        else:
            print(f'❌ ERROR Response ({response.status_code}):')
            try:
                error_data = response.json()
                print(json.dumps(error_data, indent=2))
            except:
                print(response.text)
                
    except requests.exceptions.RequestException as e:
        print(f'❌ Connection Error: {str(e)}')
        print('Make sure the NER service is running on http://localhost:5000')
    except Exception as e:
        print(f'❌ Unexpected Error: {str(e)}')

if __name__ == "__main__":
    test_improved_parsing()
