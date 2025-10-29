import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import API from "../utils/api";
import { useAlert } from "../context/AlertContext";

export default function Contact() {
  const { showAlert } = useAlert();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ name: "", email: "", message: "" });

  const validateForm = useCallback(() => {
    const newErrors = { name: "", email: "", message: "" };
    let valid = true;

    if (!form.name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }
    if (!form.email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = "Invalid email format";
      valid = false;
    }
    if (!form.message.trim()) {
      newErrors.message = "Message is required";
      valid = false;
    } else if (form.message.length < 10) {
      newErrors.message = "Message must be at least 10 characters";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  }, [form]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateForm()) {
        showAlert("Please fix the form errors.", "error");
        return;
      }

      setLoading(true);
      try {
        const { data } = await API.post("/contact", form);
        showAlert(data.message || "Message sent successfully!", "success");

        setForm({ name: "", email: "", message: "" });
        setErrors({ name: "", email: "", message: "" });
      } catch (err) {
        showAlert(
          err.response?.data?.message ||
            "Failed to send message. Please try again later.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    },
    [form, showAlert, validateForm]
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2E7D32] via-[#1B5122]/80 to-[#2E7D32] pt-24 md:pt-32 text-white overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 py-16">

        {/* --- Animated Header --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg mb-6">
            Get in Touch
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-gray-200 max-w-2xl mx-auto text-lg leading-relaxed drop-shadow-sm"
          >
            Let’s talk about partnerships, projects, or digital transformation for your newsroom.
          </motion.p>
        </motion.div>

        {/* --- Contact Form --- */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="bg-[#2E7D32]/20 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-[#2E7D32]/50 max-w-2xl mx-auto"
        >
          <div className="grid gap-5">
            {/* Name */}
            <div>
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={`w-full p-3 rounded-lg bg-[#2E7D32]/10 text-white placeholder-gray-300 border ${
                  errors.name ? "border-red-500" : "border-[#77BFA1]/40"
                } focus:outline-none focus:ring-2 focus:ring-[#77BFA1] transition`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={`w-full p-3 rounded-lg bg-[#2E7D32]/10 text-white placeholder-gray-300 border ${
                  errors.email ? "border-red-500" : "border-[#77BFA1]/40"
                } focus:outline-none focus:ring-2 focus:ring-[#77BFA1] transition`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Message */}
            <div>
              <textarea
                name="message"
                placeholder="Your Message"
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                rows={5}
                className={`w-full p-3 rounded-lg bg-[#2E7D32]/10 text-white placeholder-gray-300 border ${
                  errors.message ? "border-red-500" : "border-[#77BFA1]/40"
                } focus:outline-none focus:ring-2 focus:ring-[#77BFA1] transition`}
              />
              {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-8 bg-white text-[#2E7D32] rounded-lg font-semibold tracking-wide hover:bg-[#77BFA1] hover:text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(119,191,161,0.3)]"
          >
            {loading ? "Sending..." : "Send Message"}
          </motion.button>
        </motion.form>
      </div>
    </main>
  );
}
