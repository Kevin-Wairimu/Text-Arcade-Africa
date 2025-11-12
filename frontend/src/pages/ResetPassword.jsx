// src/pages/ResetPassword.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../utils/api";
import { useAlert } from "../context/AlertContext";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return showAlert("Passwords do not match.", "error");
    }

    if (password.length < 6) {
      return showAlert("Password must be at least 6 characters long.", "error");
    }

    setLoading(true);

    try {
      const { data } = await API.post(`/auth/reset-password/${token}`, { password });
      showAlert(data.message, "success");
      setSuccess(true);

      // Redirect to login after 2 seconds
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        (err.request ? "Network error. Please try again." : "Something went wrong.");
      showAlert(errorMessage, "error");
      setLoading(false);
    }
  };

  const inputClass =
    "w-full p-3 rounded-lg border border-white/30 bg-white/30 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-taa-accent focus:outline-none disabled:opacity-50";

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-taa-primary/20 via-taa-accent/10 to-emerald-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md p-10 rounded-2xl border border-white/30 bg-white/20 backdrop-blur-lg shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
      >
        {!success ? (
          <>
            <h1 className="text-3xl font-bold text-center text-taa-primary mb-2">
              Reset Password
            </h1>
            <p className="text-center text-gray-600 mb-8">
              Enter your new password below.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5" aria-busy={loading}>
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className={inputClass}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className={inputClass}
              />

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-taa-primary to-taa-accent text-white py-3 rounded-lg font-semibold shadow-md hover:opacity-90 transition disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </motion.button>
            </form>
          </>
        ) : (
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold text-taa-primary mb-4">
              Password Reset Successful!
            </h2>
            <p className="text-gray-700 mb-6">
              Your password has been updated. You will be redirected to the login page shortly.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/login")}
              className="px-6 py-3 bg-[#2E7D32] text-white rounded-lg font-semibold shadow-md hover:bg-[#81C784] transition"
            >
              Go to Login
            </motion.button>
          </div>
        )}
      </motion.div>
    </main>
  );
}
