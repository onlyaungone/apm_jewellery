import React, { useState, useEffect } from "react";
import {
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "firebase/auth";
import { auth } from "../../utils/firebaseConfig";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [validCode, setValidCode] = useState(false);
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const mode = searchParams.get("mode");
  const oobCode = searchParams.get("oobCode");

  useEffect(() => {
    if (mode !== "resetPassword" || !oobCode) {
      setError("Invalid reset link. Please request a new one.");
      return;
    }

    verifyPasswordResetCode(auth, oobCode)
      .then((email) => {
        setEmail(email);
        setValidCode(true);
      })
      .catch(() => {
        setError("The reset link is invalid or has expired.");
      });
  }, [mode, oobCode]);

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[\W_]/.test(password)) strength += 1;

    if (strength <= 2) return { label: "Weak", color: "bg-red-500", width: "w-1/3" };
    if (strength === 3 || strength === 4) return { label: "Medium", color: "bg-yellow-400", width: "w-2/3" };
    return { label: "Strong", color: "bg-green-500", width: "w-full" };
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError(null);

    const { label } = getPasswordStrength(newPassword);
    if (label === "Weak") {
      setError("Password is too weak. Use a mix of uppercase, lowercase, numbers and symbols.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess("Password has been reset! Redirecting to login...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError("Failed to reset password: " + err.message);
    }
  };

  const { label, color, width } = getPasswordStrength(newPassword);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold text-center mb-4 tracking-widest">
          RESET PASSWORD
        </h2>

        {error && <p className="text-red-600 text-center mb-4">{error}</p>}

        {validCode && !success && (
          <form onSubmit={handleReset} className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Resetting password for <strong>{email}</strong>
            </p>

            {/* New Password */}
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Enter new password"
                required
                className="w-full border border-gray-300 px-4 py-2 rounded pr-10"
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <span
                className="absolute top-2.5 right-3 text-gray-600 cursor-pointer"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </span>
            </div>

            {/* Strength Bar */}
            {newPassword && (
              <div>
                <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                  <div className={`h-2 rounded-full ${color} ${width}`}></div>
                </div>
                <p className="text-sm mt-1 text-gray-700">
                  Strength: <strong>{label}</strong>
                </p>
              </div>
            )}

            {/* Confirm Password */}
            <input
              type="password"
              placeholder="Confirm new password"
              required
              className="w-full border border-gray-300 px-4 py-2 rounded"
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <button
              type="submit"
              className="w-full bg-gray-800 text-white py-2 rounded font-semibold hover:opacity-90"
            >
              RESET PASSWORD
            </button>
          </form>
        )}

        {success && (
          <p className="text-green-600 text-center mt-4">{success}</p>
        )}

        <p className="text-xs text-gray-600 mt-6 text-center">
          Remembered your password?{" "}
          <Link
            to="/login"
            className="text-blue-600 underline hover:no-underline"
          >
            Go back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
