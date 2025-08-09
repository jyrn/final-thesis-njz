# Firebase Authentication Setup Guide

This guide explains how to set up Firebase Authentication for the PESO Lipa AI-powered job matching system.

## 🔧 **Prerequisites**

1. **Firebase Project**: Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. **Node.js Backend**: Ensure your backend is running with the required dependencies

## 📋 **Step-by-Step Setup**

### **1. Create Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or select an existing project
3. Enable Authentication in the Firebase console
4. Add authentication methods (Email/Password, Google, etc.)

### **2. Generate Service Account Key**

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Navigate to **Service accounts** tab
3. Click **Generate new private key**
4. Download the JSON file
5. **Keep this file secure** - it contains sensitive credentials

### **3. Configure Environment Variables**

Create a `.env` file in your backend directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/peso-lipa-recruitment?retryWrites=true&w=majority

# Firebase Configuration
FIREBASE_TYPE=service_account
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id-from-json
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour actual private key from JSON file\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id-from-json
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your-project-id.iam.gserviceaccount.com
```

**Important**: Replace the placeholder values with actual values from your downloaded service account JSON file.

### **4. Install Dependencies**

```bash
cd backend
npm install firebase-admin
```

## 🔐 **Authentication Flow**

### **Client-Side (Frontend)**

1. **User signs in** with Firebase Authentication (email/password, Google, etc.)
2. **Get ID token** from Firebase Auth
3. **Send token** to backend API endpoints

```javascript
// Example: Frontend authentication
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const auth = getAuth();

// Sign in user
const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get ID token
    const idToken = await user.getIdToken();
    
    // Send to backend
    const response = await fetch('/api/firebase-auth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken })
    });
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Authentication error:', error);
  }
};
```

### **Backend Authentication**

1. **Verify ID token** using Firebase Admin SDK
2. **Find or create user** in MongoDB
3. **Attach user data** to request object

## 🛡️ **Protected Routes**

### **Using Firebase Authentication Middleware**

```javascript
const { firebaseAuth, requireRole } = require('../middleware/firebaseAuth');

// Protected route - requires authentication
router.get('/protected', firebaseAuth, (req, res) => {
  // req.user contains authenticated user data
  res.json({ user: req.user });
});

// Role-based protected route
router.get('/admin-only', firebaseAuth, requireRole(['admin']), (req, res) => {
  res.json({ message: 'Admin access granted' });
});

// Optional authentication
router.get('/public', optionalFirebaseAuth, (req, res) => {
  if (req.user) {
    res.json({ user: req.user, authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});
```

## 📡 **API Endpoints**

### **Firebase Authentication Routes**

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| `POST` | `/api/firebase-auth/verify` | Verify Firebase ID token | Public |
| `GET` | `/api/firebase-auth/me` | Get current user profile | Private |
| `PUT` | `/api/firebase-auth/update-role` | Update user role | Admin only |
| `POST` | `/api/firebase-auth/create-custom-token` | Create custom token | Admin only |

### **Request Headers**

For protected routes, include the Firebase ID token in the Authorization header:

```
Authorization: Bearer <firebase-id-token>
```

## 🔄 **Migration from JWT**

The system now uses Firebase Authentication exclusively:

- **Firebase routes**: `/api/firebase-auth/*` (recommended)
- **No JWT dependencies** - cleaner codebase

### **User Schema Updates**

The User schema now includes a `firebaseUid` field to link Firebase users with MongoDB users:

```javascript
{
  name: String,
  email: String,
  password: String, // Not used with Firebase
  role: String,
  firebaseUid: String, // New field
  createdAt: Date,
  updatedAt: Date
}
```

## 🧪 **Testing**

### **1. Test Firebase Connection**

```bash
# Start the server
npm run dev

# Check console for Firebase initialization message
✅ Firebase Admin SDK initialized successfully
```

### **2. Test Authentication**

```bash
# Test token verification
curl -X POST http://localhost:5000/api/firebase-auth/verify \
  -H "Content-Type: application/json" \
  -d '{"idToken": "your-firebase-id-token"}'
```

### **3. Test Protected Routes**

```bash
# Test protected endpoint
curl -X GET http://localhost:5000/api/firebase-auth/me \
  -H "Authorization: Bearer your-firebase-id-token"
```

## 🔒 **Security Best Practices**

1. **Environment Variables**: Never commit `.env` files to version control
2. **Service Account**: Keep Firebase service account key secure
3. **Token Validation**: Always verify Firebase ID tokens on the backend
4. **Role-Based Access**: Use role middleware for sensitive operations
5. **Error Handling**: Implement proper error handling for authentication failures

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Firebase initialization error**
   - Check environment variables
   - Verify service account key format
   - Ensure project ID is correct

2. **Token verification fails**
   - Check if token is expired
   - Verify token format
   - Ensure Firebase project is properly configured

3. **User not found**
   - Check if user exists in Firebase
   - Verify email matching between Firebase and MongoDB

### **Debug Mode**

Enable debug logging by setting:

```env
NODE_ENV=development
```

This will show detailed error messages and Firebase initialization logs.

## 📚 **Additional Resources**

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firebase Authentication Guide](https://firebase.google.com/docs/auth)
- [Node.js Firebase Admin SDK](https://firebase.google.com/docs/admin/setup#node.js) 