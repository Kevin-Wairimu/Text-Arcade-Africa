import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../utils/api";
import { useAlert } from "../context/AlertContext";

export default function ForgotPassword() {
  const { showAlert } = useAlert();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await API.post("/auth/forgot-password", { email });
      showAlert(data.message || "Password reset link sent!", "success");
      setEmail("");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Email not found or server error.";
      showAlert(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-taa-primary/20 via-taa-accent/10 to-emerald-50">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md p-10 rounded-2xl border border-white/30 bg-white/20 backdrop-blur-lg shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
      >
        <h1 className="text-3xl font-bold text-center text-taa-primary mb-2">
          Forgot Password
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Enter your email and we’ll send you a reset link.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 rounded-lg border border-white/30 bg-white/30 text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-taa-accent focus:outline-none backdrop-blur-sm"
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-taa-primary to-taa-accent text-white py-3 rounded-lg font-semibold shadow-md hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </motion.button>
        </form>

        <div className="text-center mt-6 text-sm">
          <Link
            to="/login"
            className="text-taa-accent hover:underline font-medium"
          >
            ← Back to Login
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
