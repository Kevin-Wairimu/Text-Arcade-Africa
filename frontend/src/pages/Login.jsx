import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../utils/api";
import { useAlert } from "../context/AlertContext";

// --- SVG Icon for the "Back to Home" button ---
const HomeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

export default function Login() {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await API.post("/api/auth/login", form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("role", data.user.role);

      showAlert("Login successful!", "success");

      setTimeout(() => {
        const userRole = data.user.role;
        if (userRole === "Admin" || userRole === "Employee") {
          navigate("/admin");
        } else {
          navigate("/client");
        }
      }, 500);

    } catch (err) {
      const errorMessage = err.response?.data?.message || "Invalid email or password";
      showAlert(errorMessage, "error");
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-emerald-50 to-white p-4">
      
      {/* --- NEW: "Back to Home" Button --- */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <Link
          to="/"
          className="absolute top-5 right-5 flex items-center gap-2 text-sm font-medium text-taa-primary bg-white/50 backdrop-blur-md py-2 px-4 rounded-full border border-white/30 hover:bg-white/80 transition-colors"
        >
          <HomeIcon />
          <span>Back to Home</span>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white/60 backdrop-blur-lg p-8 sm:p-10 rounded-2xl shadow-lg w-full max-w-md border border-white/30"
      >
        <h1 className="text-3xl font-bold text-center text-taa-primary mb-2">
          Welcome Back
        </h1>
        <p className="text-center text-taa-dark/70 mb-8">
          Login to your Text Africa Arcade account
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            className="w-full p-3 rounded-lg bg-emerald-50/30 text-emerald-900 placeholder-emerald-800/60 border border-white/20 backdrop-blur-md transition duration-200 focus:bg-white/30 focus:ring-2 focus:ring-taa-accent focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
            className="w-full p-3 rounded-lg bg-emerald-50/30 text-emerald-900 placeholder-emerald-800/60 border border-white/20 backdrop-blur-md transition duration-200 focus:bg-white/30 focus:ring-2 focus:ring-taa-accent focus:outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-taa-primary hover:bg-taa-accent text-white py-3 rounded-lg transition font-medium shadow-md hover:shadow-lg disabled:bg-taa-primary/50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="flex justify-between items-center mt-6 text-sm">
          <Link to="/forgot-password" className="text-taa-accent hover:underline font-medium">
            Forgot Password?
          </Link>
          <Link to="/register" className="text-taa-accent hover:underline font-medium">
            Create Account
          </Link>
        </div>
      </motion.div>
    </main>
  );
}