import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { SeasonState } from '../lib/logic/seasons';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from './ui/tooltip';
import { Info } from 'lucide-react';

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
  const [isReady, setIsReady] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const animationFrameRef = useRef<number>();

  // 1. INITIALIZATION
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.preload = "auto";
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

  // 2. THE "ALWAYS BLOOM" ENGINE
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isReady || !videoDuration) return;

    // 1. RESET TO START
    video.currentTime = 0.1;
    video.play();

    // 2. CALCULATE DESTINATION
    const targetTime = Math.max(0.1, (health / 100) * (videoDuration * 0.95));

    const checkProgress = () => {
      if (!video) return;
      const currentTime = video.currentTime;

      // 3. STOP AT TARGET
      if (currentTime >= targetTime) {
        video.pause();
        video.currentTime = targetTime;
        return;
      }

      // 4. DYNAMIC SPEED
      const diff = targetTime - currentTime;
      if (diff < 0.5) {
        video.playbackRate = 0.8;
      } else {
        video.playbackRate = 1.2;
      }

      animationFrameRef.current = requestAnimationFrame(checkProgress);
    };

    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    animationFrameRef.current = requestAnimationFrame(checkProgress);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [health, isReady, videoDuration]);

  return (
    <div className="relative flex flex-col items-center justify-center py-4 min-h-[55vh] overflow-hidden">

      {/* ATMOSPHERE */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[100px] -z-10 pointer-events-none opacity-40 transition-colors duration-1000"
        style={{ background: 'radial-gradient(circle, rgba(255,182,193,0.4) 0%, transparent 70%)' }}
      />

      {/* HEADER */}
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.85 }}
        className="absolute top-4 left-0 w-full text-center text-xs font-sans font-semibold text-slate-600 tracking-[0.2em] uppercase"
      >
        {name}
      </motion.h2>

      {/* MAIN CONTAINER */}
      <div className="relative w-[500px] h-[500px] md:w-[700px] md:h-[600px] flex items-center justify-center">

        {/* LOADING PULSE */}
        {!isReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20">
            <motion.div
              animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-40 h-40 rounded-full bg-gradient-to-tr from-rose-200 to-sage-200 blur-2xl"
            />
            <p className="text-sage-600 font-serif italic text-sm animate-pulse tracking-wide">
              Preparing bloom...
            </p>
          </div>
        )}

        {/* THE VIDEO */}
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
          />

          {/* Score Dewdrop - Floating on lotus */}
          {isReady && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="absolute bottom-[2%] z-20"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex flex-col items-center justify-center w-16 h-16 bg-white/30 backdrop-blur-md border border-white/40 rounded-full shadow-lg cursor-help">
                      <span className="text-xl font-serif font-bold text-slate-700">{health}</span>
                      <span className="text-[9px] uppercase tracking-widest text-slate-600 opacity-80">Score</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs bg-white border-slate-200 shadow-xl">
                    <p className="text-xs text-slate-700 leading-relaxed">
                      Your Healing Blossom Score is a personal progress companion, not a medical diagnosis. Use these insights to talk with your doctor.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* NARRATIVE BELOW LOTUS */}
      {isReady && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="mt-6 text-center"
        >
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm font-medium uppercase tracking-widest mb-2">
            <span className="text-lg">{season.icon}</span>
            <span>Season of {season.currentSeason}</span>
          </div>
          <p className="font-serif italic text-slate-600 text-base max-w-md mx-auto leading-relaxed px-4">
            {season.message}
          </p>
          <p className="text-xs text-slate-500 mt-3 font-medium tracking-wide">
            Your journey, seen and supported
          </p>
        </motion.div>
      )}
    </div>
  );
};
