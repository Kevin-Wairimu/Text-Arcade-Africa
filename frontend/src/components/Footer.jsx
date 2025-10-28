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
      console.log("📤 Sending payload to /api/contact:", payload);
      const { data } = await API.post("/api/contact", payload);

      showAlert(data.message, "success");
      setForm({ email: "", message: "" });
      setErrors({ email: "", message: "" });
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Something went wrong.";
      console.error("❌ Form submission error:", err.response?.data || err.message);
      showAlert(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-gradient-to-r from-[#1E6B2B] to-[#77BFA1] text-white mt-20">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="sm:col-span-2 lg:col-span-1">
          <h3 className="font-bold text-xl text-white mb-3">Text Africa Arcade</h3>
          <p className="text-sm text-emerald-100 leading-relaxed">
            Supporting African media innovation through technology, design, and data-driven insights.
          </p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
          <h4 className="font-semibold text-emerald-50 mb-4">Quick Links</h4>
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
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
          <h4 className="font-semibold text-emerald-50 mb-4">Need Help?</h4>
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
              className={`p-3 rounded-lg w-full text-emerald-50 bg-white/10 placeholder-emerald-200 border ${
                helpErrors.email ? "border-red-500" : "border-white/20"
              } backdrop-blur-md transition duration-200 focus:bg-white/20 focus:ring-2 focus:ring-white/50 focus:outline-none`}
              aria-label="Help request email"
            />
            {helpErrors.email && <p className="text-red-300 text-sm">{helpErrors.email}</p>}
            <textarea
              placeholder="How can we help?"
              rows="3"
              value={helpForm.message}
              onChange={(e) => setHelpForm({ ...helpForm, message: e.target.value })}
              className={`p-3 rounded-lg w-full text-emerald-50 bg-white/10 placeholder-emerald-200 border ${
                helpErrors.message ? "border-red-500" : "border-white/20"
              } resize-none backdrop-blur-md transition duration-200 focus:bg-white/20 focus:ring-2 focus:ring-white/50 focus:outline-none`}
              aria-label="Help request message"
            />
            {helpErrors.message && <p className="text-red-300 text-sm">{helpErrors.message}</p>}
            <button
              type="submit"
              disabled={isHelpLoading}
              className="bg-white/10 border border-white/20 backdrop-blur-md text-white font-semibold px-4 py-2 rounded-lg hover:bg-white/20 transition duration-200 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50"
            >
              {isHelpLoading ? "Sending..." : "Send Request"}
            </button>
          </form>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
          <h4 className="font-semibold text-emerald-50 mb-4">Give Feedback</h4>
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
              className={`p-3 rounded-lg w-full text-emerald-50 bg-white/10 placeholder-emerald-200 border ${
                feedbackErrors.email ? "border-red-500" : "border-white/20"
              } backdrop-blur-md transition duration-200 focus:bg-white/20 focus:ring-2 focus:ring-white/50 focus:outline-none`}
              aria-label="Feedback email"
            />
            {feedbackErrors.email && <p className="text-red-300 text-sm">{feedbackErrors.email}</p>}
            <textarea
              placeholder="Your valuable feedback..."
              rows="3"
              value={feedbackForm.message}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
              className={`p-3 rounded-lg w-full text-emerald-50 bg-white/10 placeholder-emerald-200 border ${
                feedbackErrors.message ? "border-red-500" : "border-white/20"
              } resize-none backdrop-blur-md transition duration-200 focus:bg-white/20 focus:ring-2 focus:ring-white/50 focus:outline-none`}
              aria-label="Feedback message"
            />
            {feedbackErrors.message && <p className="text-red-300 text-sm">{feedbackErrors.message}</p>}
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