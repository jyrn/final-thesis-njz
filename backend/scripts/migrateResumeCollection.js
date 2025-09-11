const mongoose = require('mongoose');
const Resume = require('../models/Resume');
require('dotenv').config();

async function migrateResumeCollection() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all resume records that might have old parsedData structure
    const resumesWithParsedData = await Resume.find({
      parsedData: { $exists: true }
    });

    console.log(`Found ${resumesWithParsedData.length} resumes with old parsedData structure`);

    let migratedCount = 0;
    
    for (const resume of resumesWithParsedData) {
      try {
        // Extract text from parsedData if it exists
        let extractedText = '';
        
        if (resume.parsedData) {
          // Convert structured data back to text format for extractedText field
          const parts = [];
          
          if (resume.parsedData.personalInfo) {
            const info = resume.parsedData.personalInfo;
            if (info.name) parts.push(`Name: ${info.name}`);
            if (info.email) parts.push(`Email: ${info.email}`);
            if (info.phone) parts.push(`Phone: ${info.phone}`);
            if (info.address) parts.push(`Address: ${info.address}`);
          }
          
          if (resume.parsedData.summary) {
            parts.push(`Summary: ${resume.parsedData.summary}`);
          }
          
          if (resume.parsedData.skills && resume.parsedData.skills.length > 0) {
            parts.push(`Skills: ${resume.parsedData.skills.join(', ')}`);
          }
          
          if (resume.parsedData.experience && resume.parsedData.experience.length > 0) {
            parts.push('Experience:');
            resume.parsedData.experience.forEach(exp => {
              parts.push(`- ${exp.position} at ${exp.company} (${exp.duration})`);
              if (exp.description) parts.push(`  ${exp.description}`);
            });
          }
          
          if (resume.parsedData.education && resume.parsedData.education.length > 0) {
            parts.push('Education:');
            resume.parsedData.education.forEach(edu => {
              parts.push(`- ${edu.degree} from ${edu.institution} (${edu.year})`);
            });
          }
          
          if (resume.parsedData.certifications && resume.parsedData.certifications.length > 0) {
            parts.push(`Certifications: ${resume.parsedData.certifications.join(', ')}`);
          }
          
          extractedText = parts.join('\n');
        }

        // Update the resume record
        await Resume.updateOne(
          { _id: resume._id },
          {
            $set: {
              extractedText: extractedText
            },
            $unset: {
              parsedData: 1  // Remove the old parsedData field
            }
          }
        );

        migratedCount++;
        console.log(`✅ Migrated resume ${resume._id} (${resume.filename})`);
        
      } catch (error) {
        console.error(`❌ Error migrating resume ${resume._id}:`, error.message);
      }
    }

    console.log(`\n🎉 Migration completed! Migrated ${migratedCount} out of ${resumesWithParsedData.length} resumes`);
    
    // Verify the migration
    const remainingWithParsedData = await Resume.countDocuments({
      parsedData: { $exists: true }
    });
    
    const withExtractedText = await Resume.countDocuments({
      extractedText: { $exists: true, $ne: '' }
    });
    
    console.log(`\n📊 Post-migration stats:`);
    console.log(`   - Resumes with old parsedData: ${remainingWithParsedData}`);
    console.log(`   - Resumes with extractedText: ${withExtractedText}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the migration
if (require.main === module) {
  migrateResumeCollection()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = migrateResumeCollection;
