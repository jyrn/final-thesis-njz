"""
Super Enhanced NER Model Training Script for Filipino Resume Parsing
Generates 1000+ training examples with improved accuracy for:
- Better certification extraction
- More accurate skill classification  
- Enhanced entity boundary detection
"""

import json
import spacy
import random
from spacy.training import Example
from spacy.util import minibatch, compounding
import pickle
from pathlib import Path
import logging
from comprehensive_training_data import FilipinoresumeTrainingDataGenerator

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SuperEnhancedNERTrainer:
    def __init__(self):
        self.generator = FilipinoresumeTrainingDataGenerator()
        self.model_name = "super_enhanced_model"
        
    def generate_comprehensive_training_data(self, num_examples=1000):
        """Generate comprehensive training data with focus on accuracy"""
        logger.info(f"🎯 Generating {num_examples} comprehensive training examples...")
        
        training_data = []
        
        for i in range(num_examples):
            if i % 100 == 0:
                logger.info(f"📊 Generated {i}/{num_examples} examples")
            
            try:
                example = self.generator.generate_training_example()
                training_data.append(example)
            except Exception as e:
                logger.warning(f"⚠️ Failed to generate example {i}: {e}")
                continue
        
        logger.info(f"✅ Generated {len(training_data)} training examples")
        
        # Save training data for inspection
        with open('super_enhanced_training_data.json', 'w', encoding='utf-8') as f:
            json.dump(training_data, f, indent=2, ensure_ascii=False)
        
        return training_data
    
    def prepare_training_data(self, raw_data):
        """Convert raw data to spaCy training format with enhanced validation"""
        logger.info("🔄 Preparing training data for spaCy...")
        
        training_data = []
        skipped = 0
        
        for example in raw_data:
            try:
                text = example['text']
                entities = example['entities']
                
                # Enhanced validation and fixing
                validated_entities = self.validate_and_fix_entities(text, entities)
                
                if validated_entities:
                    training_data.append((text, {"entities": validated_entities}))
                else:
                    skipped += 1
                    
            except Exception as e:
                logger.warning(f"⚠️ Skipping invalid example: {e}")
                skipped += 1
                continue
        
        logger.info(f"✅ Prepared {len(training_data)} training examples (skipped {skipped})")
        return training_data
    
    def validate_and_fix_entities(self, text, entities):
        """Enhanced entity validation and fixing"""
        validated = []
        text_len = len(text)
        
        # Sort entities by start position
        entities.sort(key=lambda x: x[0])
        
        for start, end, label in entities:
            # Basic validation
            if start < 0 or end > text_len or start >= end:
                continue
            
            # Check for overlaps with previous entities
            if validated and start < validated[-1][1]:
                # Handle overlap by adjusting boundaries
                prev_start, prev_end, prev_label = validated[-1]
                
                # If current entity starts before previous ends, adjust
                if start < prev_end:
                    if end <= prev_end:
                        # Current entity is completely inside previous, skip
                        continue
                    else:
                        # Adjust start to avoid overlap
                        start = prev_end
                        if start >= end:
                            continue
            
            # Validate entity text
            entity_text = text[start:end]
            if not entity_text.strip():
                continue
            
            # Enhanced label validation
            if self.is_valid_entity(entity_text, label):
                validated.append((start, end, label))
        
        return validated
    
    def is_valid_entity(self, entity_text, label):
        """Enhanced entity validation based on content and label"""
        entity_text = entity_text.strip()
        
        if not entity_text:
            return False
        
        # Label-specific validation
        if label == 'PERSON':
            # Names should be 2-4 words, mostly alphabetic
            words = entity_text.split()
            if len(words) < 2 or len(words) > 4:
                return False
            return all(word.replace('.', '').isalpha() for word in words)
        
        elif label == 'EMAIL':
            # Basic email validation
            return '@' in entity_text and '.' in entity_text.split('@')[-1]
        
        elif label == 'PHONE':
            # Phone should contain digits
            return any(c.isdigit() for c in entity_text)
        
        elif label == 'SKILL':
            # Skills should not be too long or contain certain words
            if len(entity_text) > 50:
                return False
            
            # Avoid common non-skill phrases
            avoid_phrases = [
                'years of experience', 'experience in', 'worked with', 'responsible for',
                'developed', 'created', 'built', 'managed', 'led', 'coordinated'
            ]
            entity_lower = entity_text.lower()
            return not any(phrase in entity_lower for phrase in avoid_phrases)
        
        elif label == 'CERTIFICATION':
            # Certifications should be substantial and not too short
            if len(entity_text) < 5:
                return False
            
            # Should contain certification-related keywords
            cert_keywords = [
                'certified', 'certificate', 'certification', 'professional', 'associate',
                'specialist', 'expert', 'foundation', 'advanced', 'master', 'practitioner'
            ]
            entity_lower = entity_text.lower()
            return any(keyword in entity_lower for keyword in cert_keywords)
        
        elif label == 'JOB_TITLE':
            # Job titles should not be too long
            return len(entity_text) <= 100
        
        elif label == 'ORGANIZATION':
            # Organizations should not be too short
            return len(entity_text) >= 3
        
        elif label == 'DEGREE':
            # Degrees should contain degree-related keywords
            degree_keywords = ['bachelor', 'master', 'phd', 'doctorate', 'diploma', 'certificate', 'degree']
            entity_lower = entity_text.lower()
            return any(keyword in entity_lower for keyword in degree_keywords)
        
        return True
    
    def create_model(self):
        """Create a new spaCy model with enhanced configuration"""
        logger.info("🏗️ Creating new spaCy model...")
        
        # Create blank model
        nlp = spacy.blank("en")
        
        # Add NER component with enhanced configuration
        ner = nlp.add_pipe("ner")
        
        # Add enhanced labels
        labels = [
            "PERSON", "EMAIL", "PHONE", "ADDRESS", "SKILL", "JOB_TITLE", 
            "ORGANIZATION", "DEGREE", "CERTIFICATION", "DATE", "LOCATION"
        ]
        
        for label in labels:
            ner.add_label(label)
        
        logger.info(f"✅ Created model with {len(labels)} entity labels")
        return nlp
    
    def train_model(self, training_data, n_iter=100):
        """Train the model with enhanced parameters"""
        logger.info(f"🚀 Training model for {n_iter} iterations...")
        
        nlp = self.create_model()
        
        # Get the NER component
        ner = nlp.get_pipe("ner")
        
        # Convert training data to Example objects
        examples = []
        for text, annotations in training_data:
            doc = nlp.make_doc(text)
            example = Example.from_dict(doc, annotations)
            examples.append(example)
        
        logger.info(f"📚 Training with {len(examples)} examples")
        
        # Training loop with enhanced parameters
        nlp.begin_training()
        
        for iteration in range(n_iter):
            random.shuffle(examples)
            losses = {}
            
            # Use smaller batches for better learning
            batches = minibatch(examples, size=compounding(4.0, 32.0, 1.001))
            
            for batch in batches:
                nlp.update(batch, losses=losses, drop=0.3)
            
            if iteration % 10 == 0:
                logger.info(f"📈 Iteration {iteration}, Loss: {losses.get('ner', 0):.4f}")
        
        logger.info("✅ Training completed!")
        return nlp
    
    def evaluate_model(self, nlp, test_data):
        """Enhanced model evaluation"""
        logger.info("📊 Evaluating model performance...")
        
        total_entities = 0
        correct_entities = 0
        label_stats = {}
        
        for text, annotations in test_data[:50]:  # Evaluate on subset
            doc = nlp(text)
            predicted_entities = [(ent.start_char, ent.end_char, ent.label_) for ent in doc.ents]
            true_entities = annotations["entities"]
            
            total_entities += len(true_entities)
            
            for true_ent in true_entities:
                label = true_ent[2]
                if label not in label_stats:
                    label_stats[label] = {"total": 0, "correct": 0}
                label_stats[label]["total"] += 1
                
                # Check if prediction matches
                if true_ent in predicted_entities:
                    correct_entities += 1
                    label_stats[label]["correct"] += 1
        
        # Calculate metrics
        overall_accuracy = correct_entities / total_entities if total_entities > 0 else 0
        
        logger.info(f"📈 Overall Accuracy: {overall_accuracy:.3f}")
        logger.info("📊 Label-wise Performance:")
        
        for label, stats in label_stats.items():
            accuracy = stats["correct"] / stats["total"] if stats["total"] > 0 else 0
            logger.info(f"   {label}: {accuracy:.3f} ({stats['correct']}/{stats['total']})")
        
        return overall_accuracy
    
    def save_model(self, nlp):
        """Save the trained model"""
        logger.info(f"💾 Saving model as {self.model_name}...")
        
        model_path = Path(self.model_name)
        if model_path.exists():
            import shutil
            shutil.rmtree(model_path)
        
        nlp.to_disk(model_path)
        logger.info(f"✅ Model saved to {model_path}")
    
    def train_complete_model(self):
        """Complete training pipeline"""
        logger.info("🚀 Starting Super Enhanced NER Model Training Pipeline...")
        
        # Generate training data
        raw_data = self.generate_comprehensive_training_data(200)
        
        # Prepare for spaCy
        training_data = self.prepare_training_data(raw_data)
        
        if not training_data:
            logger.error("❌ No valid training data generated!")
            return None
        
        # Split data
        split_idx = int(len(training_data) * 0.8)
        train_data = training_data[:split_idx]
        test_data = training_data[split_idx:]
        
        logger.info(f"📊 Training: {len(train_data)}, Testing: {len(test_data)}")
        
        # Train model
        nlp = self.train_model(train_data, n_iter=100)
        
        # Evaluate
        accuracy = self.evaluate_model(nlp, test_data)
        
        # Save model
        self.save_model(nlp)
        
        logger.info(f"🎉 Super Enhanced Model Training Complete! Final Accuracy: {accuracy:.3f}")
        return nlp

def main():
    """Main training function"""
    trainer = SuperEnhancedNERTrainer()
    model = trainer.train_complete_model()
    
    if model:
        logger.info("✅ Super Enhanced Filipino Resume NER Model training successful!")
        
        # Test the model
        test_text = """
        Juan Dela Cruz
        Email: juan.delacruz@gmail.com
        Phone: +63 917 123 4567
        
        TECHNICAL SKILLS
        Python, JavaScript, React, Node.js, AWS, Docker
        
        CERTIFICATIONS
        • AWS Certified Solutions Architect - Associate
        • Microsoft Azure Fundamentals (AZ-900)
        • Certified Scrum Master (CSM)
        
        WORK EXPERIENCE
        Senior Software Developer
        Accenture Philippines
        2020 - Present
        """
        
        doc = model(test_text)
        logger.info("🧪 Test extraction:")
        for ent in doc.ents:
            logger.info(f"   {ent.text} -> {ent.label_}")
    else:
        logger.error("❌ Model training failed!")

if __name__ == "__main__":
    main()
