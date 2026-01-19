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
      tip: '#E8AEB2', base: '#FFF0F5', center: '#D4AF37',
      stem: '#86A873',
      waterBase: '#C8D5B9', waterRipple: 'rgba(134, 168, 115, 0.3)', reflectionTint: 'rgba(134, 168, 115, 0.5)'
    };
    if (health >= 50) return {
      tip: '#E8AEB2', base: '#FFF5F7', center: '#E5C49C',
      stem: '#A0B68F',
      waterBase: '#D5DCC8', waterRipple: 'rgba(160, 182, 143, 0.25)', reflectionTint: 'rgba(160, 182, 143, 0.4)'
    };
    return {
      tip: '#D7CCC8', base: '#EFEBE9', center: '#A1887F',
      stem: '#8D6E63',
      waterBase: '#E5E0D8', waterRipple: 'rgba(141, 110, 99, 0.2)', reflectionTint: 'rgba(141, 110, 99, 0.3)'
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

  const createStemPath = () => {
    return `M 0,0 Q 5,-40 0,-120`;
  };

  const outerPetals = [0, 45, 90, 135, 180, 225, 270, 315];
  const innerPetals = [22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5];

  return (
    <div className="relative flex flex-col items-center justify-center py-12">
      <div className="relative w-80 h-80 flex items-center justify-center">

        <div className="absolute w-full h-1/2 bottom-0 rounded-b-full opacity-80"
             style={{ background: `linear-gradient(to bottom, transparent, ${colors.waterBase}90)` }} />

        {[0.8, 1.0, 1.2].map((scale, i) => (
          <motion.div
            key={`ripple-${i}`}
            className="absolute w-64 h-16 rounded-full blur-xl"
            style={{ background: colors.waterRipple, bottom: '0%' }}
            animate={{
              scale: [scale, scale * (1.3 * bloomFactor), scale],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 4 + i * 1.2, repeat: Infinity, ease: "easeOut", delay: i * 1 }}
          />
        ))}

        <motion.div
          className="absolute w-64 h-64 bottom-[-20%] overflow-hidden blur-[2px]"
          style={{ opacity: 0.5 * bloomFactor }}
        >
          <svg viewBox="-150 -150 300 300" className="w-full h-full" style={{ transform: 'scaleY(-1)' }}>
            <g fillOpacity="0.7" filter="url(#softGlow)" style={{ mixBlendMode: 'multiply' }}>

              <path
                d={createStemPath()}
                stroke={colors.stem}
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                opacity="0.8"
              />

              {outerPetals.map((angle, i) => (
                <path
                  key={`reflect-outer-${i}`}
                  d={createPetalPath(bloomFactor)}
                  fill={colors.tip}
                  transform={`rotate(${angle} 0 0)`}
                />
              ))}

              <circle cx="0" cy="0" r={15 * bloomFactor} fill={colors.center} />
            </g>
          </svg>
        </motion.div>

        <svg viewBox="-150 -150 300 300" className="w-full h-full drop-shadow-2xl relative z-10">
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
              <g key={`outer-${i}`} transform={`rotate(${angle} 0 0)`}>
                <motion.path
                  d={createPetalPath(bloomFactor)}
                  fill="url(#petalGradientOuter)"
                  stroke={colors.tip}
                  strokeWidth="1"
                  opacity="0.95"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.9, scale: 1 }}
                  style={{ transformOrigin: 'center' }}
                  transition={{ duration: 1.5, delay: i * 0.1, ease: "easeOut" }}
                />
              </g>
            ))}
            {innerPetals.map((angle, i) => (
              <g key={`inner-${i}`} transform={`rotate(${angle} 0 0)`}>
                <motion.path
                  d={createPetalPath(bloomFactor * 0.75)}
                  fill="url(#petalGradientInner)"
                  stroke={colors.tip}
                  strokeWidth="0.8"
                  opacity="0.9"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.95, scale: 1 }}
                  style={{ transformOrigin: 'center' }}
                  transition={{ duration: 1.5, delay: 0.4 + (i * 0.1), ease: "easeOut" }}
                />
              </g>
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
            style={{ transformOrigin: 'center' }}
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
                style={{ transformOrigin: 'center' }}
              />
            );
          })}
        </svg>
      </div>

      <div className="text-center space-y-3 relative z-10">
        <h2 className="text-2xl font-serif text-text-main italic tracking-wide">
          {name}
        </h2>
        <div className="flex items-center justify-center gap-3">
          <div className="px-4 py-2 rounded-full bg-paper/50 border border-sage-200 backdrop-blur-sm flex items-center gap-2 shadow-sm">
            <span className="text-sm text-sage-600">Season</span>
            <span className="text-text-main font-medium">
              {streak > 14 ? 'Blooming' : streak > 3 ? 'Growing' : 'Resting'}
            </span>
            <span className="text-lg">
              {streak > 14 ? '🌸' : streak > 3 ? '🌱' : '🍂'}
            </span>
          </div>
          <div className="px-4 py-2 rounded-full bg-paper/50 border border-sage-200 backdrop-blur-sm flex items-center gap-2 shadow-sm">
            <span className="text-sm text-sage-600">Score</span>
            <span className="text-text-main font-bold">{health}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
