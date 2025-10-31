import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "../components/Logo";

const Hero = ({ backgroundImages = [] }) => {
  const slogans = [
    "Digital Transformation for Text Products",
    "Empowering African Newsrooms",
    "Driving Innovation in Storytelling",
  ];

  const [currentImage, setCurrentImage] = useState(0);
  const [sloganIndex, setSloganIndex] = useState(0);

  // ✅ Preload images
  useEffect(() => {
    backgroundImages.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [backgroundImages]);

  // ✅ Auto-slide images
  useEffect(() => {
    const imgInterval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(imgInterval);
  }, [backgroundImages.length]);

  // ✅ Cycle slogans
  useEffect(() => {
    const sloganInterval = setInterval(() => {
      setSloganIndex((prev) => (prev + 1) % slogans.length);
    }, 4000);
    return () => clearInterval(sloganInterval);
  }, [slogans.length]);

  const fadeVariants = {
    hidden: { opacity: 0, scale: 1.05 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 1.2, ease: "easeInOut" },
    },
    exit: {
      opacity: 0,
      scale: 0.98,
      transition: { duration: 1.2, ease: "easeInOut" },
    },
  };

  return (
    <section className="relative h-[85vh] w-full overflow-hidden rounded-b-3xl shadow-lg">
      {/* Background slideshow */}
      <AnimatePresence mode="wait">
        <motion.img
          key={currentImage}
          src={backgroundImages[currentImage]}
          alt={`Hero background ${currentImage + 1}`}
          variants={fadeVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-transparent z-10" />

      {/* Hero Text */}
      <div className="relative z-20 flex flex-col justify-center items-center h-full text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-white text-4xl md:text-6xl font-extrabold drop-shadow-lg"
        >
          Text Africa Arcade
        </motion.h1>

        <AnimatePresence mode="wait">
          <motion.h2
            key={sloganIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.6 }}
            className="mt-4 text-[#E8F5E9] text-lg md:text-2xl font-medium drop-shadow-md"
          >
            {slogans[sloganIndex]}
          </motion.h2>
        </AnimatePresence>

        <p className="mt-6 text-[#C8E6C9] text-base md:text-lg max-w-2xl leading-relaxed">
          Founded in 2025, we help media organizations adapt and grow in the
          digital era through technology, data, and design thinking.
        </p>

        <div className="mt-10 flex gap-x-6">
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

        {/* Optional: Logo fade-in on large screens */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
          className="hidden md:flex justify-center mt-10"
        >
          <Logo size={200} mode="full" />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
