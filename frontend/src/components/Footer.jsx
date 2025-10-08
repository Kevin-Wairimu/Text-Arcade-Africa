import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import API from "../utils/api"; // Your Axios instance
import { useAlert } from "../context/AlertContext"; // Your custom alert system

export default function Footer() {
  const { showAlert } = useAlert();

  // --- State for Help Form ---
  const [helpMessage, setHelpMessage] = useState("");
  const [isHelpLoading, setIsHelpLoading] = useState(false);

  // --- State for Feedback Form ---
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

  // Generic submit handler
  const handleFormSubmit = async (e, type, message, setLoading, setMessage) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Send the data to your new backend endpoint
      const { data } = await API.post("/api/feedback", {
        type: type, // e.g., "Help Request"
        message: message,
      });

      showAlert(data.message, "success");
      setMessage(""); // Clear the form on success
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Something went wrong.";
      showAlert(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-gradient-to-r from-[#1E6B2B] to-[#77BFA1] text-white mt-20">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Column 1: Brand Info */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="sm:col-span-2 lg:col-span-1">
          <h3 className="font-bold text-xl text-white mb-3">Text Africa Arcade</h3>
          <p className="text-sm text-emerald-100 leading-relaxed">Supporting African media innovation through technology, design, and data-driven insights.</p>
        </motion.div>

        {/* Column 2: Quick Links */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
          <h4 className="font-semibold text-emerald-50 mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            {["Home", "About", "Services", "Team", "Contact"].map((page) => (
              <li key={page}>
                <Link to={`/${page.toLowerCase() === "home" ? "" : page.toLowerCase()}`} className="text-emerald-100 hover:text-white transition duration-200">{page}</Link>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Column 3: Help Section with Active Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
          <h4 className="font-semibold text-emerald-50 mb-4">Need Help?</h4>
          <form onSubmit={(e) => handleFormSubmit(e, 'Help Request', helpMessage, setIsHelpLoading, setHelpMessage)} className="flex flex-col gap-3">
            <textarea
              placeholder="How can we help?"
              rows="3"
              required
              value={helpMessage}
              onChange={(e) => setHelpMessage(e.target.value)}
              className="p-3 rounded-lg w-full text-emerald-50 bg-white/10 placeholder-emerald-200 border border-white/20 resize-none backdrop-blur-md transition duration-200 focus:bg-white/20 focus:ring-2 focus:ring-white/50 focus:outline-none"
              aria-label="Help request message"
            />
            <button
              type="submit"
              disabled={isHelpLoading}
              className="bg-white/10 border border-white/20 backdrop-blur-md text-white font-semibold px-4 py-2 rounded-lg hover:bg-white/20 transition duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50"
            >
              {isHelpLoading ? "Sending..." : "Send Request"}
            </button>
          </form>
        </motion.div>

        {/* Column 4: Feedback Section with Active Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
          <h4 className="font-semibold text-emerald-50 mb-4">Give Feedback</h4>
          <form onSubmit={(e) => handleFormSubmit(e, 'Feedback', feedbackMessage, setIsFeedbackLoading, setFeedbackMessage)} className="flex flex-col gap-3">
            <textarea
              placeholder="Your valuable feedback..."
              rows="3"
              required
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              className="p-3 rounded-lg w-full text-emerald-50 bg-white/10 placeholder-emerald-200 border border-white/20 resize-none backdrop-blur-md transition duration-200 focus:bg-white/20 focus:ring-2 focus:ring-white/50 focus:outline-none"
              aria-label="Feedback message"
            />
            <button
              type="submit"
              disabled={isFeedbackLoading}
              className="bg-white/10 border border-white/20 backdrop-blur-md text-white font-semibold px-4 py-2 rounded-lg hover:bg-white/20 transition duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50"
            >
              {isFeedbackLoading ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        </motion.div>

      </div>
      
      <div className="border-t border-white/20 text-center py-4 text-sm text-emerald-100">
        © {new Date().getFullYear()} Text Africa Arcade. All rights reserved.
      </div>
    </footer>
  );
}