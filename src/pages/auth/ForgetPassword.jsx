import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../utils/firebaseConfig";
import { Link } from "react-router-dom";

const ForgetPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    try {
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/reset-password`,
        handleCodeInApp: false, // keep this false if using Firebase's default UI
      });
      setMessage(
        "Check your inbox! A password reset email has been sent. The link is valid for a limited time."
      );
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("No user found with this email.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError("Failed to send reset email: " + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form
        onSubmit={handleReset}
        className="bg-white p-8 w-full max-w-md shadow-md rounded"
      >
        <h2 className="text-xl font-bold text-center mb-6 tracking-widest">
          RESET PASSWORD
        </h2>

        <input
          type="email"
          placeholder="Enter your email"
          required
          className="w-full border border-gray-300 px-4 py-2 rounded mb-4"
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-gray-700 text-white py-2 font-semibold tracking-wider hover:opacity-90"
        >
          SEND RESET LINK
        </button>

        {message && <p className="text-green-600 text-sm mt-4">{message}</p>}
        {error && <p className="text-red-600 text-sm mt-4">{error}</p>}

        <p className="text-xs text-gray-600 mt-6 text-center">
          Remembered your password?{" "}
          <Link
            to="/login"
            className="underline hover:no-underline hover:text-gray-800 transition duration-150"
          >
            Go back to login
          </Link>
        </p>
      </form>
    </div>
  );
};

export default ForgetPassword;
