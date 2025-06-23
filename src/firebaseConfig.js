// src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // ✅ Add Firestore

const firebaseConfig = {
  apiKey: "AIzaSyD8wSL1cr6AC0R2YjIapbJ-5PL5ZMKS7ss",
  authDomain: "apm-jewellery-db.firebaseapp.com",
  projectId: "apm-jewellery-db",
  storageBucket: "apm-jewellery-db.firebasestorage.app",
  messagingSenderId: "362911525390",
  appId: "1:362911525390:web:59d792b7445733cb97aa5f",
  measurementId: "G-RWVYL41VGM"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app); // ✅ Initialize Firestore with the same app

export { auth, googleProvider, db }; // ✅ Export it
