import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Logo from "../components/Logo";

export default function Hero() {
  const slogans = [
    "Digital Transformation for Text Products",
    "Empowering African Newsrooms",
    "Driving Innovation in Storytelling",
  ];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % slogans.length),
      4000
    );
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-[#1E6B2B] to-[#77BFA1] text-white">
      <div className="max-w-7xl mx-auto px-6 py-24 grid md:grid-cols-2 gap-8 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl font-extrabold leading-tight">
            Text Africa Arcade
          </h1>
          <motion.h2
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="mt-4 text-2xl font-medium text-emerald-100"
          >
            {slogans[index]}
          </motion.h2>
          <p className="mt-6 text-lg text-emerald-50 max-w-md">
            Founded in 2025, we help media organizations adapt and grow in the
            digital era through technology, data, and design thinking.
          </p>

          <div className="mt-8 flex gap-4">
            <a href="/services" className="btn-primary">
              Our Services
            </a>
            <a href="/contact" className="btn-outline">
              Contact Us
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="hidden md:block"
        >
          <Logo size={250} mode="full" />
        </motion.div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
    </section>
  );
}
