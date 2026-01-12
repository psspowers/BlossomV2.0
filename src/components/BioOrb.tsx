import React from 'react';
import { motion } from 'framer-motion';

interface BioOrbProps {
  health: number;
  streak: number;
  mode: 'nurture' | 'steady' | 'thrive';
  name?: string;
}

export const BioOrb: React.FC<BioOrbProps> = ({ health, streak, name = 'Your Companion' }) => {
  const colors = health >= 80
    ? { primary: '#14b8a6', secondary: '#06b6d4', glow: '#2dd4bf' }
    : health >= 50
    ? { primary: '#f97316', secondary: '#fb923c', glow: '#fb923c' }
    : { primary: '#ef4444', secondary: '#f87171', glow: '#f87171' };

  return (
    <div className="relative z-10 flex flex-col items-center gap-8">
      <div className="relative flex items-center justify-center w-64 h-64">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-32 h-32 rounded-full blur-[50px] opacity-40"
          style={{ backgroundColor: colors.primary }}
        />

        <motion.div
          animate={{ rotate: 360, scale: [1, 1.05, 1] }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 5, repeat: Infinity }
          }}
          className="absolute w-40 h-40 border-2 blur-[1px]"
          style={{
            borderColor: `${colors.secondary}30`,
            borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%"
          }}
        />

        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute w-48 h-48 border border-white/10 rounded-full border-dashed"
        />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute w-56 h-56 border border-white/5 rounded-full"
        />

        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="relative w-24 h-24 rounded-full"
          style={{
            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
            boxShadow: `0 0 30px ${colors.glow}, 0 0 60px ${colors.glow}40`
          }}
        />

        {streak > 0 && (
          <>
            {[...Array(Math.min(streak, 6))].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0.4, 0.7, 0.4],
                  scale: 1,
                  rotate: 360
                }}
                transition={{
                  opacity: { duration: 3, repeat: Infinity, delay: i * 0.5 },
                  rotate: { duration: 20 + i * 2, repeat: Infinity, ease: "linear" }
                }}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  backgroundColor: colors.secondary,
                  left: `${50 + 35 * Math.cos((i * Math.PI * 2) / 6)}%`,
                  top: `${50 + 35 * Math.sin((i * Math.PI * 2) / 6)}%`,
                  boxShadow: `0 0 10px ${colors.glow}`
                }}
              />
            ))}
          </>
        )}
      </div>

      <div className="text-center space-y-3">
        <motion.h2
          className="text-2xl font-light text-white/90 tracking-wide"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {name}
        </motion.h2>

        <motion.div
          className="flex items-center justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all" />
            <div className="relative flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-lg">
              <span className="text-sm text-white/60 font-light">Streak</span>
              <span className="text-xl font-semibold text-white/95">{streak}</span>
              <span className="text-base">🔥</span>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 rounded-2xl blur-xl group-hover:blur-2xl transition-all"
              style={{ background: `linear-gradient(135deg, ${colors.primary}30, ${colors.secondary}30)` }}
            />
            <div className="relative flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-lg">
              <span className="text-sm text-white/60 font-light">Vitality</span>
              <span className="text-xl font-semibold text-white/95">{health}%</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
