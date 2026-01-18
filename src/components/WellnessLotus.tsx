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
      tip: '#FF69B4', base: '#FFF0F5', center: '#FFD700',
      waterBase: '#4DD0E1', waterRipple: 'rgba(77, 208, 225, 0.3)'
    };
    if (health >= 50) return {
      tip: '#F48FB1', base: '#FFF5F7', center: '#FFE082',
      waterBase: '#80DEEA', waterRipple: 'rgba(128, 222, 234, 0.25)'
    };
    return {
      tip: '#D7CCC8', base: '#EFEBE9', center: '#A1887F',
      waterBase: '#B0BEC5', waterRipple: 'rgba(176, 190, 197, 0.2)'
    };
  };

  const colors = getColors();

  const createPetalPath = (scale: number = 1) => {
    return `M0,0 C10,-20 30,-50 0,-100 C-30,-50 -10,-20 0,0`;
  };

  const outerPetals = [0, 45, 90, 135, 180, 225, 270, 315];
  const innerPetals = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];

  return (
    <div className="relative flex flex-col items-center justify-center py-12">
      <div className="relative w-80 h-80 flex items-center justify-center">

        <div className="absolute w-full h-1/2 bottom-0 rounded-b-full opacity-60"
             style={{ background: `linear-gradient(to bottom, transparent, ${colors.waterBase})` }} />

        {[0.8, 1.0, 1.2].map((scale, i) => (
          <motion.div
            key={`ripple-${i}`}
            className="absolute w-64 h-16 rounded-[100%] blur-xl"
            style={{ background: colors.waterRipple, bottom: '5%' }}
            animate={{
              scale: [scale, scale * 1.4, scale],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
          />
        ))}

        <div className="absolute w-full h-full bottom-[-20%] opacity-30 blur-[4px]" style={{ transform: 'scaleY(-0.5)' }}>
           <svg viewBox="-150 -150 300 300" className="w-full h-full">
             <g fill={colors.tip}>
                {outerPetals.map((angle, i) => (
                  <path key={`ref-${i}`} d={createPetalPath()} transform={`rotate(${angle}) scale(${bloomFactor})`} />
                ))}
             </g>
           </svg>
        </div>

        <svg viewBox="-150 -150 300 300" className="w-full h-full drop-shadow-xl relative z-10">
          <defs>
            <linearGradient id="petalGradientOuter" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor={colors.base} />
              <stop offset="100%" stopColor={colors.tip} />
            </linearGradient>
            <linearGradient id="petalGradientInner" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor={colors.base} />
              <stop offset="100%" stopColor={colors.tip} />
            </linearGradient>
            <filter id="softGlow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          <g filter="url(#softGlow)">
            {outerPetals.map((angle, i) => (
              <motion.g key={`outer-${i}`} transform={`rotate(${angle})`}>
                <motion.path
                  d={createPetalPath()}
                  fill="url(#petalGradientOuter)"
                  stroke={colors.tip}
                  strokeWidth="0.5"
                  opacity="0.95"
                  animate={{
                    scaleY: bloomFactor,
                    scaleX: 0.8 + (bloomFactor * 0.2),
                    translateY: bloomFactor * -10
                  }}
                  transition={{ duration: 2, delay: i * 0.1 }}
                />
              </motion.g>
            ))}
            {innerPetals.map((angle, i) => (
              <motion.g key={`inner-${i}`} transform={`rotate(${angle})`}>
                <motion.path
                  d={createPetalPath()}
                  fill="url(#petalGradientInner)"
                  stroke={colors.tip}
                  strokeWidth="0.5"
                  opacity="0.9"
                  animate={{
                    scaleY: bloomFactor * 0.75,
                    scaleX: 0.6,
                    translateY: bloomFactor * -5
                  }}
                  transition={{ duration: 2.2, delay: 0.2 + (i * 0.1) }}
                />
              </motion.g>
            ))}
          </g>

          <circle cx="0" cy="0" r={15 * bloomFactor} fill={colors.center} />
        </svg>
      </div>

      <div className="text-center space-y-3 relative z-10">
        <h2 className="text-3xl font-serif text-slate-800 tracking-wide italic">
          {name}
        </h2>

        <div className="flex items-center justify-center">
          <div className="px-8 py-4 rounded-2xl bg-white/80 border-2 border-sage-300 shadow-lg backdrop-blur-sm">
            <div className="text-xs text-sage-600 font-medium uppercase tracking-wider mb-1">
              Blossom Score
            </div>
            <div className="text-5xl font-serif font-bold text-slate-800">
              {health}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              out of 100
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3">
          <div className="px-5 py-2 rounded-full bg-white/60 border border-slate-200 shadow-sm flex items-center gap-2">
            <span className="text-sm text-slate-500 font-medium">Season</span>
            <span className="text-lg font-serif text-slate-800">
              {streak > 14 ? 'Blooming' : streak > 3 ? 'Growing' : 'Resting'}
            </span>
            <span className="text-xl">
              {streak > 14 ? '🌸' : streak > 3 ? '🌿' : '🍂'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
