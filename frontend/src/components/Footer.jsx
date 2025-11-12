// src/components/Footer.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaArrowUp } from "react-icons/fa";
import API from "../utils/api";
import { useAlert } from "../context/AlertContext";

function Footer() {
  const { showAlert } = useAlert();

  const [helpForm, setHelpForm] = useState({ email: "", message: "" });
  const [feedbackForm, setFeedbackForm] = useState({ email: "", message: "" });
  const [helpErrors, setHelpErrors] = useState({ email: "", message: "" });
  const [feedbackErrors, setFeedbackErrors] = useState({ email: "", message: "" });
  const [isHelpLoading, setIsHelpLoading] = useState(false);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // ✅ Show "back to top" button when scrolled down
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const validateForm = (form) => {
    const errors = { email: "", message: "" };
    let isValid = true;

    if (!form.email.trim()) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Invalid email format";
      isValid = false;
    }

    if (!form.message.trim()) {
      errors.message = "Message is required";
      isValid = false;
    } else if (form.message.length < 10) {
      errors.message = "Message must be at least 10 characters";
      isValid = false;
    }

    return { isValid, errors };
  };

  const handleFormSubmit = async (e, type, form, setLoading, setForm, setErrors) => {
    e.preventDefault();
    const { isValid, errors } = validateForm(form);
    if (!isValid) {
      setErrors(errors);
      showAlert("Please fix the form errors.", "error");
      return;
    }

    setLoading(true);
    try {
      const payload = { email: form.email, message: `${type}: ${form.message}` };
      const { data } = await API.post("/contact", payload);
      showAlert(data.message, "success");
      setForm({ email: "", message: "" });
      setErrors({ email: "", message: "" });
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Something went wrong.";
      showAlert(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="relative bg-gradient-to-r from-[#1B5E20] via-[#2E7D32] to-[#1B5E20] text-gray-100 overflow-hidden">
      {/* Decorative overlay */}
      <div className="absolute inset-0 bg-black/10 mix-blend-overlay pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="font-bold text-2xl text-white mb-3 relative">
            Text Africa Arcade
            <span className="absolute left-0 bottom-0 w-1/3 h-[2px] bg-[#C8E6C9] rounded"></span>
          </h3>
          <p className="text-gray-200 text-sm leading-relaxed">
            Empowering African media innovation through design, data, and technology-driven storytelling.
          </p>
          <div className="flex gap-4 mt-4">
            <a href="#" className="hover:text-[#C8E6C9]"><FaFacebookF /></a>
            <a href="#" className="hover:text-[#C8E6C9]"><FaTwitter /></a>
            <a href="#" className="hover:text-[#C8E6C9]"><FaInstagram /></a>
            <a href="#" className="hover:text-[#C8E6C9]"><FaLinkedinIn /></a>
          </div>
        </motion.div>

        {/* Quick Links */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
          <h4 className="font-semibold text-[#C8E6C9] mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            {["Home", "About", "Services", "Team", "Contact"].map((page) => (
              <li key={page}>
                <Link
                  to={`/${page.toLowerCase() === "home" ? "" : page.toLowerCase()}`}
                  className="text-gray-200 hover:text-[#C8E6C9] transition duration-200"
                >
                  {page}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Help Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
          <h4 className="font-semibold text-[#C8E6C9] mb-4">Need Help?</h4>
          <form
            onSubmit={(e) =>
              handleFormSubmit(e, "Help Request", helpForm, setIsHelpLoading, setHelpForm, setHelpErrors)
            }
            className="flex flex-col gap-3"
          >
            <input
              type="email"
              placeholder="Your Email"
              value={helpForm.email}
              onChange={(e) => setHelpForm({ ...helpForm, email: e.target.value })}
              className={`p-3 rounded-lg bg-white/10 text-white placeholder-gray-300 border ${
                helpErrors.email ? "border-red-400" : "border-[#C8E6C9]/50"
              } focus:ring-2 focus:ring-[#C8E6C9] transition`}
            />
            {helpErrors.email && <p className="text-red-300 text-sm">{helpErrors.email}</p>}

            <textarea
              placeholder="How can we help?"
              rows="3"
              value={helpForm.message}
              onChange={(e) => setHelpForm({ ...helpForm, message: e.target.value })}
              className={`p-3 rounded-lg bg-white/10 text-white placeholder-gray-300 border ${
                helpErrors.message ? "border-red-400" : "border-[#C8E6C9]/50"
              } resize-none focus:ring-2 focus:ring-[#C8E6C9] transition`}
            />
            {helpErrors.message && <p className="text-red-300 text-sm">{helpErrors.message}</p>}

            <button
              type="submit"
              disabled={isHelpLoading}
              className="bg-[#C8E6C9] text-[#1B5E20] font-semibold px-4 py-2 rounded-lg hover:bg-white transition duration-200 disabled:opacity-50"
            >
              {isHelpLoading ? "Sending..." : "Send Request"}
            </button>
          </form>
        </motion.div>

        {/* Feedback Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
          <h4 className="font-semibold text-[#C8E6C9] mb-4">Give Feedback</h4>
          <form
            onSubmit={(e) =>
              handleFormSubmit(e, "Feedback", feedbackForm, setIsFeedbackLoading, setFeedbackForm, setFeedbackErrors)
            }
            className="flex flex-col gap-3"
          >
            <input
              type="email"
              placeholder="Your Email"
              value={feedbackForm.email}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
              className={`p-3 rounded-lg bg-white/10 text-white placeholder-gray-300 border ${
                feedbackErrors.email ? "border-red-400" : "border-[#C8E6C9]/50"
              } focus:ring-2 focus:ring-[#C8E6C9] transition`}
            />
            {feedbackErrors.email && <p className="text-red-300 text-sm">{feedbackErrors.email}</p>}

            <textarea
              placeholder="Your valuable feedback..."
              rows="3"
              value={feedbackForm.message}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
              className={`p-3 rounded-lg bg-white/10 text-white placeholder-gray-300 border ${
                feedbackErrors.message ? "border-red-400" : "border-[#C8E6C9]/50"
              } resize-none focus:ring-2 focus:ring-[#C8E6C9] transition`}
            />
            {feedbackErrors.message && <p className="text-red-300 text-sm">{feedbackErrors.message}</p>}

            <button
              type="submit"
              disabled={isFeedbackLoading}
              className="bg-[#C8E6C9] text-[#1B5E20] font-semibold px-4 py-2 rounded-lg hover:bg-white transition duration-200 disabled:opacity-50"
            >
              {isFeedbackLoading ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="relative z-10 border-t border-[#C8E6C9]/20 text-center py-5 text-sm text-[#C8E6C9]/90 bg-[#1B5E20]/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center px-6">
          <p>© {new Date().getFullYear()} <span className="font-semibold">Text Africa Arcade</span>. All rights reserved.</p>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <span>Powered by:</span>
            <span className="font-semibold hover:text-white transition">Kevin Wairimu</span>
            <a href="tel:+2547577724175" className="text-[#C8E6C9] hover:text-white font-medium transition">
              0757&nbsp;772&nbsp;4175
            </a>
          </div>
        </div>
      </div>

      Back to Top Button
      {/* {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 bg-[#C8E6C9] text-[#1B5E20] p-3 rounded-full shadow-lg hover:bg-white transition-all"
          aria-label="Back to top"
        >
          <FaArrowUp />
        </button>
      )} */}
    </footer>
  );
}

export default Footer;
