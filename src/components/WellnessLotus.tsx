import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../lib/themes/ThemeContext';

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
  const { designTheme } = useTheme();

  const getBloomState = () => {
    if (health >= 75) {
      return {
        state: 'bloomed',
        petalScale: 1,
        petalRotation: 0,
        centerScale: 1,
        opacity: 1,
        colors: {
          outerPetal: ['#FF69B4', '#FF1493'],
          middlePetal: ['#FFB6C1', '#FF69B4'],
          innerPetal: ['#FFC0CB', '#FFB6C1'],
          center: ['#FFD700', '#FFA500'],
          glow: '#FF69B4',
          water: '#4DD0E1'
        }
      };
    } else if (health >= 40) {
      return {
        state: 'partial',
        petalScale: 0.85,
        petalRotation: 10,
        centerScale: 0.9,
        opacity: 0.85,
        colors: {
          outerPetal: ['#DDA0A0', '#C9A0A0'],
          middlePetal: ['#E8B4B8', '#DDA0A0'],
          innerPetal: ['#F5D5D8', '#E8B4B8'],
          center: ['#E8C872', '#D4A574'],
          glow: '#DDA0A0',
          water: '#80DEEA'
        }
      };
    } else {
      return {
        state: 'wilted',
        petalScale: 0.7,
        petalRotation: 25,
        centerScale: 0.75,
        opacity: 0.7,
        colors: {
          outerPetal: ['#A0826D', '#8B7355'],
          middlePetal: ['#B8988C', '#A0826D'],
          innerPetal: ['#D3C5B0', '#B8988C'],
          center: ['#BFA780', '#A89968'],
          glow: '#8B7355',
          water: '#B0BEC5'
        }
      };
    }
  };

  const bloomState = getBloomState();
  const { colors, petalScale, petalRotation, centerScale, opacity } = bloomState;

  return (
    <div className="relative z-10 flex flex-col items-center gap-8">
      <div className="relative flex items-center justify-center w-80 h-80">

        {/* Water Ripples Base */}
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.25, 0.1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-56 h-16 rounded-full blur-xl"
          style={{
            backgroundColor: colors.water,
            bottom: '20%'
          }}
        />

        {/* Glow Effect */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-48 h-48 rounded-full blur-3xl"
          style={{ backgroundColor: colors.glow }}
        />

        {/* Lotus SVG Container */}
        <motion.svg
          viewBox="0 0 200 200"
          className="w-64 h-64 relative z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: opacity, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <defs>
            {/* Gradients for each petal layer */}
            <radialGradient id="outerPetalGrad" cx="50%" cy="30%">
              <stop offset="0%" stopColor={colors.outerPetal[0]} />
              <stop offset="100%" stopColor={colors.outerPetal[1]} />
            </radialGradient>
            <radialGradient id="middlePetalGrad" cx="50%" cy="30%">
              <stop offset="0%" stopColor={colors.middlePetal[0]} />
              <stop offset="100%" stopColor={colors.middlePetal[1]} />
            </radialGradient>
            <radialGradient id="innerPetalGrad" cx="50%" cy="30%">
              <stop offset="0%" stopColor={colors.innerPetal[0]} />
              <stop offset="100%" stopColor={colors.innerPetal[1]} />
            </radialGradient>
            <radialGradient id="centerGrad" cx="50%" cy="50%">
              <stop offset="0%" stopColor={colors.center[0]} />
              <stop offset="70%" stopColor={colors.center[1]} />
            </radialGradient>

            {/* Shadow filter */}
            <filter id="petalShadow">
              <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
              <feOffset dx="0" dy="2" result="offsetblur"/>
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3"/>
              </feComponentTransfer>
              <feMerge>
                <feMergeNode/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Outer Petals (8 petals) */}
          {[...Array(8)].map((_, i) => {
            const angle = (i * 45) - 90;
            return (
              <motion.g
                key={`outer-${i}`}
                animate={{
                  rotate: [0, 2, -2, 0],
                  scale: [petalScale, petalScale * 1.02, petalScale]
                }}
                transition={{
                  duration: 4 + i * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.2
                }}
                style={{ transformOrigin: '100px 100px' }}
              >
                <motion.ellipse
                  cx="100"
                  cy="45"
                  rx="18"
                  ry="38"
                  fill="url(#outerPetalGrad)"
                  filter="url(#petalShadow)"
                  initial={{ rotate: angle + petalRotation }}
                  animate={{ rotate: angle + petalRotation }}
                  style={{ transformOrigin: '100px 100px' }}
                  opacity={0.95}
                />
              </motion.g>
            );
          })}

          {/* Middle Petals (8 petals, offset) */}
          {[...Array(8)].map((_, i) => {
            const angle = (i * 45) - 67.5;
            return (
              <motion.g
                key={`middle-${i}`}
                animate={{
                  rotate: [0, -2, 2, 0],
                  scale: [petalScale * 0.85, petalScale * 0.87, petalScale * 0.85]
                }}
                transition={{
                  duration: 3.5 + i * 0.25,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.15
                }}
                style={{ transformOrigin: '100px 100px' }}
              >
                <motion.ellipse
                  cx="100"
                  cy="60"
                  rx="15"
                  ry="32"
                  fill="url(#middlePetalGrad)"
                  filter="url(#petalShadow)"
                  initial={{ rotate: angle + petalRotation * 0.5 }}
                  animate={{ rotate: angle + petalRotation * 0.5 }}
                  style={{ transformOrigin: '100px 100px' }}
                  opacity={0.9}
                />
              </motion.g>
            );
          })}

          {/* Inner Petals (6 petals) */}
          {[...Array(6)].map((_, i) => {
            const angle = (i * 60) - 90;
            return (
              <motion.g
                key={`inner-${i}`}
                animate={{
                  rotate: [0, 1.5, -1.5, 0],
                  scale: [petalScale * 0.7, petalScale * 0.72, petalScale * 0.7]
                }}
                transition={{
                  duration: 3 + i * 0.2,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.1
                }}
                style={{ transformOrigin: '100px 100px' }}
              >
                <motion.ellipse
                  cx="100"
                  cy="75"
                  rx="12"
                  ry="25"
                  fill="url(#innerPetalGrad)"
                  filter="url(#petalShadow)"
                  initial={{ rotate: angle }}
                  animate={{ rotate: angle }}
                  style={{ transformOrigin: '100px 100px' }}
                  opacity={0.85}
                />
              </motion.g>
            );
          })}

          {/* Center of Lotus */}
          <motion.g
            animate={{
              scale: [centerScale, centerScale * 1.05, centerScale]
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ transformOrigin: '100px 100px' }}
          >
            <circle
              cx="100"
              cy="100"
              r="20"
              fill="url(#centerGrad)"
              filter="url(#petalShadow)"
            />

            {/* Center Details - Seed pods */}
            {[...Array(12)].map((_, i) => {
              const angle = (i * 30) * (Math.PI / 180);
              const radius = 8;
              const x = 100 + radius * Math.cos(angle);
              const y = 100 + radius * Math.sin(angle);

              return (
                <motion.circle
                  key={`seed-${i}`}
                  cx={x}
                  cy={y}
                  r="2"
                  fill={colors.center[1]}
                  opacity={0.6}
                  animate={{
                    scale: [1, 1.2, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.1
                  }}
                  style={{ transformOrigin: `${x}px ${y}px` }}
                />
              );
            })}
          </motion.g>
        </motion.svg>

        {/* Streak Sparkles */}
        {streak > 0 && (
          <>
            {[...Array(Math.min(streak, 8))].map((_, i) => {
              const angle = (i * 45) * (Math.PI / 180);
              const radius = 45;

              return (
                <motion.div
                  key={`sparkle-${i}`}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    left: `calc(50% + ${radius * Math.cos(angle)}%)`,
                    top: `calc(50% + ${radius * Math.sin(angle)}%)`,
                    backgroundColor: colors.center[0],
                    boxShadow: `0 0 10px ${colors.center[0]}`
                  }}
                  animate={{
                    opacity: [0.3, 0.9, 0.3],
                    scale: [0.8, 1.2, 0.8]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.25,
                    ease: "easeInOut"
                  }}
                />
              );
            })}
          </>
        )}
      </div>

      {/* Info Display */}
      <div className="text-center space-y-3">
        <motion.h2
          className="text-2xl font-light text-white/90 tracking-wide"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {name}
        </motion.h2>

        <motion.p
          className="text-sm text-white/60 italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {health >= 75 && "Blooming beautifully"}
          {health >= 40 && health < 75 && "Growing with grace"}
          {health < 40 && "Nurturing your roots"}
        </motion.p>

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
            <div
              className="absolute inset-0 rounded-2xl blur-xl group-hover:blur-2xl transition-all"
              style={{
                background: `linear-gradient(135deg, ${colors.glow}30, ${colors.center[0]}30)`
              }}
            />
            <div className="relative flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-lg">
              <span className="text-sm text-white/60 font-light">Wellness</span>
              <span className="text-xl font-semibold text-white/95">{health}%</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
