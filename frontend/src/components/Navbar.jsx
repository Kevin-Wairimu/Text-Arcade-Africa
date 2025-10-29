import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAlert } from "../context/AlertContext";
import Logo from "./Logo";

export default function Nav() {
  // --- REMOVED: The 'scrolled' state is no longer needed ---
  // const [scrolled, setScrolled] = useState(false);
  
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const navLinks = [
    { name: "Home", to: "/" },
    { name: "About", to: "/about" },
    { name: "Services", to: "/services" },
    { name: "Team", to: "/team" },
    { name: "Contact", to: "/contact" },
  ];

  // --- REMOVED: The scroll event listener is no longer needed ---
  /*
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    showAlert("Logged out successfully!", "logout");
    setTimeout(() => navigate("/"), 1200);
  };

  const dashboardPath =
    role === "Admin" || role === "Employee" ? "/admin" : "/client";

  // --- RENDER METHOD ---
  return (
    // --- UPDATED: Removed conditional logic to make the background always solid ---
    <header
      className="fixed w-full top-0 z-50 bg-[#111827]/80 backdrop-blur-lg border-b border-white/10 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* --- Logo Section --- */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Logo size={44} mode="icon" />
          </motion.div>
          <div>
            {/* --- SIMPLIFIED: Redundant class logic removed --- */}
            <div className="font-extrabold text-xl text-white tracking-tight">
              Text Africa Arcade
            </div>
            <div className="text-xs text-gray-300 italic">
              Digital transformation for text products
            </div>
          </div>
        </Link>

        {/* --- Desktop Navigation --- */}
        <nav className="hidden md:flex items-center gap-6 font-medium">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.to}
              className={({ isActive }) =>
                `transition-colors hover:text-[#77BFA1] ${
                  isActive
                    ? "text-[#77BFA1] border-b-2 border-[#77BFA1] pb-1"
                    : "text-gray-200"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          {/* Auth Buttons */}
          <div className="flex items-center gap-2 pl-4">
            {token ? (
              <>
                <NavLink
                  to={dashboardPath}
                  className="text-gray-200 hover:text-[#77BFA1] transition-colors"
                >
                  Dashboard
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="bg-red-600/80 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-full transition-all duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-[#1E6B2B] hover:bg-[#77BFA1] hover:text-black text-white text-sm px-4 py-2 rounded-full transition-all duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="border border-[#77BFA1] text-[#77BFA1] hover:bg-[#77BFA1] hover:text-black text-sm px-4 py-2 rounded-full transition-all duration-300"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* --- Mobile Menu Icon --- */}
        <motion.button
          className="md:hidden text-white focus:outline-none z-50"
          onClick={() => setMenuOpen(!menuOpen)}
          whileTap={{ scale: 0.9 }}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={32} /> : <Menu size={32} />}
        </motion.button>
      </div>

      {/* --- Mobile Menu --- */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40 md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-gradient-to-b from-[#111827] via-[#0b2818] to-[#111827] border-l border-white/10 shadow-2xl z-50 flex flex-col p-8"
            >
              <div className="flex flex-col gap-6 text-xl font-medium text-gray-200">
                {navLinks.map((link) => (
                  <NavLink
                    key={`mobile-${link.name}`}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      isActive ? "text-[#77BFA1] font-semibold" : "hover:text-white"
                    }
                  >
                    {link.name}
                  </NavLink>
                ))}
              </div>

              {/* Auth Buttons in Mobile Menu */}
              <div className="border-t border-white/10 mt-8 pt-6">
                {token ? (
                  <div className="flex flex-col gap-4">
                    <NavLink to={dashboardPath} onClick={() => setMenuOpen(false)} className="text-[#77BFA1] text-xl font-medium">
                      Dashboard
                    </NavLink>
                    <button onClick={() => { handleLogout(); setMenuOpen(false); }}
                      className="w-full text-center bg-red-600/80 text-white py-2.5 rounded-full hover:bg-red-600"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4">
                    <Link to="/login" onClick={() => setMenuOpen(false)}
                      className="w-full text-center bg-[#1E6B2B] hover:bg-[#77BFA1] hover:text-black text-white py-2.5 rounded-full"
                    >
                      Login
                    </Link>
                    <Link to="/register" onClick={() => setMenuOpen(false)}
                      className="w-full text-center border border-[#77BFA1] text-[#77BFA1] py-2.5 rounded-full hover:bg-[#77BFA1] hover:text-black"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>

              <div className="mt-auto text-sm text-gray-400">
                <p>© {new Date().getFullYear()} Text Africa Arcade</p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}