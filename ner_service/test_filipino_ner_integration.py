#!/usr/bin/env python3
"""
Test script for Filipino NER model integration
Tests the enhanced parsing capabilities with Filipino-specific resume content
"""

import requests
import json

# Test Filipino resume content
FILIPINO_RESUME_TEXT = """
Maria Santos dela Cruz
Senior Software Developer
Globe Telecom Inc.
maria.delacruz@email.com
+63 917 123 4567
Barangay San Antonio, Quezon City, Metro Manila, Philippines

PROFESSIONAL EXPERIENCE
Senior Software Developer | Globe Telecom Inc. | 2020 - Present
• Developed web applications using JavaScript, React, and Node.js
• Led a team of 5 developers in agile development projects
• Implemented microservices architecture using Docker and Kubernetes

Customer Service Representative | Convergys Philippines | 2018 - 2020
• Handled customer inquiries and technical support for US clients
• Achieved 95% customer satisfaction rating
• Fluent in English and Tagalog communication

EDUCATION
Bachelor of Science in Computer Science | University of the Philippines Diliman | 2018
Magna Cum Laude

TECHNICAL SKILLS
Programming Languages: JavaScript, Python, Java, PHP
Frameworks: React, Angular, Node.js, Spring Boot
Databases: MySQL, PostgreSQL, MongoDB
Cloud Services: AWS, Azure, Google Cloud Platform
Tools: Git, Docker, Kubernetes, Jenkins

CERTIFICATIONS
• AWS Certified Solutions Architect
• Scrum Master Certification
• TESDA Computer Programming NC III

LANGUAGES
• Filipino (Native)
• English (Fluent)
• Tagalog (Native)
"""

def test_ner_service():
    """Test the NER service with Filipino resume content"""
    url = "http://localhost:5000/test-parse"
    
    payload = {
        "text": FILIPINO_RESUME_TEXT
    }
    
    try:
        print("Testing Filipino Resume NER Integration...")
        print("=" * 50)
        
        response = requests.post(url, json=payload)
        
        if response.status_code == 200:
            result = response.json()
            
            print("✅ NER Service Response Successful")
            print(f"Success: {result.get('success', False)}")
            
            # Get parsed data
            parsed_data = result.get('parsed_data', {})
            
            # Display extracted information
            print("\n📋 EXTRACTED INFORMATION:")
            print("-" * 30)
            
            # Personal Information
            personal_info = parsed_data.get('personal_info', {})
            print(f"Name: {personal_info.get('name', 'Not found')}")
            print(f"Email: {personal_info.get('email', 'Not found')}")
            print(f"Phone: {personal_info.get('phone', 'Not found')}")
            print(f"Address: {personal_info.get('address', 'Not found')}")
            
            # Skills
            skills = parsed_data.get('skills', [])
            print(f"\n🛠️ SKILLS ({len(skills)} found):")
            for skill in skills[:10]:  # Show first 10
                print(f"  • {skill}")
            if len(skills) > 10:
                print(f"  ... and {len(skills) - 10} more")
            
            # Experience
            experience = parsed_data.get('experience', [])
            print(f"\n💼 EXPERIENCE ({len(experience)} entries found):")
            for exp in experience:
                if isinstance(exp, dict):
                    print(f"  • {exp.get('title', 'N/A')} at {exp.get('company', 'N/A')}")
                    print(f"    Duration: {exp.get('duration', 'N/A')}")
                else:
                    print(f"  • {exp}")
            
            # Education
            education = parsed_data.get('education', [])
            print(f"\n🎓 EDUCATION ({len(education)} entries found):")
            for edu in education:
                if isinstance(edu, dict):
                    print(f"  • {edu.get('degree', 'N/A')}")
                    print(f"    Institution: {edu.get('institution', 'N/A')}")
                    print(f"    Year: {edu.get('year', 'N/A')}")
                    if edu.get('honors'):
                        print(f"    Honors: {edu.get('honors')}")
                else:
                    print(f"  • {edu}")
            
            # NER Entities
            entities = result.get('entities', [])
            print(f"\n🏷️ NER ENTITIES ({len(entities)} found):")
            entity_counts = {}
            
            # Handle different entity formats
            for entity in entities:
                if isinstance(entity, dict):
                    label = entity.get('label', 'Unknown')
                    entity_counts[label] = entity_counts.get(label, 0) + 1
                elif isinstance(entity, list) and len(entity) >= 3:
                    # Handle [text, start, end, label] format
                    label = entity[3] if len(entity) > 3 else 'Unknown'
                    entity_counts[label] = entity_counts.get(label, 0) + 1
            
            for label, count in entity_counts.items():
                print(f"  • {label}: {count}")
            
            # Show some example entities
            print("\n📝 Example Entities:")
            for i, entity in enumerate(entities[:15]):  # Show first 15
                if isinstance(entity, dict):
                    print(f"  '{entity.get('text', '')}' -> {entity.get('label', '')}")
                elif isinstance(entity, list) and len(entity) >= 3:
                    text = entity[0] if len(entity) > 0 else ''
                    label = entity[3] if len(entity) > 3 else 'Unknown'
                    print(f"  '{text}' -> {label}")
                else:
                    print(f"  {entity}")
            
            print(f"\n✅ Test completed successfully!")
            print(f"Total entities extracted: {len(entities)}")
            
            return True
            
        else:
            print(f"❌ Error: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to NER service")
        print("Make sure the service is running on http://localhost:5000")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False

def test_health_check():
    """Test the health check endpoint"""
    try:
        response = requests.get("http://localhost:5000/health")
        if response.status_code == 200:
            print("✅ Health check passed")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except:
        print("❌ Health check failed: Service not reachable")
        return False

if __name__ == "__main__":
    print("Filipino Resume NER Integration Test")
    print("=" * 40)
    
    # Test health check first
    if test_health_check():
        # Test main parsing functionality
        test_ner_service()
    else:
        print("Service is not running. Please start the NER service first.")
