#!/usr/bin/env python3
"""
Test script for the enhanced resume parsing system with improved skills and experience extraction
"""
import requests
import json

def test_enhanced_parsing():
    """Test the enhanced NER service with comprehensive Filipino resume text"""
    
    # Comprehensive Filipino resume test data
    test_data = {
        'text': '''Maria Santos dela Cruz
Email: maria.santos@gmail.com
Phone: +639171234567
Address: 123 Rizal Street, Quezon City, Metro Manila, Philippines

OBJECTIVE
Seeking a challenging position as a Senior Software Developer to leverage my 5 years of experience in web development and mobile applications.

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
Frontend: React, Vue.js, Angular, HTML5, CSS3, Bootstrap
Backend: Node.js, Express.js, Django, Laravel
Databases: MongoDB, MySQL, PostgreSQL, Redis
Tools & Technologies: Git, Docker, AWS, Azure, REST API, GraphQL
Methodologies: Agile, Scrum, Test-Driven Development

SOFT SKILLS
Problem-solving, Team leadership, Communication, Project management, Adaptability

CERTIFICATIONS
AWS Certified Developer Associate (2020)
Scrum Master Certification (2021)'''
    }

    try:
        print("🚀 Testing Enhanced Resume Parsing System")
        print("=" * 60)
        
        # Test the enhanced parsing endpoint
        response = requests.post('http://localhost:5000/test-parse', json=test_data, timeout=30)
        print(f'📡 Status Code: {response.status_code}')
        
        if response.status_code == 200:
            result = response.json()
            print(f'\n✅ SUCCESS: {result.get("success")}')
            print(f'📊 Entity Count: {result.get("entityCount")}')
            
            print('\n🔍 NER EXTRACTED ENTITIES:')
            entities = result.get('entities', [])
            if entities:
                for entity in entities[:10]:  # Show first 10 entities
                    print(f'  • "{entity[0]}" → {entity[1]}')
                if len(entities) > 10:
                    print(f'  ... and {len(entities) - 10} more entities')
            else:
                print('  No entities extracted by NER model')
            
            print('\n📋 STRUCTURED PARSING RESULTS:')
            parsed_data = result.get('parsed_data', {})
            
            # Personal Info
            personal_info = parsed_data.get('personalInfo', {})
            print(f'\n👤 PERSONAL INFORMATION:')
            print(f'  Name: {personal_info.get("name", "Not found")}')
            print(f'  Email: {personal_info.get("email", "Not found")}')
            print(f'  Phone: {personal_info.get("phone", "Not found")}')
            print(f'  Address: {personal_info.get("address", "Not found")}')
            
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
                        print(f'     Description: {exp.get("description")[:50]}...')
            else:
                print('  No structured experience entries found')
            
            # Skills
            skills = parsed_data.get('skills', [])
            print(f'\n🛠️ SKILLS ({len(skills)} skills):')
            if skills:
                # Group skills for better display
                tech_skills = [s for s in skills if any(tech in s.lower() for tech in ['javascript', 'python', 'react', 'node', 'sql', 'git', 'aws', 'docker'])]
                other_skills = [s for s in skills if s not in tech_skills]
                
                if tech_skills:
                    print('  Technical Skills:')
                    for skill in tech_skills[:10]:
                        print(f'    • {skill}')
                
                if other_skills:
                    print('  Other Skills:')
                    for skill in other_skills[:5]:
                        print(f'    • {skill}')
                        
                if len(skills) > 15:
                    print(f'  ... and {len(skills) - 15} more skills')
            else:
                print('  No skills extracted')
            
            # AI Analysis
            print(f'\n🤖 AI ANALYSIS:')
            print(f'  Experience Level: {parsed_data.get("experienceLevel", "Not determined")}')
            industry_tags = parsed_data.get('industryTags', [])
            print(f'  Industry Tags: {", ".join(industry_tags) if industry_tags else "None identified"}')
            
            # Summary
            print(f'\n📈 PARSING SUMMARY:')
            print(f'  ✓ Personal Info: {"Complete" if all([personal_info.get("name"), personal_info.get("email")]) else "Partial"}')
            print(f'  ✓ Education: {len(education)} structured entries')
            print(f'  ✓ Experience: {len(experience)} structured entries')
            print(f'  ✓ Skills: {len(skills)} skills identified')
            print(f'  ✓ Experience Level: {parsed_data.get("experienceLevel", "Unknown")}')
            print(f'  ✓ Industry Classification: {"Yes" if industry_tags else "No"}')
            
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
    test_enhanced_parsing()
