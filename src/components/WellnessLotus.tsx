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
    <div className="relative flex flex-col items-center justify-center py-4">
      <div className="relative w-80 flex items-center justify-center flex-col gap-0">

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

        <motion.svg
          viewBox="0 0 100 120"
          className="w-20 h-24 relative z-10"
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{
            filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1))'
          }}
        >
          <defs>
            <linearGradient id="stemGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7CB342" />
              <stop offset="50%" stopColor="#689F38" />
              <stop offset="100%" stopColor="#558B2F" />
            </linearGradient>
            <linearGradient id="stemReflectionGradient" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#558B2F" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#7CB342" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          <motion.path
            d="M 50 0 Q 45 30, 48 60 Q 50 90, 50 120"
            fill="none"
            stroke="url(#stemGradient)"
            strokeWidth="8"
            strokeLinecap="round"
            animate={{
              d: [
                "M 50 0 Q 45 30, 48 60 Q 50 90, 50 120",
                "M 50 0 Q 47 30, 52 60 Q 50 90, 50 120",
                "M 50 0 Q 45 30, 48 60 Q 50 90, 50 120"
              ]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.path
            d="M 50 0 Q 45 30, 48 60 Q 50 90, 50 120"
            fill="none"
            stroke="rgba(124, 179, 66, 0.3)"
            strokeWidth="10"
            strokeLinecap="round"
            style={{ filter: 'blur(3px)' }}
            animate={{
              d: [
                "M 50 0 Q 45 30, 48 60 Q 50 90, 50 120",
                "M 50 0 Q 47 30, 52 60 Q 50 90, 50 120",
                "M 50 0 Q 45 30, 48 60 Q 50 90, 50 120"
              ]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.svg>

        <div className="relative w-80 h-40 overflow-hidden">
          <div className="absolute inset-0 rounded-b-[100%]" style={{
            background: `linear-gradient(to bottom, transparent 0%, ${colors.waterBase}15 15%, ${colors.waterBase}40 50%, ${colors.waterBase}60 100%)`
          }} />

          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16 pointer-events-none" style={{
            background: `radial-gradient(circle at center, ${colors.waterRipple.replace('0.3)', '0.6)')}, ${colors.waterRipple.replace('0.3)', '0.3)')} 40%, transparent 70%)`,
            filter: 'blur(6px)'
          }} />

          {[1, 2, 3].map((ring, i) => (
            <motion.div
              key={`entry-ring-${i}`}
              className="absolute top-0 left-1/2 -translate-x-1/2 rounded-full border-2"
              style={{
                width: `${24 + i * 12}px`,
                height: `${24 + i * 12}px`,
                borderColor: colors.waterRipple.replace('0.3)', '0.4)'),
                marginLeft: '-12px',
                marginTop: '-12px'
              }}
              animate={{
                scale: [1, 1.8, 1],
                opacity: [0.6, 0, 0.6]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeOut",
                delay: i * 0.6
              }}
            />
          ))}

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

            <motion.svg
              viewBox="0 0 100 80"
              className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-16"
              style={{
                filter: 'blur(2px)',
                opacity: 0.5
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 1.5, delay: 0.5 }}
            >
              <motion.path
                d="M 50 0 Q 48 20, 50 40 Q 52 60, 50 80"
                fill="none"
                stroke="url(#stemReflectionGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                animate={{
                  d: [
                    "M 50 0 Q 48 20, 50 40 Q 52 60, 50 80",
                    "M 50 0 Q 52 20, 50 40 Q 48 60, 50 80",
                    "M 50 0 Q 48 20, 50 40 Q 52 60, 50 80"
                  ],
                  opacity: [0.5, 0.3, 0.5]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.svg>
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
