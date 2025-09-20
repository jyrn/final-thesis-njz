"""
Test PDF parsing with actual PDF file
"""

import requests
import base64
import json
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import io

def create_sample_pdf():
    """Create a sample PDF resume for testing"""
    buffer = io.BytesIO()
    
    # Create PDF
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Add content
    y = height - 50
    
    # Header
    p.setFont("Helvetica-Bold", 16)
    p.drawString(50, y, "Maria Santos")
    y -= 30
    
    p.setFont("Helvetica", 12)
    p.drawString(50, y, "Email: maria.santos@gmail.com")
    y -= 20
    p.drawString(50, y, "Phone: +63 9171234567")
    y -= 20
    p.drawString(50, y, "Address: 123 Rizal St., Quezon City, Philippines")
    y -= 40
    
    # Skills
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y, "SKILLS")
    y -= 25
    p.setFont("Helvetica", 12)
    p.drawString(50, y, "Python, JavaScript, React, Node.js, MySQL, AWS, HTML, CSS")
    y -= 40
    
    # Experience
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y, "WORK EXPERIENCE")
    y -= 25
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y, "Senior Software Developer")
    y -= 20
    p.setFont("Helvetica", 12)
    p.drawString(50, y, "Accenture Philippines")
    y -= 20
    p.drawString(50, y, "2020 - Present")
    y -= 20
    p.drawString(50, y, "• Developed web applications using React and Node.js")
    y -= 40
    
    # Education
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y, "EDUCATION")
    y -= 25
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y, "Bachelor of Science in Computer Science")
    y -= 20
    p.setFont("Helvetica", 12)
    p.drawString(50, y, "University of the Philippines")
    y -= 20
    p.drawString(50, y, "Graduated: 2018")
    y -= 40
    
    # Certifications
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y, "CERTIFICATIONS")
    y -= 25
    p.setFont("Helvetica", 12)
    p.drawString(50, y, "• AWS Certified Solutions Architect")
    y -= 20
    p.drawString(50, y, "• Microsoft Azure Fundamentals")
    
    p.save()
    
    # Get PDF bytes
    buffer.seek(0)
    return buffer.getvalue()

def test_pdf_parsing():
    """Test PDF parsing with actual PDF content"""
    try:
        print("📄 Creating sample PDF resume...")
        pdf_bytes = create_sample_pdf()
        print(f"✅ Created PDF, size: {len(pdf_bytes)} bytes")
        
        # Convert to base64
        pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')
        print(f"📦 Converted to base64, length: {len(pdf_base64)}")
        
        # Test the parser
        print("🧪 Testing parser with PDF content...")
        
        response = requests.post('http://localhost:5000/extract', 
                               json={'content': pdf_base64},
                               timeout=30)
        
        print(f"📊 Response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Parser response:")
            print(json.dumps(result, indent=2))
            
            if result.get('success'):
                data = result.get('data', {})
                print(f"\n📋 Extracted data summary:")
                print(f"   Name: '{data.get('name', 'Not found')}'")
                print(f"   Email: '{data.get('email', 'Not found')}'")
                print(f"   Phone: '{data.get('phone', 'Not found')}'")
                print(f"   Skills: {data.get('skills', [])} ({len(data.get('skills', []))} found)")
                print(f"   Experience: {len(data.get('experience', []))} entries")
                print(f"   Education: {len(data.get('education', []))} entries")
                print(f"   Certifications: {data.get('certifications', [])} ({len(data.get('certifications', []))} found)")
                
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
    print("🚀 Starting PDF parser test...\n")
    
    success = test_pdf_parsing()
    
    if success:
        print("\n🎉 PDF parsing test passed!")
    else:
        print("\n⚠️ PDF parsing test failed!")
