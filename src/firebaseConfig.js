// src/firebaseConfig.js

// Import required functions
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // ✅ add this
import { getAnalytics } from "firebase/analytics";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8wSL1cr6AC0R2YjIapbJ-5PL5ZMKS7ss",
  authDomain: "apm-jewellery-db.firebaseapp.com",
  projectId: "apm-jewellery-db",
  storageBucket: "apm-jewellery-db.firebasestorage.app",
  messagingSenderId: "362911525390",
  appId: "1:362911525390:web:59d792b7445733cb97aa5f",
  measurementId: "G-RWVYL41VGM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app); // ✅ add this
const analytics = getAnalytics(app); // optional

// Export the services you need
export { auth }; // ✅ THIS is the fix
