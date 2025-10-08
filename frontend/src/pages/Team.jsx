import React from "react";
import { motion } from "framer-motion";

// --- SVG Icons ---
const LinkedInIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);
const TwitterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
  </svg>
);
const MapPinIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

// --- Detailed team data ---
const team = [
  {
    name: "Emeka-Mayaka Gekara",
    role: "CEO & Founder",
    img: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    bio: "A leading expert in digital transformation in Africa, a member of the Kenya Editors Guild, industry speaker and trainer.",
    socials: { linkedin: "#", twitter: "#" },
  },
  {
    name: "Peter Leftie",
    role: "Text Growth Consultant",
    img: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    bio: "A veteran news editor with a passion for the sustainability of new media audiences.",
    socials: { linkedin: "#", twitter: "#" },
  },
  {
    name: "Khalil Cassimally",
    role: "Audience Advocacy Consultant",
    img: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    location: "Based in Mauritius",
    socials: { linkedin: "#", twitter: "#" },
  },
  {
    name: "Henry Gekonde",
    role: "Research, Data & Insights",
    img: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    bio: "A consummate quality assurance wonk whose experience cuts across legacy and digital platforms.",
    socials: { linkedin: "#", twitter: "#" },
  },
  {
    name: "Prof Rose Onyango",
    role: "Linkages & Partnerships",
    img: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    bio: "CEO of the Green Belt Movement.",
    socials: { linkedin: "#", twitter: "#" },
  },
  {
    name: "Liz Mwihaki",
    role: "Executive Administrator",
    img: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    bio: "Based in Nairobi",
    socials: { linkedin: "#", twitter: "#" },
  },
  {
    name: "Dr Julius Bosire",
    role: "Academy Representative",
    img: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    bio: "Represents the Kenya Editors Guild.",
    socials: { linkedin: "#",twitter: "#" },
  },
  {
    name: "Muriam Mungi",
    role: "Green Product Advocate ",
    img: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    bio: "Represents the Kenya Editors Guild.",
    socials: { linkedin: "#",twitter: "#" },
  },
  {
    name: "Kizito Namulanda",
    role: "Reader Revenue Consultant",
    img: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    socials: { linkedin: "#",twitter: "#" },
  },
  {
    name: "N. Wa MBUGUA",
    role: "Product Design & Creative",
    img: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png",
    socials: { linkedin: "#", twitter: "#" },
  },
];

// --- Partners data with logo placeholders ---
const partners = [
  { name: "Green Belt Movement", logo: "GBM" },
  { name: "PressReader", logo: "PR" },
  { name: "Maseno University", logo: "MU" },
  { name: "Kenya Editors Guild", logo: "KEG" },
];

const socialIcons = { linkedin: <LinkedInIcon />, twitter: <TwitterIcon /> };

export default function Team() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-emerald-50 to-white pt-20 md:pt-24">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* --- Meet Our Team Section --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-center text-taa-primary mb-4">
            Meet Our Team
          </h1>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
            A collective of passionate experts dedicated to transforming the
            African media landscape through innovation and insight.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((person, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
              // --- STYLING CHANGES FOR BALANCE ---
              className="bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-md text-center border border-emerald-200/30 flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
            >
              <img
                src={person.img}
                alt={person.name}
                className="h-28 w-28 rounded-full mx-auto object-cover ring-4 ring-white shadow-sm"
              />
              {/* --- FLEX-GROW PUSHES SOCIAL LINKS TO BOTTOM --- */}
              <div className="flex-grow flex flex-col">
                <h3 className="font-semibold text-xl mt-5 text-taa-primary">
                  {person.name}
                </h3>
                <p className="text-taa-accent font-medium mt-1 text-sm">
                  {person.role}
                </p>
                {person.location && (
                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 mt-2">
                    <MapPinIcon />
                    <span>{person.location}</span>
                  </div>
                )}
                {/* --- FLEX-GROW ON BIO TO FILL SPACE --- */}
                <div className="flex-grow">
                  {person.bio && (
                    <p className="text-sm text-gray-600 mt-4 border-t border-emerald-200/50 pt-4">
                      {person.bio}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-center gap-5 mt-5 border-t border-emerald-200/50 pt-4">
                {Object.entries(person.socials).map(([platform, url]) => (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${person.name}'s ${platform}`}
                    className="text-gray-400 hover:text-taa-primary transition-colors duration-200"
                  >
                    {socialIcons[platform]}
                  </a>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- Our Partners Section --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-24"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center text-taa-primary mb-4">
            Our Partners
          </h2>
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
            We are proud to collaborate with leading organizations to drive
            media innovation.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {partners.map((partner, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
              className="bg-white/60 backdrop-blur-md p-6 rounded-2xl shadow-md border border-emerald-200/30 flex flex-col items-center justify-center text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              {/* --- LOGO PLACEHOLDER --- */}
              <div className="h-16 w-16 bg-taa-primary/10 rounded-full flex items-center justify-center mb-4">
                <span className="text-taa-primary font-bold text-xl">
                  {partner.logo}
                </span>
              </div>
              <h3 className="font-semibold text-taa-primary text-base">
                {partner.name}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
