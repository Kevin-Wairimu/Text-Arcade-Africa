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

  useEffect(() => {
    if (backgroundImages.length === 0) return;
    const imgInterval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
    }, 6000);
    return () => clearInterval(imgInterval);
  }, [backgroundImages.length]);

  useEffect(() => {
    const sloganInterval = setInterval(() => {
      setSloganIndex((prev) => (prev + 1) % slogans.length);
    }, 4500);
    return () => clearInterval(sloganInterval);
  }, [slogans.length]);

  const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 1.5 } },
    exit: { opacity: 0, transition: { duration: 1.5 } },
  };

  return (
    <section className="relative h-[70vh] md:h-[85vh] w-full overflow-hidden sm:rounded-b-[2.5rem] md:rounded-b-[4rem] shadow-2xl bg-taa-dark">
      {/* Background Images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImage}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={fadeVariants}
          className="absolute inset-0"
        >
          <img
            src={backgroundImages[currentImage]}
            alt="Hero Background"
            className="w-full h-full object-cover opacity-50 scale-105"
          />
        </motion.div>
      </AnimatePresence>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-taa-dark/80 via-transparent to-taa-dark/60 z-10" />

      {/* Content */}
      <div className="relative z-20 flex flex-col justify-center items-center h-full text-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="mb-4 md:mb-8"
        >
          <Logo size={window.innerWidth < 768 ? 60 : 80} mode="icon" />
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-white text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter drop-shadow-2xl leading-[0.9]"
        >
          Text Africa Arcade
        </motion.h1>

        <div className="h-12 sm:h-16 flex items-center justify-center overflow-hidden mt-4 md:mt-6">
          <AnimatePresence mode="wait">
            <motion.h2
              key={sloganIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-taa-accent text-lg sm:text-2xl md:text-3xl font-bold tracking-wide uppercase px-4"
            >
              {slogans[sloganIndex]}
            </motion.h2>
          </AnimatePresence>
        </div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="mt-6 md:mt-8 text-gray-200 text-sm sm:text-lg md:text-xl max-w-2xl leading-relaxed font-medium px-4"
        >
          Helping media organizations adapt and grow in the
          digital era through technology, data, and design thinking.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-10 md:mt-12 flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto px-10 sm:px-0"
        >
          <a href="/services" className="btn-primary w-full sm:w-auto text-center">
            Our Services
          </a>
          <a
            href="/contact"
            className="px-8 py-3 md:py-4 border-2 border-white/30 backdrop-blur-md text-white text-sm md:text-lg font-bold rounded-xl hover:bg-white/10 transition-all text-center"
          >
            Contact Us
          </a>
        </motion.div>
      </div>
      
      {/* Scroll Indicator */}
      {/* <div className="absolute bottom-6 md:bottom-10 left-1/2 -translate-x-1/2 z-20 hidden sm:block">
        <motion.div 
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-5 h-8 md:w-6 md:h-10 border-2 border-white/30 rounded-full flex justify-center pt-1 md:pt-2"
        >
          <div className="w-1 h-1.5 md:w-1 md:h-2 bg-white rounded-full" />
        </motion.div>
      </div> */}
    </section>
  );
};

export default Hero;
