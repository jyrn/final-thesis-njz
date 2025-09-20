import spacy
import fitz  # PyMuPDF
from flask import Flask, request, jsonify
from flask_cors import CORS
import re
import os
import base64
import io
from collections import defaultdict
import torch
from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline
from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.corpus import stopwords
import dateparser
import phonenumbers
from email_validator import validate_email, EmailNotValidError
import pandas as pd
from difflib import SequenceMatcher
import unicodedata

app = Flask(__name__)
CORS(app)

# Download required NLTK data
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')

class EnhancedResumeParser:
    def __init__(self):
        # Load SpaCy NER model
        model_paths = [
            "super_enhanced_filipino_resume_ner_model",
            "ultra_enhanced_filipino_resume_ner_model",
            "enhanced_filipino_resume_ner_model", 
            "advanced_filipino_resume_ner_model",
            "improved_filipino_resume_ner_model",
            "filipino_resume_ner_model"
        ]
        for model_path in model_paths:
            try:
                self.nlp = spacy.load(f"./{model_path}")
                print(f"✅ Loaded {model_path}")
                break
            except:
                pass
        else:
            print("❌ No custom model found, using blank English model")
            self.nlp = spacy.blank("en")
        
        # Load transformer-based NER model
        self.load_transformer_ner()
        
        # Load sentence transformer for semantic similarity
        self.load_sentence_transformer()
        
        # Initialize skill databases
        self.init_skill_databases()
        
        # Initialize stopwords
        self.stop_words = set(stopwords.words('english'))
    
    def load_transformer_ner(self):
        """Load transformer-based NER model for enhanced entity recognition"""
        try:
            # Use a pre-trained BERT model fine-tuned for NER
            model_name = "dbmdz/bert-large-cased-finetuned-conll03-english"
            self.ner_tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.ner_model = AutoModelForTokenClassification.from_pretrained(model_name)
            self.ner_pipeline = pipeline("ner", 
                                       model=self.ner_model, 
                                       tokenizer=self.ner_tokenizer,
                                       aggregation_strategy="simple")
            print("✓ Loaded transformer NER model")
        except Exception as e:
            print(f"⚠ Could not load transformer NER model: {e}")
            self.ner_pipeline = None
    
    def load_sentence_transformer(self):
        """Load sentence transformer for semantic similarity"""
        try:
            self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
            print("✓ Loaded sentence transformer model")
        except Exception as e:
            print(f"⚠ Could not load sentence transformer: {e}")
            self.sentence_model = None
    
    def init_skill_databases(self):
        """Initialize comprehensive skill databases with embeddings and Filipino context"""
        self.tech_skills = {
            'programming_languages': [
                'Python', 'JavaScript', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift',
                'Kotlin', 'TypeScript', 'Scala', 'R', 'MATLAB', 'Perl', 'Objective-C', 'Dart', 'VB.NET',
                'COBOL', 'Fortran', 'Assembly', 'Lua', 'Haskell', 'Clojure', 'F#', 'Erlang'
            ],
            'web_technologies': [
                'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask', 'Spring',
                'Laravel', 'Ruby on Rails', 'ASP.NET', 'jQuery', 'Bootstrap', 'Tailwind CSS',
                'Next.js', 'Nuxt.js', 'Svelte', 'Gatsby', 'Hugo', 'Jekyll', 'Blazor', 'FastAPI'
            ],
            'databases': [
                'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server',
                'Cassandra', 'DynamoDB', 'Firebase', 'Elasticsearch', 'MariaDB', 'CouchDB',
                'Neo4j', 'InfluxDB', 'TimescaleDB', 'Supabase', 'PlanetScale'
            ],
            'cloud_platforms': [
                'AWS', 'Azure', 'Google Cloud', 'Heroku', 'DigitalOcean', 'Vercel', 'Netlify',
                'Railway', 'Render', 'Fly.io', 'Cloudflare', 'Linode', 'Vultr'
            ],
            'tools_frameworks': [
                'Docker', 'Kubernetes', 'Git', 'Jenkins', 'Terraform', 'Ansible', 'Webpack',
                'Babel', 'ESLint', 'Prettier', 'Jest', 'Cypress', 'Selenium', 'Postman',
                'Insomnia', 'Figma', 'Adobe XD', 'Sketch', 'InVision', 'Zeplin'
            ],
            'mobile_development': [
                'React Native', 'Flutter', 'Xamarin', 'Ionic', 'Cordova', 'Unity',
                'Android Studio', 'Xcode', 'Expo', 'NativeScript'
            ],
            'data_science': [
                'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'PyTorch', 'Keras',
                'Matplotlib', 'Seaborn', 'Plotly', 'Jupyter', 'Apache Spark', 'Hadoop'
            ]
        }
        
        self.soft_skills = [
            'Leadership', 'Communication', 'Problem Solving', 'Team Work', 'Critical Thinking',
            'Adaptability', 'Time Management', 'Project Management', 'Analytical Skills',
            'Customer Service', 'Negotiation', 'Presentation Skills', 'Conflict Resolution',
            'Collaboration', 'Innovation', 'Creativity', 'Decision Making', 'Mentoring'
        ]
        
        # Filipino-specific skills and terms
        self.filipino_skills = [
            'Tagalog', 'Filipino', 'Bisaya', 'Cebuano', 'Ilocano', 'Hiligaynon',
            'BPO', 'Call Center', 'Customer Support', 'Technical Support',
            'Virtual Assistant', 'Data Entry', 'Transcription'
        ]
        
        # Create embeddings for skills if sentence transformer is available
        if self.sentence_model:
            all_skills = []
            for category in self.tech_skills.values():
                all_skills.extend(category)
            all_skills.extend(self.soft_skills)
            all_skills.extend(self.filipino_skills)
            
            self.skill_embeddings = self.sentence_model.encode(all_skills)
            self.skill_list = all_skills
    
    def extract_with_confidence(self, text):
        """Main extraction method that combines all approaches with confidence scoring"""
        print("🔍 Starting enhanced extraction with confidence scoring...")
        
        # Extract using different methods
        spacy_results = self.extract_with_spacy(text)
        transformer_results = self.extract_with_transformer(text)
        rule_results = self.extract_with_rules(text)
        semantic_results = self.extract_with_semantics(text)
        
        # Combine results intelligently
        combined_results = self.combine_extraction_results(
            spacy_results, transformer_results, rule_results, semantic_results
        )
        
        # Add language detection
        combined_results['language'] = self.detect_language(text)
        
        # Add training/seminar extraction
        all_trainings = self.extract_trainings(text)
        
        # Separate certifications from trainings based on type
        actual_trainings = []
        training_certifications = []
        
        for training in all_trainings:
            if training.get('type') == 'certification':
                # Extract just the name for certifications
                training_certifications.append(training['name'])
            else:
                actual_trainings.append(training)
        
        combined_results['trainings'] = actual_trainings
        
        # Add dedicated certification extraction
        dedicated_certifications = self.extract_certifications_dedicated(text)
        
        # Combine certifications from both sources and remove duplicates
        all_certifications = list(set(dedicated_certifications + training_certifications))
        combined_results['certifications'] = all_certifications
        
        # Add languages extraction
        combined_results['languages'] = self.extract_languages(text)
        
        print(f"✅ Extraction complete. Found {len(combined_results.get('skills', []))} skills, {len(combined_results.get('experience', []))} experiences, {len(combined_results.get('trainings', []))} trainings, {len(combined_results.get('certifications', []))} certifications")
        return combined_results
    
    def extract_with_spacy(self, text):
        """Extract entities using SpaCy NER"""
        doc = self.nlp(text)
        
        results = {
            'personal_info': {},
            'skills': [],
            'experience': [],
            'education': [],
            'organizations': [],
            'confidence': 0.7  # Base confidence for SpaCy
        }
        
        # Extract named entities
        for ent in doc.ents:
            if ent.label_ == "PERSON":
                if not results['personal_info'].get('name'):
                    results['personal_info']['name'] = ent.text
            elif ent.label_ == "ORG":
                results['organizations'].append(ent.text)
            elif ent.label_ in ["SKILL", "TECHNOLOGY"]:
                results['skills'].append(ent.text)
        
        return results
    
    def extract_with_transformer(self, text):
        """Extract entities using transformer-based NER"""
        if not self.ner_pipeline:
            return {}
        
        # Split text into chunks to handle long resumes
        chunks = [text[i:i+512] for i in range(0, len(text), 400)]
        
        results = {
            'personal_info': {},
            'organizations': [],
            'persons': [],
            'confidence': 0.8  # Higher confidence for transformer
        }
        
        for chunk in chunks:
            try:
                entities = self.ner_pipeline(chunk)
                for entity in entities:
                    if entity['entity_group'] == 'PER' and entity['score'] > 0.9:
                        if not results['personal_info'].get('name'):
                            results['personal_info']['name'] = entity['word']
                    elif entity['entity_group'] == 'ORG' and entity['score'] > 0.8:
                        results['organizations'].append(entity['word'])
            except Exception as e:
                print(f"Transformer NER error: {e}")
        
        return results
    
    def extract_with_rules(self, text):
        """Extract entities using enhanced rule-based patterns for Filipino resumes"""
        results = {
            'personal_info': {},
            'skills': [],
            'experience': [],
            'education': [],
            'confidence': 0.9  # High confidence for rule-based
        }
        
        # Extract personal information
        personal_info = {}
        
        # Enhanced name extraction
        name = self.extract_name_enhanced(text)
        if name:
            personal_info['name'] = name
        
        # Email extraction
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        email_match = re.search(email_pattern, text)
        if email_match:
            personal_info['email'] = email_match.group()
        
        # Enhanced phone extraction for Filipino formats
        phone_patterns = [
            r'\b09\d{2}[-\s]?\d{3}[-\s]?\d{4}\b',  # Mobile with separators: 0917-123-4567
            r'\b09\d{9}\b',  # Standard mobile: 09123456789
            r'\+63[-\s]?9\d{2}[-\s]?\d{3}[-\s]?\d{4}\b',  # International with separators: +63-917-123-4567
            r'\+63\s?9\d{8}\b',  # International: +63 9123456789
            r'\b63\s?9\d{8}\b',  # Without plus: 63 9123456789
            r'\(\d{2}\)\s?\d{4}[-\s]?\d{4}\b',  # Landline: (02) 8123-4567
            r'\b\d{4}[-\s]?\d{3}[-\s]?\d{4}\b',  # Landline alt: 8123-456-7890
            r'\b\d{3}[-\s]?\d{3}[-\s]?\d{4}\b'  # General: 123-456-7890
        ]
        
        for pattern in phone_patterns:
            phone_match = re.search(pattern, text)
            if phone_match:
                phone_candidate = phone_match.group()
                # Additional validation - must have at least 7 digits for landline, 10 for mobile
                digits_only = re.sub(r'[^\d]', '', phone_candidate)
                if len(digits_only) >= 7:  # Allow landlines (7+ digits) and mobile (10+ digits)
                    personal_info['phone'] = phone_candidate
                    break
        
        # Enhanced address extraction with multiple strategies
        address_patterns = [
            r'\b(?:brgy\.?|barangay)\s+[^\n]+',  # Barangay addresses
            r'\b\d+\s+[A-Za-z\s]+(?:street|st\.?|avenue|ave\.?|road|rd\.?)\b[^\n]*',  # Street addresses
            r'\b[A-Za-z\s]+(?:city|municipality)\b[^\n]*',  # City addresses
            r'\bunit\s+\d+[^\n]*',  # Unit addresses
            r'\b[A-Za-z\s]+,\s*[A-Za-z\s]+(?:city|province)\b'  # City, Province format
        ]
        
        # First try pattern matching
        address_found = False
        for pattern in address_patterns:
            if not address_found:
                address_match = re.search(pattern, text, re.IGNORECASE)
                if address_match:
                    address_candidate = address_match.group().strip()
                    if self.is_likely_address(address_candidate):
                        personal_info['address'] = address_candidate
                        address_found = True
                        break
        
        # If no pattern match, try section-based extraction
        if not address_found:
            lines = text.split('\n')
            in_contact_section = False
            
            for line in lines:
                line_stripped = line.strip()
                
                # Detect contact section
                if any(keyword in line.upper() for keyword in ['CONTACT', 'ADDRESS', 'PERSONAL']):
                    in_contact_section = True
                    continue
                elif in_contact_section and line_stripped.upper().startswith(('EDUCATION', 'SKILLS', 'EXPERIENCE', 'WORK')):
                    in_contact_section = False
                    continue
                
                # Extract from contact section
                if in_contact_section and line_stripped:
                    # Handle two-column format
                    if '    ' in line:  # Multiple spaces indicate columns
                        left_part = line.split('    ')[0].strip()
                        if left_part and self.is_likely_address(left_part):
                            personal_info['address'] = left_part
                            address_found = True
                            break
                    else:
                        # Single column
                        if self.is_likely_address(line_stripped):
                            personal_info['address'] = line_stripped
                            address_found = True
                            break
            
            # Fallback: look anywhere
            if not address_found:
                for line in lines:
                    line_stripped = line.strip()
                    if self.is_likely_address(line_stripped):
                        personal_info['address'] = line_stripped
                        break
        
        results['personal_info'] = personal_info
        
        # Extract skills using enhanced patterns
        results['skills'] = self.extract_skills_advanced(text)
        
        # Extract experience with better parsing
        results['experience'] = self.extract_experience_advanced(text)
        
        # Extract education
        results['education'] = self.extract_education_advanced(text)
        
        # Extract languages
        results['languages'] = self.extract_languages(text)
        
        # Extract trainings and seminars
        results['trainings'] = self.extract_trainings(text)
        
        # Post-process to clean up misclassifications
        results = self.post_process_classifications(results)
        
        # Add language detection
        results['language'] = self.detect_language(text)
        
        return results
    
    def is_likely_address(self, line):
        """Check if a line is likely an address"""
        line_lower = line.lower()
        address_indicators = [
            'brgy', 'barangay', 'city', 'street', 'avenue', 'road', 'unit', 'block',
            'subdivision', 'village', 'district', 'province', 'manila', 'quezon',
            'makati', 'taguig', 'pasig', 'cebu', 'davao'
        ]
        
        # Must contain address indicators
        has_indicator = any(indicator in line_lower for indicator in address_indicators)
        
        # Must not be phone or email
        is_not_phone = not re.search(r'\d{10,}', line)
        is_not_email = '@' not in line
        
        # Should have reasonable length
        reasonable_length = 10 <= len(line) <= 100
        
        return has_indicator and is_not_phone and is_not_email and reasonable_length
    
    def extract_languages(self, text):
        """
        Enhanced language extraction from resume text with support for various formats:
        - Dedicated LANGUAGES section with bullet points or lists
        - Language proficiency indicators (Fluent, Native, etc.)
        - Common language patterns in resumes
        - Support for both English and Filipino language names
        """
        languages = []
        
        # Common language patterns with proficiency levels
        language_patterns = [
            # Patterns for language sections
            r'(?:languages?|linguistic skills?):\s*([^\n]+)',
            r'(?:language\s+proficien(?:cy|t)|proficien(?:cy|t)\s+in):\s*([^\n]+)',
            
            # Patterns for language with proficiency
            r'(?i)(?:fluent|proficient|native|basic|intermediate|advanced|expert|beginner)\s+(?:in\s+)?(?:the\s+)?([a-z\s,]+)(?:\s+language)?',
            r'(?i)(?:speaks?|knows?|uses?)\s+(?:the\s+)?([a-z\s,]+)(?:\s+language)?(?:\s+at\s+(?:a\s+)?(?:basic|intermediate|advanced|native|fluent|expert|beginner)\s+level)?',
            
            # Patterns for language lists
            r'(?:languages?|speaks?|fluent in):?\s*([^\n]+)',
            
            # Pattern for language with level in parentheses
            r'([A-Za-z]+)\s*\(\s*(?:Native|Fluent|Basic|Intermediate|Advanced|Expert|Beginner)\s*\)',
        ]
        
        # Common language names in English and Filipino with variants
        language_mapping = {
            'english': 'English',
            'filipino': 'Filipino',
            'tagalog': 'Filipino',
            'cebuano': 'Cebuano',
            'ilocano': 'Ilocano',
            'ilokano': 'Ilocano',
            'waray': 'Waray',
            'hiligaynon': 'Hiligaynon',
            'bicol': 'Bicolano',
            'bikol': 'Bicolano',
            'kapampangan': 'Kapampangan',
            'pangasinan': 'Pangasinan',
            'spanish': 'Spanish',
            'mandarin': 'Mandarin',
            'chinese': 'Chinese',
            'japanese': 'Japanese',
            'korean': 'Korean',
            'french': 'French',
            'german': 'German',
            'arabic': 'Arabic',
            'hindi': 'Hindi',
            'urdu': 'Urdu',
            'thai': 'Thai',
            'vietnamese': 'Vietnamese',
            'malay': 'Malay',
            'bahasa': 'Bahasa Indonesia',
            'indonesian': 'Bahasa Indonesia',
        }
        
        # Look for LANGUAGES section
        lines = [line.strip() for line in text.split('\n')]
        in_language_section = False
        
        for i, line in enumerate(lines):
            line_stripped = line.strip()
            
            # Check for section header (case insensitive, with optional colon)
            if re.search(r'^languages?\s*:?$', line_stripped, re.IGNORECASE):
                in_language_section = True
                continue
                
            # Check if we've moved to another section
            section_headers = ['SKILLS', 'EXPERIENCE', 'EDUCATION', 'CERTIFICATIONS', 'TRAININGS', 
                             'REFERENCES', 'AWARDS', 'PROJECTS', 'ACHIEVEMENTS']
            
            if in_language_section and any(
                line_stripped.upper().startswith(header) 
                for header in section_headers
            ):
                in_language_section = False
                break
                
            if in_language_section and line_stripped:
                # Skip lines that are too long to be language entries
                if len(line_stripped) > 50:
                    continue
                    
                # Handle bullet points or simple lists
                if '•' in line_stripped:
                    lang_items = [item.strip() for item in line_stripped.split('•') if item.strip()]
                    for item in lang_items:
                        self._process_language_item(item, languages, language_mapping)
                # Handle comma-separated lists
                elif ',' in line_stripped:
                    lang_items = [item.strip() for item in line_stripped.split(',') if item.strip()]
                    for item in lang_items:
                        self._process_language_item(item, languages, language_mapping)
                # Handle other list formats
                elif line_stripped and len(line_stripped.split()) <= 5:  # Reasonable language name length
                    self._process_language_item(line_stripped, languages, language_mapping)
        
        # Pattern matching fallback if no languages found in dedicated section
        if not languages:
            for pattern in language_patterns:
                matches = re.finditer(pattern, text, re.IGNORECASE)
                for match in matches:
                    if match.lastindex >= 1:
                        lang_text = match.group(1).strip()
                        # Clean up common artifacts
                        lang_text = re.sub(r'[^\w\s\-&,]', '', lang_text)
                        
                        # Split by common separators
                        for separator in [',', '&', ' and ', '/', ';']:
                            if separator in lang_text:
                                lang_items = [item.strip() for item in lang_text.split(separator) if item.strip()]
                                for item in lang_items:
                                    self._process_language_item(item, languages, language_mapping)
                                break
                        else:
                            self._process_language_item(lang_text, languages, language_mapping)
        
        # Remove duplicates while preserving order
        seen = set()
        unique_languages = []
        for lang in languages:
            if lang.lower() not in seen:
                seen.add(lang.lower())
                unique_languages.append(lang)
        
        return unique_languages
    
    def _process_language_item(self, text, languages_list, language_mapping):
        """Helper method to process a single language item and add to languages list"""
        if not text.strip():
            return
            
        # Remove proficiency levels in parentheses
        text = re.sub(r'\s*\([^)]*\)', '', text).strip()
        
        # Remove proficiency indicators
        proficiency_indicators = [
            'basic', 'intermediate', 'advanced', 'native', 'fluent', 'expert', 
            'beginner', 'proficient', 'conversational', 'elementary'
        ]
        
        # Remove proficiency words
        words = text.split()
        cleaned_words = [word for word in words if word.lower() not in proficiency_indicators]
        cleaned_text = ' '.join(cleaned_words).strip()
        
        if not cleaned_text:
            return
            
        # Check against known language names
        text_lower = cleaned_text.lower()
        for lang_key, lang_value in language_mapping.items():
            if lang_key in text_lower:
                languages_list.append(lang_value)
                return
                
        # If no match found but text is short, add as is
        if len(cleaned_text.split()) <= 3 and len(cleaned_text) <= 25:
            # Capitalize first letter of each word
            formatted_lang = ' '.join(word.capitalize() for word in cleaned_text.split())
            languages_list.append(formatted_lang)
    
    def extract_trainings(self, text):
        """Extract trainings, seminars, workshops, and certifications"""
        trainings = []
        
        # Enhanced training-related sections with more patterns
        training_sections = [
            'TRAINING', 'TRAININGS', 'SEMINAR', 'SEMINARS', 'WORKSHOP', 'WORKSHOPS', 
            'CERTIFICATION', 'CERTIFICATIONS', 'CERTIFICATES', 'COURSE', 'COURSES',
            'PROFESSIONAL DEVELOPMENT', 'CONTINUING EDUCATION', 'LICENSES & CERTIFICATIONS',
            'PROFESSIONAL CERTIFICATIONS', 'AWARDS & CERTIFICATIONS', 'CREDENTIALS'
        ]
        lines = text.split('\n')
        in_training_section = False
        current_section_type = 'training'
        
        for line in lines:
            line_stripped = line.strip()
            
            # Check for training section headers
            section_found = False
            for section in training_sections:
                if section in line.upper():
                    in_training_section = True
                    current_section_type = section.lower()
                    if 'seminar' in current_section_type:
                        current_section_type = 'seminar'
                    elif 'workshop' in current_section_type:
                        current_section_type = 'workshop'
                    elif 'certification' in current_section_type:
                        current_section_type = 'certification'
                    elif 'course' in current_section_type:
                        current_section_type = 'course'
                    else:
                        current_section_type = 'training'
                    section_found = True
                    break
            
            if section_found:
                continue
            elif in_training_section and line_stripped.upper().startswith(('SKILLS', 'EXPERIENCE', 'EDUCATION', 'LANGUAGES')):
                in_training_section = False
                continue
            
            # Extract training entries
            if in_training_section and line_stripped:
                training_entry = {
                    'name': '',
                    'provider': '',
                    'date': '',
                    'location': '',
                    'duration': '',
                    'type': current_section_type,
                    'description': ''
                }
                
                # Parse training line - try different formats
                if '|' in line_stripped:
                    # Format: "Training Name | Provider | Date"
                    parts = [part.strip() for part in line_stripped.split('|')]
                    if len(parts) >= 1:
                        training_entry['name'] = parts[0].replace('•', '').strip()
                    if len(parts) >= 2:
                        training_entry['provider'] = parts[1]
                    if len(parts) >= 3:
                        training_entry['date'] = parts[2]
                elif '-' in line_stripped and len(line_stripped.split('-')) >= 2:
                    # Format: "Training Name - Provider"
                    parts = [part.strip() for part in line_stripped.split('-')]
                    training_entry['name'] = parts[0].replace('•', '').strip()
                    training_entry['provider'] = parts[1]
                else:
                    # Simple format: just the training name
                    training_entry['name'] = line_stripped.replace('•', '').strip()
                
                # Enhanced validation for training entries
                if training_entry['name'] and len(training_entry['name']) > 3:
                    # Check if this is actually a certification (even if in training section)
                    if self.is_comprehensive_certification(training_entry['name']):
                        # This is a certification, mark it as such
                        training_entry['type'] = 'certification'
                        trainings.append(training_entry)
                    elif current_section_type == 'certification':
                        if self.is_valid_certification(training_entry['name']):
                            training_entry['type'] = 'certification'
                            trainings.append(training_entry)
                    else:
                        # Regular training/seminar - always include if it has a name
                        training_entry['type'] = 'training'
                        trainings.append(training_entry)
        
        return trainings
    
    def is_valid_certification(self, cert_text):
        """Validate if text is likely a certification"""
        if not cert_text or len(cert_text) < 5:
            return False
        
        cert_lower = cert_text.lower()
        
        # Certification keywords
        cert_keywords = [
            'certified', 'certificate', 'certification', 'professional', 'associate',
            'specialist', 'expert', 'foundation', 'advanced', 'master', 'practitioner',
            'aws', 'microsoft', 'google', 'oracle', 'cisco', 'comptia', 'pmp', 'scrum',
            'agile', 'itil', 'prince2', 'azure', 'cloud', 'security', 'network'
        ]
        
        # Check for certification keywords
        has_cert_keyword = any(keyword in cert_lower for keyword in cert_keywords)
        
        # Check for certification patterns
        cert_patterns = [
            r'\([A-Z]{2,}-?\d+\)',  # Certification codes like (AZ-900)
            r'\b[A-Z]{2,}-?\d+\b',  # Certification codes like AZ-900
            r'\([A-Z]{3,}\)',       # Certification acronyms like (PMP)
        ]
        
        has_cert_pattern = any(re.search(pattern, cert_text) for pattern in cert_patterns)
        
        # Avoid common non-certification phrases
        avoid_phrases = [
            'years of experience', 'experience in', 'worked with', 'responsible for',
            'developed', 'created', 'built', 'managed', 'led', 'coordinated',
            'graduated', 'degree in', 'bachelor', 'master', 'university'
        ]
        
        has_avoid_phrase = any(phrase in cert_lower for phrase in avoid_phrases)
        
        return (has_cert_keyword or has_cert_pattern) and not has_avoid_phrase
    
    def extract_certifications_dedicated(self, text):
        """Dedicated certification extraction with comprehensive patterns"""
        certifications = []
        lines = text.split('\n')
        
        print("🏆 Starting dedicated certification extraction...")
        
        # Enhanced certification section patterns including training sections
        cert_section_patterns = [
            r'certifications?', r'certificates?', r'professional\s+certifications?',
            r'licenses?\s*&?\s*certifications?', r'credentials?', r'awards?\s*&?\s*certifications?',
            r'professional\s+development', r'continuing\s+education', r'training\s*&?\s*certifications?',
            r'licenses?\s*and\s*certifications?', r'certifications?\s*and\s*licenses?',
            # Training sections that often contain certifications
            r'training\s*and\s*seminars?', r'trainings?\s*and\s*seminars?', 
            r'seminars?\s*and\s*trainings?', r'training\s*&\s*seminars?',
            r'trainings?\s*&\s*seminars?', r'seminars?\s*&\s*trainings?',
            r'professional\s+training', r'training\s+programs?', r'training\s+courses?'
        ]
        
        # Find certification section
        in_cert_section = False
        section_end_patterns = [
            r'^(work\s+)?experience', r'^education', r'^skills', r'^projects', r'^references',
            r'^languages', r'^hobbies', r'^interests', r'^achievements', r'^training'
        ]
        
        for i, line in enumerate(lines):
            line_clean = line.strip().lower()
            original_line = line.strip()
            
            # Check if we're entering certification section
            if not in_cert_section:
                for pattern in cert_section_patterns:
                    if re.search(pattern, line_clean) and len(line_clean.split()) <= 5:
                        in_cert_section = True
                        print(f"📋 Found certification section: {original_line}")
                        break
                continue
            
            # Check if we're leaving certification section
            section_ended = False
            for pattern in section_end_patterns:
                if re.search(pattern, line_clean) and len(line_clean.split()) <= 3:
                    section_ended = True
                    break
            
            if section_ended:
                print(f"📋 Certification section ended at: {original_line}")
                break
            
            # Extract certifications from current line
            if original_line and not re.match(r'^[=\-_]{3,}$', original_line):
                # Clean the line - remove bullets and formatting
                cert_line = re.sub(r'^[•\-\*○▪►→✓\s]+', '', original_line).strip()
                cert_line = re.sub(r'^\d+[\.\)]\s*', '', cert_line)  # Remove numbering
                
                if cert_line and len(cert_line) > 5:
                    # Split multiple certifications on same line
                    potential_certs = re.split(r'[,;]\s*(?=[A-Z])', cert_line)
                    
                    for cert in potential_certs:
                        cert = cert.strip()
                        # Remove date patterns from end
                        cert = re.sub(r'\s*\(\d{4}\)$', '', cert)
                        cert = re.sub(r'\s*-?\s*\d{4}$', '', cert)
                        
                        if self.is_comprehensive_certification(cert):
                            certifications.append(cert)
                            print(f"🏆 Found certification: {cert}")
        
        # Also scan entire text for certification patterns if section method didn't find much
        if len(certifications) < 2:
            print("🔍 Scanning entire text for certification patterns...")
            additional_certs = self.scan_text_for_certifications(text)
            certifications.extend(additional_certs)
        
        # Remove duplicates while preserving order
        seen = set()
        unique_certs = []
        for cert in certifications:
            cert_lower = cert.lower()
            if cert_lower not in seen:
                seen.add(cert_lower)
                unique_certs.append(cert)
        
        print(f"✅ Total certifications found: {len(unique_certs)}")
        return unique_certs
    
    def is_comprehensive_certification(self, cert_text):
        """Comprehensive certification validation - stricter for training sections"""
        if not cert_text or len(cert_text) < 5 or len(cert_text) > 200:
            return False
        
        cert_lower = cert_text.lower()
        
        # Strict certification keywords - must indicate formal certification
        cert_keywords = [
            'certified', 'certificate', 'certification', 'professional', 'associate',
            'specialist', 'expert', 'foundation', 'advanced', 'master', 'practitioner',
            'aws', 'microsoft', 'google', 'oracle', 'cisco', 'comptia', 'pmp', 'scrum',
            'agile', 'itil', 'prince2', 'azure', 'cloud', 'security', 'network',
            'salesforce', 'hubspot', 'tableau', 'power bi',
            # License-related certifications
            'license', 'licensed', 'registered', 'accredited', 'chartered'
        ]
        
        # Check for certification keywords
        has_cert_keyword = any(keyword in cert_lower for keyword in cert_keywords)
        
        # Check for certification patterns
        cert_patterns = [
            r'\([A-Z]{2,}-?\d+\)',  # Certification codes like (AZ-900)
            r'\b[A-Z]{2,}-?\d+\b',  # Certification codes like AZ-900
            r'\([A-Z]{3,}\)',       # Certification acronyms like (PMP)
            r'\b(aws|azure|google cloud|gcp)\b',
            r'\b(pmp|csm|cissp|ceh|ccna|ccnp)\b',
            r'\b(comptia|oracle|salesforce|hubspot)\b'
        ]
        
        has_cert_pattern = any(re.search(pattern, cert_lower) for pattern in cert_patterns)
        
        # Avoid common non-certification phrases - stricter for training sections
        avoid_phrases = [
            'years of experience', 'experience in', 'worked with', 'responsible for',
            'developed', 'created', 'built', 'managed', 'led', 'coordinated',
            'graduated', 'degree in', 'bachelor', 'master', 'basic', 'introduction',
            'workshop', 'seminar', 'training', 'course', 'program'
        ]
        
        has_avoid_phrase = any(phrase in cert_lower for phrase in avoid_phrases)
        
        # Additional check: if it contains generic training words without certification keywords, exclude it
        generic_training_words = ['basic', 'introduction', 'workshop', 'seminar', 'training', 'leadership']
        has_generic_training = any(word in cert_lower for word in generic_training_words)
        
        if has_generic_training and not has_cert_keyword and not has_cert_pattern:
            return False
        
        # Special handling for training/seminar content
        is_training_cert = self.is_training_certification(cert_text)
        
        return (has_cert_keyword or has_cert_pattern or is_training_cert) and not has_avoid_phrase
    
    def is_training_certification(self, text):
        """Check if training/seminar text represents a formal certification"""
        text_lower = text.lower()
        
        # Patterns that indicate formal certifications in training sections
        formal_patterns = [
            r'certificate\s+in\s+',
            r'certified\s+',
            r'certification\s+',
            r'diploma\s+in\s+',
            r'license\s+in\s+',
            r'license$',  # Ends with license
            r'registered\s+',
            r'accredited\s+',
            r'professional\s+',
            r'advanced\s+',
            r'specialist\s+',
            r'expert\s+',
            r'master\s+class',
            r'bootcamp\s+certificate',
            r'completion\s+certificate'
        ]
        
        # Technology/professional terms that often indicate certifications
        tech_terms = [
            'aws', 'azure', 'google cloud', 'microsoft', 'oracle', 'cisco',
            'java', 'python', 'javascript', 'react', 'angular', 'node',
            'docker', 'kubernetes', 'jenkins', 'git', 'linux', 'windows',
            'project management', 'scrum', 'agile', 'itil', 'prince2',
            'data science', 'machine learning', 'artificial intelligence',
            'cybersecurity', 'network security', 'cloud computing'
        ]
        
        has_formal_pattern = any(re.search(pattern, text_lower) for pattern in formal_patterns)
        has_tech_term = any(term in text_lower for term in tech_terms)
        
        # More strict criteria for training certifications
        # Must have formal pattern AND tech term, OR be a well-known certification pattern
        well_known_certs = [
            'aws certified', 'microsoft certified', 'google certified', 'oracle certified',
            'cisco certified', 'comptia', 'pmp', 'csm', 'cissp', 'ceh', 'ccna', 'ccnp',
            'azure fundamentals', 'solutions architect', 'developer associate', 
            'scrum master', 'project management professional'
        ]
        
        is_well_known = any(cert in text_lower for cert in well_known_certs)
        
        return (has_formal_pattern and has_tech_term) or is_well_known
    
    def scan_text_for_certifications(self, text):
        """Scan entire text for certification patterns"""
        certifications = []
        
        # Known certification patterns
        cert_patterns = [
            r'AWS Certified [^,\n\.]+',
            r'Microsoft [^,\n\.]+ Certified[^,\n\.]*',
            r'Google [^,\n\.]+ Certified[^,\n\.]*',
            r'Oracle Certified [^,\n\.]+',
            r'Cisco Certified [^,\n\.]+',
            r'CompTIA [^,\n\.]+',
            r'Project Management Professional \(PMP\)',
            r'Certified Scrum Master \(CSM\)',
            r'Certified [^,\n\.]+ Professional[^,\n\.]*',
            r'[^,\n\.]+ Certification[^,\n\.]*',
            r'[^,\n\.]+ Certificate[^,\n\.]*'
        ]
        
        for pattern in cert_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                match = match.strip()
                # Clean up the match
                match = re.sub(r'\s*\(\d{4}\)$', '', match)
                match = re.sub(r'\s*-?\s*\d{4}$', '', match)
                
                if self.is_comprehensive_certification(match):
                    certifications.append(match)
                    print(f"🔍 Found certification pattern: {match}")
        
        return certifications
    
    def detect_language(self, text):
        """Detect the primary language of the resume text"""
        # Simple language detection based on common patterns
        filipino_indicators = ['tagalog', 'pilipinas', 'philippines', 'mga', 'ang', 'sa', 'ng', 'kay', 'pag', 'para', 'nang', 'kung']
        english_indicators = ['the', 'and', 'of', 'to', 'in', 'for', 'with', 'on', 'at', 'by', 'from', 'about', 'into', 'through']
        
        text_lower = text.lower()
        filipino_count = sum(1 for indicator in filipino_indicators if indicator in text_lower)
        english_count = sum(1 for indicator in english_indicators if indicator in text_lower)
        
        # Check for mixed language patterns (common in Filipino resumes)
        mixed_patterns = ['nag-', 'mag-', 'pag-', 'ka-', 'um-', 'in-', '-an', '-ng']
        mixed_count = sum(1 for pattern in mixed_patterns if pattern in text_lower)
        
        if filipino_count > 3 or mixed_count > 2:
            return 'mixed'  # Filipino-English mix (common in Philippines)
        elif english_count > filipino_count * 3 and mixed_count == 0:
            return 'english'
        elif filipino_count > english_count:
            return 'filipino'
        else:
            return 'mixed'
    
    def extract_with_semantics(self, text):
        """Extract entities using semantic similarity matching"""
        results = {
            'personal_info': {},
            'skills': [],
            'experience': [],
            'education': [],
            'confidence': 0.7  # Medium confidence for semantic matching
        }
        
        # Basic semantic extraction - can be enhanced later
        # For now, return empty results to avoid errors
        return results
    
    def extract_name_enhanced(self, text):
        """Enhanced name extraction for Filipino names with better two-column support"""
        lines = text.split('\n')
        
        # Skip common section headers that might be misidentified as names
        section_headers = ['contact', 'education', 'skills', 'experience', 'work experience', 
                          'personal information', 'objective', 'summary', 'references', 'languages']
        
        # Job title keywords to avoid
        job_keywords = ['manager', 'engineer', 'developer', 'analyst', 'director', 'coordinator',
                       'specialist', 'officer', 'assistant', 'supervisor', 'executive', 'consultant',
                       'administrator', 'technician', 'representative', 'associate', 'lead', 'marketing']
        
        print(f"Extracting name from {len(lines)} lines")
        
        # Strategy 1: Look for the name in the very first line (most common)
        first_line = lines[0].strip() if lines else ""
        if first_line and len(first_line) >= 5:
            # Check if first line looks like a name (all caps, multiple words)
            if re.match(r'^[A-Z][A-Z\s\.]{4,40}$', first_line):
                first_line_lower = first_line.lower()
                # Make sure it's not a job title or section header
                if (not any(keyword in first_line_lower for keyword in job_keywords) and 
                    first_line_lower not in section_headers):
                    words = first_line.split()
                    if len(words) >= 2 and len(words) <= 6:
                        print(f"  Found name in first line: {first_line}")
                        return first_line
            
            # Also check mixed case names in first line
            elif re.match(r'^[A-Z][a-zA-Z\s\.]{4,40}$', first_line):
                first_line_lower = first_line.lower()
                if (not any(keyword in first_line_lower for keyword in job_keywords) and 
                    first_line_lower not in section_headers):
                    words = first_line.split()
                    if len(words) >= 2 and len(words) <= 6:
                        print(f"  Found mixed case name in first line: {first_line}")
                        return first_line
        
        # Strategy 2: Look for names in first few lines, skipping job titles
        for i, line in enumerate(lines[:6]):
            line = line.strip()
            if not line or len(line) < 3:
                continue
                
            print(f"Line {i}: '{line}'")
            
            # Skip obvious section headers
            if line.lower() in section_headers:
                print(f"  Skipping section header: {line}")
                continue
            
            # Skip job titles (usually second line)
            line_lower = line.lower()
            if any(keyword in line_lower for keyword in job_keywords):
                print(f"  Skipping job title: {line}")
                continue
            
            # Check for all-caps names (common in Filipino resumes)
            if re.match(r'^[A-Z][A-Z\s\.]{4,40}$', line):
                words = line.split()
                if len(words) >= 2 and len(words) <= 6:
                    print(f"  Found all-caps name: {line}")
                    return line
            
            # Check for title case names
            if re.match(r'^[A-Z][a-zA-Z\s\.]{4,40}$', line):
                words = line.split()
                if len(words) >= 2 and len(words) <= 6:
                    print(f"  Found title case name: {line}")
                    return line
        
        # Handle two-column format - extract name from left side before CONTACT section
        contact_line_index = -1
        for i, line in enumerate(lines[:10]):
            if 'CONTACT' in line.upper():
                contact_line_index = i
                break
        
        if contact_line_index > 0:
            # Look for name in lines before CONTACT
            for i in range(contact_line_index):
                line = lines[i].strip()
                if not line or len(line) < 3:
                    continue
                    
                # Skip job titles
                line_lower = line.lower()
                if any(keyword in line_lower for keyword in job_keywords):
                    continue
                    
                # Check if it looks like a name
                if re.match(r'^[A-Z][A-Za-z\s\.]{2,40}$', line):
                    words = line.split()
                    if len(words) >= 2 and len(words) <= 6:
                        print(f"  Found name before CONTACT: {line}")
                        return line
        
        # Look for names with explicit labels
        name_patterns = [
            r'(?:Name|Full Name|Applicant|Candidate):\s*([A-Z][a-zA-Z\s\.]{2,40})',
            r'^([A-Z][A-Z\s\.]{10,40})\s*$'  # Long all-caps names
        ]
        
        for pattern in name_patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                candidate = match.group(1).strip()
                candidate_lower = candidate.lower()
                if not any(keyword in candidate_lower for keyword in job_keywords):
                    print(f"  Found labeled name: {candidate}")
                    return candidate
        
        print("  No name found")
        return ""
    
    def extract_address_enhanced(self, text):
        """Enhanced address extraction for Philippine formats"""
        lines = text.split('\n')
        
        # Look for address patterns in each line
        for line in lines:
            line = line.strip()
            if len(line) < 5:
                continue
            
            # Philippine address patterns
            address_patterns = [
                # Street number + street name + city
                r'\d+\s+[A-Za-z\s]+(?:Street|St\.?|Avenue|Ave\.?|Road|Rd\.?|Drive|Dr\.?)[,\s]*[A-Za-z\s]*',
                # Barangay patterns
                r'(?:Brgy\.?|Barangay)\s+[A-Za-z\s]+[,\s]*[A-Za-z\s]*',
                # City patterns
                r'[A-Za-z\s]+(?:City|Municipality)[,\s]*[A-Za-z\s]*',
                # Metro Manila cities
                r'(?:Quezon\s+City|Manila|Makati|Taguig|Pasig|Mandaluyong|San\s+Juan|Marikina|Pasay|Parañaque|Las\s+Piñas|Muntinlupa|Caloocan|Malabon|Navotas|Valenzuela)',
                # General address with comma separators
                r'[A-Za-z0-9\s]+,\s*[A-Za-z\s]+,\s*[A-Za-z\s]*(?:Philippines)?',
                # Address with postal code
                r'[A-Za-z0-9\s,]+\s+\d{4}(?:\s+Philippines)?'
            ]
            
            for pattern in address_patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    address = match.group(0).strip()
                    # Filter out obvious non-addresses
                    if not any(word in address.lower() for word in ['email', 'phone', 'tel', 'mobile', 'contact']):
                        return address
        
        return ""
    
    def extract_phone_enhanced(self, text):
        """Enhanced phone number extraction for Philippine formats"""
        # Philippine phone patterns
        phone_patterns = [
            r'\+63\s*\d{3}\s*\d{3}\s*\d{4}',  # +63 format
            r'09\d{2}\s*\d{3}\s*\d{4}',       # 09xx format
            r'\(?\d{3}\)?\s*\d{3}[-\s]?\d{4}', # General format
            r'63\d{10}',                       # 63 prefix
        ]
        
        for pattern in phone_patterns:
            match = re.search(pattern, text)
            if match:
                return match.group(0).strip()
        
        return ""
    
    def extract_skills_advanced(self, text):
        """Enhanced deterministic skills extraction with consistent results"""
        skills = set()
        
        print(f"Starting enhanced skills extraction from text length: {len(text)}")
        
        # Strategy 1: Find dedicated SKILLS section with improved parsing
        skills_section_content = self.find_skills_section(text)
        if skills_section_content:
            print(f"Found skills section content: {skills_section_content[:200]}...")
            section_skills = self.parse_skills_from_section(skills_section_content)
            skills.update(section_skills)
            print(f"Extracted {len(section_skills)} skills from dedicated section")
        
        # Strategy 2: Extract from technology/tools lines
        tech_skills = self.extract_technology_mentions(text)
        skills.update(tech_skills)
        print(f"Extracted {len(tech_skills)} skills from technology mentions")
        
        # Strategy 3: Extract validated skills from experience context
        experience_skills = self.extract_validated_experience_skills(text)
        skills.update(experience_skills)
        print(f"Extracted {len(experience_skills)} skills from experience context")
        
        # Final validation and normalization
        final_skills = self.normalize_and_validate_skills(list(skills))
        
        print(f"Final skills count after validation: {len(final_skills)}")
        return sorted(final_skills)  # Sort for consistent ordering
    
    def find_skills_section(self, text):
        """Find and extract the dedicated SKILLS section content with improved detection"""
        lines = text.split('\n')
        skills_content = []
        in_skills_section = False
        
        for i, line in enumerate(lines):
            line_stripped = line.strip()
            line_upper = line_stripped.upper()
            
            # Enhanced skills section header detection
            skills_headers = [
                'SKILLS', 'TECHNICAL SKILLS', 'CORE COMPETENCIES', 'COMPETENCIES',
                'EXPERTISE', 'PROFICIENCIES', 'PROGRAMMING LANGUAGES', 'TECHNOLOGIES'
            ]
            
            # Check for skills section header (exact match or starts with)
            is_skills_header = False
            for header in skills_headers:
                if (line_upper == header or 
                    line_upper.startswith(header + ':') or
                    line_upper.startswith(header + ' ') or
                    (header in line_upper and len(line_stripped) <= 30 and ':' in line_stripped)):
                    is_skills_header = True
                    break
            
            if is_skills_header:
                in_skills_section = True
                print(f"Found skills section header at line {i}: {line_stripped}")
                continue
            
            # Check for section end with more comprehensive headers
            elif in_skills_section and line_stripped:
                section_headers = [
                    'EXPERIENCE', 'WORK EXPERIENCE', 'PROFESSIONAL EXPERIENCE', 'EMPLOYMENT', 
                    'EDUCATION', 'EDUCATIONAL BACKGROUND', 'ACADEMIC BACKGROUND',
                    'CERTIFICATIONS', 'PROJECTS', 'REFERENCES', 'LANGUAGES', 'AWARDS',
                    'ACHIEVEMENTS', 'OBJECTIVE', 'SUMMARY', 'PROFILE'
                ]
                
                # Check if this line starts a new section
                is_new_section = False
                for header in section_headers:
                    if (line_upper.startswith(header) or 
                        (header in line_upper and len(line_stripped) <= 40)):
                        is_new_section = True
                        break
                
                if is_new_section:
                    print(f"Skills section ended at line {i}: {line_stripped}")
                    break
            
            # Collect skills content
            if in_skills_section and line_stripped:
                # Handle two-column format by extracting left side only
                if '    ' in line and len(line.split('    ')) >= 2:
                    left_content = line.split('    ')[0].strip()
                    if left_content:
                        skills_content.append(left_content)
                else:
                    skills_content.append(line_stripped)
        
        result = '\n'.join(skills_content) if skills_content else None
        if result:
            print(f"Extracted skills section content ({len(skills_content)} lines): {result[:100]}...")
        return result
    
    def parse_skills_from_section(self, section_text):
        """Parse skills from the dedicated skills section with improved formatting handling"""
        skills = set()
        
        print(f"Parsing skills from section: {section_text[:200]}...")
        
        # Handle colon-separated format (e.g., "Programming Languages: JavaScript, Python")
        colon_pattern = r'([A-Za-z\s]+):\s*([A-Za-z0-9+#.,\-\s&/\n]+?)(?=\n[A-Za-z\s]*:|$)'
        colon_matches = re.findall(colon_pattern, section_text, re.MULTILINE | re.DOTALL)
        
        for category, skill_list in colon_matches:
            print(f"Found category '{category.strip()}' with skills: {skill_list.strip()}")
            # Clean up the skill list and parse
            clean_skill_list = skill_list.replace('\n', ' ').strip()
            
            if ',' in clean_skill_list:
                skill_items = [s.strip() for s in clean_skill_list.split(',')]
                for item in skill_items:
                    clean_skill = self.clean_skill_text(item)
                    if clean_skill and self.is_valid_technical_skill(clean_skill):
                        skills.add(clean_skill)
                        print(f"Added skill from category: {clean_skill}")
            else:
                # Single skill or space-separated
                words = clean_skill_list.split()
                for word in words:
                    clean_skill = self.clean_skill_text(word)
                    if clean_skill and self.is_valid_technical_skill(clean_skill):
                        skills.add(clean_skill)
                        print(f"Added skill from category: {clean_skill}")
        
        # Remove colon-separated content for other parsing
        remaining_text = re.sub(colon_pattern, '', section_text, flags=re.MULTILINE | re.DOTALL)
        
        # Strategy 1: Bullet point skills
        bullet_pattern = r'[•\-\*]\s*([^\n•\-\*]+)'
        bullet_matches = re.findall(bullet_pattern, remaining_text)
        
        for match in bullet_matches:
            # Handle multiple skills in one bullet point
            if ',' in match:
                sub_skills = [s.strip() for s in match.split(',')]
                for sub_skill in sub_skills:
                    clean_skill = self.clean_skill_text(sub_skill)
                    if clean_skill and self.is_valid_technical_skill(clean_skill):
                        skills.add(clean_skill)
                        print(f"Added bullet skill: {clean_skill}")
            else:
                clean_skill = self.clean_skill_text(match)
                if clean_skill and self.is_valid_technical_skill(clean_skill):
                    skills.add(clean_skill)
                    print(f"Added bullet skill: {clean_skill}")
        
        # Strategy 2: Comma-separated skills (if no bullets found)
        if not bullet_matches and ',' in remaining_text:
            comma_skills = [s.strip() for s in remaining_text.replace('\n', ' ').split(',')]
            for skill in comma_skills:
                clean_skill = self.clean_skill_text(skill)
                if clean_skill and self.is_valid_technical_skill(clean_skill):
                    skills.add(clean_skill)
                    print(f"Added comma skill: {clean_skill}")
        
        # Strategy 3: Line-by-line skills (if no bullets or commas)
        elif not bullet_matches and ',' not in remaining_text:
            lines = remaining_text.split('\n')
            for line in lines:
                line = line.strip()
                if line and not ':' in line:  # Skip category headers
                    clean_skill = self.clean_skill_text(line)
                    if clean_skill and self.is_valid_technical_skill(clean_skill):
                        skills.add(clean_skill)
                        print(f"Added line skill: {clean_skill}")
        
        print(f"Total skills parsed from section: {len(skills)}")
        return skills
    
    def clean_skill_text(self, text):
        """Clean and normalize skill text"""
        if not text:
            return None
        
        # Remove bullet points and extra whitespace
        clean_text = re.sub(r'^[•\-\*\s]+', '', text).strip()
        clean_text = re.sub(r'[•\-\*\s]+$', '', clean_text).strip()
        
        # Remove parentheses and content
        clean_text = re.sub(r'\([^)]*\)', '', clean_text).strip()
        
        # Remove proficiency levels
        proficiency_words = ['beginner', 'intermediate', 'advanced', 'expert', 'basic', 'proficient']
        for word in proficiency_words:
            clean_text = re.sub(rf'\b{word}\b', '', clean_text, flags=re.IGNORECASE).strip()
        
        # Normalize common variations
        normalizations = {
            'javascript': 'JavaScript',
            'typescript': 'TypeScript',
            'nodejs': 'Node.js',
            'reactjs': 'React.js',
            'vuejs': 'Vue.js',
            'angularjs': 'Angular.js',
            'html5': 'HTML5',
            'css3': 'CSS3',
            'c++': 'C++',
            'c#': 'C#',
            'mysql': 'MySQL',
            'postgresql': 'PostgreSQL',
            'mongodb': 'MongoDB'
        }
        
        clean_lower = clean_text.lower()
        for original, normalized in normalizations.items():
            if clean_lower == original:
                return normalized
        
        return clean_text if len(clean_text) >= 2 else None
    
    def is_valid_technical_skill(self, skill):
        """Enhanced validation for technical skills with comprehensive checks"""
        if not skill or len(skill) < 2 or len(skill) > 40:
            return False
        
        # Skip addresses that might be misclassified as skills
        if self.is_likely_address(skill):
            return False
        
        skill_lower = skill.lower().strip()
        
        # Exclude common non-technical words and languages
        excluded_words = {
            # Common words
            'to', 'and', 'or', 'the', 'of', 'in', 'on', 'at', 'for', 'with', 'by', 'from',
            'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
            'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'a', 'an',
            
            # Languages (not programming languages)
            'english', 'filipino', 'tagalog', 'cebuano', 'ilocano', 'bisaya', 'hiligaynon',
            'spanish', 'mandarin', 'chinese', 'japanese', 'korean', 'french', 'german',
            
            # Common resume words
            'core', 'basic', 'advanced', 'intermediate', 'beginner', 'expert', 'proficient',
            'technology', 'skill', 'skills', 'competency', 'competencies', 'expertise',
            'experience', 'work', 'job', 'career', 'professional', 'personal',
            
            # Location words
            'ave', 'avenue', 'street', 'road', 'city', 'province', 'manila', 'quezon',
            'makati', 'taguig', 'pasig', 'cebu', 'davao', 'brgy', 'barangay',
            
            # Time words
            'year', 'years', 'month', 'months', 'day', 'days', 'week', 'weeks',
            
            # Education words
            'degree', 'bachelor', 'master', 'phd', 'university', 'college', 'school'
        }
        
        # Additional pattern-based exclusions
        if re.match(r'^[a-z]{1,2}$', skill_lower):  # Single/double letters like 'to', 'in'
            return False
        
        if skill.endswith(' -') or skill.startswith('- '):  # Incomplete fragments
            return False
        
        if re.search(r'\b(technology|skill|competenc)\s*-?$', skill_lower):  # Ends with these words
            return False
        
        if skill_lower in excluded_words:
            return False
        
        # Skip obvious non-skills with regex patterns
        invalid_patterns = [
            r'\b(?:experience|worked|developed|managed|led|created|implemented|designed|maintained|responsible|duties)\b',
            r'\b(?:training|course|program)\b',
            r'\b(?:years?|months?|days?)\s+(?:of|in)\b',
            r'\b(?:the|and|or|with|for|in|on|at|to|from|of)\s+\b(?:the|and|or|with|for|in|on|at|to|from|of)\b'
        ]
        
        for pattern in invalid_patterns:
            if re.search(pattern, skill_lower):
                return False
        
        # Enhanced technical skills database with more comprehensive coverage
        known_skills = {
            # Programming Languages
            'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift',
            'kotlin', 'typescript', 'scala', 'r', 'matlab', 'perl', 'dart', 'lua', 'haskell',
            'objective-c', 'assembly', 'cobol', 'fortran', 'pascal', 'vb.net', 'f#',
            
            # Web Technologies
            'html', 'html5', 'css', 'css3', 'sass', 'scss', 'less', 'bootstrap', 'tailwind',
            'react', 'react.js', 'angular', 'vue', 'vue.js', 'svelte', 'jquery', 'ember',
            'next.js', 'nuxt.js', 'gatsby', 'webpack', 'vite', 'parcel', 'rollup',
            
            # Backend Frameworks
            'node.js', 'express', 'express.js', 'django', 'flask', 'laravel', 'spring', 'spring boot',
            'asp.net', 'rails', 'fastapi', 'nestjs', 'koa', 'hapi', 'meteor', 'codeigniter',
            'symfony', 'gin', 'echo', 'fiber',
            
            # Databases
            'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'oracle', 'sql server',
            'cassandra', 'elasticsearch', 'dynamodb', 'firebase', 'couchdb', 'neo4j',
            'mariadb', 'influxdb', 'clickhouse',
            
            # Cloud & DevOps
            'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'jenkins', 'git', 
            'github', 'gitlab', 'bitbucket', 'terraform', 'ansible', 'vagrant', 'chef',
            'puppet', 'prometheus', 'grafana', 'elk stack', 'circleci', 'travis ci',
            
            # Mobile Development
            'android', 'ios', 'react native', 'flutter', 'xamarin', 'ionic', 'cordova',
            'phonegap', 'unity', 'unreal engine',
            
            # Data Science & AI
            'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn',
            'pandas', 'numpy', 'matplotlib', 'seaborn', 'jupyter', 'tableau', 'power bi',
            'apache spark', 'hadoop', 'kafka', 'airflow',
            
            # Testing & Quality
            'jest', 'cypress', 'selenium', 'postman', 'junit', 'pytest', 'mocha', 'chai',
            'jasmine', 'karma', 'protractor',
            
            # Other Technologies
            'graphql', 'rest', 'api', 'json', 'xml', 'soap', 'microservices', 'agile', 'scrum',
            'devops', 'ci/cd', 'tdd', 'bdd', 'linux', 'windows', 'macos', 'bash', 'powershell',
            'vim', 'emacs', 'vscode', 'intellij', 'eclipse'
        }
        
        # Check if it's a known skill
        if skill_lower in known_skills:
            return True
        
        # Check skill patterns
        valid_patterns = [
            r'^[A-Za-z]+(?:\.[a-z]+)?$',  # JavaScript, React.js
            r'^[A-Za-z]+\s+[A-Za-z]+$',  # Project Management
            r'^[A-Za-z]+\+\+?$',         # C++
            r'^[A-Za-z]+\s*[0-9]+$',     # HTML5, CSS3
            r'^[A-Za-z]+\.[A-Za-z]+$'   # Node.js, Vue.js
        ]
        
        if any(re.match(pattern, skill) for pattern in valid_patterns):
            return True
        
        # Final check: reasonable skill name (2-3 words max, no common words)
        words = skill.split()
        if len(words) <= 3 and all(len(word) >= 2 for word in words):
            common_words = {'the', 'and', 'or', 'with', 'for', 'in', 'on', 'at', 'to', 'from', 'of'}
            if not any(word.lower() in common_words for word in words):
                return True
        
        return False
    
    def extract_technology_mentions(self, text):
        """Extract technology mentions from various contexts"""
        skills = set()
        
        # Technology line patterns
        tech_patterns = [
            r'(?:Technologies?\s+used|Tools?|Tech\s+stack|Stack|Platform|Languages?)\s*:?\s*([A-Za-z0-9+#.,\-\s&/]+)',
            r'(?:Built\s+with|Using|Developed\s+in)\s*:?\s*([A-Za-z0-9+#.,\-\s&/]+)'
        ]
        
        for pattern in tech_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                tech_text = match.group(1).strip()
                # Parse comma-separated technologies
                if ',' in tech_text:
                    tech_items = [item.strip() for item in tech_text.split(',')]
                    for item in tech_items:
                        clean_skill = self.clean_skill_text(item)
                        if clean_skill and self.is_valid_technical_skill(clean_skill):
                            skills.add(clean_skill)
        
        return skills
    
    def extract_validated_experience_skills(self, text):
        """Extract validated technical skills from experience context"""
        skills = set()
        
        # High-confidence skill extraction patterns
        skill_patterns = [
            r'\b(JavaScript|Python|Java|React|Angular|Vue|Node\.js|PHP|C\+\+|C#)\b',
            r'\b(HTML5?|CSS3?|MySQL|PostgreSQL|MongoDB|Git|Docker|AWS|Azure)\b'
        ]
        
        for pattern in skill_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                skill = match.group(1)
                normalized_skill = self.clean_skill_text(skill)
                if normalized_skill:
                    skills.add(normalized_skill)
        
        return skills
    
    def normalize_and_validate_skills(self, skills_list):
        """Final normalization and validation of skills"""
        normalized_skills = set()
        
        for skill in skills_list:
            clean_skill = self.clean_skill_text(skill)
            if clean_skill and self.is_valid_technical_skill(clean_skill):
                normalized_skills.add(clean_skill)
        
        # Remove duplicates and variations
        final_skills = set()
        for skill in normalized_skills:
            # Check for existing similar skills to avoid duplicates
            is_duplicate = False
            for existing_skill in final_skills:
                if (skill.lower() == existing_skill.lower() or 
                    skill.lower().replace('.', '') == existing_skill.lower().replace('.', '')):
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                final_skills.add(skill)
        
        return list(final_skills)
    
    def is_valid_skill(self, skill):
        """Legacy skill validation - redirects to enhanced validation"""
        return self.is_valid_technical_skill(skill)
    
    def validate_and_filter_skills(self, skills):
        """Final validation and filtering of extracted skills"""
        validated = []
        
        for skill in skills:
            skill = skill.strip()
            if self.is_valid_skill(skill):
                # Normalize common variations
                skill = self.normalize_skill_name(skill)
                if skill not in validated:
                    validated.append(skill)
        
        return validated
    
    def normalize_skill_name(self, skill):
        """Normalize skill names to standard formats"""
        normalizations = {
            'javascript': 'JavaScript',
            'nodejs': 'Node.js',
            'node.js': 'Node.js',
            'reactjs': 'React',
            'react.js': 'React',
            'vuejs': 'Vue.js',
            'vue.js': 'Vue.js',
            'angularjs': 'Angular',
            'html5': 'HTML5',
            'css3': 'CSS3',
            'mysql': 'MySQL',
            'postgresql': 'PostgreSQL',
            'mongodb': 'MongoDB',
        }
        
        lower_skill = skill.lower()
        return normalizations.get(lower_skill, skill)
    
    def post_process_classifications(self, results):
        """Post-process to fix misclassifications between skills and experience"""
        skills = set(results.get('skills', []))
        experience = results.get('experience', [])
        cleaned_experience = []
        
        # Known technical skills that should not appear in experience descriptions
        technical_skills = {
            'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
            'React', 'React.js', 'Angular', 'Vue', 'Vue.js', 'Node.js', 'Express', 'Express.js',
            'Django', 'Flask', 'Laravel', 'HTML', 'HTML5', 'CSS', 'CSS3', 'Bootstrap', 
            'Tailwind', 'SASS', 'SCSS', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 
            'SQLite', 'Oracle', 'Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 
            'Jenkins', 'TypeScript', 'GraphQL', 'REST', 'API', 'JSON', 'XML', 'Jest',
            'Cypress', 'Postman', 'Jira'
        }
        
        # Clean and normalize existing skills
        normalized_skills = set()
        for skill in skills:
            if skill and isinstance(skill, str):
                cleaned_skill = skill.strip()
                if len(cleaned_skill) > 1 and not self._is_common_word(cleaned_skill):
                    normalized_skills.add(cleaned_skill)
        
        skills = normalized_skills
        
        for exp in experience:
            if isinstance(exp, dict):
                # Clean experience descriptions
                description = exp.get('description', '')
                position = exp.get('position', '')
                
                # Extract technical skills from experience descriptions
                found_skills = []
                for tech_skill in technical_skills:
                    if tech_skill.lower() in description.lower():
                        found_skills.append(tech_skill)
                        skills.add(tech_skill)
                
                # Remove technical skills from description
                cleaned_description = description
                for skill in found_skills:
                    cleaned_description = re.sub(rf'\b{re.escape(skill)}\b', '', cleaned_description, flags=re.IGNORECASE)
                
                # Clean up extra spaces and punctuation
                cleaned_description = re.sub(r'\s+', ' ', cleaned_description).strip()
                cleaned_description = re.sub(r'^[,\-\s]+|[,\-\s]+$', '', cleaned_description)
                
                # Only keep experience if it has meaningful content after cleaning
                if cleaned_description and len(cleaned_description) > 10:
                    exp['description'] = cleaned_description
                    cleaned_experience.append(exp)
                elif position:  # Keep if has position even without description
                    exp['description'] = ''
                    cleaned_experience.append(exp)
            else:
                # Handle string format experience
                exp_str = str(exp)
                found_skills = []
                
                for tech_skill in technical_skills:
                    if tech_skill.lower() in exp_str.lower():
                        found_skills.append(tech_skill)
                        skills.add(tech_skill)
                
                # Remove technical skills from experience string
                cleaned_exp = exp_str
                for skill in found_skills:
                    cleaned_exp = re.sub(rf'\b{re.escape(skill)}\b', '', cleaned_exp, flags=re.IGNORECASE)
                
                cleaned_exp = re.sub(r'\s+', ' ', cleaned_exp).strip()
                cleaned_exp = re.sub(r'^[,\-\s]+|[,\-\s]+$', '', cleaned_exp)
                
                # Only keep if meaningful content remains
                if cleaned_exp and len(cleaned_exp) > 10:
                    cleaned_experience.append(cleaned_exp)
        
        # Update results with cleaned data
        original_skills_count = len(results.get('skills', []))
        results['skills'] = sorted(list(skills))  # Sort for consistency
        results['experience'] = cleaned_experience
        
        moved_skills = len(skills) - original_skills_count
        print(f"Post-processing: Moved {moved_skills} technical terms from experience to skills")
        print(f"Final skills count: {len(skills)}, Final experience count: {len(cleaned_experience)}")
        
        return results
    
    def _is_common_word(self, word):
        """Check if word is a common word that shouldn't be a skill"""
        common_words = {
            'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
            'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above',
            'below', 'between', 'among', 'within', 'without', 'against', 'upon', 'across',
            'development', 'using', 'work', 'experience', 'team', 'project', 'management',
            'company', 'position', 'role', 'job', 'tasks', 'responsibilities', 'duties'
        }
        return word.lower() in common_words
    
    def parse_experience_line_by_line(self, text):
        """Parse experience section line by line"""
        experiences = []
        
        # Look for company-position-date patterns anywhere in text
        patterns = [
            # Pattern: Position at Company (Date)
            r'([A-Z][a-zA-Z\s]+(?:Developer|Engineer|Manager|Analyst|Specialist|Officer|Assistant|Coordinator|Lead|Director|Supervisor|Executive|Consultant|Administrator|Technician|Representative|Associate))\s+(?:at|@)\s+([A-Z][a-zA-Z\s&.,]+)\s*(?:\(([^)]+)\)|\s+([0-9]{4}[^a-z]*(?:Present|Current|[0-9]{4})))',
            # Pattern: Company - Position (Date)
            r'([A-Z][a-zA-Z\s&.,]+(?:Inc|Corp|Company|Ltd|LLC|Corporation|Solutions|Technologies|Systems|Services|Group))\s*[\-–]\s*([A-Z][a-zA-Z\s]+)\s*(?:\(([^)]+)\)|\s+([0-9]{4}[^a-z]*(?:Present|Current|[0-9]{4})))'
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                groups = match.groups()
                if len(groups) >= 2:
                    duration = groups[2] or groups[3] if len(groups) > 2 else ''
                    experiences.append({
                        'position': groups[0].strip() if 'at' in match.group(0) else groups[1].strip(),
                        'company': groups[1].strip() if 'at' in match.group(0) else groups[0].strip(),
                        'duration': duration.strip(),
                        'description': '',
                        'location': ''
                    })
        
        return experiences
    
    def is_job_title_enhanced(self, text):
        """Enhanced check if text looks like a job title"""
        job_keywords = [
            'developer', 'engineer', 'manager', 'analyst', 'specialist', 'officer',
            'assistant', 'coordinator', 'lead', 'director', 'supervisor', 'executive',
            'consultant', 'administrator', 'technician', 'representative', 'associate',
            'agent', 'operator', 'clerk', 'staff', 'team leader', 'head', 'vice president',
            'president', 'ceo', 'cto', 'cio', 'vp', 'avp', 'senior', 'junior', 'principal',
            'chief', 'architect', 'designer', 'programmer', 'tester', 'qa', 'quality assurance',
            'business analyst', 'project manager', 'product manager', 'scrum master',
            'devops', 'data scientist', 'data analyst', 'marketing', 'sales', 'hr',
            'human resources', 'finance', 'accounting', 'legal', 'compliance'
        ]
        
        text_lower = text.lower()
        
        # Check for job keywords
        has_job_keyword = any(keyword in text_lower for keyword in job_keywords)
        
        # Additional validation
        is_reasonable_length = 2 <= len(text.split()) <= 8
        not_a_date = not re.search(r'\d{4}', text)
        not_company_suffix = not any(suffix in text_lower for suffix in ['inc', 'corp', 'ltd', 'llc', 'company'])
        starts_with_capital = text[0].isupper() if text else False
        
        return has_job_keyword and is_reasonable_length and not_a_date and not_company_suffix and starts_with_capital
    
    def is_company_name_enhanced(self, text):
        """Enhanced check if text looks like a company name"""
        company_suffixes = [
            'inc', 'corp', 'company', 'ltd', 'llc', 'corporation', 'solutions', 'technologies',
            'systems', 'services', 'group', 'enterprises', 'holdings', 'international',
            'global', 'worldwide', 'consulting', 'consultancy', 'partners', 'associates',
            'foundation', 'institute', 'center', 'centre', 'agency', 'bureau', 'office',
            'department', 'division', 'unit', 'team', 'co', 'ltd', 'pte', 'pvt', 'limited'
        ]
        
        company_keywords = [
            'bank', 'hospital', 'university', 'college', 'school', 'hotel', 'resort',
            'restaurant', 'mall', 'store', 'shop', 'market', 'factory', 'plant',
            'manufacturing', 'construction', 'development', 'real estate', 'insurance',
            'telecommunications', 'telecom', 'media', 'broadcasting', 'publishing',
            'logistics', 'shipping', 'transport', 'airline', 'aviation', 'automotive'
        ]
        
        text_lower = text.lower()
        
        # Check for company suffixes
        has_company_suffix = any(suffix in text_lower for suffix in company_suffixes)
        
        # Check for company keywords
        has_company_keyword = any(keyword in text_lower for keyword in company_keywords)
        
        # Check if it's all uppercase (common for company names)
        is_uppercase = text.isupper() and len(text) > 2
        
        # Check for Filipino company patterns
        filipino_company_patterns = [
            r'\b[A-Z][a-zA-Z\s&]+(?:Philippines?|Pilipinas)\b',
            r'\b[A-Z][a-zA-Z\s&]+(?:Manila|Cebu|Davao|Makati|BGC|Ortigas)\b'
        ]
        has_filipino_pattern = any(re.search(pattern, text) for pattern in filipino_company_patterns)
        
        # Additional validation
        is_reasonable_length = 1 <= len(text.split()) <= 8
        starts_with_capital = text[0].isupper() if text else False
        not_job_title = not self.is_job_title_enhanced(text)
        
        return (has_company_suffix or has_company_keyword or is_uppercase or has_filipino_pattern) and is_reasonable_length and starts_with_capital and not_job_title
    
    def is_date_range_enhanced(self, text):
        """Enhanced check if text contains a date range"""
        date_patterns = [
            r'\d{4}\s*[-–]\s*\d{4}',
            r'\d{4}\s*[-–]\s*(?:present|current|now)',
            r'(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}',
            r'(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\.?\s+\d{4}',
            r'\d{1,2}/\d{4}\s*[-–]\s*(?:\d{1,2}/\d{4}|present|current)',
            r'\d{1,2}/\d{2}/\d{4}\s*[-–]\s*(?:\d{1,2}/\d{2}/\d{4}|present|current)',
            r'\b\d{4}\s*to\s*(?:\d{4}|present|current)\b',
            r'\b(?:from\s+)?\d{4}\s*[-–]\s*(?:\d{4}|present|current)\b',
            r'\b(?:since\s+)?\d{4}\s*[-–]\s*present\b'
        ]
        return any(re.search(pattern, text.lower()) for pattern in date_patterns)
    
    def is_location(self, text):
        """Check if text looks like a location"""
        location_indicators = [
            'city', 'province', 'philippines', 'manila', 'cebu', 'davao', 'makati',
            'bgc', 'ortigas', 'quezon city', 'taguig', 'pasig', 'mandaluyong'
        ]
        
        text_lower = text.lower()
        has_location_indicator = any(indicator in text_lower for indicator in location_indicators)
        is_reasonable_length = 1 <= len(text.split()) <= 6
        
        return has_location_indicator and is_reasonable_length
    
    def normalize_date_range(self, date_text):
        """Normalize date range format"""
        try:
            # Try to parse with dateparser
            if '–' in date_text or '-' in date_text:
                parts = re.split(r'[-–]', date_text)
                if len(parts) == 2:
                    start_date = dateparser.parse(parts[0].strip())
                    end_part = parts[1].strip().lower()
                    
                    if end_part in ['present', 'current']:
                        return f"{start_date.strftime('%Y-%m') if start_date else parts[0].strip()} - Present"
                    else:
                        end_date = dateparser.parse(end_part)
                        if start_date and end_date:
                            return f"{start_date.strftime('%Y-%m')} - {end_date.strftime('%Y-%m')}"
            
            return date_text
        except:
            return date_text
    
    def extract_education_advanced(self, text):
        """Enhanced education extraction with flexible patterns and better section detection"""
        education = []
        print(f"Starting education extraction from text length: {len(text)}")
        
        # Strategy 1: Enhanced education section detection
        lines = text.split('\n')
        in_education_section = False
        education_content = []
        
        for i, line in enumerate(lines):
            line_stripped = line.strip()
            line_upper = line_stripped.upper()
            
            # Enhanced education header detection
            education_headers = ['EDUCATION', 'EDUCATIONAL BACKGROUND', 'ACADEMIC BACKGROUND', 
                               'EDUCATIONAL ATTAINMENT', 'ACADEMIC QUALIFICATIONS', 'SCHOOLING']
            
            if any(header in line_upper for header in education_headers):
                in_education_section = True
                print(f"Found education section at line {i}: {line}")
                continue
            elif in_education_section:
                # Check if we've moved to another major section
                section_headers = ['SKILLS', 'EXPERIENCE', 'WORK EXPERIENCE', 'EMPLOYMENT', 
                                 'LANGUAGES', 'REFERENCES', 'CERTIFICATIONS', 'PROJECTS']
                if line_stripped and any(line_upper.startswith(header) for header in section_headers):
                    print(f"Education section ended at line {i}: {line}")
                    break
                
                # Process education lines with better filtering
                if line_stripped and not self.is_contact_info(line_stripped):
                    # Handle two-column format - extract appropriate side for education
                    if '    ' in line:  # Multiple spaces indicate columns
                        parts = line.split('    ')
                        # Choose the part that looks more like education
                        for part in parts:
                            part = part.strip()
                            if part and self.looks_like_education(part):
                                education_content.append(part)
                                print(f"  Added education content: {part}")
                                break
                    elif self.looks_like_education(line_stripped):
                        education_content.append(line_stripped)
                        print(f"  Added education line: {line_stripped}")
        
        # Strategy 2: Process collected education content
        if education_content:
            edu_text = '\n'.join(education_content)
            print(f"Processing education content: {edu_text[:200]}...")
            education = self.parse_education_entries(edu_text)
            print(f"Parsed {len(education)} education entries from section")
        
        # Strategy 3: Enhanced fallback patterns if no section found
        if not education:
            print("No education section found, trying enhanced fallback patterns...")
            
            # More comprehensive degree patterns
            degree_patterns = [
                # Standard format: Degree at/from Institution
                r'(Bachelor|Master|PhD|Doctorate|Associate|Diploma|Certificate|BS|BA|MS|MA|BSBA|BSA|BSN|BSIT|BSCS)\s+(?:of\s+|in\s+)?([A-Za-z\s]+?)\s*(?:from|at)\s+([A-Za-z\s,&.]+(?:University|College|Institute|School|Academy|Polytechnic))',
                # Institution - Degree format
                r'([A-Za-z\s,&.]+(?:University|College|Institute|School|Academy|Polytechnic))\s*[\-–|]\s*(Bachelor|Master|PhD|Doctorate|Associate|Diploma|Certificate|BS|BA|MS|MA|BSBA|BSA|BSN|BSIT|BSCS)(?:\s+(?:of\s+|in\s+)?([A-Za-z\s]+))?',
                # Pipe separated format: Degree | Institution
                r'(Bachelor|Master|PhD|BS|BA|MS|MA|BSBA|BSA|BSN|BSIT|BSCS)\s*([A-Za-z\s]+?)\s*\|\s*([A-Za-z\s,&.]+(?:University|College|Institute|School|Academy))',
                # Simple degree with field
                r'(BSBA|BS|BA|MS|MA|BSN|BSIT|BSCS)\s+(Marketing|Computer\s+Science|Information\s+Technology|Business|Management|Nursing|Engineering|Education)(?:\s+Management)?'
            ]
            
            for i, pattern in enumerate(degree_patterns):
                print(f"Trying enhanced degree pattern {i+1}...")
                matches = re.finditer(pattern, text, re.IGNORECASE)
                for match in matches:
                    print(f"Found degree match: {match.group(0)}")
                    groups = match.groups()
                    
                    if len(groups) >= 2:
                        if i == 0:  # Degree at Institution
                            degree = f"{groups[0]} {groups[1]}".strip()
                            institution = groups[2] if len(groups) > 2 else ''
                        elif i == 1:  # Institution - Degree
                            institution = groups[0]
                            degree = groups[1]
                            if len(groups) > 2 and groups[2]:
                                degree += f" {groups[2]}"
                        elif i == 2:  # Pipe format
                            degree = f"{groups[0]} {groups[1]}".strip()
                            institution = groups[2]
                        else:  # Simple format
                            degree = f"{groups[0]} {groups[1]}".strip()
                            institution = ''
                        
                        # Extract year if present in the match
                        year_match = re.search(r'\b(19|20)\d{2}\b', match.group(0))
                        year = year_match.group() if year_match else ''
                        
                        education.append({
                            'degree': degree.strip(),
                            'institution': institution.strip(),
                            'year': year,
                            'field': ''
                        })
            
            print(f"Enhanced fallback patterns found {len(education)} education entries")
        
        print(f"Final education extraction result: {len(education)} entries")
        return education
    
    def is_contact_info(self, text):
        """Check if text looks like contact information (phone, email, address)"""
        contact_patterns = [
            r'\b\d{10,}\b',  # Phone numbers
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',  # Email
            r'\b(?:brgy|barangay|unit|block|street|avenue|road|city|province)\b'  # Address indicators
        ]
        return any(re.search(pattern, text, re.IGNORECASE) for pattern in contact_patterns)
    
    def looks_like_education(self, text):
        """Check if text looks like education information"""
        education_indicators = [
            r'\b(?:bachelor|master|phd|doctorate|associate|diploma|certificate|bs|ba|ms|ma|bsba|bsa|bsn|bsit|bscs)\b',
            r'\b(?:university|college|institute|school|academy|polytechnic)\b',
            r'\b(?:marketing|computer\s+science|information\s+technology|business|management|nursing|engineering|education)\b',
            r'\b(?:19|20)\d{2}\b'  # Years
        ]
        return any(re.search(pattern, text, re.IGNORECASE) for pattern in education_indicators)
    
    def extract_experience_advanced(self, text):
        """Advanced experience extraction with enhanced two-column format support"""
        experiences = []
        print(f"Starting experience extraction from text length: {len(text)}")
        
        # Strategy 1: Handle two-column format specifically for "WORK EXPERIENCE & PROJECTS"
        lines = text.split('\n')
        in_experience_section = False
        experience_content = []
        
        for line in lines:
            line_upper = line.upper()
            if any(exp_header in line_upper for exp_header in ['WORK EXPERIENCE', 'EXPERIENCE', 'PROFESSIONAL EXPERIENCE']):
                in_experience_section = True
                print(f"Found experience section start: {line}")
                continue
            elif in_experience_section:
                # Check if we've moved to another section
                if line.strip() and any(section in line_upper for section in ['LANGUAGES', 'REFERENCE', 'SKILLS', 'EDUCATION']):
                    print(f"Experience section ended at: {line}")
                    break
                # Collect experience content
                if line.strip():
                    # Handle two-column format - extract right side for experience
                    if '    ' in line and not line.strip().startswith('•'):
                        # This might be a two-column line, extract right side
                        parts = line.split('    ')
                        if len(parts) > 1:
                            right_part = '    '.join(parts[1:]).strip()
                            if right_part:
                                experience_content.append(right_part)
                    else:
                        experience_content.append(line.strip())
        
        if experience_content:
            exp_text = '\n'.join(experience_content)
            print(f"Found two-column experience content: {exp_text[:100]}...")
            experiences = self.parse_experience_enhanced(exp_text)
            print(f"Parsed {len(experiences)} experience entries from two-column format")
        
        # Strategy 2: Traditional experience section detection
        if not experiences:
            exp_pattern = (r'(?:EXPERIENCE|WORK\s+EXPERIENCE|EMPLOYMENT\s+HISTORY|PROFESSIONAL\s+EXPERIENCE|'
                          r'WORK\s+HISTORY|CAREER\s+HISTORY|EMPLOYMENT|WORK|JOB\s+EXPERIENCE|'
                          r'PROFESSIONAL\s+HISTORY|CAREER\s+SUMMARY|WORK\s+BACKGROUND|'
                          r'EMPLOYMENT\s+BACKGROUND|PROFESSIONAL\s+BACKGROUND)\s*:?\s*\n'
                          r'([\s\S]*?)(?=\n\s*(?:EDUCATION|SKILLS|CERTIFICATIONS|REFERENCES|'
                          r'PROJECTS|QUALIFICATIONS|LANGUAGES|$))')
            match = re.search(exp_pattern, text, re.IGNORECASE | re.MULTILINE)
            
            if match:
                exp_text = match.group(1).strip()
                print(f"Found traditional experience section: {exp_text[:100]}...")
                experiences = self.parse_experience_enhanced(exp_text)
                print(f"Parsed {len(experiences)} experience entries from traditional section")
        
        # Strategy 3: Look for job title patterns anywhere in text
        if not experiences:
            print("No experience section found, trying fallback patterns...")
            job_patterns = [
                r'([A-Z][a-zA-Z\s]+(?:Developer|Engineer|Manager|Analyst|Specialist|Officer|Assistant|Coordinator|Lead|Director|Supervisor|Executive|Consultant|Administrator|Technician|Representative|Associate|Intern|Trainee|Seller))\s*(?:\n|\s{2,})([A-Z][a-zA-Z\s&.,]+)\s*(?:\||\s{2,})([A-Za-z0-9\s\-–]+(?:Present|Current|[0-9]{4}))',
                r'([A-Z][a-zA-Z\s&.,]+(?:Inc|Corp|Company|Ltd|LLC|Corporation|Solutions|Technologies|Systems|Services|Group|Club|Agency|Committee))\s*[\|]\s*([A-Z][a-zA-Z\s]+)\s*(?:\n|\s{2,})([A-Za-z0-9\s\-–]+(?:Present|Current|[0-9]{4}))'
            ]
            
            for i, pattern in enumerate(job_patterns):
                print(f"Trying job pattern {i+1}...")
                matches = re.finditer(pattern, text, re.IGNORECASE | re.MULTILINE)
                for match in matches:
                    print(f"Found job match: {match.group(0)}")
                    groups = match.groups()
                    if len(groups) >= 3:
                        experiences.append({
                            'position': groups[0].strip() if i == 0 else groups[1].strip(),
                            'company': groups[1].strip() if i == 0 else groups[0].strip(),
                            'duration': groups[2].strip(),
                            'description': '',
                            'location': ''
                        })
            
            print(f"Fallback patterns found {len(experiences)} experience entries")
        
        # Strategy 4: If still no results, try line-by-line parsing
        if not experiences:
            print("Trying line-by-line parsing...")
            experiences = self.parse_experience_line_by_line(text)
        
        print(f"Final experience extraction result: {len(experiences)} entries")
        return experiences
    
    def parse_experience_enhanced(self, exp_text):
        """Enhanced experience parsing with better pattern recognition"""
        experiences = []
        
        # Split by job entries (look for job titles followed by companies)
        job_title_keywords = [
            'Developer', 'Engineer', 'Manager', 'Analyst', 'Specialist', 'Officer', 'Assistant',
            'Coordinator', 'Lead', 'Director', 'Supervisor', 'Executive', 'Consultant',
            'Administrator', 'Technician', 'Representative', 'Associate', 'Intern', 'Trainee',
            'Agent', 'Operator', 'Clerk', 'Staff', 'Team Leader', 'Head',
            'Vice President', 'President', 'CEO', 'CTO', 'CIO', 'VP', 'AVP', 'Senior',
            'Junior', 'Principal', 'Chief', 'Architect', 'Designer', 'Programmer', 'Tester'
        ]
        
        # Split by potential job entries
        job_title_pattern = f'\\n(?=[A-Z][a-zA-Z\\s]+(?:{"||".join(job_title_keywords)}))'
        job_blocks = re.split(job_title_pattern, exp_text)
        
        for block in job_blocks:
            if not block.strip():
                continue
            
            experience = self.parse_single_experience_enhanced(block)
            if experience:
                experiences.append(experience)
        
        # If no structured blocks found, try line-by-line parsing
        if not experiences:
            experiences = self.parse_experience_line_by_line(exp_text)
        
        return experiences
    
    def parse_single_experience_enhanced(self, block):
        """Parse a single experience entry"""
        lines = [line.strip() for line in block.split('\n') if line.strip()]
        if not lines:
            return None
        
        experience = {
            'position': '',
            'company': '',
            'duration': '',
            'description': '',
            'location': ''
        }
        
        # First line is usually the job title
        if lines:
            experience['position'] = lines[0]
        
        # Look for company name (often second line or after "at")
        for i, line in enumerate(lines[1:], 1):
            # Check for company indicators
            if any(indicator in line.lower() for indicator in ['inc', 'corp', 'company', 'ltd', 'llc', 'corporation']):
                experience['company'] = line
                break
            # Check for "at Company" pattern
            if 'at ' in line.lower():
                experience['company'] = line.replace('at ', '').replace('At ', '')
                break
        
        # Look for dates
        date_pattern = r'(\d{4})\s*[-–]\s*(\d{4}|Present|Current)'
        for line in lines:
            date_match = re.search(date_pattern, line)
            if date_match:
                experience['duration'] = date_match.group(0)
                break
        
        # Collect description from remaining lines
        description_lines = []
        for line in lines[2:]:
            if not re.search(date_pattern, line) and line != experience['company']:
                description_lines.append(line)
        
        experience['description'] = ' '.join(description_lines)
        
        return experience if experience['position'] else None
    
    def parse_education_entries(self, edu_text):
        """Parse education entries with enhanced degree and institution separation"""
        education = []
        print(f"Parsing education from: {edu_text[:200]}...")
        
        # Handle various education formats
        lines = edu_text.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line or self.is_contact_info(line):
                continue
            
            print(f"Processing education line: {line}")
            
            # Strategy 1: Pipe-separated format: "BSBA Marketing Management | De La Salle Lipa"
            if '|' in line:
                parts = [part.strip() for part in line.split('|')]
                if len(parts) >= 2:
                    degree_part = parts[0]
                    institution_part = parts[1]
                    
                    # Extract year if present
                    year_match = re.search(r'\b(19|20)\d{2}\b', line)
                    year = year_match.group() if year_match else ''
                    
                    education.append({
                        'degree': degree_part,
                        'institution': institution_part,
                        'year': year,
                        'field': self.extract_field_from_degree(degree_part)
                    })
                    print(f"  Found pipe-separated: degree='{degree_part}', institution='{institution_part}'")
                    continue
            
            # Strategy 2: Dash-separated format: "University Name - Degree"
            if ' - ' in line or ' – ' in line:
                separator = ' - ' if ' - ' in line else ' – '
                parts = [part.strip() for part in line.split(separator)]
                if len(parts) >= 2:
                    # Determine which part is institution vs degree
                    if self.is_educational_institution(parts[0]):
                        institution_part = parts[0]
                        degree_part = parts[1]
                    else:
                        degree_part = parts[0]
                        institution_part = parts[1]
                    
                    year_match = re.search(r'\b(19|20)\d{2}\b', line)
                    year = year_match.group() if year_match else ''
                    
                    education.append({
                        'degree': degree_part,
                        'institution': institution_part,
                        'year': year,
                        'field': self.extract_field_from_degree(degree_part)
                    })
                    print(f"  Found dash-separated: degree='{degree_part}', institution='{institution_part}'")
                    continue
            
            # Strategy 3: Institution-only lines
            if self.is_educational_institution(line):
                # Extract year if present
                year_match = re.search(r'\b(19|20)\d{2}\b', line)
                year = year_match.group() if year_match else ''
                
                # Clean institution name
                institution_clean = re.sub(r'\b(19|20)\d{2}\b', '', line).strip()
                
                education.append({
                    'degree': '',  # Will be filled if found in context
                    'institution': institution_clean,
                    'year': year,
                    'field': ''
                })
                print(f"  Found institution: '{institution_clean}'")
                continue
            
            # Strategy 4: Degree-only lines with enhanced patterns
            degree_patterns = [
                r'\b(BSBA|BS|BA|MS|MA|PhD|Bachelor|Master|Associate|Diploma|Certificate)\b',
                r'\b(Marketing\s+Management|Computer\s+Science|Information\s+Technology|Business\s+Administration|Nursing|Engineering)\b'
            ]
            
            is_degree = any(re.search(pattern, line, re.IGNORECASE) for pattern in degree_patterns)
            if is_degree and not self.is_educational_institution(line):
                # Extract year if present
                year_match = re.search(r'\b(19|20)\d{2}\b', line)
                year = year_match.group() if year_match else ''
                
                # Clean degree text
                degree_clean = re.sub(r'\b(19|20)\d{2}\b', '', line).strip()
                
                education.append({
                    'degree': degree_clean,
                    'institution': '',
                    'year': year,
                    'field': self.extract_field_from_degree(degree_clean)
                })
                print(f"  Found degree line: '{degree_clean}'")
        
        print(f"Parsed {len(education)} education entries")
        return education
    
    def extract_field_from_degree(self, degree_text):
        """Extract field of study from degree text"""
        field_patterns = [
            r'\b(Marketing|Computer\s+Science|Information\s+Technology|Business|Management|Nursing|Engineering|Education|Psychology|Communications?|Literature|History|Mathematics|Physics|Chemistry|Biology|Accounting|Finance)\b'
        ]
        
        for pattern in field_patterns:
            match = re.search(pattern, degree_text, re.IGNORECASE)
            if match:
                return match.group(1)
        
        return ''
    
    def is_educational_institution(self, text):
        """Check if text looks like an educational institution"""
        edu_keywords = ['university', 'college', 'colleges', 'institute', 'school', 'academy', 'polytechnic', 'seminary', 'conservatory']
        return any(keyword in text.lower() for keyword in edu_keywords)
    
    def combine_extraction_results(self, spacy_results, transformer_results, rule_results, semantic_results):
        """Combine results from different extraction methods with confidence weighting"""
        combined = {
            'personal_info': {},
            'skills': [],
            'experience': [],
            'education': [],
            'certifications': [],
            'confidence_scores': {},
            'extraction_methods': {}
        }
        
        # Combine personal info (prefer rule-based for structured data)
        for method_name, results in [('rule', rule_results), ('transformer', transformer_results), ('spacy', spacy_results)]:
            if results and 'personal_info' in results:
                for key, value in results['personal_info'].items():
                    if not combined['personal_info'].get(key) and value:
                        combined['personal_info'][key] = value
                        combined['extraction_methods'][f'personal_info_{key}'] = method_name
        
        # Combine skills with deduplication
        all_skills = set()
        skill_sources = {}
        
        for method_name, results in [('rule', rule_results), ('semantic', semantic_results), ('spacy', spacy_results)]:
            if results and 'skills' in results:
                for skill in results['skills']:
                    skill_text = skill if isinstance(skill, str) else skill.get('skill', str(skill))
                    if skill_text and skill_text not in all_skills:
                        all_skills.add(skill_text)
                        skill_sources[skill_text] = method_name
        
        combined['skills'] = list(all_skills)
        combined['extraction_methods']['skills'] = skill_sources
        
        # Combine experience (prefer rule-based)
        if rule_results and 'experience' in rule_results:
            combined['experience'] = rule_results['experience']
            combined['extraction_methods']['experience'] = 'rule'
        elif spacy_results and 'experience' in spacy_results:
            combined['experience'] = spacy_results['experience']
            combined['extraction_methods']['experience'] = 'spacy'
        
        # Combine education (prefer rule-based)
        if rule_results and 'education' in rule_results:
            combined['education'] = rule_results['education']
            combined['extraction_methods']['education'] = 'rule'
        
        # Calculate overall confidence
        method_confidences = []
        for results in [spacy_results, transformer_results, rule_results, semantic_results]:
            if results and 'confidence' in results:
                method_confidences.append(results['confidence'])
        
        if method_confidences:
            combined['confidence_scores']['overall'] = sum(method_confidences) / len(method_confidences)
        else:
            combined['confidence_scores']['overall'] = 0.5
        
        return combined

# Initialize the enhanced parser
parser = EnhancedResumeParser()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'models_loaded': {
            'spacy': parser.nlp is not None,
            'transformer_ner': parser.ner_pipeline is not None,
            'sentence_transformer': parser.sentence_model is not None
        }
    })

@app.route('/parse-resume', methods=['POST'])
def parse_resume():
    try:
        data = request.get_json()
        
        # Extract text from PDF or use provided text
        if 'pdf_base64' in data:
            try:
                decoded_data = base64.b64decode(data['pdf_base64'])
                # Try to decode as UTF-8 text first (for testing)
                try:
                    text = decoded_data.decode('utf-8')
                    print(f"✓ Processed as text data, length: {len(text)}")
                except UnicodeDecodeError:
                    # It's actual PDF data
                    pdf_document = fitz.open(stream=decoded_data, filetype="pdf")
                    
                    text = ""
                    for page_num in range(pdf_document.page_count):
                        page = pdf_document[page_num]
                        text += page.get_text()
                    
                    pdf_document.close()
                    print(f"✓ Processed as PDF, extracted {len(text)} characters")
            except Exception as decode_error:
                return jsonify({
                    'success': False,
                    'error': f'Failed to decode data: {str(decode_error)}'
                }), 400
        elif 'text' in data:
            text = data['text']
        else:
            return jsonify({
                'success': False,
                'error': 'No PDF or text provided'
            }), 400
        
        if not text.strip():
            return jsonify({
                'success': False,
                'error': 'No text could be extracted from the document'
            }), 400
        
        # Parse with enhanced AI algorithms
        print(f"Parsing resume text (first 200 chars): {text[:200]}...")
        parsed_data = parser.extract_with_confidence(text)
        print(f"Parsed data summary: {len(parsed_data.get('skills', []))} skills, {len(parsed_data.get('experience', []))} experiences, {len(parsed_data.get('education', []))} education entries")
        
        # Format response
        response_data = {
            'personalInfo': {
                'name': parsed_data['personal_info'].get('name', ''),
                'email': parsed_data['personal_info'].get('email', ''),
                'phone': parsed_data['personal_info'].get('phone', ''),
                'address': parsed_data['personal_info'].get('address', '')
            },
            'skills': parsed_data['skills'],
            'experience': parsed_data['experience'],
            'education': parsed_data['education'],
            'languages': parsed_data.get('languages', []),
            'trainings': parsed_data.get('trainings', []),
            'certifications': parsed_data.get('certifications', []),
            'language': parsed_data.get('language', 'mixed'),
            'extractedText': text[:1000],  # First 1000 chars for reference
            'confidence': parsed_data.get('confidence_scores', {}),
            'methods': parsed_data.get('extraction_methods', [])
        }
        
        return jsonify({
            'success': True,
            'data': response_data,
            'entityCount': len(parsed_data['skills']) + len(parsed_data['experience']) + len(parsed_data['education'])
        })
        
    except Exception as e:
        print(f"Error parsing resume: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Parsing error: {str(e)}'
        }), 500

@app.route('/extract-text', methods=['POST'])
def extract_text():
    """Extract raw text from PDF without parsing into structured data"""
    try:
        data = request.get_json()
        
        if 'pdf_base64' not in data:
            return jsonify({
                'success': False,
                'error': 'PDF base64 data is required'
            }), 400
        
        # Extract text from PDF
        pdf_data = base64.b64decode(data['pdf_base64'])
        pdf_document = fitz.open(stream=pdf_data, filetype="pdf")
        
        text = ""
        page_count = pdf_document.page_count
        
        for page_num in range(page_count):
            page = pdf_document[page_num]
            page_text = page.get_text()
            text += page_text + "\n"
        
        pdf_document.close()
        
        if not text.strip():
            return jsonify({
                'success': False,
                'error': 'No text could be extracted from the document'
            }), 400
        
        print(f"✅ Text extraction successful, text length: {len(text)} characters")
        
        return jsonify({
            'success': True,
            'extracted_text': text.strip(),
            'text_length': len(text.strip()),
            'page_count': page_count
        })
        
    except Exception as e:
        print(f"Error extracting text: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Text extraction error: {str(e)}'
        }), 500

if __name__ == '__main__':
    print("🚀 Starting Enhanced AI Resume Parser Service...")
    print("📊 Models loaded:")
    print(f"   - SpaCy NER: {'✓' if parser.nlp else '✗'}")
    print(f"   - Transformer NER: {'✓' if parser.ner_pipeline else '✗'}")
    print(f"   - Sentence Transformer: {'✓' if parser.sentence_model else '✗'}")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
