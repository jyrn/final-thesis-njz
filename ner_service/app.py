import spacy
import fitz  # PyMuPDF
from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import os
import base64
import io
from collections import defaultdict

app = Flask(__name__)
CORS(app)

# Load the trained Filipino resume NER model
try:
    nlp = spacy.load("filipino_resume_ner_model")
    print("Loaded custom Filipino resume NER model")
except OSError:
    try:
        nlp = spacy.load("en_core_web_sm")
        print("Loaded fallback English model")
    except OSError:
        nlp = spacy.blank("en")
        print("Using blank English model")

def extract_skills_section(text):
    """Enhanced skills extraction with multiple strategies"""
    skills = []
    
    # Strategy 1: Section-based extraction with improved patterns
    skills_patterns = [
        r'(?:TECHNICAL\s+SKILLS?|SKILLS?|CORE\s+COMPETENCIES|EXPERTISE|COMPETENCIES|PROFICIENCIES)\s*:?\s*\n([\s\S]*?)(?=\n\s*(?:[A-Z]{3,}|$))',
        r'(?:PROGRAMMING\s+LANGUAGES?|TECHNOLOGIES|TOOLS?\s+&?\s+TECHNOLOGIES|SOFTWARE)\s*:?\s*\n([\s\S]*?)(?=\n\s*(?:[A-Z]{3,}|$))',
        r'(?:TECHNICAL\s+EXPERTISE|TECHNICAL\s+PROFICIENCIES)\s*:?\s*\n([\s\S]*?)(?=\n\s*(?:[A-Z]{3,}|$))'
    ]
    
    for pattern in skills_patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            skills_text = match.group(1).strip()
            
            # Parse different skill formats
            # Format 1: Comma/semicolon separated
            if ',' in skills_text or ';' in skills_text:
                skill_items = re.split(r'[,;]\s*', skills_text)
                for skill in skill_items:
                    clean_skill = re.sub(r'^[•\-\*\s]+|[•\-\*\s]+$', '', skill).strip()
                    if 2 <= len(clean_skill) <= 25 and not re.match(r'^\d+$', clean_skill):
                        skills.append(clean_skill)
            
            # Format 2: Bullet points or line breaks
            else:
                lines = skills_text.split('\n')
                for line in lines:
                    line = line.strip()
                    if line and not line.startswith(('•', '-', '*')):
                        # Check if line contains multiple skills
                        if any(sep in line for sep in [',', '|', '/', '&']):
                            sub_skills = re.split(r'[,|/&]\s*', line)
                            for sub_skill in sub_skills:
                                clean_skill = re.sub(r'^[•\-\*\s]+|[•\-\*\s]+$', '', sub_skill).strip()
                                if 2 <= len(clean_skill) <= 25:
                                    skills.append(clean_skill)
                        else:
                            clean_skill = re.sub(r'^[•\-\*\s]+|[•\-\*\s]+$', '', line).strip()
                            if 2 <= len(clean_skill) <= 25:
                                skills.append(clean_skill)
    
    # Strategy 2: Enhanced common skills detection
    tech_skills = [
        # Programming Languages
        'JavaScript', 'Python', 'Java', 'C#', 'PHP', 'TypeScript', 'C++', 'C', 'Ruby', 'Go', 'Kotlin', 'Swift',
        # Frontend
        'React', 'Angular', 'Vue.js', 'HTML', 'CSS', 'HTML5', 'CSS3', 'Bootstrap', 'jQuery', 'SASS', 'LESS',
        # Backend
        'Node.js', 'Express.js', 'Django', 'Flask', 'Spring', 'Laravel', 'ASP.NET', '.NET', 'Rails',
        # Databases
        'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server', 'Firebase',
        # Cloud & DevOps
        'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub', 'GitLab',
        # Tools & Others
        'REST API', 'GraphQL', 'Agile', 'Scrum', 'Jira', 'Confluence', 'Postman', 'Webpack', 'npm', 'yarn'
    ]
    
    soft_skills = [
        'Communication', 'Leadership', 'Teamwork', 'Problem Solving', 'Critical Thinking',
        'Project Management', 'Time Management', 'Analytical Skills', 'Adaptability'
    ]
    
    office_skills = ['Excel', 'PowerPoint', 'Word', 'Outlook', 'Google Sheets', 'Google Docs']
    
    all_common_skills = tech_skills + soft_skills + office_skills
    
    # Find skills mentioned in text with word boundaries
    text_lower = text.lower()
    for skill in all_common_skills:
        # Use word boundaries to avoid partial matches
        pattern = r'\b' + re.escape(skill.lower()) + r'\b'
        if re.search(pattern, text_lower):
            skills.append(skill)
    
    # Strategy 3: Pattern-based skill extraction from job descriptions
    skill_context_patterns = [
        r'(?:experience\s+(?:with|in|using)|proficient\s+(?:in|with)|skilled\s+(?:in|with)|knowledge\s+of)\s+([A-Za-z0-9\s,./+#-]+)',
        r'(?:technologies|tools|languages):\s*([A-Za-z0-9\s,./+#-]+)',
        r'(?:including|such\s+as):\s*([A-Za-z0-9\s,./+#-]+)'
    ]
    
    for pattern in skill_context_patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            skill_text = match.group(1)
            potential_skills = re.split(r'[,;]\s*', skill_text)
            for skill in potential_skills:
                clean_skill = skill.strip()
                if 2 <= len(clean_skill) <= 25 and clean_skill.lower() in [s.lower() for s in all_common_skills]:
                    skills.append(clean_skill)
    
    return list(set(skills))

def extract_experience_section(text):
    """Enhanced work experience extraction with multiple parsing strategies"""
    experiences = []
    
    # Strategy 1: Section-based extraction with improved patterns
    exp_patterns = [
        r'(?:WORK\s+EXPERIENCE|PROFESSIONAL\s+EXPERIENCE|EMPLOYMENT\s+HISTORY|CAREER\s+HISTORY|EXPERIENCE)\s*:?\s*\n([\s\S]*?)(?=\n\s*(?:EDUCATION|SKILLS|TECHNICAL\s+SKILLS|CERTIFICATIONS|REFERENCES|PROJECTS|$))',
        r'(?:CAREER\s+SUMMARY|WORK\s+HISTORY|JOB\s+EXPERIENCE)\s*:?\s*\n([\s\S]*?)(?=\n\s*(?:EDUCATION|SKILLS|TECHNICAL\s+SKILLS|CERTIFICATIONS|REFERENCES|$))'
    ]
    
    for pattern in exp_patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            exp_text = match.group(1).strip()
            
            # Strategy 1a: Parse structured job entries (Position -> Company -> Duration -> Bullets)
            job_blocks = re.split(r'\n(?=(?:[A-Z][a-zA-Z\s]+(?:Developer|Engineer|Manager|Analyst|Specialist|Officer|Assistant|Coordinator|Lead|Director|Supervisor|Executive|Consultant|Administrator|Technician|Representative|Associate|Intern|Trainee)))', exp_text)
            
            for block in job_blocks:
                if not block.strip():
                    continue
                    
                lines = [line.strip() for line in block.split('\n') if line.strip()]
                if len(lines) < 2:
                    continue
                
                job_entry = {'position': '', 'company': '', 'duration': '', 'description': ''}
                description_lines = []
                
                # Parse each line to identify its type
                for i, line in enumerate(lines):
                    # Skip bullet points for now, collect them later
                    if line.startswith(('•', '-', '*', '◦')):
                        description_lines.append(line)
                        continue
                    
                    # First non-bullet line is likely the position
                    if not job_entry['position'] and is_job_title(line):
                        job_entry['position'] = line
                    
                    # Second line might be company
                    elif not job_entry['company'] and is_company_name(line):
                        job_entry['company'] = line
                    
                    # Look for date patterns
                    elif not job_entry['duration'] and is_date_range(line):
                        job_entry['duration'] = line
                    
                    # If we have position but no company yet, this might be company
                    elif job_entry['position'] and not job_entry['company'] and not is_date_range(line):
                        job_entry['company'] = line
                
                # Combine description bullets
                if description_lines:
                    job_entry['description'] = ' | '.join([line.lstrip('•-*◦ ') for line in description_lines[:3]])
                
                if job_entry['position']:
                    experiences.append(job_entry)
            
            # Strategy 1b: If no structured entries found, try alternative parsing
            if not experiences:
                # Look for company-first format
                company_first_pattern = r'([A-Z][a-zA-Z\s&.,]+(?:Inc|Corp|Company|Ltd|LLC|Corporation|Solutions|Technologies|Systems|Services|Group|Enterprises))\s*\n\s*([A-Z][a-zA-Z\s]+)\s*\n\s*([\d\w\s,-]+(?:Present|Current)?)'
                matches = re.finditer(company_first_pattern, exp_text, re.IGNORECASE | re.MULTILINE)
                
                for match in matches:
                    experiences.append({
                        'company': match.group(1).strip(),
                        'position': match.group(2).strip(),
                        'duration': match.group(3).strip(),
                        'description': ''
                    })
                
                # Strategy 1c: Single line format "Position at Company (Duration)"
                if not experiences:
                    single_line_pattern = r'([A-Z][a-zA-Z\s]+(?:Developer|Engineer|Manager|Analyst|Specialist))\s+(?:at|@)\s+([A-Z][a-zA-Z\s&.,]+)\s*(?:\(([^)]+)\)|\s+([0-9]{4}[^a-z]*(?:Present|Current|[0-9]{4})))'
                    matches = re.finditer(single_line_pattern, exp_text, re.IGNORECASE)
                    
                    for match in matches:
                        duration = match.group(3) or match.group(4) or ''
                        experiences.append({
                            'position': match.group(1).strip(),
                            'company': match.group(2).strip(),
                            'duration': duration.strip(),
                            'description': ''
                        })
    
    return experiences

def is_job_title(text):
    """Check if text looks like a job title"""
    job_keywords = [
        'developer', 'engineer', 'manager', 'analyst', 'specialist', 'officer', 
        'assistant', 'coordinator', 'lead', 'director', 'supervisor', 'executive',
        'consultant', 'administrator', 'technician', 'representative', 'associate',
        'intern', 'trainee', 'architect', 'designer', 'programmer', 'tester'
    ]
    
    text_lower = text.lower()
    return (any(keyword in text_lower for keyword in job_keywords) and 
            len(text.split()) <= 6 and 
            not re.search(r'\d{4}', text) and
            not any(suffix in text_lower for suffix in ['inc', 'corp', 'ltd', 'llc']))

def is_company_name(text):
    """Check if text looks like a company name"""
    company_suffixes = ['inc', 'corp', 'company', 'ltd', 'llc', 'corporation', 
                       'solutions', 'technologies', 'systems', 'services', 'group', 'enterprises']
    
    text_lower = text.lower()
    return (any(suffix in text_lower for suffix in company_suffixes) or
            (len(text.split()) <= 5 and text[0].isupper() and 
             not any(keyword in text_lower for keyword in ['developer', 'engineer', 'manager'])))

def is_date_range(text):
    """Check if text looks like a date range"""
    date_patterns = [
        r'\d{4}\s*[-–]\s*(?:\d{4}|Present|Current)',
        r'(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4}',
        r'\d{1,2}/\d{4}\s*[-–]\s*(?:\d{1,2}/\d{4}|Present|Current)'
    ]
    
    return any(re.search(pattern, text, re.IGNORECASE) for pattern in date_patterns)

def extract_education_section(text):
    """Extract education with structured data"""
    education = []
    
    # Look for education section with more flexible patterns
    edu_patterns = [
        r'(?:EDUCATION|EDUCATIONAL BACKGROUND|ACADEMIC BACKGROUND|ACADEMIC QUALIFICATIONS)\s*:?\s*\n([\s\S]*?)(?=\n\s*(?:WORK EXPERIENCE|EXPERIENCE|SKILLS|TECHNICAL SKILLS|CERTIFICATIONS|REFERENCES|$))',
        r'(?:EDUCATION|EDUCATIONAL BACKGROUND)\s*:?\s*([\s\S]*?)(?=\n\s*(?:WORK|EXPERIENCE|SKILLS|CERTIFICATIONS|$))'
    ]
    
    for pattern in edu_patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            edu_text = match.group(1)
            
            # Parse education entries line by line
            lines = [line.strip() for line in edu_text.split('\n') if line.strip()]
            current_edu = {}
            
            for i, line in enumerate(lines):
                # Check for degree patterns
                degree_match = re.match(r'(Bachelor of Science|Bachelor of Arts|BS|BA|Master of Science|MS|MA|PhD|Certificate)\s*(?:in\s+)?(.+)?', line, re.IGNORECASE)
                if degree_match:
                    if current_edu.get('degree'):
                        education.append(current_edu)
                    current_edu = {
                        'degree': degree_match.group(1),
                        'field': degree_match.group(2).strip() if degree_match.group(2) else '',
                        'institution': '',
                        'year': ''
                    }
                
                # Check for institution patterns
                elif re.match(r'^[A-Z][a-zA-Z\s]+(?:University|College|Institute|School|Academy|TESDA)', line, re.IGNORECASE):
                    if current_edu.get('degree') and not current_edu.get('institution'):
                        current_edu['institution'] = line
                
                # Check for graduation year
                elif re.match(r'.*(Graduated|Class of|Year)?:?\s*(\d{4})', line, re.IGNORECASE):
                    year_match = re.search(r'(\d{4})', line)
                    if year_match and current_edu.get('degree') and not current_edu.get('year'):
                        current_edu['year'] = year_match.group(1)
                
                # Check for honors/distinctions
                elif re.match(r'.*(Magna Cum Laude|Cum Laude|Summa Cum Laude|With Honors|Dean\'s List)', line, re.IGNORECASE):
                    if current_edu.get('degree'):
                        current_edu['honors'] = line
            
            # Add the last education entry
            if current_edu.get('degree'):
                education.append(current_edu)
            
            # Alternative parsing for different formats
            if not education:
                # Try to find degree and institution in the same line or consecutive lines
                combined_patterns = [
                    r'(Bachelor of Science|Bachelor of Arts|BS|BA|Master of Science|MS|MA|PhD|Certificate)\s+(?:in\s+)?([A-Za-z\s]+?)\s*(?:from\s+|at\s+|\n\s*)([A-Z][a-zA-Z\s]+(?:University|College|Institute|School))\s*(?:.*?(\d{4}))?',
                    r'([A-Z][a-zA-Z\s]+(?:University|College|Institute|School))\s*(?:\n\s*)?(Bachelor of Science|Bachelor of Arts|BS|BA|Master of Science|MS|MA|PhD|Certificate)\s+(?:in\s+)?([A-Za-z\s]+?)\s*(?:.*?(\d{4}))?'
                ]
                
                for combined_pattern in combined_patterns:
                    matches = re.finditer(combined_pattern, edu_text, re.IGNORECASE | re.MULTILINE)
                    for match in matches:
                        groups = match.groups()
                        if len(groups) >= 3:
                            # Determine which group is degree, field, institution
                            if any(deg in groups[0] for deg in ['Bachelor', 'Master', 'BS', 'BA', 'MS', 'MA', 'PhD', 'Certificate']):
                                education.append({
                                    'degree': groups[0],
                                    'field': groups[1] if len(groups) > 1 else '',
                                    'institution': groups[2] if len(groups) > 2 else '',
                                    'year': groups[3] if len(groups) > 3 and groups[3] else ''
                                })
                            else:
                                education.append({
                                    'institution': groups[0],
                                    'degree': groups[1] if len(groups) > 1 else '',
                                    'field': groups[2] if len(groups) > 2 else '',
                                    'year': groups[3] if len(groups) > 3 and groups[3] else ''
                                })
    
    return education

def extract_structured_data(text, entities):
    """Enhanced extraction using hybrid NER + rule-based approach"""
    
    # Extract name - first line or first capitalized words
    name = ""
    lines = text.split('\n')
    for line in lines[:3]:  # Check first 3 lines
        line = line.strip()
        # Look for name pattern: 2-4 capitalized words
        name_match = re.match(r'^([A-Z][a-z]+(?:\s+[A-Z][a-z]*){1,3})(?:\s|$)', line)
        if name_match and len(line.split()) <= 4:
            potential_name = name_match.group(1).strip()
            # Simple validation - avoid common false positives
            if not any(word.lower() in ['objective', 'summary', 'profile', 'resume', 'cv'] for word in potential_name.split()):
                name = potential_name
                break
    
    # Rule-based extraction for personal info
    email = ""
    email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
    if email_match:
        email = email_match.group()
    
    phone = ""
    phone_patterns = [r'\+63\d{10}', r'09\d{9}', r'0\d{2}\s?\d{3}\s?\d{4}']
    for pattern in phone_patterns:
        phone_match = re.search(pattern, text)
        if phone_match:
            phone = phone_match.group()
            break
    
    address = ""
    address_patterns = [
        r'\d+\s+[A-Za-z\s]+(?:Ave|Street|St|Road|Rd)[.,\s]*[A-Za-z\s]*(?:City|Province)[,\s]*Philippines',
        r'[A-Za-z\s]+(?:City|Province)[,\s]*Philippines'
    ]
    for pattern in address_patterns:
        address_match = re.search(pattern, text, re.IGNORECASE)
        if address_match:
            address = address_match.group().strip()
            break
    
    # Enhanced rule-based extraction for skills
    skills = extract_skills_section(text)
    
    # Enhanced rule-based extraction for experience
    experience_entries = extract_experience_section(text)
    
    # Enhanced rule-based extraction for education
    education_entries = extract_education_section(text)
    
    # Use custom NER as supplementary data
    entity_groups = defaultdict(list)
    for ent in entities:
        if isinstance(ent, tuple):
            entity_groups[ent[1]].append(ent[0])
        else:
            entity_groups[ent.get("label", "")].append(ent.get("text", ""))
    
    # Combine NER entities with rule-based extraction
    ner_institutions = entity_groups.get("UNIVERSITY", []) + entity_groups.get("SCHOOL", [])
    ner_degrees = entity_groups.get("DEGREE", []) + entity_groups.get("EDUCATION", [])
    ner_companies = entity_groups.get("COMPANY", []) + entity_groups.get("ORG", [])
    ner_positions = entity_groups.get("POSITION", []) + entity_groups.get("JOB_TITLE", [])
    ner_skills = entity_groups.get("SKILL", []) + entity_groups.get("TECHNOLOGY", [])
    
    # Merge with rule-based results
    all_skills = list(set(skills + ner_skills))
    companies = list(set([exp.get('company', '') for exp in experience_entries] + ner_companies))
    positions = list(set([exp.get('position', '') for exp in experience_entries] + ner_positions))
    
    # Simple experience level classification
    text_lower = text.lower()
    years_matches = re.findall(r'(\d+)\s*(?:years?|yrs?)', text_lower)
    total_years = sum(int(year) for year in years_matches) if years_matches else 0
    
    if total_years >= 8 or len(companies) >= 3:
        experience_level = "senior"
    elif total_years >= 3 or len(positions) >= 2:
        experience_level = "mid"
    elif total_years >= 1:
        experience_level = "junior"
    else:
        experience_level = "entry"
    
    # Simple industry classification
    industry_keywords = {
        'technology': ['software', 'developer', 'IT', 'tech', 'web'],
        'finance': ['bank', 'financial', 'accounting'],
        'healthcare': ['hospital', 'medical', 'nurse', 'doctor'],
        'education': ['school', 'university', 'teacher'],
        'bpo': ['call center', 'customer service']
    }
    
    industry_tags = []
    for industry, keywords in industry_keywords.items():
        if any(keyword in text_lower for keyword in keywords):
            industry_tags.append(industry)
    
    # Structure the parsed data with enhanced format
    parsed_data = {
        "personalInfo": {
            "name": name,
            "email": email,
            "phone": phone,
            "address": address
        },
        "education": education_entries[:3],  # Structured education entries
        "experience": experience_entries[:5],  # Structured experience entries
        "skills": all_skills[:15],  # Combined skills list
        "experienceLevel": experience_level,
        "industryTags": industry_tags[:3],
        "extractedText": text[:1000] + "..." if len(text) > 1000 else text
    }
    
    return parsed_data

def extract_text_from_pdf(pdf_data):
    """Extract text from PDF using PyMuPDF"""
    try:
        # Open PDF document from bytes
        doc = fitz.open(stream=pdf_data, filetype="pdf")
        text = ""
        
        for page_num in range(len(doc)):
            page = doc.load_page(page_num)
            text += page.get_text()
        
        doc.close()
        return text.strip()
    except Exception as e:
        print(f"Error extracting text from PDF: {str(e)}")
        return None

@app.route("/parse-resume", methods=["POST"])
def parse_resume():
    try:
        data = request.json
        
        # Handle both text and PDF file inputs
        if "text" in data and data["text"].strip():
            # Direct text input
            text = data["text"]
        elif "pdf_base64" in data:
            # PDF file as base64
            try:
                pdf_bytes = base64.b64decode(data["pdf_base64"])
                text = extract_text_from_pdf(pdf_bytes)
                if not text:
                    return jsonify({"error": "Failed to extract text from PDF"}), 400
            except Exception as e:
                return jsonify({"error": f"Invalid PDF data: {str(e)}"}), 400
        else:
            return jsonify({"error": "No text or PDF data provided"}), 400
        
        if not text.strip():
            return jsonify({"error": "No readable text found in the document"}), 400
        
        # Process text with NER model
        doc = nlp(text)
        entities = [{"text": ent.text, "label": ent.label_, "start": ent.start_char, "end": ent.end_char} for ent in doc.ents]
        
        # Extract structured data
        structured_data = extract_structured_data(text, entities)
        
        return jsonify({
            "success": True,
            "data": structured_data,
            "entityCount": len(entities)
        })
        
    except Exception as e:
        print(f"Error parsing resume: {str(e)}")
        return jsonify({"error": f"Failed to parse resume: {str(e)}"}), 500

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "model_loaded": True})

@app.route("/test-parse", methods=["POST"])
def test_parse():
    """Test endpoint for direct text parsing without PDF"""
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return jsonify({"error": "No text provided"}), 400
        
        # Use NER model to extract entities
        doc = nlp(text)
        entities = [(ent.text, ent.label_) for ent in doc.ents]
        
        # Extract structured data using hybrid approach
        parsed_data = extract_structured_data(text, entities)
        
        return jsonify({
            "success": True,
            "parsed_data": parsed_data,
            "entities": entities,
            "entityCount": len(entities)
        })
        
    except Exception as e:
        print(f"Error in test parsing: {str(e)}")
        return jsonify({"error": f"Failed to parse text: {str(e)}"}), 500

if __name__ == "__main__":
    print("Starting NER service on port 5000...")
    print("Model loaded successfully!")
    app.run(host="0.0.0.0", port=5000, debug=True)
