import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../utils/api";
import { useAlert } from "../context/AlertContext";
import { Home, Mail, ArrowRight, Loader2, KeyRound, ChevronLeft } from "lucide-react";

export default function ForgotPassword() {
  const { showAlert } = useAlert();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post("/auth/forgot-password", { email });
      showAlert(data.message || "Reset link sent to your email!", "success");
      setEmail("");
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      showAlert(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-taa-surface dark:bg-taa-dark p-6 transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-taa-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      
      <Link
        to="/login"
        className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-taa-primary dark:text-taa-accent hover:opacity-70 transition-all z-20"
      >
        <ChevronLeft size={18} />
        <span>Back to Login</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="glass-card p-8 md:p-10 rounded-[2.5rem] shadow-2xl border-taa-primary/5 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-taa-primary/10 text-taa-primary mb-6">
            <KeyRound size={32} />
          </div>
          
          <h1 className="text-3xl font-black text-taa-dark dark:text-white tracking-tight mb-2">
            Forgot Password?
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">
            Enter your email and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative group text-left">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-taa-primary transition-colors" size={20} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary outline-none transition-all dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-taa-primary text-white py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 hover:brightness-110 shadow-xl transition-all disabled:opacity-50 active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" /> : <>Send Reset Link <ArrowRight size={20} /></>}
            </button>
          </form>

          <div className="mt-8">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-taa-primary transition-colors"
            >
              <Home size={16} /> Return to Home
            </Link>
          </div>
        </div>
      </motion.div>
    </main>
  );
}
