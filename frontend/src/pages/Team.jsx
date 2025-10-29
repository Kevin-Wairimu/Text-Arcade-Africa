import React from "react";
import { motion } from "framer-motion";

// --- SVG Icons ---
const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const TwitterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
  </svg>
);

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

// --- Data ---
const team = [
  { name: "Emeka-Mayaka Gekara", role: "CEO & Founder", img: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png", bio: "A leading expert in digital transformation in Africa, a member of the Kenya Editors Guild, speech writer, media scholar, industry speaker and trainer.", socials: { linkedin: "#", twitter: "#" } },
  { name: "Peter Leftie", role: "Text Growth Consultant", img: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png", bio: "A veteran news editor with a passion for the sustainability of new media audiences.", socials: { linkedin: "#", twitter: "#" } },
  { name: "Khalil Cassimally", role: "Audience Advocacy Consultant", location: "Based in Mauritius", img: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png", bio: "-", socials: { linkedin: "#", twitter: "#" } },
  { name: "Henry Gekonde", role: "Research, Data & Insights", img: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png", bio: "A consummate quality assurance wonk whose experience cuts across legacy and digital platforms.", socials: { linkedin: "#", twitter: "#" } },
  { name: "Prof Rose Onyango", role: "Linkages & Partnerships", img: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png", bio: "-", socials: { linkedin: "#", twitter: "#" } },
  { name: "Liz Mwihaki", role: "Executive Administrator", img: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png", bio: "Based in Nairobi", socials: { linkedin: "#", twitter: "#" } },
  { name: "Dr Julius Bosire", role: "Academy Representative", img: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png", bio: "-", socials: { linkedin: "#", twitter: "#" } },
  { name: "Muriam Mungi", role: "Green Product Advocate", img: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png", bio: "Represents the Kenya Editors Guild.", socials: { linkedin: "#", twitter: "#" } },
  { name: "Kizito Namulanda", role: "Reader Revenue Consultant", img: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png", bio: "-", socials: { linkedin: "#", twitter: "#" } },
  { name: "N. Wa MBUGUA", role: "Product Design & Creative", img: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png", bio: "-", socials: { linkedin: "#", twitter: "#" } },
];

const partners = [
  { name: "Green Belt Movement", logo: "GBM" },
  { name: "PressReader", logo: "PR" },
  { name: "Maseno University", logo: "MU" },
  { name: "Kenya Editors Guild", logo: "KEG" },
];

const socialIcons = { linkedin: <LinkedInIcon />, twitter: <TwitterIcon /> };

// --- Main Component ---
export default function Team() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#111827] via-[#1E6B2B]/80 to-[#111827] pt-24 md:pt-32 text-gray-100 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-16">

        {/* Section Title */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#77BFA1] mb-6">Meet Our Team</h1>
          <p className="text-gray-300 max-w-3xl mx-auto text-lg leading-relaxed">
            A collective of passionate experts dedicated to transforming the African media landscape through innovation, data, and design thinking.
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {team.map((person, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="bg-[#0b2818]/70 backdrop-blur-lg p-8 rounded-2xl shadow-xl text-center border border-[#77BFA1]/30 hover:-translate-y-2 hover:shadow-[0_0_15px_rgba(119,191,161,0.3)] transition-all duration-300 flex flex-col h-full"
            >
              <img
                src={person.img}
                alt={person.name}
                className="h-32 w-32 rounded-full mx-auto object-cover ring-4 ring-[#77BFA1]/30 shadow-lg mb-6"
              />
              <h3 className="font-bold text-2xl text-white mb-1">{person.name}</h3>
              <p className="text-[#77BFA1] font-medium text-sm uppercase tracking-wider mb-3">{person.role}</p>
              
              {person.location && (
                <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 mb-4">
                  <MapPinIcon />
                  <span>{person.location}</span>
                </div>
              )}

              {person.bio && person.bio !== "-" && (
                <p className="text-gray-300 text-sm leading-relaxed border-t border-white/10 pt-4 mt-2 flex-grow">{person.bio}</p>
              )}

              <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-white/10">
                {Object.entries(person.socials).map(([platform, url]) => (
                  <a key={platform} href={url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#77BFA1] transition-transform duration-300 hover:scale-110">
                    {socialIcons[platform]}
                  </a>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Partners Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-32 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#77BFA1] mb-6">Our Partners</h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg mb-12">
            We are proud to collaborate with leading organizations to drive media innovation across the continent.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {partners.map((partner, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-[#0b2818]/70 backdrop-blur-md p-8 rounded-2xl border border-[#77BFA1]/30 flex flex-col items-center justify-center text-center hover:-translate-y-1 hover:border-[#77BFA1]/60 hover:shadow-[0_0_15px_rgba(119,191,161,0.3)] transition-all duration-300 group"
              >
                <div className="h-20 w-20 bg-[#77BFA1]/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#77BFA1]/20 transition">
                  <span className="text-[#77BFA1] font-bold text-xl group-hover:text-white transition">{partner.logo}</span>
                </div>
                <h3 className="font-semibold text-gray-200 group-hover:text-white transition">{partner.name}</h3>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  );
}
