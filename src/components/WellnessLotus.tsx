import React from 'react';
import { motion } from 'framer-motion';

interface WellnessLotusProps {
  health: number;
  streak: number;
  mode: 'nurture' | 'steady' | 'thrive';
  name?: string;
}

export const WellnessLotus: React.FC<WellnessLotusProps> = ({
  health,
  streak,
  name = 'Your Journey'
}) => {

  const bloomFactor = Math.max(0.3, health / 100);

  const getColors = () => {
    if (health >= 80) return {
      tip: '#FF69B4', base: '#FFF0F5', center: '#FFD700', aura: 'rgba(255, 105, 180, 0.4)'
    };
    if (health >= 50) return {
      tip: '#F48FB1', base: '#FFF5F7', center: '#FFE082', aura: 'rgba(244, 143, 177, 0.3)'
    };
    return {
      tip: '#D7CCC8', base: '#EFEBE9', center: '#A1887F', aura: 'rgba(161, 136, 127, 0.2)'
    };
  };
  const colors = getColors();

  const petalPath = "M10,100 C10,50 50,0 100,0 C150,0 190,50 190,100 C190,160 100,200 100,200 C100,200 10,160 10,100 Z";

  return (
    <div className="relative flex flex-col items-center justify-center py-12">
      <div className="relative w-80 h-80 flex items-center justify-center">

        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-64 h-64 rounded-full blur-[60px]"
          style={{ backgroundColor: colors.aura }}
        />

        <svg viewBox="0 0 400 400" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id="petalGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.tip} />
              <stop offset="100%" stopColor={colors.base} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <motion.path
              key={`outer-${i}`}
              d={petalPath}
              fill="url(#petalGradient)"
              filter="url(#glow)"
              style={{ transformOrigin: "200px 200px", opacity: 0.9 }}
              animate={{
                rotate: angle,
                scaleY: bloomFactor,
                scaleX: 0.8,
                translateY: bloomFactor * -20
              }}
              transition={{ duration: 2, delay: i * 0.1 }}
            />
          ))}

          {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((angle, i) => (
            <motion.path
              key={`inner-${i}`}
              d={petalPath}
              fill={colors.base}
              stroke={colors.tip}
              strokeWidth="1"
              style={{ transformOrigin: "200px 200px", opacity: 0.95 }}
              animate={{
                rotate: angle,
                scaleY: bloomFactor * 0.8,
                scaleX: 0.6,
                translateY: bloomFactor * -10
              }}
              transition={{ duration: 2, delay: 0.5 + (i * 0.1) }}
            />
          ))}

          <motion.circle
            cx="200"
            cy="200"
            r={20 * bloomFactor}
            fill={colors.center}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
             <motion.circle
               key={`seed-${i}`}
               cx="200"
               cy="200"
               r="3"
               fill="#5D4037"
               animate={{
                 transform: `rotate(${angle}deg) translate(${10 * bloomFactor}px)`
               }}
             />
          ))}

        </svg>

      </div>

      <div className="text-center space-y-3 relative z-10">
        <h2 className="text-2xl font-serif text-slate-700 dark:text-slate-200">
          {name}
        </h2>

        <div className="flex items-center justify-center gap-3">
          <div className="px-4 py-2 rounded-full bg-white/50 border border-slate-200 backdrop-blur-sm flex items-center gap-2 shadow-sm">
            <span className="text-sm text-slate-500">Season</span>
            <span className="text-slate-800 font-medium">
              {streak > 14 ? 'Blooming' : streak > 3 ? 'Growing' : 'Resting'}
            </span>
            <span className="text-lg">
              {streak > 14 ? '🌸' : streak > 3 ? '🌱' : '🍂'}
            </span>
          </div>

          <div className="px-4 py-2 rounded-full bg-white/50 border border-slate-200 backdrop-blur-sm flex items-center gap-2 shadow-sm">
            <span className="text-sm text-slate-500">Score</span>
            <span className="text-slate-800 font-bold">{health}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
