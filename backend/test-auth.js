/**
 * Test script for Firebase + MongoDB authentication endpoints
 * Run this after starting the server to test the auth functionality
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
const testData = {
  // You'll need to replace this with a real Firebase ID token from your frontend
  idToken: 'YOUR_FIREBASE_ID_TOKEN_HERE',
  fullName: 'Test User',
  role: 'job_seeker',
  additionalData: {
    skills: ['JavaScript', 'Node.js'],
    location: 'Manila, Philippines',
    phoneNumber: '+63123456789'
  }
};

async function testRegistration() {
  try {
    console.log('🧪 Testing Registration...');
    
    const response = await axios.post(`${BASE_URL}/auth/register`, {
      idToken: testData.idToken,
      fullName: testData.fullName,
      role: testData.role,
      additionalData: testData.additionalData
    });
    
    console.log('✅ Registration successful:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Registration failed:', error.response?.data || error.message);
    return null;
  }
}

async function testLogin() {
  try {
    console.log('🧪 Testing Login...');
    
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      idToken: testData.idToken
    });
    
    console.log('✅ Login successful:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return null;
  }
}

async function testGetProfile(token) {
  try {
    console.log('🧪 Testing Get Profile...');
    
    const response = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Get profile successful:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Get profile failed:', error.response?.data || error.message);
    return null;
  }
}

async function testFirebaseVerify() {
  try {
    console.log('🧪 Testing Firebase Verify...');
    
    const response = await axios.post(`${BASE_URL}/firebase-auth/verify`, {
      idToken: testData.idToken
    });
    
    console.log('✅ Firebase verify successful:', response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Firebase verify failed:', error.response?.data || error.message);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting Authentication Tests...\n');
  
  if (testData.idToken === 'YOUR_FIREBASE_ID_TOKEN_HERE') {
    console.log('⚠️  Please replace YOUR_FIREBASE_ID_TOKEN_HERE with a real Firebase ID token');
    console.log('   You can get this from your frontend after Firebase authentication');
    return;
  }
  
  // Test registration
  const registrationResult = await testRegistration();
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test login
  const loginResult = await testLogin();
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test get profile (using the same token)
  if (testData.idToken) {
    await testGetProfile(testData.idToken);
    console.log('\n' + '='.repeat(50) + '\n');
  }
  
  // Test Firebase verify endpoint
  await testFirebaseVerify();
  
  console.log('\n🏁 Tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testRegistration,
  testLogin,
  testGetProfile,
  testFirebaseVerify,
  runTests
};
