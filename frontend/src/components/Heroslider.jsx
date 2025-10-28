import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Logo from "../components/Logo"; // Assuming your Logo component is in this path


// If you don't pass the prop, it will default to the gradient background.

export default function Hero({ backgroundImages = [] }) {
  // --- STATE FOR CYCLING SLOGANS ---
  const slogans = [
    "Digital Transformation for Text Products",
    "Empowering African Newsrooms",
    "Driving Innovation in Storytelling",
  ];
  const [sloganIndex, setSloganIndex] = useState(0);

  // --- STATE & EFFECT FOR INFINITE BACKGROUND SCROLL ---
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Slogan cycling logic
    const sloganTimer = setInterval(() => {
      setSloganIndex((prevIndex) => (prevIndex + 1) % slogans.length);
    }, 4000);

    // Background image cycling logic
    let imageTimer;
    if (backgroundImages.length > 1) {
      imageTimer = setInterval(() => {
        setCurrentImageIndex(
          (prevIndex) => (prevIndex + 1) % backgroundImages.length
        );
      }, 5000); // Change image every 5 seconds
    }

    // Clean up timers when the component unmounts
    return () => {
      clearInterval(sloganTimer);
      if (imageTimer) {
        clearInterval(imageTimer);
      }
    };
  }, [slogans.length, backgroundImages.length]);

  // --- RENDER METHOD ---
  return (
    <section className="relative isolate overflow-hidden bg-[#1E6B2B] text-white">
      {/* --- BACKGROUND IMAGE CONTAINER --- */}
      {/* This container holds all images and handles the cross-fade animation */}
      <div className="absolute inset-0 -z-20">
        {backgroundImages.map((imageUrl, index) => (
          <img
            key={imageUrl}
            src={imageUrl}
            alt={`Hero background ${index + 1}`}
            className={`
              absolute inset-0 h-full w-full object-cover
              transition-opacity duration-1000 ease-in-out
              ${index === currentImageIndex ? "opacity-100" : "opacity-0"}
            `}
          />
        ))}
      </div>

      {/* --- OVERLAY --- */}
      {/* Ensures text is always readable over the background images */}
      <Hero backgroundImages={heroImages} />
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#1E6B2B]/95 via-[#4ca16c]/85 to-[#77BFA1]/75" />

      {/* --- MAIN CONTENT CONTAINER --- */}
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="grid items-center gap-x-8 gap-y-16 md:grid-cols-2">
          {/* Left Column: Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center md:text-left"
          >
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
              Text Africa Arcade
            </h1>
            <motion.h2
              key={sloganIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, ease: "circOut" }}
              className="mt-4 text-xl font-medium text-emerald-100 sm:text-2xl"
            >
              {slogans[sloganIndex]}
            </motion.h2>
            <p className="mt-6 text-lg leading-7 text-emerald-50 max-w-lg mx-auto md:mx-0">
              Founded in 2025, we help media organizations adapt and grow in the
              digital era through technology, data, and design thinking.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 md:justify-start">
              <a
                href="/services"
                className="rounded-md bg-white px-4 py-2.5 text-sm font-semibold text-[#1E6B2B] shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
              >
                Our Services
              </a>
              <a
                href="/contact"
                className="rounded-md px-4 py-2.5 text-sm font-semibold leading-6 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
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
            className="hidden md:flex justify-center"
          >
            <Logo size={250} mode="full" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}