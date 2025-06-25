import React, { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, googleProvider, db } from "../../utils/firebaseConfig";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user's role from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const role = userData.role;

        alert("Login successful!");

        if (role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        alert("User data not found in Firestore.");
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Fetch role from Firestore
      const userDocRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const role = userSnap.data().role;

        if (role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        alert("User data not found.");
      }
    } catch (error) {
      console.error("Google sign-in error:", error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 w-full max-w-md shadow-md rounded"
      >
        <h2 className="text-xl font-bold text-center mb-6 tracking-widest">
          SIGN IN
        </h2>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email *"
            required
            className="w-full border border-gray-300 px-4 py-2 rounded"
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password *"
            required
            className="w-full border border-gray-300 px-4 py-2 rounded"
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="flex items-center justify-between text-sm text-gray-600">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox" />
              <span>Remember me</span>
            </label>
            <span className="cursor-pointer hover:underline text-blue-600">
              Forgot Password?
            </span>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-700 text-white py-2 mt-2 font-semibold tracking-wider hover:opacity-90"
          >
            SIGN-IN AND CONTINUE
          </button>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full border border-gray-300 flex items-center justify-center gap-2 py-2 hover:bg-gray-100"
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="h-5"
            />
            Sign in with Google
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6 text-center">
          Pandora Jewelry Pty Ltd collects and manages all customer data in
          compliance with Privacy Law and Pandora's{" "}
          <span className="underline cursor-pointer">Privacy Policy</span>.
        </p>

        <p className="text-xs text-gray-600 mt-4 text-center">
          New here?{" "}
          <Link
            to="/register"
            className="underline hover:no-underline hover:text-gray-800 transition duration-150"
          >
            Sign up today!
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
