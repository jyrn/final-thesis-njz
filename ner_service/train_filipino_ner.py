#!/usr/bin/env python3
"""
Training script for Filipino Resume NER Model
Trains a custom spaCy NER model for Filipino resume parsing
"""

import spacy
from spacy.training import Example
from spacy.util import minibatch, compounding
import random
import json
from pathlib import Path

# Enhanced Filipino Resume Training Data with Taglish and Filipino-specific patterns
TRAINING_DATA = [
    # Example 1: Filipino naming patterns with particles
    ("Maria Santos dela Cruz is a Senior Software Developer at Globe Telecom Inc. She has experience with JavaScript, Python, React, and Node.js. She graduated from University of the Philippines Diliman with a BS Computer Science degree, Magna Cum Laude.", {
        "entities": [
            (0, 23, "PERSON"),
            (29, 53, "JOB_TITLE"),
            (57, 76, "COMPANY"),
            (101, 111, "SKILL"),
            (113, 119, "SKILL"),
            (121, 126, "SKILL"),
            (132, 139, "SKILL"),
            (160, 193, "UNIVERSITY"),
            (201, 219, "DEGREE"),
            (228, 243, "HONOR")
        ]
    }),
    
    # Example 2: BPO and OFW Experience
    ("Jose Miguel Santos worked as a Customer Service Representative at Convergys Philippines for 3 years. He then worked as a Nurse in Dubai Healthcare City for 2 years. He has excellent communication skills and is fluent in English and Tagalog.", {
        "entities": [
            (0, 19, "PERSON"),
            (32, 63, "JOB_TITLE"),
            (67, 88, "COMPANY"),
            (93, 94, "EXPERIENCE_YEARS"),
            (118, 123, "JOB_TITLE"),
            (127, 148, "COMPANY"),
            (153, 154, "EXPERIENCE_YEARS"),
            (175, 196, "SKILL"),
            (214, 221, "SKILL"),
            (226, 233, "SKILL")
        ]
    }),
    
    # Example 3: Philippine Education System
    ("Anna Marie Cruz graduated from Ateneo de Manila University with a Bachelor of Science in Information Technology in 2020. She also has TESDA certification in Computer Programming NC III.", {
        "entities": [
            (0, 15, "PERSON"),
            (31, 58, "UNIVERSITY"),
            (66, 108, "DEGREE"),
            (112, 116, "DATE"),
            (132, 137, "UNIVERSITY"),
            (152, 184, "CERTIFICATION")
        ]
    }),
    
    # Example 4: Filipino Certifications (PRC, Civil Service, LET)
    ("Dr. Pedro Rizal Santos is a Licensed Professional Teacher with LET certification. He also passed the Civil Service Examination and has a PRC license for Professional Teachers.", {
        "entities": [
            (0, 22, "PERSON"),
            (28, 56, "JOB_TITLE"),
            (62, 78, "CERTIFICATION"),
            (99, 125, "CERTIFICATION"),
            (140, 151, "CERTIFICATION"),
            (156, 177, "CERTIFICATION")
        ]
    }),
    
    # Example 5: Philippine Address Format
    ("Carmen dela Rosa lives in Barangay San Antonio, Quezon City, Metro Manila, Philippines. She works at SM Supermalls as a Store Manager.", {
        "entities": [
            (0, 17, "PERSON"),
            (27, 84, "ADDRESS"),
            (99, 112, "COMPANY"),
            (118, 131, "JOB_TITLE")
        ]
    }),
    
    # Example 6: Taglish and Mixed Language
    ("Si Robert ay nag-work as a Web Developer sa Accenture Philippines. He is very skilled sa HTML, CSS, JavaScript, at PHP programming.", {
        "entities": [
            (3, 9, "PERSON"),
            (27, 40, "JOB_TITLE"),
            (44, 65, "COMPANY"),
            (91, 95, "SKILL"),
            (97, 100, "SKILL"),
            (102, 112, "SKILL"),
            (117, 120, "SKILL")
        ]
    }),
    
    # Example 2: BPO Experience
    ("Maria Santos worked as a Customer Service Representative at Convergys Philippines from 2019 to 2021. She has excellent communication skills and is proficient in English and Tagalog.", {
        "entities": [
            (0, 12, "PERSON"),
            (25, 56, "JOB_TITLE"),
            (60, 81, "COMPANY"),
            (87, 91, "DATE"),
            (95, 99, "DATE"),
            (120, 141, "SKILL"),
            (163, 170, "SKILL"),
            (175, 182, "SKILL")
        ]
    }),
    
    # Example 3: Healthcare Professional
    ("Dr. Jose Rizal is a Medical Doctor at Philippine General Hospital. He specializes in Internal Medicine and has certifications from the Philippine Medical Association.", {
        "entities": [
            (0, 13, "PERSON"),
            (19, 33, "JOB_TITLE"),
            (37, 65, "COMPANY"),
            (85, 102, "SPECIALIZATION"),
            (126, 157, "CERTIFICATION")
        ]
    }),
    
    # Example 4: Education Background
    ("Anna Cruz graduated Magna Cum Laude from Ateneo de Manila University with a Bachelor of Science in Information Technology in 2020.", {
        "entities": [
            (0, 9, "PERSON"),
            (20, 35, "HONOR"),
            (41, 68, "UNIVERSITY"),
            (76, 118, "DEGREE"),
            (122, 126, "DATE")
        ]
    }),
    
    # Example 5: Technical Skills
    ("Roberto has 5 years of experience in web development using HTML, CSS, JavaScript, PHP, MySQL, and WordPress. He is also skilled in Photoshop and AutoCAD.", {
        "entities": [
            (0, 7, "PERSON"),
            (12, 13, "EXPERIENCE_YEARS"),
            (47, 61, "FIELD"),
            (68, 72, "SKILL"),
            (74, 77, "SKILL"),
            (79, 89, "SKILL"),
            (91, 94, "SKILL"),
            (96, 101, "SKILL"),
            (107, 116, "SKILL"),
            (140, 149, "SKILL"),
            (154, 161, "SKILL")
        ]
    }),
    
    # Example 6: Filipino Company Names
    ("Liza works at Jollibee Foods Corporation as a Store Manager. Previously, she was employed at SM Supermalls as an Assistant Manager.", {
        "entities": [
            (0, 4, "PERSON"),
            (14, 40, "COMPANY"),
            (46, 59, "JOB_TITLE"),
            (86, 99, "COMPANY"),
            (106, 123, "JOB_TITLE")
        ]
    }),
    
    # Example 7: OFW Experience
    ("Miguel worked as a Nurse in Dubai Healthcare City from 2018 to 2020. He has experience in patient care and medical procedures.", {
        "entities": [
            (0, 6, "PERSON"),
            (19, 24, "JOB_TITLE"),
            (28, 49, "COMPANY"),
            (55, 59, "DATE"),
            (63, 67, "DATE"),
            (89, 101, "SKILL"),
            (106, 124, "SKILL")
        ]
    }),
    
    # Example 8: Multiple Degrees
    ("Carmen has a Master of Business Administration from Asian Institute of Management and a Bachelor of Arts in Psychology from University of Santo Tomas.", {
        "entities": [
            (0, 6, "PERSON"),
            (13, 47, "DEGREE"),
            (53, 84, "UNIVERSITY"),
            (91, 120, "DEGREE"),
            (126, 152, "UNIVERSITY")
        ]
    }),
    
    # Example 9: Certifications
    ("Pedro is a Certified Public Accountant with PRC license. He also has certifications in SAP and QuickBooks.", {
        "entities": [
            (0, 5, "PERSON"),
            (11, 38, "CERTIFICATION"),
            (44, 55, "CERTIFICATION"),
            (84, 87, "SKILL"),
            (92, 102, "SKILL")
        ]
    }),
    
    # Example 10: Programming Languages
    ("Sarah is proficient in Java, C#, Python, and JavaScript. She has experience with Spring Framework, .NET, Django, and React.", {
        "entities": [
            (0, 5, "PERSON"),
            (23, 27, "SKILL"),
            (29, 31, "SKILL"),
            (33, 39, "SKILL"),
            (45, 55, "SKILL"),
            (80, 96, "SKILL"),
            (98, 102, "SKILL"),
            (104, 110, "SKILL"),
            (116, 121, "SKILL")
        ]
    }),
    
    # Example 11: Filipino Universities
    ("Mark graduated from De La Salle University with a degree in Civil Engineering. He also attended TESDA for welding certification.", {
        "entities": [
            (0, 4, "PERSON"),
            (20, 42, "UNIVERSITY"),
            (59, 76, "DEGREE"),
            (97, 102, "UNIVERSITY"),
            (107, 128, "CERTIFICATION")
        ]
    }),
    
    # Example 12: Soft Skills
    ("Elena has strong leadership skills, excellent communication abilities, and is experienced in project management and team coordination.", {
        "entities": [
            (0, 5, "PERSON"),
            (18, 35, "SKILL"),
            (47, 71, "SKILL"),
            (100, 118, "SKILL"),
            (123, 140, "SKILL")
        ]
    }),
    
    # Example 13: Work Duration
    ("Carlos worked at Globe Telecom for 3 years as a Network Engineer. He then moved to PLDT for 2 years as a Senior Network Engineer.", {
        "entities": [
            (0, 6, "PERSON"),
            (17, 30, "COMPANY"),
            (35, 36, "EXPERIENCE_YEARS"),
            (48, 64, "JOB_TITLE"),
            (85, 89, "COMPANY"),
            (94, 95, "EXPERIENCE_YEARS"),
            (107, 130, "JOB_TITLE")
        ]
    }),
    
    # Example 14: Multiple Skills Categories
    ("Rachel has technical skills in HTML5, CSS3, Bootstrap, and responsive design. She also has soft skills like problem-solving and critical thinking.", {
        "entities": [
            (0, 6, "PERSON"),
            (34, 39, "SKILL"),
            (41, 45, "SKILL"),
            (47, 56, "SKILL"),
            (62, 79, "SKILL"),
            (108, 123, "SKILL"),
            (128, 145, "SKILL")
        ]
    }),
    
    # Example 15: Filipino Address Format
    ("Antonio lives in Quezon City, Metro Manila, Philippines. He works at Ayala Corporation in Makati City as a Financial Analyst.", {
        "entities": [
            (0, 7, "PERSON"),
            (17, 55, "ADDRESS"),
            (69, 86, "COMPANY"),
            (90, 101, "ADDRESS"),
            (107, 125, "JOB_TITLE")
        ]
    })
]

def create_training_data():
    """Create comprehensive training data for Filipino resume NER"""
    
    # Add more training examples programmatically
    additional_data = []
    
    # Common Filipino names
    filipino_names = ["Juan", "Maria", "Jose", "Ana", "Carlos", "Elena", "Miguel", "Carmen", "Pedro", "Sarah"]
    
    # Common job titles in Philippines
    job_titles = [
        "Software Developer", "Customer Service Representative", "Nurse", "Teacher", 
        "Accountant", "Sales Associate", "Marketing Manager", "HR Specialist",
        "Call Center Agent", "Virtual Assistant", "Graphic Designer", "Web Developer"
    ]
    
    # Common Filipino companies
    companies = [
        "Jollibee Foods Corporation", "SM Supermalls", "Ayala Corporation", 
        "Globe Telecom", "PLDT", "BDO Unibank", "Convergys Philippines",
        "Accenture Philippines", "IBM Philippines", "Cognizant Technology Solutions"
    ]
    
    # Technical skills
    tech_skills = [
        "JavaScript", "Python", "Java", "C#", "PHP", "HTML", "CSS", "React", 
        "Node.js", "Angular", "Vue.js", "MySQL", "MongoDB", "PostgreSQL",
        "AWS", "Azure", "Docker", "Git", "REST API", "GraphQL"
    ]
    
    # Generate additional training examples
    for i in range(10):
        name = random.choice(filipino_names)
        job = random.choice(job_titles)
        company = random.choice(companies)
        skills = random.sample(tech_skills, 3)
        
        text = f"{name} works as a {job} at {company}. He has experience with {', '.join(skills)}."
        
        entities = []
        entities.append((0, len(name), "PERSON"))
        
        job_start = text.find(job)
        entities.append((job_start, job_start + len(job), "JOB_TITLE"))
        
        company_start = text.find(company)
        entities.append((company_start, company_start + len(company), "COMPANY"))
        
        for skill in skills:
            skill_start = text.find(skill)
            if skill_start != -1:
                entities.append((skill_start, skill_start + len(skill), "SKILL"))
        
        additional_data.append((text, {"entities": entities}))
    
    return TRAINING_DATA + additional_data

def train_ner_model():
    """Train the custom NER model for Filipino resumes"""
    
    print("🚀 Starting Filipino Resume NER Model Training...")
    
    # Create a blank English model or load existing one
    try:
        nlp = spacy.load("en_core_web_sm")
        print("✅ Loaded existing English model")
    except OSError:
        nlp = spacy.blank("en")
        print("✅ Created blank English model")
    
    # Get the NER component
    if "ner" not in nlp.pipe_names:
        ner = nlp.add_pipe("ner")
        print("✅ Added NER component")
    else:
        ner = nlp.get_pipe("ner")
        print("✅ Using existing NER component")
    
    # Add custom labels for Filipino resume entities
    labels = [
        "PERSON", "JOB_TITLE", "COMPANY", "SKILL", "UNIVERSITY", "DEGREE",
        "CERTIFICATION", "DATE", "EXPERIENCE_YEARS", "FIELD", "SPECIALIZATION",
        "HONOR", "ADDRESS"
    ]
    
    for label in labels:
        ner.add_label(label)
        print(f"✅ Added label: {label}")
    
    # Get training data
    training_data = create_training_data()
    print(f"📊 Training with {len(training_data)} examples")
    
    # Convert training data to spaCy format
    examples = []
    for text, annotations in training_data:
        doc = nlp.make_doc(text)
        example = Example.from_dict(doc, annotations)
        examples.append(example)
    
    # Disable other pipeline components during training
    other_pipes = [pipe for pipe in nlp.pipe_names if pipe != "ner"]
    with nlp.disable_pipes(*other_pipes):
        
        # Initialize the model
        nlp.initialize()
        print("✅ Model initialized")
        
        # Training parameters
        n_iter = 30
        batch_size = compounding(4.0, 32.0, 1.001)
        
        print(f"🔄 Training for {n_iter} iterations...")
        
        for iteration in range(n_iter):
            random.shuffle(examples)
            losses = {}
            
            # Create batches
            batches = minibatch(examples, size=batch_size)
            
            for batch in batches:
                nlp.update(batch, losses=losses)
            
            if iteration % 5 == 0:
                print(f"Iteration {iteration}: Loss = {losses.get('ner', 0.0):.4f}")
    
    print("✅ Training completed!")
    
    # Save the trained model
    output_dir = Path("./filipino_resume_ner_model")
    if not output_dir.exists():
        output_dir.mkdir()
    
    nlp.to_disk(output_dir)
    print(f"✅ Model saved to {output_dir}")
    
    return nlp

def test_trained_model(nlp):
    """Test the trained model with sample text"""
    
    print("\n🧪 Testing Trained Model...")
    
    test_texts = [
        "Juan dela Cruz is a Senior Software Developer at Globe Telecom. He has 5 years of experience with JavaScript, Python, and React.",
        "Maria Santos graduated from University of the Philippines with a BS Computer Science degree. She works as a Data Analyst at Ayala Corporation.",
        "Pedro has certifications in AWS and Azure. He is proficient in Docker, Kubernetes, and DevOps practices."
    ]
    
    for i, text in enumerate(test_texts, 1):
        print(f"\n--- Test {i} ---")
        print(f"Text: {text}")
        
        doc = nlp(text)
        print("Entities found:")
        
        for ent in doc.ents:
            print(f"  • '{ent.text}' → {ent.label_}")
        
        if not doc.ents:
            print("  No entities found")

def evaluate_model(nlp, test_data):
    """Evaluate the model performance"""
    
    print("\n📊 Evaluating Model Performance...")
    
    total_entities = 0
    correct_entities = 0
    
    for text, annotations in test_data:
        doc = nlp(text)
        predicted_entities = [(ent.start_char, ent.end_char, ent.label_) for ent in doc.ents]
        true_entities = annotations["entities"]
        
        total_entities += len(true_entities)
        
        for pred_ent in predicted_entities:
            if pred_ent in true_entities:
                correct_entities += 1
    
    precision = correct_entities / len([ent for text, ann in test_data for ent in nlp(text).ents]) if any(nlp(text).ents for text, ann in test_data) else 0
    recall = correct_entities / total_entities if total_entities > 0 else 0
    f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    
    print(f"Precision: {precision:.3f}")
    print(f"Recall: {recall:.3f}")
    print(f"F1 Score: {f1_score:.3f}")
    
    return {"precision": precision, "recall": recall, "f1_score": f1_score}

def main():
    """Main training function"""
    
    # Train the model
    trained_model = train_ner_model()
    
    # Test the trained model
    test_trained_model(trained_model)
    
    # Evaluate on a subset of training data (in practice, use separate test data)
    test_data = TRAINING_DATA[:5]  # Use first 5 examples for quick evaluation
    metrics = evaluate_model(trained_model, test_data)
    
    print(f"\n🎉 Training Complete!")
    print(f"Model saved and ready to use for Filipino resume parsing.")
    print(f"Performance: F1 Score = {metrics['f1_score']:.3f}")

if __name__ == "__main__":
    main()
