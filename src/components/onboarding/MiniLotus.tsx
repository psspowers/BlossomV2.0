import { motion } from 'framer-motion';

interface MiniLotusProps {
  progress: number;
}

export function MiniLotus({ progress }: MiniLotusProps) {
  const scale = 0.5 + (progress / 20);
  const opacity = 0.3 + (progress / 14);

  return (
    <motion.svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      animate={{ scale, opacity, rotate: progress * 5 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className="text-terracotta-400"
    >
      <path
        d="M12 2C12 2 14 6 14 10C14 14 12 17 12 17C12 17 10 14 10 10C10 6 12 2 12 2Z"
        fill="currentColor"
      />
      <path
        d="M12 17C12 17 15 16 18 12C21 8 19 4 19 4C19 4 17 7 15 10C13 13 12 17 12 17Z"
        fill="currentColor"
        opacity="0.8"
      />
      <path
        d="M12 17C12 17 9 16 6 12C3 8 5 4 5 4C5 4 7 7 9 10C11 13 12 17 12 17Z"
        fill="currentColor"
        opacity="0.8"
      />
    </motion.svg>
  );
}
