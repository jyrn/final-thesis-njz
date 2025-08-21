import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA6XWt2265t10GRCmea8NxIaoiaHNR3RRU",
  authDomain: "final-thesis-njz.firebaseapp.com",
  projectId: "final-thesis-njz",
  storageBucket: "final-thesis-njz.firebasestorage.app",
  messagingSenderId: "117958639369",
  appId: "1:117958639369:web:8e358f46c2c3e47f941dd8",
  measurementId: "G-CV2RDBRD4R"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
export default app;