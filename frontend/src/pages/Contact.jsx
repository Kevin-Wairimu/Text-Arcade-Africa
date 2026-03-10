import React, { useState } from "react";
import { motion } from "framer-motion";
import API from "../utils/api";
import { useAlert } from "../context/AlertContext";
import { 
  Mail, 
  MapPin, 
  Send, 
  Loader2, 
  Globe, 
  MessageSquare,
  ArrowUpRight
} from "lucide-react";

export default function Contact() {
  const { showAlert } = useAlert();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/contact", form);
      showAlert("Message sent! We'll be in touch soon.", "success");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      showAlert("Failed to send message. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = [
    { 
      icon: Mail, 
      label: "Email Us", 
      value: "textafricaarcade.com",
      link: "mailto:hello@textafricaarcade.com"
    },
    { 
      icon: MapPin, 
      label: "Location", 
      value: "Nairobi, Kenya",
      link: "#"
    },
    { 
      icon: Globe, 
      label: "Socials", 
      value: "@textafricaarcade",
      link: "https://twitter.com"
    }
  ];

  return (
    <div className="bg-taa-surface dark:bg-taa-dark min-h-screen transition-colors duration-300">
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-taa-primary/10 text-taa-primary rounded-full text-xs font-black uppercase tracking-widest mb-8"
          >
             Get In Touch
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-black text-taa-dark dark:text-white tracking-tighter leading-[0.9] mb-8"
          >
            Let's Start a <br /> <span className="text-taa-primary">Conversation</span>
          </motion.h1>
          <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Have a project in mind or just want to say hi? We're always open to new ideas and collaborations.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-20 pb-40">
        <div className="grid lg:grid-cols-2 gap-20">
          {/* Info */}
          <div className="space-y-12">
            <h2 className="text-3xl font-black text-taa-dark dark:text-white tracking-tight">Contact Information</h2>
            <div className="grid gap-8">
              {contactInfo.map((info, i) => (
                <motion.a
                  key={i}
                  href={info.link}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-8 rounded-3xl flex items-center justify-between group hover:border-taa-primary/20 transition-all"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-taa-primary/10 text-taa-primary flex items-center justify-center group-hover:bg-taa-primary group-hover:text-white transition-all">
                      <info.icon size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{info.label}</p>
                      <p className="text-xl font-bold text-taa-dark dark:text-white">{info.value}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="text-gray-300 group-hover:text-taa-primary transition-colors" size={24} />
                </motion.a>
              ))}
            </div>
            
            {/* <div className="glass-card p-10 rounded-[2.5rem] bg-taa-primary text-white overflow-hidden relative">
               <div className="relative z-10">
                 <h3 className="text-2xl font-black mb-4">Office Hours</h3>
                 <p className="text-lg opacity-80 font-medium">Monday — Friday <br /> 09:00 AM — 06:00 PM EAT</p>
               </div>
               <div className="absolute -bottom-10 -right-10 opacity-10">
                 <MessageSquare size={200} />
               </div>
            </div> */}
          </div>

          {/* Form */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="glass-card p-8 md:p-12 rounded-[3rem] border-taa-primary/5 shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Your Name</label>
                <input 
                  type="text" 
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className="w-full bg-taa-surface dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary rounded-2xl p-4 outline-none font-bold text-taa-dark dark:text-white"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Email Address</label>
                <input 
                  type="email" 
                  value={form.email}
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  className="w-full bg-taa-surface dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary rounded-2xl p-4 outline-none font-bold text-taa-dark dark:text-white"
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-2">Message</label>
                <textarea 
                  rows="6" 
                  value={form.message}
                  onChange={(e) => setForm({...form, message: e.target.value})}
                  className="w-full bg-taa-surface dark:bg-taa-dark/50 border-2 border-transparent focus:border-taa-primary rounded-2xl p-4 outline-none font-medium text-taa-dark dark:text-white resize-none"
                  placeholder="How can we help you?"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-taa-primary text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:brightness-110 shadow-xl shadow-taa-primary/20 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : <><Send size={20} /> Send Message</>}
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
