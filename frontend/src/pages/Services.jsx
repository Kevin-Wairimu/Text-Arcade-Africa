import React from "react";
import { motion } from "framer-motion";
import { 
  Zap, 
  Lightbulb, 
  Users, 
  TrendingUp, 
  Search, 
  BarChart3, 
  RefreshCw, 
  Globe, 
  LineChart, 
  GraduationCap,
  ArrowRight
} from "lucide-react";

const ServiceCard = ({ icon: Icon, title, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6 }}
    viewport={{ once: true }}
    className="glass-card group p-10 rounded-[2.5rem] border-taa-primary/5 hover:border-taa-primary/20 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
  >
    <div className="w-16 h-16 rounded-2xl bg-taa-primary/10 text-taa-primary flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-taa-primary group-hover:text-white transition-all duration-500">
      <Icon size={32} />
    </div>
    <h3 className="text-2xl font-black text-taa-dark dark:text-white mb-4 tracking-tight leading-tight">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-8 flex-1">{desc}</p>
    {/* <div className="flex items-center gap-2 text-taa-primary font-black text-sm group-hover:gap-4 transition-all duration-300 cursor-pointer">
      Learn More <ArrowRight size={18} />
    </div> */}
  </motion.div>
);

export default function Services() {
  const services = [
    {
      icon: Zap,
      title: "Digital Transformation",
      desc: "Expert strategy and systems for transitioning text products to dynamic, digital-first platforms.",
      delay: 0.1
    },
    {
      icon: Lightbulb,
      title: "Product Innovation",
      desc: "Ideation, design, and testing of storytelling tools, innovative formats, and MVPs.",
      delay: 0.2
    },
    {
      icon: Users,
      title: "Consumer Engagement",
      desc: "Developing growth experiments, impactful campaigns, and deriving analytics insights.",
      delay: 0.3
    },
    {
      icon: TrendingUp,
      title: "Audience Advocacy & Growth",
      desc: "Building loyal communities and sustainable growth through data-driven advocacy.",
      delay: 0.4
    },
    {
      icon: Search,
      title: "User Needs Analysis",
      desc: "Deep-dive research into user behaviors to inform product and content strategy.",
      delay: 0.1
    },
    {
      icon: BarChart3,
      title: "Data and Insights",
      desc: "Turning raw data into actionable insights that drive editorial and business impact.",
      delay: 0.2
    },
    {
      icon: RefreshCw,
      title: "Newsroom Transformation",
      desc: "Modernizing newsroom workflows, structures, and culture for a digital era.",
      delay: 0.3
    },
    {
      icon: Globe,
      title: "Digital Press Distribution",
      desc: "Optimizing content delivery to maximize reach and digital presence.",
      delay: 0.4
    },
    {
      icon: LineChart,
      title: "Content Performance",
      desc: "Implementing frameworks to measure and enhance content effectiveness.",
      delay: 0.5
    },
    {
      icon: GraduationCap,
      title: "Mentorship & Leadership",
      desc: "Upskilling media teams through mentorship in digital, data, and design thinking.",
      delay: 0.6
    }
  ];

  return (
    <div className="bg-taa-surface dark:bg-taa-dark min-h-screen transition-colors duration-300">
      {/* Header */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-taa-primary/10 text-taa-primary rounded-full text-xs font-black uppercase tracking-widest mb-8"
          >
             Our Offerings
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-8xl font-black text-taa-dark dark:text-white tracking-tighter leading-[0.9] mb-8"
          >
            Services & <br /> <span className="text-taa-primary">Products</span>
          </motion.h1>
          <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto font-medium leading-relaxed">
            We provide a comprehensive suite of services designed to empower media organizations across Africa to thrive in the digital-first future.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {services.map((s, i) => (
            <ServiceCard key={i} {...s} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      {/* <section className="max-w-7xl mx-auto px-6 pb-32">
        <div className="glass-card p-12 md:p-16 rounded-[3rem] border-taa-primary/10 bg-gradient-to-br from-taa-primary/5 to-transparent text-center">
          <h2 className="text-3xl md:text-5xl font-black text-taa-dark dark:text-white tracking-tight mb-8">
            Ready to empower your organization?
          </h2>
          <a
            href="/contact"
            className="inline-flex items-center gap-4 px-12 py-5 bg-taa-primary text-white rounded-2xl font-black text-lg hover:brightness-110 shadow-xl transition-all"
          >
            Start a Project <ArrowRight size={24} />
          </a>
        </div>
      </section> */}
    </div>
  );
}

