import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Bell, Clock, MessageCircle, Stethoscope, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  onOpenSettings: () => void;
  onOpenClinicalGuide: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSettings, onOpenClinicalGuide }) => {
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
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#FDFBF7]/95 via-[#FFF8F5]/95 to-[#FFF0F0]/95 backdrop-blur-md border-b border-stone-100/50 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">

        {/* LEFT: Brand Identity */}
        <div className="flex items-center gap-3">
          {/* Animated Lotus Logo */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 10 }}
            whileTap={{ scale: 0.95 }}
            className="cursor-pointer"
          >
            <span className="text-3xl filter drop-shadow-sm">🌸</span>
          </motion.div>

          <div className="flex flex-col">
            <h1 className="font-serif text-xl font-bold text-stone-800 leading-tight tracking-tight">
              Blossom
            </h1>
            <span className="hidden sm:block text-[10px] font-sans text-stone-500 font-medium tracking-wide uppercase">
              Your Journey, Seen & Supported
            </span>
          </div>
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-3 sm:gap-5">

          {/* Privacy Badge (The "Sovereign" Promise) */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100/50 rounded-full cursor-help"
            title="Your data stays on this device."
          >
            <ShieldCheck size={14} className="text-emerald-600" />
            <span className="text-[10px] font-bold text-emerald-700 tracking-wide uppercase">
              100% Private
            </span>
          </motion.div>

          {/* Icons Group */}
          <div className="flex items-center gap-3 border-l border-stone-200 pl-3 sm:pl-5" ref={dropdownRef}>

            {/* Clinical Guide */}
            <button
              onClick={onOpenClinicalGuide}
              className="group p-2 rounded-full hover:bg-stone-100 transition-colors"
              aria-label="Clinical Guide"
            >
              <Stethoscope size={22} className="text-stone-500 group-hover:text-stone-800 transition-colors" />
            </button>

            {/* Notifications */}
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative group p-2 rounded-full hover:bg-rose-50 transition-colors"
              aria-label="Notifications"
            >
              <Bell size={22} className="text-stone-500 group-hover:text-rose-500 transition-colors" />
              {/* Notification Dot */}
              <span className="absolute top-2 right-2.5 h-2 w-2 bg-rose-500 rounded-full ring-2 ring-[#FDFBF7]" />
            </button>

            {/* Notification Dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-14 right-0 w-80 bg-white rounded-2xl shadow-xl border border-stone-100 overflow-hidden z-50"
                >
                  {/* Header */}
                  <div className="p-4 border-b border-stone-100">
                    <h3 className="font-serif text-lg text-stone-800 font-medium">Your Updates</h3>
                  </div>

                  {/* Content */}
                  <div className="p-2 max-h-96 overflow-y-auto">

                    {/* Daily Invitation Toggle */}
                    <div className="flex items-center justify-between p-3 hover:bg-stone-50 rounded-xl transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-stone-700">Daily Invitation</p>
                          <p className="text-xs text-stone-500">Gentle reminder to check in</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setDailyInvite(!dailyInvite)}
                        className={`w-10 h-5 rounded-full relative transition-colors ${
                          dailyInvite ? 'bg-emerald-500' : 'bg-stone-200'
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
                    <div className="mt-2 pt-2 border-t border-stone-100">
                      <p className="px-3 text-xs font-medium text-stone-400 uppercase tracking-wide mb-2">Recent Whispers</p>

                      {/* History Item 1 */}
                      <div className="flex items-start gap-3 p-3 hover:bg-stone-50 rounded-xl transition-colors">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg mt-0.5">
                          <MessageCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-stone-400 mb-1">Yesterday</p>
                          <p className="text-sm text-stone-700 leading-snug">
                            "Rest is your superpower. Your mood lifts when you sleep 7h+."
                          </p>
                        </div>
                      </div>

                      {/* History Item 2 */}
                      <div className="flex items-start gap-3 p-3 hover:bg-stone-50 rounded-xl transition-colors">
                        <div className="p-2 bg-rose-50 text-rose-600 rounded-lg mt-0.5">
                          <MessageCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-stone-400 mb-1">2 days ago</p>
                          <p className="text-sm text-stone-700 leading-snug">
                            "Movement creates energy. Notice how your body responds."
                          </p>
                        </div>
                      </div>

                      {/* History Item 3 */}
                      <div className="flex items-start gap-3 p-3 hover:bg-stone-50 rounded-xl transition-colors">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg mt-0.5">
                          <MessageCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs text-stone-400 mb-1">3 days ago</p>
                          <p className="text-sm text-stone-700 leading-snug">
                            "Your cycle is wisdom. Each phase holds its own gifts."
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="p-3 bg-stone-50 text-center border-t border-stone-100">
                    <button className="text-xs text-emerald-600 font-medium hover:text-emerald-700 transition-colors">
                      View All History
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="group p-2 rounded-full hover:bg-stone-100 transition-colors"
              aria-label="Settings"
            >
              <Settings size={22} className="text-stone-500 group-hover:text-stone-800 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
