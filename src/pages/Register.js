import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [passwordStrength, setPasswordStrength] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      setPasswordStrength(getStrength(value));
    }
  };

  const getStrength = (password) => {
    if (password.length < 6) return "Weak";
    if (password.match(/[a-z]/) && password.match(/[A-Z]/) && password.match(/\d/) && password.length >= 8)
      return "Strong";
    return "Medium";
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      alert("User registered!");
      navigate("/login");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Register</h2>

      <input
        type="text"
        name="firstName"
        placeholder="First Name"
        required
        onChange={handleChange}
      />

      <input
        type="text"
        name="middleName"
        placeholder="Middle Name (Optional)"
        onChange={handleChange}
      />

      <input
        type="text"
        name="lastName"
        placeholder="Last Name"
        required
        onChange={handleChange}
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        required
        onChange={handleChange}
      />

      <input
        type="password"
        name="password"
        placeholder="Password"
        required
        onChange={handleChange}
      />
      <p>Password strength: <strong>{passwordStrength}</strong></p>

      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm Password"
        required
        onChange={handleChange}
      />

      <button type="submit">Sign Up</button>
    </form>
  );
};

export default Register;
