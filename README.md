<<<<<<< HEAD
# final-thesis-njz
=======
# Final Thesis Project - Job Portal Application

A comprehensive job portal application built with Next.js frontend and Node.js/Express backend, featuring Firebase authentication and MongoDB database.

## 🏗️ Architecture

### Backend (Node.js/Express)
- **Firebase Admin SDK** for token verification
- **MongoDB** with Mongoose for data persistence
- **Role-based user management** (JobSeeker/Employer)
- **RESTful API** with comprehensive error handling

### Frontend (Next.js/React)
- **Firebase Client SDK** for authentication
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Role-based routing** and components

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- Firebase project with Authentication enabled

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment variables are already configured in `.env`**

4. **Start the server:**
   ```bash
   npm start
   # or for development
   npm run dev
   ```

   Server will run on `http://localhost:3001`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   Frontend will run on `http://localhost:3000`

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /api/auth/create-profile` - Create user profile after Firebase registration
- `GET /api/auth/verify` - Verify Firebase token and return user data
- `GET /api/auth/me` - Get current authenticated user

### User Routes (`/api/users`)
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update current user profile
- `GET /api/users/check/:uid` - Check if user exists
- `GET /api/users/:uid` - Get user by UID (admin)

## 🗄️ Database Models

### User Model
```javascript
{
  uid: String (Firebase UID),
  email: String,
  role: 'jobseeker' | 'employer',
  firstName: String,
  lastName: String,
  middleName: String,
  companyName: String,
  emailVerified: Boolean,
  createdAt: Date
}
```

### JobSeeker Model
```javascript
{
  userId: ObjectId (ref: User),
  uid: String,
  personalInfo: { dateOfBirth, gender, phoneNumber, address },
  professionalInfo: { jobTitle, skills, experience, education },
  preferences: { salary, jobTypes, locations, remoteWork },
  documents: { resumeUrl, portfolioUrl, linkedInUrl }
}
```

### Employer Model
```javascript
{
  userId: ObjectId (ref: User),
  uid: String,
  companyInfo: { name, description, industry, size, website },
  contactInfo: { person, address },
  verification: { businessReg, taxId, documents },
  settings: { credits, subscription, benefits }
}
```

## 🔐 Authentication Flow

1. **Registration:**
   - User registers with Firebase Auth
   - Frontend calls `/api/auth/create-profile` with user data
   - Backend creates User record and role-specific profile (JobSeeker/Employer)

2. **Login:**
   - User signs in with Firebase Auth
   - Frontend gets Firebase ID token
   - All API requests include `Authorization: Bearer <token>` header

3. **Profile Management:**
   - Use `/api/users/profile` endpoints for CRUD operations
   - Role-specific data stored in separate collections

## 🛠️ Development

### Backend Structure
```
backend/
├── config/
│   ├── db.js              # MongoDB connection
│   └── firebase.js        # Firebase Admin SDK setup
├── controllers/
│   ├── authController.js  # Authentication logic
│   └── userController.js  # User management logic
├── middleware/
│   └── authMiddleware.js  # Firebase token verification
├── models/
│   ├── User.js           # Main user model
│   ├── JobSeeker.js      # JobSeeker profile model
│   └── Employer.js       # Employer profile model
├── routes/
│   ├── authRoutes.js     # Auth endpoints
│   └── userRoutes.js     # User endpoints
└── server.js             # Express app setup
```

### Frontend Structure
```
frontend/src/
├── components/           # Reusable UI components
├── config/
│   └── firebase.ts      # Firebase client configuration
├── layouts/             # Page layouts
├── pages/               # Next.js pages
├── services/
│   ├── apiService.ts    # Backend API integration
│   └── firebaseAuthService.ts # Firebase auth wrapper
└── types/               # TypeScript definitions
```

## 🔧 Key Features

- **Secure Authentication:** Firebase ID token verification
- **Role-based Access:** Automatic profile creation based on user role
- **Comprehensive Profiles:** Detailed JobSeeker and Employer models
- **Error Handling:** Robust error handling throughout the application
- **Type Safety:** Full TypeScript support
- **Scalable Architecture:** Modular backend with clean separation of concerns

## 🚨 Important Notes

- Backend runs on port **3001**
- Frontend expects backend at `http://localhost:3001/api`
- All protected endpoints require Firebase authentication
- User profiles are automatically created during registration
- Role-specific data is stored in separate collections for better organization

## 🧪 Testing

Test the API connection:
```bash
curl http://localhost:3001/
# Should return: "API is running..."
```

Test authentication (requires valid Firebase token):
```bash
curl -H "Authorization: Bearer <firebase_token>" http://localhost:3001/api/auth/verify
```
>>>>>>> 249331da1cc042788086661a0e0a7427219e105b
