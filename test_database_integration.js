#!/usr/bin/env node
/**
 * Test script to verify end-to-end resume parsing and database storage
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const nerService = require('./backend/services/nerService');
const ParsedResume = require('./backend/models/ParsedResume');
const Resume = require('./backend/models/Resume');

// Test configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/thesis_db';
const TEST_USER_ID = 'test_user_123';

async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return false;
  }
}

async function testNERServiceHealth() {
  console.log('\n🔍 Testing NER Service Health...');
  const isHealthy = await nerService.healthCheck();
  if (isHealthy) {
    console.log('✅ NER Service is healthy');
    return true;
  } else {
    console.log('❌ NER Service is not responding');
    return false;
  }
}

async function testTextParsing() {
  console.log('\n📄 Testing Text Parsing...');
  
  const testResumeText = `Maria Santos dela Cruz
Email: maria.santos@gmail.com
Phone: +639171234567
Address: 123 Rizal Street, Quezon City, Metro Manila, Philippines

OBJECTIVE
Seeking a challenging position as a Senior Software Developer

EDUCATION
Bachelor of Science in Computer Science
University of the Philippines Diliman
Graduated: 2018
Magna Cum Laude

WORK EXPERIENCE
Senior Software Developer
Tech Solutions Philippines Inc.
January 2021 - Present
• Developed web applications using React and Node.js
• Led a team of 3 junior developers

Software Developer
Digital Innovations Corp
June 2019 - December 2020
• Built mobile applications using React Native
• Worked with MySQL and PostgreSQL databases

TECHNICAL SKILLS
JavaScript, Python, React, Node.js, MongoDB, MySQL, Git, Docker, AWS`;

  try {
    const result = await nerService.parseResumeText(testResumeText);
    
    if (result.success) {
      console.log('✅ Text parsing successful');
      console.log(`📊 Data structure:`, {
        personalInfo: !!result.data.personalInfo,
        education: Array.isArray(result.data.education) ? result.data.education.length : 'Not array',
        experience: Array.isArray(result.data.experience) ? result.data.experience.length : 'Not array',
        skills: Array.isArray(result.data.skills) ? result.data.skills.length : 'Not array',
        experienceLevel: result.data.experienceLevel,
        industryTags: result.data.industryTags
      });
      return result.data;
    } else {
      console.log('❌ Text parsing failed:', result.error);
      return null;
    }
  } catch (error) {
    console.log('❌ Text parsing error:', error.message);
    return null;
  }
}

async function testDatabaseSave(parsedData) {
  console.log('\n💾 Testing Database Save...');
  
  try {
    // Create a test resume record first
    const testResume = new Resume({
      userId: TEST_USER_ID,
      filename: 'test_resume.pdf',
      originalName: 'Maria Santos Resume.pdf',
      filePath: '/test/path/resume.pdf',
      fileSize: 1024,
      uploadedAt: new Date(),
      processingStatus: 'processing'
    });
    
    const savedResume = await testResume.save();
    console.log('✅ Test resume record created:', savedResume._id);
    
    // Extract industry tags and experience level
    const industryTags = nerService.extractIndustryTags(parsedData);
    const experienceLevel = nerService.determineExperienceLevel(parsedData);
    
    console.log('🔍 Extracted metadata:', {
      industryTags,
      experienceLevel
    });
    
    // Create parsed resume data
    const parsedResumeData = {
      userId: TEST_USER_ID,
      resumeId: savedResume._id,
      personalInfo: parsedData.personalInfo,
      education: parsedData.education || [],
      experience: parsedData.experience || [],
      skills: parsedData.skills || [],
      extractedText: parsedData.extractedText,
      parsingMetadata: {
        entityCount: 0,
        parsedAt: new Date(),
        nerModelVersion: '1.0',
        confidence: 0.85
      },
      industryTags: parsedData.industryTags || industryTags,
      experienceLevel: parsedData.experienceLevel || experienceLevel
    };
    
    // Save to ParsedResume collection
    const parsedResume = new ParsedResume(parsedResumeData);
    const savedParsedResume = await parsedResume.save();
    
    console.log('✅ Parsed resume saved to database');
    console.log('📋 Saved data summary:', {
      id: savedParsedResume._id,
      userId: savedParsedResume.userId,
      personalInfo: {
        name: savedParsedResume.personalInfo?.name,
        email: savedParsedResume.personalInfo?.email
      },
      educationCount: savedParsedResume.education?.length || 0,
      experienceCount: savedParsedResume.experience?.length || 0,
      skillsCount: savedParsedResume.skills?.length || 0,
      experienceLevel: savedParsedResume.experienceLevel,
      industryTags: savedParsedResume.industryTags
    });
    
    // Update the original resume record
    await Resume.findByIdAndUpdate(savedResume._id, {
      processingStatus: 'completed',
      processedAt: new Date(),
      parsedData: {
        personalInfo: parsedData.personalInfo,
        education: parsedData.education || [],
        experience: parsedData.experience || [],
        skills: parsedData.skills || [],
        experienceLevel: parsedData.experienceLevel || experienceLevel,
        industryTags: parsedData.industryTags || industryTags,
        entityCount: 0
      }
    });
    
    console.log('✅ Resume record updated with parsed data');
    
    return {
      resumeId: savedResume._id,
      parsedResumeId: savedParsedResume._id
    };
    
  } catch (error) {
    console.log('❌ Database save failed:', error.message);
    console.log('Error details:', error);
    return null;
  }
}

async function verifyDatabaseRecords(ids) {
  console.log('\n🔍 Verifying Database Records...');
  
  try {
    // Check ParsedResume collection
    const parsedResumeCount = await ParsedResume.countDocuments({ userId: TEST_USER_ID });
    console.log(`📊 ParsedResume records for test user: ${parsedResumeCount}`);
    
    if (ids && ids.parsedResumeId) {
      const parsedResume = await ParsedResume.findById(ids.parsedResumeId);
      if (parsedResume) {
        console.log('✅ ParsedResume record found in database');
        console.log('📋 Record details:', {
          name: parsedResume.personalInfo?.name,
          email: parsedResume.personalInfo?.email,
          phone: parsedResume.personalInfo?.phone,
          educationEntries: parsedResume.education?.length || 0,
          experienceEntries: parsedResume.experience?.length || 0,
          skills: parsedResume.skills?.length || 0,
          experienceLevel: parsedResume.experienceLevel,
          industryTags: parsedResume.industryTags
        });
      } else {
        console.log('❌ ParsedResume record not found');
      }
    }
    
    // Check Resume collection
    const resumeCount = await Resume.countDocuments({ userId: TEST_USER_ID });
    console.log(`📊 Resume records for test user: ${resumeCount}`);
    
    return true;
  } catch (error) {
    console.log('❌ Database verification failed:', error.message);
    return false;
  }
}

async function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...');
  
  try {
    await ParsedResume.deleteMany({ userId: TEST_USER_ID });
    await Resume.deleteMany({ userId: TEST_USER_ID });
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.log('❌ Cleanup failed:', error.message);
  }
}

async function runFullTest() {
  console.log('🚀 Starting End-to-End Resume Parsing Test');
  console.log('=' * 60);
  
  // Connect to database
  const dbConnected = await connectToDatabase();
  if (!dbConnected) {
    process.exit(1);
  }
  
  // Test NER service health
  const nerHealthy = await testNERServiceHealth();
  if (!nerHealthy) {
    process.exit(1);
  }
  
  // Test text parsing
  const parsedData = await testTextParsing();
  if (!parsedData) {
    process.exit(1);
  }
  
  // Test database save
  const ids = await testDatabaseSave(parsedData);
  if (!ids) {
    process.exit(1);
  }
  
  // Verify database records
  await verifyDatabaseRecords(ids);
  
  // Clean up
  await cleanupTestData();
  
  console.log('\n🎉 End-to-End Test Completed Successfully!');
  console.log('✅ Resume parsing and database storage is working correctly');
  
  await mongoose.disconnect();
  process.exit(0);
}

// Run the test
runFullTest().catch(error => {
  console.error('❌ Test failed:', error);
  process.exit(1);
});
