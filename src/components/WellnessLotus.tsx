import React from 'react';
import { motion } from 'framer-motion';
import { SeasonState } from '../lib/logic/seasons';

interface WellnessLotusProps {
  health: number;
  season: SeasonState;
  mode: 'nurture' | 'steady' | 'thrive';
  name?: string;
}

export const WellnessLotus: React.FC<WellnessLotusProps> = ({
  health,
  season,
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
    <div className="relative flex flex-col items-center justify-center py-4">
      <div className="relative w-80 h-64 flex items-end justify-center flex-col">

        <svg viewBox="-150 -150 300 300" className="w-80 h-80 drop-shadow-2xl relative z-10" style={{
          filter: 'drop-shadow(0 15px 25px rgba(77, 208, 225, 0.3))'
        }}>
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

        <div className="relative w-80 h-40 -mt-28 overflow-hidden">
          <div className="absolute inset-0 rounded-b-[100%]" style={{
            background: `linear-gradient(to bottom, transparent 0%, ${colors.waterBase}15 15%, ${colors.waterBase}40 50%, ${colors.waterBase}60 100%)`
          }} />

          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-20 pointer-events-none" style={{
            background: `radial-gradient(ellipse at center, ${colors.waterRipple.replace('0.3)', '0.5)')}, transparent 70%)`,
            filter: 'blur(8px)'
          }} />

          {[0.8, 1.0, 1.2].map((scale, i) => (
            <motion.div
              key={`ripple-${i}`}
              className="absolute w-48 h-12 rounded-[100%] blur-xl top-0 left-1/2 -translate-x-1/2"
              style={{ background: colors.waterRipple }}
              animate={{
                scale: [scale, scale * 1.5, scale],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ duration: 4 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
            />
          ))}

          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="w-full h-full"
              animate={{
                scaleX: [1, 1.01, 1],
                scaleY: [1, 0.98, 1]
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg
                viewBox="-150 -150 300 150"
                className="w-full h-full"
                style={{
                  filter: 'blur(1.5px)',
                  opacity: 0.75,
                  transform: 'scaleY(-1) translateY(-150px)'
                }}
              >
                <defs>
                  <linearGradient id="reflectionGradientOuter" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors.tip} stopOpacity="0.65" />
                    <stop offset="100%" stopColor={colors.base} stopOpacity="0.15" />
                  </linearGradient>
                  <linearGradient id="reflectionGradientInner" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors.tip} stopOpacity="0.55" />
                    <stop offset="100%" stopColor={colors.base} stopOpacity="0.1" />
                  </linearGradient>
                  <mask id="waterMask">
                    <rect x="-150" y="-150" width="300" height="150" fill="url(#waterFade)" />
                  </mask>
                  <linearGradient id="waterFade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="white" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="white" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="white" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <g mask="url(#waterMask)">
                  {outerPetals.map((angle, i) => (
                    <motion.g key={`reflect-outer-${i}`} transform={`rotate(${angle})`}>
                      <motion.path
                        d={createPetalPath()}
                        fill="url(#reflectionGradientOuter)"
                        stroke={colors.tip}
                        strokeWidth="0.3"
                        strokeOpacity="0.2"
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
                    <motion.g key={`reflect-inner-${i}`} transform={`rotate(${angle})`}>
                      <motion.path
                        d={createPetalPath()}
                        fill="url(#reflectionGradientInner)"
                        stroke={colors.tip}
                        strokeWidth="0.3"
                        strokeOpacity="0.15"
                        animate={{
                          scaleY: bloomFactor * 0.75,
                          scaleX: 0.6,
                          translateY: bloomFactor * -5
                        }}
                        transition={{ duration: 2.2, delay: 0.2 + (i * 0.1) }}
                      />
                    </motion.g>
                  ))}
                  <circle cx="0" cy="0" r={15 * bloomFactor} fill={colors.center} opacity="0.45" />
                </g>
              </svg>
            </motion.div>
          </div>
        </div>
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

        <div className="flex flex-col items-center gap-2">
          <div className="px-6 py-3 rounded-full bg-white/60 border border-slate-200 shadow-sm flex items-center gap-3">
            <span className="text-2xl">{season.icon}</span>
            <span className="text-lg font-serif text-slate-800 capitalize">
              {season.currentSeason}
            </span>
          </div>
          <p className="text-sm text-slate-600 italic max-w-md text-center px-4">
            {season.message}
          </p>
        </div>
      </div>
    </div>
  );
};
