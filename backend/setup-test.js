/**
 * Setup Test Script
 * Run this script to test your MongoDB and Firebase configuration
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { initializeFirebase, verifyIdToken } = require('./config/firebase');

async function testSetup() {
  console.log('🧪 Testing your setup...\n');

  // Test 1: Check environment variables
  console.log('1️⃣ Checking environment variables...');
  
  const requiredEnvVars = [
    'MONGODB_URI',
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.log('❌ Missing environment variables:', missingVars.join(', '));
    console.log('📝 Please check your .env file and CONFIGURATION_GUIDE.md');
    return;
  }
  
  console.log('✅ All required environment variables are set\n');

  // Test 2: Test MongoDB connection
  console.log('2️⃣ Testing MongoDB connection...');
  
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB connected successfully');
    console.log(`   Host: ${conn.connection.host}`);
    console.log(`   Database: ${conn.connection.name}\n`);
    
    // Disconnect for now
    await mongoose.disconnect();
    
  } catch (error) {
    console.log('❌ MongoDB connection failed:', error.message);
    console.log('📝 Please check your MONGODB_URI in .env file\n');
    return;
  }

  // Test 3: Test Firebase initialization
  console.log('3️⃣ Testing Firebase initialization...');
  
  try {
    const firebaseApp = initializeFirebase();
    console.log('✅ Firebase Admin SDK initialized successfully');
    console.log(`   Project ID: ${process.env.FIREBASE_PROJECT_ID}\n`);
    
  } catch (error) {
    console.log('❌ Firebase initialization failed:', error.message);
    console.log('📝 Please check your Firebase credentials in .env file\n');
    return;
  }

  // Test 4: Test basic API endpoints
  console.log('4️⃣ Testing API endpoints...');
  
  const baseUrl = `http://localhost:${process.env.PORT || 5000}`;
  
  console.log(`   Base URL: ${baseUrl}`);
  console.log(`   Health check: ${baseUrl}/`);
  console.log(`   Firebase auth: ${baseUrl}/api/firebase-auth/verify\n`);

  console.log('🎉 Setup test completed successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Start your server: npm run dev');
  console.log('2. Test the API endpoints listed above');
  console.log('3. Create test users in Firebase Console');
  console.log('4. Test authentication with Firebase ID tokens');
  console.log('\n📚 See FIREBASE_SETUP.md for detailed testing instructions');
}

// Run the test
testSetup().catch(console.error); 