import React from "react";
import { motion } from "framer-motion";

// --- Custom SVG Icon Components for a Professional Look ---
// Using inline SVG components is clean, fast, and allows for easy styling.

const DigitalTransformationIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 19l7-7 3 3-7 7-3-3z" />
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
    <path d="M2 2l7.586 7.586" />
    <path d="M11 13a2 2 0 1 1-2-2 2 2 0 0 1 2 2z" />
  </svg>
);
const ProductInnovationIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.95m-8.95 8.95A5 5 0 0 1 9 15.05M8.95 23A9 9 0 0 1 1 15.05M2 7h6a2 2 0 0 1 2 2v6a2 2 0 0 0 2 2h6a2 2 0 0 1 2 2v0" />
    <path d="m22 2-2.5 2.5" />
    <path d="M14 10l-1-1M11 13l-1-1M8 16l-1-1" />
  </svg>
);
const ConsumerEngagementIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const AudienceGrowthIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    <path d="M12 20h4" />
    <path d="M12 4H8" />
    <path d="M20 12V8h-4" />
    <path d="M20 12l-4 4" />
  </svg>
);
const UserNeedsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="10" cy="10" r="7" />
    <path d="m21 21-6-6" />
    <path d="M10 7v6" />
    <path d="M7 10h6" />
  </svg>
);
const DataInsightsIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="21" x2="9" y2="9" />
  </svg>
);
const NewsroomTransformationIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);
const DigitalPressIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);
const PerformanceIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 12v-4" />
    <path d="M16 16v-4" />
    <path d="M8 16v-8" />
    <path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Z" />
  </svg>
);
const MentorshipIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 20a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h4Z" />
    <path d="M15 14v-2a3 3 0 0 0-3-3H9a3 3 0 0 0-3 3v2" />
    <path d="M9 20a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H9Z" />
    <path d="M6 14v-2a3 3 0 0 1 3-3h3" />
  </svg>
);

// --- Updated services data structure with new content and custom icons ---
const services = [
  {
    title: "Digital Transformation",
    desc: "Expert strategy and systems for transitioning text products to dynamic, digital-first platforms.",
    icon: <DigitalTransformationIcon />,
  },
  {
    title: "Product Innovation",
    desc: "Ideation, design, and testing of new storytelling tools, innovative formats, and Minimum Viable Products (MVPs).",
    icon: <ProductInnovationIcon />,
  },
  {
    title: "Consumer Engagement",
    desc: "Developing and executing growth experiments, impactful engagement campaigns, and deriving actionable analytics insights.",
    icon: <ConsumerEngagementIcon />,
  },
  {
    title: "Audience Advocacy & Growth",
    desc: "Building loyal communities and sustainable audience growth through data-driven advocacy programs.",
    icon: <AudienceGrowthIcon />,
  },
  {
    title: "User Needs Analysis",
    desc: "Deep-dive research into user behaviors and needs to inform product development and content strategy.",
    icon: <UserNeedsIcon />,
  },
  {
    title: "Data and Insights",
    desc: "Transforming raw data into clear, actionable insights that drive editorial and business decisions.",
    icon: <DataInsightsIcon />,
  },
  {
    title: "Newsroom Transformation",
    desc: "Modernizing newsroom workflows, structures, and culture for a digital-centric media landscape.",
    icon: <NewsroomTransformationIcon />,
  },
  {
    title: "Digital Press Distribution",
    desc: "Optimizing content delivery and distribution channels to maximize reach and impact in the digital age.",
    icon: <DigitalPressIcon />,
  },
  {
    title: "Content Performance",
    desc: "Implementing robust measurement frameworks to track, analyze, and enhance content effectiveness.",
    icon: <PerformanceIcon />,
  },
  {
    title: "Mentorship & Leadership",
    desc: "Providing mentorship and change leadership to upskill media teams on digital workflows, design thinking, and data.",
    icon: <MentorshipIcon />,
  },
];

export default function Services() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50 to-white pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-taa-primary mb-4">
            Services and Products
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto mb-12">
            We provide a comprehensive suite of services designed to empower
            media organizations for the digital future.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
              className="bg-white/60 backdrop-blur-md p-8 rounded-2xl shadow-md border border-white/50 flex flex-col items-start transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
            >
              <div className="bg-taa-primary/10 text-taa-primary p-4 rounded-full mb-5">
                {service.icon}
              </div>
              <h3 className="font-semibold text-xl text-taa-primary mb-3">
                {service.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {service.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
