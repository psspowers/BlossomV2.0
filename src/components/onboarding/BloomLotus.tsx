import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface BloomLotusProps {
  progress: number;
}

export function BloomLotus({ progress }: BloomLotusProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.preload = 'auto';
    video.pause();

    const handleMetadata = () => {
      setVideoDuration(video.duration);
      video.currentTime = 0;
    };

    const handleCanPlay = () => {
      if (video.readyState >= 3) setIsReady(true);
    };

    video.addEventListener('loadedmetadata', handleMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.load();

    return () => {
      video.removeEventListener('loadedmetadata', handleMetadata);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isReady || !videoDuration) return;

    const targetTime = (progress / 10) * (videoDuration * 0.95);
    video.currentTime = Math.max(0, targetTime);
  }, [progress, isReady, videoDuration]);

  const t = progress / 10;
  const label =
    t === 0
      ? 'Select priorities to bloom'
      : t < 0.4
        ? 'Budding...'
        : t < 0.7
          ? 'Opening...'
          : t < 1
            ? 'Almost blooming!'
            : 'Full bloom!';

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[240px] h-[180px] flex items-center justify-center">
        {!isReady && (
          <motion.div
            animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-200 to-sage-200 blur-xl"
          />
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isReady ? 1 : 0 }}
          transition={{ duration: 1 }}
          className="w-full h-full flex items-center justify-center"
        >
          <video
            ref={videoRef}
            src="/lotus-bloom.mp4"
            className="w-full h-full object-contain mix-blend-multiply"
            muted
            playsInline
            disablePictureInPicture
          />
        </motion.div>
      </div>

      <motion.p
        className="text-[11px] text-slate-400 italic font-serif -mt-1"
        animate={{ opacity: t > 0 ? 1 : 0.5 }}
      >
        {label}
      </motion.p>
    </div>
  );
}
