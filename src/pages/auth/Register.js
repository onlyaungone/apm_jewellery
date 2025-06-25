import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider, db } from "../../utils/firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "user",
    password: "",
    confirmPassword: "",
    newsletter: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "password") setPasswordStrength(getStrength(value));
  };

  const getStrength = (password) => {
    if (password.length < 6) return "Weak";
    if (/[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && password.length >= 8)
      return "Strong";
    return "Medium";
  };

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case "Weak":
        return "bg-red-500 w-1/3";
      case "Medium":
        return "bg-yellow-400 w-2/3";
      case "Strong":
        return "bg-green-500 w-full";
      default:
        return "bg-gray-200 w-0";
    }
  };

  const passwordsMatch = formData.password === formData.confirmPassword;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!passwordsMatch) {
      alert("Passwords do not match");
      return;
    }

    try {
      const userCred = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await setDoc(doc(db, "users", userCred.user.uid), {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        newsletter: formData.newsletter,
        createdAt: serverTimestamp(),
      });

      // Safely show alert and then navigate
      setTimeout(() => {
        alert("Register successful!");
        navigate("/login");
      }, 100);
    } catch (err) {
      if (err.code === "auth/email-already-in-use") {
        alert("This email is already registered. Please log in instead.");
        navigate("/login");
      } else {
        alert(err.message);
      }
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ")[1] || "",
        email: user.email,
        newsletter: true,
      });

      alert("Google sign-in successful!");
      navigate("/");
    } catch (error) {
      alert("Google sign-in failed: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <form onSubmit={handleRegister} className="bg-white p-8 w-full max-w-md shadow-md rounded">
        <h2 className="text-xl font-bold text-center mb-6 tracking-widest">CREATE ACCOUNT</h2>

        <div className="space-y-3">
          <input type="text" name="firstName" placeholder="First Name *" required className="w-full border border-gray-300 px-4 py-2 rounded" onChange={handleChange} />
          <input type="text" name="lastName" placeholder="Last Name *" required className="w-full border border-gray-300 px-4 py-2 rounded" onChange={handleChange} />
          <input type="email" name="email" placeholder="Email *" required className="w-full border border-gray-300 px-4 py-2 rounded" onChange={handleChange} />

          {/* Password Field */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password *"
              required
              className="w-full border border-gray-300 px-4 py-2 rounded pr-10"
              onChange={handleChange}
            />
            <span onClick={() => setShowPassword((prev) => !prev)} className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500">
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </span>
          </div>

          {/* Strength Meter */}
          <div className="h-2 rounded bg-gray-200">
            <div className={`h-2 rounded transition-all duration-300 ${getStrengthColor()}`}></div>
          </div>
          <p className="text-xs text-gray-500">Strength: <strong>{passwordStrength}</strong></p>

          {/* Confirm Password Field */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password *"
              required
              className="w-full border border-gray-300 px-4 py-2 rounded pr-10"
              onChange={handleChange}
            />
            <span onClick={() => setShowConfirmPassword((prev) => !prev)} className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500" />
          </div>

          {/* Newsletter */}
          <label className="flex items-start text-sm gap-2 mt-2">
            <input type="checkbox" name="newsletter" checked={formData.newsletter} onChange={handleChange} className="mt-1" />
            <span>
              Yes, sign me up for the APM Newsletter. I confirm I am over 16 years old and want to receive email/SMS offers.
            </span>
          </label>
        </div>

        <button type="submit" className="w-full mt-6 bg-black text-white py-2 font-semibold tracking-wider hover:opacity-90">
          SUBMIT
        </button>

        <div className="mt-6 space-y-2">
          <button
            type="button"
            onClick={handleGoogleSignUp}
            className="w-full border border-gray-300 py-2 flex items-center justify-center gap-2 hover:bg-gray-100"
          >
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="google" className="h-5" />
            Sign in with Google
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-4 text-center">
          By creating an account, you agree to our <span className="underline">Privacy Policy</span>.
        </p>

        <p className="text-xs text-gray-600 mt-4 text-center">
          Already got an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="underline cursor-pointer hover:no-underline hover:text-gray-800 transition duration-150"
          >
            Log in here
          </span>
        </p>
      </form>
    </div>
  );
};

export default Register;
