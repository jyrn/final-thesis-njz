# AI-Powered Recruitment App - Backend

This is the backend server for the AI-Powered Recruitment App with Resume Data Extraction and Skills-Based Matching for PESO Lipa.

## 🚀 Features

- **User Authentication**: JWT-based authentication with register/login endpoints
- **User Management**: Complete user CRUD operations with role-based access
- **MongoDB Integration**: Robust database connection with Mongoose ODM
- **Security**: Password hashing with bcrypt, CORS enabled, input validation
- **RESTful API**: Clean and consistent API endpoints

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository** (if not already done)
   ```bash
   cd final-thesis-njz/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy the `.env` file and update the values:
   ```bash
   cp .env.example .env
   ```
   - Update the following variables in `.env`:
     - `MONGODB_URI`: Your MongoDB connection string
     - `JWT_SECRET`: A strong secret key for JWT tokens
     - `PORT`: Server port (default: 5000)

4. **Start the server**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

## 🗄️ Database Setup

### Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/recruitment-app`

### MongoDB Atlas (Cloud)
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update `MONGODB_URI` in `.env`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "applicant"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "applicant",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "applicant",
      "profileCompleted": false,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

#### Get Current User Profile
```http
GET /auth/me
Authorization: Bearer jwt_token_here
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "applicant",
      "profileCompleted": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

## 👥 User Roles

The system supports the following user roles:

- **admin**: Full system access
- **hr_manager**: HR management capabilities
- **recruiter**: Recruitment and hiring functions
- **applicant**: Job applicant (default role)

## 🔒 Security Features

- **Password Hashing**: All passwords are hashed using bcrypt with salt rounds of 12
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive validation for all user inputs
- **CORS Protection**: Cross-origin resource sharing enabled
- **Error Handling**: Proper error responses without exposing sensitive information

## 📁 Project Structure

```
backend/
├── config/
│   └── db.js          # MongoDB connection configuration
├── models/
│   └── User.js        # User model and schema
├── routes/
│   └── auth.js        # Authentication routes
├── .env               # Environment variables
├── index.js           # Main server file
├── package.json       # Dependencies and scripts
└── README.md          # This file
```

## 🧪 Testing the API

You can test the API endpoints using tools like:

- **Postman**
- **Insomnia**
- **cURL**
- **Thunder Client (VS Code extension)**

### Example cURL commands:

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get profile (replace TOKEN with actual JWT token)
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer TOKEN"
```

## 🚨 Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"] // Optional
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized (authentication required)
- `404`: Not Found
- `500`: Internal Server Error

## 🔧 Development

### Adding New Routes
1. Create a new route file in the `routes/` directory
2. Import and use the route in `index.js`
3. Follow the existing pattern for consistency

### Adding New Models
1. Create a new model file in the `models/` directory
2. Define the schema with proper validation
3. Export the model

### Environment Variables
Add new environment variables to `.env` and access them using `process.env.VARIABLE_NAME`.

## 📝 License

This project is part of the final thesis for the AI-Powered Recruitment App.

## 🤝 Contributing

This is a thesis project. For questions or issues, please contact the development team. 