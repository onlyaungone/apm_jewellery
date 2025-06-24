import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const ChangePassword = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("User not logged in.");
      return;
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      alert("New passwords do not match.");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        formData.currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, formData.newPassword);
      alert("Password changed successfully!");
      navigate("/account");
    } catch (error) {
      alert("Password change failed: " + error.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-2">PASSWORD</h1>
      <p className="text-sm text-gray-500 mb-6">Home › My Account › Password</p>

      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        CHANGE PASSWORD
      </h2>

      <div className="space-y-6">
        {/* Current Password */}
        <PasswordInput
          label="Current Password"
          name="currentPassword"
          value={formData.currentPassword}
          onChange={handleChange}
          show={showPassword.current}
          toggle={() => toggleVisibility("current")}
        />

        {/* New Password */}
        <PasswordInput
          label="New Password"
          name="newPassword"
          value={formData.newPassword}
          onChange={handleChange}
          show={showPassword.new}
          toggle={() => toggleVisibility("new")}
        />

        {/* Confirm Password */}
        <PasswordInput
          label="Confirm New Password"
          name="confirmNewPassword"
          value={formData.confirmNewPassword}
          onChange={handleChange}
          show={showPassword.confirm}
          toggle={() => toggleVisibility("confirm")}
        />
      </div>

      <div className="mt-8 flex gap-4">
        <button
          onClick={() => navigate("/account")}
          className="border border-gray-300 px-6 py-2"
        >
          CANCEL
        </button>
        <button
          onClick={handleSubmit}
          className="bg-gray-800 text-white px-8 py-2 font-semibold"
        >
          SAVE
        </button>
      </div>

      <div className="mt-6 text-sm text-gray-600 underline cursor-pointer" onClick={() => navigate("/account")}>
        ← Back to Account
      </div>
    </div>
  );
};

const PasswordInput = ({ label, name, value, onChange, show, toggle }) => (
  <div className="relative">
    <label className="block text-sm font-medium mb-1">{label} *</label>
    <input
      type={show ? "text" : "password"}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-black"
    />
    <div
      className="absolute right-3 top-9 cursor-pointer text-gray-500"
      onClick={toggle}
    >
      {show ? <FaEye /> : <FaEyeSlash />}
    </div>
  </div>
);

export default ChangePassword;
