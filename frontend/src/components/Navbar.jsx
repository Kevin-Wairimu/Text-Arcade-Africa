import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // ✅ get stored role

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
    alert("👋 Logged out successfully!");
    navigate("/");
  };

  // ✅ Decide which dashboard link to show
  const dashboardPath =
    role === "Admin" || role === "Employee" ? "/admin" : "/client";

  return (
    <header
      className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm"
          : "bg-gradient-to-b from-white/90 to-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* Logo and Name */}
        <Link to="/" className="flex items-center gap-3">
          <Logo size={36} mode="icon" />
          <div>
            <div className="font-bold text-lg text-taa-primary">
              Text Africa Arcade
            </div>
            <div className="text-xs text-gray-500">
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
                  ? "text-taa-primary border-b-2 border-taa-primary pb-1"
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
                className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="bg-taa-primary hover:bg-taa-accent text-white text-sm px-4 py-2 rounded-lg shadow-sm transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="border border-taa-primary text-taa-primary hover:bg-taa-primary hover:text-white text-sm px-4 py-2 rounded-lg transition"
              >
                Register
              </Link>
            </>
          )}
        </nav>

        {/* Hamburger Icon */}
        <button
          className="md:hidden text-taa-primary focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Overlay + Slide-in Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black z-40"
              onClick={() => setMenuOpen(false)}
            />

            {/* Sliding mobile menu */}
            <motion.nav
              key="mobileMenu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 100, damping: 18 }}
              className="fixed top-0 right-0 h-full w-3/4 sm:w-1/2 bg-white shadow-2xl z-50 flex flex-col py-8 px-6"
            >
              <div className="flex items-center justify-between mb-8">
                <Logo size={40} mode="icon" />
                <button
                  className="text-taa-primary"
                  onClick={() => setMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <X size={28} />
                </button>
              </div>

              {/* Mobile Nav Links */}
              <div className="flex flex-col gap-6 text-lg font-medium">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      isActive
                        ? "text-taa-primary font-semibold"
                        : "text-gray-700 hover:text-taa-primary"
                    }
                  >
                    {link.name}
                  </NavLink>
                ))}

                {/* Auth Buttons for Mobile */}
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
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg mt-4 transition"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col gap-3 mt-6">
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="w-full text-center bg-taa-primary text-white py-2 rounded-lg hover:bg-taa-accent transition"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMenuOpen(false)}
                      className="w-full text-center border border-taa-primary text-taa-primary py-2 rounded-lg hover:bg-taa-primary hover:text-white transition"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>

              {/* Footer Info */}
              <div className="mt-auto border-t border-gray-200 pt-6 text-sm text-gray-500">
                <p>© {new Date().getFullYear()} Text Africa Arcade</p>
                <p className="text-taa-accent mt-1">Digital Innovation Hub</p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
