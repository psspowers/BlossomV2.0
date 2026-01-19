import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Flower2, Shield, Bell, Clock, MessageCircle } from 'lucide-react';

interface NavbarProps {
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSettings }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [dailyInvite, setDailyInvite] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

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

      {/* Privacy Badge */}
      <div className="absolute left-[37.5%] transform -translate-x-1/2">
        <motion.div
          className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] sm:text-xs font-medium shadow-sm"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Shield className="w-3 h-3" />
          <span>100% Private</span>
        </motion.div>
      </div>

      {/* Icons Right */}
      <div className="flex items-center gap-3 relative" ref={dropdownRef}>

        {/* Bell Button with Notification Dot */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
          onClick={() => setShowNotifications(!showNotifications)}
          className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <motion.span
            className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border border-white"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.button>

        {/* Notification Dropdown */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-14 right-0 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-100">
                <h3 className="font-serif text-lg text-slate-800 font-medium">Your Updates</h3>
              </div>

              {/* Content */}
              <div className="p-2 max-h-96 overflow-y-auto">

                {/* Daily Invitation Toggle */}
                <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">Daily Invitation</p>
                      <p className="text-xs text-slate-500">Gentle reminder to check in</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDailyInvite(!dailyInvite)}
                    className={`w-10 h-5 rounded-full relative transition-colors ${
                      dailyInvite ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  >
                    <motion.div
                      className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm"
                      animate={{ x: dailyInvite ? 20 : 2 }}
                      transition={{ duration: 0.2 }}
                    />
                  </button>
                </div>

                {/* Recent Whispers Section */}
                <div className="mt-2 pt-2 border-t border-slate-100">
                  <p className="px-3 text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Recent Whispers</p>

                  {/* History Item 1 */}
                  <div className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <div className="p-2 bg-blue-50 text-blue-500 rounded-lg mt-0.5">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Yesterday</p>
                      <p className="text-sm text-slate-700 leading-snug">
                        "Rest is your superpower. Your mood lifts when you sleep 7h+."
                      </p>
                    </div>
                  </div>

                  {/* History Item 2 */}
                  <div className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <div className="p-2 bg-pink-50 text-pink-500 rounded-lg mt-0.5">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">2 days ago</p>
                      <p className="text-sm text-slate-700 leading-snug">
                        "Movement creates energy. Notice how your body responds."
                      </p>
                    </div>
                  </div>

                  {/* History Item 3 */}
                  <div className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                    <div className="p-2 bg-purple-50 text-purple-500 rounded-lg mt-0.5">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">3 days ago</p>
                      <p className="text-sm text-slate-700 leading-snug">
                        "Your cycle is wisdom. Each phase holds its own gifts."
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                <button className="text-xs text-emerald-600 font-medium hover:text-emerald-700 transition-colors">
                  View All History
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Settings Button */}
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
