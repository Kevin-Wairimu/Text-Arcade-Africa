import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import API from "../utils/api"; // Axios instance
import { useAlert } from "../context/AlertContext"; // Import AlertContext

export default function Contact() {
  const { showAlert } = useAlert();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ name: "", email: "", message: "" });

  // Form validation
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

  // Handle form submission
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateForm()) {
        showAlert("Please fix the form errors.", "error");
        return;
      }

      setLoading(true);

      try {
        console.log("📤 Sending contact form...");
        const { data } = await API.post("/api/contact", form); // Updated to /api/contact
        console.log("✅ Contact form response:", data);

        showAlert(data.message || "Message sent successfully!", "success");

        // Reset form
        setForm({ name: "", email: "", message: "" });
        setErrors({ name: "", email: "", message: "" });
      } catch (err) {
        console.error("❌ Contact form error:", err);
        showAlert(
          err.response?.data?.message || "Failed to send message. Please try again later.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [form, showAlert, validateForm]
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50 to-white pt-20 md:pt-24">
      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Header */}
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
            Let’s talk about partnerships, projects, or digital transformation for your newsroom.
          </p>
        </motion.div>

        {/* Contact Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-white/60 backdrop-blur-lg p-8 rounded-2xl shadow-lg max-w-2xl mx-auto border border-white/50"
        >
          <div className="grid gap-5">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={`w-full p-3 rounded-lg border ${
                errors.name ? "border-red-500" : "border-white/20"
              } focus:outline-none focus:ring-2 focus:ring-taa-primary`}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className={`w-full p-3 rounded-lg border ${
                errors.email ? "border-red-500" : "border-white/20"
              } focus:outline-none focus:ring-2 focus:ring-taa-primary`}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}

            <textarea
              name="message"
              placeholder="Your Message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={5}
              className={`w-full p-3 rounded-lg border ${
                errors.message ? "border-red-500" : "border-white/20"
              } focus:outline-none focus:ring-2 focus:ring-taa-primary`}
            />
            {errors.message && <p className="text-red-500 text-sm">{errors.message}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-6 bg-taa-primary text-white rounded-lg font-medium hover:bg-taa-accent disabled:bg-taa-primary/50 transition-colors"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </motion.form>
      </div>
    </main>
  );
}