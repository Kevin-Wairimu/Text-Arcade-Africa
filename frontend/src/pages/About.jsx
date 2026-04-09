import React from "react";
import { motion } from "framer-motion";
import { Target, Zap, Shield, Globe, Award, Quote } from "lucide-react";

const Principle = ({ icon: Icon, title, desc, delay }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    viewport={{ once: true }}
    className="glass-card p-8 rounded-[2rem] border-taa-primary/5 hover:border-taa-primary/20 transition-all group"
  >
    <div className="w-14 h-14 rounded-2xl bg-taa-primary/10 text-taa-primary flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-taa-primary group-hover:text-white transition-all">
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-black text-taa-dark dark:text-white mb-3 tracking-tight">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{desc}</p>
  </motion.div>
);

export default function About() {
  return (
    <div className="bg-taa-surface dark:bg-taa-dark transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-taa-primary/10 text-taa-primary rounded-full text-xs font-black uppercase tracking-widest mb-8"
          >
             Our Story
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-black text-taa-dark dark:text-white tracking-tighter leading-none mb-8"
          >
            Empowering the <br /> <span className="text-taa-primary">African Voice</span>
          </motion.h1>
          <motion.p 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ delay: 0.2 }}
             className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto font-medium leading-relaxed"
          >
            Text Africa Arcade (TAA) is a technology lab founded in 2025 to empower newsrooms and content producers across Africa, helping them innovate, adapt, and thrive in a digital-first world.
          </motion.p>
        </div>
      </section>

      {/* Mission & Objectives */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-10 rounded-[2.5rem] border-taa-primary/5 shadow-2xl"
          >
            <h2 className="text-3xl font-black text-taa-dark dark:text-white mb-6">Our Mission</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              To support content producers to innovate, adapt, and tell compelling stories from the digital frontlines.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="glass-card p-10 rounded-[2.5rem] border-taa-primary/5 shadow-2xl"
          >
            <h2 className="text-3xl font-black text-taa-dark dark:text-white mb-6">Our Objectives</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              We are dedicated to building the capacity of news content products to transition to digital platforms, grow audiences, and support the production of content in green and environmentally friendly formats.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-12 md:p-20 rounded-[3rem] border-taa-primary/5 bg-taa-primary text-white overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10">
            <Quote size={64} className="mb-8 opacity-40" />
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter mb-10 leading-tight">
              From the Founder
            </h2>
            <p className="text-xl md:text-3xl font-medium opacity-90 leading-relaxed italic mb-12">
              "As Group Managing Editor at Mediamax, Kenya, I led a team that transitioned People Daily, Kenya’s first free newspaper, to be the country’s first digital-fully content product. I am a passionate driver of digital transformation, audience advocacy, and user needs. I believe in the power of the media as a force for good and I am concerned about the waning influence of legacy platforms. My vision is for TAA to be a leading partner in this transformation across Africa."
            </p>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-2xl">E</div>
              <div>
                <p className="text-xl font-black tracking-tight">Emeka-Mayaka Gekara</p>
                <p className="text-sm font-bold uppercase tracking-widest opacity-60">Text Africa Arcade</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Core Principles */}
      <section className="max-w-7xl mx-auto px-6 py-20 pb-40">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-6xl font-black text-center text-taa-dark dark:text-white tracking-tighter mb-16"
        >
          Our Core Principles
        </motion.h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Principle 
            icon={Zap} 
            title="Digital-First Innovation" 
            desc="Building capacity for news products to transition to pure digital platforms." 
            delay={0.1}
          />
          <Principle 
            icon={Globe} 
            title="Audience-Centric Growth" 
            desc="Focusing on audience advocacy and user needs to build loyal, engaged communities." 
            delay={0.2}
          />
          <Principle 
            icon={Award} 
            title="Green Distribution" 
            desc="Supporting the production and distribution of content in environmentally friendly formats." 
            delay={0.3}
          />
        </div>
      </section>
    </div>
  );
}

