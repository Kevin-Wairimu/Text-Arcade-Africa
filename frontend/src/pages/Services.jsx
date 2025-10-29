import React from "react";
import { motion } from "framer-motion";

// --- SVG Icons ---
const DigitalTransformationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19l7-7 3 3-7 7-3-3z" />
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    <path d="M2 2l7.586 7.586" />
    <path d="M11 13a2 2 0 1 1-2-2 2 2 0 0 1 2 2z" />
  </svg>
);

const ProductInnovationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.95m-8.95 8.95A5 5 0 0 1 9 15.05M8.95 23A9 9 0 0 1 1 15.05M2 7h6a2 2 0 0 1 2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 1 2 2v0" />
    <path d="m22 2-2.5 2.5" />
  </svg>
);

const ConsumerEngagementIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const AudienceGrowthIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    <path d="M12 20h4" />
    <path d="M12 4H8" />
    <path d="M20 12V8h-4" />
    <path d="M20 12l-4 4" />
  </svg>
);

const UserNeedsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="10" cy="10" r="7" />
    <path d="m21 21-6-6" />
    <path d="M10 7v6" />
    <path d="M7 10h6" />
  </svg>
);

const DataInsightsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);

const NewsroomTransformationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

const DigitalPressIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const PerformanceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 12v-4" />
    <path d="M16 16v-4" />
    <path d="M8 16v-8" />
    <path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Z" />
  </svg>
);

const MentorshipIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 20a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h4Z" />
    <path d="M15 14v-2a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v2" />
    <path d="M9 20a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H9Z" />
    <path d="M6 14v-2a3 3 0 0 1 3-3h3" />
  </svg>
);

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
    <main className="min-h-screen bg-white text-[#2E7D32] pt-24 md:pt-32">
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-20"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">{`Services & Products`}</h1>
          <p className="text-gray-800 text-lg leading-relaxed max-w-3xl mx-auto">
            We provide a comprehensive suite of services designed to empower media organizations across Africa to thrive in the digital-first future.
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
              className="bg-[#2E7D32]/5 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-[#2E7D32]/30 text-center transition-all duration-300 hover:-translate-y-2 hover:border-[#2E7D32]/50 hover:shadow-2xl"
            >
              <div className="inline-block text-[#2E7D32] p-4 rounded-full mb-5">
                {service.icon}
              </div>
              <h3 className="font-semibold text-xl text-[#2E7D32] mb-3">{service.title}</h3>
              <p className="text-gray-800 text-sm leading-relaxed">{service.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
