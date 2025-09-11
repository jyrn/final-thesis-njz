const mongoose = require('mongoose');
const nerService = require('./services/nerService');
const ParsedResume = require('./models/ParsedResume');
const Resume = require('./models/Resume');

async function testDatabaseIntegration() {
  try {
    console.log('🔍 Testing Database Integration...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/thesis_db');
    console.log('✅ Connected to MongoDB');
    
    // Test NER service health
    const isHealthy = await nerService.healthCheck();
    console.log('NER Service Health:', isHealthy ? '✅ Healthy' : '❌ Not responding');
    
    if (!isHealthy) {
      console.log('❌ NER service is not running. Please start it first.');
      return;
    }
    
    // Test text parsing
    const testText = `Maria Santos
Email: maria@email.com
Phone: +639123456789

EDUCATION
Bachelor of Science in Computer Science
University of the Philippines

EXPERIENCE
Software Developer
Tech Company Inc
2021 - Present

SKILLS
JavaScript, Python, React, Node.js`;
    
    console.log('📄 Testing text parsing...');
    const result = await nerService.parseResumeText(testText);
    
    if (result.success) {
      console.log('✅ Parsing successful');
      console.log('📊 Parsed data structure:', {
        personalInfo: !!result.data.personalInfo,
        education: Array.isArray(result.data.education) ? `${result.data.education.length} entries` : 'Not array',
        experience: Array.isArray(result.data.experience) ? `${result.data.experience.length} entries` : 'Not array',
        skills: Array.isArray(result.data.skills) ? `${result.data.skills.length} skills` : 'Not array'
      });
      
      // Test database save
      console.log('💾 Testing database save...');
      
      const testResume = new Resume({
        jobSeekerUid: 'test_user',
        jobSeekerId: new mongoose.Types.ObjectId(),
        filename: 'test.pdf',
        originalName: 'test.pdf',
        fileUrl: 'https://example.com/test.pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
        processingStatus: 'processing'
      });
      
      const savedResume = await testResume.save();
      console.log('✅ Resume record created');
      
      const parsedResumeData = {
        userId: 'test_user',
        resumeId: savedResume._id,
        personalInfo: result.data.personalInfo,
        education: result.data.education || [],
        experience: result.data.experience || [],
        skills: result.data.skills || [],
        extractedText: result.data.extractedText,
        parsingMetadata: {
          entityCount: 0,
          parsedAt: new Date(),
          nerModelVersion: '1.0',
          confidence: 0.85
        },
        industryTags: result.data.industryTags || [],
        experienceLevel: result.data.experienceLevel || 'entry'
      };
      
      const parsedResume = new ParsedResume(parsedResumeData);
      const savedParsedResume = await parsedResume.save();
      
      console.log('✅ ParsedResume saved to database!');
      console.log('📋 Saved record ID:', savedParsedResume._id);
      
      // Verify the record exists
      const count = await ParsedResume.countDocuments({ userId: 'test_user' });
      console.log('📊 ParsedResume records in database:', count);
      
      // Clean up
      await ParsedResume.deleteMany({ userId: 'test_user' });
      await Resume.deleteMany({ userId: 'test_user' });
      console.log('🧹 Test data cleaned up');
      
      console.log('🎉 Database integration test PASSED!');
      
    } else {
      console.log('❌ Parsing failed:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testDatabaseIntegration();
