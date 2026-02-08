import { motion } from 'framer-motion';

interface BloomLotusProps {
  progress: number;
}

const springTransition = { type: 'spring' as const, stiffness: 120, damping: 18 };

function petalPath(
  angle: number,
  length: number,
  width: number,
  cx: number,
  cy: number,
): string {
  const rad = (angle * Math.PI) / 180;
  const tipX = cx + Math.sin(rad) * length;
  const tipY = cy - Math.cos(rad) * length;
  const perpRad = rad + Math.PI / 2;
  const cpDist = width * 0.55;
  const cp1x = cx + Math.sin(rad) * length * 0.45 + Math.cos(perpRad) * cpDist;
  const cp1y = cy - Math.cos(rad) * length * 0.45 - Math.sin(perpRad) * cpDist;
  const cp2x = cx + Math.sin(rad) * length * 0.45 - Math.cos(perpRad) * cpDist;
  const cp2y = cy - Math.cos(rad) * length * 0.45 + Math.sin(perpRad) * cpDist;
  return `M ${cx} ${cy} Q ${cp1x} ${cp1y} ${tipX} ${tipY} Q ${cp2x} ${cp2y} ${cx} ${cy} Z`;
}

interface PetalConfig {
  angle: number;
  length: number;
  width: number;
  threshold: number;
  color: string;
}

const CENTER_PETALS: PetalConfig[] = [
  { angle: 0, length: 22, width: 10, threshold: 0, color: '#86a873' },
  { angle: -25, length: 18, width: 9, threshold: 0, color: '#93b57e' },
  { angle: 25, length: 18, width: 9, threshold: 0, color: '#93b57e' },
];

const INNER_PETALS: PetalConfig[] = [
  { angle: -45, length: 26, width: 11, threshold: 0.15, color: '#7da06a' },
  { angle: 45, length: 26, width: 11, threshold: 0.15, color: '#7da06a' },
  { angle: -15, length: 28, width: 10, threshold: 0.2, color: '#8ab477' },
  { angle: 15, length: 28, width: 10, threshold: 0.2, color: '#8ab477' },
];

const MIDDLE_PETALS: PetalConfig[] = [
  { angle: -65, length: 30, width: 12, threshold: 0.35, color: '#6b8f4e' },
  { angle: 65, length: 30, width: 12, threshold: 0.35, color: '#6b8f4e' },
  { angle: -35, length: 32, width: 11, threshold: 0.4, color: '#78a05c' },
  { angle: 35, length: 32, width: 11, threshold: 0.4, color: '#78a05c' },
  { angle: 0, length: 34, width: 10, threshold: 0.45, color: '#8ab477' },
];

const OUTER_PETALS: PetalConfig[] = [
  { angle: -80, length: 32, width: 13, threshold: 0.55, color: '#5d7d42' },
  { angle: 80, length: 32, width: 13, threshold: 0.55, color: '#5d7d42' },
  { angle: -55, length: 34, width: 12, threshold: 0.6, color: '#6b8f4e' },
  { angle: 55, length: 34, width: 12, threshold: 0.6, color: '#6b8f4e' },
  { angle: -25, length: 36, width: 11, threshold: 0.65, color: '#78a05c' },
  { angle: 25, length: 36, width: 11, threshold: 0.65, color: '#78a05c' },
  { angle: -95, length: 28, width: 12, threshold: 0.75, color: '#5d7d42' },
  { angle: 95, length: 28, width: 12, threshold: 0.75, color: '#5d7d42' },
];

const ALL_PETALS = [...OUTER_PETALS, ...MIDDLE_PETALS, ...INNER_PETALS, ...CENTER_PETALS];

const CX = 60;
const CY = 70;

export function BloomLotus({ progress }: BloomLotusProps) {
  const t = progress / 10;

  return (
    <div className="flex flex-col items-center">
      <motion.svg
        width="120"
        height="100"
        viewBox="0 0 120 100"
        fill="none"
        animate={{ scale: 0.85 + t * 0.15 }}
        transition={springTransition}
      >
        {ALL_PETALS.map((petal, i) => {
          const petalProgress = Math.max(0, Math.min(1, (t - petal.threshold) / (1 - petal.threshold)));
          const scale = 0.1 + petalProgress * 0.9;
          const opacity = petalProgress < 0.05 ? 0 : 0.3 + petalProgress * 0.7;
          const spreadAngle = petal.angle * (0.3 + petalProgress * 0.7);

          return (
            <motion.path
              key={i}
              d={petalPath(spreadAngle, petal.length * scale, petal.width * scale, CX, CY)}
              fill={petal.color}
              animate={{ opacity, d: petalPath(spreadAngle, petal.length * scale, petal.width * scale, CX, CY) }}
              transition={springTransition}
            />
          );
        })}

        <motion.circle
          cx={CX}
          cy={CY}
          r={4}
          fill="#c4a35a"
          animate={{ r: 3 + t * 2, opacity: 0.6 + t * 0.4 }}
          transition={springTransition}
        />
        {t > 0.5 && (
          <motion.circle
            cx={CX}
            cy={CY}
            r={2}
            fill="#d4b96a"
            initial={{ opacity: 0 }}
            animate={{ opacity: t > 0.5 ? 0.8 : 0 }}
            transition={springTransition}
          />
        )}

        <motion.path
          d={`M ${CX} ${CY + 2} Q ${CX - 2} ${CY + 15} ${CX} ${CY + 28}`}
          stroke="#6b8f4e"
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          animate={{ opacity: 0.5 + t * 0.5 }}
          transition={springTransition}
        />
      </motion.svg>

      <motion.p
        className="text-xs text-slate-400 italic mt-1 font-serif"
        animate={{ opacity: t > 0 ? 1 : 0.5 }}
      >
        {t === 0
          ? 'Select priorities to bloom'
          : t < 0.4
            ? 'Budding...'
            : t < 0.7
              ? 'Opening...'
              : t < 1
                ? 'Almost blooming!'
                : 'Full bloom!'}
      </motion.p>
    </div>
  );
}
