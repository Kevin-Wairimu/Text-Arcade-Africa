import React, { useState, useCallback } from "react";
import { motion } from "framer-motion";
import API from "../api";
import { useAlert } from "../context/AlertContext";

export default function Feedback() {
  const { showAlert } = useAlert();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      showAlert("Message cannot be empty", "error");
      return;
    }

    setLoading(true);
    try {
      console.log("📤 Sending feedback...");
      const { data } = await API.post("/api/feedback", { message });
      console.log("✅ Feedback response:", data);
      showAlert(data.message || "Feedback sent successfully!", "success");
      setMessage("");
    } catch (err) {
      console.error("❌ Feedback error:", err);
      showAlert(err.response?.data?.message || "Failed to send feedback.", "error");
    } finally {
      setLoading(false);
    }
  }, [message, showAlert]);

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <textarea placeholder="Your feedback..." value={message} onChange={(e) => setMessage(e.target.value)} rows={5} className="w-full p-3 border rounded-lg" />
      <button type="submit" disabled={loading} className="mt-4 py-2 px-4 bg-taa-primary text-white rounded-lg">
        {loading ? "Sending..." : "Send Feedback"}
      </button>
    </form>
  );
}
