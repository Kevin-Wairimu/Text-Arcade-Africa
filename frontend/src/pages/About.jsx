import React from "react";
import { motion } from "framer-motion";

// --- Custom SVG Icon Components (Unchanged) ---
const InnovationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.95m-8.95 8.95A5 5 0 0 1 9 15.05M8.95 23A9 9 0 0 1 1 15.05M2 7h6a2 2 0 0 1 2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 1 2 2v0"/><path d="m22 2-2.5 2.5"/></svg>;
const SustainabilityIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"/><path d="M12 12a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"/></svg>;
const AudienceIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/><path d="M12 20h4"/><path d="M12 4H8"/><path d="M20 12V8h-4"/><path d="M20 12l-4 4"/></svg>;

// --- Core Principles Data (Unchanged) ---
const principles = [
  { title: "Digital-First Innovation", desc: "Building capacity for news products to transition to pure digital platforms.", icon: <InnovationIcon /> },
  { title: "Audience-Centric Growth", desc: "Focusing on audience advocacy and user needs to build loyal, engaged communities.", icon: <AudienceIcon /> },
  { title: "Green Distribution", desc: "Supporting the production and distribution of content in environmentally friendly formats.", icon: <SustainabilityIcon /> },
];

export default function About() {
  return (
    // --- UPDATED: Infused a brighter green glow into the background ---
    <main className="min-h-screen bg-gradient-to-b from-[#111827] via-[#1E6B2B]/80 to-[#111827] pt-24 md:pt-32 text-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-16">
        
        {/* --- Hero Section --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#77BFA1] mb-6">
            About Text Africa Arcade
          </h1>
          <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Text Africa Arcade (TAA) is a technology lab founded in 2025 to empower newsrooms and content producers across Africa, helping them innovate, adapt, and thrive in a digital-first world.
          </p>
        </motion.div>

        {/* --- Mission & Objectives --- */}
        <div className="grid md:grid-cols-2 gap-8 mt-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            // --- UPDATED: Brighter card styling with green tint and glowing border ---
            className="bg-[#0b2818]/70 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-[#77BFA1]/30 transition-all duration-300 hover:border-[#77BFA1]/80 hover:shadow-[0_0_15px_rgba(119,191,161,0.3)]"
          >
            <h2 className="font-semibold text-2xl mb-4 text-[#77BFA1]">Our Mission</h2>
            <p className="text-gray-300 leading-relaxed">
              To support content producers to innovate, adapt, and tell compelling stories from the digital frontlines.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-[#0b2818]/70 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-[#77BFA1]/30 transition-all duration-300 hover:border-[#77BFA1]/80 hover:shadow-[0_0_15px_rgba(119,191,161,0.3)]"
          >
            <h2 className="font-semibold text-2xl mb-4 text-[#77BFA1]">Our Objectives</h2>
            <p className="text-gray-300 leading-relaxed">
              We are dedicated to building the capacity of news content products to transition to digital platforms, grow audiences, and support the production of content in green and environmentally friendly formats.
            </p>
          </motion.div>
        </div>

        {/* --- Founder Section --- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-16 bg-[#0b2818]/70 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-[#77BFA1]/30 transition-all duration-300 hover:border-[#77BFA1]/80 hover:shadow-[0_0_15px_rgba(119,191,161,0.3)]"
        >
          <h2 className="font-semibold text-2xl mb-4 text-[#77BFA1]">From the Founder</h2>
          <p className="text-gray-300 leading-relaxed max-w-3xl italic">
            "As Group Managing Editor at Mediamax, Kenya, I led a team that transitioned People Daily, Kenya’s first free newspaper, to be the country’s first digital-fully content product. I am a passionate driver of digital transformation, audience advocacy, and user needs. I believe in the power of the media as a force for good and I am concerned about the waning influence of legacy platforms. My vision is for TAA to be a leading partner in this transformation across Africa."
          </p>
        </motion.div>

        {/* --- Core Principles --- */}
        <div className="mt-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-center text-[#77BFA1] mb-12"
          >
            Our Core Principles
          </motion.h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {principles.map((principle, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.5, ease: "easeOut" }}
                className="bg-[#0b2818]/70 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-[#77BFA1]/30 text-center transition-all duration-300 hover:-translate-y-2 hover:border-[#77BFA1]/80 hover:shadow-[0_0_15px_rgba(119,191,161,0.3)] group"
              >
                {/* --- UPDATED: Brighter icon styling --- */}
                <div className="inline-block bg-[#77BFA1]/10 text-[#77BFA1] p-4 rounded-full mb-5 transition-all duration-300 group-hover:bg-[#77BFA1]/20 group-hover:scale-110">
                  {principle.icon}
                </div>
                <h3 className="font-semibold text-xl text-white mb-3">{principle.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{principle.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}