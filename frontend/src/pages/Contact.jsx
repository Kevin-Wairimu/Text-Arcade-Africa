import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { useAlert } from "../context/AlertContext";

// ✅ Base API URL (no duplicate /api)
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://text-arcade-africa.onrender.com");

// ✅ Axios instance
const API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

export default function Contact() {
  const { showAlert } = useAlert();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ name: "", email: "", message: "" });

  const validateForm = useCallback(() => {
    const newErrors = { name: "", email: "", message: "" };
    let isValid = true;

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email format";
      isValid = false;
    }
    if (!form.message.trim()) {
      newErrors.message = "Message is required";
      isValid = false;
    } else if (form.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  }, [form]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateForm()) {
        showAlert("Please fix the form errors.", "error");
        return;
      }

      setLoading(true);

      const sendRequest = async (attempt = 1) => {
        try {
          const { data } = await API.post("/contact", form);
          console.log("✅ Contact form response:", data);
          showAlert(data.message || "Message sent successfully!", "success");
          setForm({ name: "", email: "", message: "" });
          setErrors({ name: "", email: "", message: "" });
        } catch (err) {
          console.error(`❌ Contact form error (attempt ${attempt}):`, err);

          const errorMessage =
            err.code === "ECONNABORTED"
              ? "Request timed out. Please try again."
              : err.response?.data?.message ||
                "Failed to send message. Please try again later.";

          if (err.code === "ECONNABORTED" && attempt < 2) {
            console.warn("Retrying contact request due to timeout...");
            await sendRequest(attempt + 1);
            return;
          }

          showAlert(errorMessage, "error");
        } finally {
          setLoading(false);
        }
      };

      await sendRequest();
    },
    [form, showAlert, validateForm]
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50 to-white pt-20 md:pt-24">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-taa-primary mb-6">
            Get in Touch
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-12">
            Let’s talk about partnerships, projects, or digital transformation for
            your newsroom. We're here to help.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-white/60 backdrop-blur-lg p-8 rounded-2xl shadow-lg max-w-2xl mx-auto border border-white/50"
        >
          <div className="grid gap-5">
            <div>
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className={`w-full p-3 rounded-lg bg-emerald-50/30 text-emerald-900 placeholder-emerald-800/60 border ${
                  errors.name ? "border-red-500" : "border-white/20"
                } backdrop-blur-md transition duration-200 focus:bg-white/30 focus:ring-2 focus:ring-taa-primary focus:outline-none`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <input
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className={`w-full p-3 rounded-lg bg-emerald-50/30 text-emerald-900 placeholder-emerald-800/60 border ${
                  errors.email ? "border-red-500" : "border-white/20"
                } backdrop-blur-md transition duration-200 focus:bg-white/30 focus:ring-2 focus:ring-taa-primary focus:outline-none`}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <textarea
                placeholder="Your Message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                rows={5}
                className={`w-full p-3 rounded-lg bg-emerald-50/30 text-emerald-900 placeholder-emerald-800/60 border ${
                  errors.message ? "border-red-500" : "border-white/20"
                } resize-none backdrop-blur-md transition duration-200 focus:bg-white/30 focus:ring-2 focus:ring-taa-primary focus:outline-none`}
              />
              {errors.message && (
                <p className="text-red-500 text-sm mt-1">{errors.message}</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-6 bg-taa-primary text-white rounded-lg font-medium hover:bg-taa-accent transition shadow-md hover:shadow-lg disabled:bg-taa-primary/50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </motion.form>
      </div>
    </main>
  );
}
