import React from "react";
import { motion } from "framer-motion";
import { Linkedin, Twitter, Mail, ExternalLink, Globe, Award } from "lucide-react";

const TeamMember = ({ name, role, bio, delay, location }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6 }}
    viewport={{ once: true }}
    className="glass-card group p-8 rounded-[2.5rem] border-taa-primary/5 hover:border-taa-primary/20 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
  >
    <div className="relative w-24 h-24 rounded-3xl bg-taa-primary/10 text-taa-primary flex items-center justify-center mb-8 font-black text-3xl group-hover:bg-taa-primary group-hover:text-white transition-all duration-500">
      {name.split(' ').map(n => n[0]).join('').substring(0, 2)}
    </div>
    
    <div className="flex-1">
      <h3 className="text-2xl font-black text-taa-dark dark:text-white mb-1 tracking-tight">{name}</h3>
      <p className="text-taa-primary dark:text-taa-accent font-black text-xs uppercase tracking-widest mb-4">{role}</p>
      {location && (
        <p className="text-gray-400 text-xs font-bold mb-4 flex items-center gap-1">
          <Globe size={12} /> {location}
        </p>
      )}
      <p className="text-gray-500 dark:text-gray-400 font-medium text-sm leading-relaxed">
        {bio}
      </p>
    </div>

    <div className="mt-8 pt-6 border-t border-taa-primary/5 flex gap-4">
      <div className="w-8 h-8 rounded-full bg-taa-primary/5 flex items-center justify-center text-taa-primary hover:bg-taa-primary hover:text-white transition-colors cursor-pointer">
        <Linkedin size={14} />
      </div>
      <div className="w-8 h-8 rounded-full bg-taa-primary/5 flex items-center justify-center text-taa-primary hover:bg-taa-primary hover:text-white transition-colors cursor-pointer">
        <Mail size={14} />
      </div>
    </div>
  </motion.div>
);

const PartnerLogo = ({ short, name, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    viewport={{ once: true }}
    className="glass-card p-8 rounded-3xl border-taa-primary/5 flex flex-col items-center justify-center text-center group hover:border-taa-primary/20 transition-all"
  >
    <div className="text-3xl font-black text-taa-primary/20 mb-2 group-hover:text-taa-primary transition-colors">{short}</div>
    <p className="text-sm font-bold text-gray-500 dark:text-gray-400">{name}</p>
  </motion.div>
);

export default function Team() {
  const team = [
    {
      name: "Emeka-Mayaka Gekara",
      role: "CEO & Founder",
      bio: "A leading expert in digital transformation in Africa, a member of the Kenya Editors Guild, speech writer, media scholar, industry speaker and trainer.",
      delay: 0.1
    },
    {
      name: "Peter Leftie",
      role: "Text Growth Consultant",
      bio: "A veteran news editor with a passion for the sustainability of new media audiences.",
      delay: 0.2
    },
    {
      name: "Khalil Cassimally",
      role: "Audience Advocacy Consultant",
      bio: "Focusing on audience advocacy and user needs to build loyal, engaged communities.",
      location: "Based in Mauritius",
      delay: 0.3
    },
    {
      name: "Henry Gekonde",
      role: "Research, Data & Insights",
      bio: "A consummate quality assurance wonk whose experience cuts across legacy and digital platforms.",
      delay: 0.4
    },
    {
      name: "Prof Rose Onyango",
      role: "Linkages & Partnerships",
      bio: "Developing strategic institutional connections and cross-border media collaborations.",
      delay: 0.5
    },
    {
      name: "Liz Mwihaki",
      role: "Executive Administrator",
      bio: "Coordinating operations and strategic administration for the TAA collective.",
      location: "Based in Nairobi",
      delay: 0.6
    },
    {
      name: "Dr Julius Bosire",
      role: "Academy Representative",
      bio: "Represents the Kenya Editors Guild and bridges the gap between media practice and academia.",
      delay: 0.7
    },
    {
      name: "Muriam Mungi",
      role: "Green Product Advocate",
      bio: "Dedicated to supporting the production and distribution of content in environmentally friendly formats.",
      delay: 0.8
    },
    {
      name: "Kizito Namulanda",
      role: "Reader Revenue Consultant",
      bio: "Expert in developing sustainable monetization models and direct reader support strategies.",
      delay: 0.1
    },
    {
      name: "N. Wa MBUGUA",
      role: "Product Design & Creative",
      bio: "Architecting visual identities and user-centric designs for digital news products.",
      delay: 0.2
    }
  ];

  const partners = [
    { short: "GBM", name: "Green Belt Movement" },
    { short: "PR", name: "PressReader" },
    { short: "MU", name: "Maseno University" },
    { short: "KEG", name: "Kenya Editors Guild" }
  ];

  return (
    <div className="bg-taa-surface dark:bg-taa-dark min-h-screen transition-colors duration-300">
      {/* Hero */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden text-center">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-taa-primary/10 text-taa-primary rounded-full text-xs font-black uppercase tracking-widest mb-8"
          >
             Meet Our Team
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-black text-taa-dark dark:text-white tracking-tighter leading-[0.9] mb-8"
          >
            The Minds Behind <br /> <span className="text-taa-primary">The Arcade</span>
          </motion.h1>
          <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto font-medium leading-relaxed">
            A collective of passionate experts dedicated to transforming the African media landscape through innovation, data, and design thinking.
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((member, i) => (
            <TeamMember key={i} {...member} />
          ))}
        </div>
      </section>

      {/* Partners */}
      <section className="max-w-7xl mx-auto px-6 py-32 border-t border-taa-primary/5">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-taa-dark dark:text-white tracking-tighter mb-6">Our Partners</h2>
          <p className="text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">
            We are proud to collaborate with leading organizations to drive media innovation across the continent.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {partners.map((p, i) => (
            <PartnerLogo key={i} {...p} delay={i * 0.1} />
          ))}
        </div>
      </section>

      {/* Join the mission CTA */}
      {/* <section className="max-w-7xl mx-auto px-6 pb-40">
        <div className="glass-card p-12 md:p-20 rounded-[3rem] border-taa-primary/5 bg-taa-dark text-white relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 w-full h-full bg-taa-primary/10 opacity-30 pointer-events-none" />
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 leading-tight">
            Want to join the mission?
          </h2>
          <p className="text-xl opacity-70 mb-12 max-w-2xl mx-auto font-medium">
            We're always looking for talented designers, developers, and strategists who are 
            passionate about the future of African media.
          </p>
          <a href="/contact" className="inline-flex items-center gap-4 px-12 py-5 bg-taa-primary text-white rounded-2xl font-black text-lg hover:brightness-110 shadow-xl transition-all">
            Start a Conversation <ExternalLink size={24} />
          </a>
        </div>
      </section> */}
    </div>
  );
}
