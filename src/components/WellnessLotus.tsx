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

  const createPetalPath = (scale: number = 1) => {
    const width = 35 * scale;
    const height = 70 * scale;
    return `
      M 0,-10
      Q -${width * 0.3},-${height * 0.5} -${width},-${height}
      Q -${width * 0.5},-${height * 1.05} 0,-${height * 1.1}
      Q ${width * 0.5},-${height * 1.05} ${width},-${height}
      Q ${width * 0.3},-${height * 0.5} 0,-10
      Z
    `;
  };

  const outerPetals = [0, 45, 90, 135, 180, 225, 270, 315];
  const innerPetals = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];

  return (
    <div className="relative flex flex-col items-center justify-center py-12">
      <div className="relative w-80 h-80 flex items-center justify-center">

        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-64 h-64 rounded-full blur-[60px]"
          style={{ backgroundColor: colors.aura }}
        />

        <svg viewBox="-150 -150 300 300" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id="petalGradientOuter" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors.tip} />
              <stop offset="100%" stopColor={colors.base} />
            </linearGradient>
            <linearGradient id="petalGradientInner" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={colors.base} />
              <stop offset="100%" stopColor={colors.tip} stopOpacity="0.3" />
            </linearGradient>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          <g filter="url(#softGlow)">
            {outerPetals.map((angle, i) => (
              <motion.g
                key={`outer-${i}`}
                transform={`rotate(${angle})`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.9, scale: 1 }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              >
                <path
                  d={createPetalPath(bloomFactor)}
                  fill="url(#petalGradientOuter)"
                  stroke={colors.tip}
                  strokeWidth="1"
                  opacity="0.95"
                />
              </motion.g>
            ))}

            {innerPetals.map((angle, i) => (
              <motion.g
                key={`inner-${i}`}
                transform={`rotate(${angle})`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.95, scale: 1 }}
                transition={{
                  duration: 1.5,
                  delay: 0.4 + (i * 0.1),
                  ease: "easeOut"
                }}
              >
                <path
                  d={createPetalPath(bloomFactor * 0.75)}
                  fill="url(#petalGradientInner)"
                  stroke={colors.tip}
                  strokeWidth="0.8"
                  opacity="0.9"
                />
              </motion.g>
            ))}
          </g>

          <motion.circle
            cx="0"
            cy="0"
            r={15 * bloomFactor}
            fill={colors.center}
            initial={{ scale: 0 }}
            animate={{ scale: [0.9, 1.05, 0.9] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1.2 }}
          />

          {[0, 60, 120, 180, 240, 300].map((angle) => {
            const rad = (angle * Math.PI) / 180;
            const distance = 8 * bloomFactor;
            return (
              <motion.circle
                key={`seed-${angle}`}
                cx={Math.cos(rad) * distance}
                cy={Math.sin(rad) * distance}
                r="2.5"
                fill="#5D4037"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.8 }}
              />
            );
          })}

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
