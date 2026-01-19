import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Settings, Flower2, Shield } from 'lucide-react';

interface NavbarProps {
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSettings }) => {
  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-pink-50/90 to-blue-50/90 backdrop-blur-md border-b border-white/50 shadow-sm flex items-center justify-between px-6 py-4"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Logo Left */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-white/50 rounded-lg border border-pink-100">
          <Flower2 className="w-5 h-5 text-pink-500" />
        </div>
        <span className="text-xl font-serif font-bold text-slate-700 tracking-tight">Blossom</span>
      </div>

      {/* Privacy Badge Center (Absolute to ensure true center) */}
      <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
        <motion.div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-medium"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Shield className="w-3 h-3" />
          <span>100% Private</span>
        </motion.div>
      </div>

      {/* Icons Right */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ rotate: 10 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
        </motion.button>

        <motion.button
          whileHover={{ rotate: 15 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={onOpenSettings}
          className="p-2 bg-white/50 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl text-slate-600 shadow-sm transition-all"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.nav>
  );
};
