import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface BloomLotusProps {
  progress: number;
}

export function BloomLotus({ progress }: BloomLotusProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const animationFrameRef = useRef<number>();

  const health = (progress / 10) * 100;

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
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isReady || !videoDuration) return;

    video.currentTime = 0.1;
    video.play();

    const targetTime = Math.max(0.1, (health / 100) * (videoDuration * 0.95));

    const checkProgress = () => {
      if (!video) return;

      if (video.currentTime >= targetTime) {
        video.pause();
        video.currentTime = targetTime;
        return;
      }

      const diff = targetTime - video.currentTime;
      video.playbackRate = diff < 0.5 ? 0.8 : 1.2;

      animationFrameRef.current = requestAnimationFrame(checkProgress);
    };

    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(checkProgress);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [health, isReady, videoDuration]);

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
      <div className="relative w-[180px] h-[140px] flex items-center justify-center">
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
