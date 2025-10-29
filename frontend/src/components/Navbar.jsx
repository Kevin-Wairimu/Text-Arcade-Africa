import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAlert } from "../context/AlertContext";
import Logo from "./Logo";

export default function Nav() {
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    showAlert("Logged out successfully!", "logout");
    setTimeout(() => navigate("/"), 1200);
  };

  const dashboardPath =
    role === "Admin" || role === "Employee" ? "/admin" : "/client";

  return (
    <header className="fixed w-full top-0 z-50 bg-[#1E6B2B] shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Logo size={44} mode="icon" />
          </motion.div>
          <div>
            <div className="font-extrabold text-xl text-white tracking-tight">
              Text Africa Arcade
            </div>
            <div className="text-xs text-white/80 italic">
              Digital transformation for text products
            </div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 font-medium text-white">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.to}
              className={({ isActive }) =>
                `transition-colors hover:text-[#81C784] ${
                  isActive
                    ? "text-[#81C784] border-b-2 border-[#81C784] pb-1"
                    : ""
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
                  className="hover:text-[#81C784] transition-colors"
                >
                  Dashboard
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="bg-white text-[#1E6B2B] text-sm px-4 py-2 rounded-full hover:bg-[#81C784] hover:text-white transition-all duration-300"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-white text-[#1E6B2B] hover:bg-[#81C784] hover:text-white text-sm px-4 py-2 rounded-full transition-all duration-300"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="border border-white text-white hover:bg-white hover:text-[#1E6B2B] text-sm px-4 py-2 rounded-full transition-all duration-300"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Menu Icon */}
        <motion.button
          className="md:hidden text-white focus:outline-none z-50"
          onClick={() => setMenuOpen(!menuOpen)}
          whileTap={{ scale: 0.9 }}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={32} /> : <Menu size={32} />}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40 md:hidden"
              onClick={() => setMenuOpen(false)}
            />

            {/* Sidebar */}
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
              className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-[#1E6B2B] z-50 flex flex-col p-8 shadow-2xl text-white"
            >
              {/* Close Button */}
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="text-white focus:outline-none hover:text-[#81C784]"
                >
                  <X size={28} />
                </button>
              </div>

              {/* Nav Links */}
              <div className="flex flex-col gap-6 text-xl font-medium">
                {navLinks.map((link) => (
                  <NavLink
                    key={`mobile-${link.name}`}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      isActive
                        ? "font-semibold text-[#81C784]"
                        : "hover:text-[#77BFA1] transition-colors"
                    }
                  >
                    {link.name}
                  </NavLink>
                ))}
              </div>

              {/* Mobile Auth */}
              <div className="border-t border-white/30 mt-8 pt-6 flex flex-col gap-4">
                {token ? (
                  <>
                    <NavLink
                      to={dashboardPath}
                      onClick={() => setMenuOpen(false)}
                      className="text-white text-xl font-medium hover:text-[#81C784] transition-colors"
                    >
                      Dashboard
                    </NavLink>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="w-full text-center bg-white text-[#1E6B2B] py-2.5 rounded-full hover:bg-[#81C784] hover:text-white transition-colors"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="w-full text-center bg-white text-[#1E6B2B] py-2.5 rounded-full hover:bg-[#81C784] hover:text-white transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMenuOpen(false)}
                      className="w-full text-center border border-white text-white hover:bg-white hover:text-[#1E6B2B] py-2.5 rounded-full transition-colors"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>

              <div className="mt-auto text-sm text-white/70">
                <p>© {new Date().getFullYear()} Text Africa Arcade</p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
