import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAlert } from "../context/AlertContext";
import Logo from "./Logo";

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark" || 
           (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches);
  });
  
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

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
    <header className="fixed w-full top-0 z-50 nav-glass shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Logo size={44} mode="icon" as="div" />
          </motion.div>
          <div>
            <div className="font-extrabold text-xl text-taa-primary tracking-tight">
              Text Africa Arcade
            </div>
            <div className="text-xs text-taa-primary/80 italic dark:text-taa-accent/80">
              Digital transformation for text products
            </div>
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6 font-medium text-taa-primary dark:text-taa-accent">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.to}
              className={({ isActive }) =>
                `transition-colors hover:opacity-70 ${
                  isActive
                    ? "font-bold border-b-2 border-taa-primary dark:border-taa-accent pb-1"
                    : ""
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
          
          <div className="flex items-center gap-4 pl-4 border-l border-taa-primary/20">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-taa-primary" />}
            </button>
            
            {token ? (
              <>
                <NavLink
                  to={dashboardPath}
                  className="hover:opacity-70 transition-colors"
                >
                  Dashboard
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="bg-taa-primary text-white text-sm px-4 py-2 rounded-full hover:brightness-110 transition-all duration-300 shadow-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-taa-primary text-white hover:brightness-110 text-sm px-4 py-2 rounded-full transition-all duration-300 shadow-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="border border-taa-primary text-taa-primary dark:border-taa-accent dark:text-taa-accent hover:bg-taa-primary hover:text-white text-sm px-4 py-2 rounded-full transition-all duration-300"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
        
        <div className="flex items-center gap-4 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-taa-primary" />}
          </button>
          
          <motion.button
            className="text-taa-primary dark:text-taa-accent focus:outline-none z-50"
            onClick={() => setMenuOpen(!menuOpen)}
            whileTap={{ scale: 0.9 }}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={32} /> : <Menu size={32} />}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-taa-dark/80 backdrop-blur-md z-40 md:hidden"
              onClick={() => setMenuOpen(false)}
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 150, damping: 25 }}
              className="fixed top-0 right-0 h-full w-4/5 max-w-sm bg-white z-50 flex flex-col p-8 shadow-[0_0_50px_rgba(0,0,0,0.2)]"
            >
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-gray-100">
                <span className="font-black text-taa-primary text-xl tracking-tighter">NAVIGATION</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="text-gray-400 hover:text-taa-primary transition-colors focus:outline-none"
                >
                  <X size={28} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <NavLink
                    key={`mobile-${link.name}`}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `text-2xl font-black transition-all ${
                        isActive
                          ? "text-taa-primary translate-x-2"
                          : "text-slate-800 hover:text-taa-primary"
                      }`
                    }
                  >
                    {link.name}
                  </NavLink>
                ))}
              </div>

              <div className="border-t border-gray-100 mt-8 pt-8 flex flex-col gap-4">
                {token ? (
                  <>
                    <NavLink
                      to={dashboardPath}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        `text-xl font-bold transition-colors ${
                          isActive ? "text-taa-primary" : "text-slate-700"
                        }`
                      }
                    >
                      Dashboard
                    </NavLink>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMenuOpen(false);
                      }}
                      className="w-full text-center bg-taa-primary text-white py-4 rounded-2xl font-black shadow-lg hover:brightness-110 transition-all"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="w-full text-center bg-taa-primary text-white py-4 rounded-2xl font-black shadow-lg hover:brightness-110 transition-all"
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMenuOpen(false)}
                      className="w-full text-center border-2 border-taa-primary text-taa-primary py-4 rounded-2xl font-black transition-all"
                    >
                      Register
                    </Link>
                  </>
                )}
              </div>
              <div className="mt-auto text-xs font-bold text-gray-400 uppercase tracking-widest">
                <p>© {new Date().getFullYear()} Text Africa Arcade</p>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}