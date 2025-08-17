// src/firebase.js
import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
<<<<<<< HEAD
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
=======
  apiKey: "AIzaSyA6XWt2265t10GRCmea8NxIaoiaHNR3RRU",
  authDomain: "final-thesis-njz.firebaseapp.com",
  projectId: "final-thesis-njz",
  storageBucket: "final-thesis-njz.firebasestorage.app",
  messagingSenderId: "117958639369",
  appId: "1:117958639369:web:8e358f46c2c3e47f941dd8",
>>>>>>> second-frontend
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
