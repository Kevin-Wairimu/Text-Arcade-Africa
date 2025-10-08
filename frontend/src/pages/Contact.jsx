import React, { useState } from "react";
import { motion } from "framer-motion";
import API from "../utils/api";
import { useAlert } from "../context/AlertContext"; // Import the alert hook

export default function Contact() {
  const { showAlert } = useAlert(); // Use the hook
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      // Use the new, correct API endpoint
      const { data } = await API.post("/api/contact", form);
      showAlert(data.message, "success"); // Use the themed alert
      setForm({ name: "", email: "", message: "" }); // Clear form on success
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to send message.";
      showAlert(errorMessage, "error"); // Use the themed error alert
    } finally {
      setLoading(false);
    }
  }

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
            Let's talk about partnerships, projects, or digital transformation for
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
            <input
              type="text"
              placeholder="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full p-3 rounded-lg bg-emerald-50/30 text-emerald-900 placeholder-emerald-800/60 border border-white/20 backdrop-blur-md transition duration-200 focus:bg-white/30 focus:ring-2 focus:ring-taa-primary focus:outline-none"
            />
            <input
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="w-full p-3 rounded-lg bg-emerald-50/30 text-emerald-900 placeholder-emerald-800/60 border border-white/20 backdrop-blur-md transition duration-200 focus:bg-white/30 focus:ring-2 focus:ring-taa-primary focus:outline-none"
            />
            <textarea
              placeholder="Your Message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
              rows={5}
              className="w-full p-3 rounded-lg bg-emerald-50/30 text-emerald-900 placeholder-emerald-800/60 border border-white/20 resize-none backdrop-blur-md transition duration-200 focus:bg-white/30 focus:ring-2 focus:ring-taa-primary focus:outline-none"
            />
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