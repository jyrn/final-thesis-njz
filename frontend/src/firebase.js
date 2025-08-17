// src/firebase.js
import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: "AIzaSyA6XWt2265t10GRCmea8NxIaoiaHNR3RRU",
  authDomain: "final-thesis-njz.firebaseapp.com",
  projectId: "final-thesis-njz",
  storageBucket: "final-thesis-njz.firebasestorage.app",
  messagingSenderId: "117958639369",
  appId: "1:117958639369:web:8e358f46c2c3e47f941dd8",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
