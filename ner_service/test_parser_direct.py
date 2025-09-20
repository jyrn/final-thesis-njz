"""
Direct test of the parser service to verify it's working
"""

import requests
import base64
import json

def test_parser_service():
    # Test data - sample resume text
    sample_resume = """
    Maria Santos
    Email: maria.santos@gmail.com
    Phone: +63 9171234567
    Address: 123 Rizal St., Quezon City, Philippines
    
    SKILLS
    Python, JavaScript, React, Node.js, MySQL, AWS, HTML, CSS, Bootstrap
    
    WORK EXPERIENCE
    Senior Software Developer
    Accenture Philippines
    2020 - Present
    • Developed web applications using React and Node.js
    • Collaborated with cross-functional teams
    
    Software Developer
    IBM Philippines
    2018 - 2020
    • Built REST APIs using Python and Django
    • Worked with PostgreSQL databases
    
    EDUCATION
    Bachelor of Science in Computer Science
    University of the Philippines
    Graduated: 2018
    
    CERTIFICATIONS
    • AWS Certified Solutions Architect
    • Microsoft Azure Fundamentals
    """
    
    # Convert to base64
    content_base64 = base64.b64encode(sample_resume.encode('utf-8')).decode('utf-8')
    
    # Test the parser service
    try:
        print("🧪 Testing parser service on localhost:5000...")
        
        response = requests.post('http://localhost:5000/extract', 
                               json={'content': content_base64},
                               timeout=10)
        
        print(f"📊 Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Parser response:")
            print(json.dumps(result, indent=2))
            
            if result.get('success'):
                data = result.get('data', {})
                print(f"\n📋 Extracted data summary:")
                print(f"   Name: {data.get('name', 'Not found')}")
                print(f"   Email: {data.get('email', 'Not found')}")
                print(f"   Phone: {data.get('phone', 'Not found')}")
                print(f"   Skills: {len(data.get('skills', []))} found")
                print(f"   Experience: {len(data.get('experience', []))} entries")
                print(f"   Education: {len(data.get('education', []))} entries")
                print(f"   Certifications: {len(data.get('certifications', []))} found")
                
                return True
            else:
                print(f"❌ Parser returned error: {result.get('error')}")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print("❌ Connection failed - parser service not running on port 5000")
        return False
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

def test_health_endpoint():
    try:
        print("\n🏥 Testing health endpoint...")
        response = requests.get('http://localhost:5000/health', timeout=5)
        
        if response.status_code == 200:
            print("✅ Health check passed")
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check error: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting parser service tests...\n")
    
    # Test health first
    health_ok = test_health_endpoint()
    
    # Test parsing
    parse_ok = test_parser_service()
    
    print(f"\n📊 Test Results:")
    print(f"   Health endpoint: {'✅ PASS' if health_ok else '❌ FAIL'}")
    print(f"   Parse endpoint: {'✅ PASS' if parse_ok else '❌ FAIL'}")
    
    if health_ok and parse_ok:
        print("\n🎉 All tests passed! Parser service is working correctly.")
    else:
        print("\n⚠️ Some tests failed. Check parser service status.")
