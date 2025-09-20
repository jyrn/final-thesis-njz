"""
Test the enhanced parser with comprehensive models
"""

import requests
import base64
import json
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import io

def create_comprehensive_resume():
    """Create a comprehensive resume for testing"""
    buffer = io.BytesIO()
    
    # Create PDF
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Add content
    y = height - 50
    
    # Header
    p.setFont("Helvetica-Bold", 18)
    p.drawString(50, y, "MARIA SANTOS")
    y -= 35
    
    p.setFont("Helvetica", 11)
    p.drawString(50, y, "Email: maria.santos@gmail.com")
    y -= 18
    p.drawString(50, y, "Phone: +63 917 123 4567")
    y -= 18
    p.drawString(50, y, "Address: 456 Taft Avenue, Malate, Manila, Philippines")
    y -= 35
    
    # Professional Summary
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y, "PROFESSIONAL SUMMARY")
    y -= 20
    p.setFont("Helvetica", 10)
    p.drawString(50, y, "Experienced Software Developer with 5+ years in web development and mobile applications.")
    y -= 15
    p.drawString(50, y, "Proficient in JavaScript, Python, and modern frameworks. Strong background in database design.")
    y -= 30
    
    # Technical Skills
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y, "TECHNICAL SKILLS")
    y -= 20
    p.setFont("Helvetica", 10)
    p.drawString(50, y, "Programming Languages: JavaScript, Python, Java, TypeScript, PHP")
    y -= 15
    p.drawString(50, y, "Frontend: React, Angular, Vue.js, HTML5, CSS3, Bootstrap, Tailwind CSS")
    y -= 15
    p.drawString(50, y, "Backend: Node.js, Express.js, Django, Flask, Spring Boot")
    y -= 15
    p.drawString(50, y, "Databases: MySQL, PostgreSQL, MongoDB, Redis")
    y -= 15
    p.drawString(50, y, "Cloud & DevOps: AWS, Azure, Docker, Kubernetes, Jenkins, Git")
    y -= 30
    
    # Work Experience
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y, "WORK EXPERIENCE")
    y -= 25
    
    # Job 1
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y, "Senior Software Developer")
    y -= 18
    p.setFont("Helvetica-Oblique", 11)
    p.drawString(50, y, "Accenture Philippines")
    y -= 15
    p.setFont("Helvetica", 10)
    p.drawString(50, y, "January 2020 - Present")
    y -= 15
    p.drawString(50, y, "• Developed and maintained web applications using React and Node.js")
    y -= 12
    p.drawString(50, y, "• Led a team of 5 developers in building enterprise-level solutions")
    y -= 12
    p.drawString(50, y, "• Implemented CI/CD pipelines using Jenkins and Docker")
    y -= 12
    p.drawString(50, y, "• Optimized database queries resulting in 40% performance improvement")
    y -= 20
    
    # Job 2
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y, "Software Developer")
    y -= 18
    p.setFont("Helvetica-Oblique", 11)
    p.drawString(50, y, "Globe Telecom")
    y -= 15
    p.setFont("Helvetica", 10)
    p.drawString(50, y, "June 2018 - December 2019")
    y -= 15
    p.drawString(50, y, "• Built REST APIs using Python Django framework")
    y -= 12
    p.drawString(50, y, "• Developed mobile applications using React Native")
    y -= 12
    p.drawString(50, y, "• Collaborated with cross-functional teams in Agile environment")
    y -= 25
    
    # Education
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y, "EDUCATION")
    y -= 20
    p.setFont("Helvetica-Bold", 11)
    p.drawString(50, y, "Bachelor of Science in Computer Science")
    y -= 15
    p.setFont("Helvetica", 10)
    p.drawString(50, y, "University of the Philippines Diliman")
    y -= 12
    p.drawString(50, y, "Graduated: March 2018")
    y -= 12
    p.drawString(50, y, "Magna Cum Laude, GPA: 3.8/4.0")
    y -= 25
    
    # Certifications
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y, "CERTIFICATIONS")
    y -= 20
    p.setFont("Helvetica", 10)
    p.drawString(50, y, "• AWS Certified Solutions Architect - Associate (2022)")
    y -= 12
    p.drawString(50, y, "• Microsoft Azure Developer Associate (2021)")
    y -= 12
    p.drawString(50, y, "• Google Cloud Professional Developer (2021)")
    y -= 12
    p.drawString(50, y, "• Certified Scrum Master (CSM) (2020)")
    
    p.save()
    
    # Get PDF bytes
    buffer.seek(0)
    return buffer.getvalue()

def test_enhanced_parser():
    """Test the enhanced parser with comprehensive resume"""
    try:
        print("📄 Creating comprehensive resume PDF...")
        pdf_bytes = create_comprehensive_resume()
        print(f"✅ Created PDF, size: {len(pdf_bytes)} bytes")
        
        # Convert to base64
        pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')
        print(f"📦 Converted to base64, length: {len(pdf_base64)}")
        
        # Test the enhanced parser
        print("🧪 Testing enhanced parser with comprehensive resume...")
        
        response = requests.post('http://localhost:5000/parse-resume', 
                               json={'pdf_base64': pdf_base64},
                               timeout=60)
        
        print(f"📊 Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Enhanced parser response:")
            print(json.dumps(result, indent=2))
            
            if result.get('success'):
                data = result.get('data', {})
                print(f"\n📋 Comprehensive extraction summary:")
                print(f"   Name: '{data.get('name', 'Not found')}'")
                print(f"   Email: '{data.get('email', 'Not found')}'")
                print(f"   Phone: '{data.get('phone', 'Not found')}'")
                print(f"   Address: '{data.get('address', 'Not found')}'")
                print(f"   Skills: {len(data.get('skills', []))} found")
                print(f"   Experience: {len(data.get('experience', []))} entries")
                print(f"   Education: {len(data.get('education', []))} entries")
                print(f"   Certifications: {len(data.get('certifications', []))} found")
                
                # Show skills in detail
                if data.get('skills'):
                    print(f"\n🎯 Skills extracted: {data.get('skills')}")
                
                # Show experience details
                if data.get('experience'):
                    print(f"\n💼 Experience entries:")
                    for i, exp in enumerate(data.get('experience', [])):
                        print(f"   {i+1}. {exp.get('position', 'N/A')} at {exp.get('company', 'N/A')}")
                        print(f"      Duration: {exp.get('duration', 'N/A')}")
                
                # Show education details
                if data.get('education'):
                    print(f"\n🎓 Education:")
                    for edu in data.get('education', []):
                        print(f"   {edu.get('degree', 'N/A')} from {edu.get('institution', 'N/A')}")
                
                return True
            else:
                print(f"❌ Parser returned error: {result.get('error')}")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testing Enhanced Parser with Comprehensive Resume...\n")
    
    success = test_enhanced_parser()
    print(f"\n🎯 Result: {'✅ COMPREHENSIVE PARSING SUCCESS' if success else '❌ PARSING FAILED'}")
