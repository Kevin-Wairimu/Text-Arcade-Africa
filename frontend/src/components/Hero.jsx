import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../components/Logo";

export default function Hero({ backgroundImages = [] }) {
  const slogans = [
    "Digital Transformation for Text Products",
    "Empowering African Newsrooms",
    "Driving Innovation in Storytelling",
  ];
  const [sloganIndex, setSloganIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const sloganTimer = setInterval(() => {
      setSloganIndex((prev) => (prev + 1) % slogans.length);
    }, 4000);

    let imageTimer;
    if (backgroundImages.length > 1) {
      imageTimer = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
      }, 5000);
    }

    return () => {
      clearInterval(sloganTimer);
      if (imageTimer) clearInterval(imageTimer);
    };
  }, [slogans.length, backgroundImages.length]);

  return (
    <section className="relative isolate overflow-hidden bg-[#2E7D32] text-white">
      {/* Background slider */}
      <div className="absolute inset-0 -z-20">
        {/* Static green overlay */}
        <div className="absolute inset-0 bg-[#2E7D32]/20 pointer-events-none" />

        {backgroundImages.map((url, index) => (
          <AnimatePresence key={url}>
            {index === currentImageIndex && (
              <motion.img
                key={url}
                src={url}
                alt={`Hero background ${index + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
          </AnimatePresence>
        ))}
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="grid items-center gap-x-8 gap-y-16 md:grid-cols-2">
          {/* Left Column: Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center md:text-left relative z-10"
          >
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-white drop-shadow-lg">
              Text Africa Arcade
            </h1>
            <motion.h2
              key={sloganIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: "circOut" }}
              className="mt-4 text-xl font-medium sm:text-2xl text-white drop-shadow-md"
            >
              {slogans[sloganIndex]}
            </motion.h2>

            {/* Paragraph with subtle green background */}
            <p className="mt-6 text-lg leading-7 max-w-lg mx-auto md:mx-0 text-white drop-shadow-md bg-[#2E7D32]/10 px-3 py-2 rounded-lg">
              Founded in 2025, we help media organizations adapt and grow in the
              digital era through technology, data, and design thinking.
            </p>

            <div className="mt-10 flex items-center justify-center gap-x-6 md:justify-start">
              <a
                href="/services"
                className="rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-[#2E7D32] shadow-sm hover:bg-gray-200 transition-colors"
              >
                Our Services
              </a>
              <a
                href="/contact"
                className="rounded-md px-4 py-2.5 text-sm font-semibold leading-6 text-white/90 hover:text-white hover:bg-white/10 transition-colors"
              >
                Contact Us <span aria-hidden="true">→</span>
              </a>
            </div>
          </motion.div>

          {/* Right Column: Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
            className="hidden md:flex justify-center relative z-10"
          >
            <Logo size={250} mode="full" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
