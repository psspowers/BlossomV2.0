import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SeasonState } from '../lib/logic/seasons';

interface WellnessLotusProps {
  health: number;
  streak: number;
  season: SeasonState;
  mode: 'nurture' | 'steady' | 'thrive';
  name?: string;
}

export const WellnessLotus: React.FC<WellnessLotusProps> = ({
  health,
  season,
  name = 'Your Journey'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.preload = "auto";

    const handleMetadata = () => {
      setVideoDuration(video.duration);
    };

    const handleCanPlay = () => {
      if (video.readyState >= 3) {
        setIsReady(true);
      }
    };

    const handleError = () => {
      console.error("Video failed to load");
      setHasError(true);
    };

    video.addEventListener('loadedmetadata', handleMetadata);
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('canplaythrough', handleCanPlay);
    video.addEventListener('error', handleError);

    video.load();

    return () => {
      video.removeEventListener('loadedmetadata', handleMetadata);
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('canplaythrough', handleCanPlay);
      video.removeEventListener('error', handleError);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isReady || !videoDuration) return;

    const targetTime = Math.max(0.1, Math.min((health / 100) * videoDuration, videoDuration - 0.1));

    let animationFrameId: number;
    const startTimestamp = performance.now();
    const startPosition = video.currentTime;

    const duration = 2500;

    const animateScroll = (currentTimestamp: number) => {
      const elapsed = currentTimestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);

      const ease = 1 - Math.pow(1 - progress, 3);

      const nextTime = startPosition + (targetTime - startPosition) * ease;

      if (Number.isFinite(nextTime)) {
        video.currentTime = nextTime;
      }

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animateScroll);
      }
    };

    animationFrameId = requestAnimationFrame(animateScroll);

    return () => cancelAnimationFrame(animationFrameId);
  }, [health, isReady, videoDuration]);

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center py-20 min-h-[50vh]">
        <div className="w-64 h-64 rounded-full bg-rose-100 flex items-center justify-center">
          <span className="text-4xl">🌸</span>
        </div>
        <p className="mt-4 text-slate-500 font-serif">Sanctuary Mode (Offline)</p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center py-4 min-h-[55vh] overflow-hidden">

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        className="absolute top-4 left-0 w-full text-center text-xs font-sans font-medium text-slate-400 tracking-[0.2em] uppercase"
      >
        {name}
      </motion.h2>

      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[100px] -z-10 pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(circle, rgba(255,182,193,0.4) 0%, transparent 70%)' }}
      />

      <div className="relative w-[500px] h-[500px] md:w-[700px] md:h-[600px] flex items-center justify-center">

        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20">
            <motion.div
              animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-40 h-40 rounded-full bg-gradient-to-tr from-rose-200 to-sage-200 blur-2xl"
            />
            <p className="text-sage-600 font-serif italic text-sm animate-pulse tracking-wide">
              Entering sanctuary...
            </p>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isReady ? 1 : 0 }}
          transition={{ duration: 1.5 }}
          className="relative w-full h-full flex items-center justify-center"
        >
          <video
            ref={videoRef}
            src="/lotus-bloom.mp4"
            className="w-full h-full object-contain mix-blend-multiply"
            muted
            playsInline
            disablePictureInPicture
            style={{ filter: 'contrast(1.05) brightness(1.02)' }}
          />

          {isReady && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute bottom-[12%] z-20 flex flex-col items-center gap-4"
            >
              <div className="flex flex-col items-center justify-center w-16 h-16 bg-white/30 backdrop-blur-md border border-white/40 rounded-full shadow-lg">
                <span className="text-xl font-serif font-bold text-slate-700">{health}</span>
                <span className="text-[9px] uppercase tracking-widest text-slate-600 opacity-80">Score</span>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center gap-2 text-slate-500 text-sm font-medium uppercase tracking-widest mb-1">
                  <span className="text-lg">{season.icon}</span>
                  <span>Season of {season.currentSeason}</span>
                </div>
                <p className="font-serif italic text-slate-400 text-sm max-w-xs mx-auto leading-relaxed px-4">
                  {season.message}
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
