import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlert } from '../context/AlertContext';

const toastVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.8 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 20, scale: 0.9 },
};

export default function Alert() {
  const { alert, hideAlert } = useAlert();

  if (!alert) {
    return null;
  }

  // --- START OF CHANGES ---

  // Determine the style based on alert.type
  let bgColor, icon;
  switch (alert.type) {
    case 'success':
      bgColor = 'bg-gradient-to-r from-[#1E6B2B] to-[#77BFA1]';
      icon = '✅';
      break;
    case 'error':
      bgColor = 'bg-gradient-to-r from-red-600 to-red-400';
      icon = '❌';
      break;
    case 'logout': // Our new, eye-catching style for logging out
      bgColor = 'bg-gradient-to-r from-gray-700 to-gray-500';
      icon = '👋';
      break;
    default: // A default 'info' style
      bgColor = 'bg-gradient-to-r from-blue-600 to-blue-400';
      icon = 'ℹ️';
  }

  // --- END OF CHANGES ---

  return (
    <AnimatePresence>
      {alert && (
        <motion.div
          variants={toastVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between w-full max-w-sm p-4 rounded-xl shadow-2xl text-white ${bgColor}`}
        >
          <div className="flex items-center">
            <span className="text-xl mr-3">{icon}</span>
            <p className="font-medium">{alert.message}</p>
          </div>
          <button
            onClick={hideAlert}
            className="text-2xl text-white/70 hover:text-white transition-opacity"
            aria-label="Close alert"
          >
            &times;
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}