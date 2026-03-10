import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import API from "../utils/api";
import { useAlert } from "../context/AlertContext";
import { Send, MessageSquare, Mail, Globe } from "lucide-react";

function Footer() {
  const { showAlert } = useAlert();

  const [helpForm, setHelpForm] = useState({ email: "", message: "" });
  const [isHelpLoading, setIsHelpLoading] = useState(false);
  
  const [feedbackForm, setFeedbackForm] = useState({ email: "", message: "" });
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

  const handleFormSubmit = async (e, type, form, setLoading, setForm) => {
    e.preventDefault();
    if (!form.email || !form.message) {
      showAlert("All fields are required.", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = { 
        name: `${type} Form Visitor`,
        email: form.email, 
        message: `${type}: ${form.message}` 
      };
      await API.post("/contact", payload);
      showAlert("Message sent successfully!", "success");
      setForm({ email: "", message: "" });
    } catch (err) {
      showAlert("Failed to send message.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-taa-light dark:bg-taa-dark/50 border-t border-taa-primary/10 dark:border-white/5 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand & Mission */}
          <div className="space-y-6">
            <Link to="/" className="inline-block">
              <span className="text-3xl font-black text-taa-primary tracking-tighter">
                TAA
              </span>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
              Empowering African media innovation through design, data, and technology-driven storytelling.
            </p>
            {/* <div className="flex gap-4">
              {[Globe, Mail].map((Icon, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-taa-primary/10 flex items-center justify-center text-taa-primary hover:bg-taa-primary hover:text-white transition-all cursor-pointer">
                  <Icon size={18} />
                </div>
              ))}
            </div> */}
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-bold text-taa-dark dark:text-white mb-6 uppercase tracking-widest text-sm">Navigation</h4>
            <ul className="space-y-4">
              {["Home", "About", "Services", "Team", "Contact"].map((page) => (
                <li key={page}>
                  <Link
                    to={page === "Home" ? "/" : `/${page.toLowerCase()}`}
                    className="text-gray-600 dark:text-gray-400 hover:text-taa-primary dark:hover:text-taa-accent font-medium transition-colors"
                  >
                    {page}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Contact Form */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Help Form */}
            <div className="glass-card p-6 rounded-2xl border-taa-primary/10">
              <h4 className="font-bold text-taa-primary mb-4 flex items-center gap-2">
                <MessageSquare size={18} /> Help Desk
              </h4>
              <form onSubmit={(e) => handleFormSubmit(e, "Help", helpForm, setIsHelpLoading, setHelpForm)} className="space-y-3">
                <input
                  type="email"
                  placeholder="Your email"
                  value={helpForm.email}
                  onChange={(e) => setHelpForm({...helpForm, email: e.target.value})}
                  className="w-full p-3 rounded-xl bg-white dark:bg-taa-dark border-none focus:ring-2 focus:ring-taa-primary text-sm outline-none"
                />
                <textarea
                  placeholder="How can we help?"
                  rows="2"
                  value={helpForm.message}
                  onChange={(e) => setHelpForm({...helpForm, message: e.target.value})}
                  className="w-full p-3 rounded-xl bg-white dark:bg-taa-dark border-none focus:ring-2 focus:ring-taa-primary text-sm outline-none resize-none"
                />
                <button 
                  disabled={isHelpLoading}
                  className="w-full py-3 bg-taa-primary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {isHelpLoading ? "..." : <><Send size={14} /> Send</>}
                </button>
              </form>
            </div>

            {/* Feedback Form */}
            <div className="glass-card p-6 rounded-2xl border-taa-accent/20">
              <h4 className="font-bold text-taa-accent mb-4 flex items-center gap-2">
                <MessageSquare size={18} /> Feedback
              </h4>
              <form onSubmit={(e) => handleFormSubmit(e, "Feedback", feedbackForm, setIsFeedbackLoading, setFeedbackForm)} className="space-y-3">
                <input
                  type="email"
                  placeholder="Your email"
                  value={feedbackForm.email}
                  onChange={(e) => setFeedbackForm({...feedbackForm, email: e.target.value})}
                  className="w-full p-3 rounded-xl bg-white dark:bg-taa-dark border-none focus:ring-2 focus:ring-taa-accent text-sm outline-none"
                />
                <textarea
                  placeholder="Your feedback..."
                  rows="2"
                  value={feedbackForm.message}
                  onChange={(e) => setFeedbackForm({...feedbackForm, message: e.target.value})}
                  className="w-full p-3 rounded-xl bg-white dark:bg-taa-dark border-none focus:ring-2 focus:ring-taa-accent text-sm outline-none resize-none"
                />
                <button 
                  disabled={isFeedbackLoading}
                  className="w-full py-3 bg-taa-accent text-taa-dark rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {isFeedbackLoading ? "..." : <><Send size={14} /> Submit</>}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-taa-primary/10 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-medium text-gray-500">
          <p>© {new Date().getFullYear()} Text Africa Arcade. All rights reserved.</p>
          {/* <div className="flex gap-8">
            <Link to="/privacy" className="hover:text-taa-primary">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-taa-primary">Terms of Service</Link>
          </div> */}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
