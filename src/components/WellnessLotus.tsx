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
    <div className="relative flex flex-col items-center justify-center py-4">
      <div className="relative w-80 h-64 flex items-center justify-center">
        <motion.div
          className="relative w-full h-full flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: isBuffered ? 1 : 0.5, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <video
            ref={videoRef}
            src="/lotus-bloom.mp4"
            className="w-full h-full object-contain drop-shadow-2xl"
            muted
            playsInline
            preload="auto"
            style={{
              filter: 'drop-shadow(0 15px 25px rgba(77, 208, 225, 0.3))',
              opacity: isBuffered ? 1 : 0.3
            }}
          />

          {!isBuffered && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-sage-50 to-sage-100 rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 border-4 border-sage-200 border-t-sage-500 rounded-full animate-spin"></div>
                <div className="text-sage-600 text-sm">
                  {!isLoaded ? 'Loading lotus...' : 'Buffering...'}
                </div>
              </div>
            </div>
          )}
        </motion.div>
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
