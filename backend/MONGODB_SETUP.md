# MongoDB Setup Guide

This guide helps you fix MongoDB connection issues and set up your database properly.

## 🚨 **Current Issues Found:**

### **1. MongoDB URI Format Issue**
Your current MongoDB URI has angle brackets around the password:
```
MONGODB_URI=mongodb+srv://janyrin:<thesis123>@cluster0.q8cca3z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

**Fix:** Remove the angle brackets:
```
MONGODB_URI=mongodb+srv://janyrin:thesis123@cluster0.q8cca3z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### **2. MongoDB Atlas IP Whitelist**
Your current IP address is not whitelisted in MongoDB Atlas.

## 🔧 **Step-by-Step Fixes:**

### **Step 1: Fix MongoDB URI**

Edit your `.env` file and remove the angle brackets from the password:

```env
# Before (incorrect)
MONGODB_URI=mongodb+srv://janyrin:<thesis123>@cluster0.q8cca3z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# After (correct)
MONGODB_URI=mongodb+srv://janyrin:thesis123@cluster0.q8cca3z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### **Step 2: Whitelist Your IP in MongoDB Atlas**

1. **Go to MongoDB Atlas Console**
   - Visit [MongoDB Atlas](https://cloud.mongodb.com/)
   - Sign in to your account

2. **Navigate to Network Access**
   - Click on your project
   - Go to "Network Access" in the left sidebar

3. **Add Your IP Address**
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add your specific IP address

4. **Alternative: Get Your Current IP**
   ```bash
   # Run this command to get your current IP
   curl ifconfig.me
   ```

### **Step 3: Test the Connection**

After making the changes, test your setup:

```bash
npm run setup-test
```

## 🔍 **Troubleshooting:**

### **Common MongoDB Atlas Issues:**

1. **"Could not connect to any servers"**
   - ✅ Check IP whitelist
   - ✅ Verify username/password
   - ✅ Ensure cluster is running

2. **"Authentication failed"**
   - ✅ Check username/password in connection string
   - ✅ Verify database user exists in Atlas

3. **"Network timeout"**
   - ✅ Check internet connection
   - ✅ Verify firewall settings
   - ✅ Try different network

### **MongoDB URI Format:**

**Correct Format:**
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**Components:**
- `username`: Your MongoDB Atlas username
- `password`: Your MongoDB Atlas password (no brackets)
- `cluster`: Your cluster address
- `database`: Database name (optional)

## 🧪 **Testing Commands:**

### **1. Test Setup**
```bash
npm run setup-test
```

### **2. Test Server**
```bash
npm run dev
```

### **3. Test Database Connection**
```bash
# If you have MongoDB Compass, connect to your URI
mongodb+srv://janyrin:thesis123@cluster0.q8cca3z.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

## 📋 **Expected Results:**

After fixing the issues, you should see:

```
🧪 Testing your setup...

1️⃣ Checking environment variables...
✅ All required environment variables are set

2️⃣ Testing MongoDB connection...
✅ MongoDB connected successfully
   Host: cluster0.q8cca3z.mongodb.net
   Database: peso-lipa-recruitment

3️⃣ Testing Firebase initialization...
✅ Firebase Admin SDK initialized successfully

🎉 Setup test completed successfully!
```

## 🚀 **Next Steps:**

1. **Fix the MongoDB URI** (remove angle brackets)
2. **Whitelist your IP** in MongoDB Atlas
3. **Test the connection** with `npm run setup-test`
4. **Start the server** with `npm run dev`

Your MongoDB should work perfectly after these fixes! 🎉 