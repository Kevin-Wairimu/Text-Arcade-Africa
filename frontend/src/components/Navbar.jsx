import React, { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Sun,
  Moon,
  Home,
  Info,
  Briefcase,
  Users,
  Phone,
  LayoutDashboard,
  LogOut,
  LogIn,
  UserPlus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAlert } from "../context/AlertContext";
import Logo from "./Logo";

export default function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return (
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  const navigate = useNavigate();
  const { showAlert } = useAlert();

  /* LOCK BODY SCROLL WHEN SIDEBAR OPEN */
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [menuOpen]);

  /* DARK MODE HANDLER */
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
    { name: "Home", to: "/", icon: Home },
    { name: "About", to: "/about", icon: Info },
    { name: "Services", to: "/services", icon: Briefcase },
    { name: "Team", to: "/team", icon: Users },
    { name: "Contact", to: "/contact", icon: Phone }
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    showAlert("Logged out successfully!", "logout");
    setMenuOpen(false);
    setTimeout(() => navigate("/"), 1200);
  };

  const dashboardPath =
    role === "Admin" || role === "Employee" ? "/admin" : "/client";

  return (
    <header className="fixed w-full top-0 z-[200] bg-white dark:bg-black shadow-sm">
      {/* NAVBAR */}
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Logo size={44} mode="icon" as="div" />
          </motion.div>

          <div>
            <div className="font-extrabold text-xl text-taa-primary">
              Text Africa Arcade
            </div>

            <div className="text-xs text-taa-primary/80 italic dark:text-taa-accent/80">
              Digital transformation for text products
            </div>
          </div>
        </Link>

        {/* DESKTOP MENU */}
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
            {/* THEME BUTTON */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
            >
              {isDarkMode ? (
                <Sun size={20} className="text-yellow-400" />
              ) : (
                <Moon size={20} className="text-taa-primary" />
              )}
            </button>

            {token ? (
              <>
                <NavLink to={dashboardPath} className="font-bold">
                  Dashboard
                </NavLink>

                <button
                  onClick={handleLogout}
                  className="bg-taa-primary text-white text-sm px-4 py-2 rounded-full hover:brightness-110"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-taa-primary text-white text-sm px-4 py-2 rounded-full hover:brightness-110"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  className="border border-taa-primary text-taa-primary dark:border-taa-accent dark:text-taa-accent hover:bg-taa-primary hover:text-white text-sm px-4 py-2 rounded-full"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* MOBILE BUTTONS */}
        <div className="flex items-center gap-4 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
          >
            {isDarkMode ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} className="text-taa-primary" />
            )}
          </button>

          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-taa-primary dark:text-taa-accent"
          >
            {menuOpen ? <X size={32} /> : <Menu size={32} />}
          </motion.button>
        </div>
      </div>

      {/* MOBILE SIDEBAR */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* OVERLAY */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] md:hidden"
            />

            {/* SIDEBAR */}
            <motion.nav
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 180, damping: 26 }}
              className="fixed top-0 left-0 h-screen w-72 z-[100] flex flex-col p-8 
              bg-taa-primary dark:bg-[#06240d] border-r border-white/10 
              text-white shadow-2xl overflow-y-auto"
            >
              {/* TITLE */}
              <div className="flex items-center justify-between mb-10">
                <span className="text-2xl font-black uppercase">
                  Navigation
                </span>

                <button onClick={() => setMenuOpen(false)}>
                  <X size={28} />
                </button>
              </div>

              {/* LINKS */}
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <NavLink
                    key={link.name}
                    to={link.to}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-4 px-5 py-3 rounded-xl font-bold transition ${
                        isActive
                          ? "bg-white text-taa-primary shadow-lg"
                          : "hover:bg-white/10"
                      }`
                    }
                  >
                    <link.icon size={20} />
                    {link.name}
                  </NavLink>
                ))}

                {token && (
                  <NavLink
                    to={dashboardPath}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-4 px-5 py-3 rounded-xl font-bold hover:bg-white/10"
                  >
                    <LayoutDashboard size={20} />
                    Dashboard
                  </NavLink>
                )}
              </div>

              {/* AUTH */}
              <div className="mt-10 flex flex-col gap-3">
                {token ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 px-5 py-3 rounded-xl font-bold bg-white text-red-500 shadow-md"
                  >
                    <LogOut size={20} /> Logout
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-4 px-5 py-3 rounded-xl font-bold bg-white text-taa-primary shadow-md"
                    >
                      <LogIn size={20} /> Login
                    </Link>

                    <Link
                      to="/register"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-4 px-5 py-3 rounded-xl font-bold border border-white hover:bg-white/10"
                    >
                      <UserPlus size={20} /> Register
                    </Link>
                  </>
                )}
              </div>

              {/* FOOTER */}
              <div className="mt-10 text-[10px] uppercase tracking-[0.3em] text-white/60">
                © {new Date().getFullYear()} Text Africa Arcade
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

