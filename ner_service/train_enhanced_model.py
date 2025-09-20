"""
Enhanced NER Model Training Script for Filipino Resume Parsing
Trains a custom spaCy NER model using the comprehensive training dataset
"""

import json
import spacy
import random
from spacy.training import Example
from spacy.util import minibatch, compounding
import pickle
from pathlib import Path
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EnhancedNERTrainer:
    def __init__(self):
        self.nlp = None
        self.ner = None
        
    def load_training_data(self, file_path: str):
        """Load training data from JSON file"""
        logger.info(f"📂 Loading training data from {file_path}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        logger.info(f"✅ Loaded {len(data)} training examples")
        return data
    
    def prepare_training_data(self, raw_data):
        """Convert raw data to spaCy training format"""
        logger.info("🔄 Preparing training data for spaCy...")
        
        training_data = []
        
        for example in raw_data:
            text = example['text']
            entities = example['entities']
            
            # Validate and fix overlapping entities
            valid_entities = []
            entities.sort(key=lambda x: x[0])  # Sort by start position
            
            for i, entity in enumerate(entities):
                start, end, label = entity
                
                # Check for overlaps with previous entities
                is_valid = True
                for prev_entity in valid_entities:
                    prev_start, prev_end, _ = prev_entity
                    if (start < prev_end and end > prev_start):  # Overlap detected
                        is_valid = False
                        break
                
                # Only add non-overlapping entities
                if is_valid and start < end and start >= 0 and end <= len(text):
                    valid_entities.append(entity)
            
            # Convert to spaCy format
            annotations = {"entities": valid_entities}
            training_data.append((text, annotations))
        
        logger.info(f"✅ Prepared {len(training_data)} training examples")
        return training_data
    
    def create_model(self):
        """Create a new spaCy model with NER pipeline"""
        logger.info("🏗️ Creating new spaCy model...")
        
        # Create blank English model
        self.nlp = spacy.blank("en")
        
        # Add NER pipeline
        self.ner = self.nlp.add_pipe("ner")
        
        # Define entity labels
        labels = [
            "PERSON", "EMAIL", "PHONE", "SKILL", "JOB_TITLE", 
            "ORGANIZATION", "DEGREE", "CERTIFICATION", "DATE", "LOCATION"
        ]
        
        # Add labels to NER
        for label in labels:
            self.ner.add_label(label)
        
        logger.info(f"✅ Created model with {len(labels)} entity labels")
        return self.nlp
    
    def train_model(self, training_data, n_iter=100, batch_size=4):
        """Train the NER model"""
        logger.info(f"🚀 Starting training for {n_iter} iterations...")
        
        # Create training examples
        examples = []
        for text, annotations in training_data:
            doc = self.nlp.make_doc(text)
            example = Example.from_dict(doc, annotations)
            examples.append(example)
        
        # Initialize the model
        self.nlp.initialize(lambda: examples)
        
        # Training loop
        losses = {}
        for iteration in range(n_iter):
            random.shuffle(examples)
            
            # Create batches
            batches = minibatch(examples, size=compounding(4.0, 32.0, 1.001))
            
            for batch in batches:
                self.nlp.update(batch, losses=losses)
            
            # Log progress
            if iteration % 10 == 0:
                logger.info(f"Iteration {iteration}: Loss = {losses.get('ner', 0):.4f}")
        
        logger.info(f"✅ Training completed! Final loss: {losses.get('ner', 0):.4f}")
        return losses
    
    def evaluate_model(self, test_data):
        """Evaluate model performance"""
        logger.info("📊 Evaluating model performance...")
        
        correct = 0
        total = 0
        
        for text, annotations in test_data[:50]:  # Test on first 50 examples
            doc = self.nlp(text)
            predicted_entities = [(ent.start_char, ent.end_char, ent.label_) for ent in doc.ents]
            actual_entities = annotations['entities']
            
            for entity in actual_entities:
                total += 1
                if entity in predicted_entities:
                    correct += 1
        
        accuracy = correct / total if total > 0 else 0
        logger.info(f"📈 Model accuracy: {accuracy:.2%} ({correct}/{total})")
        return accuracy
    
    def save_model(self, output_dir="enhanced_filipino_resume_ner_model"):
        """Save the trained model"""
        logger.info(f"💾 Saving model to {output_dir}")
        
        output_path = Path(output_dir)
        if not output_path.exists():
            output_path.mkdir()
        
        self.nlp.to_disk(output_path)
        logger.info(f"✅ Model saved to {output_path}")
        
        return output_path
    
    def test_model_extraction(self, sample_text):
        """Test the model on sample text"""
        logger.info("🧪 Testing model extraction...")
        
        doc = self.nlp(sample_text)
        
        print(f"\nSample text: {sample_text[:200]}...")
        print("\nExtracted entities:")
        
        entities_by_type = {}
        for ent in doc.ents:
            if ent.label_ not in entities_by_type:
                entities_by_type[ent.label_] = []
            entities_by_type[ent.label_].append(ent.text)
        
        for label, entities in entities_by_type.items():
            print(f"  {label}: {entities}")
        
        return entities_by_type

def main():
    trainer = EnhancedNERTrainer()
    
    # Load training data
    training_file = "filipino_resume_training_data_500.json"
    raw_data = trainer.load_training_data(training_file)
    
    # Prepare data
    training_data = trainer.prepare_training_data(raw_data)
    
    # Split data (80% train, 20% test)
    split_idx = int(len(training_data) * 0.8)
    train_data = training_data[:split_idx]
    test_data = training_data[split_idx:]
    
    logger.info(f"📊 Training set: {len(train_data)} examples")
    logger.info(f"📊 Test set: {len(test_data)} examples")
    
    # Create and train model
    trainer.create_model()
    losses = trainer.train_model(train_data, n_iter=50)
    
    # Evaluate model
    accuracy = trainer.evaluate_model(test_data)
    
    # Save model
    model_path = trainer.save_model()
    
    # Test on sample
    sample_resume = """
    Maria Santos
    Email: maria.santos@gmail.com
    Phone: +63 9171234567
    
    SKILLS
    Python, JavaScript, React, Node.js, MySQL, AWS
    
    WORK EXPERIENCE
    Senior Software Developer
    Accenture Philippines
    2020 - Present
    • Developed web applications using React and Node.js
    
    EDUCATION
    Bachelor of Science in Computer Science
    University of the Philippines
    Graduated: 2019
    
    CERTIFICATIONS
    • AWS Certified Solutions Architect
    """
    
    trainer.test_model_extraction(sample_resume)
    
    print(f"\n🎉 Training completed successfully!")
    print(f"📊 Final accuracy: {accuracy:.2%}")
    print(f"💾 Model saved to: {model_path}")

if __name__ == "__main__":
    main()
