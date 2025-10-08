import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../utils/api";
import { useAlert } from "../context/AlertContext";

// --- SVG Icon for the "Back to Home" button ---
const HomeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/api/auth/login", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("role", data.user.role);

      showAlert("Welcome back!", "success");

      setTimeout(() => {
        if (data.user.role === "Client") {
          navigate("/client");
        } else {
          navigate("/admin");
        }
      }, 400);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Login failed. Please try again.";
      showAlert(errorMessage, "error");
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-emerald-50 to-white p-4">
      {/* --- "Back to Home" Button --- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Link
          to="/"
          className="absolute top-5 right-5 flex items-center gap-2 text-sm font-medium text-taa-primary bg-white/60 backdrop-blur-md py-2 px-4 rounded-full border border-white/30 hover:bg-white/90 transition"
        >
          <HomeIcon />
          <span>Back to Home</span>
        </Link>
      </motion.div>

      {/* --- Login Card --- */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative bg-white/40 backdrop-blur-2xl p-8 sm:p-10 rounded-2xl shadow-lg w-full max-w-md border border-white/40 overflow-hidden"
      >
        {/* Glass glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-taa-primary/10 via-taa-accent/10 to-transparent rounded-2xl pointer-events-none" />

        <h1 className="text-3xl font-bold text-center text-taa-dark mb-2 relative z-10">
          Welcome Back
        </h1>
        <p className="text-center text-taa-dark/70 mb-8 relative z-10">
          Login to continue your journey at Text Africa Arcade.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 text-left relative z-10"
        >
          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="w-full p-3 rounded-lg bg-emerald-50/30 text-taa-dark placeholder-taa-dark/50 border border-white/20 backdrop-blur-sm focus:bg-white/40 focus:ring-2 focus:ring-taa-accent focus:outline-none transition"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="w-full p-3 rounded-lg bg-emerald-50/30 text-taa-dark placeholder-taa-dark/50 border border-white/20 backdrop-blur-sm focus:bg-white/40 focus:ring-2 focus:ring-taa-accent focus:outline-none transition"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-taa-primary hover:bg-taa-accent text-white py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition disabled:bg-taa-primary/50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 relative z-10">
          <Link
            to="/forgot-password"
            className="text-taa-accent hover:underline font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <p className="mt-4 text-sm text-center text-gray-600 relative z-10">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="text-taa-accent hover:underline font-medium"
          >
            Create one
          </Link>
        </p>
      </motion.div>
    </main>
  );
}
