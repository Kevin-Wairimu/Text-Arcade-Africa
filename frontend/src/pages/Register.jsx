import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../utils/api";
import { useAlert } from "../context/AlertContext";
import { Home, Mail, Lock, User, ArrowRight, Loader2, Sparkles } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/register", form);
      showAlert("Account created! Please login.", "success");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed";
      showAlert(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-taa-surface dark:bg-taa-dark p-6 transition-colors duration-300 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-taa-primary/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-taa-accent/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

      <Link
        to="/"
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-taa-primary dark:text-taa-accent hover:opacity-70 transition-all z-20"
      >
        <Home size={18} />
        <span>Back to Home</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="glass-card p-8 md:p-10 rounded-[2.5rem] shadow-2xl border-taa-primary/5">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-taa-accent text-taa-dark mb-6 shadow-lg shadow-taa-accent/20">
              <Sparkles size={32} />
            </div>
            <h1 className="text-3xl font-black text-taa-dark dark:text-white tracking-tight">
              Create Account
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
              Join the Text Africa Arcade community
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-taa-primary transition-colors" size={20} />
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary outline-none transition-all dark:text-white"
              />
            </div>

            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-taa-primary transition-colors" size={20} />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary outline-none transition-all dark:text-white"
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-taa-primary transition-colors" size={20} />
              <input
                type="password"
                placeholder="Create Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary outline-none transition-all dark:text-white"
              />
            </div>

            <div className="py-2">
               <p className="text-xs text-gray-400 font-medium px-2">
                 By signing up, you agree to our Terms of Service and Privacy Policy.
               </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-taa-primary text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:brightness-110 shadow-xl shadow-taa-primary/20 transition-all disabled:opacity-50 active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Get Started <ArrowRight size={20} /></>}
            </button>
          </form>

          <div className="mt-10 text-center text-sm font-medium text-gray-500">
            Already a member?{" "}
            <Link
              to="/login"
              className="text-taa-primary dark:text-taa-accent font-bold hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

