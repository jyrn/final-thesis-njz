#!/usr/bin/env python3
"""
Simple Filipino Resume NER Model Training Script
Trains a custom spaCy NER model for Filipino resume parsing without transformers
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
    
    # Example 7: More BPO Experience
    ("Maria Santos worked as a Customer Service Representative at Convergys Philippines from 2019 to 2021. She has excellent communication skills and is proficient in English and Tagalog.", {
        "entities": [
            (0, 12, "PERSON"),
            (25, 56, "JOB_TITLE"),
            (60, 81, "COMPANY"),
            (87, 91, "DATE"),
            (95, 99, "DATE"),
            (119, 140, "SKILL"),
            (162, 169, "SKILL"),
            (174, 181, "SKILL")
        ]
    }),
    
    # Example 8: Technical Skills
    ("John Paul Cruz has 5 years of experience in software development. He is skilled in Java, Spring Boot, MySQL, and AWS cloud services.", {
        "entities": [
            (0, 15, "PERSON"),
            (20, 21, "EXPERIENCE_YEARS"),
            (30, 40, "EXPERIENCE"),
            (44, 63, "SKILL"),
            (86, 90, "SKILL"),
            (92, 103, "SKILL"),
            (105, 110, "SKILL"),
            (116, 135, "SKILL")
        ]
    }),
    
    # Example 9: Education with Latin Honors
    ("Grace Santos graduated Summa Cum Laude from De La Salle University with a Bachelor of Science in Computer Engineering in 2019.", {
        "entities": [
            (0, 12, "PERSON"),
            (23, 38, "HONOR"),
            (44, 68, "UNIVERSITY"),
            (76, 115, "DEGREE"),
            (119, 123, "DATE")
        ]
    }),
    
    # Example 10: OFW Experience
    ("Miguel dela Cruz worked as a Registered Nurse in King Faisal Hospital, Saudi Arabia for 4 years before returning to the Philippines.", {
        "entities": [
            (0, 16, "PERSON"),
            (29, 46, "JOB_TITLE"),
            (50, 84, "COMPANY"),
            (89, 90, "EXPERIENCE_YEARS"),
            (110, 121, "ADDRESS")
        ]
    }),
    
    # Example 11: Call Center Agent
    ("Angela Marie Santos is currently working as a Call Center Agent at Teleperformance Philippines. She handles customer inquiries and technical support.", {
        "entities": [
            (0, 19, "PERSON"),
            (46, 63, "JOB_TITLE"),
            (67, 93, "COMPANY"),
            (107, 125, "SKILL"),
            (130, 146, "SKILL")
        ]
    }),
    
    # Example 12: IT Professional with Certifications
    ("Mark Anthony Cruz is a Network Administrator with CCNA certification. He graduated from Mapua University with a BS Information Technology degree.", {
        "entities": [
            (0, 17, "PERSON"),
            (23, 43, "JOB_TITLE"),
            (49, 66, "CERTIFICATION"),
            (87, 102, "UNIVERSITY"),
            (110, 139, "DEGREE")
        ]
    }),
    
    # Example 13: Teaching Professional
    ("Prof. Elena Santos teaches Mathematics at University of Santo Tomas. She has a Master of Arts in Teaching Mathematics and LET certification.", {
        "entities": [
            (0, 18, "PERSON"),
            (27, 38, "SKILL"),
            (42, 67, "UNIVERSITY"),
            (79, 114, "DEGREE"),
            (119, 135, "CERTIFICATION")
        ]
    }),
    
    # Example 14: Healthcare Professional
    ("Dr. Ricardo Santos is a Cardiologist at Philippine Heart Center. He completed his residency at University of the Philippines Manila.", {
        "entities": [
            (0, 18, "PERSON"),
            (24, 36, "JOB_TITLE"),
            (40, 63, "COMPANY"),
            (80, 89, "EXPERIENCE"),
            (93, 129, "UNIVERSITY")
        ]
    }),
    
    # Example 15: Business Professional
    ("Catherine Cruz works as a Marketing Manager at Jollibee Foods Corporation. She has expertise in digital marketing and brand management.", {
        "entities": [
            (0, 14, "PERSON"),
            (26, 43, "JOB_TITLE"),
            (47, 73, "COMPANY"),
            (93, 110, "SKILL"),
            (115, 131, "SKILL")
        ]
    })
]

def create_blank_nlp():
    """Create a blank spaCy model with NER component"""
    nlp = spacy.blank("en")
    
    # Add the NER component
    if "ner" not in nlp.pipe_names:
        ner = nlp.add_pipe("ner")
    else:
        ner = nlp.get_pipe("ner")
    
    # Add entity labels
    labels = ["PERSON", "JOB_TITLE", "COMPANY", "SKILL", "UNIVERSITY", "DEGREE", 
              "DATE", "CERTIFICATION", "ADDRESS", "HONOR", "EXPERIENCE", "EXPERIENCE_YEARS"]
    
    for label in labels:
        ner.add_label(label)
    
    return nlp

def train_ner_model(n_iter=30):
    """Train the NER model"""
    print("Creating blank spaCy model...")
    nlp = create_blank_nlp()
    
    # Get the NER component
    ner = nlp.get_pipe("ner")
    
    # Prepare training data
    print(f"Preparing {len(TRAINING_DATA)} training examples...")
    examples = []
    for text, annotations in TRAINING_DATA:
        doc = nlp.make_doc(text)
        example = Example.from_dict(doc, annotations)
        examples.append(example)
    
    # Start training
    print(f"Starting training for {n_iter} iterations...")
    nlp.begin_training()
    
    for i in range(n_iter):
        random.shuffle(examples)
        losses = {}
        
        # Create batches
        batches = minibatch(examples, size=compounding(4.0, 32.0, 1.001))
        
        for batch in batches:
            nlp.update(batch, losses=losses, drop=0.5)
        
        if i % 5 == 0:
            print(f"Iteration {i}, Losses: {losses}")
    
    print("Training completed!")
    return nlp

def test_model(nlp, test_texts=None):
    """Test the trained model"""
    if test_texts is None:
        test_texts = [
            "Juan dela Cruz is a Software Engineer at Accenture Philippines.",
            "Maria Santos graduated from University of the Philippines with a BS Computer Science degree.",
            "Jose worked as a Call Center Agent at Convergys for 2 years.",
            "Dr. Pedro Santos has LET certification and Civil Service eligibility."
        ]
    
    print("\nTesting the model:")
    print("=" * 50)
    
    for text in test_texts:
        doc = nlp(text)
        print(f"\nText: {text}")
        print("Entities found:")
        for ent in doc.ents:
            print(f"  {ent.text} -> {ent.label_}")

def save_model(nlp, output_dir="filipino_resume_ner_model"):
    """Save the trained model"""
    output_path = Path(output_dir)
    if not output_path.exists():
        output_path.mkdir()
    
    nlp.to_disk(output_path)
    print(f"Model saved to {output_path}")
    return output_path

def load_model(model_path="filipino_resume_ner_model"):
    """Load a saved model"""
    nlp = spacy.load(model_path)
    print(f"Model loaded from {model_path}")
    return nlp

def evaluate_model(nlp):
    """Evaluate model performance"""
    print("\nEvaluating model performance...")
    
    # Create test examples
    test_examples = []
    for text, annotations in TRAINING_DATA[:5]:  # Use first 5 for evaluation
        doc = nlp.make_doc(text)
        example = Example.from_dict(doc, annotations)
        test_examples.append(example)
    
    # Get scores
    scores = nlp.evaluate(test_examples)
    
    print(f"Precision: {scores['ents_p']:.3f}")
    print(f"Recall: {scores['ents_r']:.3f}")
    print(f"F1-Score: {scores['ents_f']:.3f}")
    
    return scores

def main():
    """Main training function"""
    print("Filipino Resume NER Model Training")
    print("=" * 40)
    
    # Train the model
    trained_model = train_ner_model()
    
    # Test the model
    test_model(trained_model)
    
    # Evaluate the model
    evaluate_model(trained_model)
    
    # Save the model
    model_path = save_model(trained_model)
    
    print(f"\nTraining complete! Model saved to: {model_path}")
    print("To use the model in your application:")
    print(f"nlp = spacy.load('{model_path}')")

if __name__ == "__main__":
    main()
