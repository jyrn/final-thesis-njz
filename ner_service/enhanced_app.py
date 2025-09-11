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
        combined_results['trainings'] = self.extract_trainings(text)
        
        # Add languages extraction
        combined_results['languages'] = self.extract_languages(text)
        
        print(f"✅ Extraction complete. Found {len(combined_results.get('skills', []))} skills, {len(combined_results.get('experience', []))} experiences, {len(combined_results.get('trainings', []))} trainings")
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
        
        # Look for training-related sections
        training_sections = ['TRAINING', 'SEMINAR', 'WORKSHOP', 'CERTIFICATION', 'COURSE', 'PROFESSIONAL DEVELOPMENT']
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
                
                # Only add if we have a meaningful name
                if training_entry['name'] and len(training_entry['name']) > 3:
                    trainings.append(training_entry)
        
        return trainings
    
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
        """Advanced skills extraction with enhanced two-column format support"""
        skills = set()
        
        print(f"Starting skills extraction from text length: {len(text)}")
        
        # Strategy 1: Dedicated skills sections with enhanced two-column support
        skills_patterns = [
            # Standard skills section
            r'(?:TECHNICAL\s+SKILLS?|SKILLS?|CORE\s+COMPETENCIES|EXPERTISE|COMPETENCIES|PROFICIENCIES|PROGRAMMING\s+LANGUAGES?|TECHNOLOGIES)\s*:?\s*\n([\s\S]*?)(?=\n\s*(?:EXPERIENCE|WORK|EDUCATION|CERTIFICATIONS|PROJECTS|REFERENCES|LANGUAGES|$))',
            # Two-column format - skills on left side
            r'SKILLS\s*\n((?:•\s*[^\n]+\n?)+)',
            # Skills followed by other content on same line (two-column)
            r'SKILLS\s+((?:•\s*[^\n]+(?:\s{10,}[^\n]+)?\n?)+)',
        ]
        
        for pattern in skills_patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
            if match:
                skills_text = match.group(1).strip()
                print(f"Found skills section: {skills_text[:100]}...")
                
                # Parse different skill formats
                extracted_skills = self.parse_skills_from_text(skills_text)
                skills.update(extracted_skills)
                print(f"Extracted {len(extracted_skills)} skills from section")
        
        # Strategy 1: Find skills section in two-column format
        lines = text.split('\n')
        in_skills_section = False
        skills_content = []
        
        for i, line in enumerate(lines):
            line_stripped = line.strip()
            line_upper = line_stripped.upper()
            
            # Check if this line contains SKILLS header (handle two-column format)
            if 'SKILLS' in line_upper and (line_stripped.startswith('SKILLS') or line_upper.startswith('SKILLS')):
                in_skills_section = True
                print(f"Found skills section start at line {i}: {line}")
                continue
            elif in_skills_section:
                # Check if we've moved to another major section
                if line_stripped and (line_upper.startswith(('LANGUAGES', 'REFERENCES', 'CERTIFICATIONS', 'WORK EXPERIENCE')) or 
                                    'EXPERIENCE' in line_upper):
                    print(f"Skills section ended at line {i}: {line}")
                    break
                
                # Process skills lines
                if line_stripped:
                    print(f"Processing skills line {i}: '{line_stripped}'")
                    # Handle two-column format - extract left side only
                    if '    ' in line:  # Multiple spaces indicate columns
                        left_part = line.split('    ')[0].strip()
                        if left_part and ('•' in left_part or left_part.startswith('-')):
                            skills_content.append(left_part)
                            print(f"  Added left column skills: {left_part}")
                    elif '•' in line or line_stripped.startswith('-'):
                        skills_content.append(line)
                        print(f"  Added bullet skills: {line}")
        
        if skills_content:
            skills_text = '\n'.join(skills_content)
            print(f"Found two-column skills content: {skills_text[:100]}...")
            extracted_skills = self.parse_skills_from_text(skills_text)
            skills.update(extracted_skills)
        
        # Strategy 2: Handle two-column format specifically
        lines = text.split('\n')
        in_skills_section = False
        skills_content = []
        
        for line in lines:
            line_stripped = line.strip()
            line_upper = line_stripped.upper()
            
            # Check if this line contains SKILLS header (handle two-column format)
            if 'SKILLS' in line_upper and line_stripped.startswith('SKILLS'):
                in_skills_section = True
                print(f"Found skills section start: {line}")
                continue
            elif in_skills_section:
                # Check if we've moved to another major section
                if line_stripped and line_upper.startswith(('LANGUAGES', 'REFERENCES', 'CERTIFICATIONS')):
                    print(f"Skills section ended at: {line}")
                    break
                
                # Process skills lines
                if line_stripped:
                    # Handle two-column format - extract left side only
                    if '    ' in line:  # Multiple spaces indicate columns
                        left_part = line.split('    ')[0].strip()
                        if left_part and ('•' in left_part or left_part.startswith('-')):
                            skills_content.append(left_part)
                    elif '•' in line or line_stripped.startswith('-'):
                        skills_content.append(line)
        
        if skills_content:
            skills_text = '\n'.join(skills_content)
            print(f"Found two-column skills content: {skills_text[:100]}...")
            extracted_skills = self.parse_skills_from_text(skills_text)
            skills.update(extracted_skills)
            print(f"Extracted {len(extracted_skills)} skills from two-column format")
        
        # Strategy 3: Extract from "Technologies used:" or "Tools:" lines
        tech_line_patterns = [
            r'(?:Technologies?\s+used|Tools?|Languages?|Frameworks?)\s*:?\s*([A-Za-z0-9+#.,\-\s&/]+)',
            r'(?:Tech\s+stack|Stack|Platform)\s*:?\s*([A-Za-z0-9+#.,\-\s&/]+)',
        ]
        
        for pattern in tech_line_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                tech_text = match.group(1).strip()
                print(f"Found tech line: {tech_text[:50]}...")
                extracted_skills = self.parse_skills_from_text(tech_text)
                skills.update(extracted_skills)
        
        # Strategy 4: Extract skills from experience but validate they're actually skills
        experience_skills = self.extract_skills_from_experience_context(text)
        skills.update(experience_skills)
        
        # Filter out non-skills and validate
        validated_skills = self.validate_and_filter_skills(list(skills))
        
        print(f"Final validated skills count: {len(validated_skills)}")
        return validated_skills
    
    def parse_skills_from_text(self, text):
        """Parse skills from a text block with various formats"""
        skills = set()
        
        # Handle comma/semicolon separated
        if ',' in text or ';' in text:
            skill_items = re.split(r'[,;]\s*', text)
            for skill in skill_items:
                clean_skill = re.sub(r'^[•\-\*\s]+|[•\-\*\s]+$', '', skill).strip()
                clean_skill = re.sub(r'\([^)]*\)', '', clean_skill).strip()  # Remove parentheses
                if self.is_valid_skill(clean_skill):
                    skills.add(clean_skill)
        
        # Handle bullet points with better extraction
        bullet_skills = re.findall(r'[•\-\*]\s*([A-Za-z0-9+#.\s/&]+)', text)
        for skill in bullet_skills:
            clean_skill = re.sub(r'^[•\-\*\s]+|[•\-\*\s]+$', '', skill).strip()
            clean_skill = re.sub(r'\([^)]*\)', '', clean_skill).strip()  # Remove parentheses
            
            # Remove trailing content after multiple spaces (two-column format)
            if '    ' in clean_skill:
                clean_skill = clean_skill.split('    ')[0].strip()
            
            # Split on common separators within bullet points
            if '/' in clean_skill:
                sub_skills = [s.strip() for s in clean_skill.split('/')]
                for sub_skill in sub_skills:
                    if self.is_valid_skill(sub_skill):
                        skills.add(sub_skill)
            elif self.is_valid_skill(clean_skill):
                skills.add(clean_skill)
        
        # Handle line-by-line for simple lists with better filtering
        lines = text.split('\n')
        for line in lines:
            line = line.strip()
            # Remove bullet points and clean up
            clean_line = re.sub(r'^[•\-\*\s]+', '', line).strip()
            
            # Skip lines that look like job descriptions or experience
            if clean_line and not any(word in clean_line.lower() for word in ['experience', 'worked', 'developed', 'managed', 'led', 'responsible', 'duties', 'tasks']):
                # Handle two-column format - extract only left side for skills
                if '    ' in clean_line:
                    left_part = clean_line.split('    ')[0].strip()
                    if self.is_valid_skill(left_part):
                        skills.add(left_part)
                elif self.is_valid_skill(clean_line):
                    skills.add(clean_line)
        
        return skills
    
    def extract_skills_from_experience_context(self, text):
        """Extract technical skills mentioned in experience but validate they're skills"""
        skills = set()
        
        # Look for technology mentions in experience sections
        tech_patterns = [
            r'(?:using|with|in)\s+([A-Za-z0-9+#.-]+(?:\s+[A-Za-z0-9+#.-]+)?)',
            r'([A-Za-z0-9+#.-]+)\s+(?:development|programming|framework|library)',
        ]
        
        # Known technical skills to look for
        known_tech_skills = {
            'JavaScript', 'Python', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Rust',
            'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Laravel',
            'HTML', 'CSS', 'Bootstrap', 'Tailwind', 'SASS', 'SCSS',
            'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite',
            'Git', 'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
            'TypeScript', 'GraphQL', 'REST', 'API'
        }
        
        for pattern in tech_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                potential_skill = match.group(1).strip()
                # Only add if it's a known technical skill
                for known_skill in known_tech_skills:
                    if known_skill.lower() == potential_skill.lower():
                        skills.add(known_skill)
                        break
        
        return skills
    
    def is_valid_skill(self, skill):
        """Validate if a string is likely a skill"""
        if not skill or len(skill) < 2 or len(skill) > 50:
            return False
        
        # Skip if it looks like a sentence or job description
        if any(word in skill.lower() for word in ['developed', 'managed', 'led', 'worked', 'created', 'implemented', 'designed', 'maintained', 'responsible', 'duties']):
            return False
        
        # Skip obvious non-skills
        non_skills = ['experience', 'worked', 'developed', 'managed', 'led', 'created', 
                     'implemented', 'designed', 'maintained', 'responsible', 'duties',
                     'training', 'course', 'program', 'degree', 'bachelor', 'master', 
                     'university', 'college', 'school']
        if any(non_skill in skill.lower() for non_skill in non_skills):
            return False
        
        # Skip if it contains too many common words
        common_words = ['the', 'and', 'or', 'with', 'for', 'in', 'on', 'at', 'to', 'from', 'of', 'is', 'are', 'was', 'were']
        word_count = len([w for w in skill.lower().split() if w in common_words])
        if word_count > 1:
            return False
        
        # Accept common skill patterns
        skill_patterns = [
            r'^[A-Za-z]+(?:\.[a-z]+)?$',  # JavaScript, React.js, Node.js
            r'^[A-Za-z]+\s+[A-Za-z]+$',  # Project Management, Digital Marketing
            r'^[A-Za-z]+\+\+?$',         # C++, C#
            r'^[A-Za-z]+\s*[0-9]+$',     # Python3, HTML5
        ]
        
        if any(re.match(pattern, skill) for pattern in skill_patterns):
            return True
        
        # Check if it's a reasonable skill name (2-4 words max)
        words = skill.split()
        if len(words) <= 4 and all(len(word) >= 2 for word in words):
            return True
        
        # Skip if it's just numbers or dates
        if re.match(r'^\d+[-/]\d+', skill) or re.match(r'^\d{4}$', skill):
            return False
        
        return True
    
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
        """Enhanced education extraction with flexible patterns"""
        education = []
        print(f"Starting education extraction from text length: {len(text)}")
        
        # Enhanced education section detection for two-column format
        lines = text.split('\n')
        in_education_section = False
        education_content = []
        
        for i, line in enumerate(lines):
            line_stripped = line.strip()
            line_upper = line_stripped.upper()
            
            # Check if this line contains EDUCATION header
            if 'EDUCATION' in line_upper and (line_stripped.startswith('EDUCATION') or 
                                            'EDUCATION' in line_upper.split()):
                in_education_section = True
                print(f"Found education section at line {i}: {line}")
                continue
            elif in_education_section:
                # Check if we've moved to another major section
                if line_stripped and (line_upper.startswith(('SKILLS', 'EXPERIENCE', 'LANGUAGES', 'REFERENCES')) or
                                    'WORK EXPERIENCE' in line_upper):
                    print(f"Education section ended at line {i}: {line}")
                    break
                
                # Process education lines
                if line_stripped:
                    # Handle two-column format - extract right side for education
                    if '    ' in line:  # Multiple spaces indicate columns
                        right_part = line.split('    ')[-1].strip()
                        if right_part and not right_part.isdigit() and '@' not in right_part:
                            education_content.append(right_part)
                            print(f"  Added education content: {right_part}")
                    elif not line_stripped.isdigit() and '@' not in line_stripped:
                        education_content.append(line_stripped)
                        print(f"  Added education line: {line_stripped}")
        
        if education_content:
            edu_text = '\n'.join(education_content)
            print(f"Processing education content: {edu_text[:200]}...")
            education = self.parse_education_entries(edu_text)
            print(f"Parsed {len(education)} education entries from two-column format")
        else:
            print("No education section found, trying fallback patterns...")
            # Fallback: Look for degree patterns anywhere in text
            degree_patterns = [
                r'(Bachelor|Master|PhD|Doctorate|Associate|Diploma|Certificate)\s+(?:of\s+)?(?:Science|Arts|Engineering|Business|Technology|Education|Medicine|Law|Nursing|Computer\s+Science|Information\s+Technology|Management|Administration|Marketing|Finance|Accounting|Psychology|Communications?|Literature|History|Mathematics|Physics|Chemistry|Biology)\s*(?:in\s+[A-Za-z\s]+)?\s*(?:from\s+|at\s+)?([A-Za-z\s,&.]+(?:University|College|Institute|School|Academy))',
                r'([A-Za-z\s,&.]+(?:University|College|Institute|School|Academy))\s*[\-–]\s*(Bachelor|Master|PhD|Doctorate|Associate|Diploma|Certificate)',
            ]
            
            for i, pattern in enumerate(degree_patterns):
                print(f"Trying degree pattern {i+1}...")
                matches = re.finditer(pattern, text, re.IGNORECASE)
                for match in matches:
                    print(f"Found degree match: {match.group(0)}")
                    if len(match.groups()) >= 2:
                        degree = match.group(1) if 'Bachelor' in match.group(1) else match.group(2)
                        school = match.group(2) if 'Bachelor' in match.group(1) else match.group(1)
                        education.append({
                            'degree': degree.strip(),
                            'school': school.strip(),
                            'year': '',
                            'field': ''
                        })
            
            print(f"Fallback patterns found {len(education)} education entries")
        
        print(f"Final education extraction result: {len(education)} entries")
        return education
    
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
        """Parse education entries with better degree and institution separation"""
        education = []
        print(f"Parsing education from: {edu_text[:200]}...")
        
        # Handle two-column format and pipe-separated format
        lines = edu_text.split('\n')
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
            
            print(f"Processing education line: {line}")
            
            # Handle pipe-separated format: "BSBA Marketing Management | De La Salle Lipa"
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
                        'field': ''
                    })
                    print(f"  Found pipe-separated: degree='{degree_part}', institution='{institution_part}'")
                    continue
            
            # Handle space-separated format with institution keywords
            if self.is_educational_institution(line):
                # This line contains an institution, look for degree in previous context
                words = line.split()
                degree_part = ""
                institution_part = ""
                
                # Find where institution starts
                institution_keywords = ['university', 'college', 'institute', 'school', 'academy', 'polytechnic']
                for i, word in enumerate(words):
                    if any(keyword in word.lower() for keyword in institution_keywords):
                        degree_part = ' '.join(words[:i]).strip()
                        institution_part = ' '.join(words[i:]).strip()
                        break
                
                if not institution_part:
                    institution_part = line
                
                # Extract year if present
                year_match = re.search(r'\b(19|20)\d{2}\b', line)
                year = year_match.group() if year_match else ''
                
                education.append({
                    'degree': degree_part if degree_part else 'Undergraduate Degree',
                    'institution': institution_part,
                    'year': year,
                    'field': ''
                })
                print(f"  Found institution line: degree='{degree_part}', institution='{institution_part}'")
                continue
            
            # Handle degree-only lines
            degree_patterns = [
                r'(BSBA|BS|BA|MS|MA|PhD|Bachelor|Master|Associate|Diploma|Certificate|Undergraduate)',
                r'(Marketing\s+Management|Computer\s+Science|Information\s+Technology|Business\s+Administration)'
            ]
            
            is_degree = any(re.search(pattern, line, re.IGNORECASE) for pattern in degree_patterns)
            if is_degree:
                education.append({
                    'degree': line,
                    'institution': '',
                    'year': '',
                    'field': ''
                })
                print(f"  Found degree line: '{line}'")
        
        print(f"Parsed {len(education)} education entries")
        return education
    
    def is_educational_institution(self, text):
        """Check if text looks like an educational institution"""
        edu_keywords = ['university', 'college', 'colleges', 'institute', 'school', 'academy', 'polytechnic']
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
            pdf_data = base64.b64decode(data['pdf_base64'])
            pdf_document = fitz.open(stream=pdf_data, filetype="pdf")
            
            text = ""
            for page_num in range(pdf_document.page_count):
                page = pdf_document[page_num]
                text += page.get_text()
            
            pdf_document.close()
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
