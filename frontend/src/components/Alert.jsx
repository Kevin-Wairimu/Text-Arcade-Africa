import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlert } from '../context/AlertContext';

const toastVariants = {
  hidden: { opacity: 0, x: 50, y: -20, scale: 0.9 },
  visible: { opacity: 1, x: 0, y: 0, scale: 1 },
  exit: { opacity: 0, x: 50, y: -10, scale: 0.9 },
};

export default function Alert() {
  const { alert, hideAlert } = useAlert();

  // Auto-hide after 3.5 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => hideAlert(), 3500);
      return () => clearTimeout(timer);
    }
  }, [alert, hideAlert]);

  if (!alert) return null;

  // Dynamic background and icon
  let bgColor, icon;
  switch (alert.type) {
    case 'success':
      bgColor = 'bg-gradient-to-r from-emerald-600/80 to-teal-400/70';
      icon = '✅';
      break;
    case 'error':
      bgColor = 'bg-gradient-to-r from-red-600/80 to-rose-400/70';
      icon = '❌';
      break;
    case 'logout':
      bgColor = 'bg-gradient-to-r from-gray-700/80 to-gray-500/70';
      icon = '👋';
      break;
    default:
      bgColor = 'bg-gradient-to-r from-blue-600/80 to-cyan-400/70';
      icon = 'ℹ️';
  }

  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          variants={toastVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className={`fixed top-5 right-5 z-50 flex items-center justify-between 
          w-[90%] sm:w-auto sm:min-w-[280px] md:min-w-[320px] 
          max-w-[95%] sm:max-w-sm md:max-w-md 
          px-4 sm:px-5 py-3 sm:py-4 rounded-2xl 
          shadow-[0_8px_30px_rgba(0,0,0,0.3)] text-white 
          ${bgColor} backdrop-blur-xl border border-white/20`}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-lg sm:text-2xl">{icon}</span>
            <p className="font-medium text-xs sm:text-sm md:text-base leading-snug break-words">
              {alert.message}
            </p>
          </div>
          <button
            onClick={hideAlert}
            className="ml-2 text-lg sm:text-2xl text-white/70 hover:text-white transition"
            aria-label="Close alert"
          >
            &times;
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
