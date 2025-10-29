import React from "react";
import { motion } from "framer-motion";

// --- Custom SVG Icon Components (unchanged, for consistency) ---
const DigitalTransformationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19l7-7 3 3-7 7-3-3z" />
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    <path d="M2 2l7.586 7.586" />
    <path d="M11 13a2 2 0 1 1-2-2 2 2 0 0 1 2 2z" />
  </svg>
);

// ... all other icon components remain unchanged ...

// --- Services Data ---
const services = [
  { title: "Digital Transformation", desc: "Expert strategy and systems for transitioning text products to dynamic, digital-first platforms.", icon: <DigitalTransformationIcon /> },
  { title: "Product Innovation", desc: "Ideation, design, and testing of storytelling tools, innovative formats, and MVPs.", icon: <ProductInnovationIcon /> },
  { title: "Consumer Engagement", desc: "Developing growth experiments, impactful campaigns, and deriving analytics insights.", icon: <ConsumerEngagementIcon /> },
  { title: "Audience Advocacy & Growth", desc: "Building loyal communities and sustainable growth through data-driven advocacy.", icon: <AudienceGrowthIcon /> },
  { title: "User Needs Analysis", desc: "Deep-dive research into user behaviors to inform product and content strategy.", icon: <UserNeedsIcon /> },
  { title: "Data and Insights", desc: "Turning raw data into actionable insights that drive editorial and business impact.", icon: <DataInsightsIcon /> },
  { title: "Newsroom Transformation", desc: "Modernizing newsroom workflows, structures, and culture for a digital era.", icon: <NewsroomTransformationIcon /> },
  { title: "Digital Press Distribution", desc: "Optimizing content delivery to maximize reach and digital presence.", icon: <DigitalPressIcon /> },
  { title: "Content Performance", desc: "Implementing frameworks to measure and enhance content effectiveness.", icon: <PerformanceIcon /> },
  { title: "Mentorship & Leadership", desc: "Upskilling media teams through mentorship in digital, data, and design thinking.", icon: <MentorshipIcon /> },
];

export default function Services() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#111827] via-[#0b2818]/80 to-[#111827] pt-24 md:pt-32 text-gray-100">
      <div className="max-w-6xl mx-auto px-6 py-16">
        
        {/* --- Header Section --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#77BFA1] mb-6">
            Services & Products
          </h1>
          <p className="text-lg text-[#69f0ae] leading-relaxed max-w-3xl mx-auto">
            We provide a comprehensive suite of services designed to empower media organizations across Africa to thrive in the digital-first future.
          </p>
        </motion.div>

        {/* --- Services Grid --- */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
              className="bg-[#0b2818]/70 backdrop-blur-lg p-8 rounded-2xl shadow-xl border border-[#77BFA1]/30 text-center transition-all duration-300 hover:-translate-y-2 hover:border-[#77BFA1]/80 hover:shadow-[0_0_20px_rgba(119,191,161,0.3)] group"
            >
              <div className="inline-block bg-[#77BFA1]/10 text-[#77BFA1] p-4 rounded-full mb-5 transition-all duration-300 group-hover:bg-[#77BFA1]/20 group-hover:scale-110">
                {service.icon}
              </div>
              <h3 className="font-semibold text-xl text-white mb-3">{service.title}</h3>
              <p className="text-[#69f0ae] text-sm leading-relaxed">{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
