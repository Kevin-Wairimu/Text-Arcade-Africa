import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../utils/api";
import { useAlert } from "../context/AlertContext"; // Step 1: Import the alert hook

export default function ForgotPassword() {
  const { showAlert } = useAlert(); // Step 2: Use the hook
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 3: Fix the API route by adding the "/api" prefix
      const { data } = await API.post("/api/auth/forgot-password", { email });
      
      // Show themed success alert
      showAlert(data.message || "Password reset link sent!", "success");
      setEmail(""); // Clear the input field on success
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Email not found or server error.";
      // Show themed error alert
      showAlert(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-emerald-50 to-white">
      <div className="bg-white/70 backdrop-blur-md p-10 rounded-2xl shadow-xl w-full max-w-md border border-gray-200">
        <h1 className="text-3xl font-bold text-center text-taa-primary mb-2">
          Forgot Password
        </h1>
        <p className="text-center text-gray-500 mb-8">
          Enter your email to reset your password
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-taa-accent"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-taa-primary hover:bg-taa-accent text-white py-3 rounded-lg transition font-medium disabled:bg-gray-400"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="text-center mt-6 text-sm">
          <Link to="/login" className="text-taa-accent hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}