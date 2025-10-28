import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import API from "../utils/api";
import { useAlert } from "../context/AlertContext";

export default function Footer() {
  const { showAlert } = useAlert();

  const [helpForm, setHelpForm] = useState({ email: "", message: "" });
  const [isHelpLoading, setIsHelpLoading] = useState(false);
  const [helpErrors, setHelpErrors] = useState({ email: "", message: "" });

  const [feedbackForm, setFeedbackForm] = useState({ email: "", message: "" });
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [feedbackErrors, setFeedbackErrors] = useState({ email: "", message: "" });

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
      const payload = {
        email: form.email,
        message: `${type}: ${form.message}`,
      };
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
    <footer className="relative bg-gradient-to-r from-taa-primary via-[#20773B] to-taa-accent text-white overflow-hidden">
      {/* Soft overlay to blend with previous section */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-transparent via-taa-primary/20 to-taa-primary/40 pointer-events-none" />

      {/* Subtle decorative glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-black/10 opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="sm:col-span-2 lg:col-span-1"
        >
          <h3 className="font-bold text-2xl text-white mb-3">Text Africa Arcade</h3>
          <p className="text-sm text-emerald-100 leading-relaxed">
            Empowering African media innovation through design, data, and technology-driven storytelling.
          </p>
        </motion.div>

        {/* Quick Links */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
          <h4 className="font-semibold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            {["Home", "About", "Services", "Team", "Contact"].map((page) => (
              <li key={page}>
                <Link
                  to={`/${page.toLowerCase() === "home" ? "" : page.toLowerCase()}`}
                  className="text-emerald-100 hover:text-white transition duration-200"
                >
                  {page}
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Help Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
          <h4 className="font-semibold text-white mb-4">Need Help?</h4>
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
              className={`p-3 rounded-lg w-full bg-white/10 text-white placeholder-white/60 border ${
                helpErrors.email ? "border-red-400" : "border-white/20"
              } focus:ring-2 focus:ring-white/50 transition duration-200`}
            />
            {helpErrors.email && <p className="text-red-300 text-sm">{helpErrors.email}</p>}

            <textarea
              placeholder="How can we help?"
              rows="3"
              value={helpForm.message}
              onChange={(e) => setHelpForm({ ...helpForm, message: e.target.value })}
              className={`p-3 rounded-lg w-full bg-white/10 text-white placeholder-white/60 border ${
                helpErrors.message ? "border-red-400" : "border-white/20"
              } resize-none focus:ring-2 focus:ring-white/50 transition duration-200`}
            />
            {helpErrors.message && <p className="text-red-300 text-sm">{helpErrors.message}</p>}

            <button
              type="submit"
              disabled={isHelpLoading}
              className="bg-white/10 border border-white/20 text-white font-semibold px-4 py-2 rounded-lg hover:bg-white/20 transition duration-200 focus:ring-2 focus:ring-white/50 disabled:opacity-50"
            >
              {isHelpLoading ? "Sending..." : "Send Request"}
            </button>
          </form>
        </motion.div>

        {/* Feedback Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
          <h4 className="font-semibold text-white mb-4">Give Feedback</h4>
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
              className={`p-3 rounded-lg w-full bg-white/10 text-white placeholder-white/60 border ${
                feedbackErrors.email ? "border-red-400" : "border-white/20"
              } focus:ring-2 focus:ring-white/50 transition duration-200`}
            />
            {feedbackErrors.email && <p className="text-red-300 text-sm">{feedbackErrors.email}</p>}

            <textarea
              placeholder="Your valuable feedback..."
              rows="3"
              value={feedbackForm.message}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
              className={`p-3 rounded-lg w-full bg-white/10 text-white placeholder-white/60 border ${
                feedbackErrors.message ? "border-red-400" : "border-white/20"
              } resize-none focus:ring-2 focus:ring-white/50 transition duration-200`}
            />
            {feedbackErrors.message && <p className="text-red-300 text-sm">{feedbackErrors.message}</p>}

            <button
              type="submit"
              disabled={isFeedbackLoading}
              className="bg-white/10 border border-white/20 text-white font-semibold px-4 py-2 rounded-lg hover:bg-white/20 transition duration-200 focus:ring-2 focus:ring-white/50 disabled:opacity-50"
            >
              {isFeedbackLoading ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Footer bottom bar */}
      <div className="relative z-10 border-t border-white/10 text-center py-4 text-sm text-emerald-100 bg-taa-dark/20">
        © {new Date().getFullYear()} Text Africa Arcade. All rights reserved.
      </div>
    </footer>
  );
}
