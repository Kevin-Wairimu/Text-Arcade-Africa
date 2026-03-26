import React, { useState } from "react";
import {
  Instagram,
  Facebook,
  Twitter,
  Mail,
  MapPin,
  Phone,
  ArrowRight,
  MessageSquare,
  Send,
  HelpCircle,
} from "lucide-react";
import { Icon } from "@iconify/react";
import Logo from "./Logo";
import API from "../utils/api";
import { useAlert } from "../context/AlertContext";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { showAlert } = useAlert();

  const [feedbackForm, setFeedbackForm] = useState({ email: "", message: "" });
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackForm.message.trim()) {
      showAlert("Feedback message cannot be empty", "error");
      return;
    }

    setIsFeedbackLoading(true);
    try {
      await API.post("/feedback", feedbackForm);
      showAlert("Thank you for your feedback!", "success");
      setFeedbackForm({ email: "", message: "" });
    } catch (err) {
      showAlert("Failed to send feedback. Please try again.", "error");
    } finally {
      setIsFeedbackLoading(false);
    }
  };

  return (
    <footer className="bg-black border-t border-taa-primary/20 text-white selection:bg-taa-primary selection:text-white">
      <div className="max-w-7xl mx-auto py-20 px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 md:gap-12">
          {/* Brand section - spans 4 columns */}
          <div className="md:col-span-4 space-y-8">
            <div className="space-y-6">
              <Logo mode="icon" className="h-16 w-16" as="div" />
              <div className="space-y-2">
                <span className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white group-hover:text-taa-primary transition-colors leading-none">
                  Text Africa <span className="text-taa-primary">Arcade</span>
                </span>
                <p className="max-w-md text-white/50 font-medium leading-relaxed text-sm tracking-wide">
                  Empowering African media innovation through design, data, and
                  technology-driven storytelling. We don’t just report news; we
                  architect digital experiences for the continent's most
                  compelling narratives.
                </p>
              </div>
            </div>

            <div className="flex space-x-4">
              {/* {[
                {
                  icon: <Instagram className="h-5 w-5" />,
                  url: "https://www.instagram.com/textafricaarcade/",
                },
                {
                  icon: <Icon icon="simple-icons:tiktok" className="h-5 w-5" />,
                  url: "#",
                },
                {
                  icon: <Twitter className="h-5 w-5" />,
                  url: "#",
                },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-12 w-12 border border-taa-primary/10 flex items-center justify-center text-taa-primary/60 hover:text-taa-primary hover:border-taa-primary/40 transition-all duration-500 rounded-2xl bg-white/5"
                >
                  {social.icon}
                </a>
              ))} */}
            </div>
          </div>

          {/* Navigation Links - spans 2 columns */}
          <div className="md:col-span-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-taa-primary mb-8">
              Explore
            </h3>
            <ul className="space-y-4 text-[11px] uppercase tracking-[0.2em] font-bold text-white/40">
              <li>
                <a
                  href="/"
                  className="hover:text-taa-primary transition-colors block flex items-center gap-2 group"
                >
                  <ArrowRight
                    size={10}
                    className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                  />
                  Home
                </a>
              </li>
              <li>
                <a
                  href="/about"
                  className="hover:text-taa-primary transition-colors block flex items-center gap-2 group"
                >
                  <ArrowRight
                    size={10}
                    className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                  />
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="/services"
                  className="hover:text-taa-primary transition-colors block flex items-center gap-2 group"
                >
                  <ArrowRight
                    size={10}
                    className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                  />
                  Services
                </a>
              </li>
              <li>
                <a
                  href="/team"
                  className="hover:text-taa-primary transition-colors block flex items-center gap-2 group"
                >
                  <ArrowRight
                    size={10}
                    className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                  />
                  Our Team
                </a>
              </li>
            </ul>
          </div>

          {/* Help Links - spans 2 columns */}
          {/* <div className="md:col-span-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-taa-primary mb-8">
              Help Hub
            </h3>
            <ul className="space-y-4 text-[11px] uppercase tracking-[0.2em] font-bold text-white/40">
              <li>
                <a
                  href="#"
                  className="hover:text-taa-primary transition-colors block flex items-center gap-2 group"
                >
                  <HelpCircle
                    size={10}
                    className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                  />
                  Knowledge Base
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-taa-primary transition-colors block flex items-center gap-2 group"
                >
                  <HelpCircle
                    size={10}
                    className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                  />
                  Guidelines
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-taa-primary transition-colors block flex items-center gap-2 group"
                >
                  <HelpCircle
                    size={10}
                    className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                  />
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="hover:text-taa-primary transition-colors block flex items-center gap-2 group"
                >
                  <HelpCircle
                    size={10}
                    className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
                  />
                  Contact Support
                </a>
              </li>
            </ul>
          </div> */}

          {/* Feedback Form - spans 4 columns */}
          <div className="md:col-span-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-taa-primary mb-8 flex items-center gap-2">
              <MessageSquare size={14} /> Story Feedback
            </h3>
            <div className="glass-card p-6 rounded-2xl border-taa-primary/10 bg-white/5 backdrop-blur-sm">
              <form onSubmit={handleFeedbackSubmit} className="space-y-3">
                <input
                  type="email"
                  placeholder="Your email (Optional)"
                  value={feedbackForm.email}
                  onChange={(e) =>
                    setFeedbackForm({ ...feedbackForm, email: e.target.value })
                  }
                  className="w-full p-3 rounded-xl bg-black border border-taa-primary/10 focus:border-taa-primary text-sm outline-none text-white transition-all placeholder:text-white/20"
                />
                <textarea
                  placeholder="Your feedback..."
                  rows="3"
                  value={feedbackForm.message}
                  onChange={(e) =>
                    setFeedbackForm({
                      ...feedbackForm,
                      message: e.target.value,
                    })
                  }
                  className="w-full p-3 rounded-xl bg-black border border-taa-primary/10 focus:border-taa-primary text-sm outline-none text-white transition-all placeholder:text-white/20 resize-none"
                />
                <button
                  disabled={isFeedbackLoading}
                  className="w-full py-3 bg-taa-primary text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {isFeedbackLoading ? (
                    "..."
                  ) : (
                    <>
                      <Send size={14} /> Submit Feedback
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="mt-24 pt-12 border-t border-taa-primary/10 flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Credits - Bottom Left */}
          <div className="order-2 md:order-1 flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.4em] font-black text-white/30">
              <span>Architected By</span>
              <div className="h-px w-8 bg-taa-primary/20" />
              <a
                href="https://port-folio-git-main-kevin-wairimus-projects.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-taa-primary/60 hover:text-taa-primary transition-all duration-500 hover:tracking-[0.6em]"
              >
                Kevin Wairimu
              </a>
            </div>
            <p className="text-[8px] uppercase tracking-[0.2em] text-white/20">
              Digital Transformation &bull; Media Innovation &copy;{" "}
              {currentYear}
            </p>
          </div>

          {/* Legal / Secondary Nav - Bottom Right */}
          <div className="order-1 md:order-2 flex items-center gap-8 text-[9px] uppercase tracking-[0.3em] font-bold text-white/20">
            <a href="#" className="hover:text-taa-primary/40 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-taa-primary/40 transition-colors">
              Terms
            </a>
            <div className="h-1 w-1 bg-taa-primary/40 rounded-full" />
            <span className="text-white/40">Text Africa Arcade&trade;</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
