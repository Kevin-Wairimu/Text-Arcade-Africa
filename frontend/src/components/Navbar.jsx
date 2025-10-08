import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAlert } from "../context/AlertContext";
import Logo from "./Logo";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

 const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");

  // ✅ Use your custom alert system instead of window.alert()
  showAlert("Logged out successfully!", "logout");

  // Redirect after a short delay so the user sees the message
  setTimeout(() => {
    navigate("/");
  }, 1200);
};

  const dashboardPath =
    role === "Admin" || role === "Employee" ? "/admin" : "/client";

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/30 backdrop-blur-2xl border-b border-white/30 shadow-md"
          : "bg-gradient-to-b from-white/20 via-emerald-50/30 to-transparent backdrop-blur-lg"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Logo size={44} mode="icon" /> {/* ✅ Larger for visibility */}
          </motion.div>
          <div>
            <div className="font-extrabold text-xl text-taa-primary tracking-tight group-hover:text-taa-accent transition">
              Text Africa Arcade
            </div>
            <div className="text-xs text-gray-600 italic">
              Digital transformation for text products
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 font-medium">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.to}
              className={({ isActive }) =>
                isActive
                  ? "text-taa-accent border-b-2 border-taa-accent pb-1"
                  : "text-gray-700 hover:text-taa-primary transition"
              }
            >
              {link.name}
            </NavLink>
          ))}

          {/* Auth Buttons */}
          {token ? (
            <>
              <NavLink
                to={dashboardPath}
                className="text-gray-700 hover:text-taa-accent transition"
              >
                Dashboard
              </NavLink>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm px-5 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-gradient-to-r from-taa-primary to-taa-accent text-white text-sm px-5 py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="border border-taa-primary text-taa-primary hover:bg-taa-primary hover:text-white text-sm px-5 py-2 rounded-full shadow-sm transition-all duration-300"
              >
                Register
              </Link>
            </>
          )}
        </nav>

        {/* Mobile Menu Icon */}
        <motion.button
          className="md:hidden text-taa-primary focus:outline-none bg-white/30 p-2 rounded-full backdrop-blur-md border border-white/30 shadow-sm"
          onClick={() => setMenuOpen(!menuOpen)}
          whileTap={{ scale: 0.9 }}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={32} /> : <Menu size={32} />} {/* ✅ Larger icons */}
        </motion.button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setMenuOpen(false)}
            />

            <motion.nav
              key="mobileMenu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
              className="fixed top-0 right-0 h-full w-3/4 sm:w-1/2 bg-white/30 backdrop-blur-2xl border-l border-white/20 shadow-2xl z-50 flex flex-col py-8 px-6"
            >
              <div className="flex items-center justify-between mb-8">
                <Logo size={48} mode="icon" />
                <button
                  className="text-taa-primary hover:text-taa-accent"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={32} />
                </button>
              </div>

              <div className="flex flex-col gap-6 text-lg font-medium">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      isActive
                        ? "text-taa-accent font-semibold"
                        : "text-gray-700 hover:text-taa-primary"
                    }
                  >
                    {link.name}
                  </NavLink>
                ))}

                {/* Auth Buttons */}
                {token ? (
                  <>
                    <NavLink
                      to={dashboardPath}
                      onClick={() => setMenuOpen(false)}
                      className="text-taa-accent"
                    >
                      Dashboard
                    </NavLink>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full mt-4 hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-3 mt-6">
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="w-full text-center bg-gradient-to-r from-taa-primary to-taa-accent text-white py-2 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMenuOpen(false)}
                      className="w-full text-center border border-taa-primary text-taa-primary py-2 rounded-full hover:bg-taa-primary hover:text-white transition-all duration-300"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>

              <div className="mt-auto border-t border-white/30 pt-6 text-sm text-gray-600">
                <p>© {new Date().getFullYear()} Text Africa Arcade</p>
                <p className="text-taa-accent mt-1 font-medium">
                  Digital Innovation Hub
                </p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
