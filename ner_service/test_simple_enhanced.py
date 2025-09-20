"""
Simple test for enhanced parser
"""

import requests
import json

def test_simple():
    """Test with simple text"""
    try:
        print("🧪 Testing enhanced parser with simple text...")
        
        # Enhanced test data with training and seminars section
        test_data = {
            "text": """Maria Santos
Email: maria.santos@gmail.com
Phone: +63 9171234567

TECHNICAL SKILLS
Python, JavaScript, React, Node.js, AWS, Docker, MySQL

TRAINING AND SEMINARS
• AWS Certified Solutions Architect - Associate
• Microsoft Azure Fundamentals (AZ-900)
• Certified Scrum Master (CSM)
• Google Cloud Professional Cloud Architect
• Advanced Python Programming Certificate
• React Development Bootcamp
• Basic Excel Training
• Leadership Workshop
• Project Management Seminar

WORK EXPERIENCE
Senior Software Developer
Accenture Philippines
2020 - Present

EDUCATION
Bachelor of Science in Computer Science
University of the Philippines
2018"""
        }
        
        response = requests.post('http://localhost:5000/parse-resume', 
                               json=test_data,
                               timeout=30)
        
        print(f"📊 Response status: {response.status_code}")
        print(f"📊 Response headers: {dict(response.headers)}")
        print(f"📊 Response text: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Enhanced parser response:")
            print(json.dumps(result, indent=2))
            
            # Check specifically for certifications
            if result.get('success') and result.get('data'):
                data = result['data']
                print(f"\n🏆 Certification check:")
                print(f"   Certifications field exists: {'certifications' in data}")
                print(f"   Certifications count: {len(data.get('certifications', []))}")
                if data.get('certifications'):
                    print(f"   Certifications: {data['certifications']}")
                    for i, cert in enumerate(data['certifications'], 1):
                        print(f"     {i}. {cert}")
                else:
                    print(f"   No certifications found in response")
                
                # Also check trainings
                print(f"\n📚 Training check:")
                print(f"   Trainings field exists: {'trainings' in data}")
                print(f"   Trainings count: {len(data.get('trainings', []))}")
                if data.get('trainings'):
                    for i, training in enumerate(data['trainings'], 1):
                        print(f"     {i}. {training.get('name', 'No name')} (type: {training.get('type', 'unknown')})")
            
            return True
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_health():
    """Test health endpoint"""
    try:
        print("🏥 Testing health endpoint...")
        response = requests.get('http://localhost:5000/health', timeout=5)
        print(f"Health status: {response.status_code}")
        print(f"Health response: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Simple Enhanced Parser Test\n")
    
    health_ok = test_health()
    print()
    
    if health_ok:
        text_ok = test_simple()
        print(f"\nResult: {'✅ PASS' if text_ok else '❌ FAIL'}")
    else:
        print("❌ Service not available")
