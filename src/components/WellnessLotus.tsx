import React, { useRef, useEffect, useState } from 'react';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [isBuffered, setIsBuffered] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setVideoDuration(video.duration);
    };

    const handleCanPlayThrough = () => {
      setIsLoaded(true);
      setIsBuffered(true);
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const duration = video.duration;
        if (bufferedEnd >= duration * 0.95) {
          setIsBuffered(true);
        }
      }
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplaythrough', handleCanPlayThrough);
    video.addEventListener('progress', handleProgress);

    video.load();

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      video.removeEventListener('progress', handleProgress);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isLoaded || !isBuffered || videoDuration === 0) return;

    const targetTime = (health / 100) * videoDuration;
    const startTime = video.currentTime;
    const startTimestamp = performance.now();
    const duration = 3500;

    const easeInOutCubic = (t: number): number => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    };

    const smoothSeek = (currentTimestamp: number) => {
      const elapsed = currentTimestamp - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);

      video.currentTime = startTime + (targetTime - startTime) * easedProgress;

      if (progress < 1) {
        requestAnimationFrame(smoothSeek);
      }
    };

    requestAnimationFrame(smoothSeek);
  }, [health, isLoaded, isBuffered, videoDuration]);

  return (
    <div className="relative flex flex-col items-center justify-center py-8 min-h-screen">
      {/* Subtle header */}
      <motion.h2
        className="absolute top-8 left-1/2 -translate-x-1/2 text-sm font-serif text-slate-500 tracking-widest uppercase opacity-60"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 0.6, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {name}
      </motion.h2>

      {/* Ambient Glow Background - matches lotus colors */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <motion.div
          className="w-[800px] h-[800px] rounded-full blur-[120px] opacity-30"
          style={{
            background: `radial-gradient(circle,
              rgba(77, 208, 225, ${health / 200}) 0%,
              rgba(134, 239, 172, ${health / 250}) 25%,
              rgba(167, 243, 208, ${health / 300}) 50%,
              transparent 70%)`
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.4, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>

      {/* Main Lotus Container - MUCH BIGGER */}
      <div className="relative w-[700px] h-[580px] flex items-center justify-center mb-12">
        <motion.div
          className="relative w-full h-full flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: isBuffered ? 1 : 0.5, scale: 1 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <video
            ref={videoRef}
            src="/lotus-bloom.mp4"
            className="w-full h-full object-contain"
            muted
            playsInline
            preload="auto"
            style={{
              filter: 'drop-shadow(0 25px 50px rgba(77, 208, 225, 0.25)) drop-shadow(0 10px 30px rgba(134, 239, 172, 0.2))',
              opacity: isBuffered ? 1 : 0.3
            }}
          />

          {!isBuffered && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sage-50/50 to-sage-100/50 backdrop-blur-md rounded-3xl">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 border-4 border-sage-200 border-t-sage-500 rounded-full animate-spin"></div>
                <div className="text-sage-600 text-base font-light">
                  {!isLoaded ? 'Loading your sanctuary...' : 'Preparing...'}
                </div>
              </div>
            </div>
          )}

          {/* Glass Badge Score - Floating over lotus */}
          {isBuffered && (
            <motion.div
              className="absolute bottom-12 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full backdrop-blur-xl bg-white/20 border border-white/40 shadow-2xl z-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-serif font-light text-white drop-shadow-lg">
                  {health}
                </span>
                <span className="text-xs font-light text-white/80 uppercase tracking-wider">
                  Blossom
                </span>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Season Info - Integrated and Poetic */}
      <motion.div
        className="flex flex-col items-center gap-4 max-w-2xl px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        {/* Season Badge - More subtle */}
        <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/40 backdrop-blur-sm border border-white/60 shadow-sm">
          <span className="text-xl opacity-80">{season.icon}</span>
          <span className="text-base font-serif text-slate-700 capitalize tracking-wide">
            {season.currentSeason}
          </span>
        </div>

        {/* Season Message - Larger and more prominent */}
        <p className="text-lg font-serif text-slate-600 italic text-center leading-relaxed max-w-xl">
          {season.message}
        </p>
      </motion.div>
    </div>
  );
};
