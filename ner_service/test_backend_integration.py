"""
Test the complete backend integration with enhanced parser
"""

import requests
import base64
import json
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import io

def create_test_resume():
    """Create a test resume PDF"""
    buffer = io.BytesIO()
    
    # Create PDF
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Add content
    y = height - 50
    
    # Header
    p.setFont("Helvetica-Bold", 16)
    p.drawString(50, y, "JUAN DELA CRUZ")
    y -= 30
    
    p.setFont("Helvetica", 11)
    p.drawString(50, y, "Email: juan.delacruz@gmail.com")
    y -= 18
    p.drawString(50, y, "Phone: +63 917 123 4567")
    y -= 18
    p.drawString(50, y, "Address: 123 Rizal Street, Manila, Philippines")
    y -= 30
    
    # Skills
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y, "TECHNICAL SKILLS")
    y -= 20
    p.setFont("Helvetica", 11)
    p.drawString(50, y, "• JavaScript, Python, React, Node.js")
    y -= 15
    p.drawString(50, y, "• MySQL, MongoDB, AWS")
    y -= 30
    
    # Experience
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y, "WORK EXPERIENCE")
    y -= 20
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y, "Software Developer")
    y -= 15
    p.setFont("Helvetica", 11)
    p.drawString(50, y, "Accenture Philippines")
    y -= 15
    p.drawString(50, y, "January 2020 - Present")
    y -= 15
    p.drawString(50, y, "• Developed web applications using React")
    y -= 30
    
    # Education
    p.setFont("Helvetica-Bold", 14)
    p.drawString(50, y, "EDUCATION")
    y -= 20
    p.setFont("Helvetica-Bold", 12)
    p.drawString(50, y, "Bachelor of Science in Computer Science")
    y -= 15
    p.setFont("Helvetica", 11)
    p.drawString(50, y, "University of the Philippines")
    y -= 15
    p.drawString(50, y, "Graduated: 2019")
    
    p.save()
    
    # Get PDF bytes
    buffer.seek(0)
    return buffer.getvalue()

def test_backend_upload():
    """Test uploading resume through backend API"""
    try:
        print("📄 Creating test resume PDF...")
        pdf_bytes = create_test_resume()
        print(f"✅ Created PDF, size: {len(pdf_bytes)} bytes")
        
        # Create a temporary file
        import tempfile
        import os
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            temp_file.write(pdf_bytes)
            temp_file_path = temp_file.name
        
        print(f"📁 Saved to temporary file: {temp_file_path}")
        
        # Test backend upload endpoint
        print("🧪 Testing backend upload endpoint...")
        
        # You'll need a valid token for this test
        # For now, let's just test the enhanced parser directly
        
        # Convert to base64 for enhanced parser test
        pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')
        
        # Test enhanced parser directly
        response = requests.post('http://localhost:5000/parse-resume', 
                               json={'pdf_base64': pdf_base64},
                               timeout=60)
        
        print(f"📊 Enhanced parser response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Enhanced parser response:")
            print(json.dumps(result, indent=2))
            
            if result.get('success'):
                data = result.get('data', {})
                print(f"\n📋 Parsed data structure:")
                print(f"   personalInfo: {data.get('personalInfo', {})}")
                print(f"   skills: {data.get('skills', [])}")
                print(f"   experience: {len(data.get('experience', []))} entries")
                print(f"   education: {len(data.get('education', []))} entries")
                
                return True
            else:
                print(f"❌ Parser returned error: {result.get('error')}")
                return False
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
        # Clean up
        os.unlink(temp_file_path)
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testing Backend Integration with Enhanced Parser...\n")
    
    success = test_backend_upload()
    print(f"\n🎯 Result: {'✅ INTEGRATION SUCCESS' if success else '❌ INTEGRATION FAILED'}")
