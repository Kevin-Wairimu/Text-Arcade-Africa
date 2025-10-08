import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlert } from '../context/AlertContext';

const toastVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.9 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 20, scale: 0.9 },
};

export default function Alert() {
  const { alert, hideAlert } = useAlert();

  // ✅ Automatically hide the alert after 3.5 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => {
        hideAlert();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [alert, hideAlert]);

  if (!alert) return null;

  // 🌈 Dynamic style + emoji icon depending on alert type
  let bgColor, icon;
  switch (alert.type) {
    case 'success':
      bgColor = 'bg-gradient-to-r from-emerald-600/70 to-teal-400/60';
      icon = '✅';
      break;
    case 'error':
      bgColor = 'bg-gradient-to-r from-red-600/70 to-rose-400/60';
      icon = '❌';
      break;
    case 'logout':
      bgColor = 'bg-gradient-to-r from-gray-700/70 to-gray-500/60';
      icon = '👋';
      break;
    default:
      bgColor = 'bg-gradient-to-r from-blue-600/70 to-cyan-400/60';
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
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between w-full max-w-sm px-5 py-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.3)] text-white ${bgColor} backdrop-blur-xl border border-white/20`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <p className="font-medium text-sm sm:text-base">{alert.message}</p>
          </div>
          <button
            onClick={hideAlert}
            className="text-2xl text-white/70 hover:text-white transition"
            aria-label="Close alert"
          >
            &times;
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
